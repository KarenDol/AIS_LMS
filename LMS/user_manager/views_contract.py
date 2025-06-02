from .models import Student, Parent, Contract
from .const import *
from .decorators import role_required
from .helpers import get_student_or_redirect
from datetime import datetime
from django.contrib import messages
from django.shortcuts import render, redirect
from django.forms.models import model_to_dict
from .views_curator import *
import json

@role_required(USER_TYPE_VNSV)
def register_contract(request, IIN):
    student = get_student_or_redirect(IIN)
    if isinstance(student, redirect.__class__):
        return student
    
    if (student.parent == None):
        messages.error(request, "Необходимо сначала добавить родителя")
        return redirect('register_parent', IIN=IIN)
    
    if student.contract: #If contract already exists
        return redirect('error', prev_page='home', error_code='Договор для данного ученика уже составлен')

    if request.method == 'POST':
        date = str(datetime.now())
        numb = date[2:4] + date[5:7] + date[8:10] + date[11:13] + date[14:16] + date[17:19]
        sign_date = request.POST['sign_date']
        first_date = request.POST['first_date']
        last_date = request.POST['last_date']
        total = request.POST['total']
        discount = request.POST['discount']
        monthly = request.POST['monthly']
        join_fee = request.POST['join_fee']
        new_contract = Contract(numb=numb, sign_date=sign_date, first_date=first_date, last_date=last_date,
                                total=total, discount=discount, monthly=monthly, join_fee=join_fee)
        new_contract.save()
        student.contract = new_contract
        student.status = 'Акт'
        student.save()
        return redirect('home')
    else:
        context = {
            'IIN': IIN, 
            'today': str(datetime.today()),
        }
        return render(request, 'user_manager/contract.html', context)

@role_required(USER_TYPE_VNSV)
def card_contract(request, IIN):
    student = get_student_or_redirect(IIN)
    if isinstance(student, redirect.__class__):
        return student

    if (student.contract == None):
        messages.error(request, "Договора нет в системе")
        return redirect('register_contract', IIN=IIN)
    contract = student.contract
    
    if request.method == 'POST':
        sign_date = request.POST['sign_date']
        first_date = request.POST['first_date']
        last_date = request.POST['last_date']
        total = request.POST['total']
        discount = request.POST['discount']
        monthly = request.POST['monthly']
        join_fee = request.POST['join_fee']
        
        contract.sign_date = sign_date
        contract.first_date = first_date
        contract.last_date = last_date
        contract.total = total
        contract.discount = discount
        contract.monthly = monthly
        contract.join_fee = join_fee

        contract.save()
        return redirect('card_contract', IIN=IIN)
    else:
        contract_dict = model_to_dict(contract)  # Convert the Contract object to a dictionary
        #serialize dates
        contract_dict['sign_date'] = contract_dict['sign_date'].isoformat()
        contract_dict['first_date'] = contract_dict['first_date'].isoformat()
        contract_dict['last_date'] = contract_dict['last_date'].isoformat()
        contract_json = json.dumps(contract_dict) # Serialize it to JSON
        context = {
            'contract': contract_json,
            'IIN': IIN,
        }
        return render(request, 'user_manager/contract.html', context)

@role_required(USER_TYPE_VNSV)
def join_fee(request, IIN):
    student = get_student_or_redirect(IIN)
    if isinstance(student, redirect.__class__):
        return student

    if (student.contract == None):
        messages.error(request, "Договора нет в системе")
        return redirect('register_contract', IIN=IIN)
    contract = student.contract
    
    if (contract.join_fee_status):
        contract.join_fee_status = False
    else:
        contract.join_fee_status = True
    contract.save()
    return redirect('edit_contract', IIN=IIN)