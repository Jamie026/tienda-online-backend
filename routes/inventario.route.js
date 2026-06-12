const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth");
const {
    getInventario,
    getInventarioDisponible,
    deleteInventario
} = require("../controllers/inventario");

router.get("/", verifyToken, (req, res) => getInventario(req, res));

router.get("/disponible", verifyToken, (req, res) =>
    getInventarioDisponible(req, res)
);

router.delete("/:id", verifyToken, (req, res) => deleteInventario(req, res));

module.exports = router;
