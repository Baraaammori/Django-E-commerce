from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    RegisterView,
    LogoutView,
    ProfileView,
    ChangePasswordView,
    AddressListCreateView,
    AddressDetailView,
)

urlpatterns = [
    # Auth
    path('auth/register/', RegisterView.as_view(), name='auth-register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='auth-login'),
    path('auth/logout/', LogoutView.as_view(), name='auth-logout'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='auth-token-refresh'),

    # Profile
    path('users/profile/', ProfileView.as_view(), name='user-profile'),
    path('users/change-password/', ChangePasswordView.as_view(), name='user-change-password'),

    # Addresses
    path('users/addresses/', AddressListCreateView.as_view(), name='address-list'),
    path('users/addresses/<int:pk>/', AddressDetailView.as_view(), name='address-detail'),
]
