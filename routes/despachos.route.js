const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth");
const {
    getDespachosProveedor,
    getDespachosVendedor,
    getDespachosComprador,
    getDespachosVentas,
    createDespacho,
    anularDespacho,
    recibirDespacho
} = require("../controllers/despachos");

router.get("/", verifyToken, (req, res) => getDespachosProveedor(req, res));

router.get("/vendedor", verifyToken, (req, res) =>
    getDespachosVendedor(req, res)
);

router.get("/comprador", verifyToken, (req, res) =>
    getDespachosComprador(req, res)
);

router.get("/ventas", verifyToken, (req, res) =>
    getDespachosVentas(req, res)
);

router.post("/", verifyToken, (req, res) => createDespacho(req, res));

router.put("/:id/anular", verifyToken, (req, res) => anularDespacho(req, res));

router.put("/:id/recibir", verifyToken, (req, res) =>
    recibirDespacho(req, res)
);

module.exports = router;
