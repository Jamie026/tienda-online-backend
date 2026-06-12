const {
    Despacho,
    Factura,
    Usuario,
    DetalleFactura,
    Inventario
} = require("../models");
const { validateItem } = require("../utils/validacion");

exports.getDespachosProveedor = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.usuario.id);
        if (!usuario)
            return res.status(404).json({ error: "Usuario no encontrado" });

        const despachos = await Despacho.findAll({
            include: [
                {
                    model: Factura,
                    where: { proveedor: usuario.id },
                    include: [
                        {
                            model: Usuario,
                            as: "usuarioVendedor",
                            attributes: ["id", "nombre", "email"]
                        }
                    ]
                }
            ],
            order: [["fecha", "DESC"]]
        });
        res.status(200).json(despachos);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los despachos" });
    }
};

exports.getDespachosVendedor = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.usuario.id);
        if (!usuario)
            return res.status(404).json({ error: "Usuario no encontrado" });

        const despachos = await Despacho.findAll({
            include: [
                {
                    model: Factura,
                    where: { vendedor: usuario.id, tipo: "reabastecimiento" },
                    include: [
                        {
                            model: Usuario,
                            as: "usuarioProveedor",
                            attributes: ["id", "nombre", "email"]
                        }
                    ]
                }
            ],
            order: [["fecha", "DESC"]]
        });
        res.status(200).json(despachos);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los despachos" });
    }
};

exports.getDespachosComprador = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.usuario.id);
        if (!usuario)
            return res.status(404).json({ error: "Usuario no encontrado" });

        const despachos = await Despacho.findAll({
            include: [
                {
                    model: Factura,
                    where: { comprador: usuario.id },
                    include: [
                        {
                            model: Usuario,
                            as: "usuarioVendedor",
                            attributes: ["id", "nombre", "email"]
                        }
                    ]
                }
            ],
            order: [["fecha", "DESC"]]
        });
        res.status(200).json(despachos);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los despachos" });
    }
};

exports.getDespachosVentas = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.usuario.id);
        if (!usuario)
            return res.status(404).json({ error: "Usuario no encontrado" });

        const despachos = await Despacho.findAll({
            include: [
                {
                    model: Factura,
                    where: { vendedor: usuario.id, tipo: "venta" },
                    include: [
                        {
                            model: Usuario,
                            as: "usuarioComprador",
                            attributes: ["id", "nombre", "email"]
                        }
                    ]
                }
            ],
            order: [["fecha", "DESC"]]
        });
        res.status(200).json(despachos);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los despachos" });
    }
};

exports.createDespacho = async (req, res) => {
    const { factura, direccion } = req.body;
    try {
        const errores = validateItem({ factura, direccion });
        if (errores.length > 0) return res.status(400).json({ errores });

        const usuario = await Usuario.findByPk(req.usuario.id);
        if (!usuario)
            return res.status(404).json({ error: "Usuario no encontrado" });

        const facturaBD = await Factura.findByPk(factura);
        if (!facturaBD)
            return res.status(404).json({ error: "Factura no encontrada" });

        const esDespachador =
            (facturaBD.tipo === "reabastecimiento" &&
                facturaBD.proveedor === usuario.id) ||
            (facturaBD.tipo === "venta" && facturaBD.vendedor === usuario.id);
        if (!esDespachador)
            return res.status(401).json({ error: "No tiene permiso" });

        if (facturaBD.estado !== "pendiente")
            return res.status(400).json({
                error: "Solo se pueden despachar facturas pendientes"
            });

        const despacho = await Despacho.create({
            factura: facturaBD.id,
            direccion,
            fecha: new Date()
        });
        await facturaBD.update({ estado: "despachada" });

        res.status(201).json({
            mensaje: "Despacho creado correctamente",
            id: despacho.id
        });
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

exports.anularDespacho = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.usuario.id);
        if (!usuario)
            return res.status(404).json({ error: "Usuario no encontrado" });

        const despacho = await Despacho.findByPk(req.params.id, {
            include: [{ model: Factura }]
        });
        if (!despacho)
            return res.status(404).json({ error: "Despacho no encontrado" });

        const esDespachador =
            (despacho.Factura.tipo === "reabastecimiento" &&
                despacho.Factura.proveedor === usuario.id) ||
            (despacho.Factura.tipo === "venta" &&
                despacho.Factura.vendedor === usuario.id);
        if (!esDespachador)
            return res.status(401).json({ error: "No tiene permiso" });

        if (despacho.estado !== "enviando")
            return res.status(400).json({
                error: "Solo se pueden anular despachos en envío"
            });

        await despacho.update({ estado: "anulado" });
        await despacho.Factura.update({ estado: "pendiente" });

        res.status(200).json({ mensaje: "Despacho anulado correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

exports.recibirDespacho = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.usuario.id);
        if (!usuario)
            return res.status(404).json({ error: "Usuario no encontrado" });

        const despacho = await Despacho.findByPk(req.params.id, {
            include: [
                {
                    model: Factura,
                    include: [{ model: DetalleFactura }]
                }
            ]
        });
        if (!despacho)
            return res.status(404).json({ error: "Despacho no encontrado" });

        const esReceptor =
            (despacho.Factura.tipo === "reabastecimiento" &&
                despacho.Factura.vendedor === usuario.id) ||
            (despacho.Factura.tipo === "venta" &&
                despacho.Factura.comprador === usuario.id);
        if (!esReceptor)
            return res.status(401).json({ error: "No tiene permiso" });

        if (despacho.estado !== "enviando")
            return res.status(400).json({
                error: "Solo se pueden recibir despachos en envío"
            });

        await despacho.update({ estado: "entregado" });
        await despacho.Factura.update({ estado: "recibida" });

        if (despacho.Factura.tipo === "reabastecimiento") {
            const detalles = despacho.Factura.DetalleFacturas ?? [];
            for (const detalle of detalles) {
                if (!detalle.producto) continue;

                const existente = await Inventario.findOne({
                    where: { vendedor: usuario.id, producto: detalle.producto }
                });
                if (existente) {
                    await existente.update({
                        cantidad: existente.cantidad + detalle.cantidad
                    });
                } else {
                    await Inventario.create({
                        vendedor: usuario.id,
                        producto: detalle.producto,
                        cantidad: detalle.cantidad
                    });
                }
            }
        }

        res.status(200).json({ mensaje: "Despacho recibido correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
