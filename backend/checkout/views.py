import stripe
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from getUserData.JWT import CustomJWTAuthentication
from signup.models import User,Profit
from signup.models import Subscription
import logging

# Set up logging
logger = logging.getLogger(__name__)

# Set Stripe secret key
stripe.api_key = settings.STRIPE_TEST_SECRET_KEY  # Ensure you set this key correctly in settings.py

@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def create_checkout_session(request):
    try:
        user = request.user
        job_id = request.data.get('job_id')  # Retrieve job_id from request data
        interview_type = request.data.get('interview_type', 'ai')

        

        metadata = {
            'user_id': user.id,
            'email': user.email,
            'interview_type': interview_type,
            'job_id': job_id  # Include job_id in metadata if available
        }

        # Build success URL based on whether job_id is provided
        if job_id:
            success_url = f'http://localhost:3000/Users/Posts/{job_id}/?session_id={{CHECKOUT_SESSION_ID}}'
        else:
            success_url = 'http://localhost:3000/Users/Posts/CreateJob?session_id={CHECKOUT_SESSION_ID}'

        # Create Stripe Checkout session
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': 'AI Interview (Paid)',
                    },
                    'unit_amount': 5000,  # Example price in cents
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=success_url,  # Use the dynamic success URL
            cancel_url='http://localhost:3000/Users/Posts',
            metadata=metadata
        )


        # After successful creation of checkout session, increment the profit
        increment_profit_by_50()

        return Response({'sessionId': checkout_session.id}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': 'An unexpected error occurred', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


from decimal import Decimal

def increment_profit_by_50():
    try:
        # Try to get the profit entry
        profit = Profit.objects.get(id=1)
        # Increment the net profit by 50 (use Decimal for accuracy)
        profit.net_profit += Decimal('50.00')
        profit.save()
    except Profit.DoesNotExist:
        # If no entry exists, create one with the initial profit value
        profit = Profit.objects.create(id=1, net_profit=Decimal('50.00'))
    


@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def verify_payment(request):
    session_id = request.data.get('session_id')

    if not session_id:
        return Response({'error': 'Session ID is required'}, status=400)

    try:
        # Retrieve the session using the session ID
        session = stripe.checkout.Session.retrieve(session_id)

        if session.payment_status == 'paid':
            # Payment was successful, now update the user in the database
            user_id = session.metadata.get('user_id')
            interview_type = session.metadata.get('interview_type')

            if not user_id:
                return Response({'error': 'User ID is missing from session metadata'}, status=400)

            # Try to fetch the user based on user_id
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({'error': f'User with ID {user_id} does not exist'}, status=404)

            user.interview_type = interview_type  # Update the interview type as AI
            user.save()

            # Handle the subscription (create or update based on user)
            subscription = handle_subscription(user, 'ai')

            return Response({'status': 'Payment successful, user updated, subscription created or updated'})

        else:
            return Response({'error': 'Payment not successful'}, status=400)

    except stripe.error.StripeError as e:
        return Response({'error': str(e)}, status=400)

    except Exception as e:
        return Response({'error': 'An unexpected error occurred', 'details': str(e)}, status=500)


def handle_subscription(user, subscription_type):
    """Handles creating or updating a subscription."""
    current_date = timezone.now().date()
    end_date = current_date + timedelta(days=30)  # Set the end date to 30 days later

    # Try to find an existing subscription for this user of the specified type
    try:
        subscription = Subscription.objects.get(user=user, type=subscription_type)
        # If subscription exists, update the start and end dates
        subscription.start_date = current_date
        subscription.end_date = end_date
        subscription.save()
    except Subscription.DoesNotExist:
        # If no subscription exists, create a new one
        subscription = Subscription.objects.create(
            user=user,
            start_date=current_date,
            end_date=end_date,
            type=subscription_type  # Set the interview type as 'ai' or other
        )

    return subscription




@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def create_checkout_session_prac(request):
    try:
        user = request.user
        job_id = request.data.get('job_id')  # Retrieve job_id from request data
        practice_type = request.data.get('practice_type', 'practice')

        

        metadata = {
            'user_id': user.id,
            'email': user.email,
            'practice_type': practice_type
            
        }

        # Build success URL based on whether job_id is provided
        if job_id:
            success_url = f'http://localhost:3000/Users/Practice/?session_id={{CHECKOUT_SESSION_ID}}'
        else:
            success_url = 'http://localhost:3000/Users/Practice/?session_id={CHECKOUT_SESSION_ID}'

        # Create Stripe Checkout session
        checkout_session = stripe.checkout.Session.create(
    payment_method_types=['card'],
    line_items=[{
        'price_data': {
            'currency': 'usd',
            'product_data': {
                'name': 'Practice Interview for AI',
            },
            'unit_amount': 4000,  # Price in cents (40 USD)
        },
        'quantity': 1,
    },
    {
        'price_data': {
            'currency': 'usd',
            'product_data': {
                'name': 'Market Trending Jobs',
            },
            'unit_amount': 1000,  # Price in cents (10 USD)
        },
        'quantity': 1,
    }],
    mode='payment',
    success_url=success_url,  # Use the dynamic success URL
    cancel_url='http://localhost:3000/Users/Practice',
    metadata=metadata
)



        # After successful creation of checkout session, increment the profit
        increment_profit_by_50()

        return Response({'sessionId': checkout_session.id}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': 'An unexpected error occurred', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def verify_payment_prac(request):
    session_id = request.data.get('session_id')

    if not session_id:
        return Response({'error': 'Session ID is required'}, status=400)

    try:
        # Retrieve the session using the session ID
        session = stripe.checkout.Session.retrieve(session_id)

        if session.payment_status == 'paid':
            # Payment was successful, now update the user in the database
            user_id = session.metadata.get('user_id')
            practice_type = session.metadata.get('practice_type')

            if not user_id:
                return Response({'error': 'User ID is missing from session metadata'}, status=400)

            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({'error': f'User with ID {user_id} does not exist'}, status=404)

            # Check if the user already has a 'practice' type subscription
            current_date = timezone.now().date()
            end_date = current_date + timedelta(days=30)  # Set the end date to 30 days later

            try:
                # Fetch existing 'practice' subscription
                subscription = Subscription.objects.get(user=user, type='practice')
                
                # Update the start and end dates if the subscription exists
                subscription.start_date = current_date
                subscription.end_date = end_date
                subscription.save()

                return Response({'status': 'Payment successful, existing practice subscription updated'})

            except Subscription.DoesNotExist:
                # If no existing 'practice' subscription is found, create a new one
                subscription = Subscription.objects.create(
                    user=user,
                    start_date=current_date,
                    end_date=end_date,
                    type='practice'  # Set the type to 'practice'
                )

                return Response({'status': 'Payment successful, new practice subscription created'})

        else:
            return Response({'error': 'Payment not successful'}, status=400)

    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {str(e)}")
        return Response({'error': str(e)}, status=400)
    
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return Response({'error': 'An unexpected error occurred', 'details': str(e)}, status=500)
