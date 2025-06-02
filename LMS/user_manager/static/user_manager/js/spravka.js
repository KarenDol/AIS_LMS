document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const iinForm = document.getElementById("iin-form");
    const smsForm = document.getElementById("sms-form");
    const downloadSection = document.getElementById("download-section");
    const iinSubmitBtn = document.getElementById("iin-submit");
    const smsSubmitBtn = document.getElementById("sms-submit");
    const downloadBtn = document.getElementById("download-button");
    const toast = document.getElementById("toast");
    const toastTitle = document.getElementById("toast-title");
    const toastDescription = document.getElementById("toast-description");
    const header = document.querySelector('.card-description');
    const digits = document.querySelectorAll('.digit-group input');


    // Event Listeners
    iinForm.addEventListener("submit", handleIinSubmit);
    smsForm.addEventListener("submit", handleSmsVerification);
    downloadBtn.addEventListener("click", handleDownload);

    iinForm.addEventListener('input', () => {
        iin.value = iin.value.replace(/[^0-9]/g, '');
        iin.value = iin.value.replace(/\B(?=(\d{6})+(?!\d))/g, ' '); // Add spaces for better visibility
    });

    //Digit-group logic
    digits.forEach((digit) => {
        digit.setAttribute('maxlength', 1);

        digit.addEventListener('input', (e) => {
            const value = e.target.value.replace(/\D/g, ''); // Only allow digits
            e.target.value = value;

            if (value && digit.dataset.next) {
                document.getElementById(digit.dataset.next)?.focus();
            }
        });

        digit.addEventListener('keydown', (e) => {
            if ((e.key === 'Backspace' || e.key === 'ArrowLeft') && !digit.value && digit.dataset.previous) {
                document.getElementById(digit.dataset.previous)?.focus();
            }
        });
    });
  
    // Functions
    async function handleIinSubmit(e) {
        e.preventDefault()
        const iin = document.getElementById("iin").value

       // Validate IIN format
        const iinRaw = iin.replace(/\D/g, ''); // removes spaces or other non-digit characters

        if (!/^\d{12}$/.test(iinRaw)) {
            showToast("Ошибка", "ИИН должен содержать 12 цифр", true);
            return;
        }

        // Disable button and show loading state
        iinSubmitBtn.disabled = true
        iinSubmitBtn.textContent = "Проверка..."

        const studentData = await student_exists(iinRaw)
        
        if (studentData.status === 'success') {
            //update header TextContext
            header.textContent = `Получите справку для ${studentData.std_name}`

            //logged user can take spravka w/o WA code
            if (studentData.logged_in){
                iinForm.classList.add("hidden")
                downloadSection.classList.remove("hidden")
            } else {
                showToast("SMS код", `Код подтверждения отправлен на номер WhatsApp +7 (***) ***-${studentData.phone}`);
                iinForm.classList.add("hidden")
                smsForm.classList.remove("hidden")
            }
        } else {
            showToast("Ученик не найден", "Проверьте правильность введённого ИИН", true)
        }
    }
  
    async function handleSmsVerification(e) {
        e.preventDefault()
        const smsCode = getSmsCode()

        // Validate SMS code format
        if (!/^\d{4}$/.test(smsCode)) {
            showToast("Ошибка", "SMS код должен содержать 4 цифры", true)
            return
        }

        // Disable button and show loading state
        smsSubmitBtn.disabled = true
        smsSubmitBtn.textContent = "Проверка..."

        const pinStatus = await verify_phone(smsCode)
        
        if (pinStatus === 'success'){
            // Code is correct, show download section
            smsForm.classList.add("hidden")
            downloadSection.classList.remove("hidden")
            showToast("Успешно", "Код подтвержден")
        } else {
            // Code is incorrect, show error
            showToast("Неверный код", "Пожалуйста, проверьте код и попробуйте снова", true)
        }

      // Reset button state
      smsSubmitBtn.disabled = false
      smsSubmitBtn.textContent = "Подтвердить"
    }
  
    function handleDownload() {
        // In a real application, this would trigger a download of the actual document
        showToast("Загрузка началась", "Ваша справка загружается")
        // Trigger the download: create an <a/> element and simulate the click
        // Other methods do not work properly
        setTimeout(() => {
            const link = document.createElement("a");
            link.href = "/get_spravka/";
            link.download = "Справка.docx";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }, 500);
    }

    async function student_exists(IIN) {
        return fetch(`/student_exists/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ IIN: IIN }),
        })
        .then(response => response.json())
        .then(data => {return data})
        .catch(error => {
            console.error('Request failed', error);
        });
    }

    async function verify_phone(PIN) {
        return fetch(`/verify_phone/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ PIN: PIN }),
        })
        .then(response => response.json())
        .then(data => {return data.status})
        .catch(error => {
            console.error('Request failed', error);
        });
    }

    function getSmsCode() {
        let code = '';
    
        digits.forEach(input => {
            code += input.value.trim();
        });
    
        return code;
    }
  
    function showToast(title, description, isError = false) {
      // Set toast content
      toastTitle.textContent = title
      toastDescription.textContent = description
  
      // Set error class if needed
      if (isError) {
        toast.classList.add("error")
      } else {
        toast.classList.remove("error")
      }
  
      // Show toast
      toast.classList.remove("hidden")
  
      // Hide toast after 3 seconds
      setTimeout(() => {
        toast.classList.add("hidden")
      }, 3000)
    }
})