import { Router, type Request, type Response, type NextFunction } from 'express';
import type { ProductRepository } from '../repositories/productRepository.js';
import { HttpError } from '../errors/httpError.js';
import { parseProductBody } from '../validation/product.js';
import { assertUuid } from '../validation/uuid.js';

function notFound(): HttpError {
  return new HttpError(404, 'PRODUCT_NOT_FOUND', 'Product not found.');
}

export function createProductRouter(repository: ProductRepository): Router {
  const router = Router();

  router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = parseProductBody(req.body);
      const product = await repository.create(input);
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  });

  router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const products = await repository.findAll();
      res.status(200).json(products);
    } catch (error) {
      next(error);
    }
  });

  router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = assertUuid(req.params.id);
      const product = await repository.findById(id);

      if (!product) {
        throw notFound();
      }

      res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  });


  router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = assertUuid(req.params.id);
      const input = parseProductBody(req.body);
      const product = await repository.update(id, input);

      if (!product) {
        throw notFound();
      }

      res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = assertUuid(req.params.id);
      const deleted = await repository.delete(id);

      if (!deleted) {
        throw notFound();
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
}

