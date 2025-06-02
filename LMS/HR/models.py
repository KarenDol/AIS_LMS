from django.db import models
from django.contrib.auth.models import User
from django.utils.timezone import now

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

class Interview(models.Model):
    applicant = models.OneToOneField(Applicant, on_delete=models.CASCADE)
    date_time = models.DateTimeField()
    interviewers = models.CharField(max_length=200, null=True) #Who took interview
    comment = models.CharField(max_length=300, null=True) #Comments regarding the interview
    salary = models.IntegerField(null=True) #На какую зп договорились
    decision = models.BooleanField(null=True) #Приняли или в архив
    status = models.CharField(max_length=4, choices=[
        ('wait', 'Отложено'), 
        ('neg', 'Отказано'), 
        ('pos', 'Принят'), 
    ], null=True)
    conditions = models.CharField(max_length=300, null=True) #Job conditions

class Position(models.Model):
    title = models.CharField(max_length=100)
    salary_status = models.BooleanField()
    salary = models.IntegerField(null=True)
    experience = models.CharField(max_length=15, choices=[
        ('exp1', 'Без опыта'), 
        ('exp2', '1-2 года'), 
        ('exp3', '3-5 лет'),
        ('exp4', 'Более 5 лет'), 
    ])
    description = models.JSONField()  #To store Delta object as JSON
    requirements = models.JSONField()  #To store Delta object as JSON
    date = models.DateField(default=now) #Date of publication
    status = models.CharField(max_length=15, choices=[
        ('act', 'Активный'), 
        ('arc', 'Архив'), 
    ], default='act')