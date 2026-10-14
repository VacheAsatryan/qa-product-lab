import type { Pool } from 'pg';
import { mapProduct, type Product, type ProductInput, type ProductRow } from '../types/product.js';

export class ProductRepository {
  constructor(private readonly pool: Pool) {}

  async create(input: ProductInput): Promise<Product> {
    const result = await this.pool.query<ProductRow>(
      `
        INSERT INTO products (name, description, price, quantity)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, description, price, quantity, created_at, updated_at
      `,
      [input.name, input.description, input.price, input.quantity],
    );

    const row = result.rows[0];

    if (!row) {
      throw new Error('Insert did not return a product row');
    }

    return mapProduct(row);
  }

  async findAll(): Promise<Product[]> {
    const result = await this.pool.query<ProductRow>(
      `
        SELECT id, name, description, price, quantity, created_at, updated_at
        FROM products
        ORDER BY created_at ASC, id ASC
      `,
    );

    return result.rows.map(mapProduct);
  }

  async findById(id: string): Promise<Product | null> {
    const result = await this.pool.query<ProductRow>(
      `
        SELECT id, name, description, price, quantity, created_at, updated_at
        FROM products
        WHERE id = $1
      `,
      [id],
    );

    const row = result.rows[0];
    return row ? mapProduct(row) : null;
  }

  async update(id: string, input: ProductInput): Promise<Product | null> {
    const result = await this.pool.query<ProductRow>(
      `
        UPDATE products
        SET
          name = $1,
          description = $2,
          price = $3,
          quantity = $4,
          updated_at = NOW()
        WHERE id = $5
        RETURNING id, name, description, price, quantity, created_at, updated_at
      `,
      [input.name, input.description, input.price, input.quantity, id],
    );

    const row = result.rows[0];
    return row ? mapProduct(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM products WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
