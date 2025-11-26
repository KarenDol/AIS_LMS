from django.core.management.base import BaseCommand, CommandError
from user_manager.models import *
from datetime import datetime, date

class Command(BaseCommand):
    help = 'Make a custom migration'

    def handle(self, *args, **kwargs):     
        students = Student.objects.filter(school='lyc', status='Акт')        
        count=0
        for student in students:
            contract = student.contract
            if (contract):
                if contract.sign_date < date(2024, 12, 12):
                    contract.sign_date = date(2025, 8, 31)
                    count+=1
                    contract.save()
        print(count)