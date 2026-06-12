const { Inventario, Usuario, Producto } = require("../models");
const { Op } = require("sequelize");

exports.getInventarioDisponible = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.usuario.id);
        if (!usuario)
            return res.status(404).json({ error: "Usuario no encontrado" });

        const inventario = await Inventario.findAll({
            where: { cantidad: { [Op.gt]: 0 } },
            include: [
                {
                    model: Producto,
                    attributes: ["id", "nombre", "descripcion", "precio"]
                },
                {
                    model: Usuario,
                    attributes: ["id", "nombre"]
                }
            ]
        });
        res.status(200).json(inventario);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el inventario" });
    }
};

exports.getInventario = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.usuario.id);
        if (!usuario)
            return res.status(404).json({ error: "Usuario no encontrado" });

        const inventario = await Inventario.findAll({
            where: { vendedor: usuario.id },
            include: [
                {
                    model: Producto,
                    attributes: ["id", "nombre", "descripcion", "precio"]
                }
            ]
        });
        res.status(200).json(inventario);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el inventario" });
    }
};

exports.deleteInventario = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.usuario.id);
        if (!usuario)
            return res.status(404).json({ error: "Usuario no encontrado" });

        if (usuario.tipo !== "vendedor")
            return res.status(401).json({ error: "No tiene permiso" });

        const inventario = await Inventario.findOne({
            where: { id: req.params.id, vendedor: usuario.id }
        });
        if (!inventario)
            return res
                .status(404)
                .json({ error: "Registro de inventario no encontrado" });

        await inventario.destroy();
        res.status(200).json({ mensaje: "Inventario liberado correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
