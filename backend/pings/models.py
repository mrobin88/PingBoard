from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MaxLengthValidator

User = get_user_model()

CATEGORY_CHOICES = [
    ('event', 'Event'),
    ('sale', 'Sale'),
    ('help', 'Help'),
    ('misc', 'Misc'),
]


class Ping(models.Model):
    text = models.TextField(max_length=280, validators=[MaxLengthValidator(280)])
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pings')
    location = models.CharField(max_length=100, blank=True)
    is_anonymous = models.BooleanField(default=False)
    upvotes = models.ManyToManyField(User, related_name='upvoted_pings', blank=True)
    downvotes = models.ManyToManyField(User, related_name='downvoted_pings', blank=True)
    hashtags = models.CharField(max_length=500, blank=True)  # Store hashtags for SEO
    seo_description = models.TextField(blank=True)  # AI-generated SEO description
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['-timestamp']),
            models.Index(fields=['category']),
            models.Index(fields=['location']),
        ]

    def __str__(self):
        return f"{self.text[:50]}... by {self.user.username if not self.is_anonymous else 'Anonymous'}"

    @property
    def vote_count(self):
        return self.upvotes.count() - self.downvotes.count()

    @property
    def display_name(self):
        return 'Anonymous' if self.is_anonymous else self.user.username
