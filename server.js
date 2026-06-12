require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rutas = require("./routes");
const { sequelize } = require("./models");

const app = express();
const PORT = process.env.PORT || 3001;
const ORIGENES_PERMITIDOS = process.env.FRONTEND_URL.split(",")
    .map((url) => url.trim())
    .filter(Boolean);

app.set("trust proxy", 1);

app.use(
    cors({
        origin: ORIGENES_PERMITIDOS,
        credentials: true
    })
);
app.use(cookieParser());
app.use(express.json());
app.use("/api", rutas);

const start = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: false });
        app.listen(PORT, () =>
            console.log("Servidor corriendo en http://localhost:" + PORT)
        );
    } catch (error) {
        console.error("Error al inicializar el servidor:", error.message);
        process.exit(1);
    }
};

start();
