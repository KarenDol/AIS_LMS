document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('mainForm');
    const lastname = document.getElementById('lastname');
    const firstname = document.getElementById('firstname');
    const patronim = document.getElementById('patronim');
    const nationality = document.getElementById('nationality');
    const prev_school = document.getElementById('prev_school');
    const iin = document.getElementById('iin');
    const grade_num = document.getElementById('grade_num');
    grade_num.value = student.grade_num;
    const grade_let = document.getElementById('grade_let'); 
    grade_let.value = student.grade_let;
    const grade_comb = document.getElementById('grade_comb'); 
    grade_comb.value = `${student.grade_num}${student.grade_let} класс`;
    const phone = document.getElementById('phone');
    const phoneLabel = document.getElementById('phone-label');
    const message = document.getElementById('message');
    const h2 = document.querySelector("h2");
    const selectMenu = document.querySelector(".select-menu"),
    selectBtn = selectMenu.querySelector(".select-btn"),
    optionsContainer = selectMenu.querySelector(".options"),
    sBtn_text = selectMenu.querySelector(".sBtn-text");
    const button_back = document.getElementById('button_back');
    //Avatar elements
    const avatarContainer = document.querySelector('.avatar-container');
    const avatarOverlay = document.querySelector('.avatar-overlay');
    const avatarImage = document.getElementById('avatar-image');
    const fileInput = document.getElementById("file-Input");
    //Button group when editing
    const buttons_edit = document.getElementById('buttons_edit');
    const button_cancel = document.getElementById('button_cancel'); //Cancel edit

    //Get the school info
    const school = student.school;

    const switchWrapper = document.getElementById('switch-wrapper');
    const switchElement = document.getElementById('switch');
    switchElement.addEventListener('change', () => {
        if (switchElement.checked) {
            //Выбор класса is chosen
            populateSelectMenu_Grades();
        } else {
            //Выбор литера is chosen
            populateSelectMenu_Letters(grade_num.value);
        }
    })

    //Populate Image
    if (student.picture) {
        avatarImage.src = '/api/serve_static/std_pictures/' + student.picture;
    } else {
        avatarImage.src = '/api/serve_static/std_pictures/Std_avatar.png';
    }

    //Edit logic
    let editable = false;

    if (student.status === 'Int'){
        intermediate();
        sBtn_text.textContent = `${student.grade_num} класс`;
        form.action = `/accept/${student.IIN}/`;
        //Update Комментарий with date of visit
        message_label = document.getElementById('message_label');
        message_label.innerText = `Комментарий | Консультация: ${student.date}`;
        existsWhatsapp();
    }
    //the student is Акт
    else{
        //by default, edit is blocked
        block_edit();
        sBtn_text.textContent = `${student.grade_num}${student.grade_let} класс`;
        form.action = `/card_student/${student.IIN}/`;

        //Update Комментарий with date of visit
        if (student.date) {
            message_label = document.getElementById('message_label');
            message_label.innerText = `Комментарий | Принят: ${student.date}`;
        }
        existsWhatsapp();
    }

    //Ensures that if patronim is null, the input is clear
    patronim.placeholder = '';
    //Populate grade menu with corresponding letters
    populateSelectMenu_Letters(grade_num.value);

    //Edit logic 
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
        button_back.style.display = "none";

        //Click to Back button blocks editing
        button_cancel.addEventListener("click", (event) => {
            event.preventDefault()
            h2.classList.add('edit');
            block_edit();
        });

        //Avatar logic
        avatarContainer.style.cursor = 'pointer';
        avatarContainer.addEventListener('mouseenter', () => {
            avatarOverlay.style.opacity = '1'; //Creates a hover effect
        });

        //Show the change class options
        switchWrapper.style.display = 'block';
        
        editable = true;
    }

    function block_edit(){
        //Populate inputs with their values
        lastname.value = student.Last_Name;
        firstname.value = student.First_Name;
        patronim.value = student.Patronim;
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
        button_back.style.display = "block";

        //Click to h2 allows editing
        h2.addEventListener("click", () => {
            h2.classList.remove('edit');
            allow_edit();
        });

        //Avatar logic
        avatarContainer.style.cursor = 'default';
        avatarContainer.addEventListener('mouseenter', () => {
            avatarOverlay.style.opacity = '0'; //Removes hover effect
        });

        //Hide change class options
        switchWrapper.style.display = 'none';

        editable = false;
    }

    function intermediate(){
        //Populate inputs with their values
        lastname.value = student.Last_Name;
        firstname.value = student.First_Name;
        patronim.value = student.Patronim;
        prev_school.value = student.prev_school;
        message.value = student.comment;
        iin.value = student.IIN;
        phone.value = student.phone;

        //Disable all the inputs except grade
        lastname.disabled = true;
        firstname.disabled = true;
        patronim.disabled = true;
        prev_school.disabled = true;
        message.disabled = true;
        iin.disabled = true; //IIN can't be edited in any circumstances
        phone.disabled = true;

        //Switch button groups' displays
        button_cancel.addEventListener("click", () => {
            event.preventDefault();
            window.location.href = `/temp_card_std/${student.IIN}`;
        });
        buttons_edit.style.display = "flex";
        button_back.style.display = "none";

        //h2 is not clickable 
        h2.classList.remove('edit');
        h2.addEventListener("click", () => {});
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
    phone.addEventListener('input', existsWhatsapp);

    //Avatar logic
    avatarContainer.addEventListener('click', function() {
        if (editable){
            fileInput.click();
        }
    });

    avatarContainer.addEventListener('mouseleave', () => {
        avatarOverlay.style.opacity = '0';
    });

    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                avatarImage.src = e.target.result;
            }
            reader.readAsDataURL(file);
        }
    });

    //Check if WhatsApp exists
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
            //Format the grade
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
    function populateSelectMenu_Letters(grade){
        // Clear any existing content (optional)
        optionsContainer.innerHTML = '';

        // Iterate over each letter and create a list item
        letters_list = letters[grade];
        for (let letter of letters_list) {
            const li = document.createElement('li');
            li.classList.add('option');

            const span = document.createElement('span');
            span.classList.add('option-text');
            span.textContent = `${grade}${letter} класс`;

            li.appendChild(span);
            optionsContainer.appendChild(li);
        }

        handleSelection(); //Add eventListeners to options
    }

    function populateSelectMenu_Grades(){
        // Clear any existing content (optional)
        optionsContainer.innerHTML = '';

        if (school==='sch'){
            // Loop from 0 to 11 and create li elements
            for (let i = 0; i <= 11; i++) {
                // Create the li element and set its class
                const li = document.createElement('li');
                li.classList.add('option');

                // Create the span element and set the text
                const span = document.createElement('span');
                span.classList.add('option-text');
                span.textContent = `${i} класс`;

                // Append the span to the li, and the li to the ul
                li.appendChild(span);
                optionsContainer.appendChild(li);
            }
        } else {
            // Lyceum: 7-11 grades
            for (let i = 7; i <= 11; i++) {
                // Create the li element and set its class
                const li = document.createElement('li');
                li.classList.add('option');

                // Create the span element and set the text
                const span = document.createElement('span');
                span.classList.add('option-text');
                span.textContent = `${i} класс`;

                // Append the span to the li, and the li to the ul
                li.appendChild(span);
                optionsContainer.appendChild(li);
            }
        }

        handleSelection(); //Add eventListeners to options
    }

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

    function handleSelection () {
        const options = selectMenu.querySelectorAll(".option");
        options.forEach(option => {
            option.addEventListener("click", () => {
                const selectedOption = option.querySelector(".option-text").innerText;
                sBtn_text.innerText = selectedOption;
        
                let optionsContainer = selectMenu.querySelector(".options");
                optionsContainer.animate([
                    { opacity: 1, visibility: "visible" },
                    { opacity: 0, visibility: "hidden" }
                ], {
                    duration: 100,
                    fill: "forwards"
                });

                if (switchElement.checked) {
                    //If the new grade was selected, null the letter value
                    const digits = selectedOption.match(/\d+/); 
                    const number = digits ? parseInt(digits[0], 10) : null;
                    grade_num.value = number;
                    grade_let.value = null;
                } else {
                    // Use a regex to extract the letter
                    const match = selectedOption.match(/^(\d+)([A-Za-zА-Яа-яӘәҒғҚқҢңӨөҰұҮүҺһІі])\s+класс$/);
                    const selected_letter = match[2];
                    grade_let.value = selected_letter;
                }
                selectMenu.classList.remove("active");
            });
        });
    }

    function validateClassSelection() {
        if (grade_let.value === '') {
            selectMenu.classList.add('error');
            selectMenu.classList.remove('success');
            alert('Выберите литер ученика');
            return false;  
        } else {
            selectMenu.classList.add('success');
            selectMenu.classList.remove('error');
            return true;
        }
    }

    function disable_grade(){
        grade_comb.hidden = false;
        grade_comb.disabled = true;
        selectMenu.style.display = "none";
    }

    function enable_grade(){
        grade_comb.hidden = true;
        grade_comb.disabled = false;
        selectMenu.style.display = "block";
    }
});