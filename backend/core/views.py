from datetime import datetime, time, timedelta
from decimal import Decimal

from django.db.models import Count, DecimalField, ExpressionWrapper, F, Sum
from django.db.models.functions import Coalesce
from django.utils import timezone
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .exceptions import ConflictError
from .models import (
    Court,
    Extra,
    Hold,
    Incident,
    MaintenanceClosure,
    OpeningSchedule,
    Payment,
    PriceRule,
    Reservation,
    Sport,
    SportsComplex,
    User,
)
from .permissions import IsAdministrator, IsPlayer, IsSupport
from .serializers import (
    ClosureSerializer,
    CourtSerializer,
    ExtraSerializer,
    HoldCreateSerializer,
    HoldSerializer,
    IncidentSerializer,
    LuxxitoTokenSerializer,
    OpeningScheduleSerializer,
    PaymentCreateSerializer,
    PaymentSerializer,
    PriceRuleSerializer,
    ProofUploadSerializer,
    RegistrationSerializer,
    ReservationCreateSerializer,
    ReservationSerializer,
    SportSerializer,
    SportsComplexSerializer,
    UserSerializer,
)
from .services import PaymentService, PricingService, ReservationService, ranges_overlap


def administrator_complexes(user):
    if user.role != User.Role.ADMIN or not hasattr(user, "administrator"):
        return SportsComplex.objects.none()
    return user.administrator.complexes.all()


def ensure_admin_owns(user, complex_obj):
    if not administrator_complexes(user).filter(pk=complex_obj.pk).exists():
        raise PermissionDenied("No administra este complejo.")


class LuxxitoTokenView(TokenObtainPairView):
    serializer_class = LuxxitoTokenSerializer
    permission_classes = [AllowAny]


class RegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class MeView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)


class SportViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Sport.objects.all()
    serializer_class = SportSerializer
    permission_classes = [AllowAny]
    pagination_class = None


class SportsComplexViewSet(viewsets.ModelViewSet):
    serializer_class = SportsComplexSerializer
    filterset_fields = ["city", "active"]
    search_fields = ["name", "address", "city"]

    def get_queryset(self):
        queryset = SportsComplex.objects.select_related("administrator").prefetch_related(
            "schedules"
        )
        if (
            self.action in ["list", "retrieve"]
            and self.request.user.is_authenticated
            and self.request.user.role == User.Role.ADMIN
        ):
            return queryset.filter(pk__in=administrator_complexes(self.request.user))
        if self.action in ["list", "retrieve"]:
            return queryset.filter(active=True)
        return queryset.filter(pk__in=administrator_complexes(self.request.user))

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAdministrator()]

    def perform_create(self, serializer):
        if not hasattr(self.request.user, "administrator"):
            raise PermissionDenied("La cuenta no tiene perfil de administrador.")
        serializer.save(administrator=self.request.user.administrator)

    @action(detail=True, methods=["put"], url_path="horarios")
    def schedules(self, request, pk=None):
        complex_obj = self.get_object()
        serializer = OpeningScheduleSerializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        rows = serializer.validated_data
        weekdays = [row["weekday"] for row in rows]
        if len(weekdays) != len(set(weekdays)):
            raise ValidationError("No repita dias de la semana.")
        for row in rows:
            OpeningSchedule.objects.update_or_create(
                complex=complex_obj,
                weekday=row["weekday"],
                defaults={
                    "enabled": row["enabled"],
                    "opens_at": row["opens_at"],
                    "closes_at": row["closes_at"],
                },
            )
        data = OpeningScheduleSerializer(
            complex_obj.schedules.order_by("weekday"), many=True
        ).data
        return Response(data)


class CourtViewSet(viewsets.ModelViewSet):
    serializer_class = CourtSerializer
    filterset_fields = ["complex", "sport", "active"]
    search_fields = ["name", "complex__name", "sport__name"]

    def get_queryset(self):
        queryset = Court.objects.select_related("complex", "sport")
        if (
            self.action in ["list", "retrieve"]
            and self.request.user.is_authenticated
            and self.request.user.role == User.Role.ADMIN
        ):
            return queryset.filter(complex__in=administrator_complexes(self.request.user))
        if self.action in ["list", "retrieve", "disponibilidad"]:
            return queryset.filter(active=True, complex__active=True)
        return queryset.filter(complex__in=administrator_complexes(self.request.user))

    def get_permissions(self):
        if self.action in ["list", "retrieve", "disponibilidad"]:
            return [AllowAny()]
        return [IsAdministrator()]

    def perform_create(self, serializer):
        complex_obj = serializer.validated_data["complex"]
        ensure_admin_owns(self.request.user, complex_obj)
        serializer.save()

    def perform_update(self, serializer):
        complex_obj = serializer.validated_data.get("complex", self.get_object().complex)
        ensure_admin_owns(self.request.user, complex_obj)
        serializer.save()

    def perform_destroy(self, instance):
        instance.active = False
        instance.save(update_fields=["active"])

    @action(detail=False, methods=["get"], permission_classes=[AllowAny])
    def disponibilidad(self, request):
        complex_id = request.query_params.get("complejo_id")
        date_value = request.query_params.get("fecha")
        if not complex_id or not date_value:
            raise ValidationError("complejo_id y fecha son obligatorios.")
        try:
            selected_date = datetime.strptime(date_value, "%Y-%m-%d").date()
        except ValueError as exc:
            raise ValidationError({"fecha": "Use el formato YYYY-MM-DD."}) from exc

        queryset = self.get_queryset().filter(complex_id=complex_id)
        sport_id = request.query_params.get("deporte_id")
        if sport_id:
            queryset = queryset.filter(sport_id=sport_id)
        hour_from = request.query_params.get("hora_desde", "08:00")
        try:
            start_hour = datetime.strptime(hour_from, "%H:%M").time()
        except ValueError as exc:
            raise ValidationError({"hora_desde": "Use el formato HH:MM."}) from exc

        ReservationService.expire_stale_holds()
        results = []
        for court in queryset:
            schedule = court.complex.schedules.filter(
                weekday=selected_date.isoweekday()
            ).first()
            opens_at = schedule.opens_at if schedule and schedule.enabled else time(8, 0)
            closes_at = schedule.closes_at if schedule and schedule.enabled else time(22, 0)
            if schedule and not schedule.enabled:
                slots = []
            else:
                cursor = datetime.combine(selected_date, max(opens_at, start_hour))
                close_dt = datetime.combine(selected_date, closes_at)
                slots = []
                while cursor + timedelta(hours=1) <= close_dt:
                    slot_start = cursor.time()
                    slot_end = (cursor + timedelta(hours=1)).time()
                    state = "LIBRE"
                    if MaintenanceClosure.objects.filter(
                        court=court, date=selected_date
                    ).filter(ranges_overlap(slot_start, slot_end)).exists():
                        state = "MANTENIMIENTO"
                    elif Reservation.objects.filter(
                        court=court,
                        scheduled_date=selected_date,
                        status__in=[
                            Reservation.Status.CONFIRMED,
                            Reservation.Status.PENDING,
                        ],
                    ).filter(ranges_overlap(slot_start, slot_end)).exists():
                        state = "RESERVADO"
                    elif Hold.objects.filter(
                        court=court,
                        date=selected_date,
                        status=Hold.Status.ACTIVE,
                        expires_at__gt=timezone.now(),
                    ).filter(ranges_overlap(slot_start, slot_end)).exists():
                        state = "BLOQUEADO"
                    slots.append(
                        {
                            "hora_inicio": slot_start.strftime("%H:%M"),
                            "hora_fin": slot_end.strftime("%H:%M"),
                            "estado": state,
                            "precio": str(
                                PricingService.court_price(
                                    court, selected_date, slot_start, slot_end
                                )
                            ),
                        }
                    )
                    cursor += timedelta(hours=1)
            results.append(
                {
                    "cancha_id": court.id,
                    "cancha": court.name,
                    "deporte": court.sport.name,
                    "slots": slots,
                }
            )
        return Response({"fecha": selected_date, "resultados": results})

    @action(detail=True, methods=["post"], url_path="cierres")
    def closures(self, request, pk=None):
        court = self.get_object()
        serializer = ClosureSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        has_reservation = Reservation.objects.filter(
            court=court,
            scheduled_date=data["date"],
            status=Reservation.Status.CONFIRMED,
        ).filter(ranges_overlap(data["starts_at"], data["ends_at"])).exists()
        if has_reservation:
            raise ConflictError(
                "Existe una reserva confirmada en ese horario.",
                code="CIERRE_CON_RESERVA",
            )
        closure = serializer.save(court=court, created_by=request.user)
        return Response(ClosureSerializer(closure).data, status=status.HTTP_201_CREATED)


class PriceRuleViewSet(viewsets.ModelViewSet):
    serializer_class = PriceRuleSerializer
    permission_classes = [IsAdministrator]

    def get_queryset(self):
        return PriceRule.objects.select_related("court").filter(
            court__complex__in=administrator_complexes(self.request.user)
        )

    def perform_create(self, serializer):
        ensure_admin_owns(self.request.user, serializer.validated_data["court"].complex)
        serializer.save()


class MaintenanceClosureViewSet(viewsets.ModelViewSet):
    serializer_class = ClosureSerializer
    permission_classes = [IsAdministrator]
    http_method_names = ["get", "delete", "head", "options"]

    def get_queryset(self):
        return MaintenanceClosure.objects.select_related("court").filter(
            court__complex__in=administrator_complexes(self.request.user)
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ExtraViewSet(viewsets.ModelViewSet):
    serializer_class = ExtraSerializer

    def get_queryset(self):
        queryset = Extra.objects.select_related("complex")
        if self.request.user.role == User.Role.ADMIN:
            return queryset.filter(complex__in=administrator_complexes(self.request.user))
        return queryset.filter(active=True, status=Extra.Status.OPERATIONAL, stock__gt=0)

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated()]
        return [IsAdministrator()]

    def perform_create(self, serializer):
        ensure_admin_owns(self.request.user, serializer.validated_data["complex"])
        serializer.save()

    def perform_destroy(self, instance):
        instance.active = False
        instance.save(update_fields=["active"])


class HoldViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsPlayer]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "reservations"

    def get_queryset(self):
        if not hasattr(self.request.user, "player"):
            return Hold.objects.none()
        return Hold.objects.select_related("court").filter(player=self.request.user.player)

    def get_serializer_class(self):
        return HoldCreateSerializer if self.action == "create" else HoldSerializer

    def create(self, request, *args, **kwargs):
        serializer = HoldCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        hold = ReservationService.create_hold(
            player=request.user.player,
            court_id=data["cancha_id"],
            date=data["fecha"],
            starts_at=data["hora_inicio"],
            ends_at=data["hora_fin"],
            extras=data["extras"],
        )
        return Response(HoldSerializer(hold).data, status=status.HTTP_201_CREATED)

    def retrieve(self, request, *args, **kwargs):
        hold = self.get_object()
        if hold.is_expired:
            hold.status = Hold.Status.EXPIRED
            hold.save(update_fields=["status"])
        return Response(HoldSerializer(hold).data)

    def perform_destroy(self, instance):
        if instance.status != Hold.Status.ACTIVE:
            raise ConflictError("El bloqueo ya no esta activo.", code="BLOQUEO_NO_ACTIVO")
        instance.status = Hold.Status.CANCELLED
        instance.save(update_fields=["status"])


class ReservationViewSet(viewsets.ModelViewSet):
    serializer_class = ReservationSerializer
    http_method_names = ["get", "post", "head", "options"]
    filterset_fields = ["status", "scheduled_date", "court"]
    search_fields = ["code", "player__full_name", "court__name"]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "reservations"

    def get_queryset(self):
        queryset = Reservation.objects.select_related(
            "player__user", "court__complex", "payment", "hold"
        )
        user = self.request.user
        if user.role == User.Role.PLAYER and hasattr(user, "player"):
            return queryset.filter(player=user.player)
        if user.role == User.Role.ADMIN:
            return queryset.filter(court__complex__in=administrator_complexes(user))
        if user.role == User.Role.SUPPORT:
            return queryset
        return queryset.none()

    def get_permissions(self):
        if self.action == "create":
            return [IsPlayer()]
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        serializer = ReservationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reservation = ReservationService.create_reservation(
            request.user.player, serializer.validated_data["bloqueo_id"]
        )
        return Response(
            ReservationSerializer(reservation, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"])
    def cancelar(self, request, pk=None):
        reservation = self.get_object()
        reason = str(request.data.get("motivo", "")).strip()
        if not reason:
            raise ValidationError({"motivo": "El motivo es obligatorio."})
        if (
            request.user.role == User.Role.PLAYER
            and reservation.player_id != request.user.player.id
        ):
            raise PermissionDenied()
        reservation = ReservationService.cancel_reservation(reservation, reason)
        return Response(ReservationSerializer(reservation).data)

    @action(
        detail=True,
        methods=["post"],
        throttle_classes=[ScopedRateThrottle],
        throttle_scope="payments",
    )
    def pagos(self, request, pk=None):
        reservation = self.get_object()
        if request.user.role != User.Role.PLAYER:
            raise PermissionDenied()
        serializer = PaymentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        payment = PaymentService.create_payment(
            reservation=reservation,
            method=data["metodo"],
            amount=data["monto_pagado"],
            reference=data.get("referencia", ""),
        )
        return Response(PaymentSerializer(payment).data, status=status.HTTP_201_CREATED)

    @action(
        detail=True,
        methods=["post"],
        parser_classes=[MultiPartParser, FormParser],
        throttle_classes=[ScopedRateThrottle],
        throttle_scope="payments",
    )
    def comprobante(self, request, pk=None):
        reservation = self.get_object()
        if request.user.role != User.Role.PLAYER:
            raise PermissionDenied()
        serializer = ProofUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        proof = serializer.validated_data["comprobante"]
        if proof.size > 5 * 1024 * 1024:
            raise ValidationError({"comprobante": "El archivo no puede superar 5 MB."})
        data = serializer.validated_data
        payment = PaymentService.attach_proof(
            reservation=reservation,
            method=data["metodo"],
            amount=data["monto_pagado"],
            reference=data.get("referencia", ""),
            proof=proof,
        )
        return Response(PaymentSerializer(payment).data, status=status.HTTP_201_CREATED)


class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [IsAdministrator]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "payments"

    def get_queryset(self):
        return Payment.objects.select_related(
            "reservation__player", "reservation__court__complex"
        ).filter(
            reservation__court__complex__in=administrator_complexes(self.request.user)
        )

    @action(detail=False, methods=["get"])
    def pendientes(self, request):
        queryset = self.filter_queryset(
            self.get_queryset().filter(status=Payment.Status.PENDING)
        )
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page or queryset, many=True)
        return self.get_paginated_response(serializer.data) if page is not None else Response(
            serializer.data
        )

    @action(detail=True, methods=["post"])
    def aprobar(self, request, pk=None):
        payment = PaymentService.approve(self.get_object())
        return Response(self.get_serializer(payment).data)

    @action(detail=True, methods=["post"])
    def rechazar(self, request, pk=None):
        reason = str(request.data.get("motivo", "")).strip()
        if len(reason) < 8:
            raise ValidationError({"motivo": "Debe tener al menos 8 caracteres."})
        payment = PaymentService.reject(self.get_object(), reason)
        return Response(self.get_serializer(payment).data)

    @action(detail=True, methods=["post"])
    def reembolsar(self, request, pk=None):
        payment = PaymentService.refund(self.get_object())
        return Response(self.get_serializer(payment).data)


class ReportBaseView(APIView):
    permission_classes = [IsAdministrator]

    def date_range(self, request):
        today = timezone.localdate()
        try:
            date_from = datetime.strptime(
                request.query_params.get("desde", str(today.replace(day=1))), "%Y-%m-%d"
            ).date()
            date_to = datetime.strptime(
                request.query_params.get("hasta", str(today)), "%Y-%m-%d"
            ).date()
        except ValueError as exc:
            raise ValidationError("Use fechas YYYY-MM-DD.") from exc
        if date_from > date_to:
            raise ValidationError("La fecha desde no puede superar a hasta.")
        return date_from, date_to

    def reservations(self, request):
        date_from, date_to = self.date_range(request)
        return Reservation.objects.filter(
            court__complex__in=administrator_complexes(request.user),
            scheduled_date__range=(date_from, date_to),
        )


class KPIReportView(ReportBaseView):
    def get(self, request):
        queryset = self.reservations(request)
        confirmed = queryset.filter(status=Reservation.Status.CONFIRMED)
        income = Payment.objects.filter(
            reservation__in=queryset, status=Payment.Status.APPROVED
        ).aggregate(total=Coalesce(Sum("amount"), Decimal("0")))["total"]
        total = queryset.count()
        cancelled = queryset.filter(status=Reservation.Status.CANCELLED).count()
        return Response(
            {
                "reservas_totales": total,
                "reservas_confirmadas": confirmed.count(),
                "ingresos": income,
                "tasa_cancelacion": round((cancelled / total * 100), 2) if total else 0,
            }
        )


class OccupancyReportView(ReportBaseView):
    def get(self, request):
        rows = (
            self.reservations(request)
            .filter(status=Reservation.Status.CONFIRMED)
            .values("court_id", "court__name")
            .annotate(reservas=Count("id"))
            .order_by("-reservas")
        )
        return Response(list(rows))


class IncomeReportView(ReportBaseView):
    def get(self, request):
        date_from, date_to = self.date_range(request)
        rows = (
            Payment.objects.filter(
                reservation__court__complex__in=administrator_complexes(request.user),
                reservation__scheduled_date__range=(date_from, date_to),
                status=Payment.Status.APPROVED,
            )
            .values("reservation__scheduled_date")
            .annotate(ingresos=Sum("amount"))
            .order_by("reservation__scheduled_date")
        )
        return Response(list(rows))


class IncidentViewSet(viewsets.ModelViewSet):
    serializer_class = IncidentSerializer
    permission_classes = [IsSupport]
    queryset = Incident.objects.all()
    filterset_fields = ["status", "severity"]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, assigned_to=self.request.user)


class SupportMetricsView(APIView):
    permission_classes = [IsSupport]

    def get(self, request):
        expired_24h = Hold.objects.filter(
            status=Hold.Status.EXPIRED,
            expires_at__gte=timezone.now() - timedelta(hours=24),
        ).count()
        return Response(
            {
                "api": {"estado": "OPERATIVO"},
                "base_datos": {"estado": "OPERATIVO"},
                "colas": {"estado": "EAGER_O_REDIS"},
                "bloqueos_expirados_24h": expired_24h,
                "incidencias_abiertas": Incident.objects.exclude(
                    status=Incident.Status.RESOLVED
                ).count(),
            }
        )
