let currentChart = null;

function generateChart() {
  const title = document.getElementById('title').value.trim() || 'Untitled Chart';
  const type = document.getElementById('type').value;
  const labels = document.getElementById('labels').value.split(',').map(l => l.trim());
  const data = document.getElementById('data').value.split(',').map(n => Number(n.trim()));

  if (labels.length !== data.length || data.some(isNaN)) {
    alert('Labels and data must match and contain only numbers.');
    return;
  }

  const canvas = document.getElementById('chartCanvas');
  const ctx = canvas.getContext('2d');

  if (currentChart) currentChart.destroy();

  currentChart = new Chart(ctx, {
    type: type,
    data: {
      labels: labels,
      datasets: [{
        label: title,
        data: data,
        backgroundColor: '#FF7A45',
        borderColor: '#FF5A1F',
        borderWidth: 2,
        hoverBackgroundColor: '#FFA07A'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 900,
        easing: 'easeOutQuart'
      },
      plugins: {
        title: {
          display: true,
          text: title,
          color: '#FFFFFF',
          font: { size: 20, weight: '600' }
        },
        legend: {
          labels: { color: '#F0F0F0' }
        }
      },
      scales: ['bar', 'line'].includes(type) ? {
        x: {
          ticks: { color: '#EAEAEA' },
          grid: { color: 'rgba(255,255,255,0.12)' }
        },
        y: {
          ticks: { color: '#EAEAEA' },
          grid: { color: 'rgba(255,255,255,0.12)' }
        }
      } : {}
    }
  });
}

function downloadChart() {
  const canvas = document.getElementById('chartCanvas');
  const ctx = canvas.getContext('2d');

  ctx.save();
  ctx.globalCompositeOperation = 'destination-over';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();

  const link = document.createElement('a');
  link.download = 'chart.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}