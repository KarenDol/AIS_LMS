document.addEventListener('DOMContentLoaded', function () {
    const nav_trigger = document.getElementById("nav-trigger");
    const nav_content = document.getElementById("nav-content");
    
    //Show the trigger
    nav_trigger.style.display = "flex";
    const IIN = student.IIN;

    if (student.status === "Лид"){
        nav_content.innerHTML = `
        <ul>
            <li><a href="/accept/${IIN}/">Принять в Школу</a></li>
            <li><a href="/join_doc/${IIN}/" download="Прикрепительный талон.docx">Прикрепительный талон</a></li>
            <li><a href="/archive/${IIN}/">Отправить в Архив</a></li>
        </ul>
    `
    }
    else if (student.status === "Арх"){
        nav_content.innerHTML = `
        <ul>
            <li><a href="/card_parent/${IIN}/">Карточка Родителя</a></li>
            <li><a href="/card_contract/${IIN}/">Карточка Договора</a></li>
            <li><a href="/fill_contract/${IIN}/" download="Договор.docx">Договор</a></li>
            <li><a href="/honors/${IIN}/">Достижения</a></li>
            <li><a href="/arch_back/${IIN}/">Вернуть их Архива</a></li>
        </ul>
    `
    }
    else{
        nav_content.innerHTML = `
        <ul>
            <li><a href="/card_parent/${IIN}/">Карточка Родителя</a></li>
            <li><a href="/card_contract/${IIN}/">Карточка Договора</a></li>
            <li><a href="/leave_doc/${IIN}/" download="Открепительный талон.docx">Открепительный талон</a></li>
            <li><a href="/sign_doc/${IIN}/">Договор</a></li>
            <li><a href="/journals/${IIN}/">Журнал</a></li>
            <li><a href="/archive/${IIN}/">Отправить в Архив</a></li>
        </ul>
    `
    }
})