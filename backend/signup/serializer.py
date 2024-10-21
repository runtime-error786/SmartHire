from rest_framework import serializers
from .models import User, Candidate, Recruiter, Subscription, Profile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'password', 'role', 'is_subscription']
        extra_kwargs = {'password': {'write_only': True}}

class CandidateSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    class Meta:
        model = Candidate
        fields = ['user', 'score']

class RecruiterSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Recruiter
        fields = ['user', 'company_name', 'company_website']

class SubscriptionSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Subscription
        fields = ['id', 'user', 'start_date', 'end_date', 'type']

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Profile
        fields = [
            'user', 'first_name', 'last_name', 'city', 'country',
            'github_link', 'linkedin_link', 'skills', 'phone_number',
            'experience', 'education', 'resume', 'profile_picture'  
        ]