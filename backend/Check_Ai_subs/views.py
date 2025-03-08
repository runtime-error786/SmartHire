from datetime import timedelta
from django.utils import timezone
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

# Import your custom JWT authentication
from getUserData.JWT import CustomJWTAuthentication
from signup.models import Subscription  # Import the Subscription model

@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def has_ai_subscription(request):
    try:
        # Get the authenticated user
        user = request.user

        # Fetch all AI subscriptions for the user
        ai_subscriptions = Subscription.objects.filter(user=user, type='ai')
        if not ai_subscriptions.exists():
            return Response({'ai_subscription': False}, status=status.HTTP_200_OK)

        current_date = timezone.now().date()

        for subscription in ai_subscriptions:
            start_date = subscription.start_date
            end_date = subscription.end_date

            # Check if the subscription is active and within the valid one-month range
            if start_date <= current_date <= end_date:
                subscription_duration = (end_date - start_date).days
                if subscription_duration <= 30:
                    return Response({'ai_subscription': True}, status=status.HTTP_200_OK)
                else:
                    # If the subscription is longer than one month, delete it
                    subscription.delete()
                    return Response({'ai_subscription': False}, status=status.HTTP_200_OK)

        # If no valid subscriptions are found, return False
        return Response({'ai_subscription': False}, status=status.HTTP_200_OK)

    except Exception as e:
        # Catch unexpected errors and return an error response
        return Response(
            {'error': 'An unexpected error occurred', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )




@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def has_prac_subscription(request):
    try:
        # Get the authenticated user
        user = request.user

        # Fetch all subscriptions for the user with type 'practice'
        practice_subscriptions = Subscription.objects.filter(user=user, type='practice')
        if not practice_subscriptions.exists():
            return Response({'practice_subscription': False}, status=status.HTTP_200_OK)

        # Current date (only date, no time)
        current_date = timezone.now().date()

        for subscription in practice_subscriptions:
            start_date = subscription.start_date
            end_date = subscription.end_date

            # Check if the subscription is active
            if start_date <= current_date <= end_date:
                # Calculate the subscription duration
                subscription_duration = (end_date - start_date).days

                if subscription_duration <= 30:
                    # Subscription is valid and within one month
                    return Response({'practice_subscription': True}, status=status.HTTP_200_OK)
                else:
                    # Delete subscription if it exceeds one month
                    subscription.delete()
                    return Response({'practice_subscription': False}, status=status.HTTP_200_OK)

        # If no valid subscriptions are found, return False
        return Response({'practice_subscription': False}, status=status.HTTP_200_OK)

    except Exception as e:
        # Catch unexpected errors and return an error response
        return Response(
            {'error': 'An unexpected error occurred', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
