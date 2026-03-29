from django.urls import path
from .views import health_check, profile , create_complaint, list_complaints


urlpatterns = [
    path('health/', health_check),
    path('profile/', profile),
    path('complaints/', list_complaints),
    path('complaints/create/', create_complaint),
]

