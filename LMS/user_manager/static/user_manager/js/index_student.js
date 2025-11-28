document.addEventListener('DOMContentLoaded', function () {
    const nav_trigger = document.getElementById("nav-trigger");
    const nav_content = document.getElementById("nav-content");
    
    //Show the trigger
    nav_trigger.style.display = "flex";
    const std_id = student.id;
    const school = student.school;
    let curr_school;
    let next_school;

    if (school === "sch") {
        curr_school = "Школу";
        next_school = "Лицей";
    } else {
        curr_school = "Лицей";
        next_school = "Школу";
    }

    if (student.status === "Лид"){
        nav_content.innerHTML = `
        <ul>
            <li><a href="/accept/${std_id}/">Принять в ${curr_school}</a></li>
            <li id="sch_lyc"><a>Отправить в ${next_school}</a></li>
            <li><a href="/join_doc/${std_id}/" download="Прикрепительный талон.docx">Прикрепительный талон</a></li>
            <li><a href="/archive/${std_id}/">Отправить в Архив</a></li>
        </ul>
    `
    }
    else if (student.status === "Арх"){
        nav_content.innerHTML = `
        <ul>
            <li><a href="/card_parent/${std_id}/">Карточка Родителя</a></li>
            <li><a href="/card_contract/${std_id}/">Карточка Договора</a></li>
            <li><a href="/fill_contract/${std_id}/" download="Договор.docx">Договор</a></li>
            <li><a href="/honors/${std_id}/">Достижения</a></li>
            <li><a href="/arch_back/${std_id}/">Вернуть их Архива</a></li>
        </ul>
    `
    }
    else{
        nav_content.innerHTML = `
        <ul>
            <li><a href="/card_parent/${std_id}/">Карточка Родителя</a></li>
            <li><a href="/card_contract/${std_id}/">Карточка Договора</a></li>
            <li id="sch_lyc"><a>Отправить в ${next_school}</a></li>
            <li><a href="/leave_doc/${std_id}/" download="Открепительный талон.docx">Открепительный талон</a></li>
            <li><a href="/sign_doc/${std_id}/">Договор</a></li>
            <li><a href="/journals/${std_id}/">Журнал</a></li>
            <li><a href="/archive/${std_id}/">Отправить в Архив</a></li>
        </ul>
    `
    }

    const sch_lyc = document.getElementById('sch_lyc');

    sch_lyc.addEventListener("click", () => {
        const confirmed = confirm(`Вы хотите перевести ученика в ${next_school}?`);
        if (confirmed) {
            // Proceed with the action
            fetch(`/std_change_school/${std_id}/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
                },
                body: JSON.stringify({}) // no data needed in body, but still must send something
            })
            .then(async (response) => {
                const data = await response.json();
        
                if (!response.ok) {
                    alert(data.message || "Ошибка при переводе ученика");
                    return;
                }
        
                alert(`Ученик успешно переведен в ${next_school}, добавьте литер ученика`);
                window.location.reload();
            })
            .catch(error => {
                alert("Something went wrong");
                console.error("Error:", error);
            });
        }
    });
})