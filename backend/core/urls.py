from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, LoginView, ComplaintsView,
    UpdateStatusView, DeleteComplaintView,
    ChangePasswordView, AdminStatsView,
)

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('complaints/', ComplaintsView.as_view()),
    path('complaints/<int:id>/status/', UpdateStatusView.as_view()),
    path('complaints/<int:id>/delete/', DeleteComplaintView.as_view()),
    path('change-password/', ChangePasswordView.as_view()),
    path('admin/stats/', AdminStatsView.as_view()),
]
