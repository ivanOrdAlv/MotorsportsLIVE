document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("createDriverForm");
    const formAlert = document.getElementById("formAlert");
    
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
    
    // Función para generar un ID único para el nuevo piloto
    async function generateDriverId() {
        try {
            const response = await fetch("http://localhost:3000/drivers");
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const drivers = await response.json();
            
            // Encontrar el ID más alto y sumar 1
            const maxId = drivers.reduce((max, driver) => 
                driver.driverId > max ? driver.driverId : max, 0);
                
            return maxId + 1;
        } catch (error) {
            console.error("Error al generar ID:", error);
            throw error;
        }
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
            // Generar un nuevo ID para el piloto
            const newDriverId = await generateDriverId();
            
            // Recopilar datos del formulario
            const formData = {
                driverId: newDriverId,
                driverRef: document.getElementById("driverRef").value,
                number: document.getElementById("number").value || "\\N",
                code: document.getElementById("code").value,
                forename: document.getElementById("forename").value,
                surname: document.getElementById("surname").value,
                dob: document.getElementById("dob").value,
                nationality: document.getElementById("nationality").value,
                url: document.getElementById("url").value || `http://en.wikipedia.org/wiki/${document.getElementById("forename").value}_${document.getElementById("surname").value}`
            };
            
            // Enviar datos a la API
            const response = await fetch("http://localhost:3000/drivers", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                throw new Error(`Error al crear piloto: ${response.status}`);
            }
            
            // Mostrar mensaje de éxito
            showAlert("¡Piloto creado con éxito!", "success");
            
            // Limpiar el formulario
            form.reset();
            
            // Redirigir a la lista de pilotos después de 2 segundos
            setTimeout(() => {
                window.location.href = "/HTML/pilotos/todosPilotos.html";
            }, 2000);
            
        } catch (error) {
            console.error("Error:", error);
            showAlert(`Error al crear el piloto: ${error.message}`, "danger");
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
    
    // Generar automáticamente la referencia a partir del apellido
    document.getElementById("surname").addEventListener("blur", function() {
        const driverRefInput = document.getElementById("driverRef");
        // Solo generar si está vacío
        if (!driverRefInput.value) {
            driverRefInput.value = this.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_-]/g, '');
        }
    });
});