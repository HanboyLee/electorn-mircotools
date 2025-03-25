import React from 'react';
import { Card, Divider, Progress, Typography } from 'antd';
import { Folder, FileText, Settings, Home, File, History, Eye, CheckCircle } from 'lucide-react';

const { Title, Text } = Typography;

const FilePackagingUI = () => {
  // 模擬的文件組數據
  const fileGroups = [
    {
      name: 'design_document',
      count: 3,
      files: [
        { name: 'design_document.docx', size: '256 KB', type: 'Word' },
        { name: 'design_document.pdf', size: '420 KB', type: 'PDF' },
        { name: 'design_document.txt', size: '45 KB', type: 'Text' }
      ]
    },
    {
      name: 'project_logo',
      count: 4,
      files: [
        { name: 'project_logo.png', size: '156 KB', type: 'PNG' },
        { name: 'project_logo.jpg', size: '128 KB', type: 'JPEG' },
        { name: 'project_logo.svg', size: '24 KB', type: 'SVG' },
        { name: 'project_logo.psd', size: '1.2 MB', type: 'PSD' }
      ]
    }
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* 側邊欄 */}
      <div className="w-48 bg-gray-800 text-white h-full">
        <div className="p-4 font-bold text-xl border-b border-gray-700">Metadata App</div>
        <div className="py-2">
          <div className="px-4 py-2 hover:bg-gray-700 flex items-center">
            <Home className="mr-2" size={16} />
            <span>首頁</span>
          </div>
          <div className="px-4 py-2 bg-gray-700 flex items-center">
            <FileText className="mr-2" size={16} />
            <span>文件打包</span>
          </div>
          <div className="px-4 py-2 hover:bg-gray-700 flex items-center">
            <History className="mr-2" size={16} />
            <span>打包歷史</span>
          </div>
          <div className="px-4 py-2 hover:bg-gray-700 flex items-center">
            <Settings className="mr-2" size={16} />
            <span>設置</span>
          </div>
        </div>
      </div>
      
      {/* 主內容區 */}
      <div className="flex-1 overflow-y-auto bg-gray-100">
        {/* 頂部標題欄 - 無框窗口拖動區域 */}
        <div className="h-8 bg-gray-800 flex items-center justify-between px-4">
          <div className="text-white text-sm">文件打包</div>
          <div className="flex">
            <button className="text-white px-2">-</button>
            <button className="text-white px-2">□</button>
            <button className="text-white px-2">×</button>
          </div>
        </div>
        
        {/* 內容區 */}
        <div className="p-6">
          <Card className="mb-6">
            <div className="flex items-center mb-4">
              <Title level={4} className="m-0">文件夾選擇</Title>
            </div>
            <div className="flex items-center">
              <input 
                type="text" 
                placeholder="選擇要掃描的文件夾路徑..." 
                className="flex-1 border border-gray-300 rounded-l px-3 py-2"
                value="/Users/douzi/Documents/Project Files" 
                readOnly
              />
              <button className="bg-blue-500 text-white px-4 py-2 rounded-r flex items-center">
                <Folder size={16} className="mr-2" />
                瀏覽
              </button>
              <button className="bg-green-500 text-white px-4 py-2 rounded ml-2 flex items-center">
                掃描文件夾
              </button>
            </div>
          </Card>
          
          <Card className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <Title level={4} className="m-0">掃描結果：同名文件組</Title>
              <div>
                <button className="bg-blue-500 text-white px-3 py-1 rounded mr-2">全選</button>
                <button className="bg-green-500 text-white px-3 py-1 rounded">打包所選</button>
              </div>
            </div>
            
            <div className="border rounded overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">選擇</th>
                    <th className="p-2 text-left">文件組名稱</th>
                    <th className="p-2 text-left">文件數量</th>
                    <th className="p-2 text-left">文件類型</th>
                    <th className="p-2 text-left">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {fileGroups.map((group, index) => (
                    <tr key={index} className="border-t border-gray-200">
                      <td className="p-2">
                        <input type="checkbox" className="h-4 w-4" />
                      </td>
                      <td className="p-2 font-medium">{group.name}</td>
                      <td className="p-2">{group.count} 個文件</td>
                      <td className="p-2">
                        {group.files.map((file, i) => (
                          <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1">
                            {file.type}
                          </span>
                        ))}
                      </td>
                      <td className="p-2">
                        <button className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-1 text-sm flex items-center inline-flex">
                          <Eye size={14} className="mr-1" />
                          預覽
                        </button>
                        <button className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm flex items-center inline-flex">
                          <FileText size={14} className="mr-1" />
                          打包
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center mb-4">
              <Title level={4} className="m-0">文件預覽</Title>
              <span className="ml-2 text-gray-500">project_logo</span>
            </div>
            
            <div className="border rounded p-4">
              <div className="grid grid-cols-2 gap-4">
                {fileGroups[1].files.map((file, index) => (
                  <div key={index} className="border rounded p-3 flex items-center">
                    <File size={32} className="text-gray-400 mr-3" />
                    <div>
                      <div className="font-medium">{file.name}</div>
                      <div className="text-sm text-gray-500">
                        {file.size} · {file.type}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <Divider />
            
            <div className="mt-4">
              <div className="mb-2 flex justify-between">
                <span>打包進度</span>
                <span>75%</span>
              </div>
              <Progress percent={75} />
              
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded flex items-center">
                <CheckCircle size={20} className="text-green-500 mr-2" />
                <span>打包完成！文件保存至：/Users/douzi/Documents/Project Files/project_logo.zip</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FilePackagingUI;
