# Backend de LuxxitoSports

API REST implementada con Django, Django REST Framework, JWT, PostgreSQL,
Celery y Redis. En desarrollo puede ejecutarse con SQLite y tareas Celery
sincronas, sin instalar servicios externos.

## Inicio rapido

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

La API queda disponible en `http://127.0.0.1:8000/api/`.

Usuarios de demostracion:

| Rol | Correo | Password |
| --- | --- | --- |
| Administrador | `admin@luxxito.test` | `Demo1234!` |
| Jugador | `jugador@luxxito.test` | `Demo1234!` |
| Soporte | `soporte@luxxito.test` | `Demo1234!` |

## PostgreSQL y Redis

Copia `.env.example` a `.env` y exporta sus variables en el entorno. Django
usa PostgreSQL cuando `POSTGRES_DB` esta definido; de lo contrario usa SQLite.

Para procesamiento asincrono real:

```powershell
$env:CELERY_TASK_ALWAYS_EAGER="0"
celery -A config worker -l info
celery -A config beat -l info
```

Tambien puede levantarse la infraestructura completa desde la raiz:

```powershell
docker compose up --build
docker compose exec api python manage.py seed_demo
```

## Validacion

```powershell
python manage.py check
python manage.py test
```

El contrato funcional completo esta documentado en
[`../docs/endpoints.md`](../docs/endpoints.md).
