document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('container');
    const exp_dict = {'exp1': 'Без опыта', 'exp2': '1-2 года', 'exp3': '3-5 лет', 'exp4': 'Более 5 лет'};

    const isHR = user_type === 'HR';

    //Applicants can only see active positions
    if (!isHR) {
        positions = positions.filter((position) => position.status === 'act');
    }

    for (let i = 0; i < positions.length; i += 2) {    
        if (i + 1 < positions.length) {
            addPositions(positions[i], positions[i + 1]);
        } else {
            addPosition(positions[i]);
        }
    }

    if (positions.length%2 === 0) {newPosition()} //newPosition Button is available only for HR

    function addPositions(pos1, pos2){
        var card_block = document.createElement('div');
        card_block.className = 'card_block';

        card_block.innerHTML = `
            <div class="card" data-id="${pos1.id}">
                <div class="card-content"">
                    <h3>${pos1.title}</h3>
                    <p class="description">${salary_to_text(pos1.salary)}</p>
                    <p class="experience">${exp_dict[pos1.experience]}</p>
                    <p class="date">${date_to_text(pos1.date)}</p>
                </div>
                <div class="button-container">
                    ${btnHandler(pos1)}
                </div>
            </div>
            <div class="card" data-id="${pos2.id}">
                <div class="card-content">
                    <h3>${pos2.title}</h3>
                    <p class="description">${salary_to_text(pos2.salary)}</p>
                    <p class="experience">${exp_dict[pos2.experience]}</p>
                    <p class="date">${date_to_text(pos2.date)}</p>
                </div>
                <div class="button-container">
                    ${btnHandler(pos2)}
                </div>
            </div>
        `;
        container.appendChild(card_block);

        // Add event listeners for cards
        card_block.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', function() {
                const positionId = this.getAttribute('data-id');
                window.location.href = `/hr/position/${positionId}`;
            });
        });
    }

    function addPosition(pos){
        var card_block = document.createElement('div');
        card_block.className = 'card_block';
        
        const title = isHR ? 'Новая Позиция' : 'Ваша Позиция';
        const description = isHR 
            ? 'Добавьте новую вакансию и укажите все необходимые детали' 
            : 'Не увидели вашу позицию? Подайтесь самостоятельно';
        const experience = isHR ? 'Укажите опыт' : 'Поделитесь своим опытом';

        card_block.innerHTML = `
            <div class="card" data-id="${pos.id}">
                <div class="card-content">
                    <h3>${pos.title}</h3>
                    <p class="description">${salary_to_text(pos.salary)}</p>
                    <p class="experience">${exp_dict[pos.experience]}</p>
                    <p class="date">${date_to_text(pos.date)}</p>
                </div>
                <div class="button-container">
                    ${btnHandler(pos)}
                </div>
            </div>
            <div class="card-plus">
                <div class="card-content">
                <h3>${title}</h3>
                <p class="description">${description}</p>
                <p class="experience">${experience}</p>
                <p class="date">Сегодня</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24">
                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18 12h-6m0 0H6m6 0V6m0 6v6"/>
                </svg>
            </div>`;
        container.appendChild(card_block);

        // Add event listeners for cards
        card_block.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', function() {
                const positionId = this.getAttribute('data-id');
                window.location.href = `/hr/position/${positionId}`;
            });
        });
    }

    function newPosition(){
        var card_block = document.createElement('div');
        card_block.className = 'card_block';

        const title = isHR ? 'Новая Позиция' : 'Ваша Позиция';
        const description = isHR 
            ? 'Добавьте новую вакансию и укажите все необходимые детали' 
            : 'Не увидели вашу позицию? Подайтесь самостоятельно';
        const experience = isHR ? 'Укажите опыт' : 'Поделитесь своим опытом';

        card_block.innerHTML = `
            <div class="card-plus">
                <div class="card-content">
                    <h3>${title}</h3>
                    <p class="description">${description}</p>
                    <p class="experience">${experience}</p>
                    <p class="date">Сегодня</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24">
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18 12h-6m0 0H6m6 0V6m0 6v6"/>
                </svg>
            </div>
            <div class="card-empty"></div>
        `;
        container.appendChild(card_block);

        // Event listener for card-plus
        card_block.querySelectorAll('.card-plus').forEach(card => {
            card.addEventListener('click', function() {
                window.location.href = `/hr/new_position/`;
            });
        });
    }

    // Event listener for card-plus
    const cardPlus = document.querySelector('.card-plus');
    cardPlus.addEventListener('click', function() {
        window.location.href = isHR ? "/hr/new_position/" : "/hr/apply/0";
    });


    function btnHandler(position){
        if (isHR) {
            if (position.status === 'act') {
                return `<label class='act'><a href=/hr/change_status/${position.id}>Активный</a></label>`;
            } else {
                return `<label class='arc'><a href=/hr/change_status/${position.id}>Архив</a></label>`;
            }
        } else {
            return `<button class="apply"><a href="/hr/apply/${position.id}" class="apply">Откликнуться</a></button>`;
        }
    }

    function salary_to_text(salary){
        if (salary === 0){
            return 'Оплата труда обсуждается индивидуально';
        }
        else{
            salary_text = String(salary).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
            return `от ${salary_text} тенге на руки`;
        }
    }

    function date_to_text(dateString) {
        // Split the input date string (YYYY-MM-DD)
        const [year, month, day] = dateString.split('-');
    
        // Create a new Date object (year, month - 1, day)
        const date = new Date(year, month - 1, day);
    
        // Format the date to Russian day, short month name, and year
        const formatter = new Intl.DateTimeFormat('ru-RU', { 
            day: 'numeric',   // Day (e.g., "21")
            month: 'short',   // Short month name (e.g., "янв.")
            year: 'numeric'   // Full year (e.g., "2025")
        });
    
        // Format and replace unnecessary '.' from the month, add "г."
        return formatter.format(date).replace('.', '');
    }


})