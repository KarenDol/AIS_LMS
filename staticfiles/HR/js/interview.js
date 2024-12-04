document.addEventListener('DOMContentLoaded', function () {

    const form = document.getElementById('mainForm');
    const selectedPosition = document.getElementById('selectedPosition');
    const selectMenu = document.querySelector('.select-menu');
    const interviewers = document.getElementById('interviewers');
    const comment = document.getElementById('comment');
    const neg = document.getElementById('neg');
    const pos = document.getElementById('pos');
    const salCond = document.getElementById('salCond');
    const salary = document.getElementById('salary');
    const conditions = document.getElementById('conditions');

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

        // Ensure class selection is valid, if the field is "Другое"
        if (!validateClassSelection()) {
            isValid = false;
        }    

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
                selectedPosition.style.width = '70%';
                selectMenu.style.width = '30%';
            }
            else{
                // Revalidate class selection after updating the value
                selectedPosition.type = 'hidden'; //Unhidden the input
                selectedPosition.placeholder = 'Ex.: Тренер по йоге...';
                selectedPosition.style.width = '70%';
                selectMenu.style.width = '100%';
                validateClassSelection();
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

    pos.addEventListener('change', () => {
        if (pos.checked) {
            salCond.classList.remove('hidden');
            salCond.classList.add('visible');
            console.log("Appear");
        }
    });

    neg.addEventListener('change', () => {
        if (neg.checked) {
            salCond.classList.remove('visible');
            salCond.classList.add('hidden');
            console.log("Disappear");
        }
    });
});