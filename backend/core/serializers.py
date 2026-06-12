from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import (
    AdminProfile,
    Court,
    Extra,
    Hold,
    Incident,
    MaintenanceClosure,
    OpeningSchedule,
    Payment,
    PlayerProfile,
    PriceRule,
    Reservation,
    Sport,
    SportsComplex,
    User,
)


class LuxxitoTokenSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["email"] = user.email
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["usuario"] = UserSerializer(self.user).data
        return data


class RegistrationSerializer(serializers.Serializer):
    correo = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    rol = serializers.ChoiceField(choices=User.Role.choices)
    nombre_completo = serializers.CharField(max_length=150, required=False)
    telefono = serializers.CharField(max_length=15, required=False, allow_blank=True)
    ruc_dni = serializers.CharField(max_length=11, required=False)
    nombre_comercial = serializers.CharField(max_length=150, required=False)

    def validate_correo(self, value):
        value = value.lower()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Ya existe una cuenta con este correo.")
        return value

    def validate_password(self, value):
        validate_password(value)
        return value

    def validate(self, attrs):
        if attrs["rol"] == User.Role.PLAYER and not attrs.get("nombre_completo"):
            raise serializers.ValidationError(
                {"nombre_completo": "Este campo es obligatorio para jugadores."}
            )
        if attrs["rol"] == User.Role.ADMIN:
            required = ["ruc_dni", "nombre_comercial"]
            missing = [field for field in required if not attrs.get(field)]
            if missing:
                raise serializers.ValidationError(
                    {field: "Este campo es obligatorio." for field in missing}
                )
        if attrs["rol"] == User.Role.SUPPORT:
            raise serializers.ValidationError(
                {"rol": "Las cuentas de soporte solo se crean desde administracion."}
            )
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        role = validated_data["rol"]
        user = User.objects.create_user(
            email=validated_data["correo"],
            password=validated_data["password"],
            role=role,
        )
        if role == User.Role.PLAYER:
            PlayerProfile.objects.create(
                user=user,
                full_name=validated_data["nombre_completo"],
                phone=validated_data.get("telefono", ""),
            )
        else:
            AdminProfile.objects.create(
                user=user,
                tax_id=validated_data["ruc_dni"],
                business_name=validated_data["nombre_comercial"],
                phone=validated_data.get("telefono", ""),
            )
        return user


class UserSerializer(serializers.ModelSerializer):
    correo = serializers.EmailField(source="email")
    rol = serializers.CharField(source="role")
    nombre = serializers.SerializerMethodField()
    telefono = serializers.SerializerMethodField()
    scoring = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "correo", "rol", "nombre", "telefono", "scoring"]

    def get_nombre(self, obj):
        if obj.role == User.Role.PLAYER and hasattr(obj, "player"):
            return obj.player.full_name
        if obj.role == User.Role.ADMIN and hasattr(obj, "administrator"):
            return obj.administrator.business_name
        return obj.get_full_name() or obj.email

    def get_telefono(self, obj):
        profile = getattr(obj, "player", None) or getattr(obj, "administrator", None)
        return getattr(profile, "phone", "")

    def get_scoring(self, obj):
        return obj.player.scoring if hasattr(obj, "player") else None


class SportSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(source="name")

    class Meta:
        model = Sport
        fields = ["id", "nombre"]


class OpeningScheduleSerializer(serializers.ModelSerializer):
    dia_semana = serializers.IntegerField(source="weekday")
    habilitado = serializers.BooleanField(source="enabled")
    hora_apertura = serializers.TimeField(source="opens_at")
    hora_cierre = serializers.TimeField(source="closes_at")

    class Meta:
        model = OpeningSchedule
        fields = ["id", "dia_semana", "habilitado", "hora_apertura", "hora_cierre"]

    def validate(self, attrs):
        if attrs["opens_at"] >= attrs["closes_at"]:
            raise serializers.ValidationError(
                {"hora_cierre": "Debe ser posterior a la hora de apertura."}
            )
        return attrs


class SportsComplexSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(source="name")
    direccion = serializers.CharField(source="address")
    ciudad = serializers.CharField(source="city")
    activo = serializers.BooleanField(source="active", required=False)
    administrador = serializers.CharField(
        source="administrator.business_name", read_only=True
    )
    horarios = OpeningScheduleSerializer(source="schedules", many=True, read_only=True)

    class Meta:
        model = SportsComplex
        fields = [
            "id",
            "nombre",
            "direccion",
            "ciudad",
            "latitude",
            "longitude",
            "activo",
            "administrador",
            "horarios",
        ]


class CourtSerializer(serializers.ModelSerializer):
    complejo_id = serializers.PrimaryKeyRelatedField(
        source="complex", queryset=SportsComplex.objects.all()
    )
    deporte_id = serializers.PrimaryKeyRelatedField(
        source="sport", queryset=Sport.objects.all()
    )
    complejo = serializers.CharField(source="complex.name", read_only=True)
    deporte = serializers.CharField(source="sport.name", read_only=True)
    nombre = serializers.CharField(source="name")
    tipo_superficie = serializers.ChoiceField(source="surface", choices=Court.Surface.choices)
    techada = serializers.BooleanField(source="covered", required=False)
    iluminacion = serializers.BooleanField(source="lighting", required=False)
    tarifa_estandar = serializers.DecimalField(
        source="standard_rate", max_digits=10, decimal_places=2
    )
    activa = serializers.BooleanField(source="active", required=False)

    class Meta:
        model = Court
        fields = [
            "id",
            "complejo_id",
            "complejo",
            "deporte_id",
            "deporte",
            "nombre",
            "tipo_superficie",
            "techada",
            "iluminacion",
            "tarifa_estandar",
            "activa",
        ]


class PriceRuleSerializer(serializers.ModelSerializer):
    cancha_id = serializers.PrimaryKeyRelatedField(
        source="court", queryset=Court.objects.all()
    )
    nombre = serializers.CharField(source="name")
    dia_semana = serializers.IntegerField(source="weekday")
    hora_inicio = serializers.TimeField(source="starts_at")
    hora_fin = serializers.TimeField(source="ends_at")
    monto_hora = serializers.DecimalField(
        source="hourly_rate", max_digits=10, decimal_places=2
    )
    activa = serializers.BooleanField(source="active", required=False)

    class Meta:
        model = PriceRule
        fields = [
            "id",
            "cancha_id",
            "nombre",
            "dia_semana",
            "hora_inicio",
            "hora_fin",
            "monto_hora",
            "activa",
        ]

    def validate(self, attrs):
        court = attrs.get("court", getattr(self.instance, "court", None))
        weekday = attrs.get("weekday", getattr(self.instance, "weekday", None))
        starts_at = attrs.get("starts_at", getattr(self.instance, "starts_at", None))
        ends_at = attrs.get("ends_at", getattr(self.instance, "ends_at", None))
        if starts_at and ends_at and starts_at >= ends_at:
            raise serializers.ValidationError(
                {"hora_fin": "Debe ser posterior a la hora de inicio."}
            )
        rules = PriceRule.objects.filter(
            court=court,
            weekday=weekday,
            active=True,
            starts_at__lt=ends_at,
            ends_at__gt=starts_at,
        )
        if self.instance:
            rules = rules.exclude(pk=self.instance.pk)
        if rules.exists():
            raise serializers.ValidationError(
                "Ya existe una regla activa que se cruza con ese horario."
            )
        return attrs


class ExtraSerializer(serializers.ModelSerializer):
    complejo_id = serializers.PrimaryKeyRelatedField(
        source="complex", queryset=SportsComplex.objects.all()
    )
    nombre = serializers.CharField(source="name")
    tipo = serializers.CharField(source="type")
    cantidad = serializers.IntegerField(source="stock")
    estado = serializers.ChoiceField(source="status", choices=Extra.Status.choices)
    precio = serializers.DecimalField(
        source="unit_price", max_digits=10, decimal_places=2
    )
    activo = serializers.BooleanField(source="active", required=False)

    class Meta:
        model = Extra
        fields = [
            "id",
            "complejo_id",
            "nombre",
            "tipo",
            "cantidad",
            "estado",
            "precio",
            "activo",
        ]


class ClosureSerializer(serializers.ModelSerializer):
    cancha_id = serializers.UUIDField(source="court_id", read_only=True)
    fecha = serializers.DateField(source="date")
    hora_inicio = serializers.TimeField(source="starts_at")
    hora_fin = serializers.TimeField(source="ends_at")
    motivo = serializers.CharField(source="reason")

    class Meta:
        model = MaintenanceClosure
        fields = ["id", "cancha_id", "fecha", "hora_inicio", "hora_fin", "motivo", "created_at"]
        read_only_fields = ["created_at"]

    def validate(self, attrs):
        if attrs["starts_at"] >= attrs["ends_at"]:
            raise serializers.ValidationError(
                {"hora_fin": "Debe ser posterior a la hora de inicio."}
            )
        return attrs


class HoldExtraInputSerializer(serializers.Serializer):
    extra_id = serializers.UUIDField()
    cantidad = serializers.IntegerField(min_value=1)


class HoldCreateSerializer(serializers.Serializer):
    cancha_id = serializers.UUIDField()
    fecha = serializers.DateField()
    hora_inicio = serializers.TimeField()
    hora_fin = serializers.TimeField()
    extras = HoldExtraInputSerializer(many=True, required=False, default=list)

    def validate_extras(self, value):
        ids = [item["extra_id"] for item in value]
        if len(ids) != len(set(ids)):
            raise serializers.ValidationError("No repita el mismo extra.")
        return value


class HoldSerializer(serializers.ModelSerializer):
    id_bloqueo = serializers.UUIDField(source="id")
    cancha_id = serializers.UUIDField(source="court_id")
    fecha = serializers.DateField(source="date")
    hora_inicio = serializers.TimeField(source="starts_at")
    hora_fin = serializers.TimeField(source="ends_at")
    estado = serializers.CharField(source="status")
    precio_cancha = serializers.DecimalField(
        source="court_price", max_digits=10, decimal_places=2
    )
    total = serializers.DecimalField(source="total_price", max_digits=10, decimal_places=2)
    expira_en = serializers.DateTimeField(source="expires_at")
    extras = serializers.SerializerMethodField()

    class Meta:
        model = Hold
        fields = [
            "id_bloqueo",
            "cancha_id",
            "fecha",
            "hora_inicio",
            "hora_fin",
            "estado",
            "precio_cancha",
            "extras",
            "total",
            "expira_en",
        ]

    def get_extras(self, obj):
        return [
            {
                "extra_id": item.extra_id,
                "nombre": item.extra.name,
                "cantidad": item.quantity,
                "precio_unitario": item.unit_price,
            }
            for item in obj.selected_extras.select_related("extra")
        ]


class ReservationCreateSerializer(serializers.Serializer):
    bloqueo_id = serializers.UUIDField()


class ReservationSerializer(serializers.ModelSerializer):
    codigo = serializers.CharField(source="code")
    jugador = serializers.CharField(source="player.full_name")
    cancha_id = serializers.UUIDField(source="court_id")
    cancha = serializers.CharField(source="court.name")
    complejo = serializers.CharField(source="court.complex.name")
    fecha_programada = serializers.DateField(source="scheduled_date")
    hora_inicio = serializers.TimeField(source="starts_at")
    hora_fin = serializers.TimeField(source="ends_at")
    estado = serializers.CharField(source="status")
    precio_total = serializers.DecimalField(
        source="total_price", max_digits=10, decimal_places=2
    )
    extras = serializers.SerializerMethodField()
    pago = serializers.SerializerMethodField()

    class Meta:
        model = Reservation
        fields = [
            "id",
            "codigo",
            "jugador",
            "cancha_id",
            "cancha",
            "complejo",
            "fecha_programada",
            "hora_inicio",
            "hora_fin",
            "estado",
            "precio_total",
            "extras",
            "pago",
            "refund_eligible",
            "created_at",
        ]

    def get_extras(self, obj):
        return [
            {
                "extra_id": item.extra_id,
                "nombre": item.extra.name,
                "cantidad": item.quantity,
                "precio_unitario": item.unit_price,
            }
            for item in obj.selected_extras.select_related("extra")
        ]

    def get_pago(self, obj):
        if not hasattr(obj, "payment"):
            return None
        return PaymentSerializer(obj.payment, context=self.context).data


class PaymentSerializer(serializers.ModelSerializer):
    reserva_id = serializers.UUIDField(source="reservation_id")
    jugador = serializers.CharField(source="reservation.player.full_name", read_only=True)
    monto_esperado = serializers.DecimalField(
        source="reservation.total_price",
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )
    metodo = serializers.CharField(source="method")
    referencia = serializers.CharField(source="reference")
    monto_pagado = serializers.DecimalField(
        source="amount", max_digits=10, decimal_places=2
    )
    estado = serializers.CharField(source="status")
    comprobante = serializers.ImageField(source="proof")
    motivo_rechazo = serializers.CharField(source="rejection_reason")

    class Meta:
        model = Payment
        fields = [
            "id",
            "reserva_id",
            "jugador",
            "monto_esperado",
            "metodo",
            "referencia",
            "monto_pagado",
            "estado",
            "comprobante",
            "motivo_rechazo",
            "paid_at",
            "created_at",
        ]


class PaymentCreateSerializer(serializers.Serializer):
    metodo = serializers.ChoiceField(choices=Payment.Method.choices)
    referencia = serializers.CharField(max_length=255, required=False, allow_blank=True)
    monto_pagado = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0)


class ProofUploadSerializer(PaymentCreateSerializer):
    comprobante = serializers.ImageField()


class IncidentSerializer(serializers.ModelSerializer):
    titulo = serializers.CharField(source="title")
    descripcion = serializers.CharField(source="description")
    estado = serializers.ChoiceField(source="status", choices=Incident.Status.choices)
    severidad = serializers.ChoiceField(
        source="severity", choices=Incident.Severity.choices
    )
    comentario_resolucion = serializers.CharField(
        source="resolution_comment", required=False, allow_blank=True
    )

    class Meta:
        model = Incident
        fields = [
            "id",
            "titulo",
            "descripcion",
            "estado",
            "severidad",
            "comentario_resolucion",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]
