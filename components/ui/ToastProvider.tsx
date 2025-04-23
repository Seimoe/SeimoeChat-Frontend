'use client'
import { Toaster } from 'sonner';

export const ToastProvider = () => {
  return (
    <Toaster 
      position="bottom-center" 
      richColors 
      closeButton
      toastOptions={{
        duration: 4000,
        style: { 
          background: 'white',
          color: '#333',
          border: '1px solid rgba(0,0,0,0.1)',
          borderRadius: '12px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          marginBottom: '100px',
        },
      }}
    />
  );
};

export default ToastProvider; 