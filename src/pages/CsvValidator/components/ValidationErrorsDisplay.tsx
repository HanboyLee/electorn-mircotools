import React from 'react';
import { Alert } from 'antd';
import { ValidationErrorsDisplayProps } from '../types';

/**
 * 驗證錯誤顯示組件
 * 將驗證錯誤按類型分組並顯示
 */
export const ValidationErrorsDisplay: React.FC<ValidationErrorsDisplayProps> = ({ errors }) => {
  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <div>
      {errors.map((error, index) => (
        <Alert
          key={index}
          message={error.message}
          type="error"
          showIcon
          style={{ marginBottom: '8px' }}
        />
      ))}
    </div>
  );
};
