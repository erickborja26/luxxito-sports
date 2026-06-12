from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    CourtViewSet,
    ExtraViewSet,
    HoldViewSet,
    IncomeReportView,
    IncidentViewSet,
    KPIReportView,
    LuxxitoTokenView,
    MaintenanceClosureViewSet,
    MeView,
    OccupancyReportView,
    PaymentViewSet,
    PriceRuleViewSet,
    RegistrationView,
    ReservationViewSet,
    SportViewSet,
    SportsComplexViewSet,
    SupportMetricsView,
)


router = DefaultRouter()
router.register("deportes", SportViewSet, basename="deporte")
router.register("complejos", SportsComplexViewSet, basename="complejo")
router.register("canchas", CourtViewSet, basename="cancha")
router.register("reglas-precio", PriceRuleViewSet, basename="regla-precio")
router.register("extras", ExtraViewSet, basename="extra")
router.register("bloqueos", HoldViewSet, basename="bloqueo")
router.register("reservas", ReservationViewSet, basename="reserva")
router.register("pagos", PaymentViewSet, basename="pago")
router.register("cierres", MaintenanceClosureViewSet, basename="cierre")
router.register("soporte/incidencias", IncidentViewSet, basename="incidencia")

urlpatterns = [
    path("auth/registro/", RegistrationView.as_view(), name="registro"),
    path("auth/token/", LuxxitoTokenView.as_view(), name="token"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("auth/me/", MeView.as_view(), name="me"),
    path("reportes/kpis/", KPIReportView.as_view(), name="report-kpis"),
    path("reportes/ocupacion/", OccupancyReportView.as_view(), name="report-occupancy"),
    path("reportes/ingresos/", IncomeReportView.as_view(), name="report-income"),
    path("soporte/metricas/", SupportMetricsView.as_view(), name="support-metrics"),
    path("", include(router.urls)),
]
