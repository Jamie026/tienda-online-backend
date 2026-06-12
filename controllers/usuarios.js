const { Usuario } = require("../models");
const { toPublicUser } = require("../utils/usuario");
const { setAuthCookie, clearAuthCookie } = require("../utils/cookies");
const { validateItem } = require("../utils/validacion");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.getMe = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.usuario.id);
        if (!usuario)
            return res.status(404).json({ error: "Usuario no encontrado" });
        res.json(toPublicUser(usuario));
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

exports.getVendedores = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.usuario.id);
        if (!usuario)
            return res.status(404).json({ error: "Usuario no encontrado" });

        const vendedores = await Usuario.findAll({
            where: { tipo: "vendedor" }
        });
        res.json(vendedores);
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

exports.getCompradores = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.usuario.id);
        if (!usuario)
            return res.status(404).json({ error: "Usuario no encontrado" });

        const compradores = await Usuario.findAll({
            where: { tipo: "comprador" }
        });
        res.json(compradores);
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

exports.getProveedores = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.usuario.id);
        if (!usuario)
            return res.status(404).json({ error: "Usuario no encontrado" });

        const proveedores = await Usuario.findAll({
            where: { tipo: "proveedor" },
            attributes: ["id", "nombre", "email"]
        });
        res.json(proveedores);
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

exports.login = async (req, res) => {
    const { email, clave } = req.body;
    try {
        const usuario = await Usuario.findOne({ where: { email } });
        if (!usuario)
            return res.status(404).json({ error: "Usuario no encontrado" });

        const claveValida = await bcrypt.compare(clave, usuario.clave);
        if (!claveValida)
            return res.status(401).json({ error: "Contraseña inválida" });

        const token = jwt.sign({ id: usuario.id }, process.env.SECRET_KEY, {
            expiresIn: "8h"
        });
        setAuthCookie(res, token);
        res.json(toPublicUser(usuario));
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

exports.register = async (req, res) => {
    const { nombre, email, clave, tipo } = req.body;
    try {
        const errores = validateItem({ nombre, email, clave, tipo });
        if (errores.length > 0) return res.status(400).json({ errores });

        if (await Usuario.findOne({ where: { email } }))
            return res.status(400).json({ error: "El email ya está en uso" });

        const usuario = await Usuario.create({ nombre, email, clave, tipo });
        const token = jwt.sign({ id: usuario.id }, process.env.SECRET_KEY, {
            expiresIn: "8h"
        });
        setAuthCookie(res, token);
        res.status(201).json(toPublicUser(usuario));
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

exports.logout = async (req, res) => {
    try {
        clearAuthCookie(res);
        res.json({ mensaje: "Sesión cerrada" });
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
