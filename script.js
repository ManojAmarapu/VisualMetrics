const ctx = document.getElementById("myChart").getContext("2d");
let chartInstance;

let selectedColor = "rgb(22,126,75)";

/* ================= COLOR PICKER ================= */

function updateSelectedColor(r, g, b) {
selectedColor = `rgb(${r},${g},${b})`;
}

document.getElementById("rValue").addEventListener("input", syncRGB);
document.getElementById("gValue").addEventListener("input", syncRGB);
document.getElementById("bValue").addEventListener("input", syncRGB);

function syncRGB() {
const r = document.getElementById("rValue").value;
const g = document.getElementById("gValue").value;
const b = document.getElementById("bValue").value;
updateSelectedColor(r, g, b);
}

/* ================= SMART SHADE GENERATOR ================= */

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

/* ================= GENERATE CHART ================= */

function generateChart() {

const title = document.getElementById("chartTitle").value;
const type = document.getElementById("chartType").value;
const labels = document.getElementById("labels").value.split(",");
const data = document.getElementById("data").value.split(",").map(Number);

if (chartInstance) chartInstance.destroy();

let backgroundColors;
let borderColor;
let borderWidth;

/* ===== CHART TYPE LOGIC ===== */

if (type === "bar") {
backgroundColors = selectedColor;
borderColor = "#ffffff";
borderWidth = 2;
}

else if (type === "line") {
backgroundColors = selectedColor;
borderColor = selectedColor;
borderWidth = 3;
}

else if (["pie","doughnut","polarArea"].includes(type)) {
backgroundColors = generateShades(selectedColor, labels.length);
borderColor = "#ffffff";
borderWidth = 2;
}

else if (type === "radar") {
backgroundColors = selectedColor.replace("rgb", "rgba").replace(")", ",0.4)");
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
backgroundColor: backgroundColors,
borderColor: borderColor,
borderWidth: borderWidth,
fill: type === "line" ? false : true
}]
},
options: {
responsive: true,
plugins: {
legend: {
labels: { color: "white" }
}
},
scales: type === "radar" ? {} : {
x: { ticks: { color: "white" } },
y: { ticks: { color: "white" } }
}
}
});
}