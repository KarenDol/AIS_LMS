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
from . import views, report

urlpatterns = [
    #System pages
    path('', views.home, name='home'),
    path("login/", views.login_user, name='login_user'),
    path("logout/", views.logout_user, name='logout'),
    path('user_settings/', views.user_settings, name='user_settings'),
    path('404/<error_code>', views.error, name='error'),

    #Student
    path('register_student/', views.register_student, name='register_student'),
    path('card_student/<IIN>/', views.card_student, name='card_student'),
    path('temp_card_std/<IIN>/', views.temp_card_std, name='temp_card_std'),
    path('archive/<IIN>/', views.archive, name='archive'),
    path('arch_back/<IIN>/', views.arch_back, name='arch_back'),

    #Register
    path('register_parent/<IIN>/', views.register_parent, name='register_parent'),
    path('register_contract/<IIN>/', views.register_contract, name='register_contract'),

    #Card view
    path('card_parent/<IIN>/', views.card_parent, name='card_parent'),
    path('card_contract/<IIN>/', views.card_contract, name='card_contract'),

    #API urls
    path('api/user-info/', views.get_user_info, name='get_user_info'),
    re_path(r'^api/serve_static/(?P<filename>.+)$', views.serve_static, name='serve_static'),
    path('export/<grade>/', views.export, name='export'),
    path('bot', report.report, name='report'),

    #Fill documents
    path('sign_doc/<IIN>/', views.sign_doc, name='sign_doc'),
    path('join_doc/<IIN>/', views.join_doc, name='join_doc'),
    path('leave_doc/<IIN>/', views.leave_doc, name='leave_doc'),
    path('fill_contract/<IIN>/', views.fill_contract, name='fill_contract'),
    path('spravka/<IIN>/', views.spravka, name='spravka'),

    #Honors
    path("honors/<IIN>/", views.honors, name='honors'),
    path("delete_honor/<id>/", views.delete_honor, name='delete_honor'),
    path("edit_honor/<id>/", views.edit_honor, name='edit_honor'),
    
    #Others
    path('accept/<IIN>/', views.accept_student, name='accept_student'),
    path('join_fee/<IIN>/', views.join_fee, name='join_fee'),
    path("wa/", views.wa, name='wa'),
    path("wa_exists/<phone>/", views.wa_exists, name='wa_exists'),
]