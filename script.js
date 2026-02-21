Chart.register(ChartDataLabels);
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
    plugins: {
        legend: {
            labels: { color: "white" }
        },
        tooltip: {
            enabled: true
        },
        datalabels: {
            display: false   // IMPORTANT: disable on web view
        }
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

    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = width;
    exportCanvas.height = height;
    const ctx = exportCanvas.getContext("2d");

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Clone config safely
    const exportConfig = structuredClone(chartInstance.config);

    // 🔥 IMPORTANT FIXES FOR RADIAL CHART SHIFT
    exportConfig.options.responsive = false;
    exportConfig.options.maintainAspectRatio = false;

    // Fix legend color
    exportConfig.options.plugins.legend.labels.color = "#000000";

    // Fix axis ticks
    if (exportConfig.options.scales) {
        Object.values(exportConfig.options.scales).forEach(scale => {
            if (scale.ticks) scale.ticks.color = "#000000";
        });
    }

    // Enable datalabels only for export
    exportConfig.options.plugins.datalabels = {
        display: true,
        color: "#000000",
        font: {
            weight: "bold",
            size: 14
        },
        formatter: function(value) {
            return value;
        },
        anchor: function(context) {
            const type = context.chart.config.type;
            if (type === "bar") return "end";
            if (type === "line") return "end";
            return "center";
        },
        align: function(context) {
            const type = context.chart.config.type;
            if (type === "bar") return "end";
            if (type === "line") return "top";
            return "center";
        },
        clamp: true
    };

    const exportChart = new Chart(ctx, exportConfig);

    setTimeout(() => {
        const link = document.createElement("a");
        link.download = "chart.png";
        link.href = exportCanvas.toDataURL("image/png");
        link.click();

        exportChart.destroy();
    }, 300);

});