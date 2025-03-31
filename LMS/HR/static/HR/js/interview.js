document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('mainForm');
    const interviewers = document.getElementById('interviewers');
    const comment = document.getElementById('comment');
    const wait = document.getElementById('wait');
    const neg = document.getElementById('neg');
    const pos = document.getElementById('pos');
    const salCond = document.getElementById('salCond');
    const salary = document.getElementById('salary');
    const conditions = document.getElementById('conditions');
    const button_cancel = document.getElementById('button_cancel');
    const buttons_edit = document.getElementById('buttons_edit');
    const button_back = document.getElementById('button_back');

    if (interview.status){
        interviewers.value = interview.interviewers;
        interviewers.disabled = true;
        comment.value = interview.comment;
        comment.disabled = true;
        if (interview.status !== 'wait'){
            wait.disabled = true;
            neg.disabled = true;
            pos.disabled = true;

            if (interview.status === 'pos') {
                salCond.classList.remove('hidden');
                salCond.classList.add('visible');

                salary.value = interview.salary;
                salary.value =  salary.value.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
                salary.disabled = true;
                conditions.value = interview.conditions;
                conditions.disabled = true;

                pos.checked = true;
            }
            else{
                neg.checked = true;
            }

            //Switch button groups' displays
            buttons_edit.style.display = "none";
            button_back.style.display = "block";
        }
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (checkInputs()) {
            form.submit();
        }
    });

    interviewers.addEventListener('input', () => {
        validateField(interviewers, interviewers.value.trim() !== '', 'Заполните данное поле');
    });

    comment.addEventListener('input', () => {
        validateField(comment, comment.value.trim() !== '', 'Заполните данное поле');
    });

    salary.addEventListener('input', () => {
        salary.value = salary.value.replace(/[^0-9]/g, '');
        salary.value =  salary.value.replace(/\B(?=(\d{3})+(?!\d))/g, ' '); // Add spaces as thousand separators
        validateField(salary, salary.value.trim() !== '', 'Заполните данное поле');
    });

    conditions.addEventListener('input', () => {
        validateField(conditions, conditions.value.trim() !== '', 'Заполните данное поле');
    });

    function checkInputs() {
        let isValid = true;
        validateField(interviewers, interviewers.value.trim() !== '', 'Это поле не может быть пустым');
        validateField(comment, comment.value.trim() !== '', 'Это поле не может быть пустым');

        //To ensure that conditions and salary fields will not cause any problems
        validateField(conditions, true, '');
        validateField(salary, true, '');

        //If positive descision, validate conditions and salary fields
        if (pos.checked) {
            validateField(salary, salary.value.trim() !== '', 'Это поле не может быть пустым');
            validateField(conditions, conditions.value.trim() !== '', 'Это поле не может быть пустым');
        }

        document.querySelectorAll('.form-control').forEach((control) => {
            if (control.classList.contains('error')) {
                isValid = false;
            }
        });

        return isValid;
    }

    function validateField(input, condition, errorMessage) {
        if (condition) {
            setSuccess(input);
        } else {
            setError(input, errorMessage);
        }
    }

    function setError(input, message) {
        const formControl = input.parentElement;
        const icon = formControl.querySelector('.icon');
        formControl.className = 'form-control error';
        icon.className = 'icon fas fa-times-circle';
        input.placeholder = message;
    }

    function setSuccess(input) {
        const formControl = input.parentElement;
        const icon = formControl.querySelector('.icon');
        formControl.className = 'form-control success';
        icon.className = 'icon fas fa-check-circle';
    }

    pos.addEventListener('change', () => {
        if (pos.checked) {
            alert('Важно: Кандидат получит сообщение в WhatsApp с результатом интервью');
            salCond.classList.remove('hidden');
            salCond.classList.add('visible');
        }
    });

    neg.addEventListener('change', () => {
        if (neg.checked) {
            alert('Важно: Кандидат получит сообщение в WhatsApp с результатом интервью');
            salCond.classList.remove('visible');
            salCond.classList.add('hidden');
        }
    });

    wait.addEventListener('change', () => {
        if (wait.checked) {
            salCond.classList.remove('visible');
            salCond.classList.add('hidden');
        }
    });

    button_cancel.addEventListener('click', (event) => {
        event.preventDefault();
        window.location.href = `/hr/applicant_card/${iin}`;
    })
});