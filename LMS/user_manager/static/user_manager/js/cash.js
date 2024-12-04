document.addEventListener('DOMContentLoaded', function () {

    const form = document.getElementById('mainForm');
    const fullcost = document.getElementById('fullcost');

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (checkInputs()) {
            form.submit();
        }
    });

    fullcost.addEventListener('input', () => {
        validateField(fullcost, fullcost.value.trim() !== '', 'Заполните сумму');
    });

    function checkInputs() {
        let isValid = true;
        validateField(fullcost, fullcost.value.trim() !== '', 'Это поле не может быть пустым');

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

    function showModal() {
        const modal = document.getElementById('successModal');
        modal.style.display = 'block';

        const closeBtn = document.querySelector('.close-button');
        closeBtn.onclick = function () {
            modal.style.display = 'none';
        };

        window.onclick = function (event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
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

        let selectedClassInput = document.getElementById('selectedClassInput');
        selectedClassInput.value = selectedOption;

        let optionsContainer = optionMenu.querySelector(".options");
        optionsContainer.animate([
            { opacity: 1, visibility: "visible" },
            { opacity: 0, visibility: "hidden" }
        ], {
            duration: 150,
            fill: "forwards"
        });

        optionMenu.classList.remove("active");
    })
});
});