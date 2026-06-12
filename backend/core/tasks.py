from celery import shared_task

from .services import ReservationService


@shared_task
def expire_holds():
    return ReservationService.expire_stale_holds()
