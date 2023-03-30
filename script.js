const fileInput = document.getElementById("file-input");
const imageContainer = document.getElementById("images");
const numOfFiles = document.getElementById("num-of-files");
const FLOWER_CLASS = {
  0: "daisy",
  1: "lotus",
  2: "rose",
  3: "sunflower",
  4: "tulip",
};

let model;

// Load model
$("document").ready(async function () {
  model = await tf.loadLayersModel("./models/tfjs_model/model.json");
  console.log("Model loaded");
  console.log(model.summary());
});

function preview() {
  imageContainer.innerHTML = "";
  numOfFiles.textContent = `${fileInput.files.length} Files Selected`;

  for (const file of fileInput.files) {
    const reader = new FileReader();
    const figure = document.createElement("figure");
    const figCap = document.createElement("figcaption");
    const resultInfo = document.createElement("ul");
    figCap.innerText = file.name;
    figure.appendChild(figCap);
    reader.onload = async () => {
      const img = document.createElement("img");
      img.setAttribute("src", reader.result);
      img.setAttribute("width", "224");
      img.setAttribute("height", "224");
      img.style.objectFit = "contain";

      // Convert image to tensor
      const imgTensor = tf.browser
        .fromPixels(img)
        .resizeNearestNeighbor([224, 224])
        .toFloat()
        .sub(255 / 2)
        .div(255 / 2)
        .reverse(2)
        .expandDims();

      // Predict
      const predictions = await model.predict(imgTensor).dataSync();
      console.log(predictions);

      // Show results
      const top5 = Array.from(predictions)
        .map((p, i) => ({ probability: p, className: FLOWER_CLASS[i] }))
        .sort((a, b) => b.probability - a.probability);
      console.log(top5);

      top5.forEach((p) => {
        const resultItem = document.createElement("li");
        resultItem.textContent = `${p.className}: ${p.probability.toFixed(3)}`;
        resultInfo.appendChild(resultItem);
      });

      figure.insertBefore(img, figCap);
      figure.appendChild(resultInfo);
    };
    imageContainer.appendChild(figure);
    reader.readAsDataURL(file);
  }
}
