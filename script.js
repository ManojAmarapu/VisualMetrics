let currentChart = null;

function generateChart() {

const title = document.getElementById('title').value || "Untitled Chart";
const type = document.getElementById('type').value;
const labels = document.getElementById('labels').value.split(',').map(l => l.trim());
const data = document.getElementById('data').value.split(',').map(n => Number(n.trim()));
const color = document.getElementById('colorPicker').value;

if (labels.length !== data.length || data.some(isNaN)) {
alert("Labels & data must match and contain valid numbers.");
return;
}

const ctx = document.getElementById('chartCanvas').getContext('2d');

if (currentChart) currentChart.destroy();

currentChart = new Chart(ctx, {
type: type,
data: {
labels: labels,
datasets: [{
label: title,
data: data,
backgroundColor: color,
borderColor: color,
borderWidth: 2
}]
},
options: {
responsive: true,
maintainAspectRatio: false,
animation: {
duration: 800
},
plugins: {
legend: {
labels: { color: "#ffffff" }
},
title: {
display: true,
text: title,
color: "#ffffff",
font: { size: 18 }
}
},
scales: ['bar','line'].includes(type) ? {
x: {
ticks: { color: "#ffffff" },
grid: { color: "rgba(255,255,255,0.1)" }
},
y: {
ticks: { color: "#ffffff" },
grid: { color: "rgba(255,255,255,0.1)" }
}
} : {}
}
});
}

function downloadChart() {
const canvas = document.getElementById('chartCanvas');
const tempCanvas = document.createElement('canvas');
const ctx = tempCanvas.getContext('2d');

tempCanvas.width = canvas.width;
tempCanvas.height = canvas.height;

ctx.fillStyle = "#ffffff";
ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
ctx.drawImage(canvas, 0, 0);

const link = document.createElement('a');
link.download = "chart.png";
link.href = tempCanvas.toDataURL("image/png");
link.click();
}