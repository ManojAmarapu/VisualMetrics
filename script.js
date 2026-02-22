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

document.getElementById("generateBtn").addEventListener("click", function () {

    const title = document.getElementById("chartTitle").value;
    const type = document.getElementById("chartType").value;
    const labelsInput = document.getElementById("labels").value;
    const dataInput = document.getElementById("data").value;

    if (!labelsInput || !dataInput) {
        alert("Please enter labels and data.");
        return;
    }

    const labels = labelsInput.split(",").map(l => l.trim());
    const data = dataInput.split(",").map(d => Number(d.trim()));

    if (labels.length !== data.length) {
        alert("Labels and Data count must match.");
        return;
    }

    if (chartInstance) {
        chartInstance.destroy();
    }

    const backgroundColors =
        type === "pie" ||
        type === "doughnut" ||
        type === "polarArea"
            ? generateShades(selectedColor, data.length)
            : selectedColor;

    chartInstance = new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: title,
                data: data,
                backgroundColor: backgroundColors,
                borderColor: selectedColor,
                borderWidth: 2,
                fill: type === "line" ? false : true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: "#ffffff"
                    }
                },
                tooltip: {
                    enabled: true
                },
                datalabels: {
                    display: false // VERY IMPORTANT (web view must hide values)
                }
            },
            scales: type === "bar" || type === "line"
                ? {
                    x: {
                        ticks: { color: "#ffffff" },
                        grid: { color: "rgba(255,255,255,0.1)" }
                    },
                    y: {
                        ticks: { color: "#ffffff" },
                        grid: { color: "rgba(255,255,255,0.1)" }
                    }
                }
                : {}
        }
    });
});

/* ---------- DOWNLOAD ---------- */

document.getElementById("downloadBtn").addEventListener("click", async function () {

    if (!chartInstance) return;

    const originalCanvas = chartInstance.canvas;

    // Lock exact pixel size
    const width = originalCanvas.width;
    const height = originalCanvas.height;

    // Create export canvas (NOT added to DOM → no flash)
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = width;
    exportCanvas.height = height;

    const exportCtx = exportCanvas.getContext("2d");

    // Solid white background
    exportCtx.fillStyle = "#ffffff";
    exportCtx.fillRect(0, 0, width, height);

    // Deep clone config
    const exportConfig = structuredClone(chartInstance.config);

    /* -----------------------------
       GLOBAL HARD LOCK SETTINGS
    ------------------------------*/

    exportConfig.options.responsive = false;
    exportConfig.options.maintainAspectRatio = false;
    exportConfig.options.animation = false;
    exportConfig.options.resizeDelay = 0;
    exportConfig.options.devicePixelRatio = 1;

    // VERY IMPORTANT: Remove automatic padding shifts
    exportConfig.options.layout = {
        padding: 20
    };

    /* -----------------------------
       FORCE BLACK TEXT
    ------------------------------*/

    exportConfig.options.plugins.legend.labels.color = "#000000";

    if (exportConfig.options.scales) {
        Object.values(exportConfig.options.scales).forEach(scale => {
            if (scale.ticks) scale.ticks.color = "#000000";
            if (scale.grid) scale.grid.color = "rgba(0,0,0,0.1)";
        });
    }

    /* -----------------------------
       ENABLE DATALABELS (EXPORT ONLY)
    ------------------------------*/

    exportConfig.options.plugins.datalabels = {
        display: true,
        color: "#000000",
        font: {
            weight: "bold",
            size: 14
        },
        formatter: (value) => value,
        clip: false,
        clamp: true,
        anchor: function(ctx) {
            const type = ctx.chart.config.type;

            if (type === "bar") return "end";
            if (type === "line") return "end";
            return "center"; // radial charts
        },
        align: function(ctx) {
            const type = ctx.chart.config.type;

            if (type === "bar") return "end";
            if (type === "line") return "top";
            return "center"; // radial charts
        }
    };

    /* -----------------------------
       CREATE EXPORT CHART
    ------------------------------*/

    const exportChart = new Chart(exportCtx, exportConfig);

    // Wait for proper rendering
    await new Promise(resolve => {
        exportChart.once('render', resolve);
        exportChart.update();
    });

    /* -----------------------------
       DOWNLOAD SAFE
    ------------------------------*/

    const link = document.createElement("a");
    link.href = exportCanvas.toDataURL("image/png");
    link.download = "chart.png";
    link.click();

    exportChart.destroy();
});