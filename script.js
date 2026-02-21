const ctx = document.getElementById("myChart").getContext("2d");
let chartInstance;
let selectedColor = "rgb(22,126,75)";

const spectrum = document.getElementById("colorSpectrum");
const rInput = document.getElementById("rValue");
const gInput = document.getElementById("gValue");
const bInput = document.getElementById("bValue");
const shadePopup = document.getElementById("shadePopup");

/* ---------- COLOR PICKER ---------- */

function updateColor(r, g, b) {
selectedColor = `rgb(${r},${g},${b})`;
rInput.value = r;
gInput.value = g;
bInput.value = b;
}

spectrum.addEventListener("click", function(e) {
const rect = spectrum.getBoundingClientRect();
const x = e.clientX - rect.left;
const percent = x / rect.width;
const hue = Math.floor(percent * 360);

showShadePicker(hue);
});

/* Shade popup */
function showShadePicker(hue) {
shadePopup.innerHTML = "";
shadePopup.style.display = "block";

const canvas = document.createElement("canvas");
canvas.width = 180;
canvas.height = 120;
shadePopup.appendChild(canvas);

const c = canvas.getContext("2d");

/* Gradient background */
const gradient = c.createLinearGradient(0, 0, 180, 0);
gradient.addColorStop(0, "white");
gradient.addColorStop(1, `hsl(${hue},100%,50%)`);
c.fillStyle = gradient;
c.fillRect(0, 0, 180, 120);

const blackGrad = c.createLinearGradient(0, 0, 0, 120);
blackGrad.addColorStop(0, "rgba(0,0,0,0)");
blackGrad.addColorStop(1, "rgba(0,0,0,1)");
c.fillStyle = blackGrad;
c.fillRect(0, 0, 180, 120);

canvas.addEventListener("click", function(e){
const rect = canvas.getBoundingClientRect();
const x = e.clientX - rect.left;
const y = e.clientY - rect.top;
const pixel = c.getImageData(x, y, 1, 1).data;
updateColor(pixel[0], pixel[1], pixel[2]);
shadePopup.style.display = "none";
});
}

/* Close popup outside click */
document.addEventListener("click", function(e){
if (!shadePopup.contains(e.target) && e.target !== spectrum) {
shadePopup.style.display = "none";
}
});

[rInput, gInput, bInput].forEach(input => {
input.addEventListener("input", () => {

let r = Math.min(255, Math.max(0, parseInt(rInput.value) || 0));
let g = Math.min(255, Math.max(0, parseInt(gInput.value) || 0));
let b = Math.min(255, Math.max(0, parseInt(bInput.value) || 0));

updateColor(r, g, b);

});
});

/* ---------- SHADES FOR MULTI COLOR CHARTS ---------- */

function generateShades(baseColor, count) {
const rgb = baseColor.match(/\d+/g).map(Number);
const shades = [];

for (let i = 0; i < count; i++) {
let factor = 0.6 + (i / count);
let r = Math.min(255, Math.floor(rgb[0] * factor));
let g = Math.min(255, Math.floor(rgb[1] * factor));
let b = Math.min(255, Math.floor(rgb[2] * factor));
shades.push(`rgb(${r},${g},${b})`);
}
return shades;
}

/* ---------- GENERATE CHART ---------- */

document.getElementById("generateBtn").addEventListener("click", function() {

const title = document.getElementById("chartTitle").value;
const type = document.getElementById("chartType").value;
const labels = document.getElementById("labels").value.split(",");
const data = document.getElementById("data").value.split(",").map(Number);

if (chartInstance) chartInstance.destroy();

let bg;
let borderColor;
let borderWidth;

if (type === "bar") {
bg = selectedColor;
borderColor = "#ffffff";
borderWidth = 2;
}
else if (type === "line") {
bg = selectedColor;
borderColor = selectedColor;
borderWidth = 3;
}
else if (["pie","doughnut","polarArea"].includes(type)) {
bg = generateShades(selectedColor, labels.length);
borderColor = "#ffffff";
borderWidth = 2;
}
else if (type === "radar") {
bg = selectedColor.replace("rgb","rgba").replace(")",",0.4)");
borderColor = selectedColor;
borderWidth = 2;
}

chartInstance = new Chart(ctx, {
type: type,
data: {
labels: labels,
datasets: [{
label: title,
data: data,
backgroundColor: bg,
borderColor: borderColor,
borderWidth: borderWidth,
fill: type === "line" ? false : true
}]
},
options: {
responsive: true,
maintainAspectRatio: false,
plugins: {
legend: { labels: { color: "white" } }
}
}
});
});

/* ---------- DOWNLOAD ---------- */

document.getElementById("downloadBtn").addEventListener("click", function () {

if (!chartInstance) return;

const originalCanvas = chartInstance.canvas;
const width = originalCanvas.width;
const height = originalCanvas.height;

/* ========= STORE ORIGINAL COLORS ========= */

const originalLegendColor = chartInstance.options.plugins.legend.labels.color;

let originalXTickColor, originalYTickColor, originalRTickColor;

if (chartInstance.options.scales?.x?.ticks)
originalXTickColor = chartInstance.options.scales.x.ticks.color;

if (chartInstance.options.scales?.y?.ticks)
originalYTickColor = chartInstance.options.scales.y.ticks.color;

if (chartInstance.options.scales?.r?.ticks)
originalRTickColor = chartInstance.options.scales.r.ticks.color;

/* Switch to black for export */
chartInstance.options.plugins.legend.labels.color = "#000000";

if (chartInstance.options.scales?.x?.ticks)
chartInstance.options.scales.x.ticks.color = "#000000";

if (chartInstance.options.scales?.y?.ticks)
chartInstance.options.scales.y.ticks.color = "#000000";

if (chartInstance.options.scales?.r?.ticks)
chartInstance.options.scales.r.ticks.color = "#000000";

chartInstance.update("none");

/* ========= CREATE WHITE CANVAS ========= */

const tempCanvas = document.createElement("canvas");
tempCanvas.width = width;
tempCanvas.height = height;
const tempCtx = tempCanvas.getContext("2d");

tempCtx.fillStyle = "#ffffff";
tempCtx.fillRect(0, 0, width, height);
tempCtx.drawImage(originalCanvas, 0, 0);

/* ========= DRAW VALUES USING TRUE CENTER ========= */

const type = chartInstance.config.type;
const dataset = chartInstance.data.datasets[0];
const meta = chartInstance.getDatasetMeta(0);

tempCtx.fillStyle = "#000000";
tempCtx.font = "bold 15px Poppins";
tempCtx.textAlign = "center";
tempCtx.textBaseline = "middle";

/* Pie, Doughnut, Polar Area */
if (["pie","doughnut","polarArea"].includes(type)) {

meta.data.forEach((element, index) => {

const value = dataset.data[index];
const center = element.getCenterPoint();

tempCtx.fillText(value, center.x, center.y);

});

}

/* Radar */
if (type === "radar") {

meta.data.forEach((point, index) => {

const value = dataset.data[index];

/* Slight outward offset */
const angle = Math.atan2(
point.y - meta.data[0].y,
point.x - meta.data[0].x
);

const offsetX = point.x + Math.cos(angle) * 12;
const offsetY = point.y + Math.sin(angle) * 12;

tempCtx.fillText(value, offsetX, offsetY);

});

}

/* ========= DOWNLOAD ========= */

const link = document.createElement("a");
link.download = "chart.png";
link.href = tempCanvas.toDataURL("image/png");
link.click();

/* ========= RESTORE ORIGINAL ========= */

chartInstance.options.plugins.legend.labels.color = originalLegendColor;

if (chartInstance.options.scales?.x?.ticks)
chartInstance.options.scales.x.ticks.color = originalXTickColor;

if (chartInstance.options.scales?.y?.ticks)
chartInstance.options.scales.y.ticks.color = originalYTickColor;

if (chartInstance.options.scales?.r?.ticks)
chartInstance.options.scales.r.ticks.color = originalRTickColor;

chartInstance.update("none");

});