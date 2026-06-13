from rest_framework.exceptions import APIException
from rest_framework.views import exception_handler


class ConflictError(APIException):
    status_code = 409
    default_code = "CONFLICTO"
    default_detail = "La operacion entra en conflicto con el estado actual."

    def __init__(self, detail=None, code=None):
        self.api_code = code or self.default_code
        super().__init__(detail=detail, code=code)


def api_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return response

    code = getattr(exc, "api_code", getattr(exc, "default_code", "ERROR"))
    detail = response.data
    if isinstance(detail, dict) and set(detail.keys()) == {"detail"}:
        detail = detail["detail"]

    response.data = {
        "codigo": str(code).upper(),
        "detalle": detail,
    }
    return response
