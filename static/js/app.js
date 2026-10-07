const uploadForm = document.getElementById("uploadForm");
const leafImageInput = document.getElementById("leafImage");
const previewContainer = document.getElementById("previewContainer");
const previewImage = document.getElementById("previewImage");
const resultPanel = document.getElementById("resultPanel");
const diseaseLabel = document.getElementById("diseaseLabel");
const confidenceLabel = document.getElementById("confidenceLabel");
const treatmentAdvice = document.getElementById("treatmentAdvice");
const fallbackMessage = document.getElementById("fallbackMessage");

leafImageInput.addEventListener("change", () => {
    const file = leafImageInput.files[0];
    if (!file) {
        previewContainer.classList.add("hidden");
        return;
    }
    const reader = new FileReader();
    reader.onload = () => {
        previewImage.src = reader.result;
        previewContainer.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
});

uploadForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    resultPanel.classList.add("hidden");
    fallbackMessage.textContent = "";

    const formData = new FormData();
    const file = leafImageInput.files[0];
    if (!file) {
        alert("Please select a leaf image first.");
        return;
    }

    formData.append("leafImage", file);

    const response = await fetch("/predict", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        alert("Failed to analyze the image. Please try again.");
        return;
    }

    const data = await response.json();
    diseaseLabel.textContent = data.disease || "Unknown";
    confidenceLabel.textContent = data.confidence ? `${Math.round(data.confidence * 100)}%` : "N/A";
    treatmentAdvice.textContent = data.treatment || "No treatment advice available.";
    fallbackMessage.textContent = data.message || "";
    resultPanel.classList.remove("hidden");
});
