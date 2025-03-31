document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('mainForm');
    const title = document.getElementById('title');
    const checkbox = document.getElementById('salary_status');
    const salaryInput = document.getElementById('salary-input');
    const salary = document.getElementById('salary');
    const desc_input = document.getElementById('desc-input');
    const req_input = document.getElementById('req-input');

    const button_cancel = document.getElementById('button_cancel');
    button_cancel.addEventListener('click', (event) => {
        event.preventDefault();
        window.location.href = '/hr/jobs';
    })

    checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
            salaryInput.style.display = 'none';
        }
        else{
            salaryInput.style.display = 'flex';
        }
    })

    salary.addEventListener('input', () => {
        salary.value = salary.value.replace(/[^0-9]/g, '');
        salary.value =  salary.value.replace(/\B(?=(\d{3})+(?!\d))/g, ' '); // Add spaces as thousand separators
        validateField(salary, salary.value.trim() !== '', 'Введите желаемую заработную плату');
    });

    function checkInputs() {
        let isValid = true;
        if (title.value === ''){ isValid = false };
        if ((checkbox.checked===false) && (salary.value==='')){ isValid = false};
        const desc_delta = desc_editor.getContents();
        if (desc_delta.ops.length === 1 && desc_delta.ops[0].insert === "\n") {
            isValid = false;
        }
        const req_delta = req_editor.getContents();
        if (req_delta.ops.length === 1 && req_delta.ops[0].insert === "\n") {
            isValid = false;
        }
        return isValid;
    }

    const desc_editor = new Quill('#desc-editor', {
        theme: 'snow'
    });
    const req_editor = new Quill('#req-editor', {
        theme: 'snow'
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const desc_delta = desc_editor.getContents();
        desc_input.value = JSON.stringify(desc_delta);

        const req_delta = req_editor.getContents();
        req_input.value = JSON.stringify(req_delta);
        
        if (checkInputs()){
            form.submit();
        } else {
            alert('Пожалуйста, заполните все поля');
        };
    });
})