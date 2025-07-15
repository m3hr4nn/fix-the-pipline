const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

ctx.font = "20px Courier New";
ctx.fillStyle = "#00ffcc";
ctx.fillText("🔧 Your pipeline is broken!", 200, 100);

// Add logic to click and reorder pipeline steps like build -> test -> deploy

