from datetime import time, timedelta
from decimal import Decimal

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import (
    AdminProfile,
    Court,
    Extra,
    OpeningSchedule,
    Payment,
    PlayerProfile,
    PriceRule,
    Reservation,
    Sport,
    SportsComplex,
    User,
)


class ReservationFlowTests(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_user(
            email="admin@test.com", password="StrongPass123!", role=User.Role.ADMIN
        )
        self.admin_profile = AdminProfile.objects.create(
            user=self.admin_user,
            tax_id="20111111111",
            business_name="Complejo Test",
            verified=True,
        )
        self.player_user = User.objects.create_user(
            email="player@test.com", password="StrongPass123!", role=User.Role.PLAYER
        )
        self.player = PlayerProfile.objects.create(
            user=self.player_user, full_name="Jugador Test"
        )
        self.other_user = User.objects.create_user(
            email="other@test.com", password="StrongPass123!", role=User.Role.PLAYER
        )
        self.other_player = PlayerProfile.objects.create(
            user=self.other_user, full_name="Otro Jugador"
        )
        self.complex = SportsComplex.objects.create(
            administrator=self.admin_profile,
            name="Complejo Test",
            address="Direccion 123",
            city="Lima",
        )
        for weekday in range(1, 8):
            OpeningSchedule.objects.create(
                complex=self.complex,
                weekday=weekday,
                opens_at=time(8, 0),
                closes_at=time(22, 0),
            )
        self.sport = Sport.objects.create(name="Futbol")
        self.court = Court.objects.create(
            complex=self.complex,
            sport=self.sport,
            name="Cancha 1",
            surface=Court.Surface.SYNTHETIC,
            standard_rate=Decimal("100.00"),
        )
        self.extra = Extra.objects.create(
            complex=self.complex,
            name="Pelota",
            type="Equipo",
            stock=3,
            unit_price=Decimal("10.00"),
        )
        self.date = timezone.localdate() + timedelta(days=7)

    def create_hold(self, user=None):
        self.client.force_authenticate(user=user or self.player_user)
        return self.client.post(
            reverse("bloqueo-list"),
            {
                "cancha_id": self.court.id,
                "fecha": self.date,
                "hora_inicio": "18:00",
                "hora_fin": "19:00",
                "extras": [{"extra_id": self.extra.id, "cantidad": 1}],
            },
            format="json",
        )

    def test_dynamic_price_is_returned_in_availability(self):
        PriceRule.objects.create(
            court=self.court,
            name="Pico",
            weekday=self.date.isoweekday(),
            starts_at=time(18, 0),
            ends_at=time(20, 0),
            hourly_rate=Decimal("150.00"),
        )
        self.client.force_authenticate(user=None)
        response = self.client.get(
            reverse("cancha-disponibilidad"),
            {
                "complejo_id": self.complex.id,
                "fecha": self.date,
                "hora_desde": "18:00",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        first_slot = response.data["resultados"][0]["slots"][0]
        self.assertEqual(first_slot["estado"], "LIBRE")
        self.assertEqual(first_slot["precio"], "150.00")

    def test_overlapping_hold_returns_conflict(self):
        first = self.create_hold()
        self.assertEqual(first.status_code, status.HTTP_201_CREATED)
        second = self.create_hold(self.other_user)
        self.assertEqual(second.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(second.data["codigo"], "HORARIO_NO_DISPONIBLE")

    def test_card_payment_confirms_reservation(self):
        hold_response = self.create_hold()
        self.client.force_authenticate(user=self.player_user)
        reservation_response = self.client.post(
            reverse("reserva-list"),
            {"bloqueo_id": hold_response.data["id_bloqueo"]},
            format="json",
        )
        self.assertEqual(reservation_response.status_code, status.HTTP_201_CREATED)
        reservation_id = reservation_response.data["id"]
        payment_response = self.client.post(
            reverse("reserva-pagos", args=[reservation_id]),
            {
                "metodo": Payment.Method.CARD,
                "monto_pagado": "110.00",
                "referencia": "TEST-123",
            },
            format="json",
        )
        self.assertEqual(payment_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(payment_response.data["estado"], Payment.Status.APPROVED)
        reservation = Reservation.objects.get(pk=reservation_id)
        self.assertEqual(reservation.status, Reservation.Status.CONFIRMED)
        self.assertEqual(reservation.hold.status, reservation.hold.Status.CONVERTED)

    def test_admin_cannot_list_another_administrators_reservations(self):
        other_admin_user = User.objects.create_user(
            email="admin2@test.com", password="StrongPass123!", role=User.Role.ADMIN
        )
        AdminProfile.objects.create(
            user=other_admin_user,
            tax_id="20222222222",
            business_name="Otro Complejo",
            verified=True,
        )
        hold_response = self.create_hold()
        self.client.post(
            reverse("reserva-list"),
            {"bloqueo_id": hold_response.data["id_bloqueo"]},
            format="json",
        )
        self.client.force_authenticate(user=other_admin_user)
        response = self.client.get(reverse("reserva-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 0)


class AuthenticationTests(APITestCase):
    def test_registration_and_token_login(self):
        registration = self.client.post(
            reverse("registro"),
            {
                "correo": "newplayer@test.com",
                "password": "StrongPass123!",
                "rol": User.Role.PLAYER,
                "nombre_completo": "Nuevo Jugador",
            },
            format="json",
        )
        self.assertEqual(registration.status_code, status.HTTP_201_CREATED)
        token = self.client.post(
            reverse("token"),
            {"email": "newplayer@test.com", "password": "StrongPass123!"},
            format="json",
        )
        self.assertEqual(token.status_code, status.HTTP_200_OK)
        self.assertIn("access", token.data)
