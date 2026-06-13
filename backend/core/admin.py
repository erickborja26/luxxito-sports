from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

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


@admin.register(User)
class LuxxitoUserAdmin(UserAdmin):
    ordering = ("email",)
    list_display = ("email", "role", "is_active", "is_staff")
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Acceso", {"fields": ("role", "is_active", "is_staff", "is_superuser")}),
        ("Permisos", {"fields": ("groups", "user_permissions")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "role", "password1", "password2"),
            },
        ),
    )
    search_fields = ("email",)


admin.site.register(
    [
        PlayerProfile,
        AdminProfile,
        SportsComplex,
        Sport,
        Court,
        OpeningSchedule,
        PriceRule,
        MaintenanceClosure,
        Extra,
        Hold,
        Reservation,
        Payment,
        Incident,
    ]
)
