const path = require("path");
const ProductManager = require("../dao/productManager");
const productosModelo = require("../dao/models/products.js");
const cartsModelo = require("../dao/models/carts.js");
const mongoose = require("mongoose");
const VistasController = require("../controller/vistas.controller.js");

let ruta = path.join(__dirname, "..", "archivos", "objetos.json");

const Router = require("express").Router;

const vistasRouter = Router();
let pm01 = new ProductManager(ruta);

const auth1 = (permisos = []) =>
  function (req, res, next) {
    permisos = permisos.map((p) => p.toLowerCase());

    if (permisos.includes("PUBLIC")) {
      return next();
    }
     if (!req.session.usuario) {
      res.setHeader("Content-Type", "application/json");
      return res
        .status(403)
        .json({ error: `No tiene privilegios suficientes para este recurso` });
     }
    if (!permisos.includes(req.session.usuario.rol)) {
      res.setHeader("Content-Type", "application/json");
      return res
        .status(403)
        .json({ error: `No tiene privilegios suficientes para este recurso` });
    }

    return next();
  };

const auth = (req, res, next) => {
  if (!req.session.usuario) {
    return res.redirect("/login");
  }

  next();
};

const auth2 = (req, res, next) => {
  if (req.session.usuario) {
    return res.redirect("/perfil");
  }

  next();
};

vistasRouter.get(
  "/products",
  auth1(["USUARIO", "ADMIN", "PREMIUM"]),
  VistasController.getProducts
);

vistasRouter.post(
  "/products/:pid",
  auth1(["PREMIUM", "ADMIN"]),
  VistasController.deleteProducts
);

vistasRouter.get(
  "/realtimeproducts",
  auth1(["USUARIO", "ADMIN", "PREMIUM"]),
  VistasController.getProductsRealTime
);

vistasRouter.get(
  "/modificarUsuario",auth1(["ADMIN"]),
  
  VistasController.modificarUsuario
);

vistasRouter.get("/", auth, VistasController.homePage);

vistasRouter.get(
  "/carts",
  auth1(["USUARIO", "ADMIN", "PREMIUM"]),
  VistasController.getCarts
);
vistasRouter.get(
  "/cart/:cid",
  auth1(["USUARIO", "ADMIN", "PREMIUM"]),
  VistasController.getCartsId
);

vistasRouter.get(
  "/chat",
  auth1(["USUARIO", "ADMIN", "PREMIUM"]),
  VistasController.getChat
);

vistasRouter.get(
  "/perfil",
  auth1(["USUARIO", "ADMIN", "PREMIUM"]),
  VistasController.getPerfil
);
vistasRouter.get("/login", auth2, VistasController.getlogin);
vistasRouter.post(
  "/carts/:cid/products/:pid",
  auth1(["USUARIO", "ADMIN", "PREMIUM"]),
  VistasController.addProductToCart
);
vistasRouter.post(
  "/cart/:cid/product/:pid",
  auth1(["USUARIO", "ADMIN", "PREMIUM"]),
  VistasController.deleteProductCart
);
vistasRouter.get("/registro", auth2, VistasController.getRegistro);
vistasRouter.get("/recupero01", VistasController.getRecupero01);
vistasRouter.get("/recupero02", VistasController.getRecupero02);
vistasRouter.get(
  "/agregarProducto",
  
  VistasController.agregarProductos
);
vistasRouter.get("/loggertest", (req, res) => {
  req.logger.debug("prueba logger funcionando...");
  req.logger.http("prueba logger funcionando...");
  req.logger.info("prueba logger funcionando...");
  req.logger.warning("prueba logger funcionando...");
  req.logger.error("prueba logger funcionando...");
  req.logger.fatal("prueba logger funcionando...");

  res.setHeader("Content-Type", "application/json");
  return res
    .status(200)
    .json({ message: "Mensajes de registro enviados con éxito." });
});
module.exports = vistasRouter;
