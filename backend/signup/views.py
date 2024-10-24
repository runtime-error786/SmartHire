import random
import string
from django.core.mail import send_mail
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .models import User, Profile, Candidate  # Import the Profile and Candidate model

# In-memory storage for OTPs (consider using a database or cache for production)
otp_storage = {}

def generate_otp(length=6):
    """Generate a random OTP of given length."""
    return ''.join(random.choices(string.digits, k=length))

@api_view(['POST'])
def send_otp(request):
    email = request.data.get('email')
    
    # Check if the user exists
    if User.objects.filter(email=email).exists():
        return Response({'message': 'User with this email already exists.'}, status=status.HTTP_400_BAD_REQUEST)

    otp = generate_otp()
    otp_storage[email] = otp  # Store OTP in memory

    send_mail(
        'Your OTP Code',
        f'Your OTP code is {otp}. It is valid for 5 minutes.',
        settings.EMAIL_HOST_USER,
        [email],
        fail_silently=False,
    )

    return Response({'message': 'OTP sent to your email.'})

@api_view(['POST'])
def verify_otp(request):
    email = request.data.get('email')
    otp = request.data.get('otp')

    # Verify the OTP
    if otp_storage.get(email) == otp:
        del otp_storage[email]  # Clear OTP after verification
        return Response({'message': 'OTP verified successfully.'})
    else:
        return Response({'message': 'Invalid OTP.'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def signup(request):
    """Handle user signup after OTP verification."""
    email = request.data.get('email')
    password = request.data.get('password')
    profile_picture = request.FILES.get('profile_picture')

    first_name = request.data.get('first_name', None)
    last_name = request.data.get('last_name', None)
    city = request.data.get('city', None)
    country = request.data.get('country', None)
    phone_number = request.data.get('phone_number', None)

    # Candidate fields
    skills = request.data.get('skills', None)
    education = request.data.get('education', None)
    github_link = request.data.get('github_link', None)
    resume = request.FILES.get('resume', None)  # Resume file upload
    score = request.data.get('score', None)  # Assume score is passed

    if User.objects.filter(email=email).exists():
        return Response({'message': 'User with this email already exists.'}, status=status.HTTP_400_BAD_REQUEST)

    # Create User
    user = User(email=email)
    user.set_password(password)  # Ensure password is hashed
    user.role = 'user'  # Set default role (for Candidate)
    user.save()

    # Create Profile
    profile = Profile(
        user=user,
        first_name=first_name,
        last_name=last_name,
        city=city,
        country=country,
        phone_number=phone_number,
        profile_picture=profile_picture,
    )
    profile.save()

    # Create Candidate (linking the candidate to the profile)
    candidate = Candidate(
        profile=profile,  # Use profile instead of user
        skills=skills,
        education=education,
        github_link=github_link,
        resume=resume,
        score=score if score is not None else 0.0  # Provide a default score if none is passed
    )
    candidate.save()

    return Response({'message': 'Signup successfully.'}, status=status.HTTP_201_CREATED)
