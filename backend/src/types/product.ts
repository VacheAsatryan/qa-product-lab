export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  quantity: number;
  created_at: string;
  updated_at: string;
};

export type ProductInput = {
  name: string;
  description: string | null;
  price: string;
  quantity: number;
};

export type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  quantity: number;
  created_at: Date;
  updated_at: Date;
};

export function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price).toFixed(2),
    quantity: row.quantity,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}
