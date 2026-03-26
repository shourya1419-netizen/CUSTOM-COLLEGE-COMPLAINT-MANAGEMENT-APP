from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import UserSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def health_check(request):
    return Response({
        "status": "OK",
        "user": request.user.username,
        "role": request.user.role
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)