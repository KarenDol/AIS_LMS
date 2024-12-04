document.addEventListener('DOMContentLoaded', function () {

    const interview = document.getElementById('interview');
    const popup = document.getElementById('pop-up');
    const container = document.getElementById('container');
    
    interview.addEventListener('click', () => {
        event.preventDefault();
        popup.style.display = 'block';
        container.classList.add('blur');
    });

    //SALARY AND IIN MASK
    const salary = document.getElementById('salary');
    const formattedSalary = salary.value.replace(/\B(?=(\d{3})+(?!\d))/g, ' '); // Add spaces as thousand separators
    salary.value = formattedSalary;

    const iin = document.getElementById('iin');
    const formattedIIN = iin.value.replace(/\B(?=(\d{6})+(?!\d))/g, ' '); // Add spaces as thousand separators
    iin.value = formattedIIN;

    //ARCHIVE BUTTON
    console.log(iin_value);
    const reject = document.getElementById('reject');
    reject.addEventListener('click', () => {
        fetch(`/hr/card_review/${iin_value}/`, {
            method: 'POST',
            headers: {
              'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              decision: false,
            }) // Convert data to JSON string
          })
        .then(response => {
            if (response.ok) {
                // Redirect to home after a successful response
                window.location.href = '/hr/';
            } else {
                // Handle cases where the response is not OK
                return response.text().then(text => {
                    throw new Error(text);
                });
            }
            })
            .catch(error => console.error('Error:', error));
        })

    //SET THE LIMITS FOR DATA
    const today = new Date();
    const nextTwoWeeks = new Date();
    nextTwoWeeks.setDate(today.getDate() + 14);

    // Format dates to YYYY-MM-DD
    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    const dateInput = document.getElementById('date');
    dateInput.min = formatDate(today);
    dateInput.max = formatDate(nextTwoWeeks);

    //validate Date
    dateInput.addEventListener('input', () => {
        if (date.value === ''){
            date.style.borderColor = '#e74d3cb0';
        }
        else{
            date.style.borderColor = '#29b864dc';
        }
    });


    //TIME OPTIONS
    const selectedTimeInput = document.getElementById('selectedTimeInput');
    const selectMenu = document.getElementById('select-menu');
    const selectBtn = selectMenu.querySelector(".select-btn");
    const options = selectMenu.querySelectorAll(".option");
    const sBtn_text = selectMenu.querySelector(".sBtn-text");

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
            let selectedOption = option.querySelector(".option-text").innerText;
            sBtn_text.innerText = selectedOption;
            selectedTimeInput.value = selectedOption;
            

            // Revalidate class selection after updating the value
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
        })
    });

    function validateClassSelection() {
        if (selectedTimeInput.value.trim() === '') {
            selectMenu.classList.add('error');
            selectMenu.classList.remove('success');
            console.log('ERROR!');
            return false;  // Return false if invalid
        } else {
            selectMenu.classList.add('success');
            selectMenu.classList.remove('error');
            console.log('GUT!');
            return true;  // Return true if valid
        }
    }

    //SUBMISSION OF THE FORM
    const ok = document.getElementById('ok');

    ok.addEventListener('click', () => {
        if (checkInputs()){
            fetch(`/hr/card_review/${iin_value}/`, {
                method: 'POST',
                headers: {
                  'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  decision: true,
                }) // Convert data to JSON string
              })
            .then(response => {
                if (!response.ok){
                    // Handle cases where the response is not OK
                    return response.text().then(text => {
                        throw new Error(text);
                    });
                }
                })
            .catch(error => console.error('Error:', error));
            fetch(`/hr/appoint_int/${iin_value}/`, {
                method: 'POST',
                headers: {
                  'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  date: date.value,
                  time: selectedTimeInput.value,
                }) // Convert data to JSON string
              })
            .then(response => {
                if (response.ok) {
                    // Redirect to home after a successful response
                    window.location.href = '/hr/';
                } else {
                    // Handle cases where the response is not OK
                    return response.text().then(text => {
                        throw new Error(text);
                    });
                }
                })
            .catch(error => console.error('Error:', error));
        }
    })

    function checkInputs() {
        let isValid = true;

        //Ensure date is inserted
        if (dateInput.value===''){
            dateInput.style.borderColor = '#e74d3cb0';
            isValid = false;
        }
        else{
            dateInput.style.borderColor = '#29b864dc';
        }
        
        // Ensure class selection is valid
        if (validateClassSelection()) {
            selectBtn.style.borderColor = '#29b864dc';
        }    
        else{
            selectBtn.style.borderColor = '#e74d3cb0';
            isValid = false;
        }

        return isValid;
    }

    //POP-UP BUTTONS
    const cancel = document.getElementById('cancel');

    cancel.addEventListener('click', () => {
        popup.style.display = 'none';
        container.classList.remove('blur');
        dateInput.value = '';
        dateInput.style.borderColor = '#ddd';
        selectedTimeInput.value = '';
        sBtn_text.innerText = 'Выберите время';
        selectMenu.classList.remove('error');
        selectMenu.classList.remove('success');
        selectMenu.classList.remove('active');
    });
});