import { useState, useEffect } from 'react';
import { NetworkStatus } from '@/services/networkService';
import { IPC } from '@/constants/ipc';

export const useNetwork = () => {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: false,
    responseTime: null,
    timestamp: Date.now(),
    checking: true,
  });

  useEffect(() => {
    const handleStatusUpdate = (event: any, newStatus: NetworkStatus) => {
      //測試連線
      // console.log('Network status updated:', newStatus);
      setStatus(newStatus);
    };

    // 訂閱網絡狀態更新
    window.electron.on(IPC.NETWORK_STATUS_UPDATE, handleStatusUpdate);

    // 啟動自動檢查
    startAutoCheck();

    return () => {
      window.electron.removeListener(IPC.NETWORK_STATUS_UPDATE, handleStatusUpdate);
      stopAutoCheck();
    };
  }, []);

  const checkConnection = async () => {
    try {
      const status = await window.electronAPI[IPC.CHECK_CONNECTION]();
      setStatus(status);
      return status;
    } catch (error) {
      console.error('網絡狀態檢查失敗:', error);
      throw error;
    }
  };

  const startAutoCheck = async () => {
    try {
      await window.electronAPI[IPC.START_AUTO_CHECK]();
    } catch (error) {
      console.error('啟動自動檢查失敗:', error);
      throw error;
    }
  };

  const stopAutoCheck = async () => {
    try {
      await window.electronAPI[IPC.STOP_AUTO_CHECK]();
    } catch (error) {
      console.error('停止自動檢查失敗:', error);
      throw error;
    }
  };

  return {
    status,
    checkConnection,
    startAutoCheck,
    stopAutoCheck,
  };
};
