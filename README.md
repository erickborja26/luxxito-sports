# LuxxitoSports

Sistema web para consultar disponibilidad, reservar canchas, gestionar pagos,
precios, inventario, reportes e incidencias.

## Estructura

```text
luxxito-sports/
|-- frontend/          React + TypeScript + Vite
|-- backend/           Django REST Framework
|-- docs/              Arquitectura, API y modelo de datos
`-- docker-compose.yml PostgreSQL, Redis, API y Celery
```

El frontend consume la API REST real. La autenticacion usa JWT en memoria y
los datos persistentes se almacenan en la base de datos del backend.

## Opcion recomendada: Docker

Requisitos:

- Docker Desktop
- Node.js 18 o superior
- npm 9 o superior

Desde la raiz del repositorio, inicia PostgreSQL, Redis, Django y Celery:

```powershell
docker compose up --build -d
docker compose exec api python manage.py seed_demo
```

Inicia el frontend en otra terminal:

```powershell
cd frontend
npm install
npm run dev
```

Servicios:

| Servicio | URL |
| --- | --- |
| Frontend | `http://localhost:8080` |
| API | `http://localhost:8000/api/` |
| Administracion Django | `http://localhost:8000/admin/` |

Para detener los contenedores:

```powershell
docker compose down
```

Para borrar tambien los datos de PostgreSQL:

```powershell
docker compose down -v
```

## Opcion sin Docker

El modo local usa SQLite y ejecuta las tareas Celery de forma sincrona.

Backend:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

Frontend, en otra terminal:

```powershell
cd frontend
npm install
npm run dev
```

Si la API usa otra URL, crea `frontend/.env`:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

## Usuarios de prueba

La orden `python manage.py seed_demo` es idempotente y crea datos artificiales:
complejos, canchas, deportes, horarios, extras, reglas de precio, reservas,
pagos e incidencias.

| Rol | Correo | Password |
| --- | --- | --- |
| Administrador | `admin@luxxito.test` | `Demo1234!` |
| Jugador | `jugador@luxxito.test` | `Demo1234!` |
| Soporte | `soporte@luxxito.test` | `Demo1234!` |

El inicio de sesion acepta cualquier direccion de correo valida; no esta
restringido a Gmail.

## Validacion

Backend:

```powershell
cd backend
.\.venv\Scripts\python.exe manage.py check
.\.venv\Scripts\python.exe manage.py test
```

Frontend:

```powershell
cd frontend
npm run build
npm run test
```

## Documentacion

- [Arquitectura](docs/arquitectura.md)
- [Endpoints](docs/endpoints.md)
- [Modelo de datos](docs/modelo_bd.md)
- [Backend](backend/README.md)
- [Frontend](frontend/README.md)
