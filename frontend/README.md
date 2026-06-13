# Frontend de LuxxitoSports

Aplicacion React 18, TypeScript y Vite conectada a la API Django de
LuxxitoSports.

## Requisitos

- Node.js 18 o superior
- npm 9 o superior
- Backend disponible en `http://127.0.0.1:8000`

## Ejecucion

```powershell
cd frontend
npm install
npm run dev
```

La interfaz queda disponible en `http://localhost:8080`.

La URL de la API puede configurarse en `frontend/.env`:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

## Autenticacion

El frontend obtiene tokens JWT desde `/api/auth/token/`. Los tokens se
mantienen en memoria y no se guardan en `localStorage`. Al recargar la pagina
es necesario iniciar sesion nuevamente.

Usuarios artificiales creados por `python manage.py seed_demo`:

| Rol | Correo | Password |
| --- | --- | --- |
| Administrador | `admin@luxxito.test` | `Demo1234!` |
| Jugador | `jugador@luxxito.test` | `Demo1234!` |
| Soporte | `soporte@luxxito.test` | `Demo1234!` |

Se acepta cualquier correo valido, sin restriccion de dominio.

## Comandos

```powershell
npm run dev
npm run build
npm run lint
npm run test
npm run test:watch
```
