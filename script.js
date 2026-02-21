let currentChart = null;

function generateChart() {
  const title = document.getElementById('title').value || "Untitled Chart";
  const type = document.getElementById('type').value;
  const labels = document.getElementById('labels').value.split(',').map(l => l.trim());
  const data = document.getElementById('data').value.split(',').map(n => Number(n.trim()));

  if (labels.length !== data.length || data.some(isNaN)) {
    alert("Labels and data must match and be valid numbers.");
    return;
  }

  if (currentChart) currentChart.destroy();

  currentChart = new Chart(document.getElementById('chartCanvas'), {
    type: type,
    data: {
      labels: labels,
      datasets: [{
        label: title,
        data: data,
        backgroundColor: '#00c6ff',
        borderColor: '#2563EB',
        borderWidth: 2,
        barThickness: 40
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: title,
          color: '#ffffff',
          font: { size: 20, weight: 'bold' }
        },
        legend: {
          labels: { color: '#ffffff' }
        }
      },
      scales: ['bar','line'].includes(type) ? {
        x: { ticks: { color: '#ffffff' } },
        y: { ticks: { color: '#ffffff' } }
      } : {}
    }
  });
}

function downloadChart() {
  if (!currentChart) {
    alert("Generate chart first.");
    return;
  }

  const canvas = document.getElementById('chartCanvas');
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;

  const ctx = tempCanvas.getContext('2d');

  /* WHITE BACKGROUND FOR DOWNLOAD */
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

  ctx.drawImage(canvas, 0, 0);

  const link = document.createElement('a');
  link.download = "visualmetrics-chart.png";
  link.href = tempCanvas.toDataURL();
  link.click();
}