const toPublicUser = (usuario) => {
    const datos = usuario.toJSON ? usuario.toJSON() : { ...usuario };
    const { clave, ...usuarioPublico } = datos;
    return usuarioPublico;
};

module.exports = { toPublicUser };
