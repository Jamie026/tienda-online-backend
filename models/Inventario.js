const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Usuario = require("./Usuario");
const Producto = require("./Producto");

const Inventario = sequelize.define(
    "Inventario",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        vendedor: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Usuario,
                key: "id"
            }
        },
        producto: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Producto,
                key: "id"
            }
        },
        cantidad: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        indexes: [
            {
                unique: true,
                fields: ["vendedor", "producto"]
            }
        ]
    }
);

Inventario.belongsTo(Usuario, { foreignKey: "vendedor" });
Usuario.hasMany(Inventario, { foreignKey: "vendedor", onDelete: "CASCADE" });

Inventario.belongsTo(Producto, { foreignKey: "producto" });
Producto.hasMany(Inventario, { foreignKey: "producto", onDelete: "CASCADE" });

module.exports = Inventario;
