document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('mainForm');
    const title = document.getElementById('title');
    const salary = document.getElementById('salary');
    const experience = document.getElementById('experience');
    const button_back = document.getElementById('button_back');

    title.innerHTML = `<p>${position.title}</p>`;

    const salaryValue = String(position.salary).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); // Add spaces as thousand separators
    salary.innerHTML = `<p>Заработная плата:</p> <label>₸ ${salaryValue}</label>`;

    const exp_dict = {'exp1': 'Без опыта', 'exp2': '1-2 года', 'exp3': '3-5 лет', 'exp4': 'Более 5 лет'};
    experience.innerHTML = `<p>Требуемый опыт: </p><label>${exp_dict[position.experience]}</label>`;

    const desc_editor = new Quill('#desc-editor', {
        theme: 'snow',
        modules: {
            toolbar: false // Disable the toolbar
        },
        readOnly: true // Make the editor uneditable
    });
    //JSON -> Delta
    const desc_delta = JSON.parse(position.description);
    desc_editor.setContents(desc_delta);
    
    const req_editor = new Quill('#req-editor', {
        theme: 'snow',
        modules: {
            toolbar: false // Disable the toolbar
        },
        readOnly: true // Make the editor uneditable
    });
    //JSON -> Delta
    const req_delta = JSON.parse(position.requirements);
    req_editor.setContents(req_delta);

    button_back.addEventListener('click',  () => {
        event.preventDefault();
        window.location.href = `/hr/vacancy/`;
    })
})