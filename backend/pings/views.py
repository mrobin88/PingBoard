from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django_filters.rest_framework import DjangoFilterBackend
from .models import Ping
from .serializers import (
    PingSerializer, PingCreateSerializer, PingUpdateSerializer, VoteSerializer
)


class PingListCreateView(generics.ListCreateAPIView):
    queryset = Ping.objects.all()
    serializer_class = PingSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'location']
    search_fields = ['text', 'location']
    ordering_fields = ['timestamp', 'vote_count']
    ordering = ['-timestamp']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PingCreateSerializer
        return PingSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class PingDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Ping.objects.all()
    serializer_class = PingSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return PingUpdateSerializer
        return PingSerializer

    def perform_update(self, serializer):
        serializer.save(user=self.request.user)

    def perform_destroy(self, instance):
        if instance.user == self.request.user:
            instance.delete()
        else:
            raise permissions.PermissionDenied("You can only delete your own pings.")


class UserPingsView(generics.ListAPIView):
    serializer_class = PingSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['category']
    ordering_fields = ['timestamp', 'vote_count']
    ordering = ['-timestamp']

    def get_queryset(self):
        return Ping.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def vote_ping(request, pk):
    try:
        ping = Ping.objects.get(pk=pk)
    except Ping.DoesNotExist:
        return Response({'error': 'Ping not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = VoteSerializer(data=request.data)
    if serializer.is_valid():
        vote_type = serializer.validated_data['vote_type']
        user = request.user

        if vote_type == 'upvote':
            ping.downvotes.remove(user)
            ping.upvotes.add(user)
        elif vote_type == 'downvote':
            ping.upvotes.remove(user)
            ping.downvotes.add(user)
        elif vote_type == 'remove':
            ping.upvotes.remove(user)
            ping.downvotes.remove(user)

        return Response({
            'message': f'{vote_type} successful',
            'vote_count': ping.vote_count
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
