from django.urls import path
from . import views

urlpatterns = [
    path('users/register/', views.UserRegistrationView.as_view(), name='user-register'),
    path('users/profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('users/change-password/', views.change_password, name='change-password'),
]
