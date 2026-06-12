const { Producto, Usuario, Inventario } = require("../models");
const { validateItem } = require("../utils/validacion");

exports.getProductos = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.usuario.id);
        if (!usuario)
            return res.status(404).json({ error: "Usuario no encontrado" });
        const productos = await Producto.findAll({
            where: { proveedor: usuario.id }
        });
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

exports.getAllProductos = async (req, res) => {
    try {
        const productos = await Producto.findAll({
            include: [
                {
                    model: Usuario,
                    attributes: ["id", "nombre"]
                }
            ]
        });
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

exports.getProductoById = async (req, res) => {
    try {
        const producto = await Producto.findByPk(req.params.id);
        if (!producto)
            return res.status(404).json({ error: "Producto no encontrado" });
        res.json(producto);
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

exports.createProducto = async (req, res) => {
    const { nombre, descripcion, precio } = req.body;

    try {
        const errores = validateItem({ nombre, descripcion, precio });
        if (errores.length > 0) return res.status(400).json({ errores });

        const usuario = await Usuario.findByPk(req.usuario.id);
        if (!usuario)
            return res.status(404).json({ error: "Usuario no encontrado" });

        if (usuario.tipo !== "proveedor")
            return res.status(401).json({ error: "No tiene permiso" });

        await Producto.create({
            nombre,
            descripcion,
            precio,
            proveedor: usuario.id
        });
        res.status(201).json({ mensaje: "Producto creado correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

exports.updateProducto = async (req, res) => {
    const { nombre, descripcion, precio } = req.body;
    try {
        const errores = validateItem({ nombre, descripcion, precio });
        if (errores.length > 0) return res.status(400).json({ errores });

        const usuario = await Usuario.findByPk(req.usuario.id);
        if (!usuario)
            return res.status(404).json({ error: "Usuario no encontrado" });

        if (usuario.tipo !== "proveedor")
            return res.status(401).json({ error: "No tiene permiso" });

        const producto = await Producto.update(
            { nombre, descripcion, precio },
            { where: { id: req.params.id, proveedor: usuario.id } }
        );
        if (producto?.length[0] === 0)
            return res.status(404).json({ error: "Producto no encontrado" });
        res.json({ mensaje: "Producto actualizado correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

exports.deleteProducto = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.usuario.id);
        if (!usuario)
            return res.status(404).json({ error: "Usuario no encontrado" });

        if (usuario.tipo !== "proveedor")
            return res.status(401).json({ error: "No tiene permiso" });

        const producto = await Producto.findOne({
            where: { id: req.params.id, proveedor: usuario.id }
        });
        if (!producto)
            return res.status(404).json({ error: "Producto no encontrado" });

        const vendedores = await Inventario.count({
            where: { producto: producto.id }
        });
        if (vendedores > 0)
            return res.status(409).json({
                error:
                    "No se puede eliminar: " +
                    vendedores +
                    " vendedor(es) lo tienen en inventario"
            });

        await producto.destroy();
        res.json({ mensaje: "Producto eliminado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
