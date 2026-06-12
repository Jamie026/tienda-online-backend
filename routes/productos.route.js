const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth");
const {
    getProductos,
    getAllProductos,
    getProductoById,
    createProducto,
    updateProducto,
    deleteProducto
} = require("../controllers/productos");

router.get("/", verifyToken, (req, res) => getProductos(req, res));

router.get("/all", (req, res) => getAllProductos(req, res));

router.get("/:id", verifyToken, (req, res) => getProductoById(req, res));

router.post("/", verifyToken, (req, res) => createProducto(req, res));

router.put("/:id", verifyToken, (req, res) => updateProducto(req, res));

router.delete("/:id", verifyToken, (req, res) => deleteProducto(req, res));

module.exports = router;
