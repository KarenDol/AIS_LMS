from django.core.management.base import BaseCommand, CommandError
from user_manager.models import *
import requests

class Command(BaseCommand):
    help = 'Make a custom migration'

    def handle(self, *args, **kwargs): 
        text = ""

        students = Student.objects.filter(status="Акт", contract__isnull=True)
        if students.exists():
            text = "У данных учеников нет договора:\n"
            
            for student in students:
                text += f"* {student.IIN}, {student.grade_num}{student.grade_let} класс, {student.Last_Name} {student.First_Name}\n"

        students = Student.objects.filter(status="Акт", grade_let__isnull=True)
        if students.exists():
            text += "У данных учеников нет литера:\n"

            for student in students:
                text += f"* {student.IIN}, {student.grade_num}{student.grade_let} класс, {student.Last_Name} {student.First_Name}\n"

        if not text:
            return

        phones = ['77711688687', '77002168339', '77758358229']
        
        url = "https://7103.api.greenapi.com/waInstance7103163711/sendMessage/677efe89a87e474f93b6ca379ea32a364bf6be6020414505bd"

        for phone in phones:
            payload = {"chatId": f"{phone}@c.us", "message": text}
            headers = {'Content-Type': 'application/json'}

            requests.post(url, json=payload, headers=headers)