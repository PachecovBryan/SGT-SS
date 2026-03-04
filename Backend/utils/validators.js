const validators = {
    // 8 dígitos exactos para alumnos
    esCuentaAlumno: (cuenta) => /^\d{8}$/.test(cuenta),
    
    // 6 dígitos exactos para empleados
    esNumeroEmpleado: (empleado) => /^\d{6}$/.test(empleado),

    esNombreValido: (texto) => /^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s]+$/.test(texto),

    // Generador de Folio "IS-0001"
    generarFolio: (claveCarrera, ultimoFolio) => {
        let nuevoConsecutivo = 1;

        if (ultimoFolio) {
            const partes = ultimoFolio.split('-');
            if (partes.length === 2) {
                const numeroAnterior = parseInt(partes[1], 10);
                if (!isNaN(numeroAnterior)) {
                    nuevoConsecutivo = numeroAnterior + 1;
                }
            }
        }
        const consecutivoStr = nuevoConsecutivo.toString().padStart(4, '0');
        return `${claveCarrera}-${consecutivoStr}`;
    },

    formatearNombre: (texto) => {
        if (!texto || typeof texto !== 'string') return "";
        
        const sinNumeros = texto.replace(/\d+/g, '');

        const limpio = sinNumeros.trim().replace(/\s+/g, ' ');
        
        return limpio.split(' ').map(palabra => {
            if (palabra.length === 0) return "";
            return palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase();
        }).join(' ');
    },

    // Validador de Cargos de Comité 
    validarComite: (comiteArray) => {
        const profesoresVistos = new Set();
        const cargosVistos = new Set();
        const errores = [];

        if (!Array.isArray(comiteArray) || comiteArray.length === 0) {
            return { valido: false, errores: ["El comité no puede estar vacío."] };
        }

        for (const miembro of comiteArray) {
            if (profesoresVistos.has(miembro.personal_id)) {
                errores.push(`El profesor con ID ${miembro.personal_id} está duplicado en el comité.`);
            } else {
                profesoresVistos.add(miembro.personal_id);
            }

            const cargoStr = String(miembro.cargo_id);
            
            if (cargosVistos.has(cargoStr)) {
                errores.push(`El cargo (ID: ${miembro.cargo_id}) ya está asignado a otra persona. No se pueden repetir puestos.`);
            } else {
                cargosVistos.add(cargoStr);
            }
        }

        return {
            valido: errores.length === 0,
            errores
        };
    }
};

module.exports = validators;