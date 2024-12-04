search = document.querySelector('.input-group input'),
table_headings = document.querySelectorAll('thead th');
table_rows = document.querySelectorAll('tbody tr'),
tableSection = document.getElementById('studentsTableBody');
var gradeSelection = "Все позиции";
let counter = 1;
const optionMenu = document.querySelector(".select-menu"),
selectBtn = optionMenu.querySelector(".select-btn"),
options = optionMenu.querySelectorAll(".option"),
sBtn_text = optionMenu.querySelector(".sBtn-text");

document.addEventListener('DOMContentLoaded', function() {
    populateTable();
    if (optionMenu.classList.contains("active")) {
        optionMenu.classList.remove("active");
    }
});

// search
search.addEventListener('input', searchTable);

function searchTable() {
    table_rows.forEach((row, i) => {
        let table_data = row.textContent.toLowerCase(),
        search_data = search.value.toLowerCase();

        row.classList.toggle('hide', table_data.indexOf(search_data) < 0);
        row.style.setProperty('--delay', i / 25 + 's');
    })

    document.querySelectorAll('tbody tr:not(.hide)').forEach((visible_row, i) => {
        visible_row.style.backgroundColor = (i % 2 == 0) ? 'transparent' : '#0000000b';
    });
}

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
            duration: 100,
            fill: "forwards"
        });
        optionMenu.classList.remove("active");

        gradeSelection = selectedOption;
        populateTable();
    })
});


function populateTable() {
    tableSection.innerHTML = ''; // Clear the table first
    counter = 1; //Обнулить counter
    if (gradeSelection=='Все позиции'){
        applicants.forEach(function(applicant) {
            addApplicant(applicant);
        });
    }
    else{
        applicants.forEach(function(applicant) {
            if ((applicant.position === gradeSelection)){
                addApplicant(applicant);
            }
        });
    }
    table_rows = document.querySelectorAll('tbody tr');
}


function addApplicant(applicant){
    var tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${counter}</td>
        <td><a href="applicant_card/${applicant.iin}/">${applicant.last_name}</td>
        <td>${applicant.first_name}</td>
        <td>${applicant.patronim}</td>
        <td>${applicant.position}</td>
    `;
    if (applicant.status === 'Акт'){
        tr.innerHTML += `<td><p class="act">Активный</p></td>`
    }
    else if (applicant.status === 'Арх'){
        tr.innerHTML += `<td><p class="arc">Архив</p></td>`
    }
    else if (applicant.status === 'Отк'){
        tr.innerHTML += `<td><p class="arc">Отказано</p></td>`
    }
    else if (applicant.status === 'При'){
        tr.innerHTML += `<td><p class="pos">Принят</p></td>`
    }
    else{
        console.log(interviews);
        console.log(applicant.iin);
        console.log(interviews[applicant.iin]);
        tr.innerHTML += `<td><p class="int">Интервью<span class="tooltiptext">${interviews[applicant.iin]}</span></p></td>`
    }
    tableSection.appendChild(tr);
    counter++;
}