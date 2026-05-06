from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings as django_settings

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from rest_framework_simplejwt.tokens import RefreshToken

from .models import Complaint, UserProfile, Comment, Notification
from .serializers import (
    RegisterSerializer, ComplaintSerializer,
    ComplaintCreateSerializer, StatusUpdateSerializer,
    ChangePasswordSerializer, CommentSerializer,
    NotificationSerializer, RemarkSerializer,
)

ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
MAX_FILE_SIZE_MB = 5


def get_role(user):
    try:
        return user.profile.role
    except UserProfile.DoesNotExist:
        return 'student'


def get_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Registered successfully'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')

        try:
            user_obj = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        user = authenticate(username=user_obj.username, password=password)
        if user is None:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        tokens = get_tokens(user)
        role = get_role(user)
        return Response({
            'access': tokens['access'],
            'refresh': tokens['refresh'],
            'username': user.username,
            'role': role,
        })


class ComplaintsView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        role = get_role(request.user)
        qs = Complaint.objects.all().order_by('-created_at') if role == 'admin' \
            else Complaint.objects.filter(user=request.user).order_by('-created_at')
        serializer = ComplaintSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        if get_role(request.user) == 'admin':
            return Response({'error': 'Admins cannot create complaints'}, status=status.HTTP_403_FORBIDDEN)

        uploaded_file = request.FILES.get('file')
        if uploaded_file:
            if uploaded_file.content_type not in ALLOWED_FILE_TYPES:
                return Response({'error': 'Only PDF, JPG, and PNG files are allowed.'}, status=status.HTTP_400_BAD_REQUEST)
            if uploaded_file.size > MAX_FILE_SIZE_MB * 1024 * 1024:
                return Response({'error': f'File size must be under {MAX_FILE_SIZE_MB}MB.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = ComplaintCreateSerializer(data=request.data)
        if serializer.is_valid():
            complaint = serializer.save(user=request.user)
            return Response({'message': 'Complaint created', 'id': complaint.id}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UpdateStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, id):
        if get_role(request.user) != 'admin':
            return Response({'error': 'Only admins can update status'}, status=status.HTTP_403_FORBIDDEN)

        try:
            complaint = Complaint.objects.get(id=id)
        except Complaint.DoesNotExist:
            return Response({'error': 'Complaint not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = StatusUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        complaint.status = serializer.validated_data['status']
        complaint.save()

        # Create in-app notification for the student
        status_label = complaint.status.replace("_", " ").title()
        Notification.objects.create(
            user=complaint.user,
            complaint=complaint,
            message=f'Your complaint "{complaint.title}" has been updated to {status_label}.'
        )

        if complaint.user.email:
            try:
                send_mail(
                    subject=f'Complaint Status Updated — {complaint.title}',
                    message=(
                        f'Hi {complaint.user.username},\n\n'
                        f'Your complaint "{complaint.title}" status has been updated to: '
                        f'{status_label}\n\n'
                        f'— College Complaint System'
                    ),
                    from_email=django_settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[complaint.user.email],
                    fail_silently=True,
                )
            except Exception:
                pass

        return Response({'message': 'Status updated', 'status': complaint.status})


class DeleteComplaintView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, id):
        if get_role(request.user) != 'student':
            return Response({'error': 'Only students can delete complaints'}, status=status.HTTP_403_FORBIDDEN)
        try:
            complaint = Complaint.objects.get(id=id, user=request.user)
            complaint.delete()
            return Response({'message': 'Complaint deleted'})
        except Complaint.DoesNotExist:
            return Response({'error': 'Complaint not found'}, status=status.HTTP_404_NOT_FOUND)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        if not request.user.check_password(serializer.validated_data['current_password']):
            return Response({'error': 'Current password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({'message': 'Password changed successfully'})


class AdminStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if get_role(request.user) != 'admin':
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        return Response({
            'total': Complaint.objects.count(),
            'pending': Complaint.objects.filter(status='pending').count(),
            'in_progress': Complaint.objects.filter(status='in_progress').count(),
            'resolved': Complaint.objects.filter(status='resolved').count(),
            'closed': Complaint.objects.filter(status='closed').count(),
        })


class CommentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        try:
            complaint = Complaint.objects.get(id=id)
        except Complaint.DoesNotExist:
            return Response({'error': 'Complaint not found'}, status=status.HTTP_404_NOT_FOUND)
        if get_role(request.user) == 'student' and complaint.user != request.user:
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        comments = complaint.comments.all().order_by('created_at')
        return Response(CommentSerializer(comments, many=True).data)

    def post(self, request, id):
        try:
            complaint = Complaint.objects.get(id=id)
        except Complaint.DoesNotExist:
            return Response({'error': 'Complaint not found'}, status=status.HTTP_404_NOT_FOUND)
        if get_role(request.user) == 'student' and complaint.user != request.user:
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        text = request.data.get('text', '').strip()
        if not text:
            return Response({'error': 'Comment text is required'}, status=status.HTTP_400_BAD_REQUEST)
        comment = Comment.objects.create(complaint=complaint, user=request.user, text=text)
        return Response(CommentSerializer(comment).data, status=status.HTTP_201_CREATED)


class NotificationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(
            user=request.user
        ).order_by('-created_at')[:20]
        return Response(NotificationSerializer(notifications, many=True).data)

    def patch(self, request):
        # Mark all as read
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'message': 'All notifications marked as read'})


class AddRemarkView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, complaint_id):
        if get_role(request.user) != 'admin':
            return Response({"error": "Only admin can add remark"}, status=status.HTTP_403_FORBIDDEN)
        try:
            complaint = Complaint.objects.get(id=complaint_id)
        except Complaint.DoesNotExist:
            return Response({"error": "Complaint not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = RemarkSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(admin=request.user, complaint=complaint)
            Notification.objects.create(
                user=complaint.user,
                complaint=complaint,
                message=f'Admin added a remark on your complaint "{complaint.title}": {request.data.get("text", "")}'
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)