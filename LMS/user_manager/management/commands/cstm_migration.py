from django.core.management.base import BaseCommand, CommandError
from user_manager.models import *
from datetime import datetime, date

class Command(BaseCommand):
    help = 'Make a custom migration'

    def handle(self, *args, **kwargs):  
        users = User.objects.all()

        count = 0
        for user in users:
            if len(user.username) == 12:
                user.delete()
                count += 1

        print(count)