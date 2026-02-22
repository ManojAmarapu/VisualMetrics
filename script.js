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

/* ---------- DOWNLOAD ---------- */

document.getElementById("downloadBtn").addEventListener("click", function () {

    if (!chartInstance) return;

    // Store original primitive values only
    const originalLegendColor = chartInstance.options.plugins.legend.labels.color;
    const originalDataLabelsDisplay = chartInstance.options.plugins.datalabels.display;
    const originalDataLabelsColor = chartInstance.options.plugins.datalabels.color;

    let originalTickColors = {};

    if (chartInstance.options.scales) {
        Object.keys(chartInstance.options.scales).forEach(key => {
            const scale = chartInstance.options.scales[key];
            if (scale.ticks) {
                originalTickColors[key] = scale.ticks.color;
            }
        });
    }

    // --------- APPLY EXPORT STYLING ---------

    // Legend black
    chartInstance.options.plugins.legend.labels.color = "#000000";

    // Axis ticks black
    if (chartInstance.options.scales) {
        Object.values(chartInstance.options.scales).forEach(scale => {
            if (scale.ticks) scale.ticks.color = "#000000";
        });
    }

    // Enable datalabels safely (do NOT replace object)
    chartInstance.options.plugins.datalabels.display = true;
    chartInstance.options.plugins.datalabels.color = "#000000";
    chartInstance.options.plugins.datalabels.font = {
        weight: "bold",
        size: 14
    };
    chartInstance.options.plugins.datalabels.formatter = value => value;
    chartInstance.options.plugins.datalabels.clamp = true;

    chartInstance.update();

    setTimeout(() => {

        // Create white background canvas
        const exportCanvas = document.createElement("canvas");
        exportCanvas.width = chartInstance.canvas.width;
        exportCanvas.height = chartInstance.canvas.height;

        const ctx = exportCanvas.getContext("2d");

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

        ctx.drawImage(chartInstance.canvas, 0, 0);

        const link = document.createElement("a");
        link.download = "chart.png";
        link.href = exportCanvas.toDataURL("image/png", 1);
        link.click();

        // --------- RESTORE ORIGINAL VALUES ---------

        chartInstance.options.plugins.legend.labels.color = originalLegendColor;

        chartInstance.options.plugins.datalabels.display = originalDataLabelsDisplay;
        chartInstance.options.plugins.datalabels.color = originalDataLabelsColor;

        if (chartInstance.options.scales) {
            Object.keys(chartInstance.options.scales).forEach(key => {
                const scale = chartInstance.options.scales[key];
                if (scale.ticks && originalTickColors[key] !== undefined) {
                    scale.ticks.color = originalTickColors[key];
                }
            });
        }

        chartInstance.update();

    }, 200);
});