# Generated by Django 4.2.7 on 2024-09-10 05:09

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("user_manager", "0007_remove_student_letter_alter_student_grade"),
    ]

    operations = [
        migrations.RemoveField(model_name="student", name="parent_2",),
    ]
