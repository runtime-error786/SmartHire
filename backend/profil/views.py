from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status
from signup.models import Profile, Candidate, Recruiter, Subscription, User
from getUserData.JWT import CustomJWTAuthentication 
from rest_framework.permissions import IsAuthenticated
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

@api_view(['GET', 'PUT'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_profile(request):
    user = request.user  # Authenticated user

    if not user:
        return Response(
            {'error': 'User not authenticated.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if request.method == 'GET':
        try:
            # Retrieve user data
            user_data = {
                'email': user.email,
                'role': user.role,
                'is_subscription': user.is_subscription
            }

            # Retrieve profile data
            try:
                profile = Profile.objects.get(user=request.user)

                # Handle profile picture URL
                profile_picture = profile.profile_picture.name if profile.profile_picture else None

                
                if profile_picture and "googleusercontent.com" in profile_picture:
                    profile_picture_url = profile_picture  
                elif profile_picture:  
                    profile_picture_url = request.build_absolute_uri(f"/media/{profile_picture}")
                else:
                    profile_picture_url = None 

                profile_data = {
                    'first_name': profile.first_name,
                    'last_name': profile.last_name,
                    'city': profile.city,
                    'country': profile.country,
                    'linkedin_link': profile.linkedin_link,
                    'phone_number': profile.phone_number,
                    'profile_picture': profile_picture_url,
                }
            except Profile.DoesNotExist:
                profile_data = None
            user_data['profile'] = profile_data

            # Retrieve candidate data
            try:
                candidate = Candidate.objects.get(profile=profile)
                candidate_data = {
                    'score': candidate.score,
                    'education': candidate.education,
                    'resume': request.build_absolute_uri(candidate.resume.url) if candidate.resume else None,
                    'skills': candidate.skills,
                    'github_link': candidate.github_link,
                    'experience': profile.bio,
                }
            except Candidate.DoesNotExist:
                candidate_data = None
            user_data['candidate'] = candidate_data

            # Retrieve recruiter data
            try:
                recruiter = Recruiter.objects.get(profile=profile)
                recruiter_data = {
                    'company_name': recruiter.company_name,
                    'company_website': recruiter.company_website,
                }
            except Recruiter.DoesNotExist:
                recruiter_data = None
            user_data['recruiter'] = recruiter_data

            # Retrieve subscription data
            try:
                subscription = Subscription.objects.get(user=user)
                subscription_data = {
                    'start_date': subscription.start_date,
                    'end_date': subscription.end_date,
                    'type': subscription.type,
                }
            except Subscription.DoesNotExist:
                subscription_data = None
            user_data['subscription'] = subscription_data

            return Response(user_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': 'An unexpected error occurred', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

@api_view(['PUT'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user  # Authenticated user
    role = request.data.get('role')
    
    print("User:", user)  # Check user information
    print("Role from request:", role)
    print("Request Data:", request.data)  # Check full request data

    if not user:
        return Response(
            {'error': 'User not authenticated.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    try:
        # Retrieve or create the user's profile
        profile, created = Profile.objects.get_or_create(user=user)
        print("Profile Retrieved or Created:", profile)

        # Update general profile fields
        profile.first_name = request.data.get('first_name', profile.first_name)
        profile.last_name = request.data.get('last_name', profile.last_name)
        profile.city = request.data.get('city', profile.city)
        profile.country = request.data.get('country', profile.country)
        profile.linkedin_link = request.data.get('linkedin_link', profile.linkedin_link)
        profile.phone_number = request.data.get('phone_number', profile.phone_number)
        profile.bio = request.data.get('bio', profile.bio)

        # Handle profile picture update
        if 'profile_picture' in request.FILES:
            profile.profile_picture = request.FILES['profile_picture']

        # Attempt to save profile
        try:
            profile.save()
            print("Profile saved successfully")
        except Exception as save_error:
            print("Error Saving Profile:", save_error)
            return Response(
                {'error': 'Failed to save profile data.', 'details': str(save_error)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Candidate or Recruiter logic
        if role == 'Candidate' or user.role == 'Candidate':
            candidate, _ = Candidate.objects.get_or_create(profile=profile)
            print("Candidate object:", candidate)
            candidate.skills = request.data.get('skills', candidate.skills)
            candidate.education = request.data.get('education', candidate.education)
            candidate.github_link = request.data.get('github_link', candidate.github_link)
            candidate.save()
            print("Candidate profile saved")

        elif role == 'Recruiter' or user.role == 'Recruiter':
            recruiter, _ = Recruiter.objects.get_or_create(profile=profile)
            print("Recruiter object:", recruiter)
            recruiter.company_name = request.data.get('company_name', recruiter.company_name)
            recruiter.company_website = request.data.get('company_website', recruiter.company_website)
            recruiter.save()
            print("Recruiter profile saved")

        # Prepare updated response data
        updated_data = {
            'first_name': profile.first_name,
            'last_name': profile.last_name,
            'city': profile.city,
            'country': profile.country,
            'linkedin_link': profile.linkedin_link,
            'phone_number': profile.phone_number,
            'profile_picture': request.build_absolute_uri(profile.profile_picture.url) if profile.profile_picture else None,
            'skills': candidate.skills if role == 'Candidate' else None,
            'education': candidate.education if role == 'Candidate' else None,
            'github_link': candidate.github_link if role == 'Candidate' else None,
            'bio': profile.bio if role == 'Candidate' else None,
            'company_name': recruiter.company_name if role == 'Recruiter' else None,
            'company_website': recruiter.company_website if role == 'Recruiter' else None,
        }

        return Response({'message': 'Profile updated successfully', 'profile': updated_data}, status=status.HTTP_200_OK)

    except Exception as e:
        print("Unexpected Error:", e)
        return Response(
            {'error': 'An unexpected error occurred while updating', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
