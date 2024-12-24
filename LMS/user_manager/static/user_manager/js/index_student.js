document.addEventListener('DOMContentLoaded', function () {
    const nav_trigger = document.getElementById("nav-trigger");
    const nav_content = document.getElementById("nav-content");
    //Check if the student is in the system
    if (student){ 
        //Show the trigger
        nav_trigger.style.display = "flex";

        if (student.status === "Лид"){
            nav_content.innerHTML = `
            <ul>
                <li><a href="/accept/${student.IIN}/">Принять в Школу</a></li>
                <li><a href="/archive/${student.IIN}/">Отправить в Архив</a></li>
                <li><a href="/join_doc/${student.IIN}/" download="Прикрепительный талон.docx">Прикрепительный талон</a></li>
            </ul>
        `
        }

        else{
            nav_content.innerHTML = `
            <ul>
                <li><a href="/card_parent/${student.IIN}/">Карточка Родителя</a></li>
                <li><a href="/card_contract/${student.IIN}/">Карточка Договора</a></li>
                <li><a href="/leave_doc/${student.IIN}/" download="Открепительный талон.docx">Открепительный талон</a></li>
                <li><a href="/fill_contract/${student.IIN}/" download="Договор.docx">Договор</a></li>
                <li><a href="/honors/${student.IIN}/">Достижения</a></li>
            </ul>
        `
        }
    }
})