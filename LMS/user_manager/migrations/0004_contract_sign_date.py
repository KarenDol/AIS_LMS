# Generated by Django 4.2.7 on 2024-09-02 10:42

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        (
            "user_manager",
            "0003_rename_id_contract_numb_remove_contract_sign_date_and_more",
        ),
    ]

    operations = [
        migrations.AddField(
            model_name="contract",
            name="sign_date",
            field=models.DateField(default=datetime.date(2024, 8, 1)),
            preserve_default=False,
        ),
    ]
