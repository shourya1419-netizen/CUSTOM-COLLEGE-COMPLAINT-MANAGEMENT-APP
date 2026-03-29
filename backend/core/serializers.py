from rest_framework import serializers
from .models import User , Complaint , Remark

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user



class ComplaintSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = '__all__'
        read_only_fields = ['student', 'status']


class RemarkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Remark
        fields = '__all__'
        read_only_fields = ['user' , 'complaint']
