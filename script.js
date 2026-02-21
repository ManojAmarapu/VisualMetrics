let currentChart = null;
let selectedColor = "rgb(59,130,246)";

const spectrum = document.getElementById("spectrum");
const popup = document.getElementById("shadePopup");
const shadeCanvas = document.getElementById("shadeCanvas");
const ctxShade = shadeCanvas.getContext("2d");

const rInput = document.getElementById("r");
const gInput = document.getElementById("g");
const bInput = document.getElementById("b");

/* Draw shade square */
function drawShade(hue){
const gradientX = ctxShade.createLinearGradient(0,0,shadeCanvas.width,0);
gradientX.addColorStop(0,"white");
gradientX.addColorStop(1,`hsl(${hue},100%,50%)`);

ctxShade.fillStyle = gradientX;
ctxShade.fillRect(0,0,shadeCanvas.width,shadeCanvas.height);

const gradientY = ctxShade.createLinearGradient(0,0,0,shadeCanvas.height);
gradientY.addColorStop(0,"rgba(0,0,0,0)");
gradientY.addColorStop(1,"black");

ctxShade.fillStyle = gradientY;
ctxShade.fillRect(0,0,shadeCanvas.width,shadeCanvas.height);
}

/* Spectrum click */
spectrum.addEventListener("click",(e)=>{
const rect = spectrum.getBoundingClientRect();
const x = e.clientX - rect.left;
const percent = x / rect.width;
const hue = percent * 360;

drawShade(hue);
popup.style.display = "block";
});

/* Shade pick */
shadeCanvas.addEventListener("click",(e)=>{
const rect = shadeCanvas.getBoundingClientRect();
const x = e.clientX - rect.left;
const y = e.clientY - rect.top;

const pixel = ctxShade.getImageData(x,y,1,1).data;

rInput.value = pixel[0];
gInput.value = pixel[1];
bInput.value = pixel[2];

selectedColor = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;
popup.style.display = "none";
});

/* RGB manual input */
[rInput,gInput,bInput].forEach(input=>{
input.addEventListener("input",()=>{
selectedColor = `rgb(${rInput.value||0},${gInput.value||0},${bInput.value||0})`;
});
});

function generateChart(){
const title = document.getElementById('title').value || "Untitled";
const type = document.getElementById('type').value;
const labels = document.getElementById('labels').value.split(',').map(l=>l.trim());
const data = document.getElementById('data').value.split(',').map(n=>Number(n.trim()));

if(labels.length !== data.length || data.some(isNaN)){
alert("Labels & Data mismatch");
return;
}

const ctx = document.getElementById('chartCanvas').getContext('2d');
if(currentChart) currentChart.destroy();

currentChart = new Chart(ctx,{
type:type,
data:{
labels:labels,
datasets:[{
label:title,
data:data,
backgroundColor:selectedColor,
borderColor:selectedColor,
borderWidth:2
}]
},
options:{
responsive:true,
maintainAspectRatio:false,
plugins:{
legend:{labels:{color:"#fff"}},
title:{display:true,text:title,color:"#fff"}
},
scales:['bar','line'].includes(type)?{
x:{ticks:{color:"#fff"},grid:{color:"rgba(255,255,255,0.1)"}},
y:{ticks:{color:"#fff"},grid:{color:"rgba(255,255,255,0.1)"}}
}:{}
}
});
}

function downloadChart(){
const canvas=document.getElementById('chartCanvas');
const temp=document.createElement('canvas');
const ctx=temp.getContext('2d');
temp.width=canvas.width;
temp.height=canvas.height;
ctx.fillStyle="#ffffff";
ctx.fillRect(0,0,temp.width,temp.height);
ctx.drawImage(canvas,0,0);
const link=document.createElement('a');
link.download="chart.png";
link.href=temp.toDataURL();
link.click();
}