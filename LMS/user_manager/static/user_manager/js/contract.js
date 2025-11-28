document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('mainForm');
    const total = document.getElementById('total');
    const sign_date = document.getElementById('sign_date');
    const first_date = document.getElementById('first_date');
    const last_date = document.getElementById('last_date');
    const discount = document.getElementById('discount');
    const monthly = document.getElementById('monthly');
    const join_fee = document.getElementById('join_fee');
    const h2 = document.querySelector("h2");
    //Button group when editing
    const buttons_edit = document.getElementById('buttons_edit');
    const button_cancel = document.getElementById('button_cancel'); //Cancel edit
    const button_save = document.getElementById('button_save'); //Save edit

    //Check if the contract is in the system
    if (contract){ 
        //by default, edit is blocked
        block_edit();
        form.action = `/card_contract/${std_id}/`;
    }
    else{
        h2.innerText = 'Регистрация Договора';
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

    function allow_edit() {
        //All inputs are editable
        sign_date.disabled = false;
        first_date.disabled = false;
        last_date.disabled = false;
        total.disabled = false;
        discount.disabled = false;
        monthly.disabled = false;
        join_fee.disabled = false;

        //Switch button groups' displays
        buttons_edit.style.display = "flex";
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
        sign_date.value = contract.sign_date;
        first_date.value = contract.first_date;
        last_date.value = contract.last_date;
        total.value = String(contract.total).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        discount.value = String(contract.discount).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        monthly.value = String(contract.monthly).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        join_fee.value = String(contract.join_fee).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

        //Disable all the inputs
        sign_date.disabled = true;
        first_date.disabled = true;
        last_date.disabled = true;
        total.disabled = true;
        discount.disabled = true;
        monthly.disabled = true;
        join_fee.disabled = true;

        //Remove the input evaluations
        setDefault(sign_date);
        setDefault(first_date);
        setDefault(last_date);
        setDefault(total);
        setDefault(discount);
        setDefault(monthly);
        setDefault(join_fee);

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
            //Cancel currency formatting, when submitting the form
            total.value = total.value.replace(/[^0-9]/g, '');
            discount.value = discount.value.replace(/[^0-9]/g, '');
            monthly.value = monthly.value.replace(/[^0-9]/g, '');
            join_fee.value = join_fee.value.replace(/[^0-9]/g, '');
            form.submit();
        }
    });

    //Mask for the currency inputs 12345 -> 12 345
    total.addEventListener('input', () => {
        total.value = total.value.replace(/[^0-9]/g, '');
        total.value = total.value.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    });

    discount.addEventListener('input', () => {
        discount.value = discount.value.replace(/[^0-9]/g, '');
        discount.value = discount.value.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    });

    monthly.addEventListener('input', () => {
        monthly.value = monthly.value.replace(/[^0-9]/g, '');
        monthly.value = monthly.value.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    });

    join_fee.addEventListener('input', () => {
        join_fee.value = join_fee.value.replace(/[^0-9]/g, '');
        join_fee.value = join_fee.value.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    });

    function checkInputs() {
        let isValid = true;
        validateField(sign_date, sign_date.value.trim() !== '', '');
        validateField(first_date, first_date.value.trim() !== '', '');
        validateField(last_date, last_date.value.trim() !== '', '');
        validateField(total, total.value.trim() !== '', 'Это поле не может быть пустым');
        validateField(discount, discount.value.trim() !== '', 'Это поле не может быть пустым');
        validateField(monthly, monthly.value.trim() !== '', 'Это поле не может быть пустым');
        validateField(join_fee, join_fee.value.trim() !== '', 'Это поле не может быть пустым');

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
});