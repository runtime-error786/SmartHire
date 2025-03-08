from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status
from signup.models import Profile,User
from .JWT import CustomJWTAuthentication 

@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_user_data(request):

    if not request.user.is_authenticated:
        return Response({"error": "User not authenticated."}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        profile = Profile.objects.get(user=request.user)

        profile_picture = profile.profile_picture.name if profile.profile_picture else None

        if profile_picture and "googleusercontent.com" in profile_picture:
            profile_picture_url = profile_picture  
        elif profile_picture:  
            profile_picture_url = request.build_absolute_uri(f"/media/{profile_picture}")
        else:
            profile_picture_url = None 


        user_data = {
            "first_name": profile.first_name,
            "email": request.user.email,
            "profile_picture": profile_picture_url,
        }
        return Response({"user_data": user_data}, status=status.HTTP_200_OK)

    except Profile.DoesNotExist:
        return Response({"error": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)




@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_user_role(request):
    user_role_param = request.query_params.get('role')
    user = request.user  
    if not user_role_param or not user:
        return Response(
            {'error': 'User role or user ID not provided.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        if user.role == 'user':
            if user_role_param == 'Guest':
                return Response({'role': 'Candidate'}, status=status.HTTP_200_OK)
            elif user_role_param == 'admin':
                return Response({'role': 'admin'}, status=status.HTTP_200_OK)
            elif user_role_param == 'Candidate':
                return Response({'role': 'Candidate'}, status=status.HTTP_200_OK)
            elif user_role_param == 'Recruiter':
                return Response({'role': 'Recruiter'}, status=status.HTTP_200_OK)
            else:
                return Response({'role': 'Guest'}, status=status.HTTP_400_BAD_REQUEST)
        if user.role == 'admin':
            if user_role_param == 'Guest':
                return Response({'role': 'admin'}, status=status.HTTP_200_OK)
            if user_role_param == 'admin':
                return Response({'role': 'admin'}, status=status.HTTP_200_OK)
        else:
            return Response({'role': 'Guest'}, status=status.HTTP_200_OK) 

    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)