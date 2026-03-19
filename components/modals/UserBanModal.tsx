'use client';

import React from 'react';
import ReactModal from 'react-modal';

type UserBanModalProps = {
  isOpen: boolean;
  onRequestClose: () => void;
  onConfirm: () => void;
  banReason: string;
  setBanReason: (reason: string) => void;
};

export default function UserBanModal({
  isOpen,
  onRequestClose,
  onConfirm,
  banReason,
  setBanReason,
}: UserBanModalProps) {
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
          <h2 className="text-xl font-semibold text-slate-900">Ban User</h2>
          <p className="mt-1 text-sm text-slate-500">
            This action will restrict the selected user from accessing the
            platform.
          </p>
        </div>

        <div className="px-6 py-5">
          <label
            htmlFor="banReason"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Ban Reason
          </label>

          <textarea
            id="banReason"
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            rows={4}
            placeholder="Enter reason for banning this user..."
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
          />

          <div className="mt-2 flex justify-between text-xs">
            <span className="text-slate-400">Maximum 500 characters</span>
            <span
              className={`${
                banReason.length > 500 ? 'text-red-500' : 'text-slate-400'
              }`}
            >
              {banReason.length}/500
            </span>
          </div>
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
            disabled={banReason.length <= 0 || banReason.length > 500}
            className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Ban User
          </button>
        </div>
      </div>
    </ReactModal>
  );
}
