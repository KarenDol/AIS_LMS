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
from . import views, views_student, views_parent, views_contract, views_honors, views_candidate, views_whatsapp, views_documents

urlpatterns = [
    #System pages
    path('', views.home, name='home'),
    path("login/<prev_page>", views.login_user, name='login_user'),
    path("logout/<prev_page>", views.logout_user, name='logout_user'),
    path('user_settings/', views.user_settings, name='user_settings'),
    path('404/<prev_page>/<error_code>/', views.error, name='error'),
    path('change_school', views.change_school, name='change_school'),

    #Student
    path('register_student/', views_student.register_student, name='register_student'),
    path('card_student/<IIN>/', views_student.card_student, name='card_student'),
    path('temp_card_std/<IIN>/',views_student.temp_card_std, name='temp_card_std'),
    path('accept/<IIN>/', views_student.accept_student, name='accept_student'),
    path('archive/<IIN>/', views_student.archive, name='archive'),
    path('arch_back/<IIN>/', views_student.arch_back, name='arch_back'),
    path('1_grade/', views_candidate.first_grade, name='1_grade'),
    path('change_candidate/<pk>/', views_candidate.change_candidate, name='change_candidate'),

    #Parent
    path('register_parent/<IIN>/', views_parent.register_parent, name='register_parent'),
    path('card_parent/<IIN>/', views_parent.card_parent, name='card_parent'),

    #Contract
    path('register_contract/<IIN>/', views_contract.register_contract, name='register_contract'),
    path('card_contract/<IIN>/', views_contract.card_contract, name='card_contract'),

    #API urls
    path('api/user-info/', views.get_user_info, name='get_user_info'),
    re_path(r'^api/serve_static/(?P<filename>.+)$', views.serve_static, name='serve_static'),
    re_path(r'^api/serve_pdf/(?P<filename>.+)$', views.serve_pdf, name='serve_pdf'),
    path('export/<grade>/', views_documents.export, name='export'),
    path('student_exists/', views.student_exists, name='student_exists'),
    path('verify_phone/', views.verify_phone, name='verify_phone'),

    #Fill documents
    path('join_doc/<IIN>/', views_documents.join_doc, name='join_doc'),
    path('leave_doc/<IIN>/', views_documents.leave_doc, name='leave_doc'),
    path('fill_contract/<IIN>/<numb>/', views_documents.fill_contract, name='fill_contract'),
    path('spravka/', views_documents.spravka, name='spravka'), #Spravka Page
    path('get_spravka/', views_documents.get_spravka, name='get_spravka'), #Spravka Document
    path('sign_doc/<IIN>/', views_documents.sign_doc, name='sign_doc'),

    #Journals
    path("journals/<IIN>/", views_honors.journals, name='journals'),
    path("delete_journal/<id>/", views_honors.delete_journal, name='delete_journal'),
    path("edit_journal/<id>/", views_honors.edit_journal, name='edit_journal'),
    
    #Others
    path('join_fee/<IIN>/', views_contract.join_fee, name='join_fee'),

    #WhatsApp
    path("wa_exists/<phone>/", views_whatsapp.wa_exists, name='wa_exists'),
    path("get_numbers/", views_whatsapp.get_numbers, name='get_numbers'),
    path("whatsapp/", views_whatsapp.whatsapp, name="whatsapp"),
]