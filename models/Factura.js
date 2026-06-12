const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Usuario = require("./Usuario");

const Factura = sequelize.define("Factura", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fecha: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    tipo: {
        type: DataTypes.ENUM("reabastecimiento", "venta"),
        allowNull: false,
        defaultValue: "reabastecimiento"
    },
    estado: {
        type: DataTypes.ENUM("pendiente", "despachada", "recibida", "anulada"),
        allowNull: false,
        defaultValue: "pendiente"
    },
    vendedor: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Usuario,
            key: "id"
        }
    },
    proveedor: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Usuario,
            key: "id"
        }
    },
    comprador: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Usuario,
            key: "id"
        }
    }
});

Factura.belongsTo(Usuario, { as: "usuarioVendedor", foreignKey: "vendedor" });
Factura.belongsTo(Usuario, { as: "usuarioProveedor", foreignKey: "proveedor" });
Factura.belongsTo(Usuario, { as: "usuarioComprador", foreignKey: "comprador" });

Usuario.hasMany(Factura, {
    foreignKey: "vendedor",
    onDelete: "CASCADE",
    as: "facturaVendedor"
});
Usuario.hasMany(Factura, {
    foreignKey: "proveedor",
    onDelete: "CASCADE",
    as: "facturaProveedor"
});
Usuario.hasMany(Factura, {
    foreignKey: "comprador",
    onDelete: "CASCADE",
    as: "facturaComprador"
});

module.exports = Factura;
