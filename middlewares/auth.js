const jwt = require("jsonwebtoken");
const { COOKIE_NAME } = require("../utils/cookies");

const verifyToken = (req, res, next) => {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return res.status(401).json({ error: "Token requerido" });

    try {
        req.usuario = jwt.verify(token, process.env.SECRET_KEY);
        next();
    } catch {
        res.status(401).json({ error: "Token inválido" });
    }
};

module.exports = { verifyToken };
