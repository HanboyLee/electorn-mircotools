import React, { useState } from 'react';
import { Upload, List, Modal, message, Progress } from 'antd';
import { PictureOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { ImageUploadProps, ImageFileStatus } from '../types';
import type { RcFile } from 'antd/es/upload';

const { Dragger } = Upload;

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
const MAX_FILE_COUNT = 100; // 設置最大文件數量

/**
 * 圖片上傳組件
 * 處理圖片文件的上傳、預覽和驗證
 */
export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  selectedImages,
  csvFilenames = [],
  onRemove,
  onPreview,
  maxCount = MAX_FILE_COUNT,
  uploadProgress = 0
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  // 驗證文件
  const validateFile = (file: RcFile): { valid: boolean; message?: string } => {
    // 檢查文件數量限制
    if (selectedImages.length >= maxCount) {
      return {
        valid: false,
        message: `已達到最大文件數量限制 (${maxCount})`
      };
    }

    // 檢查文件類型
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        message: `${file.name} 不是支持的圖片格式，僅支持 JPG 和 PNG`
      };
    }

    // 檢查文件是否已存在
    if (selectedImages.some(img => img.name === file.name)) {
      return {
        valid: false,
        message: `${file.name} 已經存在`
      };
    }

    // 如果已有CSV文件，檢查文件名是否匹配
    if (csvFilenames.length > 0 && !csvFilenames.includes(file.name)) {
      return {
        valid: false,
        message: `${file.name} 與CSV文件中的文件名不匹配`
      };
    }

    return { valid: true };
  };

  // 處理文件上傳前的驗證
  const handleBeforeUpload = (file: RcFile): boolean => {
    const validation = validateFile(file);
    if (!validation.valid) {
      message.error(validation.message);
      return false;
    }

    onImageUpload(file);
    return false;
  };

  // 處理圖片預覽
  const handlePreview = async (file: File) => {
    if (onPreview) {
      onPreview(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result as string);
      setPreviewTitle(file.name);
      setPreviewOpen(true);
    };
    reader.readAsDataURL(file);
  };

  // 處理文件刪除
  const handleRemove = (file: File) => {
    if (onRemove) {
      onRemove(file);
    } else {
      onImageUpload(file, true);
    }
  };

  // 獲取文件狀態
  const getFileStatus = (filename: string): ImageFileStatus => {
    if (csvFilenames.length === 0) {
      return { 
        status: 'warning',
        message: '等待CSV文件上傳以驗證文件名'
      };
    }
    
    return csvFilenames.includes(filename)
      ? { 
          status: 'success',
          message: '文件名匹配成功',
          progress: uploadProgress
        }
      : { 
          status: 'error',
          message: '文件名在CSV中未找到'
        };
  };

  return (
    <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
      <Dragger
        accept=".jpg,.jpeg,.png"
        multiple
        beforeUpload={handleBeforeUpload}
        showUploadList={false}
        style={{ marginBottom: '20px' }}
      >
        <p className="ant-upload-drag-icon">
          <PictureOutlined />
        </p>
        <p className="ant-upload-text">點擊或拖拽圖片到此區域上傳</p>
        <p className="ant-upload-hint">
          支持 JPG、PNG 格式圖片，可同時上傳多個文件
        </p>
      </Dragger>

      <List
        itemLayout="horizontal"
        dataSource={selectedImages}
        renderItem={file => {
          const status = getFileStatus(file.name);
          return (
            <List.Item
              className="image-list-item"
              style={{ 
                padding: '8px 16px',
                transition: 'background-color 0.3s'
              }}
              actions={[
                <EyeOutlined
                  key="preview"
                  onClick={() => handlePreview(file)}
                  style={{ fontSize: '18px' }}
                />,
                <DeleteOutlined
                  key="delete"
                  onClick={() => handleRemove(file)}
                  style={{ fontSize: '18px', color: '#ff4d4f' }}
                />
              ]}
            >
              <List.Item.Meta
                avatar={<PictureOutlined style={{ fontSize: '24px' }} />}
                title={file.name}
                description={status.message}
              />
              {status.status === 'success' && status.progress !== undefined && (
                <Progress percent={status.progress} size="small" />
              )}
            </List.Item>
          );
        }}
      />

      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <img alt="preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </div>
  );
};
