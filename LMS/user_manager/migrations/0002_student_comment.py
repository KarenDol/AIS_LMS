# Generated by Django 4.2.7 on 2024-07-04 13:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("user_manager", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="student",
            name="comment",
            field=models.CharField(max_length=200, null=True),
        ),
    ]