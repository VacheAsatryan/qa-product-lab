import React, { useEffect, useState } from 'react';
import type { Product, ProductInput } from '../types/product';
import { ApiError } from '../types/product';
import { productService } from '../services/productService';
import { ProductTable } from '../components/ProductTable';
import { ProductModal } from '../components/ProductModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

interface Notification {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export const ProductDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [modalServerError, setModalServerError] = useState<string | null>(null);
  const [modalFieldErrors, setModalFieldErrors] = useState<Record<string, string>>({});

  // Delete states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const addNotification = (type: 'success' | 'error', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    setGlobalError(null);
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch products';
      setGlobalError(msg);
      addNotification('error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setModalServerError(null);
    setModalFieldErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setModalServerError(null);
    setModalFieldErrors({});
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (input: ProductInput) => {
    setIsSubmitting(true);
    setModalServerError(null);
    setModalFieldErrors({});

    try {
      if (editingProduct) {
        await productService.update(editingProduct.id, input);
        addNotification('success', `Product "${input.name}" updated successfully.`);
      } else {
        await productService.create(input);
        addNotification('success', `Product "${input.name}" created successfully.`);
      }
      setIsModalOpen(false);
      await fetchProducts();
    } catch (err) {
      if (err instanceof ApiError) {
        setModalServerError(err.message);
        if (err.details && err.details.length > 0) {
          const fieldErrors: Record<string, string> = {};
          err.details.forEach((d) => {
            fieldErrors[d.field] = d.message;
          });
          setModalFieldErrors(fieldErrors);
        }
      } else {
        const msg = err instanceof Error ? err.message : 'Operation failed';
        setModalServerError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDeleteModal = (product: Product) => {
    setDeletingProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;

    setIsDeleting(true);
    try {
      await productService.delete(deletingProduct.id);
      addNotification('success', `Product "${deletingProduct.name}" deleted successfully.`);
      setIsDeleteModalOpen(false);
      setDeletingProduct(null);
      await fetchProducts();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete product';
      addNotification('error', msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Toast Notifications */}
      <div
        data-testid="toast-container"
        className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {notifications.map((n) => (
          <div
            key={n.id}
            data-testid={`toast-${n.type}`}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all animate-in slide-in-from-top-2 duration-200 ${
              n.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-800 text-emerald-100'
                : 'bg-red-950/90 border-red-800 text-red-100'
            }`}
          >
            {n.type === 'success' ? (
              <svg className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <div className="flex-1 text-sm font-medium">{n.message}</div>
            <button
              type="button"
              onClick={() => removeNotification(n.id)}
              className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
              aria-label="Dismiss notification"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold tracking-wider uppercase bg-sky-950/80 text-sky-400 border border-sky-800/80">
                QA Training Lab
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
              QA Product Lab
            </h1>
            <p className="text-sm text-slate-400">
              Product Management Testing Environment
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchProducts}
              disabled={isLoading}
              data-testid="refresh-products-button"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-750 hover:text-white rounded-lg border border-slate-700/80 transition-colors disabled:opacity-50 cursor-pointer"
              title="Refresh product list"
            >
              <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>

            <button
              type="button"
              onClick={handleOpenAddModal}
              data-testid="add-product-button"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm shadow-sky-950/50 transition-all focus:outline-hidden focus:ring-2 focus:ring-sky-400 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Global Connection / Fetch Error */}
        {globalError && (
          <div
            data-testid="global-error-banner"
            className="mb-6 p-4 rounded-xl bg-red-950/70 border border-red-800 text-red-200 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold text-sm">Failed to load products from server</p>
                <p className="text-xs text-red-300 mt-0.5">{globalError}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={fetchProducts}
              className="px-3 py-1.5 text-xs font-medium text-white bg-red-800 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Product Table */}
        <section aria-labelledby="product-list-title">
          <div className="flex items-center justify-between mb-4">
            <h2 id="product-list-title" className="text-lg font-semibold text-white">
              Catalog Items
              {!isLoading && (
                <span className="ml-2 text-xs font-normal text-slate-400" data-testid="products-count">
                  ({products.length} {products.length === 1 ? 'item' : 'items'})
                </span>
              )}
            </h2>
          </div>

          <ProductTable
            products={products}
            isLoading={isLoading}
            onEdit={handleOpenEditModal}
            onDelete={handleOpenDeleteModal}
            onAddNew={handleOpenAddModal}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        QA Product Lab • Software QA Educational Environment
      </footer>

      {/* Add / Edit Modal */}
      <ProductModal
        isOpen={isModalOpen}
        product={editingProduct}
        isSubmitting={isSubmitting}
        serverError={modalServerError}
        serverFieldErrors={modalFieldErrors}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        product={deletingProduct}
        isDeleting={isDeleting}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
