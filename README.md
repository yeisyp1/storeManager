StoreManager
Manual de instalación y uso – storeManager 

1. Introducción 

StoreManager es un sistema de gestión de inventario y ventas diseñado para negocios pequeños y/o medianos, que permite administrar productos, controlar ventas y asignar roles de usuario como administrador y cajero, cada uno con funcionalidades específicas. 

2. Requisitos previos 

2.1 Hardware mínimo 

• Procesador: 2 núcleos 
• Memoria RAM: 4 GB 
• Almacenamiento: 2 GB libres 
• Sistema Operativo: Windows 10+, Linux o macOS 

2.2 Software necesario 

• Node.js v18 o superior 
• npm  
• PostgreSQL (con configuración de Prisma) 
• Git 



----------------------------------------------------------------------------------------


1. Clonar el repositorio:


git clone https://github.com/yeisyp1/storeManager.git
cd storeManager
npm install

    Instalar dependencias del Backend:

cd Backend
npm install

    Instalar dependencias del Frontend:

cd Frontend
npm install

Configuración de la base de datos PostgreSQL

    Iniciar PostgreSQL:

sudo systemctl start postgresql

    Revisar que la base de datos esté disponible:

psql -U postgres -c "\l"

    Configurar la variable de entorno DATABASE_URL en Backend creando primero .env:
Entonces en Backend/.env ingresar:
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/inventario_ventas"

Prisma

    Generar el cliente de Prisma:

cd Backend
npx prisma generate
npx prisma migrate dev

    Abrir Prisma Studio para ver los datos:

npx prisma studio

2. Ejecutar la aplicación

    Backend:

cd Backend/src
node index.js

    Frontend (en otra terminal):

cd storeManager/Frontend
npm run dev   # Ejecuta el frontend con Vite

Restaurar la base de datos desde Backend/DataBase

inventario_ventas.backup

    Crear la base de datos:
sudo systemctl start postgresql
CREATE DATABASE inventario_ventas;

    Restaurar el backup:

cd Backend
pg_restore -U postgres -d inventario_ventas DataBase/inventario_ventas.backup
npx prisma generate
----------------------------------------------------------------------------------------------
3.    Por si hay discordancia de colación en PostgreSQL:

        Editar schema.prisma:

datasource db {
  provider          = "postgresql"
  url               = env("DATABASE_URL")
  shadowDatabaseUrl = "postgresql://postgres@localhost:5432/shadow_db"
}

    En PostgreSQL:

psql -U postgres -d postgres
ALTER DATABASE template1 REFRESH COLLATION VERSION;
CREATE DATABASE inventario_ventas;
CREATE DATABASE shadow_db;

    Luego ejecutar migraciones de Prisma:

cd Backend
npx prisma migrate dev
npx prisma studio
---------------------------------------------------------------------------------------------------
4. Usuarios de prueba 

| Usuario | Contraseña | Rol          |
|---------|------------|--------------|
| Ricardo Admin | admin1234   | Administrador|
| Sebas   | 1234 | CAJERO       |
| Luisa   | 1234   | CAJERO       |
| Elena   | 1234   | Administrador      |
 

4. Proceso de inicio de sesión 

1. Ingresar a la URL del frontend. 
2. Seleccionar la opción Iniciar sesión. 
3. Introducir el usuario y contraseña. Según el rol, se mostrarán diferentes opciones en el Dashboard. 

5. Funcionalidades del sistema 

5.1 Rol: Administrador 

• Gestionar usuarios (listar, crear, eliminar y actualizar información de los usuarios). 
• Administrar productos (crear, editar, eliminar, actualizar stock). 
• Consultar ventas y generar reportes. 
• Visualizar estadísticas generales del sistema. 

5.2 Rol: Cajero 

• Registrar ventas seleccionando productos del inventario. 
• Consultar productos disponibles y su stock. 
• Emitir comprobantes de venta. 

6. Flujo de uso básico 

1. El administrador crea usuarios y registra productos iniciales. 
2. El cajero inicia sesión con sus credenciales. 
3. El cajero realiza ventas seleccionando productos y cantidades. 
4. El sistema descuenta automáticamente el stock del producto. 
5. El administrador revisa reportes de ventas, inventario y genera reportes en PDF. 

 

7. Notas finales 

• Las contraseñas almacenadas en la base de datos están encriptadas con bcrypt. 
• El archivo .env no se subió al repositorio. 
• El sistema sigue arquitectura cliente-servidor. 

Tecnologías utilizadas 

Backend 

    Node.js: entorno de ejecución. 

    Express.js: framework para crear las rutas y controlar la API REST. 

    Prisma ORM: para interactuar con la base de datos. 

    bcryptjs: para encriptar contraseñas. 

    jsonwebtoken (JWT): para autenticación y manejo de sesiones. 

    PDFKit: Generación de reportes PDF 

 

Base de datos 

    PostgreSQL con Prisma. 

Frontend 

• React: librería para UI. 
• Vite: bundler y dev server. 
• TailwindCSS: estilos. 
• lucide-react: iconos. 

Entorno y herramientas 

• Manjaro Linux. 
• Visual Studio Code: IDE de desarrollo. 
• npm: gestor de dependencias. 
• Git: control de versiones. 

 
