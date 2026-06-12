const sequelize = require("../config/database");
const Usuario = require("./Usuario");
const Producto = require("./Producto");
const Inventario = require("./Inventario");
const Factura = require("./Factura");
const DetalleFactura = require("./DetalleFactura");
const Despacho = require("./Despacho");

module.exports = {
    sequelize,
    Usuario,
    Producto,
    Inventario,
    Factura,
    DetalleFactura,
    Despacho
};
