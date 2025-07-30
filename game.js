class PipelineGame {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.level = 1;
    this.score = 0;
    this.draggedStep = null;
    this.dragOffset = { x: 0, y: 0 };
    this.mousePos = { x: 0, y: 0 };
    this.isTouching = false;
    
    this.setupCanvas();
    this.setupEventListeners();
    this.initLevel();
  }
  
  setupCanvas() {
    // Make canvas responsive
    const container = this.canvas.parentElement;
    const rect = container.getBoundingClientRect();
    const maxWidth = Math.min(900, rect.width - 20);
    const maxHeight = Math.min(500, window.innerHeight * 0.5); // Reduced height to make room for table
    
    this.canvas.width = maxWidth;
    this.canvas.height = maxHeight;
    this.canvas.style.width = maxWidth + 'px';
    this.canvas.style.height = maxHeight + 'px';
  }
  
  setupEventListeners() {
    // Mouse events
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    this.canvas.addEventListener('mouseleave', (e) => this.handleMouseUp(e));
    
    // Touch events for mobile
    this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
    this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
    this.canvas.addEventListener('touchcancel', (e) => this.handleTouchEnd(e), { passive: false });
    
    // Resize handling
    window.addEventListener('resize', () => {
      this.setupCanvas();
      this.calculatePositions();
      this.draw();
    });
    
    // Button event listeners
    document.getElementById('prevBtn').addEventListener('click', () => this.previousLevel());
    document.getElementById('resetBtn').addEventListener('click', () => this.resetLevel());
    document.getElementById('nextBtn').addEventListener('click', () => this.nextLevel());
  }
  
  getEventPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    
    if (e.touches) {
      // Touch event
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      };
    } else {
      // Mouse event
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }
  }
  
  handleTouchStart(e) {
    e.preventDefault();
    this.isTouching = true;
    const pos = this.getEventPos(e);
    this.handlePointerDown(pos.x, pos.y);
  }
  
  handleTouchMove(e) {
    e.preventDefault();
    if (!this.isTouching) return;
    const pos = this.getEventPos(e);
    this.handlePointerMove(pos.x, pos.y);
  }
  
  handleTouchEnd(e) {
    e.preventDefault();
    this.isTouching = false;
    const pos = this.getEventPos(e);
    this.handlePointerUp(pos.x, pos.y);
  }
  
  handleMouseDown(e) {
    if (this.isTouching) return;
    const pos = this.getEventPos(e);
    this.handlePointerDown(pos.x, pos.y);
  }
  
  handleMouseMove(e) {
    if (this.isTouching) return;
    const pos = this.getEventPos(e);
    this.handlePointerMove(pos.x, pos.y);
  }
  
  handleMouseUp(e) {
    if (this.isTouching) return;
    const pos = this.getEventPos(e);
    this.handlePointerUp(pos.x, pos.y);
  }
  
  handlePointerDown(x, y) {
    for (let step of this.currentLevel.steps) {
      if (x >= step.x && x <= step.x + step.width &&
          y >= step.y && y <= step.y + step.height) {
        this.draggedStep = step;
        this.dragOffset = {
          x: x - step.x,
          y: y - step.y
        };
        this.mousePos = { x, y };
        break;
      }
    }
    this.draw();
  }
  
  handlePointerMove(x, y) {
    this.mousePos = { x, y };
    if (this.draggedStep) {
      this.draw();
    }
  }
  
  handlePointerUp(x, y) {
    if (!this.draggedStep) return;
    
    let dropTarget = null;
    for (let step of this.currentLevel.steps) {
      if (step !== this.draggedStep &&
          x >= step.x && x <= step.x + step.width &&
          y >= step.y && y <= step.y + step.height) {
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
    this.updateCorrectOrderTable();
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
    const stepWidth = Math.min(120, this.canvas.width / 6);
    const stepHeight = Math.min(70, stepWidth * 0.6);
    const maxStepsPerRow = Math.floor(this.canvas.width / (stepWidth + 20));
    const stepsPerRow = Math.min(maxStepsPerRow, this.currentLevel.steps.length);
    const totalWidth = stepsPerRow * stepWidth + (stepsPerRow - 1) * 20;
    const startX = (this.canvas.width - totalWidth) / 2;
    const startY = Math.max(120, this.canvas.height * 0.3);
    
    this.currentLevel.steps.forEach((step, index) => {
      const row = Math.floor(index / stepsPerRow);
      const col = index % stepsPerRow;
      
      step.x = startX + (col * (stepWidth + 20));
      step.y = startY + (row * (stepHeight + 15));
      step.width = stepWidth;
      step.height = stepHeight;
      step.currentIndex = index;
    });
  }
  
  updateCorrectOrderTable() {
    const tableBody = document.getElementById('correctOrderBody');
    const correctOrder = [...this.currentLevel.steps].sort((a, b) => a.correct - b.correct);
    
    // Clear existing content
    tableBody.innerHTML = '';
    
    // Create single row
    const row = document.createElement('tr');
    
    correctOrder.forEach((step, index) => {
      const cell = document.createElement('td');
      cell.className = 'step-cell';
      cell.setAttribute('data-step', step.name);
      
      cell.innerHTML = `
        <span class="step-number">${index + 1}</span>
        <span class="step-name">${step.name}</span>
      `;
      
      row.appendChild(cell);
    });
    
    tableBody.appendChild(row);
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
    const fontSize = Math.min(28, this.canvas.width / 20);
    this.ctx.font = `bold ${fontSize}px Orbitron`;
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
    const y = 90;
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
    const labelSize = Math.min(16, this.canvas.width / 30);
    this.ctx.font = `${labelSize}px Orbitron`;
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
    const nameSize = Math.min(12, step.width / 8);
    this.ctx.font = `bold ${nameSize}px Orbitron`;
    this.ctx.textAlign = "center";
    this.ctx.fillText(step.name, x + step.width / 2, y + step.height / 2 + 5);
    
    // Draw index number
    this.ctx.fillStyle = "#fff";
    const indexSize = Math.min(14, step.width / 7);
    this.ctx.font = `bold ${indexSize}px Orbitron`;
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
  
  darkenColor(color, factor) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    return `rgb(${Math.floor(r * factor)}, ${Math.floor(g * factor)}, ${Math.floor(b * factor)})`;
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
