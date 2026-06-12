# LuxxitoSports

Frontend web para explorar complejos deportivos, consultar disponibilidad,
reservar canchas y administrar operaciones como pagos, precios, inventario y
reportes.

El proyecto actualmente funciona como una demostracion navegable. Los datos y la autenticacion son locales; todavia no existe una API conectada.

## Tecnologias

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui y Radix UI
- React Router
- TanStack Query
- Vitest y Testing Library

## Requisitos

- Node.js 18 o superior
- npm 9 o superior

Version utilizada durante el desarrollo:

```text
Node.js 22.17.0
npm 10.9.2
```

## Instalacion

Clona el repositorio y entra en su directorio:

```powershell
git clone <URL_DEL_REPOSITORIO>
cd luxxito-sports
```

Instala las dependencias:

```powershell
npm install
```

En Windows, si PowerShell bloquea `npm.ps1`, utiliza:

```powershell
npm.cmd install
```

## Desarrollo local

Inicia el servidor de Vite:

```powershell
npm run dev
```

En PowerShell con la restriccion indicada anteriormente:

```powershell
npm.cmd run dev
```

La aplicacion estara disponible en:

```text
http://localhost:8080
```

## Acceso de demostracion

En la pantalla `/login`:

1. Introduce cualquier correo electronico.
2. La contrasena no se valida actualmente.
3. Selecciona uno de los roles disponibles.
4. Presiona `Entrar`.

Los roles incluidos son:

| Rol | Funcionalidades |
| --- | --- |
| Jugador | Dashboard, disponibilidad, reserva y comprobante |
| Administrador | Canchas, reservas, precios, pagos, inventario y reportes |
| Soporte | Monitoreo de incidencias |

La sesion se guarda en `localStorage` bajo la clave `luxxito_user`.

## Rutas principales

### Publicas

| Ruta | Descripcion |
| --- | --- |
| `/` | Pagina de inicio |
| `/login` | Inicio de sesion |
| `/registro` | Registro de jugador o administrador |

### Jugador

| Ruta | Descripcion |
| --- | --- |
| `/jugador` | Resumen del jugador |
| `/jugador/disponibilidad` | Consulta de horarios |
| `/jugador/reservar` | Proceso de reserva |
| `/jugador/comprobante` | Carga de comprobante |
| `/jugador/confirmacion` | Confirmacion de reserva |

### Administrador

| Ruta | Descripcion |
| --- | --- |
| `/admin` | Resumen administrativo |
| `/admin/onboarding` | Registro inicial del complejo |
| `/admin/canchas` | Gestion de canchas |
| `/admin/precios` | Reglas de precios |
| `/admin/reservas` | Gestion de reservas |
| `/admin/pagos` | Validacion de pagos |
| `/admin/extras` | Inventario de extras |
| `/admin/reportes` | Reportes |

### Soporte

| Ruta | Descripcion |
| --- | --- |
| `/soporte` | Monitoreo de incidencias |

## Estructura

```text
luxxito-sports/
|-- public/                 # Archivos servidos sin procesamiento
|-- src/
|   |-- assets/             # Imagenes importadas por React/Vite
|   |-- components/         # Componentes compartidos y shadcn/ui
|   |-- context/            # Estado global de autenticacion
|   |-- data/               # Datos simulados
|   |-- hooks/              # Hooks reutilizables
|   |-- lib/                # Utilidades
|   |-- pages/
|   |   |-- admin/          # Pantallas administrativas
|   |   |-- jugador/        # Pantallas del jugador
|   |   `-- soporte/        # Pantallas de soporte
|   |-- test/               # Configuracion y pruebas
|   |-- App.tsx             # Enrutamiento y proteccion por roles
|   `-- main.tsx            # Punto de entrada
|-- package.json
|-- tailwind.config.ts
|-- vite.config.ts
`-- vitest.config.ts
```

## Imagenes

Para imagenes que forman parte de los componentes, guardalas en `src/assets` e
importalas:

```tsx
import cancha from "@/assets/cancha.jpg";

export function Cancha() {
  return <img src={cancha} alt="Cancha deportiva" />;
}
```

Para archivos publicos que no necesitan procesamiento de Vite, guardalos en
`public` y usa una ruta absoluta:

```tsx
<img src="/imagen.jpg" alt="Descripcion de la imagen" />
```

La imagen principal de la portada se encuentra en
`src/assets/hero-field.jpg`.

## Comandos

| Comando | Accion |
| --- | --- |
| `npm run dev` | Inicia el servidor local |
| `npm run build` | Genera la version de produccion en `dist/` |
| `npm run preview` | Previsualiza la compilacion |
| `npm run lint` | Ejecuta ESLint |
| `npm run test` | Ejecuta las pruebas una vez |
| `npm run test:watch` | Ejecuta las pruebas en modo observacion |

Para una instalacion reproducible basada exactamente en `package-lock.json`:

```powershell
npm ci
```

## Estado actual

- La interfaz utiliza datos de prueba definidos en `src/data/mock.ts`.
- El login y el registro no realizan peticiones HTTP.
- Las contrasenas no se almacenan ni se validan.
- TanStack Query esta configurado, pero todavia no consume una API.
- Los cambios realizados sobre reservas, pagos o inventario no son persistentes.

Antes de usar el sistema en produccion sera necesario implementar y conectar
un backend, autenticacion segura, persistencia de datos y validaciones del
servidor.

## Compilacion para produccion

```powershell
npm run build
npm run preview
```

El contenido generado se almacena en `dist/`. Este directorio es un artefacto
de compilacion y no debe editarse manualmente.
