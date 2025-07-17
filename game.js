class PipelineGame {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.level = 1;
    this.score = 0;
    this.draggedStep = null;
    this.dragOffset = { x: 0, y: 0 };
    this.mousePos = { x: 0, y: 0 };
    
    this.setupEventListeners();
    this.initLevel();
  }
  
  setupEventListeners() {
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    this.canvas.addEventListener('mouseleave', (e) => this.handleMouseUp(e));
  }
  
  initLevel() {
    this.levels = {
      1: {
        title: "BASIC CI/CD PIPELINE",
        steps: [
          { name: "DEPLOY", color: "#ff0096", correct: 3 },
          { name: "BUILD", color: "#00ffcc", correct: 0 },
          { name: "TEST", color: "#ffff00", correct: 1 },
          { name: "PACKAGE", color: "#ff6600", correct: 2 }
        ]
      },
      2: {
        title: "ADVANCED DEVOPS PIPELINE",
        steps: [
          { name: "MONITOR", color: "#9900ff", correct: 5 },
          { name: "CODE", color: "#ff0096", correct: 0 },
          { name: "SECURITY", color: "#ff6600", correct: 3 },
          { name: "BUILD", color: "#00ffcc", correct: 1 },
          { name: "TEST", color: "#ffff00", correct: 2 },
          { name: "DEPLOY", color: "#00ff00", correct: 4 }
        ]
      },
      3: {
        title: "FULL DEVOPS LIFECYCLE",
        steps: [
          { name: "PLAN", color: "#00ccff", correct: 0 },
          { name: "DEPLOY", color: "#00ff00", correct: 5 },
          { name: "CODE", color: "#ff0096", correct: 1 },
          { name: "MONITOR", color: "#9900ff", correct: 7 },
          { name: "TEST", color: "#ffff00", correct: 3 },
          { name: "BUILD", color: "#00ffcc", correct: 2 },
          { name: "RELEASE", color: "#ff3300", correct: 6 },
          { name: "SECURITY", color: "#ff6600", correct: 4 }
        ]
      }
    };
    
    this.currentLevel = this.levels[this.level];
    this.shuffleSteps();
    this.draw();
    this.updateDisplay();
    this.updateButtonStates();
  }
  
  shuffleSteps() {
    const steps = [...this.currentLevel.steps];
    for (let i = steps.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [steps[i], steps[j]] = [steps[j], steps[i]];
    }
    this.currentLevel.steps = steps;
    this.calculatePositions();
  }
  
  calculatePositions() {
    const stepWidth = 120;
    const stepHeight = 70;
    const stepsPerRow = Math.min(6, this.currentLevel.steps.length);
    const verticalSpacing = 10; // Reduced spacing to fit within canvas
    const totalWidth = stepsPerRow * stepWidth + (stepsPerRow - 1) * 20;
    const startX = (this.canvas.width - totalWidth) / 2;
    const startY = 150; // Adjusted to fit all steps within canvas height
    
    const numRows = Math.ceil(this.currentLevel.steps.length / stepsPerRow);
    const totalHeight = numRows * stepHeight + (numRows - 1) * verticalSpacing;
    
    // Ensure steps fit within canvas height
    if (startY + totalHeight > this.canvas.height - 50) {
      console.warn("Steps may be out of canvas bounds, consider increasing canvas height or reducing step size");
    }
    
    this.currentLevel.steps.forEach((step, index) => {
      const row = Math.floor(index / stepsPerRow);
      const col = index % stepsPerRow;
      
      step.x = startX + (col * (stepWidth + 20));
      step.y = startY + (row * (stepHeight + verticalSpacing));
      step.width = stepWidth;
      step.height = stepHeight;
      step.currentIndex = index;
    });
  }
  
  draw() {
    // Clear canvas with gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#0a0a0a');
    gradient.addColorStop(1, '#1a1a2e');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw cyberpunk grid pattern
    this.drawGrid();
    
    // Draw level title with glow effect
    this.ctx.font = "bold 28px Orbitron";
    this.ctx.fillStyle = "#00ffcc";
    this.ctx.shadowColor = "#00ffcc";
    this.ctx.shadowBlur = 20;
    this.ctx.textAlign = "center";
    this.ctx.fillText(this.currentLevel.title, this.canvas.width / 2, 60);
    this.ctx.shadowBlur = 0;
    
    // Draw pipeline flow arrows
    this.drawPipelineFlow();
    
    // Draw steps
    this.currentLevel.steps.forEach((step, index) => {
      if (step === this.draggedStep) return;
      this.drawStep(step, step.x, step.y);
    });
    
    // Draw dragged step on top
    if (this.draggedStep) {
      this.drawStep(this.draggedStep, this.mousePos.x - this.dragOffset.x, this.mousePos.y - this.dragOffset.y, true);
    }
    
    // Draw correct order reference
    this.drawCorrectOrder();
  }
  
  drawGrid() {
    this.ctx.strokeStyle = "rgba(0, 255, 204, 0.1)";
    this.ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x < this.canvas.width; x += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y < this.canvas.height; y += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }
  
  drawPipelineFlow() {
    const y = 100; // Adjusted to align with new startY
    const startX = 50;
    const endX = this.canvas.width - 50;
    
    // Main pipeline line
    this.ctx.strokeStyle = "#00ffcc";
    this.ctx.lineWidth = 3;
    this.ctx.shadowColor = "#00ffcc";
    this.ctx.shadowBlur = 10;
    this.ctx.beginPath();
    this.ctx.moveTo(startX, y);
    this.ctx.lineTo(endX, y);
    this.ctx.stroke();
    
    // Arrow head
    this.ctx.fillStyle = "#00ffcc";
    this.ctx.beginPath();
    this.ctx.moveTo(endX, y);
    this.ctx.lineTo(endX - 15, y - 8);
    this.ctx.lineTo(endX - 15, y + 8);
    this.ctx.closePath();
    this.ctx.fill();
    
    this.ctx.shadowBlur = 0;
    
    // Pipeline label
    this.ctx.font = "16px Orbitron";
    this.ctx.fillStyle = "#00ffcc";
    this.ctx.textAlign = "left";
    this.ctx.fillText("PIPELINE FLOW", startX, y - 15);
  }
  
  drawStep(step, x, y, isDragging = false) {
    // Draw step box with cyberpunk styling
    const gradient = this.ctx.createLinearGradient(x, y, x, y + step.height);
    gradient.addColorStop(0, step.color);
    gradient.addColorStop(1, this.darkenColor(step.color, 0.3));
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x, y, step.width, step.height);
    
    // Draw glowing border
    this.ctx.strokeStyle = step.color;
    this.ctx.lineWidth = 3;
    this.ctx.shadowColor = step.color;
    this.ctx.shadowBlur = isDragging ? 20 : 10;
    this.ctx.strokeRect(x, y, step.width, step.height);
    this.ctx.shadowBlur = 0;
    
    // Draw step name
    this.ctx.fillStyle = "#000";
    this.ctx.font = "bold 12px Orbitron";
    this.ctx.textAlign = "center";
    this.ctx.fillText(step.name, x + step.width / 2, y + step.height / 2 + 5);
    
    // Draw index number
    this.ctx.fillStyle = "#fff";
    this.ctx.font = "bold 14px Orbitron";
    this.ctx.textAlign = "left";
    this.ctx.fillText(step.currentIndex + 1, x + 8, y + 20);
    
    // Draw cyberpunk corner accents
    this.ctx.strokeStyle = "#fff";
    this.ctx.lineWidth = 2;
    const cornerSize = 10;
    
    // Top-left corner
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + cornerSize);
    this.ctx.lineTo(x, y);
    this.ctx.lineTo(x + cornerSize, y);
    this.ctx.stroke();
    
    // Top-right corner
    this.ctx.beginPath();
    this.ctx.moveTo(x + step.width - cornerSize, y);
    this.ctx.lineTo(x + step.width, y);
    this.ctx.lineTo(x + step.width, y + cornerSize);
    this.ctx.stroke();
    
    // Bottom-left corner
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + step.height - cornerSize);
    this.ctx.lineTo(x, y + step.height);
    this.ctx.lineTo(x + cornerSize, y + step.height);
    this.ctx.stroke();
    
    // Bottom-right corner
    this.ctx.beginPath();
    this.ctx.moveTo(x + step.width - cornerSize, y + step.height);
    this.ctx.lineTo(x + step.width, y + step.height);
    this.ctx.lineTo(x + step.width, y + step.height - cornerSize);
    this.ctx.stroke();
  }
  
  drawCorrectOrder() {
    this.ctx.font = "16px Orbitron";
    this.ctx.fillStyle = "#ffff00";
    this.ctx.textAlign = "left";
    this.ctx.fillText("CORRECT ORDER:", 50, 350); // Adjusted to fit above steps
    
    const correctOrder = [...this.currentLevel.steps].sort((a, b) => a.correct - b.correct);
    correctOrder.forEach((step, index) => {
      this.ctx.fillStyle = step.color;
      this.ctx.shadowColor = step.color;
      this.ctx.shadowBlur = 5;
      this.ctx.fillText(`${index + 1}. ${step.name}`, 50, 375 + (index * 25));
      this.ctx.shadowBlur = 0;
    });
  }
  
  darkenColor(color, factor) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    return `rgb(${Math.floor(r * factor)}, ${Math.floor(g * factor)}, ${Math.floor(b * factor)})`;
  }
  
  handleMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    for (let step of this.currentLevel.steps) {
      if (mouseX >= step.x && mouseX <= step.x + step.width &&
          mouseY >= step.y && mouseY <= step.y + step.height) {
        this.draggedStep = step;
        this.dragOffset = {
          x: mouseX - step.x,
          y: mouseY - step.y
        };
        this.mousePos = { x: mouseX, y: mouseY };
        break;
      }
    }
  }
  
  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mousePos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    if (this.draggedStep) {
      this.draw();
    }
  }
  
  handleMouseUp(e) {
    if (!this.draggedStep) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    let dropTarget = null;
    for (let step of this.currentLevel.steps) {
      if (step !== this.draggedStep &&
          mouseX >= step.x && mouseX <= step.x + step.width &&
          mouseY >= step.y && mouseY <= step.y + step.height) {
        dropTarget = step;
        break;
      }
    }
    
    if (dropTarget) {
      const draggedIndex = this.draggedStep.currentIndex;
      const targetIndex = dropTarget.currentIndex;
      
      this.draggedStep.currentIndex = targetIndex;
      dropTarget.currentIndex = draggedIndex;
      
      const steps = this.currentLevel.steps;
      [steps[draggedIndex], steps[targetIndex]] = [steps[targetIndex], steps[draggedIndex]];
      
      this.calculatePositions();
      this.checkWin();
    }
    
    this.draggedStep = null;
    this.draw();
  }
  
  checkWin() {
    const isCorrect = this.currentLevel.steps.every((step, index) => {
      return step.correct === index;
    });
    
    if (isCorrect) {
      this.score += this.level * 100;
      this.updateStatus("🎉 PIPELINE FIXED! PROTOCOL COMPLETE!", "success");
      setTimeout(() => {
        if (this.level < 3) {
          this.level++;
          this.initLevel();
          this.updateStatus("LEVEL UP! NEXT PROTOCOL ACTIVATED", "");
        } else {
          this.updateStatus("🏆 ALL PROTOCOLS COMPLETE! CYBERPUNK DEVOPS MASTER!", "success");
        }
      }, 2000);
    } else {
      this.updateStatus("PIPELINE MALFUNCTION DETECTED. RETRY PROTOCOL!", "error");
    }
  }
  
  updateDisplay() {
    document.getElementById('levelDisplay').textContent = this.level;
    document.getElementById('scoreDisplay').textContent = this.score;
  }
  
  updateStatus(message, className) {
    const statusEl = document.getElementById('statusMessage');
    statusEl.textContent = message;
    statusEl.className = `status-message ${className}`;
  }
  
  updateButtonStates() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    prevBtn.disabled = this.level <= 1;
    nextBtn.disabled = this.level >= 3;
  }
  
  previousLevel() {
    if (this.level > 1) {
      this.level--;
      this.initLevel();
      this.updateStatus("PREVIOUS PROTOCOL LOADED", "");
    } else {
      this.updateStatus("FIRST PROTOCOL ACTIVE - CANNOT GO BACK", "error");
    }
  }
  
  resetLevel() {
    this.initLevel();
    this.updateStatus("PROTOCOL RESET - REINITIATING PIPELINE", "");
  }
  
  nextLevel() {
    if (this.level < 3) {
      this.level++;
      this.initLevel();
      this.updateStatus("NEXT PROTOCOL ACTIVATED", "");
    } else {
      this.updateStatus("FINAL PROTOCOL ACTIVE - MAXIMUM LEVEL REACHED", "error");
    }
  }
}

// Initialize game when page loads
let game;
document.addEventListener('DOMContentLoaded', function() {
  game = new PipelineGame();
});

// Add button event listeners
document.getElementById('prevBtn').addEventListener('click', () => game.previousLevel());
document.getElementById('resetBtn').addEventListener('click', () => game.resetLevel());
document.getElementById('nextBtn').addEventListener('click', () => game.nextLevel());
