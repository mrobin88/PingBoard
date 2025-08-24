from django.urls import path
from . import views

urlpatterns = [
    path('pings/', views.PingListCreateView.as_view(), name='ping-list-create'),
    path('pings/<int:pk>/', views.PingDetailView.as_view(), name='ping-detail'),
    path('pings/<int:pk>/vote/', views.vote_ping, name='ping-vote'),
    path('pings/user/', views.UserPingsView.as_view(), name='user-pings'),
]
