const dropArea = document.querySelector('.drop-section');
const listSection = document.querySelector('.list-section');
const listContainer = document.querySelector('.list');
const fileSelector = document.querySelector('.file-selector');
const fileSelectorInput = document.querySelector('.file-selector-input');
//let form = document.getElementById("form");
var formData = new FormData();
const fileEntries = new Map();
// upload files with browse button
document.querySelector('.file-selector').addEventListener('click', function(event) {
        event.preventDefault(); // Prevent default form submission
        fileSelectorInput.click(); // Trigger click event on file input
        });
//fileSelector.onclick = () => fileSelectorInput.click();
fileSelectorInput.onchange = () => {
    [...fileSelectorInput.files].forEach((file) => {
        if(typeValidation(file.type)){
            uploadFile(file);
        }
    });
};

// file is over the drag area
dropArea.ondragover = (e) => {
    e.preventDefault();
    [...e.dataTransfer.items].forEach((item) => {
        if(typeValidation(item.type)){
            dropArea.classList.add('drag-over-effect');
        }
    });
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
                if(typeValidation(file.type)){
                    uploadFile(file);
                }
            }
        });
    }else{
        [...e.dataTransfer.files].forEach((file) => {
            if(typeValidation(file.type)){
                uploadFile(file);
            }
        });
    }
};

// check the file type
function typeValidation(type){
    var splitType = type.split('/')[0];
    if(type == 'application/pdf' || splitType == 'image' || splitType == 'video'){
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
    formData.append(file.name, file);
    fileEntries.set(li, file.name);

    li.querySelector('.cross').addEventListener('click', () => {
        li.remove(); // Remove the list item on click

        const fileName = fileEntries.get(li);
        formData.delete(fileName);
        fileEntries.delete(li);
    });
}

// find icon for file
function iconSelector(type){
    var splitType = (type.split('/')[0] == 'application') ? type.split('/')[1] : type.split('/')[0];
    return splitType + '.png';
}

document.getElementById("form").addEventListener('submit', function(event) {
    console.log('Form is submitted');
    var csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;
    event.preventDefault(); // Prevent default form submission
    fetch(`/sign_doc/${IIN}/`, {
         method: 'POST',
         headers: {
             'X-CSRFToken': csrfToken // Include CSRF token in the headers
         },
         body: formData
    }).then(response => {
    if (response.redirected) {
        window.location.href = response.url; // Redirect if server sends a redirect response
    } else {
        // Handle response as needed if no redirect
    }
    });
});