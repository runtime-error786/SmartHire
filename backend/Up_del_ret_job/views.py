from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from signup.models import Job, Recruiter
from getUserData.JWT import CustomJWTAuthentication
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_job_by_id(request, job_id):
    user = request.user  # Authenticated user

    if not user:
        return Response(
            {'error': 'User not authenticated.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    try:
        # Ensure the job exists and belongs to the current recruiter
        job = Job.objects.get(id=job_id, recruiter__profile__user=user)
        job_data = {
            'id': job.id,  # Include the job ID in the response
            'job_name': job.job_name,
            'workplace_type': job.workplace_type,
            'job_location': job.job_location,
            'employment_type': job.employment_type,
            'description': job.description,
            'skills': job.skills,
            'interview_type': job.interview_type,
            'company_name': job.recruiter.company_name,  # Recruiter company name
            'created_at': job.created_at,
            'updated_at': job.updated_at,
        }
        return Response(job_data)

    except Job.DoesNotExist:
        return Response(
            {'error': 'Job not found.'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': 'An unexpected error occurred', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PUT'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def update_job(request, job_id):
    user = request.user  # Authenticated user

    if not user:
        return Response(
            {'error': 'User not authenticated.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    try:
        # Ensure the job exists and belongs to the current recruiter
        job = Job.objects.get(id=job_id, recruiter__profile__user=user)

        # Update job fields with the provided data
        job.job_name = request.data.get('job_name', job.job_name)
        job.workplace_type = request.data.get('workplace_type', job.workplace_type)
        job.job_location = request.data.get('job_location', job.job_location)
        job.employment_type = request.data.get('employment_type', job.employment_type)
        job.description = request.data.get('description', job.description)
        job.skills = request.data.get('skills', job.skills)
        job.interview_type = request.data.get('interview_type', job.interview_type)

        # Save the updated job object
        job.save()

        updated_job_data = {
            'job_name': job.job_name,
            'workplace_type': job.workplace_type,
            'job_location': job.job_location,
            'employment_type': job.employment_type,
            'description': job.description,
            'skills': job.skills,
            'interview_type': job.interview_type,
            'company_name': job.recruiter.company_name,  # Recruiter company name
            'created_at': job.created_at,
            'updated_at': job.updated_at,
        }

        return Response(updated_job_data, status=status.HTTP_200_OK)

    except Job.DoesNotExist:
        return Response(
            {'error': 'Job not found.'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': 'An unexpected error occurred', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_job(request, job_id):
    user = request.user  # Authenticated user

    if not user:
        return Response(
            {'error': 'User not authenticated.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    try:
        # Ensure the job exists and belongs to the current recruiter
        job = Job.objects.get(id=job_id, recruiter__profile__user=user)

        # Delete the job object
        job.delete()

        return Response(
            {'message': 'Job deleted successfully.'},
            status=status.HTTP_204_NO_CONTENT
        )

    except Job.DoesNotExist:
        return Response(
            {'error': 'Job not found.'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': 'An unexpected error occurred', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_job_id(request, job_id):
    user = request.user  # Authenticated user

    if not user:
        return Response(
            {'error': 'User not authenticated.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    try:
        # Ensure the job exists
        job = Job.objects.get(id=job_id)

        # Get the email of the recruiter who posted the job
        recruiter_email = job.recruiter.profile.user.email
        job_data = {
            'id': job.id,  # Include the job ID in the response
            'job_name': job.job_name,
            'workplace_type': job.workplace_type,
            'job_location': job.job_location,
            'employment_type': job.employment_type,
            'description': job.description,
            'skills': job.skills,
            'interview_type': job.interview_type,
            'company_name': job.recruiter.company_name,  # Recruiter company name
            'recruiter_email': recruiter_email,  # Added recruiter email
            'created_at': job.created_at,
            'updated_at': job.updated_at,
        }
        return Response(job_data)

    except Job.DoesNotExist:
        return Response(
            {'error': 'Job not found.'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': 'An unexpected error occurred', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
