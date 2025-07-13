from django.core.management.base import BaseCommand, CommandError
from user_manager.models import *
import requests

class Command(BaseCommand):
    help = 'Make a custom migration'

    def handle(self, *args, **kwargs): 
        text = "Здравствуйте, у данных учеников нет договора:\n"

        students = Student.objects.filter(status="Акт", contract__isnull=True)

        if len(students) == 0:
            return

        for student in students:
            text += f"* {student.IIN}, {student.grade_num}{student.grade_let} класс, {student.Last_Name} {student.First_Name}\n"

        text += "У данных учеников нет литера:\n"

        students = Student.objects.filter(status="Акт", grade_let__isnull=True)

        for student in students:
            text += f"* {student.IIN}, {student.grade_num}{student.grade_let} класс, {student.Last_Name} {student.First_Name}\n"


        
        phones = ['77711688687', '77075240534', '77087742340']
        
        url = "https://7103.api.greenapi.com/waInstance7103163711/sendMessage/677efe89a87e474f93b6ca379ea32a364bf6be6020414505bd"

        for phone in phones:
            payload = {"chatId": f"{phone}@c.us", "message": text}
            headers = {'Content-Type': 'application/json'}

            requests.post(url, json=payload, headers=headers)