from .models import Candidate, Change
from .const import *
from .decorators import role_required
from datetime import datetime
from django.contrib import messages
from django.shortcuts import render
from django.http import JsonResponse
from .views_curator import *
import json

@role_required(USER_TYPE_VNSV)
def first_grade(request):
    candidates = list(Candidate.objects.all())
    candidates_list = []
    for candidate in candidates:
        candidate_entry = {
            "pk": candidate.pk,
            "full_name": f"{candidate.student.Last_Name} {candidate.student.First_Name} {candidate.student.Patronim}",
            "status": candidate.status,
            "letter": candidate.letter
        }
        candidates_list.append(candidate_entry)
    
    candidates_json = json.dumps(candidates_list)

    context = {
        'candidates': candidates_json,   
    }
    return render(request, 'user_manager/1_grade.html', context)

@role_required(USER_TYPE_VNSV)
def change_candidate(request, pk):
    try:
        candidate = Candidate.objects.get(pk=pk)
        data = json.loads(request.body)  # Parse JSON data
        boxID = int(data.get('boxID'))
        
        if (boxID<6):
            let_a = candidate.letter
            options = ['?', 'А', 'Ә', 'Б', 'В']
            candidate.letter = options[boxID-1]
            change = Change(candidate=candidate,
                            date_time=datetime.now(), 
                            change_type='let', 
                            let_a=let_a, 
                            let_b=options[boxID-1])
        else:
            candidate.status = not candidate.status
            change = Change(candidate=candidate,
                            date_time=datetime.now(), 
                            change_type='sta', 
                            changed_status = candidate.status)

        candidate.save()
        change.save()
        return JsonResponse({'status': 'success', 'message': 'Successfully updated'}, status=200)
    except Candidate.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Candidate with such id does not exist'}, status=500)