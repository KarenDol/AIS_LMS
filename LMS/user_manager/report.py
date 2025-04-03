from .models import *
from datetime import datetime
import requests
from django.http import JsonResponse
import json

def report(request):
    try:
        # Get today's date and time
        today = datetime.today()

        # Get only the date
        date = today.date()

        students = Student.objects.all()
        total = 0 #counter of total number of active students in school
        act = 0 #counter of students accepted today
        act_array = []
        lid = 0 #counter of lid students
        lid_array = [] #info
        arc = 0 #counter of archive students
        arc_array = [] #info
        for student in students:
            if student.status == "Акт":
                total += 1
                if student.date == date:
                    act_array.append(f"* {student.Last_Name} {student.First_Name}, {student.grade_num}{student.grade_let} класс: {student.contract.monthly} тг\n")
                    act += 1
            elif student.status == "Лид":
                if student.date == date:
                    lid_array.append(f"* {student.Last_Name} {student.First_Name}: {student.grade_num} класс\n")
                    lid += 1
            else:
                if student.date == date:
                    arc_array.append(f"* {student.Last_Name} {student.First_Name}, {student.grade_num}{student.grade_let} класс: {student.comment}\n")
                    arc += 1
        
        text = f"{date}, репорт: \n"
        text += f"Количество консультаций - {lid}: \n"
        for student in lid_array:
            text += student
        text += f"Количество принятых в школу - {act}: \n"
        for student in act_array:
            text += student
        text += f"Количество выбывших - {arc}: \n"
        for student in arc_array:
            text += student
        text += f"Итого в школе обучается - {total} учеников"

        phones = ['77711688687', '77015665811', '77028272562', '77784556597', '77075240534']
        url = "	https://7103.api.greenapi.com/waInstance7103163711/sendMessage/677efe89a87e474f93b6ca379ea32a364bf6be6020414505bd"

        for phone in phones:
            payload = {"chatId": f"{phone}@c.us", "message": text}
            headers = {'Content-Type': 'application/json'}

            requests.post(url, json=payload, headers=headers)
        
        # Return a success response
        return JsonResponse({'status': 'success', 'message': 'Data received successfully'})

    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON data'}, status=400)
    
