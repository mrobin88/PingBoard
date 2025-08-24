from rest_framework import serializers
from .models import Ping
from users.serializers import UserSerializer


class PingSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    display_name = serializers.ReadOnlyField()
    vote_count = serializers.ReadOnlyField()
    user_has_upvoted = serializers.SerializerMethodField()
    user_has_downvoted = serializers.SerializerMethodField()

    class Meta:
        model = Ping
        fields = [
            'id', 'text', 'category', 'timestamp', 'user', 'location',
            'is_anonymous', 'display_name', 'vote_count',
            'user_has_upvoted', 'user_has_downvoted'
        ]
        read_only_fields = ['id', 'timestamp', 'user', 'vote_count']

    def get_user_has_upvoted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.upvotes.filter(id=request.user.id).exists()
        return False

    def get_user_has_downvoted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.downvotes.filter(id=request.user.id).exists()
        return False


class PingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ping
        fields = ['text', 'category', 'location', 'is_anonymous']


class PingUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ping
        fields = ['text', 'category', 'location']


class VoteSerializer(serializers.Serializer):
    vote_type = serializers.ChoiceField(choices=['upvote', 'downvote', 'remove'])
