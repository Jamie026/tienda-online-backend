const COOKIE_NAME = "token";

const esProduccion = () => process.env.NODE_ENV === "Production";

const getCookieOptions = () => ({
    httpOnly: true,
    secure: esProduccion(),
    sameSite: esProduccion() ? "none" : "lax",
    maxAge: 8 * 60 * 60 * 1000,
    path: "/"
});

const setAuthCookie = (respuesta, token) => {
    respuesta.cookie(COOKIE_NAME, token, getCookieOptions());
};

const clearAuthCookie = (respuesta) => {
    respuesta.clearCookie(COOKIE_NAME, getCookieOptions());
};

module.exports = { COOKIE_NAME, setAuthCookie, clearAuthCookie };
