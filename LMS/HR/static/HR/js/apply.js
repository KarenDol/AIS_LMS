document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('mainForm');
    const lastname = document.getElementById('lastname');
    const firstname = document.getElementById('firstname');
    const patronim = document.getElementById('patronim');
    const iin = document.getElementById('iin');
    const salary = document.getElementById('salary');
    const selectedPosition = document.getElementById('selectedPosition');
    const cv = document.getElementById('cv');
    const file_name = document.getElementById('file_name');
    const selectMenu = document.querySelector('.select-menu');
    const phone = document.getElementById('phone');
    const phoneLabel = document.getElementById('phone-label');
    const btn_back = document.getElementById('back');

    //Disable position choice, if the id!=0
    if (pos_id !== "0"){
        selectedPosition.type = "text";
        selectedPosition.value = pos_title;
        selectedPosition.disabled = true;
        selectMenu.style.display = "none";
    }

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

    phone.addEventListener('input', existsWhatsapp);

    function checkInputs() {
        let isValid = true;
        validateField(lastname, lastname.value.trim() !== '', 'Это поле не может быть пустым');
        validateField(firstname, firstname.value.trim() !== '', 'Это поле не может быть пустым');
        validateField(patronim, true, ''); //Allow no patronim
        validateField(salary, salary.value.trim() !== '', 'Это поле не может быть пустым');
        validateField(iin, iin.value.trim().length == 13, 'Это поле не может быть пустым')
        validateField(phone, isPhone(phone.value.trim()), 'Неверный номер телефона');

        
        // Ensure class selection is valid
        if (!validateClassSelection()) {
            isValid = false;
        }    

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

    const optionMenu = document.querySelector(".select-menu"),
    selectBtn = optionMenu.querySelector(".select-btn"),
    options = optionMenu.querySelectorAll(".option"),
    sBtn_text = optionMenu.querySelector(".sBtn-text");

    selectBtn.addEventListener("click", () => {
        if (optionMenu.classList.contains("active")) {
            optionMenu.classList.remove("active");
            let optionsContainer = optionMenu.querySelector(".options");
            optionsContainer.animate([
                { opacity: 1, visibility: "visible" },
                { opacity: 0, visibility: "hidden" }
            ], {
                duration: 150,
                fill: "forwards"
            });
        } else {
            optionMenu.classList.add("active");
            let optionsContainer = optionMenu.querySelector(".options");
            optionsContainer.animate([
                { opacity: 0, visibility: "hidden" },
                { opacity: 1, visibility: "visible" }
            ], {
                duration: 150,
                fill: "forwards"
            });
        }
    });

    options.forEach(option => {
        option.addEventListener("click", () => {
            let selectedOption = option.querySelector(".option-text").innerText;
            sBtn_text.innerText = selectedOption;
            selectedPosition.value = selectedOption;
            if (selectedPosition.value === 'Другое'){
                selectedPosition.type = 'text'; //Unhidden the input
                selectedPosition.value = '';
                selectedPosition.placeholder = 'Ex.: Тренер по йоге...';
                selectedPosition.style.width = '70%';
                selectMenu.style.width = '30%';
            }
            else{
                // Revalidate class selection after updating the value
                selectedPosition.type = 'hidden';
                selectMenu.style.width = '100%';
            }
            
            let optionsContainer = optionMenu.querySelector(".options");
            optionsContainer.animate([
                { opacity: 1, visibility: "visible" },
                { opacity: 0, visibility: "hidden" }
            ], {
                duration: 100,
                fill: "forwards"
            });

            optionMenu.classList.remove("active");
        })
    });

    function validateClassSelection() {
        if (selectedPosition.value.trim() === '') {
            selectMenu.classList.add('error');
            selectMenu.classList.remove('success');
            if (sBtn_text.innerText==='Другое'){
                selectedPosition.classList.add('error');
                selectedPosition.classList.remove('success');
                selectedPosition.style.borderColor = '#e74d3cb0';
                selectedPosition.placeholder = 'Уточните позицию';
            }
            return false;
        } else {
            selectMenu.classList.add('success');
            selectMenu.classList.remove('error');
            if (sBtn_text.innerText==='Другое'){
                selectedPosition.classList.add('success');
                selectedPosition.classList.remove('error');
                selectedPosition.style.borderColor = '#28bb65e3';
            }
            return true; 
        }
    }

    function existsWhatsapp() {
        if (isPhone(phone.value)) {
            fetch(`/wa_exists/${phone.value}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.existsWhatsapp) {
                    phoneLabel.innerText = "Номер Телефона | WhatsApp доступен";
                } else {
                    phoneLabel.innerText = "Номер Телефона | WhatsApp не доступен";
                }
            })
            .catch(error => {
                // Handle errors
                console.error('Error:', error);
                alert('Произошла ошибка!');
            });
        }
        else{
            phoneLabel.innerText = "Номер Телефона";
        }
    }

    btn_back.addEventListener("click", (event) => {
        event.preventDefault();
        window.location.href = "/hr/jobs";
    })
});