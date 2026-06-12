from datetime import datetime, timedelta
from decimal import Decimal

from django.core.mail import send_mail
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from .exceptions import ConflictError
from .models import (
    Court,
    Extra,
    Hold,
    HoldExtra,
    MaintenanceClosure,
    Payment,
    PriceRule,
    Reservation,
    ReservationExtra,
)


def ranges_overlap(starts_at, ends_at):
    return Q(starts_at__lt=ends_at, ends_at__gt=starts_at)


class PricingService:
    @staticmethod
    def hourly_rate(court, date, starts_at, ends_at):
        rules = PriceRule.objects.filter(
            court=court,
            weekday=date.isoweekday(),
            active=True,
            starts_at__lte=starts_at,
            ends_at__gte=ends_at,
        ).order_by("-hourly_rate")
        rule = rules.first()
        return rule.hourly_rate if rule else court.standard_rate

    @classmethod
    def court_price(cls, court, date, starts_at, ends_at):
        start_dt = datetime.combine(date, starts_at)
        end_dt = datetime.combine(date, ends_at)
        duration = Decimal(str((end_dt - start_dt).total_seconds() / 3600))
        return (cls.hourly_rate(court, date, starts_at, ends_at) * duration).quantize(
            Decimal("0.01")
        )


class ReservationService:
    @staticmethod
    def expire_stale_holds():
        now = timezone.now()
        stale = Hold.objects.filter(status=Hold.Status.ACTIVE, expires_at__lte=now)
        hold_ids = list(stale.values_list("id", flat=True))
        stale.update(status=Hold.Status.EXPIRED)
        Reservation.objects.filter(
            hold_id__in=hold_ids, status=Reservation.Status.PENDING
        ).update(status=Reservation.Status.EXPIRED)
        return len(hold_ids)

    @staticmethod
    def _assert_slot_available(
        court,
        date,
        starts_at,
        ends_at,
        exclude_hold=None,
        exclude_reservation=None,
    ):
        active_holds = Hold.objects.filter(
            court=court,
            date=date,
            status=Hold.Status.ACTIVE,
            expires_at__gt=timezone.now(),
        ).filter(ranges_overlap(starts_at, ends_at))
        if exclude_hold:
            active_holds = active_holds.exclude(pk=exclude_hold.pk)
        confirmed = Reservation.objects.filter(
            court=court,
            scheduled_date=date,
            status__in=[Reservation.Status.CONFIRMED, Reservation.Status.PENDING],
        ).filter(ranges_overlap(starts_at, ends_at))
        if exclude_reservation:
            confirmed = confirmed.exclude(pk=exclude_reservation.pk)
        closures = MaintenanceClosure.objects.filter(court=court, date=date).filter(
            ranges_overlap(starts_at, ends_at)
        )
        if active_holds.exists() or confirmed.exists() or closures.exists():
            raise ConflictError(
                "La cancha ya tiene un bloqueo, reserva o cierre en ese horario.",
                code="HORARIO_NO_DISPONIBLE",
            )

    @classmethod
    @transaction.atomic
    def create_hold(cls, player, court_id, date, starts_at, ends_at, extras):
        cls.expire_stale_holds()
        court = (
            Court.objects.select_for_update()
            .select_related("complex")
            .get(pk=court_id, active=True, complex__active=True)
        )
        if date < timezone.localdate():
            raise ValidationError({"fecha": "No se puede bloquear una fecha pasada."})
        if starts_at >= ends_at:
            raise ValidationError({"hora_fin": "Debe ser posterior a la hora de inicio."})

        schedule = court.complex.schedules.filter(weekday=date.isoweekday()).first()
        if schedule and (
            not schedule.enabled
            or starts_at < schedule.opens_at
            or ends_at > schedule.closes_at
        ):
            raise ConflictError(
                "El horario esta fuera de la atencion del complejo.",
                code="FUERA_DE_HORARIO",
            )

        cls._assert_slot_available(court, date, starts_at, ends_at)
        court_price = PricingService.court_price(court, date, starts_at, ends_at)
        selected = []
        extras_total = Decimal("0")

        for item in extras:
            extra = Extra.objects.select_for_update().get(
                pk=item["extra_id"],
                complex=court.complex,
                active=True,
                status=Extra.Status.OPERATIONAL,
            )
            quantity = item["cantidad"]
            if quantity < 1 or quantity > extra.stock:
                raise ConflictError(
                    f"Stock insuficiente para {extra.name}.",
                    code="STOCK_INSUFICIENTE",
                )
            selected.append((extra, quantity))
            extras_total += extra.unit_price * quantity

        hold = Hold.objects.create(
            court=court,
            player=player,
            date=date,
            starts_at=starts_at,
            ends_at=ends_at,
            court_price=court_price,
            total_price=court_price + extras_total,
        )
        HoldExtra.objects.bulk_create(
            [
                HoldExtra(
                    hold=hold,
                    extra=extra,
                    quantity=quantity,
                    unit_price=extra.unit_price,
                )
                for extra, quantity in selected
            ]
        )
        return hold

    @classmethod
    @transaction.atomic
    def create_reservation(cls, player, hold_id):
        hold = (
            Hold.objects.select_for_update()
            .select_related("court", "player")
            .get(pk=hold_id, player=player)
        )
        if hold.is_expired:
            hold.status = Hold.Status.EXPIRED
            hold.save(update_fields=["status"])
        if hold.status != Hold.Status.ACTIVE:
            raise ConflictError(
                "El bloqueo ya no esta activo.", code="BLOQUEO_NO_ACTIVO"
            )
        if hasattr(hold, "reservation"):
            return hold.reservation

        reservation = Reservation.objects.create(
            hold=hold,
            player=player,
            court=hold.court,
            scheduled_date=hold.date,
            starts_at=hold.starts_at,
            ends_at=hold.ends_at,
            total_price=hold.total_price,
        )
        ReservationExtra.objects.bulk_create(
            [
                ReservationExtra(
                    reservation=reservation,
                    extra=item.extra,
                    quantity=item.quantity,
                    unit_price=item.unit_price,
                )
                for item in hold.selected_extras.select_related("extra")
            ]
        )
        return reservation

    @classmethod
    @transaction.atomic
    def cancel_reservation(cls, reservation, reason):
        reservation = Reservation.objects.select_for_update().get(pk=reservation.pk)
        if reservation.status in [
            Reservation.Status.CANCELLED,
            Reservation.Status.EXPIRED,
        ]:
            raise ConflictError(
                "La reserva ya no puede cancelarse.", code="RESERVA_NO_CANCELABLE"
            )

        starts = timezone.make_aware(
            datetime.combine(reservation.scheduled_date, reservation.starts_at)
        )
        reservation.status = Reservation.Status.CANCELLED
        reservation.cancellation_reason = reason
        reservation.refund_eligible = starts - timezone.now() >= timedelta(hours=24)
        reservation.save(
            update_fields=[
                "status",
                "cancellation_reason",
                "refund_eligible",
                "updated_at",
            ]
        )
        if reservation.hold.status == Hold.Status.ACTIVE:
            reservation.hold.status = Hold.Status.CANCELLED
            reservation.hold.save(update_fields=["status"])
        return reservation


class PaymentService:
    @staticmethod
    def _validate_amount(reservation, amount):
        if amount != reservation.total_price:
            raise ValidationError(
                {"monto_pagado": "El monto debe coincidir con el total de la reserva."}
            )

    @classmethod
    @transaction.atomic
    def create_payment(cls, reservation, method, amount, reference=""):
        reservation = Reservation.objects.select_for_update().get(pk=reservation.pk)
        if reservation.status != Reservation.Status.PENDING:
            raise ConflictError(
                "La reserva no admite un nuevo pago.", code="PAGO_NO_PERMITIDO"
            )
        if reservation.hold.is_expired:
            reservation.status = Reservation.Status.EXPIRED
            reservation.save(update_fields=["status", "updated_at"])
            raise ConflictError("El bloqueo expiro.", code="BLOQUEO_EXPIRADO")
        cls._validate_amount(reservation, amount)
        payment, created = Payment.objects.get_or_create(
            reservation=reservation,
            defaults={
                "method": method,
                "amount": amount,
                "reference": reference,
            },
        )
        if not created and payment.status != Payment.Status.FAILED:
            raise ConflictError(
                "La reserva ya tiene un pago.", code="PAGO_DUPLICADO"
            )
        if not created:
            payment.method = method
            payment.amount = amount
            payment.reference = reference
            payment.status = Payment.Status.PENDING
            payment.rejection_reason = ""
            payment.proof = ""
            payment.save(
                update_fields=[
                    "method",
                    "amount",
                    "reference",
                    "status",
                    "rejection_reason",
                    "proof",
                    "updated_at",
                ]
            )
        if method == Payment.Method.CARD:
            payment = cls.approve(payment)
        return payment

    @classmethod
    @transaction.atomic
    def attach_proof(cls, reservation, method, amount, reference, proof):
        if method not in [Payment.Method.TRANSFER, Payment.Method.WALLET]:
            raise ValidationError({"metodo": "El comprobante requiere pago manual."})
        payment = cls.create_payment(reservation, method, amount, reference)
        payment.proof = proof
        payment.save(update_fields=["proof", "updated_at"])
        return payment

    @classmethod
    @transaction.atomic
    def approve(cls, payment):
        payment = Payment.objects.select_for_update().select_related(
            "reservation__hold", "reservation__player__user"
        ).get(pk=payment.pk)
        reservation = payment.reservation
        ReservationService._assert_slot_available(
            reservation.court,
            reservation.scheduled_date,
            reservation.starts_at,
            reservation.ends_at,
            exclude_hold=reservation.hold,
            exclude_reservation=reservation,
        )
        cls._validate_amount(reservation, payment.amount)
        payment.status = Payment.Status.APPROVED
        payment.rejection_reason = ""
        payment.paid_at = timezone.now()
        payment.save(
            update_fields=["status", "rejection_reason", "paid_at", "updated_at"]
        )
        reservation.status = Reservation.Status.CONFIRMED
        reservation.save(update_fields=["status", "updated_at"])
        reservation.hold.status = Hold.Status.CONVERTED
        reservation.hold.save(update_fields=["status"])
        reservation.player.ranking_points += 25
        reservation.player.save(update_fields=["ranking_points"])
        NotificationService.reservation_confirmed(reservation)
        return payment

    @staticmethod
    @transaction.atomic
    def reject(payment, reason):
        payment = Payment.objects.select_for_update().select_related(
            "reservation"
        ).get(pk=payment.pk)
        if payment.status != Payment.Status.PENDING:
            raise ConflictError("El pago ya fue procesado.", code="PAGO_PROCESADO")
        payment.status = Payment.Status.FAILED
        payment.rejection_reason = reason
        payment.save(update_fields=["status", "rejection_reason", "updated_at"])
        return payment

    @staticmethod
    @transaction.atomic
    def refund(payment):
        payment = Payment.objects.select_for_update().select_related(
            "reservation"
        ).get(pk=payment.pk)
        if payment.status != Payment.Status.APPROVED:
            raise ConflictError(
                "Solo se reembolsan pagos aprobados.", code="REEMBOLSO_NO_PERMITIDO"
            )
        if not payment.reservation.refund_eligible:
            raise ConflictError(
                "La reserva no cumple la anticipacion minima.",
                code="REEMBOLSO_NO_ELEGIBLE",
            )
        payment.status = Payment.Status.REFUNDED
        payment.save(update_fields=["status", "updated_at"])
        return payment


class NotificationService:
    @staticmethod
    def reservation_confirmed(reservation):
        send_mail(
            subject=f"Reserva {reservation.code} confirmada",
            message=(
                f"Tu reserva en {reservation.court.name} para "
                f"{reservation.scheduled_date} a las {reservation.starts_at} fue confirmada."
            ),
            from_email=None,
            recipient_list=[reservation.player.user.email],
            fail_silently=True,
        )
