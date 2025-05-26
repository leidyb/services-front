# Services Front - El Tejar (Frontend)

Frontend de la aplicación "El Tejar - Ventana de Servicios y Productos", desarrollado con React y Vite. Esta interfaz de usuario consume la API REST del backend para permitir a los usuarios interactuar con productos, servicios, categorías y su propia información de usuario.

## Descripción del Proyecto

Este proyecto es la cara visible de la plataforma "El Tejar". Permite a los usuarios navegar por catálogos de productos y servicios, registrarse, iniciar sesión, ofertar sus propios productos/servicios (según roles), calificar ofertas, y administrar su perfil y ofertas. Los administradores tienen vistas especiales para la gestión de usuarios, roles y categorías.

## Características Principales

* **Navegación:** Uso de React Router DOM para una experiencia de Single Page Application (SPA).
* **Autenticación y Sesión:**
    * Formularios de Registro y Login.
    * Gestión de estado de autenticación global usando React Context API.
    * Almacenamiento de token JWT en `localStorage` para persistencia de sesión.
    * Envío automático de token JWT en peticiones a endpoints protegidos.
    * Rutas protegidas para funcionalidades que requieren login o roles específicos (ADMIN).
    * Funcionalidad de Logout.
* **Gestión de Productos:**
    * Listado paginado y con búsqueda.
    * Vista de detalle del producto.
    * Formulario para crear y editar productos (con subida de imágenes).
    * Opción para eliminar productos (protegida por rol).
* **Gestión de Servicios:**
    * Listado paginado y con búsqueda.
    * Vista de detalle del servicio.
    * Formulario para crear y editar servicios (con subida de imágenes, si se implementó).
    * Opción para eliminar servicios (protegida por rol).
* **Gestión de Categorías (Admin):**
    * Interfaz para listar, crear, editar y eliminar categorías.
* **Gestión de Usuarios (Admin):**
    * Interfaz para listar usuarios y modificar sus roles.
* **Calificaciones:**
    * Visualización de calificaciones en páginas de detalle de productos y servicios.
    * Formulario para que usuarios autenticados dejen calificaciones.
    * Opción para eliminar calificaciones (por el autor o ADMIN).
    * Visualización del promedio de calificación del vendedor.
* **UX/UI:**
    * Notificaciones "toast" para feedback al usuario (éxito/error).
    * Indicadores de carga y deshabilitación de formularios durante envíos.
    * Modales de confirmación para acciones destructivas.
    * Diseño funcional y limpio con CSS.
    * Manejo de imágenes con placeholders si no hay imagen disponible.

## Tecnologías Utilizadas

* **React 18+** (o la versión que estés usando)
* **Vite** (como herramienta de build y servidor de desarrollo)
* **JavaScript (ES6+)** (o TypeScript si lo usaste)
* **React Router DOM v6:** Para el enrutamiento del lado del cliente.
* **React Context API:** Para la gestión del estado global de autenticación.
* **`jwt-decode`:** Para decodificar tokens JWT en el frontend.
* **`react-toastify`:** Para mostrar notificaciones "toast".
* **`Workspace` API:** Para las llamadas a la API del backend.
* **CSS3:** Para los estilos (puedes mencionar CSS Modules, Styled Components, Tailwind CSS si los usaste).

## Estructura del Proyecto Frontend (`src/`)

* **`assets/`**: Imágenes estáticas (placeholders, logos), fuentes.
* **`components/`**: Componentes de UI reutilizables.
    * `common/`: Componentes genéricos (Navbar, ProtectedRoute, ConfirmModal, StarRatingDisplay, etc.).
    * `product/`: Componentes específicos de productos (ProductCard, ProductForm).
    * `service/`: Componentes específicos de servicios (ServiceCard, ServiceForm).
    * `rating/`: Componentes específicos de calificaciones (RatingForm, RatingDisplay).
    * `category/`: Componentes específicos de categorías (CategoryFormModal).
* **`contexts/`**: Contextos de React (ej. `AuthContext.jsx`).
* **`hooks/`**: Hooks personalizados (si creaste alguno, ej. `useAuth`).
* **`pages/`**: Componentes que representan vistas o páginas completas de la aplicación.
    * `ProductListPage.jsx`, `CreateProductPage.jsx`, `ProductDetailPage.jsx`, `EditProductPage.jsx`
    * `ServiceListPage.jsx`, `CreateServicePage.jsx`, `ServiceDetailPage.jsx`, `EditServicePage.jsx`
    * `RegisterPage.jsx`, `LoginPage.jsx`
    * `UserManagementPage.jsx`, `CategoryManagementPage.jsx` (para Admin)
* **`services/`**: Módulos para realizar llamadas a la API del backend.
    * `authService.js`, `productService.js`, `trueServiceService.js` (o `serviceService.js`), `categoryService.js`, `userService.js`, `adminService.js`.
* **`styles/`**: (Opcional) Archivos CSS globales o de configuración de estilos si no están junto a los componentes.
* **`App.jsx`**: Componente raíz que define la estructura principal y las rutas.
* **`main.jsx`**: Punto de entrada de la aplicación React, donde se monta `App` y se configuran proveedores globales (BrowserRouter, AuthProvider).
* **`index.css`**: Estilos globales iniciales.

## Configuración del Entorno (Desarrollo Local)

1.  **Prerrequisitos:**
    * Node.js (versión LTS recomendada) y npm (o Yarn).
    * Backend (`services-back`) corriendo localmente (usualmente en `http://localhost:8080`).

2.  **Variables de Entorno (Opcional para Desarrollo Local):**
    * Crea un archivo `.env.development` en la raíz de tu proyecto frontend.
    * Define la URL base de tu API backend local:
        ```env
        VITE_API_BASE_URL_ROOT=http://localhost:8080
        ```
    * Los archivos de servicio (ej. `productService.js`) ya están configurados para usar esta variable o `http://localhost:8080` como fallback.

3.  **Instalar Dependencias:**
    * Navega a la carpeta raíz de tu proyecto frontend en la terminal.
    * Ejecuta:
        ```bash
        npm install
        ```
        o si usas Yarn:
        ```bash
        yarn install
        ```

4.  **Ejecutar la Aplicación de Desarrollo:**
    ```bash
    npm run dev
    ```
    o si usas Yarn:
    ```bash
    yarn dev
    ```
    * La aplicación debería estar disponible en `http://localhost:5173` (o el puerto que indique Vite).

## Build para Producción

Para crear una versión optimizada para producción:
```bash
npm run build
