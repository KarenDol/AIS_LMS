"""LMS URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path, re_path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('apply/', views.apply, name='apply'),
    path('email/<iin>/', views.send_email, name='send_email'),
    path("login/", views.login_user, name='login_user'), 
    path("logout/", views.logout_user, name='logout'),
    path("applicant_card/<iin>/", views.applicant_card, name='applicant_card'),
    path('404/<error_code>', views.error, name='error'),
    path("card_review/<iin>/", views.card_review, name='card_review'),
    path("appoint_int/<iin>/", views.appoint_int, name='appoint_int'),
    path("report_int/<iin>/", views.report_int, name='report_int'),

    #serve static api
    path("cv/<iin>/", views.cv, name='cv'),
]