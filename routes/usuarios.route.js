const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth");
const { getMe, getVendedores, getCompradores, getProveedores, login, register, logout } = require("../controllers/usuarios");

router.get("/me", verifyToken, (req, res) => getMe(req, res));

router.get("/proveedores", verifyToken, (req, res) => getProveedores(req, res));

router.get("/vendedores", verifyToken, (req, res) => getVendedores(req, res));

router.get("/compradores", verifyToken, (req, res) => getCompradores(req, res));

router.post("/login", (req, res) => login(req, res));

router.post("/register", (req, res) => register(req, res));

router.post("/logout", (req, res) => logout(req, res));

module.exports = router;
