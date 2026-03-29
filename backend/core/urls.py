from django.urls import path
from .views import health_check, profile , create_complaint, list_complaints , update_complaint_status , register , add_remark , get_remarks


urlpatterns = [
    path('health/', health_check),
    path('profile/', profile),
    path('complaints/', list_complaints),
    path('complaints/create/', create_complaint),
    path('complaints/<int:id>/status/', update_complaint_status),
    path('auth/register/', register),
    path('complaints/<int:complaint_id>/remarks/', get_remarks),
    path('complaints/<int:complaint_id>/remarks/add/', add_remark),
]

