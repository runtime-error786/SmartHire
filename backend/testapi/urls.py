from django.urls import path
from .views import hello_mustafa

urlpatterns = [
    path('hello/', hello_mustafa),
]
