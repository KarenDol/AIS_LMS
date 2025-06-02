document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('mainForm');
    const title = document.getElementById('title');
    const salary = document.getElementById('salary');
    const experience = document.getElementById('experience');
    const desc_input = document.getElementById('desc-input');
    const req_input = document.getElementById('req-input');
    const button_back = document.getElementById('button_back');
    const button_apply = document.getElementById('button_apply');

    const isHR = user_type === 'HR';
    let editable = false;


    //Populate position info
    headerContents();

    function headerContents(){
        if (isHR && editable){
            title.innerHTML = `<input class="position-title" value='${position.title}' id="title_input" name="title" type="text" placeholder="Ex. Учитель Химии...">`;

            salary.innerHTML = 
                `<div class="salary-label">
                    <p>Заработная плата | </p>
                    <input type="checkbox" id="salary_status" name="salary_status">
                    <label for="salary_status">Без указания з/п</label>
                </div>
                <div class="salary-input" id="salary_input_wrap">
                    <span class="currency-code">₸</span>
                    <input class="salary" id="salary_input" value=${position.salary} name="salary" type="text" placeholder="Ex. 200 000...">
                </div>`;
            
            const checkbox = document.getElementById("salary_status");
            const salaryInput = document.getElementById("salary_input");
            const salaryInputWrap = document.getElementById("salary_input_wrap");

            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    salaryInputWrap.style.display = 'none';
                }
                else{
                    salaryInputWrap.style.display = 'flex';
                }
            })
            salaryInput.addEventListener('input', () => {
                salaryInput.value = salary_input.value.replace(/[^0-9]/g, '');
                salaryInput.value = salary_input.value.replace(/\B(?=(\d{3})+(?!\d))/g, ' '); // Add spaces as thousand separators
            });

            experience.innerHTML = 
                `<div class="salary-label">
                    <p>Требуемый опыт:</p>
                </div>
                <div class="radio-options">
                    <div class="radio-option">
                        <input type="radio" id="exp1" name="experience" value="exp1">
                        <label for="exp1">Без опыта</label>
                    </div>
                    <div class="radio-option">
                        <input type="radio" id="exp2" name="experience" value="exp2">
                        <label for="exp2">1-2 года</label>
                    </div>
                    <div class="radio-option">
                        <input type="radio" id="exp3" name="experience" value="exp3">
                        <label for="exp3">3-5 лет</label>
                    </div>
                    <div class="radio-option">
                        <input type="radio" id="exp4" name="experience" value="exp4">
                        <label for="exp4">Более 5 лет</label>
                    </div>
                </div>`;

            const selectedOption = document.getElementById(position.experience);
            selectedOption.checked = true;
        } else {    
            title.innerHTML = `<p>${position.title}</p>`;
            if (isHR){
                title.innerHTML += 
                    `<svg xmlns="http://www.w3.org/2000/svg" width="1.3em" height="1.3em" viewBox="0 0 24 24" class="pen">
                        <path fill="currentColor" d="M22 7.24a1 1 0 0 0-.29-.71l-4.24-4.24a1 1 0 0 0-.71-.29a1 1 0 0 0-.71.29l-2.83 2.83L2.29 16.05a1 1 0 0 0-.29.71V21a1 1 0 0 0 1 1h4.24a1 1 0 0 0 .76-.29l10.87-10.93L21.71 8a1.2 1.2 0 0 0 .22-.33a1 1 0 0 0 0-.24a.7.7 0 0 0 0-.14ZM6.83 20H4v-2.83l9.93-9.93l2.83 2.83ZM18.17 8.66l-2.83-2.83l1.42-1.41l2.82 2.82Z"/>
                    </svg>`;
                title.classList.add("edit");
            }
            
            const salaryValue = String(position.salary).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); // Add spaces as thousand separators
            salary.innerHTML = `<div class="salary-label"><p>Заработная плата:</p> <label>₸ ${salaryValue}</label></div>`;

            const exp_dict = {'exp1': 'Без опыта', 'exp2': '1-2 года', 'exp3': '3-5 лет', 'exp4': 'Более 5 лет'};
            experience.innerHTML = `<div class="salary-label" ><p>Требуемый опыт: </p><label>${exp_dict[position.experience]}</label></div>`;
        }
    }

    const desc_editor = new Quill('#desc-editor', {
        theme: 'snow',
        modules: {
            toolbar: false // Disable the toolbar
        },
        readOnly: true //Disable editing
    });
    
    const req_editor = new Quill('#req-editor', {
        theme: 'snow',
        modules: {
            toolbar: false // Disable the toolbar
        },
        readOnly: true //Disable editing
    });

    //JSON -> Delta
    const desc_delta = JSON.parse(position.description);
    desc_editor.setContents(desc_delta);

    const req_delta = JSON.parse(position.requirements);
    req_editor.setContents(req_delta);

    //Editing logic
    title.addEventListener('click', () => {
        if (!editable){
            editable = true;
            editHandler();
        }  
    })

    function editHandler(){
        if (editable){
            headerContents();
            desc_editor.enable(true);
            req_editor.enable(true);
            button_back.innerText = 'Отменить';

            title.classList.remove("edit");
        } else {
            headerContents();
            desc_editor.enable(false);
            req_editor.enable(false);
            button_back.innerText = 'Назад';

            title.classList.add("edit");
        }
    }

    button_back.addEventListener('click',  (event) => {
        event.preventDefault();

        if (editable) {
            const desc_delta = JSON.parse(position.description);
            desc_editor.setContents(desc_delta);
            const req_delta = JSON.parse(position.requirements);
            req_editor.setContents(req_delta); 
            
            editable = false;
            editHandler();
        } else {
            window.location.href = `/hr/jobs/`;   
        }
    })

    if (isHR) {button_apply.innerText = 'Сохранить'};
    button_apply.addEventListener('click',  (event) => {
        if (!isHR) {
            event.preventDefault();
            window.location.href = `/hr/apply/${position.id}`;
        }
    })

    //Form validation
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const desc_delta = desc_editor.getContents();
        desc_input.value = JSON.stringify(desc_delta);

        const req_delta = req_editor.getContents();
        req_input.value = JSON.stringify(req_delta);
        
        if (checkInputs()){
            form.submit();
            alert("Отправлено на проверку!");
        } else {
            alert('Пожалуйста, заполните все поля');
        };
    });

    function checkInputs() {
        let isValid = true;
        const title_input = document.getElementById('title_input');
        const checkbox = document.getElementById('salary_status');
        const salaryInput = document.getElementById('salary_input');

        if (title_input.value === ''){ isValid = false };
        if ((checkbox.checked===false) && (salaryInput.value==='')){ isValid = false};

        const desc_delta = desc_editor.getContents();
        if (desc_delta.ops.length === 1 && desc_delta.ops[0].insert === "\n") {
            isValid = false;
        }
        const req_delta = req_editor.getContents();
        if (req_delta.ops.length === 1 && req_delta.ops[0].insert === "\n") {
            isValid = false;
        }
        return isValid;
    }
})