const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth");
const {
    getFacturasProveedor,
    getFacturasVendedor,
    getFacturasVentas,
    getFactura,
    createFactura,
    anularFactura
} = require("../controllers/facturas");

router.get("/proveedor", verifyToken, (req, res) =>
    getFacturasProveedor(req, res)
);

router.get("/vendedor", verifyToken, (req, res) =>
    getFacturasVendedor(req, res)
);

router.get("/ventas", verifyToken, (req, res) => getFacturasVentas(req, res));

router.get("/:id", verifyToken, (req, res) => getFactura(req, res));

router.post("/", verifyToken, (req, res) => createFactura(req, res));

router.put("/:id/anular", verifyToken, (req, res) => anularFactura(req, res));

module.exports = router;
