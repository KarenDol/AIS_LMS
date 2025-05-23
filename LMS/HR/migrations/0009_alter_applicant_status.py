# Generated by Django 4.1.6 on 2024-11-14 02:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("HR", "0008_alter_applicant_status"),
    ]

    operations = [
        migrations.AlterField(
            model_name="applicant",
            name="status",
            field=models.CharField(
                choices=[
                    ("Арх", "Архив"),
                    ("Инт", "Интервью"),
                    ("Акт", "Активный"),
                    ("Отк", "Отказано"),
                    ("При", "Принят"),
                ],
                default="Акт",
                max_length=10,
            ),
        ),
    ]
