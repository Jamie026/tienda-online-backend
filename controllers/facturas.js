const {
    Factura,
    Usuario,
    Producto,
    DetalleFactura,
    Inventario
} = require("../models");
const { Op } = require("sequelize");
const { validateItem } = require("../utils/validacion");

exports.getFacturasProveedor = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.usuario.id);

        if (!usuario)
            return res.status(404).json({ error: "Usuario no encontrado" });

        const facturas = await Factura.findAll({
            where: { proveedor: usuario.id },
            include: [
                {
                    model: Usuario,
                    as: "usuarioVendedor",
                    attributes: ["id", "nombre", "email"]
                }
            ],
            order: [["fecha", "DESC"]]
        });
        res.status(200).json(facturas);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener las facturas" });
    }
};

exports.getFacturasVendedor = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.usuario.id);

        if (!usuario)
            return res.status(404).json({ error: "Usuario no encontrado" });

        const facturas = await Factura.findAll({
            where: { vendedor: usuario.id }
        });
        res.status(200).json(facturas);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener las facturas" });
    }
};

exports.getFactura = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.usuario.id);
        if (!usuario)
            return res.status(404).json({ error: "Usuario no encontrado" });

        const factura = await Factura.findByPk(req.params.id, {
            include: [
                {
                    model: Usuario,
                    as: "usuarioVendedor",
                    attributes: ["nombre", "email"]
                },
                {
                    model: Usuario,
                    as: "usuarioProveedor",
                    attributes: ["nombre", "email"]
                },
                {
                    model: Usuario,
                    as: "usuarioComprador",
                    attributes: ["nombre", "email"]
                },
                { model: DetalleFactura }
            ]
        });
        if (!factura)
            return res.status(404).json({ error: "Factura no encontrada" });

        const esParticipante = [
            factura.vendedor,
            factura.proveedor,
            factura.comprador
        ].includes(usuario.id);
        if (!esParticipante)
            return res.status(403).json({ error: "No tiene permiso" });

        res.status(200).json(factura);
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

exports.createFactura = async (req, res) => {
    const { tipo, vendedor, proveedor, productos } = req.body;
    try {
        const errores = validateItem({ tipo, productos });
        if (errores.length > 0) return res.status(400).json({ errores });

        const usuario = await Usuario.findByPk(req.usuario.id);
        if (!usuario)
            return res.status(404).json({ error: "Usuario no encontrado" });

        if (tipo === "reabastecimiento" && usuario.tipo !== "vendedor")
            return res.status(401).json({ error: "No tiene permiso" });

        if (tipo === "venta" && usuario.tipo !== "comprador")
            return res.status(401).json({ error: "No tiene permiso" });

        if (tipo === "reabastecimiento" && !proveedor)
            return res.status(400).json({
                error: "El proveedor es obligatorio para reabastecimiento"
            });

        if (tipo === "venta" && !vendedor)
            return res.status(400).json({
                error: "El vendedor es obligatorio para venta"
            });

        const idVendedor = usuario.tipo === "vendedor" ? usuario.id : vendedor;
        if (!idVendedor)
            return res
                .status(400)
                .json({ error: "El vendedor es obligatorio" });

        const productosBD = await Producto.findAll({
            where: { id: productos.map((p) => p.id) }
        });
        const porId = new Map(productosBD.map((p) => [p.id, p]));

        let total = 0;
        for (const item of productos) {
            const productoBD = porId.get(item.id);
            if (!productoBD)
                return res.status(400).json({
                    error: "Producto no encontrado: " + item.id
                });

            const cantidad = Number(item.cantidad);
            if (!Number.isInteger(cantidad) || cantidad <= 0)
                return res.status(400).json({
                    error: "Cantidad inválida para: " + productoBD.nombre
                });

            total += Number(productoBD.precio) * cantidad;
        }

        const inventarios = new Map();
        if (tipo === "venta") {
            for (const item of productos) {
                const productoBD = porId.get(item.id);
                const inventario = await Inventario.findOne({
                    where: { vendedor: idVendedor, producto: item.id }
                });
                if (
                    !inventario ||
                    inventario.cantidad < Number(item.cantidad)
                )
                    return res.status(400).json({
                        error:
                            "Stock insuficiente para: " +
                            productoBD.nombre +
                            " (disponible: " +
                            (inventario ? inventario.cantidad : 0) +
                            ")"
                    });
                inventarios.set(item.id, inventario);
            }
        }

        const factura = await Factura.create({
            total,
            tipo,
            vendedor: idVendedor,
            comprador: usuario.tipo === "comprador" ? usuario.id : null,
            proveedor: proveedor ? proveedor : null
        });

        if (tipo === "venta") {
            for (const item of productos) {
                const inventario = inventarios.get(item.id);
                await inventario.update({
                    cantidad: inventario.cantidad - Number(item.cantidad)
                });
            }
        }

        await Promise.all(
            productos.map((item) => {
                const productoBD = porId.get(item.id);
                return DetalleFactura.create({
                    cantidad: Number(item.cantidad),
                    nombreProducto: productoBD.nombre,
                    precioProducto: productoBD.precio,
                    factura: factura.id,
                    producto: productoBD.id
                });
            })
        );

        res.status(201).json({
            mensaje: "Factura creada correctamente",
            id: factura.id
        });
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

exports.anularFactura = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.usuario.id);
        if (!usuario)
            return res.status(404).json({ error: "Usuario no encontrado" });

        const factura = await Factura.findByPk(req.params.id);
        if (!factura)
            return res.status(404).json({ error: "Factura no encontrada" });

        const esParticipante = [
            factura.vendedor,
            factura.proveedor,
            factura.comprador
        ].includes(usuario.id);
        if (!esParticipante)
            return res.status(403).json({ error: "No tiene permiso" });

        if (factura.estado !== "pendiente")
            return res.status(400).json({
                error: "Solo se pueden anular facturas pendientes"
            });

        await factura.update({ estado: "anulada" });

        if (factura.tipo === "venta") {
            const detalles = await DetalleFactura.findAll({
                where: { factura: factura.id }
            });
            for (const detalle of detalles) {
                if (!detalle.producto) continue;

                const inventario = await Inventario.findOne({
                    where: {
                        vendedor: factura.vendedor,
                        producto: detalle.producto
                    }
                });
                if (inventario) {
                    await inventario.update({
                        cantidad: inventario.cantidad + detalle.cantidad
                    });
                } else {
                    await Inventario.create({
                        vendedor: factura.vendedor,
                        producto: detalle.producto,
                        cantidad: detalle.cantidad
                    });
                }
            }
        }

        res.status(200).json({ mensaje: "Factura anulada correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

exports.getFacturasVentas = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.usuario.id);
        if (!usuario)
            return res.status(404).json({ error: "Usuario no encontrado" });

        const facturas = await Factura.findAll({
            where: { vendedor: usuario.id, tipo: "venta" },
            include: [
                {
                    model: Usuario,
                    as: "usuarioComprador",
                    attributes: ["id", "nombre", "email"]
                }
            ],
            order: [["fecha", "DESC"]]
        });
        res.status(200).json(facturas);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener las facturas" });
    }
};
