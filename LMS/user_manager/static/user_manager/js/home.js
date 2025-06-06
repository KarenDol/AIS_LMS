document.addEventListener('DOMContentLoaded', function() {
    const main = document.querySelector('main');
    const search = document.querySelector('.input-group input'),
    table_headings = document.querySelectorAll('thead th');
    table_rows = document.querySelectorAll('tbody tr'),
    tableSection = document.getElementById('studentsTableBody');
    const selectMenu = document.querySelector(".select-menu"),
    selectBtn = selectMenu.querySelector(".select-btn"),
    optionsContainer = selectMenu.querySelector(".options"),
    sBtn_text = selectMenu.querySelector(".sBtn-text");
    exp = document.getElementById('export');
    const whatsapp = document.getElementById('whatsapp');
    const sch_lyc = document.getElementById('sch_lyc');
    const checked = document.getElementById('checked');
    let checked_state = false;
    const buttons_wa = document.getElementById('buttons_wa');
    const actionButtons = document.querySelector(".action-buttons");
    const cancel = document.getElementById('cancel');
    const send = document.getElementById('send');

    let gradeSelection = "Все классы";
    let wa_mode = false;

    populateSelectMenu();
    populateTable();


    if (selectMenu.classList.contains("active")) {
        selectMenu.classList.remove("active");
    }

    //Hide action buttons for curator
    if (user_type === 'Кур'){
        actionButtons.style.display = "none";
    }

    exp.addEventListener("click", () => {
        window.location.href = `/export/${gradeSelection}/`;
    })

    // School changing
    if (school==='sch'){
        sch_lyc.src = lycImg;
        sch_lyc_tooltip.innerText = 'В лицей';
    } else {
        sch_lyc.src = schImg;
        sch_lyc_tooltip.innerText = 'В школу';
    }

    sch_lyc.addEventListener("click", () => {
        document.getElementById("sch_lyc").addEventListener("click", () => {
            fetch("/change_school", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
                },
                body: JSON.stringify({}) // no data needed in body, but still must send something
            })
            .then(response => response.json())
            .then(data => {
                window.location.reload(); //Reload to get a new DB data
            })
            .catch(error => {
                alert("Something went wrong");
                console.error("Error:", error);
            });
        });
    })

    const options = selectMenu.querySelectorAll(".option");
    options.forEach(option => {
        option.addEventListener("click", () => {
            let selectedOption = option.querySelector(".option-text").innerText;
            sBtn_text.innerText = selectedOption;
            let selectedClassInput = document.getElementById('selectedClassInput');
            selectedClassInput.value = selectedOption;

            let optionsContainer = selectMenu.querySelector(".options");
            optionsContainer.animate([
                { opacity: 1, visibility: "visible" },
                { opacity: 0, visibility: "hidden" }
            ], {
                duration: 100,
                fill: "forwards"
            });
            selectMenu.classList.remove("active");

            gradeSelection = selectedOption;
            populateTable();
        })
    });

    // search logic
    search.addEventListener('input', () => {
        //Necessary for the match with populate_table
        table_rows = document.querySelectorAll('tbody tr');
        table_rows.forEach((row, i) => {
            let table_data = row.textContent.toLowerCase(),
            search_data = search.value.toLowerCase();

            row.classList.toggle('hide', table_data.indexOf(search_data) < 0);
            row.style.setProperty('--delay', i / 25 + 's');
        })

        document.querySelectorAll('tbody tr:not(.hide)').forEach((visible_row, i) => {
            visible_row.style.backgroundColor = (i % 2 == 0) ? 'transparent' : '#0000000b';
        });
    });


    // select menu logic
    function populateSelectMenu(){
        // Clear any existing content (optional)
        optionsContainer.innerHTML = '';

        addSelectMenuOption("Все классы");

        for (const grade in Grades_Letters) {
            const letters = Grades_Letters[grade];
            letters.forEach(letter => {
                addSelectMenuOption(`${grade}${letter} класс`);
            });
        }       

        //Additional Options for ВнСв
        if (user_type === 'ВнСв') {
            addSelectMenuOption("Лиды");

            if (school === 'sch'){
                addSelectMenuOption("Первые классы");
            }

            addSelectMenuOption("Архив");
            addSelectMenuOption("Выпускники");
        }

        table_rows = document.querySelectorAll('tbody tr');
    }

    function addSelectMenuOption(optionText) {
        const li = document.createElement('li');
        li.classList.add('option');
        const span = document.createElement('span');
        span.classList.add('option-text');
        span.textContent = optionText;
        li.appendChild(span);
        optionsContainer.appendChild(li);
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
            
            optionsContainer.animate([
                { opacity: 0, visibility: "hidden" },
                { opacity: 1, visibility: "visible" }
            ], {
                duration: 150,
                fill: "forwards"
            });
        }
    });


    // populate logic
    function populateTable() {
        tableSection.innerHTML = ''; // Clear the table first
        exp.style.display = "block"; // Export block is initially available 
        if (gradeSelection === 'Лиды' || gradeSelection === 'Архив' || gradeSelection === 'Выпускники') {
            switch (gradeSelection) {
                case 'Лиды':
                    targetStatus = 'Лид';
                    break;
                case 'Архив':
                    targetStatus = 'Арх';
                    break;
                case 'Выпускники':
                    targetStatus = 'Вып';
                    break;
            }
            students
                .filter(student => student.status === targetStatus)
                .forEach((student, index) => {
                    addStudent(student, index + 1);
                });
            exp.style.display = "none";
        }        
        else if (gradeSelection=='Первые классы') {
            window.location.href="/1_grade/";
        }
        else if (gradeSelection=='Все классы'){
            students
            .filter(student => student.status === 'Акт')
            .forEach((student, index) => {
                addStudent(student, index+1);
            });
        } else {
            // Use a regex to extract the grade number and letter
            const match = gradeSelection.match(/^(\d+)([A-Za-zА-Яа-яӘәҒғҚқҢңӨөҰұҮүҺһІі])\s+класс$/);
            const selected_grade = parseInt(match[1], 10); 
            const selected_letter = match[2]; 
            students
            .filter(student => 
                student.status === 'Акт' 
                && student.grade_num === selected_grade 
                && student.grade_let === selected_letter)
            .forEach((student, index) => {       
                addStudent(student, index+1);
            });
        }
    }

    function addStudent(student, index) {
        var tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${wa_mode ? '<input type="checkbox">' : index}</td>
            <td>
                <a href="${student.status === "Лид" || student.status === "Арх" ? "/temp_card_std/" + student.IIN + "/" : "/card_student/" + student.IIN + "/"}">
                    ${student.Last_Name}
                </a>
            </td>
            <td>${student.First_Name}</td>
            <td>${student.Patronim}</td>
            <td>${student.IIN}</td>
            <td>${student.phone}</td>
        `;
        tableSection.appendChild(tr);
    }

    whatsapp.addEventListener('click', () => {
        buttons_wa.style.display = "flex";
        actionButtons.style.display = "none";

        //Add check all button
        checked.innerText = '[_]';
        checked_state = false;
        checked.addEventListener('click', checkedHandler);

        wa_mode = true;
        populateTable();
    })

    cancel.addEventListener('click', () => {
        buttons_wa.style.display = "none";
        actionButtons.style.display = "flex";

        //Remove check all button
        checked.innerText = '#';
        checked.addEventListener('click', () => {}); 

        checked_state  = false;
        wa_mode = false;

        populateTable();
    })

    function checkedHandler(){
        // Get all checkboxes in the table
        const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]');

        if (checked_state){
            checked_state = false;
            checked.innerText = '[_]'
            // Unmark all checkboxes as checked
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
        }
        else{
            checked_state = true;        
            checked.innerText = '[v]'

            // Mark all checkboxes as checked
            checkboxes.forEach(checkbox => {
                checkbox.checked = true;
            });
        }
    }

    send.addEventListener('click', () => {
        // Get all checkboxes in the table
        const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]');
        
        // Initialize an array to hold the data of checked students
        const checkedStudents = [];

        // Loop through checkboxes and find the checked ones
        checkboxes.forEach((checkbox, index) => {
            if (checkbox.checked) {
                // Get the row corresponding to the checkbox
                const row = checkbox.closest('tr');
                
                // Extract data from the row cells
                const iin = row.cells[4].textContent.trim();
                    
                // Add the student IIN to the array
                checkedStudents.push(iin);
            }
        });

        // Save checked students in request.session
        fetch('/get_numbers/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value // Include CSRF token if using Django
            },
            body: JSON.stringify({ 
                checkedStudents: checkedStudents,
            })
        })
        .then(data => {
            // Handle the server's response
            window.location.href = "/whatsapp";
        })
        .catch(error => {
            // Handle errors
            console.error('Error:', error);
            alert('Произошла ошибка!');
        });
    })
});