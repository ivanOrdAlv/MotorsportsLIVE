document.addEventListener("DOMContentLoaded", async function() {
    // Obtener el ID del piloto de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const driverId = urlParams.get('id');
    
    if (!driverId) {
        window.location.href = "/HTML/pilotos/todosPilotos.html";
        return;
    }
    
    // Elementos del DOM
    const form = document.getElementById("editDriverForm");
    const formAlert = document.getElementById("formAlert");
    const loadingContainer = document.getElementById("loading-container");
    const formContainer = document.getElementById("form-container");
    const backButton = document.getElementById("back-button");
    
    // Función para mostrar alertas
    function showAlert(message, type) {
        formAlert.textContent = message;
        formAlert.className = `alert mt-3 alert-${type}`;
        formAlert.classList.remove("d-none");
        
        // Hacer scroll hasta la alerta
        formAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Ocultar la alerta después de 5 segundos
        setTimeout(() => {
            formAlert.classList.add("d-none");
        }, 5000);
    }
    
    // Función para validar el formulario
    function validateForm() {
        // Validar que el código sea de 3 letras mayúsculas
        const code = document.getElementById("code").value;
        if (!/^[A-Z]{3}$/.test(code)) {
            showAlert("El código debe ser de 3 letras mayúsculas (ej: HAM, VER)", "danger");
            return false;
        }
        
        // Validar que la referencia no contenga espacios ni caracteres especiales
        const driverRef = document.getElementById("driverRef").value;
        if (!/^[a-z0-9_-]+$/.test(driverRef)) {
            showAlert("La referencia solo debe contener letras minúsculas, números, guiones o guiones bajos", "danger");
            return false;
        }
        
        return true;
    }
    
    // Configurar el botón de volver
    backButton.addEventListener("click", function(e) {
        e.preventDefault();
        window.location.href = `/HTML/pilotos/detallePiloto.html?id=${driverId}`;
    });
    
    try {
        // Cargar los datos del piloto
        const response = await fetch(`http://localhost:3000/drivers/${driverId}`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const driver = await response.json();
        
        // Llenar el formulario con los datos del piloto
        document.getElementById("driverId").value = driver.driverId;
        document.getElementById("forename").value = driver.forename;
        document.getElementById("surname").value = driver.surname;
        document.getElementById("dob").value = driver.dob.split('T')[0]; // Formatear fecha para input date
        document.getElementById("nationality").value = driver.nationality;
        document.getElementById("number").value = driver.number !== "\\N" ? driver.number : "";
        document.getElementById("code").value = driver.code;
        document.getElementById("driverRef").value = driver.driverRef;
        document.getElementById("url").value = driver.url;
        
        // Actualizar el título de la página
        document.title = `Editar ${driver.forename} ${driver.surname} - MotorsportLIVE`;
        
        // Mostrar el formulario y ocultar el spinner
        loadingContainer.style.display = "none";
        formContainer.style.display = "block";
        
    } catch (error) {
        console.error("Error al cargar los datos del piloto:", error);
        showAlert(`Error al cargar los datos del piloto: ${error.message}`, "danger");
        loadingContainer.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <i class="bi bi-exclamation-triangle-fill"></i> Error al cargar los datos: ${error.message}
                <p class="mt-2 small">Asegúrate de que el servidor API esté funcionando en http://localhost:3000</p>
                <button class="btn btn-outline-danger mt-2" onclick="window.location.href='/HTML/pilotos/todosPilotos.html'">
                    <i class="bi bi-arrow-left"></i> Volver a la lista de pilotos
                </button>
            </div>
        `;
    }
    
    // Manejar el envío del formulario
    form.addEventListener("submit", async function(event) {
        event.preventDefault();
        
        // Validar el formulario
        if (!validateForm()) {
            return;
        }
        
        // Mostrar indicador de carga
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
        submitButton.disabled = true;
        
        try {
            // Recopilar datos del formulario
            const formData = {
                driverId: parseInt(document.getElementById("driverId").value),
                driverRef: document.getElementById("driverRef").value,
                number: document.getElementById("number").value || "\\N",
                code: document.getElementById("code").value,
                forename: document.getElementById("forename").value,
                surname: document.getElementById("surname").value,
                dob: document.getElementById("dob").value,
                nationality: document.getElementById("nationality").value,
                url: document.getElementById("url").value
            };
            
            // Enviar datos a la API
            const response = await fetch(`http://localhost:3000/drivers/${driverId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                throw new Error(`Error al actualizar piloto: ${response.status}`);
            }
            
            // Mostrar mensaje de éxito
            showAlert("¡Piloto actualizado con éxito!", "success");
            
            // Redirigir a la página de detalle después de 2 segundos
            setTimeout(() => {
                window.location.href = `/HTML/pilotos/detallePiloto.html?id=${driverId}`;
            }, 2000);
            
        } catch (error) {
            console.error("Error:", error);
            showAlert(`Error al actualizar el piloto: ${error.message}`, "danger");
        } finally {
            // Restaurar el botón
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
        }
    });
    
    // Convertir automáticamente el código a mayúsculas
    document.getElementById("code").addEventListener("input", function() {
        this.value = this.value.toUpperCase();
    });
});