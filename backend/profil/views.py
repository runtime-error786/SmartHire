from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from signup.models import User, Profile, Candidate, Recruiter
from .serializer import ProfileSerializer, CandidateSerializer, RecruiterSerializer, UserSerializer

@api_view(['GET', 'PUT'])
def simple_hello(request, user_id):
    """Retrieve and update profile information for both Candidate and Recruiter based on the user_id."""
    
    # Fetch user based on user_id
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    # GET request to retrieve data
    if request.method == 'GET':
        # Try to load profile and user data
        try:
            profile = Profile.objects.get(user=user)
        except Profile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

        # Serialize the Profile and User data
        profile_serializer = ProfileSerializer(profile)
        user_serializer = UserSerializer(user)

        # Prepare the base response with User and Profile data
        response_data = {
            "user": user_serializer.data,
            "profile": profile_serializer.data
        }

        # Load additional data for Candidate role
        if user.role == 'user':  # Assuming 'user' refers to the Candidate role
            try:
                candidate = Candidate.objects.get(profile=profile)  # Use profile instead of user
                candidate_serializer = CandidateSerializer(candidate)
                response_data['candidate'] = candidate_serializer.data  # Add candidate data to response
            except Candidate.DoesNotExist:
                return Response({"error": "Candidate data not found"}, status=status.HTTP_404_NOT_FOUND)

        # Load additional data for Recruiter role
        elif user.role == 'recruiter':
            try:
                recruiter = Recruiter.objects.get(profile=profile)  # Use profile instead of user
                recruiter_serializer = RecruiterSerializer(recruiter)
                response_data['recruiter'] = recruiter_serializer.data  # Add recruiter data to response
            except Recruiter.DoesNotExist:
                return Response({"error": "Recruiter data not found"}, status=status.HTTP_404_NOT_FOUND)

        # Return the serialized data for User, Profile, and Candidate/Recruiter based on role
        return Response(response_data, status=status.HTTP_200_OK)

    # PUT request to update data
    elif request.method == 'PUT':
        try:
            profile = Profile.objects.get(user=user)
        except Profile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
        
        profile_data = request.data.get('profile', {})
        user_data = request.data.get('user', {})
        candidate_data = request.data.get('candidate', {})
        recruiter_data = request.data.get('recruiter', {})

        profile_serializer = ProfileSerializer(profile, data=profile_data, partial=True)
        user_serializer = UserSerializer(user, data=user_data, partial=True)

        candidate_serializer = None
        recruiter_serializer = None

        if user.role == 'user':
            try:
                candidate = Candidate.objects.get(profile=profile)  # Use profile instead of user
                candidate_serializer = CandidateSerializer(candidate, data=candidate_data, partial=True)
            except Candidate.DoesNotExist:
                return Response({"error": "Candidate data not found"}, status=status.HTTP_404_NOT_FOUND)

        elif user.role == 'recruiter':
            try:
                recruiter = Recruiter.objects.get(profile=profile)  # Use profile instead of user
                recruiter_serializer = RecruiterSerializer(recruiter, data=recruiter_data, partial=True)
            except Recruiter.DoesNotExist:
                return Response({"error": "Recruiter data not found"}, status=status.HTTP_404_NOT_FOUND)

        # Validate and save serializers
        if profile_serializer.is_valid() and user_serializer.is_valid():
            profile_serializer.save()
            user_serializer.save()

            if user.role == 'user' and candidate_serializer and candidate_serializer.is_valid():
                candidate_serializer.save()
            elif user.role == 'recruiter' and recruiter_serializer and recruiter_serializer.is_valid():
                recruiter_serializer.save()

            return Response({
                "user": user_serializer.data,
                "profile": profile_serializer.data
            }, status=status.HTTP_200_OK)

        errors = {
            "profile_errors": profile_serializer.errors,
            "user_errors": user_serializer.errors
        }
        if user.role == 'user' and candidate_serializer and not candidate_serializer.is_valid():
            errors['candidate_errors'] = candidate_serializer.errors
        elif user.role == 'recruiter' and recruiter_serializer and not recruiter_serializer.is_valid():
            errors['recruiter_errors'] = recruiter_serializer.errors
        
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)
