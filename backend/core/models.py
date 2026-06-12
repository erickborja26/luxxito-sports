import uuid
from datetime import timedelta
from decimal import Decimal

from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractUser
from django.core.validators import FileExtensionValidator, MinValueValidator
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("El correo es obligatorio.")
        email = self.normalize_email(email).lower()
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", User.Role.SUPPORT)
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    class Role(models.TextChoices):
        PLAYER = "JUGADOR", "Jugador"
        ADMIN = "ADMINISTRADOR", "Administrador"
        SUPPORT = "SOPORTE", "Soporte"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = None
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Role.choices)
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []
    objects = UserManager()

    class Meta:
        db_table = "cuenta"
        ordering = ["-created_at"]

    def __str__(self):
        return self.email


class PlayerProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="player")
    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=15, blank=True)
    ranking_points = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "jugador"

    @property
    def scoring(self):
        if self.ranking_points >= 1000:
            return "VIP"
        if self.ranking_points >= 200:
            return "FRECUENTE"
        return "NUEVO"

    def __str__(self):
        return self.full_name


class AdminProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="administrator")
    tax_id = models.CharField(max_length=11, unique=True)
    business_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=15, blank=True)
    verified = models.BooleanField(default=False)

    class Meta:
        db_table = "administrador"

    def __str__(self):
        return self.business_name


class SportsComplex(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    administrator = models.ForeignKey(
        AdminProfile, on_delete=models.PROTECT, related_name="complexes"
    )
    name = models.CharField(max_length=150)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "complejo_deportivo"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Sport(models.Model):
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        db_table = "deporte"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Court(models.Model):
    class Surface(models.TextChoices):
        SYNTHETIC = "SINTETICO", "Sintetico"
        GRASS = "GRASS", "Grass"
        PARQUET = "PARQUET", "Parquet"
        CONCRETE = "CEMENTO", "Cemento"
        CLAY = "ARCILLA", "Arcilla"
        GLASS = "CRISTAL", "Cristal"
        OTHER = "OTRO", "Otro"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    complex = models.ForeignKey(
        SportsComplex, on_delete=models.PROTECT, related_name="courts"
    )
    sport = models.ForeignKey(Sport, on_delete=models.PROTECT, related_name="courts")
    name = models.CharField(max_length=100)
    surface = models.CharField(max_length=30, choices=Surface.choices)
    covered = models.BooleanField(default=False)
    lighting = models.BooleanField(default=False)
    standard_rate = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    active = models.BooleanField(default=True)

    class Meta:
        db_table = "cancha"
        ordering = ["complex__name", "name"]
        indexes = [models.Index(fields=["complex", "sport"])]
        constraints = [
            models.UniqueConstraint(
                fields=["complex", "name"], name="uq_court_name_per_complex"
            )
        ]

    def __str__(self):
        return f"{self.complex.name} - {self.name}"


class OpeningSchedule(models.Model):
    complex = models.ForeignKey(
        SportsComplex, on_delete=models.CASCADE, related_name="schedules"
    )
    weekday = models.PositiveSmallIntegerField()
    enabled = models.BooleanField(default=True)
    opens_at = models.TimeField(default="08:00")
    closes_at = models.TimeField(default="22:00")

    class Meta:
        db_table = "horario_complejo"
        constraints = [
            models.UniqueConstraint(
                fields=["complex", "weekday"], name="uq_schedule_complex_day"
            ),
            models.CheckConstraint(
                condition=models.Q(weekday__gte=1, weekday__lte=7),
                name="ck_schedule_weekday",
            ),
            models.CheckConstraint(
                condition=models.Q(closes_at__gt=models.F("opens_at")),
                name="ck_schedule_hours",
            ),
        ]


class PriceRule(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    court = models.ForeignKey(Court, on_delete=models.CASCADE, related_name="price_rules")
    name = models.CharField(max_length=100)
    weekday = models.PositiveSmallIntegerField()
    starts_at = models.TimeField()
    ends_at = models.TimeField()
    hourly_rate = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    active = models.BooleanField(default=True)

    class Meta:
        db_table = "regla_precio"
        ordering = ["court", "weekday", "starts_at"]
        indexes = [models.Index(fields=["court", "weekday"])]
        constraints = [
            models.UniqueConstraint(
                fields=["court", "weekday", "starts_at", "ends_at"],
                name="uq_price_rule_range",
            ),
            models.CheckConstraint(
                condition=models.Q(weekday__gte=1, weekday__lte=7),
                name="ck_price_rule_weekday",
            ),
            models.CheckConstraint(
                condition=models.Q(ends_at__gt=models.F("starts_at")),
                name="ck_price_rule_hours",
            ),
        ]


class MaintenanceClosure(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    court = models.ForeignKey(
        Court, on_delete=models.CASCADE, related_name="maintenance_closures"
    )
    date = models.DateField()
    starts_at = models.TimeField()
    ends_at = models.TimeField()
    reason = models.CharField(max_length=255)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "cierre_cancha"
        indexes = [models.Index(fields=["court", "date"])]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(ends_at__gt=models.F("starts_at")),
                name="ck_closure_hours",
            )
        ]


class Extra(models.Model):
    class Status(models.TextChoices):
        OPERATIONAL = "OPERATIVO", "Operativo"
        DAMAGED = "DANADO", "Danado"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    complex = models.ForeignKey(
        SportsComplex, on_delete=models.CASCADE, related_name="extras"
    )
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=50)
    stock = models.PositiveIntegerField(default=0)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.OPERATIONAL
    )
    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0"))],
    )
    active = models.BooleanField(default=True)

    class Meta:
        db_table = "extra"
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                fields=["complex", "name"], name="uq_extra_name_per_complex"
            )
        ]


def default_hold_expiry():
    return timezone.now() + timedelta(minutes=20)


class Hold(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "ACTIVO", "Activo"
        EXPIRED = "EXPIRADO", "Expirado"
        CONVERTED = "CONVERTIDO", "Convertido"
        CANCELLED = "CANCELADO", "Cancelado"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    court = models.ForeignKey(Court, on_delete=models.PROTECT, related_name="holds")
    player = models.ForeignKey(
        PlayerProfile, on_delete=models.PROTECT, related_name="holds"
    )
    date = models.DateField()
    starts_at = models.TimeField()
    ends_at = models.TimeField()
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.ACTIVE
    )
    court_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(default=default_hold_expiry)

    class Meta:
        db_table = "bloqueo_horario"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["court", "date", "starts_at", "ends_at"]),
            models.Index(fields=["player", "status"]),
        ]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(ends_at__gt=models.F("starts_at")),
                name="ck_hold_hours",
            ),
            models.CheckConstraint(
                condition=models.Q(expires_at__gt=models.F("created_at")),
                name="ck_hold_expiry",
            ),
        ]

    @property
    def is_expired(self):
        return self.status == self.Status.ACTIVE and self.expires_at <= timezone.now()


class HoldExtra(models.Model):
    hold = models.ForeignKey(Hold, on_delete=models.CASCADE, related_name="selected_extras")
    extra = models.ForeignKey(Extra, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = "bloqueo_extra"
        constraints = [
            models.UniqueConstraint(fields=["hold", "extra"], name="uq_hold_extra")
        ]


class Reservation(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDIENTE", "Pendiente"
        CONFIRMED = "CONFIRMADA", "Confirmada"
        CANCELLED = "CANCELADA", "Cancelada"
        EXPIRED = "VENCIDA", "Vencida"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=20, unique=True, editable=False)
    hold = models.OneToOneField(
        Hold, on_delete=models.PROTECT, related_name="reservation"
    )
    player = models.ForeignKey(
        PlayerProfile, on_delete=models.PROTECT, related_name="reservations"
    )
    court = models.ForeignKey(Court, on_delete=models.PROTECT, related_name="reservations")
    scheduled_date = models.DateField()
    starts_at = models.TimeField()
    ends_at = models.TimeField()
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    cancellation_reason = models.TextField(blank=True)
    refund_eligible = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "ticket_reserva"
        ordering = ["-scheduled_date", "-starts_at"]
        indexes = [
            models.Index(fields=["court", "scheduled_date"]),
            models.Index(fields=["player", "scheduled_date"]),
            models.Index(fields=["status"]),
        ]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(ends_at__gt=models.F("starts_at")),
                name="ck_reservation_hours",
            ),
            models.CheckConstraint(
                condition=models.Q(total_price__gte=0),
                name="ck_reservation_total",
            ),
        ]

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = f"LX-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)


class ReservationExtra(models.Model):
    reservation = models.ForeignKey(
        Reservation, on_delete=models.CASCADE, related_name="selected_extras"
    )
    extra = models.ForeignKey(Extra, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = "reserva_extra"
        constraints = [
            models.UniqueConstraint(
                fields=["reservation", "extra"], name="uq_reservation_extra"
            )
        ]


class Payment(models.Model):
    class Method(models.TextChoices):
        CARD = "TARJETA", "Tarjeta"
        TRANSFER = "TRANSFERENCIA", "Transferencia"
        WALLET = "BILLETERA_DIGITAL", "Billetera digital"
        MANUAL = "VALIDACION_MANUAL", "Validacion manual"

    class Status(models.TextChoices):
        PENDING = "PENDIENTE", "Pendiente"
        APPROVED = "APROBADO", "Aprobado"
        FAILED = "FALLIDO", "Fallido"
        REFUNDED = "REEMBOLSADO", "Reembolsado"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reservation = models.OneToOneField(
        Reservation, on_delete=models.PROTECT, related_name="payment"
    )
    method = models.CharField(max_length=30, choices=Method.choices)
    reference = models.CharField(max_length=255, blank=True)
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0"))],
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )
    proof = models.ImageField(
        upload_to="payment_proofs/%Y/%m/",
        blank=True,
        validators=[FileExtensionValidator(["jpg", "jpeg", "png", "webp"])],
    )
    rejection_reason = models.TextField(blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "pago"
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["status"])]


class Incident(models.Model):
    class Status(models.TextChoices):
        OPEN = "ABIERTA", "Abierta"
        IN_PROGRESS = "EN_PROCESO", "En proceso"
        RESOLVED = "RESUELTA", "Resuelta"

    class Severity(models.TextChoices):
        LOW = "BAJA", "Baja"
        MEDIUM = "MEDIA", "Media"
        HIGH = "ALTA", "Alta"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=150)
    description = models.TextField()
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.OPEN
    )
    severity = models.CharField(max_length=10, choices=Severity.choices)
    resolution_comment = models.TextField(blank=True)
    created_by = models.ForeignKey(
        User, on_delete=models.PROTECT, related_name="created_incidents"
    )
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_incidents",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "incidencia"
        ordering = ["status", "-created_at"]
