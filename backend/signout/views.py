from django.http import JsonResponse
from rest_framework.decorators import api_view

@api_view(['POST'])
def logout_view(request):
    response = JsonResponse({"message": "Logged out successfully"})
    
    response.delete_cookie('access', path='/')  
    
    response.set_cookie('access', '', httponly=True,
                secure=True,  
                samesite='None', 
                max_age=0,
                path='/') 
    response["Access-Control-Allow-Origin"] = "http://localhost:3000"
    response["Access-Control-Allow-Credentials"] = "true"
    response["Access-Control-Allow-Headers"] = "content-type"
    return response
