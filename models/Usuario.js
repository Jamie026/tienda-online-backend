const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const bcrypt = require("bcryptjs");

const Usuario = sequelize.define(
    "Usuario",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        clave: {
            type: DataTypes.STRING,
            allowNull: false
        },
        tipo: {
            type: DataTypes.ENUM("comprador", "proveedor", "vendedor"),
            allowNull: false,
            defaultValue: "comprador"
        }
    },
    {
        indexes: [
            {
                unique: true,
                fields: ["email"]
            }
        ]
    }
);

Usuario.beforeCreate((usuario) => {
    const clave = bcrypt.hashSync(usuario.clave, 10);
    usuario.clave = clave;
});

Usuario.beforeUpdate((usuario) => {
    const clave = bcrypt.hashSync(usuario.clave, 10);
    usuario.clave = clave;
});

module.exports = Usuario;
