const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Factura = require("./Factura");
const Producto = require("./Producto");

const DetalleFactura = sequelize.define("DetalleFactura", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    nombreProducto: {
        type: DataTypes.STRING,
        allowNull: false
    },
    precioProducto: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    factura: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Factura,
            key: "id"
        }
    },
    producto: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Producto,
            key: "id"
        }
    }
});

DetalleFactura.belongsTo(Factura, { foreignKey: "factura" });
Factura.hasMany(DetalleFactura, {
    foreignKey: "factura",
    onDelete: "CASCADE"
});

DetalleFactura.belongsTo(Producto, { foreignKey: "producto" });
Producto.hasMany(DetalleFactura, {
    foreignKey: "producto",
    onDelete: "SET NULL"
});

module.exports = DetalleFactura;
