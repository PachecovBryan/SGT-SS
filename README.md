SGT - Sistema Gestor de Titulación (Versión 1)

Este repositorio contiene la estructura base y funcional del Sistema Gestor de Titulación. El proyecto ya cuenta con los módulos principales operativos.

Tecnologías del proyecto

    Frontend: Desarrollado con React, utilizando Mantine UI para la interfaz y Vite como herramienta de construcción.

    Backend: Node.js con Express.

    Base de Datos: PostgreSQL gestionado a través de Supabase(Para pruebas de despliegue).

    ORM: Prisma para el manejo de modelos y consultas.

Configuración del Entorno

Los archivos de variables de entorno (.env) no se subieron al repositorio. Para que el sistema funcione en local, debe crear sus propios archivos.

En la carpeta /Backend:
(Editar de acuerdo a su avance/mejora) es solo en V1
Crea un archivo .env con las credenciales de tu base de datos:

    DATABASE_URL: URL de conexión de Prisma.

    DIRECT_URL: URL directa de Supabase.

    PORT:puerto 4000.

En la carpeta /Frontend:
(Editar de acuerdo a su avance/mejora) es solo en V1
Crea un archivo .env para la comunicación con la API y Supabase:

    VITE_API_URL: URL de tu backend local (ej. http://localhost:4000).

    VITE_SUPABASE_URL: URL de tu proyecto en Supabase.

    VITE_SUPABASE_ANON_KEY: Tu llave pública (anon key).

Instalación y puesta en marcha

    Instalar dependencias: Es necesario ejecutar npm install tanto en la carpeta Frontend como en la de Backend.

    Generar Cliente de Prisma: Dentro de la carpeta Backend, corre el siguiente comando para mapear la base de datos:

    Ejecutar el proyecto:

        Backend: npm run dev

        Frontend: npm run dev

Notas.

    Esto es una version base funcional (V1)
    Modulos: los modulos son funcionales pero necesitan mejoras/datos que deben ser proporcionados por la administarción de la escuela.

    Control de acceso: El sistema ya diferencia entre los roles de Administrador y Usuario.

    Modelos de datos: Si necesitan revisar o cambiar la estructura de las tablas, todo está definido en backend/prisma/schema.prisma.
