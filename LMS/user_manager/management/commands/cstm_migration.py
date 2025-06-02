from django.core.management.base import BaseCommand, CommandError
from user_manager.models import *
from datetime import datetime

class Command(BaseCommand):
    help = 'Make a custom migration'

    def handle(self, *args, **kwargs):     
        students = Student.objects.all()

        for student in students:
            if student.grade_num == 11:
                student.status = "Вып"
            else:
                student.grade_num += 1
        
            student.save()