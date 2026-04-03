'use client';

import React from 'react';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  showCancel?: boolean;
}

export default function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  showCancel = false,
}: AlertModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const typeColors = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700',
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      button: 'bg-green-600 hover:bg-green-700',
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: 'text-amber-600',
      button: 'bg-amber-600 hover:bg-amber-700',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700',
    },
  };

  const colors = typeColors[type];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div className={`border-b ${colors.border} ${colors.bg} px-6 py-4`}>
            <h3 className={`text-lg font-semibold ${colors.icon}`}>{title}</h3>
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-gray-700">{message}</p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
          {showCancel && (
            <button
              onClick={onClose}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`rounded-xl px-4 py-2 text-sm font-medium text-white transition ${colors.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
