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

document.getElementById("downloadBtn").addEventListener("click", function () {

    if (!chartInstance) {
        alert("Please generate a chart first.");
        return;
    }

    const original = chartInstance;
    const width = original.canvas.width;
    const height = original.canvas.height;

    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = width;
    exportCanvas.height = height;

    const exportCtx = exportCanvas.getContext("2d");

    const type = original.config.type;
    const labels = original.data.labels;
    const dataset = original.data.datasets[0];

    const exportConfig = {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: dataset.label,
                data: dataset.data,
                backgroundColor: dataset.backgroundColor,
                borderColor: dataset.borderColor,
                borderWidth: dataset.borderWidth,
                fill: dataset.fill
            }]
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            animation: false,
            devicePixelRatio: 2,
            layout: { padding: 20 },

            plugins: {
                backgroundColor: {
                    id: 'backgroundColor',
                    beforeDraw: (chart) => {
                        const {ctx, width, height} = chart;
                        ctx.save();
                        ctx.globalCompositeOperation = 'destination-over';
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, width, height);
                        ctx.restore();
                    }
                },

                legend: {
                    labels: {
                        color: "#000000"
                    }
                },
                tooltip: { enabled: false },
                datalabels: {
                    display: true,
                    color: "#000000",
                    font: {
                        weight: "bold",
                        size: 14
                    },
                    formatter: function(value) {
                        return value;
                    },
                    clip: false,
                    clamp: true,
                    anchor: function(ctx) {
                        if (type === "bar") return "end";
                        if (type === "line") return "end";
                        return "center";
                    },
                    align: function(ctx) {
                        if (type === "bar") return "end";
                        if (type === "line") return "top";
                        return "center";
                    }
                }
            },

            scales: (type === "bar" || type === "line") ? {
                x: {
                    ticks: { color: "#000000" },
                    grid: { color: "rgba(0,0,0,0.1)" }
                },
                y: {
                    ticks: { color: "#000000" },
                    grid: { color: "rgba(0,0,0,0.1)" }
                }
            } : {}
        }
    };

    const exportChart = new Chart(exportCtx, exportConfig);
    exportChart.update();

    const link = document.createElement("a");
    link.href = exportCanvas.toDataURL("image/png");
    link.download = "chart.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    exportChart.destroy();
});