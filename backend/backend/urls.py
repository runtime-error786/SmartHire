"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from signup.views import signup,send_otp,verify_otp
from django.conf.urls.static import static
from django.conf import settings
from signin.views import sign_in,send_otp_signin,verify_otp_signin,reset_password,decode_jwt
from getUserData.views import get_user_data,get_user_role
from signout.views import logout_view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('testapi.urls')),  
    path('signup/', signup, name='signup'),
    path('send_otp/', send_otp, name='send_otp'),
    path('verify_otp/', verify_otp, name='verify_otp'),
    path('login/', sign_in, name='login'),
    path('send-otp_signin/', send_otp_signin, name='send-otp'),
    path('verify-otp_signin/', verify_otp_signin, name='verify-otp'),
    path('forgot-password/', reset_password, name='reset-password'),
    path('decode-jwt/', decode_jwt, name='decode_jwt'),
    path('get_picture/',get_user_data,name='get_user_data'),
    path('get_user_role/',get_user_role,name='get_role'),
    path('logout/', logout_view, name='logout')
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)