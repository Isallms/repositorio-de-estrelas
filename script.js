/**
 * Céu Estrelado & Galáxia Interativa - 3D Canvas Engine
 * Simulação cósmica com paralaxe, constelações, meteoros e modo hiperespaço.
 */

(function () {
  'use strict';

  // --- CONFIGURAÇÃO & TEMAS ---
  const THEMES = {
    deepSpace: {
      name: 'Espaço Profundo',
      bgGradient: ['#02040b', '#070c20', '#0f1738'],
      nebulaBlobs: [
        { xRatio: 0.3, yRatio: 0.3, radius: 450, color: 'rgba(30, 58, 138, 0.18)' },
        { xRatio: 0.7, yRatio: 0.6, radius: 500, color: 'rgba(67, 56, 202, 0.14)' },
        { xRatio: 0.5, yRatio: 0.8, radius: 350, color: 'rgba(14, 165, 233, 0.08)' }
      ],
      stars: ['#ffffff', '#f0f9ff', '#bae6fd', '#7dd3fc', '#93c5fd', '#fed7aa'],
      constellationLine: 'rgba(186, 230, 253, 0.22)',
      constellationMouseLine: 'rgba(125, 211, 252, 0.45)',
      meteorColor: '#38bdf8'
    },
    violetNebula: {
      name: 'Nebulosa Violeta',
      bgGradient: ['#04020a', '#140827', '#250b44'],
      nebulaBlobs: [
        { xRatio: 0.35, yRatio: 0.4, radius: 450, color: 'rgba(134, 25, 143, 0.2)' },
        { xRatio: 0.65, yRatio: 0.5, radius: 500, color: 'rgba(91, 33, 182, 0.22)' },
        { xRatio: 0.5, yRatio: 0.75, radius: 400, color: 'rgba(236, 72, 153, 0.14)' }
      ],
      stars: ['#ffffff', '#faf5ff', '#f5d0fe', '#e879f9', '#c084fc', '#f43f5e'],
      constellationLine: 'rgba(232, 121, 249, 0.25)',
      constellationMouseLine: 'rgba(244, 114, 182, 0.5)',
      meteorColor: '#f472b6'
    },
    supernova: {
      name: 'Supernova Ouro',
      bgGradient: ['#080402', '#1c0e04', '#2d1404'],
      nebulaBlobs: [
        { xRatio: 0.4, yRatio: 0.35, radius: 450, color: 'rgba(180, 83, 9, 0.2)' },
        { xRatio: 0.7, yRatio: 0.65, radius: 520, color: 'rgba(194, 65, 12, 0.18)' },
        { xRatio: 0.3, yRatio: 0.8, radius: 380, color: 'rgba(245, 158, 11, 0.12)' }
      ],
      stars: ['#ffffff', '#fffbeb', '#fef08a', '#fde047', '#fbbf24', '#fb923c'],
      constellationLine: 'rgba(253, 224, 71, 0.24)',
      constellationMouseLine: 'rgba(251, 191, 36, 0.5)',
      meteorColor: '#fde047'
    },
    aurora: {
      name: 'Aurora Boreal',
      bgGradient: ['#020908', '#051b18', '#0b292b'],
      nebulaBlobs: [
        { xRatio: 0.25, yRatio: 0.3, radius: 450, color: 'rgba(13, 148, 136, 0.2)' },
        { xRatio: 0.75, yRatio: 0.5, radius: 500, color: 'rgba(16, 185, 129, 0.16)' },
        { xRatio: 0.5, yRatio: 0.7, radius: 420, color: 'rgba(79, 70, 229, 0.15)' }
      ],
      stars: ['#ffffff', '#f0fdf4', '#a7f3d0', '#6ee7b7', '#38bdf8', '#818cf8'],
      constellationLine: 'rgba(110, 231, 183, 0.22)',
      constellationMouseLine: 'rgba(52, 211, 153, 0.5)',
      meteorColor: '#34d399'
    }
  };

  const state = {
    themeKey: 'deepSpace',
    starCount: 1200,
    speed: 1.0,
    starSize: 1.5,
    warpSpeed: false,
    constellations: true,
    nebula: true,
    twinkle: true,
    paused: false,
    mouse: { x: 0, y: 0, targetX: 0, targetY: 0, isHovering: false },
    dimensions: { width: window.innerWidth, height: window.innerHeight, dpr: 1 },
    fps: 60,
    lastFrameTime: performance.now(),
    frameCount: 0,
    fpsTimer: 0
  };

  // --- ELEMENTOS DOM ---
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  const controlPanel = document.getElementById('controlPanel');
  const hudToggleBtn = document.getElementById('hudToggleBtn');
  const closePanelBtn = document.getElementById('closePanelBtn');
  const hintBanner = document.getElementById('hintBanner');

  // Sliders & Badges
  const starCountInput = document.getElementById('starCount');
  const starCountVal = document.getElementById('starCountVal');
  const speedSlider = document.getElementById('speedSlider');
  const speedVal = document.getElementById('speedVal');
  const starSizeInput = document.getElementById('starSize');
  const starSizeVal = document.getElementById('starSizeVal');

  // Toggles
  const warpToggle = document.getElementById('warpToggle');
  const constellationsToggle = document.getElementById('constellationsToggle');
  const nebulaToggle = document.getElementById('nebulaToggle');
  const twinkleToggle = document.getElementById('twinkleToggle');

  // Botões
  const themeBtns = document.querySelectorAll('.theme-btn');
  const meteorBtn = document.getElementById('meteorBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const screenshotBtn = document.getElementById('screenshotBtn');
  const resetBtn = document.getElementById('resetBtn');

  // Estatísticas
  const fpsVal = document.getElementById('fpsVal');
  const activeStarsVal = document.getElementById('activeStarsVal');
  const activeMeteorsVal = document.getElementById('activeMeteorsVal');

  // --- CLASSES DO UNIVERSO ---

  const MAX_Z = 1200;
  const FOV = 400;

  class Star {
    constructor(initRandomZ = true) {
      this.reset(initRandomZ);
    }

    reset(initRandomZ = false) {
      // Coordenadas espaciais centradas
      const spreadX = state.dimensions.width * 2;
      const spreadY = state.dimensions.height * 2;
      this.x = (Math.random() - 0.5) * spreadX;
      this.y = (Math.random() - 0.5) * spreadY;
      this.z = initRandomZ ? Math.random() * MAX_Z : MAX_Z;
      this.prevZ = this.z;

      this.baseRadius = Math.random() * 0.9 + 0.5;
      this.theme = THEMES[state.themeKey];
      this.color = this.theme.stars[Math.floor(Math.random() * this.theme.stars.length)];

      this.twinklePhase = Math.random() * Math.PI * 2;
      this.twinkleSpeed = Math.random() * 0.05 + 0.02;

      // Posição de projeção 2D na tela
      this.screenX = 0;
      this.screenY = 0;
      this.prevScreenX = 0;
      this.prevScreenY = 0;
      this.visible = false;
    }

    update(dt, speedMult) {
      this.prevZ = this.z;
      this.prevScreenX = this.screenX;
      this.prevScreenY = this.screenY;

      // Velocidade de aproximação
      const moveSpeed = state.warpSpeed ? 28 * speedMult : 1.6 * speedMult;
      this.z -= moveSpeed * (dt / 16.667);

      if (this.z <= 1) {
        this.reset(false);
        this.prevZ = this.z;
      }

      this.twinklePhase += this.twinkleSpeed;

      // Projeção perspectiva 3D -> 2D
      const k = FOV / this.z;
      const cx = state.dimensions.width / 2 + state.mouse.x * 0.15;
      const cy = state.dimensions.height / 2 + state.mouse.y * 0.15;

      this.screenX = cx + this.x * k;
      this.screenY = cy + this.y * k;

      // Projeção do ponto anterior (usada para os rastros de hiperespaço)
      const prevK = FOV / this.prevZ;
      this.prevScreenX = cx + this.x * prevK;
      this.prevScreenY = cy + this.y * prevK;

      // Validação se está dentro dos limites da tela com margem
      const pad = 100;
      this.visible = (
        this.screenX >= -pad &&
        this.screenX <= state.dimensions.width + pad &&
        this.screenY >= -pad &&
        this.screenY <= state.dimensions.height + pad
      );
    }

    draw(ctx) {
      if (!this.visible) return;

      const k = FOV / this.z;
      const radius = Math.max(0.2, this.baseRadius * k * (state.starSize / 1.5));
      const depthOpacity = Math.min(1, Math.max(0.15, (MAX_Z - this.z) / (MAX_Z * 0.75)));
      
      let twinkle = 1;
      if (state.twinkle && !state.warpSpeed) {
        twinkle = 0.65 + Math.sin(this.twinklePhase) * 0.35;
      }

      const alpha = Math.min(1, depthOpacity * twinkle);

      ctx.save();
      ctx.globalAlpha = alpha;

      if (state.warpSpeed) {
        // Efeito Hiperspace (feixes de luz acelerados)
        ctx.strokeStyle = this.color;
        ctx.lineWidth = Math.min(4, Math.max(0.8, radius * 1.6));
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(this.prevScreenX, this.prevScreenY);
        ctx.lineTo(this.screenX, this.screenY);
        ctx.stroke();
      } else {
        // Estrela pontual com brilho
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.screenX, this.screenY, radius, 0, Math.PI * 2);
        ctx.fill();

        // Brilho halo para estrelas mais brilhantes e próximas
        if (radius > 1.8 && alpha > 0.6) {
          ctx.beginPath();
          ctx.arc(this.screenX, this.screenY, radius * 2.8, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.globalAlpha = alpha * 0.25;
          ctx.fill();
        }
      }

      ctx.restore();
    }
  }

  // --- CLASSE METEORO / ESTRELA CADENTE ---

  class ShootingStar {
    constructor(originX = null, originY = null) {
      this.reset(originX, originY);
    }

    reset(originX = null, originY = null) {
      const w = state.dimensions.width;
      const h = state.dimensions.height;

      if (originX !== null && originY !== null) {
        this.x = originX;
        this.y = originY;
        this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.4;
      } else {
        this.x = Math.random() * (w * 0.9);
        this.y = Math.random() * (h * 0.4);
        this.angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.3;
      }

      this.speed = Math.random() * 12 + 18;
      this.length = Math.random() * 120 + 80;
      this.thickness = Math.random() * 2 + 1.5;
      this.life = 1.0;
      this.decay = Math.random() * 0.02 + 0.015;
      this.particles = [];
      this.active = true;
    }

    update(dt) {
      if (!this.active) return;

      const moveDist = this.speed * (dt / 16.667);
      this.x += Math.cos(this.angle) * moveDist;
      this.y += Math.sin(this.angle) * moveDist;
      this.life -= this.decay * (dt / 16.667);

      // Partículas de faísca deixadas para trás
      if (Math.random() > 0.4) {
        this.particles.push({
          x: this.x + (Math.random() - 0.5) * 4,
          y: this.y + (Math.random() - 0.5) * 4,
          life: 1.0,
          decay: Math.random() * 0.06 + 0.03,
          size: Math.random() * 2 + 1
        });
      }

      // Atualiza faíscas
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.life -= p.decay;
        if (p.life <= 0) {
          this.particles.splice(i, 1);
        }
      }

      if (this.life <= 0 && this.particles.length === 0) {
        this.active = false;
      }
    }

    draw(ctx) {
      if (!this.active) return;

      const theme = THEMES[state.themeKey];
      const tailX = this.x - Math.cos(this.angle) * (this.length * this.life);
      const tailY = this.y - Math.sin(this.angle) * (this.length * this.life);

      ctx.save();
      
      // Rastro principal em gradiente
      if (this.life > 0) {
        const grad = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        grad.addColorStop(0.7, theme.meteorColor);
        grad.addColorStop(1, '#ffffff');

        ctx.strokeStyle = grad;
        ctx.lineWidth = this.thickness;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();

        // Cabeça brilhante da estrela cadente
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.thickness * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Faíscas remanescentes
      for (const p of this.particles) {
        ctx.fillStyle = theme.meteorColor;
        ctx.globalAlpha = p.life * 0.8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // --- GERENCIADOR DO UNIVERSO ---

  let stars = [];
  let meteors = [];
  let nextMeteorTime = performance.now() + Math.random() * 4000 + 2000;

  function initStars() {
    stars = [];
    for (let i = 0; i < state.starCount; i++) {
      stars.push(new Star(true));
    }
    activeStarsVal.textContent = stars.length;
  }

  function resizeCanvas() {
    state.dimensions.width = window.innerWidth;
    state.dimensions.height = window.innerHeight;
    state.dimensions.dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = state.dimensions.width * state.dimensions.dpr;
    canvas.height = state.dimensions.height * state.dimensions.dpr;
    canvas.style.width = `${state.dimensions.width}px`;
    canvas.style.height = `${state.dimensions.height}px`;

    ctx.scale(state.dimensions.dpr, state.dimensions.dpr);
  }

  function drawBackground() {
    const theme = THEMES[state.themeKey];
    const w = state.dimensions.width;
    const h = state.dimensions.height;

    // Gradiente de Fundo Espacial
    const bg = ctx.createRadialGradient(
      w / 2 + state.mouse.x * 0.05,
      h / 2 + state.mouse.y * 0.05,
      10,
      w / 2,
      h / 2,
      Math.max(w, h) * 0.85
    );
    bg.addColorStop(0, theme.bgGradient[2]);
    bg.addColorStop(0.5, theme.bgGradient[1]);
    bg.addColorStop(1, theme.bgGradient[0]);

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Efeito de Nebulosa
    if (state.nebula && !state.warpSpeed) {
      ctx.save();
      for (const blob of theme.nebulaBlobs) {
        const bx = blob.xRatio * w + state.mouse.x * 0.08;
        const by = blob.yRatio * h + state.mouse.y * 0.08;
        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, blob.radius);
        grad.addColorStop(0, blob.color);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(bx, by, blob.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawConstellations() {
    if (!state.constellations || state.warpSpeed) return;

    const theme = THEMES[state.themeKey];
    const maxLineDist = 75;
    const maxMouseDist = 130;
    const mouseX = state.mouse.targetX;
    const mouseY = state.mouse.targetY;
    const isMouseInside = state.mouse.isHovering;

    ctx.save();

    // Filtra estrelas visíveis na metade frontal para conexões mais nítidas
    const visibleStars = stars.filter(s => s.visible && s.z < MAX_Z * 0.7);

    // Linhas entre estrelas próximas
    for (let i = 0; i < visibleStars.length; i++) {
      const s1 = visibleStars[i];

      // Conexão com o cursor do mouse
      if (isMouseInside) {
        const dMouse = Math.hypot(s1.screenX - mouseX, s1.screenY - mouseY);
        if (dMouse < maxMouseDist) {
          const mAlpha = (1 - dMouse / maxMouseDist) * 0.7;
          ctx.strokeStyle = theme.constellationMouseLine;
          ctx.globalAlpha = mAlpha;
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.moveTo(s1.screenX, s1.screenY);
          ctx.lineTo(mouseX, mouseY);
          ctx.stroke();
        }
      }

      // Conexões estelares entre pares próximos
      for (let j = i + 1; j < Math.min(visibleStars.length, i + 18); j++) {
        const s2 = visibleStars[j];
        const dist = Math.hypot(s1.screenX - s2.screenX, s1.screenY - s2.screenY);

        if (dist < maxLineDist) {
          const alpha = (1 - dist / maxLineDist) * 0.4;
          ctx.strokeStyle = theme.constellationLine;
          ctx.globalAlpha = alpha;
          ctx.lineWidth = 0.75;
          ctx.beginPath();
          ctx.moveTo(s1.screenX, s1.screenY);
          ctx.lineTo(s2.screenX, s2.screenY);
          ctx.stroke();
        }
      }
    }

    ctx.restore();
  }

  function spawnMeteor(originX = null, originY = null) {
    meteors.push(new ShootingStar(originX, originY));
    activeMeteorsVal.textContent = meteors.length;
  }

  // --- LOOP PRINCIPAL DE ANIMAÇÃO ---

  function animate(now) {
    requestAnimationFrame(animate);

    const dt = Math.min(now - state.lastFrameTime, 100);
    state.lastFrameTime = now;

    // Cálculo do FPS
    state.frameCount++;
    state.fpsTimer += dt;
    if (state.fpsTimer >= 1000) {
      state.fps = Math.round((state.frameCount * 1000) / state.fpsTimer);
      fpsVal.textContent = state.fps;
      state.frameCount = 0;
      state.fpsTimer = 0;
    }

    if (state.paused) return;

    // Suavização da paralaxe do mouse (Interpolação Lerp)
    state.mouse.x += (state.mouse.targetX - state.dimensions.width / 2 - state.mouse.x) * 0.04;
    state.mouse.y += (state.mouse.targetY - state.dimensions.height / 2 - state.mouse.y) * 0.04;

    // Renderiza fundo e nebulosa
    drawBackground();

    // Renderiza constelações antes das estrelas para manter estética suave
    drawConstellations();

    // Atualiza e renderiza estrelas
    for (let i = 0; i < stars.length; i++) {
      stars[i].update(dt, state.speed);
      stars[i].draw(ctx);
    }

    // Gerador aleatório de estrelas cadentes periódicas
    if (now > nextMeteorTime && !state.warpSpeed) {
      spawnMeteor();
      nextMeteorTime = now + Math.random() * 5000 + 3000;
    }

    // Atualiza e renderiza meteoros
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.update(dt);
      m.draw(ctx);
      if (!m.active) {
        meteors.splice(i, 1);
      }
    }
    activeMeteorsVal.textContent = meteors.length;
  }

  // --- CONTROLES & EVENT LISTENERS ---

  // Rastreamento do Mouse & Toque
  window.addEventListener('mousemove', (e) => {
    state.mouse.targetX = e.clientX;
    state.mouse.targetY = e.clientY;
    state.mouse.isHovering = true;
  });

  window.addEventListener('mouseleave', () => {
    state.mouse.isHovering = false;
    state.mouse.targetX = state.dimensions.width / 2;
    state.mouse.targetY = state.dimensions.height / 2;
  });

  // Clique no canvas cria meteoro direcionado
  canvas.addEventListener('click', (e) => {
    spawnMeteor(e.clientX, e.clientY);
  });

  // Toque em dispositivos móveis
  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      state.mouse.targetX = e.touches[0].clientX;
      state.mouse.targetY = e.touches[0].clientY;
      state.mouse.isHovering = true;
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    state.mouse.isHovering = false;
  });

  // Redimensionamento de janela com debounce
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resizeCanvas();
    }, 100);
  });

  // HUD: Alternar e Fechar
  hudToggleBtn.addEventListener('click', () => {
    controlPanel.classList.toggle('hidden');
  });

  closePanelBtn.addEventListener('click', () => {
    controlPanel.classList.add('hidden');
  });

  // Sliders
  starCountInput.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    state.starCount = val;
    starCountVal.textContent = val;
    adjustStarCount(val);
  });

  function adjustStarCount(target) {
    while (stars.length < target) {
      stars.push(new Star(true));
    }
    if (stars.length > target) {
      stars.length = target;
    }
    activeStarsVal.textContent = stars.length;
  }

  speedSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    state.speed = val;
    speedVal.textContent = `${val.toFixed(1)}x`;
  });

  starSizeInput.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    state.starSize = val;
    starSizeVal.textContent = `${val.toFixed(1)}x`;
  });

  // Toggles
  warpToggle.addEventListener('change', (e) => {
    state.warpSpeed = e.target.checked;
  });

  constellationsToggle.addEventListener('change', (e) => {
    state.constellations = e.target.checked;
  });

  nebulaToggle.addEventListener('change', (e) => {
    state.nebula = e.target.checked;
  });

  twinkleToggle.addEventListener('change', (e) => {
    state.twinkle = e.target.checked;
  });

  // Temas
  themeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      themeBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.themeKey = btn.dataset.theme;

      // Atualiza cores das estrelas existentes
      const currentTheme = THEMES[state.themeKey];
      for (const s of stars) {
        s.color = currentTheme.stars[Math.floor(Math.random() * currentTheme.stars.length)];
      }
    });
  });

  // Ações Rápidas
  meteorBtn.addEventListener('click', () => {
    spawnMeteor();
  });

  pauseBtn.addEventListener('click', () => {
    state.paused = !state.paused;
    pauseBtn.innerHTML = state.paused ? '▶️ Continuar' : '⏸️ Pausar';
    if (!state.paused) {
      state.lastFrameTime = performance.now();
    }
  });

  screenshotBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `cosmos-ceu-estrelado-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  resetBtn.addEventListener('click', () => {
    state.themeKey = 'deepSpace';
    state.starCount = 1200;
    state.speed = 1.0;
    state.starSize = 1.5;
    state.warpSpeed = false;
    state.constellations = true;
    state.nebula = true;
    state.twinkle = true;
    state.paused = false;

    // Atualiza controles DOM
    starCountInput.value = 1200;
    starCountVal.textContent = '1200';
    speedSlider.value = 1.0;
    speedVal.textContent = '1.0x';
    starSizeInput.value = 1.5;
    starSizeVal.textContent = '1.5x';
    warpToggle.checked = false;
    constellationsToggle.checked = true;
    nebulaToggle.checked = true;
    twinkleToggle.checked = true;
    pauseBtn.innerHTML = '⏸️ Pausar';

    themeBtns.forEach((b) => {
      b.classList.toggle('active', b.dataset.theme === 'deepSpace');
    });

    initStars();
  });

  // Teclas de Atalho
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;

    if (e.code === 'Space') {
      e.preventDefault();
      state.warpSpeed = !state.warpSpeed;
      warpToggle.checked = state.warpSpeed;
    } else if (e.key === 'c' || e.key === 'C') {
      state.constellations = !state.constellations;
      constellationsToggle.checked = state.constellations;
    } else if (e.key === 'h' || e.key === 'H') {
      controlPanel.classList.toggle('hidden');
    } else if (e.key === 'm' || e.key === 'M') {
      spawnMeteor();
    }
  });

  // Oculta dica após 8 segundos
  setTimeout(() => {
    if (hintBanner) {
      hintBanner.style.opacity = '0';
      setTimeout(() => hintBanner.remove(), 500);
    }
  }, 8000);

  // Inicialização
  resizeCanvas();
  initStars();
  requestAnimationFrame(animate);
})();
