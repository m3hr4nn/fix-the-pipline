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
        title: "Basic CI/CD Pipeline",
        steps: [
          { name: "Deploy", color: "#ff6b6b", correct: 3 },
          { name: "Build", color: "#4ecdc4", correct: 0 },
          { name: "Test", color: "#45b7d1", correct: 1 },
          { name: "Package", color: "#f9ca24", correct: 2 }
        ]
      },
      2: {
        title: "Advanced DevOps Pipeline",
        steps: [
          { name: "Monitor", color: "#6c5ce7", correct: 5 },
          { name: "Code", color: "#fd79a8", correct: 0 },
          { name: "Security Scan", color: "#fdcb6e", correct: 3 },
          { name: "Build", color: "#4ecdc4", correct: 1 },
          { name: "Test", color: "#45b7d1", correct: 2 },
          { name: "Deploy", color: "#ff6b6b", correct: 4 }
        ]
      },
      3: {
        title: "Full DevOps Lifecycle",
        steps: [
          { name: "Plan", color: "#00b894", correct: 0 },
          { name: "Deploy", color: "#ff6b6b", correct: 5 },
          { name: "Code", color: "#fd79a8", correct: 1 },
          { name: "Monitor", color: "#6c5ce7", correct: 7 },
          { name: "Test", color: "#45b7d1", correct: 3 },
          { name: "Build", color: "#4ecdc4", correct: 2 },
          { name: "Release", color: "#e17055", correct: 6 },
          { name: "Security", color: "#fdcb6e", correct: 4 }
        ]
      }
    };
    
    this.currentLevel = this.levels[this.level];
    this.shuffleSteps();
    this.draw();
    this.updateDisplay();
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
    const stepHeight = 60;
    const startX = 50;
    const startY = 200;
    const spacing = 130;
    
    this.currentLevel.steps.forEach((step, index) => {
      step.x = startX + (index * spacing);
      step.y = startY;
      step.width = stepWidth;
      step.height = stepHeight;
      step.currentIndex = index;
    });
  }
  
  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw title
    this.ctx.font = "24px Courier New";
    this.ctx.fillStyle = "#00ffcc";
    this.ctx.fillText(this.currentLevel.title, 50, 50);
    
    // Draw pipeline arrow
    this.ctx.strokeStyle = "#666";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(30, 230);
    this.ctx.lineTo(this.canvas.width - 30, 230);
    this.ctx.stroke();
    
    // Draw arrow head
    this.ctx.beginPath();
    this.ctx.moveTo(this.canvas.width - 40, 220);
    this.ctx.lineTo(this.canvas.width - 30, 230);
    this.ctx.lineTo(this.canvas.width - 40, 240);
    this.ctx.stroke();
    
    // Draw steps
    this.currentLevel.steps.forEach((step, index) => {
      if (step === this.draggedStep) return; // Don't draw dragged step here
      
      this.drawStep(step, step.x, step.y);
    });
    
    // Draw dragged step on top
    if (this.draggedStep) {
      this.drawStep(this.draggedStep, this.mousePos.x - this.dragOffset.x, this.mousePos.y - this.dragOffset.y);
    }
    
    // Draw correct order reference
    this.ctx.font = "14px Courier New";
    this.ctx.fillStyle = "#666";
    this.ctx.fillText("Correct order:", 50, 350);
    
    const correctOrder = [...this.currentLevel.steps].sort((a, b) => a.correct - b.correct);
    correctOrder.forEach((step, index) => {
      this.ctx.fillStyle = "#888";
      this.ctx.fillText(`${index + 1}. ${step.name}`, 50, 370 + (index * 20));
    });
  }
  
  drawStep(step, x, y) {
    // Draw step box
    this.ctx.fillStyle = step.color;
    this.ctx.fillRect(x, y, step.width, step.height);
    
    // Draw border
    this.ctx.strokeStyle = "#fff";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, step.width, step.height);
    
    // Draw step name
    this.ctx.fillStyle = "#000";
    this.ctx.font = "14px Courier New";
    this.ctx.textAlign = "center";
    this.ctx.fillText(step.name, x + step.width / 2, y + step.height / 2 + 5);
    this.ctx.textAlign = "left";
    
    // Draw index number
    this.ctx.fillStyle = "#fff";
    this.ctx.font = "12px Courier New";
    this.ctx.fillText(step.currentIndex + 1, x + 5, y + 15);
  }
  
  handleMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Find clicked step
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
    
    // Find drop target
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
      // Swap positions
      const draggedIndex = this.draggedStep.currentIndex;
      const targetIndex = dropTarget.currentIndex;
      
      this.draggedStep.currentIndex = targetIndex;
      dropTarget.currentIndex = draggedIndex;
      
      // Swap in array
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
      this.updateStatus("🎉 Pipeline fixed! Great job!", "success");
      setTimeout(() => {
        if (this.level < 3) {
          this.level++;
          this.initLevel();
          this.updateStatus("Level up! Fix the next pipeline", "");
        } else {
          this.updateStatus("🏆 All pipelines fixed! You're a DevOps master!", "success");
        }
      }, 2000);
    } else {
      this.updateStatus("Pipeline still broken. Keep trying!", "error");
    }
  }
  
  updateDisplay() {
    document.getElementById('levelDisplay').textContent = this.level;
    document.getElementById('scoreDisplay').textContent = this.score;
  }
  
  updateStatus(message, className) {
    const statusEl = document.getElementById('statusMessage');
    statusEl.textContent = message;
    statusEl.className = `status ${className}`;
  }
  
  previousLevel() {
    if (this.level > 1) {
      this.level--;
      this.initLevel();
      this.updateStatus("Moved to previous level", "");
    } else {
      this.updateStatus("You're already at the first level!", "");
    }
  }
  
  resetLevel() {
    this.initLevel();
    this.updateStatus("Level reset. Fix the pipeline!", "");
  }
  
  nextLevel() {
    if (this.level < 3) {
      this.level++;
      this.initLevel();
      this.updateStatus("Skipped to next level", "");
    } else {
      this.updateStatus("You're already at the final level!", "");
    }
  }
}

// Initialize game when page loads
let game;
document.addEventListener('DOMContentLoaded', function() {
  game = new PipelineGame();
});
