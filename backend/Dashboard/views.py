from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Sum
from django.db.models.functions import TruncMonth,TruncWeek,TruncDate
from signup.models import  User, Profile, Candidate, Recruiter, Subscription, Job,Profit,Report
from getUserData.JWT import CustomJWTAuthentication
from rest_framework.permissions import IsAuthenticated
import logging
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q


# Configure logging for better error reporting
logger = logging.getLogger(__name__)

@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])#frontend request only takes by a user whos has a cookies
@permission_classes([IsAuthenticated])#the user is authenticated or not
def get_dashboard_stats(request):#this function is used to get the data from the database and show it on the dashboard
    try:
        # Count users with the role 'user'
        user_count = User.objects.filter(role='user').count()
        
        # Calculate total net profit (assuming net profit is stored in Profit)
        total_net_profit = Profit.objects.aggregate(Sum('net_profit'))['net_profit__sum'] or 0

        # Count total jobs
        total_jobs = Job.objects.count()

        # Count subscriptions
        total_subscriptions = Subscription.objects.count()

        # Jobs by Category (assuming 'skills' field in Job model)
        jobs_by_category = Job.objects.values('skills').annotate(count=Count('id')).order_by('skills')

        # Jobs by Preference (assuming 'employment_type' field in Job model)
        jobs_by_preference = Job.objects.values('employment_type').annotate(count=Count('employment_type'))

        # Jobs by Workplace (assuming 'workplace_type' field in Job model)
        jobs_by_workplace = Job.objects.values('workplace_type').annotate(count=Count('id')).order_by('workplace_type')

        # User Signups (count jobs grouped by month)
        jobs_post = Job.objects.annotate(day=TruncDate('created_at')) \
    .values('day') \
    .annotate(count=Count('id')) \
    .order_by('day')

# Formatting the result to show the week in YYYY-WW format and the job count

        # Convert aggregated data to dictionaries that match the expected format
        jobs_by_category_data = [{'skills': item['skills'], 'count': item['count']} for item in jobs_by_category]
        jobs_by_preference_data = [{'employment_type': item['employment_type'], 'count': item['count']} for item in jobs_by_preference]
        jobs_by_workplace_data = [{'workplace_type': item['workplace_type'], 'count': item['count']} for item in jobs_by_workplace]
        
        # Convert the 'month' to a string format that the response can handle
        jobs_post_data = [{'day': item['day'].strftime('%Y-%m-%d'), 'count': item['count']} for item in jobs_post]        

        

        # Prepare the response data directly without serialization
        response_data = {
            'user_count': user_count,
            'total_net_profit': total_net_profit,
            'total_jobs': total_jobs,
            'total_subscriptions': total_subscriptions,
            'jobs_by_category': jobs_by_category_data,
            'jobs_by_preference': jobs_by_preference_data,
            'jobs_by_workplace': jobs_by_workplace_data,
            'Jobs_post': jobs_post_data,
        }

        return Response(response_data, status=status.HTTP_200_OK)

    except Exception as e:
        # Log the detailed error message for debugging
        logger.error(f"Error occurred: {str(e)}", exc_info=True)

        return Response(
            {'error': 'An unexpected error occurred', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


#Delete user
class UserPagination(PageNumberPagination):
    page_size = 10  # Default number of items per page
    page_size_query_param = 'page_size'
    max_page_size = 100

@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def load_users(request):
    try:
        # Get the role and email filters from query parameters
        role = request.query_params.get('role')  # Optional role filter
        email = request.query_params.get('email')  # Optional email filter

        # Base query: Only include users with the role 'user'
        users = User.objects.filter(role='user')

        # Apply additional filters if provided
        
        if email:
            users = users.filter(email__icontains=email)  # Case-insensitive email filter

        # Total count of filtered users
        total_count = users.count()

        # Paginate results
        paginator = UserPagination()
        result_page = paginator.paginate_queryset(users, request)

        # Prepare response data
        users_data = [
            {
                'id': user.id,
                'email': user.email,
                'role': user.role,
                'total_count': total_count,  # Include total count in each user data
                'is_active': user.is_active,
            }
            for user in result_page
        ]

        # Return paginated response
        return paginator.get_paginated_response(users_data)

    except Exception as e:
        return Response({'error': 'Error loading users', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_user(request, user_id):
    """
    API for admin to delete a user by ID and all related data.
    """
    try:
        # Ensure the requester is an admin

      #  if request.user.role != 'admin':
       #     print("I am here3",user_id)
        #    return Response({'error': 'Only admins can delete users'}, status=status.HTTP_403_FORBIDDEN)

        # Fetch the user by ID
        user = User.objects.filter(id=user_id).first()
        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        # Prevent deleting themselves
        if user == request.user:
            return Response({'error': 'Admins cannot delete their own account'}, status=status.HTTP_400_BAD_REQUEST)

        # Start deleting associated data
        Profile.objects.filter(user=user).delete()

        Candidate.objects.filter(profile__user=user).delete()

        Recruiter.objects.filter(profile__user=user).delete()

        Subscription.objects.filter(user=user).delete()

        Job.objects.filter(recruiter__profile__user=user).delete()

        # Finally, delete the user
        User.objects.filter(id=user_id).first().delete()

        return Response({'message': f'User with ID {user_id} and all related data have been deleted'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': 'Error deleting user', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


#subscription
@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def subscribers(request):
    try:
        # Get the email filter and page number from query parameters
        email_filter = request.GET.get('email', None)
        page = int(request.GET.get('page', 1))  # Get the page number, default to 1 if not provided

        # Base query: Include all subscriptions initially
        subs = Subscription.objects.all()

        # Apply email filter if provided
        if email_filter:
            subs = subs.filter(user__email__icontains=email_filter)  # Case-insensitive email filter

        # Total count of filtered subscriptions
        total_count = subs.count()

        # Paginate results using the custom UserPagination class
        paginator = UserPagination()  # Custom pagination class
        result_page = paginator.paginate_queryset(subs, request)

        # Calculate total pages based on total_count
        total_pages = (total_count + paginator.page_size - 1) // paginator.page_size  # Round up division for total pages

        # Prepare response data
        subscriptions_data = [
            {
                'id': subscription.id,
                'email': subscription.user.email,
                'subscription': subscription.type,
            }
            for subscription in result_page
        ]

        # Prepare the response with pagination metadata
        response_data = {
            'results': subscriptions_data,
            'total_count': total_count,
            'total_pages': total_pages,
            'current_page': page,  # Current page should reflect the requested page number
        }

        return Response(response_data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': 'Error loading subscriptions', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_subscription(request, subscription_id):
    try:
        print("Hello",subscription_id)
        # Fetch the subscription by ID
        subscription = Subscription.objects.get(id=subscription_id)
        
        # Delete the subscription
        subscription.delete()

        # Return a success response
        return Response({'detail': 'Subscription deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

    except Subscription.DoesNotExist:
        # Handle case where subscription is not found
        return Response({'detail': 'Subscription not found'}, status=status.HTTP_404_NOT_FOUND)
    


class JobPagination(PageNumberPagination):
    page_size = 10  # Default number of items per page
    page_size_query_param = 'page_size'
    max_page_size = 100


@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def load_jobs(request):
    """
    API to fetch all jobs or filter by job_name if a name is provided.
    """
    try:
        name = request.query_params.get('name')  # Optional filter by job_name

        # Base query: Fetch all jobs
        jobs = Job.objects.all()

        # Apply filter if 'name' is provided
        if name:
            jobs = jobs.filter(job_name__icontains=name)  # Case-insensitive filter

        # Total count of filtered jobs
        total_count = jobs.count()

        # Paginate results
        paginator = JobPagination()
        result_page = paginator.paginate_queryset(jobs, request)

        # Prepare response data
        jobs_data = [
            {
                'id': job.id,
                'job_name': job.job_name,
                'workplace_type': job.workplace_type,
                'job_location': job.job_location,
                'employment_type': job.employment_type,
                'created_at': job.created_at,
                'skills':job.skills
            }
            for job in result_page
        ]

        # Return paginated response with total count
        return paginator.get_paginated_response({
            'jobs': jobs_data,
            'total_count': total_count
        })

    except Exception as e:
        return Response({'error': 'Error loading jobs', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_job(request, job_id):
    """
    API to delete a specific job by its ID.
    """
    try:
        # Fetch the job by ID
        job = Job.objects.filter(id=job_id).first()
        if not job:
            return Response({'error': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)

        # Delete the job
        job.delete()

        return Response({'message': f'Job with ID {job_id} has been deleted'}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': 'Error deleting job', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def load_reported_jobs(request):
    """
    API to fetch all reported jobs, search by job_name, or fetch a single reported job by job_id.
    """
    try:
        job_id = request.query_params.get('job_id')  # Optional parameter to fetch a specific job
        title = request.query_params.get('title')  # Optional filter by job_name (from the Job model)

        # Base query: Fetch all reported jobs
        reported_jobs = Report.objects.all()

        # Filter by job title if provided
        if title:
            reported_jobs = reported_jobs.filter(job__job_name__icontains=title.strip())

        # Filter by job ID if provided
        if job_id:
            reported_jobs = reported_jobs.filter(job_id=job_id)

        # Deduplicate jobs based on job_id
        distinct_jobs = reported_jobs.values('job_id').distinct()

        # Retrieve only unique jobs
        unique_reported_jobs = Job.objects.filter(id__in=[job['job_id'] for job in distinct_jobs])

        # Total count of unique jobs
        total_count = unique_reported_jobs.count()

        # If no jobs are found, prepare an empty response
        if total_count == 0:
            return Response({
                'reported_jobs': [],
                'total_count': 0
            }, status=status.HTTP_200_OK)

        # Paginate results
        paginator = JobPagination()
        result_page = paginator.paginate_queryset(unique_reported_jobs, request)

        # Prepare response data
        reported_jobs_data = []
        for job in result_page:
            # Collect all feedback for the current job
            feedback_list = Report.objects.filter(job=job).values_list('feedback', flat=True)
            reported_jobs_data.append({
                'id': job.id,
                'job_id': job.id,
                'job_name': job.job_name,
                'job_location': job.job_location,
                'workplace_type': job.workplace_type,
                'employment_type': job.employment_type,
                'skills': job.skills,
                'description': job.description,
                'company_name': job.recruiter.company_name,
                'feedback': list(feedback_list)  # Merged feedback as an array
            })

        # Return paginated response with total count
        return paginator.get_paginated_response({
            'reported_jobs': reported_jobs_data,
            'total_count': total_count
        })

    except Exception as e:
        return Response({'error': 'Error loading reported jobs', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_job_and_reports(request, job_id):
    """
    API to delete a job from the Job table and cascade delete related reports.
    """
    try:
        # Fetch the job by ID
        job = Job.objects.filter(id=job_id).first()
        if not job:
            return Response({'error': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Cascade delete related reports based on the job ID
        reports = Report.objects.filter(job_id=job_id)
        reports.delete()

        # Delete the job
        job.delete()

        return Response({'message': 'Job and related reports deleted successfully'}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': 'Error deleting job and related reports', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
@api_view(['DELETE'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_report(request, report_id):
    """
    API to delete a report from the Report table without affecting the Job table.
    """
    try:
        # Fetch the report by ID
        report = Report.objects.filter(job_id=report_id)
        if not report:
            return Response({'error': 'Report not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Delete the report
        report.delete()

        return Response({'message': 'Report deleted successfully'}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': 'Error deleting report', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
