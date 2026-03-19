'use client';

import React from 'react';
import ReactModal from 'react-modal';

type DeleteCompanyModalProps = {
  isOpen: boolean;
  onRequestClose: () => void;
  onConfirm: () => void;
  companyName?: string;
};

export default function DeleteCompanyModal({
  isOpen,
  onRequestClose,
  onConfirm,
  companyName,
}: DeleteCompanyModalProps) {
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      ariaHideApp={false}
      shouldCloseOnOverlayClick={true}
      className="relative z-50 w-full max-w-lg rounded-3xl bg-white p-0 shadow-2xl outline-none"
      overlayClassName="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
    >
      <div className="overflow-hidden rounded-3xl">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
          <h2 className="text-xl font-semibold text-slate-900">
            Delete Company
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-slate-900">
              {companyName || 'this company'}
            </span>
            ? This action will also delete its owner user and all related data.
          </p>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            onClick={onRequestClose}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </ReactModal>
  );
}
