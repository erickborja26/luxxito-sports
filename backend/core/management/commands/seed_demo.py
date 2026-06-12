from datetime import time, timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from core.models import (
    AdminProfile,
    Court,
    Extra,
    Incident,
    OpeningSchedule,
    PlayerProfile,
    PriceRule,
    Hold,
    Payment,
    Reservation,
    Sport,
    SportsComplex,
    User,
)


class Command(BaseCommand):
    help = "Crea usuarios y catalogos de demostracion de LuxxitoSports."

    @transaction.atomic
    def handle(self, *args, **options):
        admin_user, _ = User.objects.get_or_create(
            email="admin@luxxito.test",
            defaults={"role": User.Role.ADMIN},
        )
        admin_user.set_password("Demo1234!")
        admin_user.save()
        admin_profile, _ = AdminProfile.objects.get_or_create(
            user=admin_user,
            defaults={
                "tax_id": "20123456789",
                "business_name": "Luxxito San Borja",
                "phone": "999111222",
                "verified": True,
            },
        )

        player_user, _ = User.objects.get_or_create(
            email="jugador@luxxito.test",
            defaults={"role": User.Role.PLAYER},
        )
        player_user.set_password("Demo1234!")
        player_user.save()
        PlayerProfile.objects.get_or_create(
            user=player_user,
            defaults={"full_name": "Carlos Perez", "phone": "999333444"},
        )

        support_user, _ = User.objects.get_or_create(
            email="soporte@luxxito.test",
            defaults={"role": User.Role.SUPPORT, "is_staff": True},
        )
        support_user.set_password("Demo1234!")
        support_user.save()

        complex_obj, _ = SportsComplex.objects.get_or_create(
            administrator=admin_profile,
            name="Luxxito San Borja",
            defaults={
                "address": "Av. Aviacion 2500",
                "city": "Lima",
                "active": True,
            },
        )
        for weekday in range(1, 8):
            OpeningSchedule.objects.update_or_create(
                complex=complex_obj,
                weekday=weekday,
                defaults={
                    "enabled": True,
                    "opens_at": time(8, 0),
                    "closes_at": time(22, 0),
                },
            )

        sports = {}
        for name in ["Futbol", "Tenis", "Padel", "Basquet", "Voley"]:
            sports[name], _ = Sport.objects.get_or_create(name=name)

        court, _ = Court.objects.get_or_create(
            complex=complex_obj,
            name="Cancha 1",
            defaults={
                "sport": sports["Futbol"],
                "surface": Court.Surface.SYNTHETIC,
                "covered": True,
                "lighting": True,
                "standard_rate": Decimal("120.00"),
            },
        )
        court_two, _ = Court.objects.get_or_create(
            complex=complex_obj,
            name="Cancha 2",
            defaults={
                "sport": sports["Futbol"],
                "surface": Court.Surface.GRASS,
                "covered": False,
                "lighting": True,
                "standard_rate": Decimal("100.00"),
            },
        )
        padel, _ = Court.objects.get_or_create(
            complex=complex_obj,
            name="Padel A",
            defaults={
                "sport": sports["Padel"],
                "surface": Court.Surface.GLASS,
                "covered": True,
                "lighting": True,
                "standard_rate": Decimal("80.00"),
            },
        )
        PriceRule.objects.get_or_create(
            court=court,
            name="Hora pico nocturna",
            weekday=5,
            starts_at=time(18, 0),
            ends_at=time(22, 0),
            defaults={"hourly_rate": Decimal("160.00"), "active": True},
        )
        Extra.objects.get_or_create(
            complex=complex_obj,
            name="Pelota de futbol",
            defaults={
                "type": "Pelota",
                "stock": 8,
                "status": Extra.Status.OPERATIONAL,
                "unit_price": Decimal("10.00"),
            },
        )
        Extra.objects.get_or_create(
            complex=complex_obj,
            name="Set de chalecos x10",
            defaults={
                "type": "Indumentaria",
                "stock": 4,
                "status": Extra.Status.OPERATIONAL,
                "unit_price": Decimal("15.00"),
            },
        )
        Extra.objects.get_or_create(
            complex=complex_obj,
            name="Arbitro profesional",
            defaults={
                "type": "Servicio",
                "stock": 2,
                "status": Extra.Status.OPERATIONAL,
                "unit_price": Decimal("80.00"),
            },
        )
        Extra.objects.get_or_create(
            complex=complex_obj,
            name="Raqueta de padel",
            defaults={
                "type": "Equipo",
                "stock": 3,
                "status": Extra.Status.DAMAGED,
                "unit_price": Decimal("20.00"),
            },
        )

        player = player_user.player
        today = timezone.localdate()
        demo_rows = [
            (court, today + timedelta(days=1), time(19), time(20), Reservation.Status.CONFIRMED, Payment.Status.APPROVED, Payment.Method.CARD),
            (padel, today + timedelta(days=2), time(20), time(21), Reservation.Status.PENDING, Payment.Status.PENDING, Payment.Method.WALLET),
            (court_two, today - timedelta(days=5), time(17), time(18), Reservation.Status.CANCELLED, Payment.Status.REFUNDED, Payment.Method.TRANSFER),
        ]
        for index, (demo_court, date, starts, ends, reservation_status, payment_status, method) in enumerate(demo_rows, 1):
            hold, _ = Hold.objects.get_or_create(
                court=demo_court,
                player=player,
                date=date,
                starts_at=starts,
                ends_at=ends,
                defaults={
                    "status": Hold.Status.CONVERTED,
                    "court_price": demo_court.standard_rate,
                    "total_price": demo_court.standard_rate,
                    "expires_at": timezone.now() + timedelta(minutes=20),
                },
            )
            reservation, _ = Reservation.objects.get_or_create(
                hold=hold,
                defaults={
                    "player": player,
                    "court": demo_court,
                    "scheduled_date": date,
                    "starts_at": starts,
                    "ends_at": ends,
                    "status": reservation_status,
                    "total_price": demo_court.standard_rate,
                    "cancellation_reason": "Cambio de planes" if reservation_status == Reservation.Status.CANCELLED else "",
                    "refund_eligible": reservation_status == Reservation.Status.CANCELLED,
                },
            )
            Payment.objects.get_or_create(
                reservation=reservation,
                defaults={
                    "method": method,
                    "reference": f"DEMO-{index:03d}",
                    "amount": reservation.total_price,
                    "status": payment_status,
                    "paid_at": timezone.now() if payment_status != Payment.Status.PENDING else None,
                },
            )
        Incident.objects.get_or_create(
            title="Latencia alta en checkout",
            defaults={
                "description": "P95 supera 800 ms en el endpoint de reservas.",
                "severity": Incident.Severity.HIGH,
                "status": Incident.Status.OPEN,
                "created_by": support_user,
                "assigned_to": support_user,
            },
        )
        self.stdout.write(self.style.SUCCESS("Datos demo creados."))
        self.stdout.write("Usuarios: admin, jugador y soporte @luxxito.test")
        self.stdout.write("Password comun: Demo1234!")
