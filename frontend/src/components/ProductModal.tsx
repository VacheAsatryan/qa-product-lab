import React, { useEffect, useState } from 'react';
import type { Product, ProductInput } from '../types/product';

interface ProductModalProps {
  isOpen: boolean;
  product: Product | null; // null for Create, Product for Edit
  isSubmitting: boolean;
  serverError: string | null;
  serverFieldErrors: Record<string, string>;
  onClose: () => void;
  onSubmit: (data: ProductInput) => Promise<void>;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  product,
  isSubmitting,
  serverError,
  serverFieldErrors,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description ?? '');
      setPrice(product.price);
      setQuantity(product.quantity.toString());
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setQuantity('');
    }
    setClientErrors({});
  }, [product, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    const trimmedName = name.trim();
    if (!trimmedName) {
      errors.name = 'Name is required.';
    } else if (trimmedName.length > 150) {
      errors.name = 'Name must be at most 150 characters.';
    }

    if (!price || price.trim() === '') {
      errors.price = 'Price is required.';
    } else {
      const numPrice = Number(price);
      if (Number.isNaN(numPrice) || !Number.isFinite(numPrice)) {
        errors.price = 'Price must be a valid number.';
      } else if (numPrice <= 0) {
        errors.price = 'Price must be greater than 0.';
      } else {
        const parts = price.split('.');
        if (parts.length > 1 && parts[1].length > 2) {
          errors.price = 'Price must have at most 2 decimal places.';
        }
      }
    }

    if (quantity === '' || quantity.trim() === '') {
      errors.quantity = 'Quantity is required.';
    } else {
      const numQty = Number(quantity);
      if (Number.isNaN(numQty) || !Number.isFinite(numQty)) {
        errors.quantity = 'Quantity must be a valid number.';
      } else if (!Number.isInteger(numQty)) {
        errors.quantity = 'Quantity must be an integer.';
      } else if (numQty < 0) {
        errors.quantity = 'Quantity must be 0 or greater.';
      }
    }

    setClientErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    const payload: ProductInput = {
      name: name.trim(),
      description: description.trim() === '' ? null : description.trim(),
      price: Number(price),
      quantity: Number.parseInt(quantity, 10),
    };

    await onSubmit(payload);
  };

  const getFieldError = (field: string) => {
    return clientErrors[field] || serverFieldErrors[field];
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h2 id="modal-title" className="text-xl font-bold tracking-tight text-white">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            data-testid="modal-close-button"
            aria-label="Close dialog"
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {serverError && (
          <div
            data-testid="modal-server-error"
            className="mt-4 p-3 rounded-lg bg-red-950/70 border border-red-800/80 text-red-200 text-sm flex items-start gap-2"
          >
            <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>{serverError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4 overflow-y-auto pr-1">
          {/* Name Field */}
          <div>
            <label htmlFor="product-name" className="block text-sm font-medium text-slate-300 mb-1">
              Product Name <span className="text-red-400">*</span>
            </label>
            <input
              id="product-name"
              data-testid="product-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              maxLength={150}
              placeholder="e.g. Ergonomic Keyboard"
              className={`w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border ${
                getFieldError('name') ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:border-sky-500 focus:ring-sky-500'
              } text-white placeholder-slate-500 focus:outline-hidden focus:ring-1 text-sm transition-all disabled:opacity-50`}
            />
            {getFieldError('name') && (
              <p data-testid="product-name-error" className="mt-1 text-xs text-red-400">
                {getFieldError('name')}
              </p>
            )}
            <p className="mt-1 text-xs text-slate-500 text-right">{name.length}/150</p>
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="product-description" className="block text-sm font-medium text-slate-300 mb-1">
              Description <span className="text-xs text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              id="product-description"
              data-testid="product-description-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              placeholder="Product details, specs, or QA notes..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 focus:border-sky-500 focus:ring-sky-500 text-white placeholder-slate-500 focus:outline-hidden focus:ring-1 text-sm transition-all disabled:opacity-50"
            />
            {getFieldError('description') && (
              <p data-testid="product-description-error" className="mt-1 text-xs text-red-400">
                {getFieldError('description')}
              </p>
            )}
          </div>

          {/* Price & Quantity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="product-price" className="block text-sm font-medium text-slate-300 mb-1">
                Price ($) <span className="text-red-400">*</span>
              </label>
              <input
                id="product-price"
                data-testid="product-price-input"
                type="number"
                step="0.01"
                min="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={isSubmitting}
                placeholder="29.99"
                className={`w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border ${
                  getFieldError('price') ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:border-sky-500 focus:ring-sky-500'
                } text-white placeholder-slate-500 focus:outline-hidden focus:ring-1 text-sm transition-all disabled:opacity-50`}
              />
              {getFieldError('price') && (
                <p data-testid="product-price-error" className="mt-1 text-xs text-red-400">
                  {getFieldError('price')}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="product-quantity" className="block text-sm font-medium text-slate-300 mb-1">
                Quantity <span className="text-red-400">*</span>
              </label>
              <input
                id="product-quantity"
                data-testid="product-quantity-input"
                type="number"
                step="1"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                disabled={isSubmitting}
                placeholder="10"
                className={`w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border ${
                  getFieldError('quantity') ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:border-sky-500 focus:ring-sky-500'
                } text-white placeholder-slate-500 focus:outline-hidden focus:ring-1 text-sm transition-all disabled:opacity-50`}
              />
              {getFieldError('quantity') && (
                <p data-testid="product-quantity-error" className="mt-1 text-xs text-red-400">
                  {getFieldError('quantity')}
                </p>
              )}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              data-testid="modal-cancel-button"
              className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-750 hover:text-white rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              data-testid="modal-submit-button"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm shadow-sky-900/50 transition-all focus:outline-hidden focus:ring-2 focus:ring-sky-400 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : product ? (
                'Save Changes'
              ) : (
                'Create Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
