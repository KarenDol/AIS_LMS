document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('mainForm');
    const honors_containter = document.querySelector(".timeline-container");
    let timelineInput; //Input for adding new honor
    //Button group when editing
    const button_cancel = document.getElementById('button_cancel');
    const button_save = document.getElementById('button_save');

    //Initial settings
    block_edit();

    //Edit existing honor
    function allow_edit(honor_id){
        //Change the form submission address
        form.action = `/edit_honor/${honor_id}/`;

        //Set the text and actions of buttons
        button_cancel.textContent = "Отменить";
        button_save.textContent = "Сохранить";

        //Click to Back button blocks editing
        button_cancel.onclick = function (event) {
            event.preventDefault();
            block_edit();
        };

        //Click to Save button submits the form 
        button_save.onclick = function () {
            if (checkInputs()) {
                form.submit();
            } else {
                alert("Заполните все необходимые поля");
            }
        };
    }

    //Add new honor
    function allow_add(){
        addInput();

        //Input element is visible
        timelineInput.style.display = 'block';

        //Set the text and actions of buttons
        button_cancel.textContent = "Отменить";
        button_save.textContent = "Сохранить";

        //Click to Back button blocks editing
        button_cancel.onclick = function (event) {
            event.preventDefault();
            block_edit();
        };

        //Click to Save button submits the form 
        button_save.onclick = function () {
            if (checkInputs()) {
                form.submit();
            } else {
                alert("Заполните все необходимые поля");
            }
        };
    }

    function block_edit(){
        populateHonors();

        //Set the text and actions of buttons
        button_cancel.textContent = "Назад";
        button_save.textContent = "Добавить";

        //Click to Back button sends cak to student card
        button_cancel.onclick = function (event) {
            event.preventDefault();
            window.location.href = `/card_student/${IIN}/`;
        };

        //Click to Save button allows editing
        button_save.onclick = function (event) {
            event.preventDefault();
            allow_add();
        };
    }

    function populateHonors(){
        honors_containter.innerHTML = ''; // Clear the container first
        honors.forEach(function(honor) {
            addHonor(honor);
        })
        attachTrashListeners();
        attachEditListeners();
    }

    function addHonor(honor){
        // Create the <div> element
        const timelineItem = document.createElement('div');
        // Add the class "timeline-item"
        timelineItem.classList.add('timeline-item');

        console.log(honor);
        
        timelineItem.innerHTML = `
            <h3 class="timeline-title">${honor.title}</h3>

            <div class="icon-group">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" class="edit" data-id="${honor.id}">
                    <path fill="currentColor" d="M22 7.24a1 1 0 0 0-.29-.71l-4.24-4.24a1 1 0 0 0-.71-.29a1 1 0 0 0-.71.29l-2.83 2.83L2.29 16.05a1 1 0 0 0-.29.71V21a1 1 0 0 0 1 1h4.24a1 1 0 0 0 .76-.29l10.87-10.93L21.71 8a1.2 1.2 0 0 0 .22-.33a1 1 0 0 0 0-.24a.7.7 0 0 0 0-.14ZM6.83 20H4v-2.83l9.93-9.93l2.83 2.83ZM18.17 8.66l-2.83-2.83l1.42-1.41l2.82 2.82Z"/>
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" class="trash" data-id="${honor.id}">>
                    <path fill="currentColor" d="M7 21q-.825 0-1.412-.587T5 19V6q-.425 0-.712-.288T4 5t.288-.712T5 4h4q0-.425.288-.712T10 3h4q.425 0 .713.288T15 4h4q.425 0 .713.288T20 5t-.288.713T19 6v13q0 .825-.587 1.413T17 21zM17 6H7v13h10zm-7 11q.425 0 .713-.288T11 16V9q0-.425-.288-.712T10 8t-.712.288T9 9v7q0 .425.288.713T10 17m4 0q.425 0 .713-.288T15 16V9q0-.425-.288-.712T14 8t-.712.288T13 9v7q0 .425.288.713T14 17M7 6v13z"/>
                </svg>
            </div>

            <p class="timeline-date">
                ${formatDateToRussian(honor.date)} 
                <span class="timeline-event">${honor.description}</span>
            </p>
        `;

        honors_containter.appendChild(timelineItem);
    }

    function formatDateToRussian(dateString) {
        // Split the input date string (YYYY-MM)
        const [year, month] = dateString.split('-');
      
        // Create a new Date object (year, month - 1)
        const date = new Date(year, month - 1);
      
        // Format the date to Russian month name and year
        const formatter = new Intl.DateTimeFormat('ru-RU', { 
          month: 'short', // Short month name (e.g., "Дек")
          year: 'numeric' // Full year (e.g., "2024")
        });
      
        // Format and replace unnecessary '.' from the month
        return formatter.format(date).replace('.', '');
    }

    function attachTrashListeners() {
        const trashIcons = document.querySelectorAll('svg.trash');
        trashIcons.forEach(icon => {
            icon.addEventListener('click', function () {
                const honorId = this.getAttribute('data-id');
                deleteHonor(honorId);
            });
        });
    }

    function deleteHonor(honorId) {
        fetch(`/delete_honor/${honorId}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
            },
            body: JSON.stringify({ id: honorId })
        })
        .then(response => {
            if (response.ok) {
                // Remove the honor from the local array
                honors = honors.filter(honor => honor.id !== parseInt(honorId));
                populateHonors(); // Re-render the honors list

                // Show success notification
                alert('Запись успешна удалена');
            } else {
                alert('Не удалось удалить запись. Попробуйте еще раз.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    function attachEditListeners() {
        const editIcons = document.querySelectorAll('svg.edit');
        editIcons.forEach(icon => {
            icon.addEventListener('click', function () {
                const honorId = this.getAttribute('data-id');
                const honorData = honors.find(honor => honor.id === parseInt(honorId));
                const { title, date, description } = honorData;

                allow_edit(honorId);

                const timelineItem = icon.closest(".timeline-item"); // Find the closest parent with class "timeline-item"
                // Replace content with inputs (values are set from existing elements)
                timelineItem.innerHTML = `
                    <h3 class="timeline-title">
                        <input type="text" class="title" id="title-input" name="title" maxlength="100" value="${title}">
                    </h3>
                    <p class="timeline-date">
                        <input type="month" class="date" name="date" value="${date}" min="2022-01">
                        <span class="timeline-event">
                            <input type="text" class="event" id="event-input" name="description" maxlength="200" value="${description}">
                        </span>
                    </p>
                `;
            });
        });
    }

    function addInput(){
        // Create the <div> element
        timelineInput = document.createElement('div');
        timelineInput.style.display = 'none';
        // Add the class "timeline-item"
        timelineInput.classList.add('timeline-item');
        // Add an id to the <div>
        timelineInput.innerHTML = `
            <h3 class="timeline-title"><input type="text" class="title" id="title-input" name="title" maxlength="100" placeholder="Диплом I степени..."></h3>
            <p class="timeline-date">
                <input type="month" class="date" name="date" value="2024-12" min="2022-01"></i>
                <span class="timeline-event"><input type="text" class="event" id="event-input" name="description" maxlength="200" placeholder="Республиканская олимпиада по химии..."></span>
            </p>
        `;
        honors_containter.appendChild(timelineInput);
    }

    function checkInputs() {
        const titleInput = document.getElementById('title-input');
        const eventInput = document.getElementById('event-input');

        validateField(titleInput, titleInput.value.trim() !== '', 'Это поле не может быть пустым');
        validateField(eventInput, eventInput.value.trim() !== '', 'Это поле не может быть пустым');

        return ((titleInput.value.trim() !== '') && (eventInput.value.trim() !== ''));
    }

    function validateField(input, condition, errorMessage) {
        if (condition) {
            setSuccess(input);
        } else {
            setError(input, errorMessage);
        }
    }

    function setError(input, errorMessage) {
        input.classList.remove("success");
        input.classList.add("error");
        input.placeholder = errorMessage;
    }

    function setSuccess(input) {
        input.classList.remove("error");
        input.classList.add("success");
    }
})