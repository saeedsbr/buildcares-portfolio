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

  createTransform3DModel: function(containerId) {
    const container = document.querySelector(containerId);
    if (!container) return;
    container.innerHTML = `
      <div id="render-3d-wrapper" class="render-3d-viewport" style="width:100%;height:100%;min-height:380px;display:flex;align-items:center;justify-content:center;position:relative;background:#0b111e;border-radius:8px;overflow:hidden;padding:1rem;transform-style:preserve-3d;animation:iso-3d-float-rotate 8s ease-in-out infinite alternate;">
        <img id="render-3d-img" src="images/autocad-3d-model.jpg" alt="3D Architectural Visualization" style="max-width:100%;max-height:360px;object-fit:contain;border-radius:6px;box-shadow:0 20px 45px rgba(0,0,0,0.75);transition:transform 0.15s ease-out;" />
      </div>
    `;
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
    // 2D AutoCAD Floor Plan (Directly 1-to-1 with the 3D Model Render)
    // Rooms: Lounge (Top-Left + Bay Window), Master Bedroom (Bottom-Left + Bay Window),
    //        Central Hall (Middle), Ensuite (Top-Center), Family Bathroom (Bottom-Center),
    //        Kitchen & Diner (Top/Mid-Right + Island), Bedroom 2 (Far-Right)
    // ─────────────────────────────────────────────────────────────────

    const VW = 820;
    const VH = 860;

    const x0 = 100;  // West main wall
    const x1 = 340;  // West rooms (Lounge/Master Bed) / Central Hall split wall
    const x2 = 420;  // Hall / Bathroom split wall
    const x3 = 580;  // Bathrooms & Kitchen / Bedroom 2 split wall
    const x4 = 740;  // East exterior wall

    const y0 = 60;   // North main wall
    const y1 = 380;  // Lounge / Master Bed & Ensuite / Family Bath split wall
    const y2 = 560;  // Family Bathroom South wall
    const y3 = 800;  // South main wall

    let svg = `<svg viewBox="0 0 ${VW} ${VH}" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" style="background:var(--bg-card,#0d1321);">`;

    svg += `<defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,229,255,0.06)" stroke-width="1"/>
      </pattern>
    </defs>`;

    if (!simplified) {
      svg += `<rect x="0" y="0" width="${VW}" height="${VH}" fill="url(#grid)"/>`;
    }

    const OW = `fill="none" stroke="#e8eaed" stroke-width="5" stroke-linecap="square"`;
    const IW = `fill="none" stroke="#e8eaed" stroke-width="3" stroke-linecap="square"`;

    // ── EXTERIOR WALLS ────────────────────────────────────────────────
    svg += `<g class="outer-walls">
      <!-- Top Wall (Lounge, Ensuite, Kitchen) -->
      <line x1="${x0+60}" y1="${y0}" x2="${x3}" y2="${y0}" ${OW}/>

      <!-- Lounge Top Bay Window Protrusion -->
      <path d="M ${x0} ${y0+60} L ${x0+20} ${y0} L ${x0+60} ${y0}" fill="none" stroke="#e8eaed" stroke-width="5"/>

      <!-- West Wall (Lounge & Master Bedroom) -->
      <line x1="${x0}" y1="${y0+60}" x2="${x0}" y2="${y1}" ${OW}/>
      <line x1="${x0}" y1="${y1}" x2="${x0}" y2="${y1+100}" ${OW}/>
      <line x1="${x0}" y1="${y1+200}" x2="${x0}" y2="${y3-60}" ${OW}/>

      <!-- Master Bed West Bay Window Protrusion -->
      <path d="M ${x0} ${y3-60} L ${x0-25} ${y3-30} L ${x0} ${y3}" fill="none" stroke="#e8eaed" stroke-width="5"/>

      <!-- East Wall (Kitchen & Bedroom 2) -->
      <line x1="${x3}" y1="${y0}" x2="${x4}" y2="${y0}" ${OW}/>
      <line x1="${x4}" y1="${y0}" x2="${x4}" y2="${y1+80}" ${OW}/>
      <line x1="${x4}" y1="${y1+180}" x2="${x4}" y2="${y3-160}" ${OW}/>
      <line x1="${x4}" y1="${y3-160}" x2="${x3}" y2="${y3-160}" ${OW}/>
      <line x1="${x3}" y1="${y3-160}" x2="${x3}" y2="${y3}" ${OW}/>

      <!-- South Wall -->
      <line x1="${x0}" y1="${y3}" x2="${x1+20}" y2="${y3}" ${OW}/>
      <line x1="${x1+100}" y1="${y3}" x2="${x3}" y2="${y3}" ${OW}/> <!-- Front Entrance opening -->
    </g>`;

    // ── INTERIOR PARTITION WALLS ──────────────────────────────────────
    svg += `<g class="inner-walls">
      <!-- West Rooms / Hallway Vertical Partition Wall (x1) -->
      <line x1="${x1}" y1="${y0}" x2="${x1}" y2="${y1-60}" ${IW}/>
      <line x1="${x1}" y1="${y1+20}" x2="${x1}" y2="${y3-80}" ${IW}/>

      <!-- Lounge / Master Bedroom Horizontal Wall (y1) -->
      <line x1="${x0}" y1="${y1}" x2="${x1-60}" y2="${y1}" ${IW}/>

      <!-- Hallway / Bathrooms & Kitchen Vertical Wall (x2) -->
      <line x1="${x2}" y1="${y0}" x2="${x2}" y2="${y0+80}" ${IW}/>
      <line x1="${x2}" y1="${y0+140}" x2="${x2}" y2="${y2}" ${IW}/>

      <!-- Ensuite / Family Bathroom Horizontal Wall (y1) -->
      <line x1="${x2}" y1="${y1}" x2="${x3}" y2="${y1}" ${IW}/>

      <!-- Family Bathroom South Wall (y2) -->
      <line x1="${x2}" y1="${y2}" x2="${x3-60}" y2="${y2}" ${IW}/>

      <!-- Kitchen / Bedroom 2 Partition Wall (x3) -->
      <line x1="${x3}" y1="${y0}" x2="${x3}" y2="${y1-40}" ${IW}/>
      <line x1="${x3}" y1="${y1+40}" x2="${x3}" y2="${y3-160}" ${IW}/>
    </g>`;

    // ── KITCHEN ISLAND RECTANGLE ──────────────────────────────────────
    svg += `<g class="kitchen-island" stroke="#00e5ff" stroke-width="1.8" fill="rgba(0, 229, 255, 0.08)">
      <rect x="${x2 + 40}" y="${y0 + 120}" width="90" height="150" rx="4"/>
      <!-- Stools -->
      <circle cx="${x2 + 20}" cy="${y0 + 145}" r="8" fill="rgba(0, 229, 255, 0.2)"/>
      <circle cx="${x2 + 20}" cy="${y0 + 195}" r="8" fill="rgba(0, 229, 255, 0.2)"/>
      <circle cx="${x2 + 20}" cy="${y0 + 245}" r="8" fill="rgba(0, 229, 255, 0.2)"/>
      <text x="${x2 + 85}" y="${y0 + 195}" fill="#00e5ff" font-family="'JetBrains Mono',monospace" font-size="11" text-anchor="middle" transform="rotate(-90 ${x2+85} ${y0+195})">ISLAND</text>
    </g>`;

    // ── CAD DOORS ─────────────────────────────────────────────────────
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
      <!-- 1. Front Entrance Door -->
      ${cadDoor(x1 + 20, y3, 75, 'H-UP')}

      <!-- 2. Lounge Door -->
      ${cadDoor(x1, y1 - 60, 60, 'V-LEFT')}

      <!-- 3. Master Bed Door -->
      ${cadDoor(x1 - 60, y1, 60, 'H-DOWN')}

      <!-- 4. Ensuite Door -->
      ${cadDoor(x2, y0 + 80, 55, 'V-RIGHT')}

      <!-- 5. Family Bathroom Door -->
      ${cadDoor(x2, y1 + 30, 55, 'V-RIGHT')}

      <!-- 6. Bedroom 2 Door -->
      ${cadDoor(x3, y1 - 40, 60, 'V-RIGHT')}
    </g>`;

    // ── WINDOWS & SLIDING GLASS DOORS ───────────────────────────────
    const win = (x, y, horiz, len = 100) => {
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
      ${win(x0 + 120, y0, true, 100)}  <!-- Lounge Top Bay Window -->
      ${win(x0, y1 + 100, false, 100)} <!-- Master Bed West Bay Window -->
      ${win(x4, y1 + 80, false, 100)}  <!-- Bedroom 2 East Window -->
      <!-- Kitchen Sliding Glass Doors -->
      <line x1="${x3 + 20}" y1="${y0}" x2="${x4 - 20}" y2="${y0}" stroke="#00e5ff" stroke-width="3" stroke-dasharray="8 4"/>
    </g>`;

    // ── ROOM LABELS & AREAS ───────────────────────────────────────────
    const ls = `font-family:'Space Grotesk',sans-serif;text-anchor:middle;dominant-baseline:middle;`;
    const label = (name, area, x, y) => `
      <text x="${x}" y="${y}" fill="#cbd5e1" font-size="19" font-weight="600" style="${ls}">${name}</text>
      ${!simplified ? `<text x="${x}" y="${y+24}" fill="rgba(56,189,248,0.85)" font-size="13" style="${ls}">${area} m²</text>` : ''}`;

    svg += `<g class="labels">
      ${label('Lounge',          '28.5', (x0 + x1) / 2, (y0 + y1) / 2)}
      ${label('Master Bedroom',  '26.2', (x0 + x1) / 2, (y1 + y3) / 2)}
      ${label('Central Hall',    '14.5', (x1 + x2) / 2, (y0 + y3) / 2)}
      ${label('Ensuite',         '8.4',  (x2 + x3) / 2, (y0 + y1) / 2)}
      ${label('Bathroom',        '11.2', (x2 + x3) / 2, (y1 + y2) / 2)}
      ${label('Kitchen & Diner', '32.0', (x2 + x3) / 2 + 10, y0 + 60)}
      ${label('Bedroom 2',       '18.6', (x3 + x4) / 2, (y0 + y3 - 160) / 2)}
    </g>`;

    if (!simplified) {
      const dim = (x1, y1, x2, y2, txt, tx, ty, vert=false) => `
        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#00e5ff" stroke-width="1.2"/>
        <line x1="${x1-5}" y1="${y1}" x2="${x1+5}" y2="${y1}" stroke="#00e5ff" stroke-width="1.2"/>
        <line x1="${x2-5}" y1="${y2}" x2="${x2+5}" y2="${y2}" stroke="#00e5ff" stroke-width="1.2"/>
        <text x="${tx}" y="${ty}" fill="#00e5ff" font-family="'JetBrains Mono',monospace" font-size="13"
          text-anchor="middle" ${vert?`transform="rotate(-90 ${tx} ${ty})"`:''}>${txt}</text>`;
      svg += `<g class="dim-line">
        ${dim(x0, y0 - 20, x4, y0 - 20, '14.5m', (x0 + x4) / 2, y0 - 32)}
        ${dim(x0 - 20, y0, x0 - 20, y3, '13.2m', x0 - 35, (y0 + y3) / 2, true)}
      </g>`;

      // North Arrow
      svg += `<g transform="translate(${x4 - 30}, ${y3 - 40})">
        <circle cx="0" cy="0" r="22" fill="none" stroke="#8b95a5" stroke-width="1.5"/>
        <polygon points="0,-28 -9,6 0,-6 9,6" fill="#00e5ff"/>
        <text x="0" y="20" fill="#8b95a5" font-family="'Space Grotesk',sans-serif" font-size="12" font-weight="700" text-anchor="middle">N</text>
      </g>`;
    }

    svg += `</svg>`;
    return svg;
  }
};
