from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    AddRemarkView, RegisterView, LoginView, ComplaintsView,
    UpdateStatusView, DeleteComplaintView,
    ChangePasswordView, AdminStatsView,
    CommentsView, NotificationsView,
)

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('complaints/', ComplaintsView.as_view()),
    path('complaints/<int:id>/status/', UpdateStatusView.as_view()),
    path('complaints/<int:id>/delete/', DeleteComplaintView.as_view()),
    path('complaints/<int:id>/comments/', CommentsView.as_view()),
    path('change-password/', ChangePasswordView.as_view()),
    path('stats/', AdminStatsView.as_view()),
    path('notifications/', NotificationsView.as_view()),
    path('complaints/<int:complaint_id>/remark/', AddRemarkView.as_view()),
]
