from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from signup.models import SavedJob, User, Job
from getUserData.JWT import CustomJWTAuthentication

from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from signup.models import Job, Recruiter , SavedJob
from getUserData.JWT import CustomJWTAuthentication
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status


@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def save_job(request):
    user = request.user  # Authenticated user
    job_id = request.data.get('job_id')
    if not user:
        return Response(
            {'error': 'User not authenticated.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not job_id:
        return Response({'error': 'Job ID is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Retrieve the Job instance
        job = Job.objects.get(id=job_id)

        # Ensure `user` is a User instance
        if not isinstance(user, User):
            user = User.objects.get(id=user)

        # Check if the job is already saved
        saved_job = SavedJob.objects.filter(user=user, job=job).first()

        if saved_job:
            # If it exists, delete it (toggle off)
            saved_job.delete()
            return Response({'message': 'Job unsaved successfully'}, status=status.HTTP_200_OK)
        else:
            # If it doesn't exist, create a new saved job (toggle on)
            SavedJob.objects.create(user=user, job=job)
            return Response({'message': 'Job saved successfully'}, status=status.HTTP_201_CREATED)

    except Job.DoesNotExist:
        return Response({'error': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)

    except User.DoesNotExist:
        return Response({'error': 'User not found in the database.'}, status=status.HTTP_404_NOT_FOUND)

    except Exception as e:
        return Response(
            {'error': 'An unexpected error occurred', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

class Job_Pagination(PageNumberPagination):
    page_size = 9
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,  # Total number of items
            'total_pages': self.page.paginator.num_pages,  # Total number of pages
            'current_page': self.page.number,  # Current page number
            'next': self.get_next_link(),  # URL for next page
            'previous': self.get_previous_link(),  # URL for previous page
            'results': data  # Data for the current page
        })

@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_saved_jobs(request):
    """
    API to get only the jobs saved by the authenticated user.
    """
    user = request.user  # Authenticated user
    search_term = request.GET.get('search', '').strip()  # Optional search term
    page = int(request.GET.get('page', 1))  # Default to page 1 if not provided

    try:
        # Get all saved jobs for the user
        saved_jobs_query = SavedJob.objects.filter(user=user)

        if search_term:
            # Filter saved jobs based on search term for job name
            saved_jobs_query = saved_jobs_query.filter(job__job_name__icontains=search_term)

        # Apply pagination
        paginator = Job_Pagination()

        # Handle invalid page numbers gracefully
        paginated_saved_jobs = paginator.paginate_queryset(saved_jobs_query, request)
        if not paginated_saved_jobs and page > 1:
            # If the current page is invalid, return the last valid page
            page = (len(saved_jobs_query) + paginator.page_size - 1) // paginator.page_size
            request.GET._mutable = True  # Allow modifying GET params for paginator
            request.GET['page'] = page
            request.GET._mutable = False
            paginated_saved_jobs = paginator.paginate_queryset(saved_jobs_query, request)

        # Prepare job data for the saved jobs
        job_data = [
            {
                'job_id': saved_job.job.id,
                'job_name': saved_job.job.job_name,
                'workplace_type': saved_job.job.workplace_type,
                'job_location': saved_job.job.job_location,
                'employment_type': saved_job.job.employment_type,
                'description': saved_job.job.description,
                'skills': saved_job.job.skills,
                'interview_type': saved_job.job.interview_type,
                'company_name': saved_job.job.recruiter.company_name,
                'created_at': saved_job.job.created_at,
                'updated_at': saved_job.job.updated_at,
            }
            for saved_job in paginated_saved_jobs
        ]

        return paginator.get_paginated_response(job_data)

    except Exception as e:
        return Response(
            {'error': 'An unexpected error occurred', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
