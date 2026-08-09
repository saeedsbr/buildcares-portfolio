window.FloorPlan = {
  createEditorPlan: function(containerId) {
    const container = document.querySelector(containerId);
    if (!container) return;
    container.innerHTML = this._generateSVG(false);
  },

  createTransformPlan: function(containerId) {
    const container = document.querySelector(containerId);
    if (!container) return;
    container.innerHTML = this._generateSVG(true);
  },

  animateIn: function(containerId) {
    const container = document.querySelector(containerId);
    if (!container) return;
    const paths = container.querySelectorAll('path, line, polyline, rect');
    paths.forEach(path => {
      let length = 0;
      if (path.getTotalLength) { length = path.getTotalLength(); }
      else { length = 2000; }
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;
      if (window.gsap) {
        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 1.5 + Math.random(),
          ease: 'power2.inOut',
          delay: Math.random() * 0.5
        });
      }
    });
    if (window.gsap) {
      gsap.fromTo(container.querySelectorAll('text'),
        { opacity: 0 },
        { opacity: 1, duration: 1, stagger: 0.08, delay: 0.8 }
      );
    }
  },

  _generateSVG: function(simplified) {
    // ─────────────────────────────────────────────────────────────────
    // Authentic AutoCAD Architectural CAD Floor Plan
    // Scale: 1m = 80px
    // Executive UK Detached House (12m x 10m Main + 4m x 6m Double Garage)
    // ─────────────────────────────────────────────────────────────────

    const S = 80; // px per metre
    const OX = 60, OY = 40; // origin offset

    // Key grid coordinates (px)
    const x0 = OX,              // 60   (West Wall)
          x1 = OX + 320,        // 380  (Hall East Wall / Master West Wall)
          x2 = OX + 460,        // 520  (Lounge / Kitchen Split Wall)
          x3 = OX + 660,        // 720  (Master East Wall / Bed 2 West Wall)
          x4 = OX + 960,        // 1020 (Main House East Wall)
          x5 = OX + 1280;       // 1340 (Garage East Wall)

    const y0 = OY,              // 40   (North Wall)
          y1 = OY + 380,        // 420  (Ground North/South Split Wall)
          y2 = OY + 620,        // 660  (Bed 2 / Bathroom Split Wall)
          y3 = OY + 660,        // 700  (Master / En-suite Split Wall)
          y4 = OY + 800;        // 840  (South Wall)

    const gy1 = OY + 480;       // Garage South Wall (y = 520)

    const VW = x5 + OX + 20;
    const VH = y4 + OY + 20;

    let svg = `<svg viewBox="0 0 ${VW} ${VH}" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" style="background:var(--bg-card,#0d1321);">`;

    // ── CAD Grid Background (editor only) ───────────────────────────
    if (!simplified) {
      svg += `<defs>
        <pattern id="grid" width="${S}" height="${S}" patternUnits="userSpaceOnUse">
          <path d="M ${S} 0 L 0 0 0 ${S}" fill="none" stroke="rgba(0,229,255,0.06)" stroke-width="1"/>
        </pattern>
      </defs>
      <rect x="0" y="0" width="${VW}" height="${VH}" fill="url(#grid)"/>`;
    }

    const OW = `fill="none" stroke="#e8eaed" stroke-width="4" stroke-linecap="square"`;
    const IW = `fill="none" stroke="#e8eaed" stroke-width="2.5" stroke-linecap="square"`;

    // ── EXTERIOR WALLS WITH PHYSICAL OPENINGS ────────────────────────
    svg += `<g class="outer-walls">
      <!-- Main House North Wall (y0) -->
      <line x1="${x0}" y1="${y0}" x2="${x0+120}" y2="${y0}" ${OW}/>
      <line x1="${x0+240}" y1="${y0}" x2="${x2}" y2="${y0}" ${OW}/>
      <line x1="${x2}" y1="${y0}" x2="${x2+140}" y2="${y0}" ${OW}/>
      <line x1="${x2+280}" y1="${y0}" x2="${x4}" y2="${y0}" ${OW}/>

      <!-- Main House West Wall (x0) -->
      <line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y0+120}" ${OW}/>
      <line x1="${x0}" y1="${y0+240}" x2="${x0}" y2="${y1}" ${OW}/>
      <line x1="${x0}" y1="${y1}" x2="${x0}" y2="${y1+140}" ${OW}/>
      <line x1="${x0}" y1="${y1+260}" x2="${x0}" y2="${y4}" ${OW}/>

      <!-- Main House South Wall (y4) -->
      <line x1="${x0}" y1="${y4}" x2="${x0+100}" y2="${y4}" ${OW}/>
      <line x1="${x0+180}" y1="${y4}" x2="${x1+100}" y2="${y4}" ${OW}/>
      <line x1="${x1+220}" y1="${y4}" x2="${x3+80}" y2="${y4}" ${OW}/>
      <line x1="${x3+200}" y1="${y4}" x2="${x4}" y2="${y4}" ${OW}/>

      <!-- Main House East Wall (x4) -->
      <line x1="${x4}" y1="${y0}" x2="${x4}" y2="${gy1}" ${OW}/>
      <line x1="${x4}" y1="${gy1}" x2="${x4}" y2="${y2+40}" ${OW}/>
      <line x1="${x4}" y1="${y2+160}" x2="${x4}" y2="${y4}" ${OW}/>

      <!-- Garage Exterior Walls -->
      <line x1="${x4}" y1="${y0}" x2="${x5}" y2="${y0}" ${OW}/>
      <line x1="${x5}" y1="${y0}" x2="${x5}" y2="${y0+160}" ${OW}/>
      <line x1="${x5}" y1="${y0+280}" x2="${x5}" y2="${gy1}" ${OW}/>
      <line x1="${x4}" y1="${gy1}" x2="${x4+40}" y2="${gy1}" ${OW}/>
      <line x1="${x5-40}" y1="${gy1}" x2="${x5}" y2="${gy1}" ${OW}/>
    </g>`;

    // ── INTERIOR WALLS WITH PHYSICAL OPENINGS ────────────────────────
    svg += `<g class="inner-walls">
      <!-- Ground Floor Horizontal Divider (y1) -->
      <line x1="${x0}" y1="${y1}" x2="${x0+140}" y2="${y1}" ${IW}/>
      <line x1="${x0+215}" y1="${y1}" x2="${x1}" y2="${y1}" ${IW}/>
      <line x1="${x1}" y1="${y1}" x2="${x1+60}" y2="${y1}" ${IW}/>
      <line x1="${x1+135}" y1="${y1}" x2="${x3}" y2="${y1}" ${IW}/>
      <line x1="${x3}" y1="${y1}" x2="${x3+60}" y2="${y1}" ${IW}/>
      <line x1="${x3+135}" y1="${y1}" x2="${x4}" y2="${y1}" ${IW}/>

      <!-- Lounge / Kitchen Vertical Split Wall (x2) -->
      <line x1="${x2}" y1="${y0}" x2="${x2}" y2="${y0+140}" ${IW}/>
      <line x1="${x2}" y1="${y0+215}" x2="${x2}" y2="${y1}" ${IW}/>

      <!-- Reception Hall / Master Bed Vertical Wall (x1) -->
      <line x1="${x1}" y1="${y1}" x2="${x1}" y2="${y4}" ${IW}/>

      <!-- Master / Bedroom 2 Vertical Wall (x3) -->
      <line x1="${x3}" y1="${y1}" x2="${x3}" y2="${y4}" ${IW}/>

      <!-- Master / En-suite Horizontal Split Wall (y3) -->
      <line x1="${x1}" y1="${y3}" x2="${x1+60}" y2="${y3}" ${IW}/>
      <line x1="${x1+135}" y1="${y3}" x2="${x3}" y2="${y3}" ${IW}/>

      <!-- Bedroom 2 / Family Bathroom Horizontal Split Wall (y2) -->
      <line x1="${x3}" y1="${y2}" x2="${x3+60}" y2="${y2}" ${IW}/>
      <line x1="${x3+135}" y1="${y2}" x2="${x4}" y2="${y2}" ${IW}/>
    </g>`;

    // ── AUTOCAD ARCHITECTURAL DOOR BLOCKS ───────────────────────────
    const cadDoor = (hx, hy, w, dir) => {
      let leafX, leafY, arcD, jamb1X, jamb1Y, jamb2X, jamb2Y;

      if (dir === 'H-UP') {
        leafX = hx; leafY = hy - w;
        arcD = `M ${hx + w} ${hy} A ${w} ${w} 0 0 0 ${hx} ${hy - w}`;
        jamb1X = hx; jamb1Y = hy; jamb2X = hx + w; jamb2Y = hy;
      } else if (dir === 'H-DOWN') {
        leafX = hx; leafY = hy + w;
        arcD = `M ${hx + w} ${hy} A ${w} ${w} 0 0 1 ${hx} ${hy + w}`;
        jamb1X = hx; jamb1Y = hy; jamb2X = hx + w; jamb2Y = hy;
      } else if (dir === 'V-RIGHT') {
        leafX = hx + w; leafY = hy;
        arcD = `M ${hx} ${hy + w} A ${w} ${w} 0 0 0 ${hx + w} ${hy}`;
        jamb1X = hx; jamb1Y = hy; jamb2X = hx; jamb2Y = hy + w;
      } else if (dir === 'V-LEFT') {
        leafX = hx - w; leafY = hy;
        arcD = `M ${hx} ${hy + w} A ${w} ${w} 0 0 1 ${hx - w} ${hy}`;
        jamb1X = hx; jamb1Y = hy; jamb2X = hx; jamb2Y = hy + w;
      }

      return `
        <g class="autocad-door">
          <line x1="${jamb1X-3}" y1="${jamb1Y}" x2="${jamb1X+3}" y2="${jamb1Y}" stroke="#00e5ff" stroke-width="2"/>
          <line x1="${jamb2X-3}" y1="${jamb2Y}" x2="${jamb2X+3}" y2="${jamb2Y}" stroke="#00e5ff" stroke-width="2"/>
          <line x1="${hx}" y1="${hy}" x2="${leafX}" y2="${leafY}" stroke="#00e5ff" stroke-width="3" stroke-linecap="round"/>
          <path d="${arcD}" fill="none" stroke="#00e5ff" stroke-width="1.8" stroke-dasharray="5 3"/>
        </g>
      `;
    };

    svg += `<g class="doors">
      <!-- 1. MAIN FRONT ENTRANCE DOOR (South wall of Hall at x0+100) -->
      ${cadDoor(x0 + 100, y4, 80, 'H-UP')}

      <!-- 2. HALL TO LOUNGE DOOR (y1 horizontal wall at x0+140) -->
      ${cadDoor(x0 + 140, y1, 75, 'H-UP')}

      <!-- 3. LOUNGE TO KITCHEN DOOR (x2 vertical wall at y0+140) -->
      ${cadDoor(x2, y0 + 140, 75, 'V-RIGHT')}

      <!-- 4. HALL TO MASTER BEDROOM DOOR (y1 horizontal wall at x1+60) -->
      ${cadDoor(x1 + 60, y1, 75, 'H-DOWN')}

      <!-- 5. KITCHEN TO BEDROOM 2 DOOR (y1 horizontal wall at x3+60) -->
      ${cadDoor(x3 + 60, y1, 75, 'H-DOWN')}

      <!-- 6. MASTER BEDROOM TO EN-SUITE DOOR (y3 horizontal wall at x1+60) -->
      ${cadDoor(x1 + 60, y3, 75, 'H-DOWN')}

      <!-- 7. BEDROOM 2 TO FAMILY BATHROOM DOOR (y2 horizontal wall at x3+60) -->
      ${cadDoor(x3 + 60, y2, 75, 'H-DOWN')}

      <!-- 8. GARAGE AUTOMATED ROLLER DOOR (South wall of Garage) -->
      <rect x="${x4 + 40}" y="${gy1 - 16}" width="${x5 - x4 - 80}" height="16" fill="rgba(0,229,255,0.15)" stroke="#00e5ff" stroke-width="2"/>
      <line x1="${x4 + 40}" y1="${gy1 - 11}" x2="${x5 - 40}" y2="${gy1 - 11}" stroke="#00e5ff" stroke-width="1" stroke-dasharray="4 3"/>
      <line x1="${x4 + 40}" y1="${gy1 - 6}"  x2="${x5 - 40}" y2="${gy1 - 6}"  stroke="#00e5ff" stroke-width="1" stroke-dasharray="4 3"/>
      <line x1="${(x4 + x5) / 2}" y1="${gy1 - 16}" x2="${(x4 + x5) / 2}" y2="${gy1}" stroke="#00e5ff" stroke-width="1.5"/>
    </g>`;

    // ── WINDOWS ────────────────────────────────────────────────────────
    const win = (x, y, horiz, len = 120) => {
      let d;
      if (horiz) {
        d = `M${x} ${y-4} L${x+len} ${y-4} M${x} ${y+4} L${x+len} ${y+4}
             M${x} ${y-9} L${x} ${y+9} M${x+len} ${y-9} L${x+len} ${y+9}`;
      } else {
        d = `M${x-4} ${y} L${x-4} ${y+len} M${x+4} ${y} L${x+4} ${y+len}
             M${x-9} ${y} L${x+9} ${y} M${x-9} ${y+len} L${x+9} ${y+len}`;
      }
      return `<path d="${d}" fill="none" stroke="#2979ff" stroke-width="2.5"/>`;
    };

    svg += `<g class="windows">
      ${win(x0 + 120, y0, true, 120)}   <!-- Lounge North Window -->
      ${win(x2 + 140, y0, true, 140)}   <!-- Kitchen North Window -->
      ${win(x0,       y0 + 120, false, 120)} <!-- Lounge West Window -->
      ${win(x0,       y1 + 140, false, 120)} <!-- Hall West Window -->
      ${win(x1 + 220, y4, true, 140)}   <!-- Master South Window -->
      ${win(x3 + 80,  y4, true, 120)}   <!-- Bathroom South Window -->
      ${win(x4,       y2 + 40, false, 120)}  <!-- Bedroom 2 East Window -->
      ${win(x5,       y0 + 160, false, 120)} <!-- Garage East Window -->
    </g>`;

    // ── BAY WINDOW (Lounge Front Architectural Feature) ─────────────
    svg += `<path d="M ${x0+120} ${y0} L ${x0+120} ${y0-40} L ${x0+240} ${y0-40} L ${x0+240} ${y0}" fill="none" stroke="#2979ff" stroke-width="2.5" stroke-dasharray="8 4"/>`;

    // ── STAIRCASE SYMBOL (Flush against West Wall) ─────────
    svg += `<g class="staircase" stroke="rgba(0, 229, 255, 0.4)" stroke-width="1.5">
      <!-- Main Flight flush against West Wall (x0) -->
      <rect x="${x0}" y="${y1 + 40}" width="100" height="240" fill="rgba(0, 229, 255, 0.04)" stroke="rgba(0, 229, 255, 0.6)"/>
      <line x1="${x0}" y1="${y1 + 70}"  x2="${x0 + 100}" y2="${y1 + 70}"/>
      <line x1="${x0}" y1="${y1 + 100}" x2="${x0 + 100}" y2="${y1 + 100}"/>
      <line x1="${x0}" y1="${y1 + 130}" x2="${x0 + 100}" y2="${y1 + 130}"/>
      <line x1="${x0}" y1="${y1 + 160}" x2="${x0 + 100}" y2="${y1 + 160}"/>
      <line x1="${x0}" y1="${y1 + 190}" x2="${x0 + 100}" y2="${y1 + 190}"/>
      <line x1="${x0}" y1="${y1 + 220}" x2="${x0 + 100}" y2="${y1 + 220}"/>

      <!-- Up Arrow Indicator -->
      <path d="M ${x0 + 50} ${y1 + 255} L ${x0 + 50} ${y1 + 55} M ${x0 + 42} ${y1 + 70} L ${x0 + 50} ${y1 + 55} L ${x0 + 58} ${y1 + 70}" fill="none" stroke="#00e5ff" stroke-width="2"/>
      <text x="${x0 + 50}" y="${y1 + 270}" fill="#00e5ff" font-family="'JetBrains Mono', monospace" font-size="11" text-anchor="middle">UP</text>
    </g>`;

    // ── ROOM LABELS & AREA (Zero Text Collisions) ───────────────────
    const ls = `font-family:'Space Grotesk',sans-serif;text-anchor:middle;dominant-baseline:middle;`;
    const label = (name, area, x, y) => `
      <text x="${x}" y="${y}" fill="#cbd5e1" font-size="22" font-weight="600" style="${ls}">${name}</text>
      ${!simplified ? `<text x="${x}" y="${y+28}" fill="rgba(56,189,248,0.85)" font-size="14" style="${ls}">${area} m²</text>` : ''}`;

    svg += `<g class="labels">
      ${label('LOUNGE',           '24.5', (x0 + x2) / 2, (y0 + y1) / 2)}
      ${label('KITCHEN & DINER',  '28.0', (x2 + x4) / 2, (y0 + y1) / 2)}
      ${label('RECEPTION HALL',   '16.0', x0 + 240, (y1 + y4) / 2 - 10)}
      ${label('MASTER SUITE',     '22.0', (x1 + x3) / 2, (y1 + y3) / 2)}
      ${label('EN-SUITE',         '9.0',  (x1 + x3) / 2, (y3 + y4) / 2)}
      ${label('BEDROOM 2',        '18.0', (x3 + x4) / 2, (y1 + y2) / 2)}
      ${label('FAMILY BATHROOM',  '13.5', (x3 + x4) / 2, (y2 + y4) / 2)}
      ${label('DOUBLE GARAGE',    '24.0', (x4 + x5) / 2, (y0 + gy1) / 2)}
    </g>`;

    // ── DIMENSIONS (editor only) ─────────────────────────────────────
    if (!simplified) {
      const dim = (x1, y1, x2, y2, txt, tx, ty, vert=false) => `
        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#00e5ff" stroke-width="1.2"/>
        <line x1="${x1-5}" y1="${y1}" x2="${x1+5}" y2="${y1}" stroke="#00e5ff" stroke-width="1.2"/>
        <line x1="${x2-5}" y1="${y2}" x2="${x2+5}" y2="${y2}" stroke="#00e5ff" stroke-width="1.2"/>
        <text x="${tx}" y="${ty}" fill="#00e5ff" font-family="'JetBrains Mono',monospace" font-size="14"
          text-anchor="middle" ${vert?`transform="rotate(-90 ${tx} ${ty})"`:''}>${txt}</text>`;
      svg += `<g class="dim-line">
        ${dim(x0, y0 - 20, x4, y0 - 20, '12.0m', (x0 + x4) / 2, y0 - 35)}
        ${dim(x4, y0 - 20, x5, y0 - 20, '4.0m',  (x4 + x5) / 2, y0 - 35)}
        ${dim(x0 - 20, y0, x0 - 20, y4, '10.0m', x0 - 40, (y0 + y4) / 2, true)}
      </g>`;

      // North Arrow
      svg += `<g transform="translate(${x5 - 60}, ${y4 - 60})">
        <circle cx="0" cy="0" r="28" fill="none" stroke="#8b95a5" stroke-width="1.5"/>
        <polygon points="0,-36 -12,8 0,-8 12,8" fill="#00e5ff"/>
        <text x="0" y="26" fill="#8b95a5" font-family="'Space Grotesk',sans-serif" font-size="14" font-weight="700" text-anchor="middle">N</text>
      </g>`;
    }

    svg += `</svg>`;
    return svg;
  }
};
