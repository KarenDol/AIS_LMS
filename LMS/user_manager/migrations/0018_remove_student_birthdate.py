# Generated by Django 4.1.6 on 2024-11-24 05:34

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        (
            "user_manager",
            "0017_alter_parent_position_alter_parent_working_place_and_more",
        ),
    ]

    operations = [
        migrations.RemoveField(model_name="student", name="birthdate",),
    ]
