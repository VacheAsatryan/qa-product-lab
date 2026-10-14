import React from 'react';
import type { Product } from '../types/product';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  product: Product | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  product,
  isDeleting,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !product) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-950/80 border border-red-800/80 flex items-center justify-center shrink-0 text-red-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
          <div>
            <h3 id="delete-dialog-title" className="text-lg font-bold text-white">
              Delete Product
            </h3>
            <p className="text-sm text-slate-400 mt-0.5">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="mt-4 p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 text-sm">
          <p className="text-slate-300 font-medium">Are you sure you want to delete this product?</p>
          <div className="mt-2 text-xs space-y-1 text-slate-400">
            <div>
              <span className="text-slate-500">Name:</span> <span className="text-slate-200 font-medium">{product.name}</span>
            </div>
            <div>
              <span className="text-slate-500">Price:</span> <span className="text-slate-200">${product.price}</span>
            </div>
            <div>
              <span className="text-slate-500">Quantity:</span> <span className="text-slate-200">{product.quantity}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            data-testid="delete-cancel-button"
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-750 hover:text-white rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            data-testid="delete-confirm-button"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-sm shadow-red-950/50 transition-all focus:outline-hidden focus:ring-2 focus:ring-red-400 disabled:opacity-50 cursor-pointer"
          >
            {isDeleting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Deleting...
              </>
            ) : (
              'Confirm Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
