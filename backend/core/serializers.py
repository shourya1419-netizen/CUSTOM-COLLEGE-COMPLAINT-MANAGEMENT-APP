from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Complaint, UserProfile, Comment


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=6, write_only=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
        )
        UserProfile.objects.create(user=user, role='student')
        return user


class CommentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    role = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'username', 'role', 'text', 'created_at']
        read_only_fields = ['id', 'username', 'role', 'created_at']

    def get_role(self, obj):
        try:
            return obj.user.profile.role
        except Exception:
            return 'student'


class ComplaintSerializer(serializers.ModelSerializer):
    student = serializers.CharField(source='user.username', read_only=True)
    file = serializers.SerializerMethodField()

    class Meta:
        model = Complaint
        fields = ['id', 'title', 'description', 'category', 'department',
                  'status', 'file', 'created_at', 'student']
        read_only_fields = ['id', 'status', 'created_at', 'student']

    def get_file(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None


class ComplaintDetailSerializer(ComplaintSerializer):
    comments = CommentSerializer(many=True, read_only=True)

    class Meta(ComplaintSerializer.Meta):
        fields = ComplaintSerializer.Meta.fields + ['comments']


class ComplaintCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = ['title', 'description', 'category', 'department', 'file']


class StatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Complaint.STATUS_CHOICES)


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(min_length=6, write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("New passwords do not match.")
        return data
