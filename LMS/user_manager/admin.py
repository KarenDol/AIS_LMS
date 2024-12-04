from django.contrib import admin
from .models import Student, Parent, Contract, List_Of_Students, LMS_User
# Register your models here.
admin.site.register(Student)
admin.site.register(Parent)
admin.site.register(Contract)
admin.site.register(LMS_User)
admin.site.register(List_Of_Students)