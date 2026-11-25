// Add your Teachable Machine model URL here later.
const MODEL_URL = "PASTE_YOUR_TEACHABLE_MACHINE_MODEL_URL_HERE";

let model = null;
let selectedImage = null;

const upload = document.getElementById("imageUpload");
const preview = document.getElementById("preview");
const predictBtn = document.getElementById("predictBtn");
const statusBox = document.getElementById("status");
const resultBox = document.getElementById("result");

if (upload) {
  upload.addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      statusBox.textContent = "Please choose an image file.";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      preview.src = reader.result;
      preview.style.display = "block";

      selectedImage = new Image();

      selectedImage.onload = () => {
        predictBtn.disabled = false;
        statusBox.textContent = "Image ready. Select Analyse Leaf.";
        resultBox.style.display = "none";
      };

      selectedImage.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
}

async function loadModel() {
  if (model) return model;

  if (MODEL_URL.includes("PASTE_YOUR")) {
    throw new Error(
      "Please add your Teachable Machine model URL in app.js first."
    );
  }

  const url = MODEL_URL.endsWith("/")
    ? MODEL_URL
    : MODEL_URL + "/";

  model = await tmImage.load(
    url + "model.json",
    url + "metadata.json"
  );

  return model;
}

if (predictBtn) {
  predictBtn.addEventListener("click", async () => {
    if (!selectedImage) return;

    predictBtn.disabled = true;
    statusBox.textContent = "Analysing image...";
    resultBox.style.display = "none";

    try {
      const ai = await loadModel();
      const predictions = await ai.predict(selectedImage);

      predictions.sort(
        (a, b) => b.probability - a.probability
      );

      const best = predictions[0];

      resultBox.innerHTML = `
        <h3>AI Prediction: ${best.className}</h3>
        <p>Confidence: ${(best.probability * 100).toFixed(1)}%</p>
        <p class="muted">
          This is an AI prediction, not a professional diagnosis.
        </p>
      `;

      resultBox.style.display = "block";
      statusBox.textContent = "Analysis complete.";

    } catch (error) {
      statusBox.textContent =
        error.message || "Something went wrong.";
    } finally {
      predictBtn.disabled = false;
    }
  });
}