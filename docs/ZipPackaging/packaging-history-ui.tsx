import React from 'react';
import { Card, Typography, DatePicker, Select, Input } from 'antd';
import { Home, FileText, Settings, History, ExternalLink, Info, Trash2 } from 'lucide-react';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;

const PackagingHistoryUI = () => {
  // 模擬的歷史數據
  const historyRecords = [
    {
      id: '1',
      date: '2025-03-22 14:32:45',
      name: 'design_document.zip',
      outputPath: '/Users/douzi/Documents/Project Files/design_document.zip',
      fileCount: 3,
      sourceDirectory: '/Users/douzi/Documents/Project Files',
      originalFiles: ['design_document.docx', 'design_document.pdf', 'design_document.txt']
    },
    {
      id: '2',
      date: '2025-03-22 10:15:32',
      name: 'project_logo.zip',
      outputPath: '/Users/douzi/Documents/Project Files/project_logo.zip',
      fileCount: 4,
      sourceDirectory: '/Users/douzi/Documents/Project Files',
      originalFiles: ['project_logo.png', 'project_logo.jpg', 'project_logo.svg', 'project_logo.psd']
    },
    {
      id: '3',
      date: '2025-03-21 16:42:18',
      name: 'presentation.zip',
      outputPath: '/Users/douzi/Documents/Presentations/presentation.zip',
      fileCount: 2,
      sourceDirectory: '/Users/douzi/Documents/Presentations',
      originalFiles: ['presentation.pptx', 'presentation.pdf']
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
          <div className="px-4 py-2 hover:bg-gray-700 flex items-center">
            <FileText className="mr-2" size={16} />
            <span>文件打包</span>
          </div>
          <div className="px-4 py-2 bg-gray-700 flex items-center">
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
          <div className="text-white text-sm">打包歷史</div>
          <div className="flex">
            <button className="text-white px-2">-</button>
            <button className="text-white px-2">□</button>
            <button className="text-white px-2">×</button>
          </div>
        </div>
        
        {/* 內容區 */}
        <div className="p-6">
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <Title level={4} className="m-0">打包歷史記錄</Title>
              <button className="bg-red-100 text-red-800 px-3 py-1 rounded flex items-center">
                <Trash2 size={16} className="mr-1" />
                清空歷史
              </button>
            </div>
            
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex-1 min-w-64">
                <div className="mb-1 text-sm">日期範圍</div>
                <RangePicker className="w-full" />
              </div>
              
              <div className="w-48">
                <div className="mb-1 text-sm">排序方式</div>
                <Select defaultValue="date-desc" className="w-full">
                  <Option value="date-desc">日期 (最新優先)</Option>
                  <Option value="date-asc">日期 (最舊優先)</Option>
                  <Option value="name-asc">名稱 (A-Z)</Option>
                  <Option value="name-desc">名稱 (Z-A)</Option>
                </Select>
              </div>
              
              <div className="flex-1 min-w-64">
                <div className="mb-1 text-sm">搜尋</div>
                <Search placeholder="搜尋文件名稱或路徑..." />
              </div>
            </div>
            
            <div className="border rounded overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">日期</th>
                    <th className="p-2 text-left">壓縮包名稱</th>
                    <th className="p-2 text-left">文件數</th>
                    <th className="p-2 text-left">來源目錄</th>
                    <th className="p-2 text-left">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {historyRecords.map((record) => (
                    <tr key={record.id} className="border-t border-gray-200">
                      <td className="p-2">{record.date}</td>
                      <td className="p-2 font-medium">{record.name}</td>
                      <td className="p-2">{record.fileCount} 個文件</td>
                      <td className="p-2 truncate max-w-xs" title={record.sourceDirectory}>
                        {record.sourceDirectory}
                      </td>
                      <td className="p-2">
                        <button className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-1 text-sm flex items-center inline-flex">
                          <ExternalLink size={14} className="mr-1" />
                          打開位置
                        </button>
                        <button className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm flex items-center inline-flex">
                          <Info size={14} className="mr-1" />
                          查看詳情
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
              <Title level={4} className="m-0">打包詳情</Title>
              <span className="ml-2 text-gray-500">project_logo.zip</span>
            </div>
            
            <div className="mb-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="border rounded p-3">
                  <div className="text-sm text-gray-500">壓縮包路徑</div>
                  <div className="mt-1 font-medium truncate" title={historyRecords[1].outputPath}>
                    {historyRecords[1].outputPath}
                  </div>
                </div>
                
                <div className="border rounded p-3">
                  <div className="text-sm text-gray-500">打包時間</div>
                  <div className="mt-1 font-medium">
                    {historyRecords[1].date}
                  </div>
                </div>
                
                <div className="border rounded p-3">
                  <div className="text-sm text-gray-500">源目錄</div>
                  <div className="mt-1 font-medium truncate" title={historyRecords[1].sourceDirectory}>
                    {historyRecords[1].sourceDirectory}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border rounded p-4">
              <div className="mb-2 font-medium">包含文件</div>
              <div className="grid grid-cols-2 gap-4">
                {historyRecords[1].originalFiles.map((file, index) => (
                  <div key={index} className="border rounded p-3 flex items-center">
                    <FileText size={20} className="text-gray-400 mr-2" />
                    <div className="font-medium">{file}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PackagingHistoryUI;
