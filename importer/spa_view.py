"""
Simple SPA view to serve React application for all routes
"""
from django.views.generic import TemplateView


class SPAView(TemplateView):
    """
    Serves the base template for the React SPA.
    React Router handles all client-side routing.
    """
    template_name = "base.html"
