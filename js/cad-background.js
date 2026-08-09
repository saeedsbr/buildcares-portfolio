/**
 * Interactive CAD background system
 * Creates grid response, technical lines, and floating dimensions
 */
window.CADBackground = {
  init: function() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Canvas styling
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100vw';
    this.canvas.style.height = '100vh';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '0'; // Behind everything but above background
    
    document.body.insertBefore(this.canvas, document.body.firstChild);
    
    // State
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.mouse = { x: this.width / 2, y: this.height / 2, targetX: this.width / 2, targetY: this.height / 2 };
    this.points = [];
    this.shapes = [];
    
    this.resize();
    this.createPoints();
    this.createShapes();
    
    // Bind methods
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onResize = this.onResize.bind(this);
    this.render = this.render.bind(this);
    
    // Events
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('resize', this.onResize);
    
    // Start loop
    this.render();
  },
  
  createPoints: function() {
    this.points = [];
    const numPoints = 10;
    for (let i = 0; i < numPoints; i++) {
      this.points.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        value: (Math.random() * 500).toFixed(2),
        unit: Math.random() > 0.5 ? 'm' : 'cm'
      });
    }
  },
  
  createShapes: function() {
    this.shapes = [];
    const numShapes = 6;
    for (let i = 0; i < numShapes; i++) {
      this.shapes.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        w: 50 + Math.random() * 150,
        h: 50 + Math.random() * 150,
        opacity: 0,
        targetOpacity: 0
      });
    }
  },
  
  resize: function() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  },
  
  onResize: function() {
    this.resize();
    this.createPoints();
    this.createShapes();
  },
  
  onMouseMove: function(e) {
    this.mouse.targetX = e.clientX;
    this.mouse.targetY = e.clientY;
  },
  
  lerp: function(start, end, factor) {
    return start + (end - start) * factor;
  },
  
  render: function() {
    // Interpolate mouse position for smoothness
    this.mouse.x = this.lerp(this.mouse.x, this.mouse.targetX, 0.1);
    this.mouse.y = this.lerp(this.mouse.y, this.mouse.targetY, 0.1);
    
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    this.drawGrid();
    this.drawBlueprintShapes();
    this.drawTrackingLines();
    this.drawDimensionPoints();
    
    requestAnimationFrame(this.render);
  },
  
  drawGrid: function() {
    const gridSize = 50;
    this.ctx.lineWidth = 1;
    
    for (let x = 0; x <= this.width; x += gridSize) {
      this.drawGridLine(x, 0, x, this.height);
    }
    
    for (let y = 0; y <= this.height; y += gridSize) {
      this.drawGridLine(0, y, this.width, y);
    }
  },
  
  drawGridLine: function(x1, y1, x2, y2) {
    // Calculate distance from line to mouse
    let dist;
    if (x1 === x2) {
      dist = Math.abs(this.mouse.x - x1);
    } else {
      dist = Math.abs(this.mouse.y - y1);
    }
    
    let opacity = 0.03; // Base grid opacity
    
    // Increase opacity if near cursor (radius 200)
    if (dist < 200) {
      opacity = 0.03 + (1 - dist / 200) * 0.12;
    }
    
    this.ctx.strokeStyle = `rgba(56, 189, 248, ${opacity})`;
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  },
  
  drawTrackingLines: function() {
    this.ctx.lineWidth = 0.5;
    this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
    
    this.ctx.beginPath();
    // Horizontal line
    this.ctx.moveTo(0, this.mouse.y);
    this.ctx.lineTo(this.width, this.mouse.y);
    
    // Vertical line
    this.ctx.moveTo(this.mouse.x, 0);
    this.ctx.lineTo(this.mouse.x, this.height);
    
    this.ctx.stroke();
  },
  
  drawDimensionPoints: function() {
    this.ctx.font = "9px 'JetBrains Mono', monospace";
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "middle";
    
    for (let i = 0; i < this.points.length; i++) {
      const p = this.points[i];
      const dx = this.mouse.x - p.x;
      const dy = this.mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      let opacity = 0.15;
      if (dist < 150) {
        opacity = 0.15 + (1 - dist / 150) * 0.75;
        
        // Update value slightly when active to simulate live tracking
        if (Math.random() > 0.95) {
          p.value = (parseFloat(p.value) + (Math.random() * 0.1 - 0.05)).toFixed(2);
        }
      }
      
      // Draw point
      this.ctx.fillStyle = `rgba(56, 189, 248, ${opacity})`;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Draw crosshair
      this.ctx.strokeStyle = `rgba(56, 189, 248, ${opacity * 0.5})`;
      this.ctx.lineWidth = 0.5;
      this.ctx.beginPath();
      this.ctx.moveTo(p.x - 5, p.y);
      this.ctx.lineTo(p.x + 5, p.y);
      this.ctx.moveTo(p.x, p.y - 5);
      this.ctx.lineTo(p.x, p.y + 5);
      this.ctx.stroke();
      
      // Draw text
      this.ctx.fillStyle = `rgba(248, 250, 252, ${opacity})`;
      this.ctx.fillText(`+ ${p.value}${p.unit}`, p.x + 8, p.y);
    }
  },
  
  drawBlueprintShapes: function() {
    this.ctx.lineWidth = 0.5;
    
    for (let i = 0; i < this.shapes.length; i++) {
      const s = this.shapes[i];
      
      // Check if mouse is near shape center
      const centerX = s.x + s.w / 2;
      const centerY = s.y + s.h / 2;
      const dx = this.mouse.x - centerX;
      const dy = this.mouse.y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      s.targetOpacity = dist < 250 ? 0.15 * (1 - dist / 250) : 0;
      s.opacity = this.lerp(s.opacity, s.targetOpacity, 0.05);
      
      if (s.opacity > 0.01) {
        this.ctx.strokeStyle = `rgba(41, 121, 255, ${s.opacity})`;
        this.ctx.fillStyle = `rgba(41, 121, 255, ${s.opacity * 0.1})`;
        
        this.ctx.beginPath();
        this.ctx.rect(s.x, s.y, s.w, s.h);
        this.ctx.stroke();
        this.ctx.fill();
        
        // Draw diagonal line
        this.ctx.beginPath();
        this.ctx.moveTo(s.x, s.y);
        this.ctx.lineTo(s.x + s.w, s.y + s.h);
        this.ctx.stroke();
      }
    }
  }
};
