document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('mainForm');
    const lastname = document.getElementById('lastname');
    const firstname = document.getElementById('firstname');
    const patronim = document.getElementById('patronim');
    const ID_org = document.getElementById('ID_org');
    const ID_numb = document.getElementById('ID_numb');
    const ID_date = document.getElementById('ID_date');
    const workplace = document.getElementById('workplace');
    const position = document.getElementById('position');
    const phone = document.getElementById('phone');
    const address = document.getElementById('address');
    const h2 = document.querySelector("h2");

    //Check if the student is in the system
    if (parent){ 
        //by default, edit is blocked
        block_edit();
        form.action = `/card_parent/${IIN}/`;
    }
    else{
        h2.innerText = 'Регистрация родителя';
        h2.classList.remove('edit');
        button_back.style.display = "none";
        buttons_edit.style.display = "flex";
        button_cancel.innerText = "Назад";
        
        //Click to Back button returns to the student page
        button_cancel.addEventListener("click", (event) => {
            event.preventDefault()
            window.location.href = `/card_student/${IIN}/`;;
        });
    }

    function allow_edit() { //No student => it's register student
        //All inputs are editable
        lastname.disabled = false;
        firstname.disabled = false;
        patronim.disabled = false;
        ID_org.disabled = false;
        ID_numb.disabled = false;
        ID_date.disabled = false;
        workplace.disabled = false;
        position.disabled = false;
        phone.disabled = false;
        address.disabled = false;

        //Switch button groups' displays
        buttons_edit.style.display = "flex";
        button_back.style.display = "none";

        //Click to Cancel button block editing
        button_cancel.addEventListener("click", (event) => {
            event.preventDefault()
            block_edit();
        });
    }

    function block_edit(){
        //Populate inputs with their values
        lastname.value = parent.Last_Name;
        firstname.value = parent.First_Name;
        patronim.value = parent.Patronim;
        phone.value = parent.Phone;
        ID_org.value = parent.ID_org;
        ID_numb.value = parent.ID_number;
        ID_date.value = parent.ID_date;
        workplace.value = parent.Working_Place;
        position.value = parent.Position;
        address.value = parent.Address;

        //Disable all the inputs
        lastname.disabled = true;
        firstname.disabled = true;
        patronim.disabled = true;
        ID_org.disabled = true;
        ID_numb.disabled = true;
        ID_date.disabled = true;
        workplace.disabled = true;
        position.disabled = true;
        phone.disabled = true;
        address.disabled = true;

        //Remove the input evaluations
        setDefault(lastname);
        setDefault(firstname);
        setDefault(patronim);
        setDefault(ID_org);
        setDefault(ID_numb);
        setDefault(ID_date);
        setDefault(workplace);
        setDefault(position);
        setDefault(phone);
        setDefault(address);

        //Switch button groups' displays
        buttons_edit.style.display = "none";
        button_back.style.display = "block";

        //Click to h2 allows editing
        h2.addEventListener("click", () => {
            h2.classList.remove('edit');
            allow_edit();
        });
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (checkInputs()) {
            form.submit();
        }
    });

    lastname.addEventListener('input', () => {
        lastname.value = lastname.value.replace(/[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ-]/g, '');
    });

    firstname.addEventListener('input', () => {
        firstname.value = firstname.value.replace(/[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ-]/g, '');
    });

    patronim.addEventListener('input', () => {
        patronim.value = patronim.value.replace(/[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ-]/g, '');
    });

    ID_numb.addEventListener('input', () => {
        ID_numb.value = ID_numb.value.replace(/[^0-9]/g, '');
    });

    //Phone mask
    var maskOptions = {
    mask: '+7 (000) 000-00-00',
    lazy: false
    }
    var mask = new IMask(phone, maskOptions);

    function checkInputs() {
        let isValid = true;
        validateField(lastname, lastname.value.trim() !== '', 'Это поле не может быть пустым');
        validateField(firstname, firstname.value.trim() !== '', 'Это поле не может быть пустым');
        validateField(patronim, true, ''); //Allow no patronim
        validateField(ID_org, ID_org.value.trim() !== '', 'Это поле не может быть пустым');
        validateField(ID_date, ID_date.value.trim() !== '', '');
        validateField(ID_numb, ID_numb.value.length === 9, 'Номер удостоверения должен состоять из 9 цифр');
        validateField(workplace, workplace.value.trim() !== '', 'Это поле не может быть пустым');
        validateField(position, position.value.trim() !== '', 'Это поле не может быть пустым');
        validateField(phone, isPhone(phone.value.trim()), '');
        validateField(address, address.value.trim() !== '', 'Это поле не может быть пустым');
        
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

    function setDefault(input) {
        const formControl = input.parentElement;
        const icon = formControl.querySelector('.icon');
        formControl.className = 'form-control';
        icon.className = 'icon';
    }

    function isPhone(phone) {
        return /^\+?(\d.*){11,}$/.test(phone);
    }
});