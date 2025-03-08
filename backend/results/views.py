from django.core.mail import send_mail
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from getUserData.JWT import CustomJWTAuthentication
from django.conf import settings

@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def send_test_result_email(request):
    print("hello from results")
    user = request.user  # Authenticated user
    print(request.data)
    
    # Get the required data from the request body
    email_rec = request.data.get('email')
    topic = request.data.get('topic')
    score = request.data.get('score')
    test_email = user.email

    # Validate that all required fields are provided
    if email_rec is None or topic is None or score is None or test_email is None:
        return Response(
            {'error': 'All fields (email, topic, score, test_email) are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Construct the email content
        subject = f"Test Result for {topic}"
        message = (
            f"Hello,\n\nThe test results are as follows:\n\n"
            f"Topic: {topic}\nScore: {score} / 10 \n\n"
            f"Test Taken By: {test_email}\n\n"
            "Best Regards,\nSmart Hire"
        )

        # Send the email
        send_mail(
            subject,  # Subject
            message,  # Message
            settings.EMAIL_HOST_USER,  # From email
            [email_rec],  # To email
            fail_silently=False,  # Don't fail silently
        )

        return Response(
            {'message': 'Test result email sent successfully.'},
            status=status.HTTP_200_OK
        )

    except Exception as e:
        return Response(
            {'error': 'An unexpected error occurred', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
