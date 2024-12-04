from django.contrib import admin
from .models import Applicant, HR_User, Interview
# Register your models here.

admin.site.register(Applicant)
admin.site.register(HR_User)
admin.site.register(Interview)