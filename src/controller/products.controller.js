const productosModelo = require("../dao/models/products.js");
const mongoose = require("mongoose");
const productsService = require("../services/products.service.js");

class ProductsController {
  constructor() {}

  static async getProducts(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
      const options = {
        page,
        limit,
      };

      const result = await productsService.getProducts({}, options);

      const prevPage = result.hasPrevPage ? result.prevPage : null;
      const nextPage = result.hasNextPage ? result.nextPage : null;

      const prevLink = prevPage
        ? `/api/products?page=${prevPage}&limit=${limit}`
        : null;
      const nextLink = nextPage
        ? `/api/products?page=${nextPage}&limit=${limit}`
        : null;

      res.status(200).json({
        status: "success",
        payload: result.docs,
        totalPages: result.totalPages,
        prevPage,
        nextPage,
        page,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevLink,
        nextLink,
      });
    } catch (error) {
      res.status(500).json({
        error:
          `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador` +
          error.message,
      });
    }
  }
  static async getProductsById(req, res) {
    let id = req.params.pid;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({ error: `Ingrese un id válido...!!!` });
      }
    let productos = await productsService.getProductById({deleted:false,_id:id});
    res.setHeader("Content-Type", "application/json");
  
    productos
      ? res.json({ productos })
      : res.status(400).json({ error: "ingrese un id valido" });
  }
  static async createProducts(req, res) {
    let { title, price, description, code, stock, status, category } = req.body;
    if (!status) {
      status = true;
    }

    let nuevoProducto = {
      title,
      price,
      description,
      code,
      stock,
      status,
      category,
    };
    let existe

    try {
      existe = await productsService.getProductById({ deleted: false, code });
    } catch (error) {
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({
        error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
        detalle: error.message,
      });
    }

    if (existe) {
      res.setHeader("Content-Type", "application/json");
      return res
        .status(400)
        .json({ error: `El usuario con code ${code} ya existe en BD...!!!` });
    }

    if (!title || !price || !description || !code || !stock || !category) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ error: `complete todos los campos` });
    }

    if (title && typeof title !== "string") {
      return res
        .status(400)
        .json({ error: "La propiedad title debe ser de tipo string" });
    }
    if (description && typeof description !== "string") {
      return res
        .status(400)
        .json({ error: "La propiedad description debe ser de tipo string" });
    }
    if (code && typeof code !== "string") {
      return res
        .status(400)
        .json({ error: "La propiedad code debe ser de tipo string" });
    }
    if (category && typeof category !== "string") {
      return res
        .status(400)
        .json({ error: "La propiedad category debe ser de tipo string" });
    }
    if (price && typeof price !== "number") {
      return res
        .status(400)
        .json({ error: "La propiedad price debe ser de tipo numérico" });
    }
    if (stock && typeof stock !== "number") {
      return res
        .status(400)
        .json({ error: "La propiedad stock debe ser de tipo numérico" });
    }

    let propiedadesPermitidas = [
      "title",
      "price",
      "description",
      "code",
      "stock",
      "status",
      "category",
      "thumbnails",
      "deleted",
    ];
    let propiedadesQueLlegan = Object.keys(req.body);

    let valido = propiedadesQueLlegan.every((propiedad) =>
      propiedadesPermitidas.includes(propiedad)
    );
    if (!valido) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({
        error: `No se aceptan algunas propiedades`,
        propiedadesPermitidas,
      });
    }
    try {
      let productoNuevo = await productsService.createProduct(nuevoProducto);

      req.io.emit("nuevoProdConMiddleware", nuevoProducto);
      res.setHeader("Content-Type", "application/json");
      res.status(200).json({ payload: productoNuevo });
    } catch (error) {
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({
        error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
        detalle: error.message,
      });
    }
  }
  static async updateProducts(req, res) {
    let { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ error: `Ingrese un id válido...!!!` });
    }
    let productos = await productsService.getProductById({_id:id});
  
    if (!productos) {
      res.setHeader("Content-Type", "application/json");
      return res
        .status(400)
        .json({ error: "no se encontro el producto con id:" + id });
    }
  
    let propiedadesPermitidas = [
      "title",
      "price",
      "description",
      "deleted",
      "stock",
      "status",
      "category",
      "thumbnails",
    ];
    let propiedadesQueLlegan = Object.keys(req.body);
  
    let valido = propiedadesQueLlegan.every((propiedad) =>
      propiedadesPermitidas.includes(propiedad)
    );
    if (!valido) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({
        error: `No se aceptan algunas propiedades`,
        propiedadesPermitidas,
      });
    }
  
    if (req.body.title && typeof req.body.title !== "string") {
      return res
        .status(400)
        .json({ error: "La propiedad title debe ser de tipo string" });
    }
    if (req.body.deleted && typeof req.body.deleted !== "boolean") {
      return res
        .status(400)
        .json({ error: "La propiedad deleted debe ser de tipo boolean" });
    }
    if (req.body.description && typeof req.body.description !== "string") {
      return res
        .status(400)
        .json({ error: "La propiedad description debe ser de tipo string" });
    }
  
    if (req.body.category && typeof req.body.category !== "string") {
      return res
        .status(400)
        .json({ error: "La propiedad category debe ser de tipo string" });
    }
    if (req.body.price && typeof req.body.price !== "number") {
      return res
        .status(400)
        .json({ error: "La propiedad price debe ser de tipo numérico" });
    }
    if (req.body.stock && typeof req.body.stock !== "number") {
      return res
        .status(400)
        .json({ error: "La propiedad stock debe ser de tipo numérico" });
    }
    let productoActualizado;
    try {
      productoActualizado = await productsService.updateProduct(
        { _id: id },
        req.body
      );
      if (productoActualizado.modifiedCount > 0) {
        res.setHeader("Content-Type", "application/json");
        res.status(200).json({ payload: "modificacion realizada" });
        let productoUpdateado = await productsService.getProductById({_id:id});
        req.io.emit("productoUpdate", productoUpdateado);
      } else {
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({ error: `No se concretó la modificación` });
      }
    } catch (error) {
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({
        error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
        detalle: error.message,
      });
    }

  }
  static async deleteProducts(req, res) {
    let id = req.params.pid;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ error: `Ingrese un id válido...!!!` });
    }
    let productos = await productsService.getProductById({_id:id});
  
    if (!productos) {
      res.setHeader("Content-Type", "application/json");
      return res
        .status(400)
        .json({ error: `no existe el producto con id ${id}` });
    }
    let productoEliminado;
    try {
      productoEliminado = await productsService.deleteProduct(
       id
      );
  
      if (productoEliminado.modifiedCount > 0) {
        req.io.emit("prodEliminado", { id });
        res.setHeader("Content-Type", "application/json");
        return res.status(200).json({ payload: "Eliminacion realizada" });
      } else {
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({ error: `No se concretó la eliminacion` });
      }
    } catch (error) {
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({
        error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
        detalle: error.message,
      });
    }
  }
}

module.exports = ProductsController;