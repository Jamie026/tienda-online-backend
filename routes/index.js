const express = require("express");
const router = express.Router();

router.use("/usuarios", require("./usuarios.route"));
router.use("/productos", require("./productos.route"));
router.use("/facturas", require("./facturas.route"));
router.use("/despachos", require("./despachos.route"));
router.use("/inventario", require("./inventario.route"));

module.exports = router;
