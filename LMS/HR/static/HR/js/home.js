document.addEventListener('DOMContentLoaded', function() {
    search = document.querySelector('.input-group input'),
    table_headings = document.querySelectorAll('thead th');
    table_rows = document.querySelectorAll('tbody tr'),
    tableSection = document.getElementById('studentsTableBody');

    let counter = 1;
    populateTable();

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

    function populateTable() {
        tableSection.innerHTML = ''; // Clear the table first
        counter = 1; //Обнулить counter
        applicants.forEach(function(applicant) {
            addApplicant(applicant);
        });
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
});