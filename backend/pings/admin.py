from django.contrib import admin
from .models import Ping


@admin.register(Ping)
class PingAdmin(admin.ModelAdmin):
    list_display = ['text', 'user', 'category', 'location', 'timestamp', 'is_anonymous', 'vote_count']
    list_filter = ['category', 'is_anonymous', 'timestamp']
    search_fields = ['text', 'user__username', 'location']
    readonly_fields = ['timestamp', 'vote_count']
    list_per_page = 25
    
    fieldsets = (
        ('Content', {
            'fields': ('text', 'category', 'location')
        }),
        ('User Info', {
            'fields': ('user', 'is_anonymous')
        }),
        ('Metadata', {
            'fields': ('timestamp', 'upvotes', 'downvotes'),
            'classes': ('collapse',)
        }),
    )
