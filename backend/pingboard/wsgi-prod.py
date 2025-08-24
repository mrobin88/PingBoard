"""
WSGI config for PingBoard production deployment
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pingboard.settings-prod')

application = get_wsgi_application()
