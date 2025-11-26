from django.core.management.base import BaseCommand, CommandError
from user_manager.models import *
from datetime import datetime
from django.utils import timezone
import requests
from django.http import JsonResponse
import json
from django.db.models import Prefetch

class Command(BaseCommand):
    help = 'Generate report'

    def handle(self, *args, **kwargs):
        def format_grade(num, let):
            """Return grade like '7А' or just '7' if letter missing."""
            return f"{num}{(let or '')}".strip()

        def build_school_report(school_code: str, school_title: str) -> str:
            # Today's date (uses Django timezone)
            date = timezone.localdate()

            students = Student.objects.filter(school=school_code)

            total = 0  # total active students
            act = 0    # accepted today
            lid = 0    # consultations today (leads)
            arc = 0    # archived/withdrawn today

            act_array, lid_array, arc_array = [], [], []

            for s in students:
                if s.status == "Акт":
                    total += 1
                    if getattr(s, "date", None) == date:
                        if getattr(s, "contract", None):
                            act_array.append(
                                f"• {s.Last_Name} {s.First_Name}, {format_grade(s.grade_num, s.grade_let)} класс — {s.contract.monthly} тг"
                            )
                        else:
                            act_array.append(
                                f"• {s.Last_Name} {s.First_Name}, {format_grade(s.grade_num, s.grade_let)} класс — оплата ещё не добавлена"
                            )
                        act += 1

                elif s.status == "Лид":
                    if getattr(s, "date", None) == date:
                        lid_array.append(
                            f"• {s.Last_Name} {s.First_Name} — {s.grade_num} класс"
                        )
                        lid += 1

                else:
                    # archived/other statuses today
                    if getattr(s, "date", None) == date:
                        arc_array.append(
                            f"• {s.Last_Name} {s.First_Name}, {format_grade(s.grade_num, s.grade_let)} класс — {getattr(s, 'comment', '')}"
                        )
                        arc += 1

            # Build pretty WhatsApp-friendly text
            lines = []
            lines.append(f"🏫 *{school_title}*")
            lines.append(f"📅 {date.strftime('%d.%m.%Y')}")
            lines.append("")  # spacer

            lines.append(f"🧭 Консультации: *{lid}*")
            if lid_array:
                lines += lid_array

            lines.append("")  # spacer
            lines.append(f"🟢 Приняты в школу: *{act}*")
            if act_array:
                lines += act_array

            lines.append("")  # spacer
            lines.append(f"🔻 Выбывшие: *{arc}*")
            if arc_array:
                lines += arc_array

            lines.append("")  # spacer
            lines.append(f"📚 Итого обучается: *{total}*")

            return "\n".join(lines)

        # Phones to notify
        phones = ['77711688687', '77015665811', '77028272562', '77784556597', '77758358229', '77002168339']
        # phones = ['77711688687']  # test mode

        # Green-API endpoint (remove stray leading whitespace if present)
        url = "https://7103.api.greenapi.com/waInstance7103163711/sendMessage/677efe89a87e474f93b6ca379ea32a364bf6be6020414505bd"
        headers = {'Content-Type': 'application/json'}

        # Build reports for both schools
        report_sch = build_school_report("sch", "Школа")
        report_lyc = build_school_report("lyc", "Лицей")

        # Final combined message (separate with a line)
        text = (
            f"*Ежедневный отчёт*\n"
            f"{report_sch}\n"
            f"\n────────────────────\n\n"
            f"{report_lyc}"
        )

        for phone in phones:
            payload = {"chatId": f"{phone}@c.us", "message": text}
            try:
                requests.post(url, json=payload, headers=headers, timeout=10)
            except Exception as e:
                # Optional: log or handle failures
                print(f"Failed to send to {phone}: {e}")