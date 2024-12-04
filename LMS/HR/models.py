from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Applicant(models.Model):
    iin = models.CharField(max_length=12, primary_key=True)
    last_name = models.CharField(max_length=40)
    first_name = models.CharField(max_length=30)
    patronim = models.CharField(max_length=40, null=True)
    lang = models.CharField(max_length=10, choices=[
        ('Рус', 'Русский'),
        ('Каз', 'Казахский'),
    ]) 
    phone = models.CharField(max_length=20)
    exp_salary = models.IntegerField()
    position = models.CharField(max_length=70)
    status = models.CharField(max_length=10, choices=[
        ('Арх', 'Архив'), #Отказ без интервью
        ('Инт', 'Интервью'), #Назначено интервью
        ('Акт', 'Активный'), #Заявка к рассмотрению 
        ('Отк', 'Отказано'), #Отказ после интервью
        ('При', 'Принят') #Принят на работу
    ],  default='Акт')
    appl_date = models.DateField() #Date of the application

class HR_User(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=150)
    picture = models.CharField(max_length=150, default='Avatar.png') #user_picture
    user_type = models.CharField(max_length=50, choices=[
        ('HR', 'HR Manager'),
    ])
    phone = models.CharField(max_length=20, null=True)
    email = models.CharField(max_length=100, null=True)

class Interview(models.Model):
    applicant = models.OneToOneField(Applicant, on_delete=models.CASCADE)
    date_time = models.DateTimeField()
    interviewers = models.CharField(max_length=200, null=True) #Who took interview
    comment = models.CharField(max_length=300, null=True) #Comments regarding the interview
    salary = models.IntegerField(null=True) #На какую зп договорились
    decision = models.BooleanField(null=True) #Приняли или в архив
    conditions = models.CharField(max_length=300, null=True) #Job conditions