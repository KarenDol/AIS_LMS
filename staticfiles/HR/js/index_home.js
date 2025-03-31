document.addEventListener('DOMContentLoaded', function () {
    const nav_trigger = document.getElementById("nav-trigger");
    const nav_content = document.getElementById("nav-content");
    //Show the trigger
    nav_trigger.style.display = "flex";

    if (page === "home"){
        nav_content.innerHTML = `
        <ul>
            <li><a href="/hr/jobs/">Просмотр вакансий</a></li>
            <li><a href="/hr/apply/">Добавить резюме</a></li>
        </ul>
    `
    }
    else{
        nav_content.innerHTML = `
        <ul>
            <li><a href="/hr/">Список кандидатов</a></li>
            <li><a href="/hr/new_position/">Добавить вакансию</a></li>
        </ul>
    `
    }
})