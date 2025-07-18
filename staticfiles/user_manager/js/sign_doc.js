document.addEventListener('DOMContentLoaded', function () {
    const dropArea = document.querySelector('.drop-section');
    const listSection = document.querySelector('.list-section');
    const listContainer = document.querySelector('.list');
    const fileSelector = document.querySelector('.file-selector');
    const fileSelectorInput = document.querySelector('.file-selector-input');
    const headerText = document.getElementById("header-text");
    const docSection = document.getElementById("doc-section");
    const btnSubmit = document.getElementById("btnSubmit");
    var formData = new FormData();
    let fileName;

    if (status) {
        headerText.innerText = "Договор уже заполнен и подписан";
        docSection.innerHTML += `
            <div class="doc">
                <img src=${arrowLogo} alt="file">
                <a href="/api/serve_pdf/docs/${numb}.pdf" target="_blank"><p><b>Подписанный_договор.pdf</b></p></a>
            </div>
        `;
        //target="_blank" always opens in a new tab
        alert("Подписанный договор уже загружен. Повторная загрузка заменит текущий файл.");
    }

    // Browse button
    fileSelector.addEventListener('click', function(event) {
            event.preventDefault();
            fileSelectorInput.click(); // Trigger click event on file input
    });

    fileSelectorInput.onchange = () => {
        [...fileSelectorInput.files].forEach((file) => {
            if(typeValidation(file.type) && slotAvailable()){
                uploadFile(file);
            }
        });
    };

    // file is over the drag area
    dropArea.ondragover = (e) => {
        e.preventDefault();
        dropArea.classList.add('drag-over-effect');    
    };

    // file leave the drag area
    dropArea.ondragleave = () => {
        dropArea.classList.remove('drag-over-effect');
    };

    // file drop on the drag area
    dropArea.ondrop = (e) => {
        e.preventDefault();
        dropArea.classList.remove('drag-over-effect');
        if(e.dataTransfer.items){
            [...e.dataTransfer.items].forEach((item) => {
                if(item.kind === 'file'){
                    const file = item.getAsFile();
                    if(typeValidation(file.type) && slotAvailable()){
                        uploadFile(file);
                    } 
                }
            });
        }else{
            [...e.dataTransfer.files].forEach((file) => {
                if(typeValidation(file.type)  && slotAvailable()){
                    uploadFile(file);
                }
            });
        }
    };

    // check the file type
    function typeValidation(type){
        if (type == 'application/pdf') {
            return true;
        } else {
            alert("Только файлы формата PDF");
            return false;
        }
    }

    // there can be only one file
    function slotAvailable(){
        if (fileName) {
            alert("Вы уже загрузили файл. Чтобы заменить его, сначала удалите текущий.");
            return false;
        } else {
            return true;
        }
    }

    // upload file function
    function uploadFile(file){
        listSection.style.display = 'block';
        var li = document.createElement('li');
        li.classList.add('in-prog');
        li.innerHTML = `
            <div class="col">
                <img src="${staticUrl}" alt="">
            </div>
            <div class="col">
                <div class="file-name">
                    <div class="name">${file.name}</div>
                    <span>0%</span>
                </div>
                <div class="file-progress">
                    <span></span>
                </div>
                <div class="file-size">${(file.size/(1024*1024)).toFixed(2)} MB</div>
            </div>
            <div class="col">
                <svg xmlns="http://www.w3.org/2000/svg" class="cross" height="20" width="20"><path d="m5.979 14.917-.854-.896 4-4.021-4-4.062.854-.896 4.042 4.062 4-4.062.854.896-4 4.062 4 4.021-.854.896-4-4.063Z"/></svg>
                <svg xmlns="http://www.w3.org/2000/svg" class="tick" height="20" width="20"><path d="m8.229 14.438-3.896-3.917 1.438-1.438 2.458 2.459 6-6L15.667 7Z"/></svg>
            </div>
        `;
        listContainer.prepend(li);
        formData.append('file', file);
        fileName = file.name;

        li.querySelector('.cross').addEventListener('click', () => {
            li.remove(); // Remove the list item on click
            listSection.style.display = 'none'; //Hide the uploaded files div
            formData.delete('file');
            fileName = null;
        });
    }

    btnSubmit.addEventListener('click', () => {
        var csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;
        if (formData['file']){
            alert("Файл не загружен. Пожалуйста, прикрепите файл");
        } else {
            fetch(`/sign_doc/${IIN}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrfToken // Include CSRF token in the headers
                },
                body: formData
            })
            .then(response => {
                if (response.redirected) {
                    window.location.assign(response.url);
                } else {
                    return response.json(); // Parse the JSON from the server
                }
            })
            .then(data => {
                if (data) {
                    if (data.status === 'error') {
                        alert(data.message);  // Show error message
                    } else if (data.status === 'success') {
                        alert("Файл успешно загружен");
                        window.location.reload();
                    }
                }
            })
        }
    });  
})