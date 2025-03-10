# Generated by Django 4.1.6 on 2025-01-14 08:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("user_manager", "0022_student_temp_phone_alter_student_status"),
    ]

    operations = [
        migrations.AlterField(
            model_name="student",
            name="status",
            field=models.CharField(
                choices=[
                    ("Лид", "В работе"),
                    ("Int", "Intermediate"),
                    ("Акт", "Активный"),
                    ("Int_leave", "Intermediate leave"),
                    ("Выб", "Выбыл"),
                ],
                default="Лид",
                max_length=30,
            ),
        ),
    ]
