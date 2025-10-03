StoreManager - Sistema de gestión de inventario y ventas
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

3. Instalación 

3.1 Clonar el repositorio 

    git clone https://github.com/yeisyp1/storeManager.git 

    cd storeManager 

3.2 Backend (API) 

    Ingresar a la carpeta Backend: 
    cd Backend 

    Instalar dependencias: 
    npm install 

    Crear y configurar en la raíz del Backend el archivo .env con el siguiente contenido:
    DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/storeManager"
    JWT_SECRET="ContraseñaSecretaJWT" 
    JWT_REFRESH_SECRET="ContraseñaRefreshSegura" 



    Ejecutar migraciones e ingresar datos iniciales: 
    npx prisma migrate dev --name init 
     

    Iniciar el servidor: 
    npm run dev 
     

El backend se ejecuta en: http://localhost:3000 

 

3.3 Frontend 

    Ingresar a la carpeta Frontend: 
    cd storeManager/Frontend 

    Instalar dependencias: 
    npm install 

    Iniciar el servidor de desarrollo: 
    npm run dev 
     
    El frontend estará en: http://localhost:5173 

4. Inicio de Sesión 

4.1 Usuarios de prueba 

| Usuario | Contraseña | Rol          |
|---------|------------|--------------|
| ricardo | admin123   | Administrador|
| sebas   | ricardo123 | Cajero       |
| luisa   | luisa123   | Cajero       |
| elena   | elena123   | Cajero       |
 

4.2 Proceso de inicio de sesión 

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

 
