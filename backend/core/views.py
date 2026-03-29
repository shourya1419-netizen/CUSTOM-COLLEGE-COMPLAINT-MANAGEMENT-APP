from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import UserSerializer , ComplaintSerializer , RegisterSerializer , RemarkSerializer
from .models import Complaint , Remark


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


@api_view(['POST'])
def register(request):
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response({"message": "User registered successfully"})

    return Response(serializer.errors)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_complaint(request):
    serializer = ComplaintSerializer(data=request.data)
    
    if serializer.is_valid():
        serializer.save(student=request.user)
        return Response(serializer.data)
    
    return Response(serializer.errors)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_complaints(request):

    if request.user.role == 'STUDENT':
        complaints = Complaint.objects.filter(student=request.user)
    else:
        complaints = Complaint.objects.all()

    serializer = ComplaintSerializer(complaints, many=True)
    return Response(serializer.data)



@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_complaint_status(request, id):

    # Only staff or admin allowed
    if request.user.role not in ['STAFF', 'ADMIN']:
        return Response({"error": "Not allowed"}, status=403)

    try:
        complaint = Complaint.objects.get(id=id)
    except Complaint.DoesNotExist:
        return Response({"error": "Complaint not found"}, status=404)

    new_status = request.data.get('status')

    if new_status not in ['Pending', 'In Progress', 'Resolved']:
        return Response({"error": "Invalid status"}, status=400)

    complaint.status = new_status
    complaint.save()

    return Response({"message": "Status updated successfully"})



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_remark(request, complaint_id):

    if request.user.role not in ['STAFF', 'ADMIN']:
        return Response({"error": "Not allowed"}, status=403)

    try:
        complaint = Complaint.objects.get(id=complaint_id)
    except Complaint.DoesNotExist:
        return Response({"error": "Complaint not found"}, status=404)

    serializer = RemarkSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save(user=request.user, complaint=complaint)
        return Response(serializer.data)

    return Response(serializer.errors)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_remarks(request, complaint_id):

    remarks = Remark.objects.filter(complaint_id=complaint_id)
    serializer = RemarkSerializer(remarks, many=True)

    return Response(serializer.data)