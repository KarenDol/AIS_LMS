document.addEventListener('DOMContentLoaded', function () {

    const form = document.getElementById('mainForm');
    const fullcost = document.getElementById('fullcost');
    const sign_date = document.getElementById('sign_date');
    const first_date = document.getElementById('first_date');
    const last_date = document.getElementById('last_date');
    const discount = document.getElementById('discount');
    const monthly = document.getElementById('monthly');
    const join_fee = document.getElementById('join_fee');
    const join_fee_status = document.getElementById('join_fee_status');

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (checkInputs()) {
            form.submit();
        }
    });

    //Change the join_fee_status if button pressed
    join_fee_status.addEventListener('click', () => {
        fetch(`/join_fee/${IIN}/`)
        .then(response => {
            if (response.ok) {
                // Reload the page to reflect the updated status
                location.reload();
            } else {
                alert('Failed to update payment status.');
            }
        })
        .catch(error => console.error('Error:', error));
    });

    sign_date.addEventListener('input', () => {
        validateField(sign_date, sign_date.value.trim() !== '', 'Введите дату');
    });

    first_date.addEventListener('input', () => {
        validateField(first_date, first_date.value.trim() !== '', 'Введите дату');
    });

    last_date.addEventListener('input', () => {
        validateField(last_date, last_date.value.trim() !== '', 'Введите дату');
    });

    fullcost.addEventListener('input', () => {
        fullcost.value = fullcost.value.replace(/[^0-9]/g, '');
        validateField(fullcost, fullcost.value.trim() !== '', 'Введите полную сумму');
    });

    discount.addEventListener('input', () => {
        discount.value = discount.value.replace(/[^0-9]/g, '');
        validateField(discount, discount.value.trim() !== '', 'Введите сумму с учетом скидки');
    });

    monthly.addEventListener('input', () => {
        monthly.value = monthly.value.replace(/[^0-9]/g, '');
        validateField(monthly, monthly.value.trim() !== '', 'Введите ежемесяную оплату');
    });

    join_fee.addEventListener('input', () => {
        join_fee.value = join_fee.value.replace(/[^0-9]/g, '');
        validateField(join_fee, join_fee.value.trim() !== '', 'Ведите вступительный взнос');
    });

    function checkInputs() {
        let isValid = true;
        validateField(sign_date, sign_date.value.trim() !== '', 'Это поле не может быть пустым');
        validateField(first_date, first_date.value.trim() !== '', 'Это поле не может быть пустым');
        validateField(last_date, last_date.value.trim() !== '', 'Это поле не может быть пустым');
        validateField(fullcost, fullcost.value.trim() !== '', 'Это поле не может быть пустым');
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
});