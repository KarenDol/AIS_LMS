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
    const popup = document.getElementById('pop-up');
    const editor = document.getElementById('editor');
    const button_cancel = document.getElementById('button_cancel');
    const button_send = document.getElementById('button_send');

    console.log(school);

    var gradeSelection = "Все классы";
    let counter = 1;

    populateSelectMenu();
    populateTable();

    if (selectMenu.classList.contains("active")) {
        selectMenu.classList.remove("active");
    }

    exp.addEventListener("click", () => {
        window.location.href = `/export/${gradeSelection}/`;
    })

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

        //Add "Все класссы"
        {
            const li = document.createElement('li');
            li.classList.add('option');
            const span = document.createElement('span');
            span.classList.add('option-text');
            span.textContent = 'Все классы';
            li.appendChild(span);
            optionsContainer.appendChild(li);
        }

        // Iterate through each grade from 0 to 11
        for (let grade = 0; grade <= 11; grade++) {
            const letters = Grades_Letters[grade];
            // For each letter in the grade, create a list item
            letters.forEach(letter => {
                const li = document.createElement('li');
                li.classList.add('option');

                const span = document.createElement('span');
                span.classList.add('option-text');
                span.textContent = `${grade}${letter} класс`;

                li.appendChild(span);
                optionsContainer.appendChild(li);
            });
        }

        //Add "Лид"
        {
            const li = document.createElement('li');
            li.classList.add('option');
            const span = document.createElement('span');
            span.classList.add('option-text');
            span.textContent = 'Лиды';
            li.appendChild(span);
            optionsContainer.appendChild(li);
        }

        //Add "1 классы"
        {
            const li = document.createElement('li');
            li.classList.add('option');
            const span = document.createElement('span');
            span.classList.add('option-text');
            span.textContent = 'Первые классы';
            li.appendChild(span);
            optionsContainer.appendChild(li);
        }

        //Add "Архив"
        {
            const li = document.createElement('li');
            li.classList.add('option');
            const span = document.createElement('span');
            span.classList.add('option-text');
            span.textContent = 'Архив';
            li.appendChild(span);
            optionsContainer.appendChild(li);
        }
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
        counter = 1; //Обнулить counter
        if (gradeSelection=='Все классы'){
            students.forEach(function(student) {
                if (student.status === 'Акт'){
                    addStudent(student);
                }
            });
            exp.style.display = "block";
        }
        else if (gradeSelection=='Лиды') {
            students.forEach(function(student) {
                if ((student.status === 'Лид')){
                    addStudent(student);
                }
            });
            exp.style.display = "none";
        }
        else if (gradeSelection=='Архив') {
            students.forEach(function(student) {
                if ((student.status === 'Арх')){
                    addStudent(student);
                }
            });
            exp.style.display = "none";
        }
        else if (gradeSelection=='Первые классы') {
            window.location.href="/1_grade/";
        }
        else{
            // Use a regex to extract the grade number and letter
            const match = gradeSelection.match(/^(\d+)([A-Za-zА-Яа-яӘәҒғҚқҢңӨөҰұҮүҺһІі])\s+класс$/);
            const selected_grade = parseInt(match[1], 10); 
            const selected_letter = match[2];               
            students.forEach(function(student) {
                if ((student.status === 'Акт')){
                    if ((student.grade_num === selected_grade) && (student.grade_let === selected_letter)){
                        addStudent(student);
                    }
                }
            });
            exp.style.display = "block";
        }
        table_rows = document.querySelectorAll('tbody tr');
    }

    // populate logic for WhatsApp 
    function populateTable_wa() {
        tableSection.innerHTML = ''; // Clear the table first
        if (gradeSelection=='Все классы'){
            students.forEach(function(student) {
                if (student.status === 'Акт'){
                    addStudent_wa(student);
                }
            });
        }
        else if (gradeSelection=='Лиды') {
            students.forEach(function(student) {
                if ((student.status === 'Лид')){
                    addStudent_wa(student);
                }
            });
        }
        else{
            // Use a regex to extract the grade number and letter
            const match = gradeSelection.match(/^(\d+)([A-Za-zА-Яа-я])\s+класс$/);
            const selected_grade = parseInt(match[1], 10); 
            const selected_letter = match[2];               
            students.forEach(function(student) {
                if ((student.status === 'Акт')){
                    if ((student.grade_num === selected_grade) && (student.grade_let === selected_letter)){
                        addStudent_wa(student);
                    }
                }
            });
            exp.style.display = "block";
        }
        table_rows = document.querySelectorAll('tbody tr');
    }

    function addStudent(student) {
        var tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${counter}</td>
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
        counter++;
    }

    function addStudent_wa(student){
        var tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="checkbox"></td>
            <td><a href="/card_student/${student.IIN}/">${student.Last_Name}</td>
            <td>${student.First_Name}</td>
            <td>${student.Patronim}</td>
            <td>${student.IIN}</td>
            <td>${student.temp_phone}</td>
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

        populateTable_wa();
    })

    cancel.addEventListener('click', () => {
        buttons_wa.style.display = "none";
        actionButtons.style.display = "flex";

        //Remove check all button
        checked.innerText = '#';
        checked.addEventListener('click', () => {}); 

        checked_state  = false;

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
        popup.style.display = 'block';
        main.style.filter = 'blur(5px)';
        cancel.disabled = true;
        send.disabled = true;
    })

    button_cancel.addEventListener('click', () => {
        popup.style.display = 'none';
        main.style.filter = 'blur(0px)';
        cancel.disabled = false;
        send.disabled = false;
    })

    button_send.addEventListener('click', () => {
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

        // Get the content of the contenteditable div
        const waText = document.getElementById('editor').innerText.trim();

        /// If no students are selected or wa_text is empty, show an alert and exit
        if (checkedStudents.length === 0 || !waText) {
            alert('Выберите учеников и введите текст рассылки!');
            return;
        }
        // Send the data to the server
        fetch('/wa/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value // Include CSRF token if using Django
            },
            body: JSON.stringify({ 
                checkedStudents: checkedStudents,
                wa_text: waText
            })
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Произошла ошибка!');
            }
        })
        .then(data => {
            // Handle the server's response
            console.log('Server response:', data);
            alert('Данные успешно отправлены!');
        })
        .catch(error => {
            // Handle errors
            console.error('Error:', error);
            alert('Произошла ошибка!');
        });
    })


    //Editor logic
    const tags = ["@Родитель", "@Ученик", "@Оплата"];

    function highlightContent() {
    const instance = new Mark(editor);

    // Save cursor position
    const selection = window.getSelection();
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    // Unmark previous highlights
    instance.unmark({
        done: () => {
        // Highlight new tags
        instance.mark(tags, {
            element: "span",
            className: "highlight",
            accuracy: "exactly",
            caseSensitive: true
        });

        // Restore cursor position
        if (range) {
            selection.removeAllRanges();
            selection.addRange(range);
        }
        },
    });
    }

    // Listen for input events on the contenteditable div
    editor.addEventListener("input", highlightContent);

    // Initial highlight on page load
    highlightContent();
});