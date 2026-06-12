const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Factura = require("./Factura");

const Despacho = sequelize.define("Despacho", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    factura: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Factura,
            key: "id"
        }
    },
    fecha: {
        type: DataTypes.DATE,
        allowNull: false
    },
    estado: {
        type: DataTypes.ENUM("enviando", "entregado", "anulado"),
        allowNull: false,
        defaultValue: "enviando"
    },
    direccion: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

Despacho.belongsTo(Factura, { foreignKey: "factura" });
Factura.hasMany(Despacho, { foreignKey: "factura", onDelete: "CASCADE" });

module.exports = Despacho;
