document.addEventListener('DOMContentLoaded', function () {
    const table_1 = document.getElementById('table_1');
    const table_2 = document.getElementById('table_2');
    const table_3 = document.getElementById('table_3');
    const table_4 = document.getElementById('table_4');
    const table_5 = document.getElementById('table_5');

    const box_1 = document.getElementById('box_1');
    const box_2 = document.getElementById('box_2');
    const box_3 = document.getElementById('box_3');
    const box_4 = document.getElementById('box_4');
    const box_5 = document.getElementById('box_5');
    const box_6 = document.getElementById('box_6');

    const letterMap = {
        '?': [table_1, box_1, 0],
        'А': [table_2, box_2, 0],
        'Ә': [table_3, box_3, 0],
        'Б': [table_4, box_4, 0],
        'В': [table_5, box_5, 0],
    }

    const boxes = [box_1, box_2, box_3, box_4, box_5, box_6];
    let cand_id = 0;

    candidates.forEach((candidate) => {
        const row = document.createElement('tr');
        const table = letterMap[candidate.letter][0];
        index = letterMap[candidate.letter][2];

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${candidate.status ? '✅' : ''} ${candidate.full_name}</td>
        `;

        letterMap[candidate.letter][2] = index+1;
        
        table.appendChild(row);   

        row.addEventListener("click", function(event) {
            color_boxes(candidate);
            cand_id = candidate.pk;

            // Get row position
            let rect = row.getBoundingClientRect();

            // Position popup above the row
            pop_up.style.left = `${rect.left + window.scrollX + 50}px`;
            pop_up.style.top = `${rect.top + window.scrollY - 10}px`;
            console.log(pop_up.style.left, pop_up.style.top);
            pop_up.style.display = "flex";

            // Close popup when clicking outside
            // document.addEventListener("click", function closePopup(e) {
            //     if (!pop_up.contains(e.target) && e.target !== row) {
            //         pop_up.style.display = "none";
            //     }
            // });
        });
    });

    pop_up = document.getElementById('pop_up');
    
    function color_boxes(candidate){
        boxes.forEach((box) => {
            box.style.backgroundColor = '#FFFFFF';
        })

        box = letterMap[candidate.letter][1];
        box.style.backgroundColor = '#4c97d0';

        box_6.style.backgroundColor = candidate.status ? '#42E45D' : '#E75A5F';
        box_6.innerText = candidate.status ? '+' : '-';
    }

    boxes.forEach((box) => {
        box.addEventListener('click', () => {
            boxID = box.getAttribute("data-id");
            console.log(cand_id);
            fetch(`/change_candidate/${cand_id}/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                },
                body: JSON.stringify({
                    boxID: boxID,
                })
            })
            .then(response => response.json())  
            .then(data => window.location.reload())
            .catch(error => console.error("Error:", error));            
        })
    })
})