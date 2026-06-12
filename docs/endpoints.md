# Endpoints de la API

## Convenciones

- Base URL: `/api`
- Formato: `application/json`
- Autenticacion: `Authorization: Bearer <access_token>`
- Fechas y horas: ISO 8601
- Paginacion recomendada: `?page=1&page_size=20`
- Roles: `JUGADOR`, `ADMINISTRADOR`, `SOPORTE`

El documento de diseno define explicitamente
`GET /api/canchas/disponibilidad`. Los demas endpoints de este archivo
completan el contrato REST necesario para los casos de uso y modulos descritos.

## Autenticacion

| Metodo | Ruta | Acceso | Proposito |
| --- | --- | --- | --- |
| POST | `/auth/registro/` | Publico | Crear cuenta y perfil |
| POST | `/auth/token/` | Publico | Obtener tokens JWT |
| POST | `/auth/token/refresh/` | Publico | Renovar access token |
| GET | `/auth/me/` | Autenticado | Consultar cuenta y rol |

## Catalogos y complejos

| Metodo | Ruta | Acceso | Proposito |
| --- | --- | --- | --- |
| GET | `/deportes/` | Publico | Listar deportes |
| GET | `/complejos/` | Publico | Listar complejos activos |
| POST | `/complejos/` | Administrador | Registrar complejo |
| GET | `/complejos/{id}/` | Publico | Ver detalle |
| PATCH | `/complejos/{id}/` | Administrador propietario | Actualizar complejo |

## Canchas y disponibilidad

| Metodo | Ruta | Acceso | Proposito |
| --- | --- | --- | --- |
| GET | `/canchas/` | Publico | Listar y filtrar canchas |
| POST | `/canchas/` | Administrador | Registrar cancha |
| GET | `/canchas/{id}/` | Publico | Ver detalle |
| PATCH | `/canchas/{id}/` | Administrador propietario | Actualizar cancha |
| DELETE | `/canchas/{id}/` | Administrador propietario | Desactivar cancha |
| GET | `/canchas/disponibilidad/` | Publico | Consultar slots y precios |
| POST | `/canchas/{id}/cierres/` | Administrador propietario | Bloquear por mantenimiento |

Consulta de disponibilidad:

```http
GET /api/canchas/disponibilidad/?complejo_id=<uuid>&deporte_id=1&fecha=2026-06-20&hora_desde=18:00
```

```json
{
  "fecha": "2026-06-20",
  "resultados": [
    {
      "cancha_id": "uuid",
      "cancha": "Cancha 1",
      "slots": [
        {
          "hora_inicio": "18:00",
          "hora_fin": "19:00",
          "estado": "LIBRE",
          "precio": "120.00"
        }
      ]
    }
  ]
}
```

## Precios y extras

| Metodo | Ruta | Acceso | Proposito |
| --- | --- | --- | --- |
| GET | `/reglas-precio/` | Administrador propietario | Listar reglas |
| POST | `/reglas-precio/` | Administrador propietario | Crear regla |
| PATCH | `/reglas-precio/{id}/` | Administrador propietario | Actualizar regla |
| DELETE | `/reglas-precio/{id}/` | Administrador propietario | Eliminar regla |
| GET | `/extras/` | Autenticado | Listar extras disponibles |
| POST | `/extras/` | Administrador propietario | Registrar extra |
| PATCH | `/extras/{id}/` | Administrador propietario | Actualizar stock o estado |
| DELETE | `/extras/{id}/` | Administrador propietario | Desactivar extra |

## Bloqueos y reservas

| Metodo | Ruta | Acceso | Proposito |
| --- | --- | --- | --- |
| POST | `/bloqueos/` | Jugador | Separar horario por 20 minutos |
| GET | `/bloqueos/{id}/` | Jugador propietario | Consultar tiempo restante |
| DELETE | `/bloqueos/{id}/` | Jugador propietario | Liberar horario |
| GET | `/reservas/` | Autenticado | Listar reservas segun rol |
| POST | `/reservas/` | Jugador | Crear reserva desde un bloqueo |
| GET | `/reservas/{id}/` | Propietario o administrador | Ver detalle |
| POST | `/reservas/{id}/cancelar/` | Propietario o administrador | Cancelar y evaluar reembolso |

Creacion de bloqueo:

```json
{
  "cancha_id": "uuid",
  "fecha": "2026-06-20",
  "hora_inicio": "18:00",
  "hora_fin": "19:00",
  "extras": [
    { "extra_id": "uuid", "cantidad": 1 }
  ]
}
```

La respuesta debe incluir `id_bloqueo`, `expira_en`, precio calculado y total.
Si existe un cruce activo, la API responde `409 Conflict`.

## Pagos

| Metodo | Ruta | Acceso | Proposito |
| --- | --- | --- | --- |
| POST | `/reservas/{id}/pagos/` | Jugador propietario | Iniciar pago |
| POST | `/reservas/{id}/comprobante/` | Jugador propietario | Subir comprobante manual |
| GET | `/pagos/pendientes/` | Administrador propietario | Listar comprobantes |
| POST | `/pagos/{id}/aprobar/` | Administrador propietario | Aprobar comprobante |
| POST | `/pagos/{id}/rechazar/` | Administrador propietario | Rechazar con motivo |
| POST | `/pagos/{id}/reembolsar/` | Administrador | Registrar reembolso |

La carga de comprobante usa `multipart/form-data` y debe validar tipo, tamano,
monto y referencia de operacion.

## Reportes y soporte

| Metodo | Ruta | Acceso | Proposito |
| --- | --- | --- | --- |
| GET | `/reportes/kpis/` | Administrador propietario | Ocupacion, ingresos y cancelaciones |
| GET | `/reportes/ocupacion/` | Administrador propietario | Ocupacion por cancha y periodo |
| GET | `/reportes/ingresos/` | Administrador propietario | Ingresos por periodo |
| GET | `/soporte/incidencias/` | Soporte | Listar incidencias |
| POST | `/soporte/incidencias/` | Soporte | Registrar incidencia |
| PATCH | `/soporte/incidencias/{id}/` | Soporte | Actualizar estado |
| GET | `/soporte/metricas/` | Soporte | Salud de API, BD y colas |

## Errores

```json
{
  "codigo": "HORARIO_NO_DISPONIBLE",
  "detalle": "La cancha ya tiene un bloqueo o reserva en ese horario."
}
```

Codigos esperados: `400`, `401`, `403`, `404`, `409`, `422`, `429` y `500`.

