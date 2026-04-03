'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import AlertModal from '@/components/ui/AlertModal';

interface AlertOptions {
  title?: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  confirmText?: string;
  cancelText?: string;
}

interface ConfirmOptions extends AlertOptions {
  onConfirm: () => void;
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
  showConfirm: (options: ConfirmOptions) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title?: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    confirmText: string;
    cancelText: string;
    onConfirm?: () => void;
    showCancel: boolean;
  }>({
    message: '',
    type: 'info',
    confirmText: 'OK',
    cancelText: 'Cancel',
    showCancel: false,
  });

  const showAlert = useCallback((options: AlertOptions) => {
    setModalConfig({
      title: options.title,
      message: options.message,
      type: options.type || 'info',
      confirmText: options.confirmText || 'OK',
      cancelText: options.cancelText || 'Cancel',
      showCancel: false,
    });
    setIsOpen(true);
  }, []);

  const showConfirm = useCallback((options: ConfirmOptions) => {
    setModalConfig({
      title: options.title,
      message: options.message,
      type: options.type || 'warning',
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel',
      onConfirm: options.onConfirm,
      showCancel: true,
    });
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <AlertModal
        isOpen={isOpen}
        onClose={handleClose}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        onConfirm={modalConfig.onConfirm}
        showCancel={modalConfig.showCancel}
      />
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
}
