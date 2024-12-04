document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('mainForm');
    const lastname = document.getElementById('lastname');
    const firstname = document.getElementById('firstname');
    const patronim = document.getElementById('patronim');
    const nationality = document.getElementById('nationality');
    const prev_school = document.getElementById('prev_school');
    const iin = document.getElementById('iin');
    const grade = document.getElementById('grade');
    const phone = document.getElementById('phone');
    const message = document.getElementById('message');
    const h2 = document.querySelector("h2");
    const selectMenu = document.querySelector(".select-menu"),
    selectBtn = selectMenu.querySelector(".select-btn"),
    options = selectMenu.querySelectorAll(".option"),
    sBtn_text = selectMenu.querySelector(".sBtn-text");
    //Button group when editing
    const buttons_edit = document.getElementById('buttons_edit');
    const button_cancel = document.getElementById('button_cancel'); //Cancel edit
    const button_save = document.getElementById('button_save'); //Save edit
    //Button group for card view
    const buttons_card = document.getElementById('buttons_card');
    const button_contract = document.getElementById('button_contract'); 
    const button_parent = document.getElementById('button_parent'); 

    //Check if the student is in the system
    if (student){ 
        //by default, edit is blocked
        block_edit();
        form.action = `/card_student/${student.IIN}/`;
    }
    else{
        h2.innerText = 'Регистрация Ученика';
        h2.classList.remove('edit');
        button_back.style.display = "none";
        buttons_edit.style.display = "flex";
        button_cancel.innerText = "Назад";
        
        //Click to Back button returns to the main page
        button_cancel.addEventListener("click", (event) => {
            event.preventDefault()
            window.location.href = '/';
        });
    }

    //Buttons logic
    button_parent.addEventListener("click", (event) => {
        event.preventDefault()
        let url;
        if (student.parent_1){
            url = `/card_parent/${student.IIN}/`;
        }
        else{
            url = `/register_parent/${student.IIN}/`;
        }
        window.location.href = url;
    });

    button_contract.addEventListener("click", (event) => {
        event.preventDefault()
        let url;
        if (student.contract){
            url = `/card_contract/${student.IIN}/`;
        }
        else if (student.parent_1){
            url = `/register_contract/${student.IIN}/`;
        }
        else{
            url = `/register_parent/${student.IIN}/`;
        }
        window.location.href = url;
    });

    function allow_edit() { //No student => it's register student
        //All inputs are editable
        lastname.disabled = false;
        firstname.disabled = false;
        patronim.disabled = false;
        phone.disabled = false;
        nationality.disabled = false;
        prev_school.disabled = false;
        message.disabled = false;
        enable_grade();

        //Switch button groups' displays
        buttons_edit.style.display = "flex";
        buttons_card.style.display = "none";
        button_back.style.display = "none";

        //Click to Back button blocks editing
        button_cancel.addEventListener("click", (event) => {
            event.preventDefault()
            h2.classList.add('edit');
            block_edit();
        });
    }

    function block_edit(){
        //Populate inputs with their values
        lastname.value = student.Last_Name;
        firstname.value = student.First_Name;
        patronim.value = student.Patronim;
        grade.value = student.grade + ' класс';
        sBtn_text.innerText = student.grade + ' класс';
        phone.value = student.phone;
        nationality.value = student.nationality;
        prev_school.value = student.prev_school;
        message.value = student.comment;
        iin.value = student.IIN;

        //Disable all the inputs
        lastname.disabled = true;
        firstname.disabled = true;
        patronim.disabled = true;
        phone.disabled = true;
        nationality.disabled = true;
        prev_school.disabled = true;
        message.disabled = true;
        iin.disabled = true; //IIN can't be edited in any circumstances
        disable_grade();

        //Remove the input evaluations
        setDefault(lastname);
        setDefault(firstname);
        setDefault(patronim);
        setDefault(phone);
        setDefault(nationality);
        setDefault(prev_school);
        setDefault(message);

        //Switch button groups' displays
        buttons_edit.style.display = "none";
        buttons_card.style.display = "flex";
        button_back.style.display = "block";

        //Click to h2 allows editing
        h2.addEventListener("click", () => {
            h2.classList.remove('edit');
            allow_edit();
        });
    }


    // Restrict input chars
    lastname.addEventListener('input', () => {
        lastname.value = lastname.value.replace(/[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ-]/g, '');
    });
    firstname.addEventListener('input', () => {
        firstname.value = firstname.value.replace(/[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ-]/g, '');
    });
    patronim.addEventListener('input', () => {
        patronim.value = patronim.value.replace(/[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ-]/g, '');
    });
    nationality.addEventListener('input', () => {
        nationality.value = nationality.value.replace(/[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ-]/g, '');
    });
    iin.addEventListener('input', () => {
        iin.value = iin.value.replace(/[^0-9]/g, '');
    });


    //Phone mask
    var maskOptions = {
        mask: '+7 (000) 000-00-00',
        lazy: false
    }
    var mask = new IMask(phone, maskOptions);


    //Form Validation
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (checkInputs()) {
            form.submit();
        }
    });

    function validateIIN(input) {
        const iinValue = input.value.trim();
        if (iinValue.length === 12) {
            setSuccess(input);
        } else {
            setError(input, 'Заполните 12 символов ИИН');
        }
    }

    function isPhone(phone) {
        return /^\+?(\d.*){11,}$/.test(phone);
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

    function setDefault(input) {
        const formControl = input.parentElement;
        const icon = formControl.querySelector('.icon');
        formControl.className = 'form-control';
        icon.className = 'icon';
    }

    function checkInputs() {
        let isValid = true;
        validateField(lastname, lastname.value.trim() !== '', 'Это поле не может быть пустым');
        validateField(firstname, firstname.value.trim() !== '', 'Это поле не может быть пустым');
        validateField(patronim, true, ''); //Allow no patronim
        validateField(nationality, nationality.value.trim() !== '', 'Это поле не может быть пустым');
        validateField(prev_school, prev_school.value.trim() !== '', 'Это поле не может быть пустым');
        validateIIN(iin);
        validateField(phone, isPhone(phone.value.trim()), '');
        validateField(message, message.value.trim() !== '', 'Это поле не может быть пустым');
        
        // Ensure class selection is valid
        if (!validateClassSelection()) {
            isValid = false;
        }    

        document.querySelectorAll('.form-control').forEach((control) => {
            if (control.classList.contains('error')) {
                isValid = false;
            }
        });

        return isValid;
    }


    //class selection menu logic
    selectBtn.addEventListener("click", () => {
        if (selectMenu.classList.contains("active")) {
            selectMenu.classList.remove("active");
            let optionsContainer = selectMenu.querySelector(".options");
            optionsContainer.animate([
                { opacity: 1, visibility: "visible" },
                { opacity: 0, visibility: "hidden" }
            ], {
                duration: 150,
                fill: "forwards"
            });
        } else {
            selectMenu.classList.add("active");
            let optionsContainer = selectMenu.querySelector(".options");
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
            const selectedOption = option.querySelector(".option-text").innerText;
            sBtn_text.innerText = selectedOption;
            grade.value = selectedOption;
    
            validateClassSelection();
    
            let optionsContainer = selectMenu.querySelector(".options");
            optionsContainer.animate([
                { opacity: 1, visibility: "visible" },
                { opacity: 0, visibility: "hidden" }
            ], {
                duration: 100,
                fill: "forwards"
            });
    
            selectMenu.classList.remove("active");
        });
    });

    function validateClassSelection() {
        if (grade.value.trim() === '') {
            selectMenu.classList.add('error');
            selectMenu.classList.remove('success');
            return false;  // Return false if invalid
        } else {
            selectMenu.classList.add('success');
            selectMenu.classList.remove('error');
            return true;  // Return true if valid
        }
    }

    function disable_grade(){
        grade.hidden = false;
        grade.disabled = true;
        selectMenu.style.display = "none";
    }

    function enable_grade(){
        grade.hidden = true;
        grade.disabled = false;
        selectMenu.style.display = "block";
    }
});