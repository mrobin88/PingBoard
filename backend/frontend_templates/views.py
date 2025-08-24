from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from pings.models import Ping
from users.forms import CustomUserCreationForm
import re

# Create your views here.

def home(request):
    if request.user.is_authenticated:
        return redirect('app')
    return render(request, 'frontend_templates/home.html')

def login_view(request):
    if request.user.is_authenticated:
        return redirect('app')
    
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('app')
        else:
            messages.error(request, 'Invalid username or password.')
    return render(request, 'frontend_templates/login.html')

def register_view(request):
    if request.user.is_authenticated:
        return redirect('app')
        
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            messages.success(request, f'Account created for {username}! Please log in.')
            return redirect('login')
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        form = CustomUserCreationForm()
    return render(request, 'frontend_templates/register.html', {'form': form})

@login_required
def app_view(request):
    if request.method == 'POST':
        text = request.POST.get('text', '').strip()
        if text:
            # Extract hashtags
            hashtags = re.findall(r'#(\w+)', text)
            
            # Create ping
            ping = Ping.objects.create(
                text=text,
                user=request.user,
                category='misc'  # Default category
            )
            
            # If hashtags found, generate SEO meta tags
            if hashtags:
                ping.hashtags = ','.join(hashtags)
                ping.save()
                
                # Generate SEO description (AI-like expansion)
                seo_description = generate_seo_description(text, hashtags)
                ping.seo_description = seo_description
                ping.save()
            
            messages.success(request, 'Ping posted successfully!')
            return redirect('app')
    
    # Get user's pings and recent pings
    user_pings = Ping.objects.filter(user=request.user).order_by('-timestamp')[:10]
    recent_pings = Ping.objects.all().order_by('-timestamp')[:20]
    
    return render(request, 'frontend_templates/app.html', {
        'user_pings': user_pings,
        'recent_pings': recent_pings
    })

def logout_view(request):
    logout(request)
    return redirect('home')

def generate_seo_description(text, hashtags):
    """Generate SEO description based on content and hashtags"""
    # Simple AI-like expansion (can be enhanced later)
    base_text = text.replace('#', '')
    
    hashtag_expansions = {
        'tech': 'technology insights and updates',
        'news': 'latest news and current events',
        'business': 'business strategies and market insights',
        'health': 'health and wellness tips',
        'travel': 'travel experiences and destinations',
        'food': 'culinary delights and recipes',
        'sports': 'sports news and analysis',
        'music': 'music reviews and recommendations',
        'books': 'book reviews and reading recommendations',
        'movies': 'film reviews and entertainment news'
    }
    
    expansions = []
    for hashtag in hashtags:
        if hashtag.lower() in hashtag_expansions:
            expansions.append(hashtag_expansions[hashtag.lower()])
    
    if expansions:
        return f"{base_text}. Explore {', '.join(expansions)}."
    
    return f"{base_text}. Discover insights and discussions on this topic."
