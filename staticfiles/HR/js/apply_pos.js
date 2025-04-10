document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('mainForm');
    const lastname = document.getElementById('lastname');
    const firstname = document.getElementById('firstname');
    const patronim = document.getElementById('patronim');
    const iin = document.getElementById('iin');
    const salary = document.getElementById('salary');
    const cv = document.getElementById('cv');
    const file_name = document.getElementById('file_name');
    const phone = document.getElementById('phone');
    const interview = document.getElementById('interview');
    const popup = document.querySelector('pop-up');

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (checkInputs()) {
            iin.value = iin.value.replace(/\s/g, ''); // Remove the whitespace before submitting
            form.submit();
        }
    });

    lastname.addEventListener('input', () => {
        lastname.value = lastname.value.replace(/[^a-zA-Zа-яА-ЯёЁәңғүұқөһӘҢҒҮҰҚӨҺ-]/g, '');
    });

    firstname.addEventListener('input', () => {
        firstname.value = firstname.value.replace(/[^a-zA-Zа-яА-ЯёЁәңғүұқөһӘҢҒҮҰҚӨҺ-]/g, '');
    });

    patronim.addEventListener('input', () => {
        patronim.value = patronim.value.replace(/[^a-zA-Zа-яА-ЯёЁәңғүұқөһӘҢҒҮҰҚӨҺ-]/g, '');
    });

    iin.addEventListener('input', () => {
        iin.value = iin.value.replace(/[^0-9]/g, '');
        iin.value = iin.value.replace(/\B(?=(\d{6})+(?!\d))/g, ' '); // Add spaces for better visibility
    });

    salary.addEventListener('input', () => {
        salary.value = salary.value.replace(/[^0-9]/g, '');
        salary.value =  salary.value.replace(/\B(?=(\d{3})+(?!\d))/g, ' '); // Add spaces as thousand separators
    });

    function checkInputs() {
        let isValid = true;
        validateField(lastname, lastname.value.trim() !== '', 'Это поле не может быть пустым');
        validateField(firstname, firstname.value.trim() !== '', 'Это поле не может быть пустым');
        validateField(patronim, true, ''); //Allow no patronim
        validateField(salary, salary.value.trim() !== '', 'Это поле не может быть пустым');
        validateField(iin, iin.value.trim().length == 13, 'Это поле не может быть пустым')
        validateField(phone, isPhone(phone.value.trim()), 'Неверный номер телефона');

        if (!validateCV()){
            isValid = false;
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

    function isPhone(phone) {
        return /^\+?(\d.*){11,}$/.test(phone);
    }

    cv.addEventListener('change', function () {
        const file = cv.files[0];
        const maxSize = 5 * 1024 * 1024; //5MB size limit
        if (file && file.type === 'application/pdf') {
            if (file.size > maxSize) {
                cv.value = ''; 
                file_name.textContent = 'Файл превышает 5 МБ';
                file_name.style.color = '#e74d3cb0';
                setError(cv, ''); 
            }
            else{
                file_name.textContent = file.name;
                file_name.style.color = '#000000';
                setSuccess(cv);
            }
        } else {
            cv.value = ''; 
            file_name.textContent = 'Только файлы .pdf';
            file_name.style.color = '#e74d3cb0'; 
            setError(cv, '');
        }
    });

    function validateCV() {
        if (cv.files.length === 0) {
            file_name.textContent = 'Добавьте резюме';
            file_name.style.color = '#e74d3cb0'; 
            setError(cv, '');
            return false;
        } else {
            setSuccess(cv);
            return true;
        }
    }

    var maskOptions = {
        mask: '+7 (000) 000-00-00',
        lazy: false
    }

    const phoneMask = new IMask(phone, maskOptions);
});