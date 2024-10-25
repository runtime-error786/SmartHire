
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
from signup.models import User,Profile
import random
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
import jwt  

from django.core.cache import cache

@api_view(['POST'])
def send_otp_signin(request):
    email = request.data.get('email')
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'error': 'Email does not exist'}, status=status.HTTP_400_BAD_REQUEST)

    otp = random.randint(100000, 999999)

    cache.set(f'otp_{email}', otp, timeout=300)

    # Send OTP via email
    send_mail(
        'Your OTP for Password Reset',
        f'Your OTP is: {otp}',
        settings.EMAIL_HOST_USER,
        [email],
        fail_silently=False,
    )

    return Response({'success': 'OTP sent to your email!'}, status=status.HTTP_200_OK)

@api_view(['POST'])
def verify_otp_signin(request):
    email = request.data.get('email')
    otp = request.data.get('otp')

    cached_otp = cache.get(f'otp_{email}')

    if cached_otp is None:
        return Response({'error': 'OTP has expired or does not exist.'}, status=status.HTTP_400_BAD_REQUEST)

    if str(cached_otp) == str(otp): 
        return Response({'success': 'OTP verified!'}, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Invalid OTP.'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def reset_password(request):
    email = request.data.get('email')
    new_password = request.data.get('newPassword')

    try:
        user = User.objects.get(email=email)
        user.set_password(new_password)  
        user.save()

        cache.delete(f'otp_{email}')

        return Response({'success': 'Password reset successful.'}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'error': 'Email does not exist'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def sign_in(request):
    email = request.data.get('email')
    password = request.data.get('password')

    print(email, password)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'error': 'Invalid email or password'}, status=status.HTTP_400_BAD_REQUEST)

    if user.check_password(password):
        refresh = RefreshToken.for_user(user)

        response = Response({
            'user': {
                'email': user.email,
                'role': user.role  
            },
            'refresh': str(refresh),
            'access': str(refresh.access_token)
        }, status=status.HTTP_200_OK)

        response.set_cookie(
                'access',
                str(refresh.access_token),
                httponly=True,
                secure=True, 
                samesite='None', 
                max_age=3600,
                path='/',
            )

        response["Access-Control-Allow-Origin"] = "http://localhost:3000"
        response["Access-Control-Allow-Credentials"] = "true"
        response["Access-Control-Allow-Headers"] = "content-type"

        return response
    else:
        return Response({'error': 'Invalid email or password'}, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['POST'])
def decode_jwt(request):
    token = request.data.get('token')
    
    if not token:
        return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        decoded_data = jwt.decode(token, options={"verify_signature": False})

        print("Decoded JWT Data:", decoded_data)

        email = decoded_data.get('email')
        first_name = decoded_data.get('given_name', '')
        last_name = decoded_data.get('family_name', '')
        role = 'user'  
        picture = decoded_data.get('picture', '') 

        user, created = User.objects.get_or_create(email=email, defaults={'role': role})
        refresh = RefreshToken.for_user(user)
        if created:
            Profile.objects.update_or_create(
                user=user,
                defaults={
                    'first_name': first_name,
                    'last_name': last_name,
                    'profile_picture': picture,  
                }
            )

        response = Response({'data': {'email': email, 'first_name': first_name, 'last_name': last_name, 'role': role, 'picture': picture}}, status=status.HTTP_200_OK)
        
        response.set_cookie(
                'access',
                str(refresh.access_token),
                httponly=True,
                secure=True,  
                samesite='None', 
                max_age=3600,
                path='/'
            )
        response["Access-Control-Allow-Origin"] = "http://localhost:3000"
        response["Access-Control-Allow-Credentials"] = "true"
        response["Access-Control-Allow-Headers"] = "content-type"
        return response
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
