from rest_framework import serializers
from signup.models import Job, Recruiter

class RecruiterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recruiter
        fields = ['profile_id', 'company_name', 'company_website']

class JobSerializer(serializers.ModelSerializer):
    recruiter = serializers.PrimaryKeyRelatedField(queryset=Recruiter.objects.all())  # Accepts recruiter ID

    class Meta:
        model = Job
        fields = ['id', 'job_name', 'workplace_type', 'job_location', 'employment_type', 'description', 'skills', 'interview_type', 'recruiter', 'created_at', 'updated_at']
