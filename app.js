const languageSelect = document.getElementById("language");
const pasteButton = document.getElementById("paste-button");
const themeToggle = document.getElementById("theme-toggle"); // Ahora es el ícono
const imagePreview = document.getElementById("image-preview");
const outputDiv = document.getElementById("output");

// Función para cambiar el tema
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    if (currentTheme === "dark") {
        document.documentElement.setAttribute("data-theme", "light");
        themeToggle.classList.remove("fa-sun"); // Quita el ícono de sol
        themeToggle.classList.add("fa-moon"); // Agrega el ícono de luna
    } else {
        document.documentElement.setAttribute("data-theme", "dark");
        themeToggle.classList.remove("fa-moon"); // Quita el ícono de luna
        themeToggle.classList.add("fa-sun"); // Agrega el ícono de sol
    }
}

// Detectar el tema del sistema
const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
document.documentElement.setAttribute("data-theme", systemTheme);

// Cambiar el ícono según el tema inicial
if (systemTheme === "dark") {
    themeToggle.classList.remove("fa-moon");
    themeToggle.classList.add("fa-sun"); // Modo oscuro: mostrar sol
} else {
    themeToggle.classList.remove("fa-sun");
    themeToggle.classList.add("fa-moon"); // Modo claro: mostrar luna
}

// Escuchar el clic en el ícono de cambio de tema
themeToggle.addEventListener("click", toggleTheme);

// Función para procesar la imagen con Tesseract.js
async function processImage(imageFile, language) {
    outputDiv.textContent = "Procesando imagen...";

    try {
        // Cargar Tesseract.js
        const { createWorker } = Tesseract;
        const worker = await createWorker();

        // Cargar el idioma seleccionado
        await worker.loadLanguage(language);
        await worker.initialize(language);

        // Realizar OCR en la imagen
        const { data: { text } } = await worker.recognize(imageFile);

        // Mostrar el resultado
        outputDiv.textContent = text;

        // Finalizar el worker
        await worker.terminate();
    } catch (error) {
        outputDiv.textContent = `Error: ${error.message}`;
    }
}

// Función para manejar la acción de pegar la imagen
pasteButton.addEventListener("click", async () => {
    try {
        // Pegar la imagen desde el portapapeles
        const clipboardItems = await navigator.clipboard.read();
        for (const item of clipboardItems) {
            for (const type of item.types) {
                if (type.startsWith("image/")) {
                    const blob = await item.getType(type);
                    const imageUrl = URL.createObjectURL(blob);

                    // Mostrar la imagen en el contenedor de vista previa
                    imagePreview.innerHTML = `<img src="${imageUrl}" alt="Imagen pegada">`;

                    // Procesar la imagen con Tesseract.js
                    const selectedLanguage = languageSelect.value;
                    processImage(blob, selectedLanguage);
                    return;
                }
            }
        }
        alert("No se encontró ninguna imagen en el portapapeles.");
    } catch (error) {
        alert("Error al acceder al portapapeles. Asegúrate de que el navegador soporte esta función.");
        console.error(error);
    }
});