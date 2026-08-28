/**
 * src/interfaces/controllers/ProductController.js
 * -----------------------------------------------------------------------
 * Adaptador HTTP para el CRUD de productos. Igual que AuthController,
 * actúa como composition root de esta feature: instancia el repositorio
 * concreto una sola vez y lo inyecta en cada caso de uso.
 * -----------------------------------------------------------------------
 */
const PostgresProductRepository = require('../../infrastructure/repositories/PostgresProductRepository');
const GetAllProductsUseCase = require('../../use-cases/products/GetAllProductsUseCase');
const GetProductByIdUseCase = require('../../use-cases/products/GetProductByIdUseCase');
const CreateProductUseCase = require('../../use-cases/products/CreateProductUseCase');
const UpdateProductUseCase = require('../../use-cases/products/UpdateProductUseCase');
const DeleteProductUseCase = require('../../use-cases/products/DeleteProductUseCase');

const productRepository = new PostgresProductRepository();
const getAllProductsUseCase = new GetAllProductsUseCase(productRepository);
const getProductByIdUseCase = new GetProductByIdUseCase(productRepository);
const createProductUseCase = new CreateProductUseCase(productRepository);
const updateProductUseCase = new UpdateProductUseCase(productRepository);
const deleteProductUseCase = new DeleteProductUseCase(productRepository);

class ProductController {
  static async getAll(req, res, next) {
    try {
      const products = await getAllProductsUseCase.execute();
      return res.status(200).json({ success: true, data: products });
    } catch (err) {
      return next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const product = await getProductByIdUseCase.execute(req.params.id);
      return res.status(200).json({ success: true, data: product });
    } catch (err) {
      return next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const { name, price, stock } = req.body;
      const product = await createProductUseCase.execute({ name, price, stock, createdBy: req.user.id });
      return res.status(201).json({ success: true, data: product });
    } catch (err) {
      return next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const { name, price, isActive, stock } = req.body;
      const product = await updateProductUseCase.execute(req.params.id, { name, price, isActive, stock });
      return res.status(200).json({ success: true, data: product });
    } catch (err) {
      return next(err);
    }
  }

  static async remove(req, res, next) {
    try {
      const result = await deleteProductUseCase.execute(req.params.id);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = ProductController;
