import React from 'react';
import type { Product } from '../types/product';

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onAddNew: () => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  isLoading,
  onEdit,
  onDelete,
  onAddNew,
}) => {
  if (isLoading) {
    return (
      <div
        data-testid="products-loading"
        className="flex flex-col items-center justify-center p-16 text-slate-400 bg-slate-900/50 rounded-xl border border-slate-800"
      >
        <svg className="animate-spin h-8 w-8 text-sky-400 mb-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-sm font-medium">Loading products...</span>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div
        data-testid="products-empty-state"
        className="flex flex-col items-center justify-center p-16 text-center bg-slate-900/40 rounded-xl border border-slate-800 border-dashed"
      >
        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white">No products found</h3>
        <p className="mt-1 text-sm text-slate-400 max-w-sm">
          The catalog is currently empty. Start by adding a new product to test CRUD flows.
        </p>
        <button
          type="button"
          onClick={onAddNew}
          data-testid="empty-add-product-button"
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add First Product
        </button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleString(undefined, {
        dateStyle: 'short',
        timeStyle: 'short',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 shadow-xl backdrop-blur-xs">
      <table className="w-full text-left text-sm text-slate-300" data-testid="products-table">
        <thead className="bg-slate-950/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
          <tr>
            <th scope="col" className="px-6 py-4">Product Name</th>
            <th scope="col" className="px-6 py-4">Description</th>
            <th scope="col" className="px-6 py-4">Price</th>
            <th scope="col" className="px-6 py-4">Quantity</th>
            <th scope="col" className="px-6 py-4">Created At</th>
            <th scope="col" className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {products.map((product) => (
            <tr
              key={product.id}
              data-testid={`product-row-${product.id}`}
              className="hover:bg-slate-800/40 transition-colors"
            >
              <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                <span data-testid={`product-name-${product.id}`}>{product.name}</span>
              </td>
              <td className="px-6 py-4 text-slate-400 max-w-xs truncate" title={product.description ?? ''}>
                <span data-testid={`product-description-${product.id}`}>
                  {product.description || <span className="text-slate-600 italic">No description</span>}
                </span>
              </td>
              <td className="px-6 py-4 font-mono font-medium text-emerald-400 whitespace-nowrap">
                <span data-testid={`product-price-${product.id}`}>${product.price}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  data-testid={`product-quantity-${product.id}`}
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    product.quantity === 0
                      ? 'bg-amber-950/80 text-amber-400 border border-amber-800/80'
                      : 'bg-slate-800 text-slate-200 border border-slate-700'
                  }`}
                >
                  {product.quantity} in stock
                </span>
              </td>
              <td className="px-6 py-4 text-xs text-slate-400 whitespace-nowrap font-mono">
                <span data-testid={`product-created-${product.id}`}>{formatDate(product.created_at)}</span>
              </td>
              <td className="px-6 py-4 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(product)}
                    data-testid={`edit-product-${product.id}`}
                    aria-label={`Edit ${product.name}`}
                    className="p-1.5 text-sky-400 hover:text-sky-300 hover:bg-sky-950/50 rounded-lg transition-colors cursor-pointer"
                    title="Edit Product"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(product)}
                    data-testid={`delete-product-${product.id}`}
                    aria-label={`Delete ${product.name}`}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Product"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
