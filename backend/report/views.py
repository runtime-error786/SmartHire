from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from signup.models import Job, Report
from getUserData.JWT import CustomJWTAuthentication
from rest_framework.permissions import IsAuthenticated

@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def create_report(request):
    # Get job_id and feedback from the request body
    job_id = request.data.get('job_id')
    feedback = request.data.get('feedback')

    # Ensure job_id is provided in the request
    if not job_id:
        return Response({"error": "Job ID is required"}, status=status.HTTP_400_BAD_REQUEST)

    # Ensure feedback is provided in the request
    if not feedback:
        return Response({"error": "Feedback is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Check if the job exists
        job = Job.objects.get(id=job_id)
    except Job.DoesNotExist:
        return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)

    # Check if a report already exists for this job and user
    if Report.objects.filter(job=job, user=request.user).exists():
        return Response({"message": "You have already submitted a report for this job"}, status=status.HTTP_200_OK)

    # Create a new report for the job with feedback and user association
    report = Report.objects.create(job=job, feedback=feedback, user=request.user)

    return Response(
        {
            "message": "Report created successfully",
            "report_id": report.id,
            "feedback": report.feedback,
            "user_id": report.user.id,
        },
        status=status.HTTP_201_CREATED
    )


@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def check_report_status(request, job_id):
    try:
        job = Job.objects.get(id=job_id)
    except Job.DoesNotExist:
        return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)

    report_exists = Report.objects.filter(job=job, user=request.user).exists()

    if report_exists:
        return Response({"message": "Yes"}, status=status.HTTP_200_OK)
    else:
        return Response({"message": "No"}, status=status.HTTP_200_OK)
