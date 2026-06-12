const validateItem = (item) => {
    const errores = [];

    if (typeof item !== "object" || item === null) {
        errores.push("Item inválido");
        return errores;
    }

    for (const clave in item) {
        const valor = item[clave];

        if (valor === undefined || valor === null) {
            errores.push("Item inválido: " + clave);
            continue;
        }

        if (typeof valor === "string" && valor.trim() === "")
            errores.push("Cadena vacía: " + clave);

        if (typeof valor === "number" && valor < 0)
            errores.push("Número negativo: " + clave);

        if (valor instanceof Date) {
            if (isNaN(valor.getTime()))
                errores.push("Fecha inválida: " + clave);
            else if (valor > new Date())
                errores.push("Fecha futura no permitida: " + clave);
        }

        if (Array.isArray(valor))
            if (valor.length === 0) errores.push("Lista vacía: " + clave);
    }

    return errores;
};

module.exports = { validateItem };
