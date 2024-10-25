from rest_framework import serializers
from signup.models import Profile, Candidate, Recruiter, User

class UserSerializer(serializers.ModelSerializer):
    """Serializer for the User model."""
    
    class Meta:
        model = User
        fields = ['email', 'role', 'is_subscription']


class ProfileSerializer(serializers.ModelSerializer):
    """Serializer for the Profile model, linking it to the User model."""
    
    user = UserSerializer(read_only=True)  # Include user data as nested read-only
    
    class Meta:
        model = Profile
        fields = ['user', 'first_name', 'last_name', 'city', 'country', 'linkedin_link', 'phone_number', 'profile_picture']


class CandidateSerializer(serializers.ModelSerializer):
    """Serializer for the Candidate model, linking it to the Profile model."""
    
    profile = ProfileSerializer(read_only=True)  # Include profile data as nested read-only

    class Meta:
        model = Candidate
        fields = ['profile', 'score', 'education', 'resume', 'skills', 'github_link']


class RecruiterSerializer(serializers.ModelSerializer):
    """Serializer for the Recruiter model, linking it to the Profile model."""
    
    profile = ProfileSerializer(read_only=True)  # Include profile data as nested read-only
    
    class Meta:
        model = Recruiter
        fields = ['profile', 'company_name', 'company_website']
