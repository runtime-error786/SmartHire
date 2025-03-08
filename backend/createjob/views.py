from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import JobSerializer, RecruiterSerializer
from signup.models import Job, Recruiter,Profile
from getUserData.JWT import CustomJWTAuthentication  # Assuming you're using a custom JWT authentication class

@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_recruiter_company(request):
    user = request.user  # Authenticated user
    if not user:
        return Response(
            {'error': 'User not authenticated.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    try:
        # Retrieve the profile of the current user
        profile = Profile.objects.get(user=user)
        
        # Now, retrieve the recruiter associated with the user's profile
        recruiter = Recruiter.objects.get(profile=profile)
        
        # Check if recruiter exists
        if not recruiter:
            return Response(
                {'error': 'Recruiter not found for this user.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Use the serializer to handle data conversion and validation
        serializer = RecruiterSerializer(recruiter)

        # Print the serialized data

        # Check if company_name is empty, if so, return "O"
        company_name = serializer.data.get('company_name', "O")

        return Response(
            {'company_name': company_name},
            status=status.HTTP_200_OK
        )

    except Profile.DoesNotExist:
        return Response(
            {'error': 'Profile not found for this user.'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Recruiter.DoesNotExist:
        return Response(
            {'error': 'Recruiter not found for this user.'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        # Log and return exception for debugging
        return Response(
            {'error': 'An unexpected error occurred', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def create_job(request):
    user = request.user  # Authenticated user

    if not user:
        return Response(
            {'error': 'User not authenticated.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    try:
        # Get the profile of the current user
        profile = Profile.objects.get(user=user)

        # Now, get or create the recruiter associated with the profile
        recruiter, created = Recruiter.objects.get_or_create(profile=profile)

        # Check if a company_name is provided, and update it if so
        company_name = request.data.get('company_name')
        if company_name:
            recruiter.company_name = company_name
            recruiter.save()


        # Prepare job data from the request
        job_data = {
            'job_name': request.data.get('job_name'),
            'workplace_type': request.data.get('workplace_type'),
            'job_location': request.data.get('job_location'),
            'employment_type': request.data.get('employment_type'),
            'description': request.data.get('description'),
            'skills': request.data.get('skills'),
            'interview_type': request.data.get('interview_type'),
            'recruiter': recruiter.profile_id,  # Use recruiter.id as the foreign key
        }


        # Serialize the job data and check if it's valid
        job_serializer = JobSerializer(data=job_data)

        if job_serializer.is_valid():
            job_serializer.save()  # Save the job entry
            return Response(
                job_serializer.data,
                status=status.HTTP_201_CREATED
            )
        else:
            # Log the validation errors for debugging
            return Response(
                job_serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

    except Profile.DoesNotExist:
        return Response(
            {'error': 'Profile not found for this user.'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        # Return generic error with details for debugging
        return Response(
            {'error': 'An unexpected error occurred', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
