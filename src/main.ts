import './style.css'
import { store } from './cms/store';
import type { SiteContent } from './cms/store';
// import { initAdminUI } from './cms/admin-ui';
// initAdminUI();

interface Sede {
  nombre: string;
  whatsapp: string;
  ciudad: string;
  lat: number;
  lon: number;
  id: string; // Added for forceSede
}

// Función para renderizar el contenido desde el Store (CMS)
function renderApp(content: SiteContent) {
  // 1. Hero Content
  const heroTitle = document.querySelector('.hero-text-box h1') as HTMLElement;
  if (heroTitle) {
    heroTitle.innerHTML = `${content.hero.title} <span>${content.hero.subtitle}</span>`;

    // Aplicar Estilos Dinámicos
    if (content.styles) {
      heroTitle.style.fontSize = content.styles.titleSize;
      heroTitle.style.color = content.styles.titleColor;

      const span = heroTitle.querySelector('span');
      if (span) span.style.color = content.styles.titleColor;
    }
  }

  const heroDesc = document.querySelector('.hero-text-box p') as HTMLElement;
  if (heroDesc) {
    heroDesc.innerText = content.hero.description;
    if (content.styles) {
      // heroDesc.style.color = content.styles.descColor; // Opcional
    }
  }

  const heroImg = document.querySelector('.hero-bg-image img') as HTMLImageElement;
  if (heroImg) {
    heroImg.src = content.hero.imageUrl;
  }

  const heroBtns = document.querySelectorAll('.hero-text-box .btn-orange');
  heroBtns.forEach(btn => {
    const el = btn as HTMLElement;
    el.innerText = content.hero.ctaText;
    if (content.styles && content.styles.btnColor) {
      el.style.backgroundColor = content.styles.btnColor;
    }
  });
}

// Suscribirse a cambios en el CMS
store.subscribe(renderApp);

// Render inicial
renderApp(store.get());

// Usamos las sedes del CMS en lugar de la constante hardcodeada
const SEDES = store.get().sedes;

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Intentamos detectar la ubicación usando GPS Real (Nav) o IP Fallback
async function detectLocation() {
  const settings = store.get().settings;

  // 1. Revisar si hay una sede forzada en el CMS
  if (settings && settings.forceSede) {
    const forced = SEDES.find(s => s.id === settings.forceSede);
    if (forced) {
      console.log(`📍 Sede Forzada desde CMS: ${forced.nombre}`);
      updateWhatsAppButton(forced);
      return;
    }
  }

  // 2. Intentar usar GPS del Navegador (Alta Precisión)
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Éxito con GPS
        const { latitude, longitude } = position.coords;
        console.log("📍 Ubicación precisa obtenida (GPS/WiFi):", latitude, longitude);
        findAndSelectNearestSede(latitude, longitude);
      },
      (error) => {
        // Si el usuario niega permiso o falla, usamos IP
        console.warn("⚠️ GPS denegado o falló, usando IP...", error.message);
        detectLocationByIP();
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  } else {
    // Si no soporta geo, usamos IP
    detectLocationByIP();
  }
}

async function detectLocationByIP() {
  let closest = SEDES[0];
  try {
    const response = await fetch('https://ipwho.is/').catch(() => null);
    if (response && response.ok) {
      const data = await response.json();
      if (data.success && data.latitude && data.longitude) {
        findAndSelectNearestSede(data.latitude, data.longitude);
        return;
      }
    }
  } catch (error) { /* Silencioso */ }

  // Si todo falla, Santa Bárbara por defecto
  updateWhatsAppButton(closest);
}

function findAndSelectNearestSede(lat: number, lon: number) {
  let closest = SEDES[0];
  let minDistance = Infinity;

  SEDES.forEach(s => {
    const d = getDistance(lat, lon, s.lat, s.lon);
    console.log(`📏 Distancia a ${s.nombre}: ${d.toFixed(2)} km`);
    if (d < minDistance) {
      minDistance = d;
      closest = s;
    }
  });

  console.log(`✅ Sede ganadora: ${closest.nombre}`);
  updateWhatsAppButton(closest);
}

function updateWhatsAppButton(sede: Sede) {
  const mainWaBtn = document.getElementById('main-wa-btn') as HTMLAnchorElement;
  if (!mainWaBtn) return;

  const message = encodeURIComponent(`¡Hola Gymboree ${sede.nombre}! 👋 Me gustaría recibir información.`);
  mainWaBtn.href = `https://wa.me/${sede.whatsapp}?text=${message}`;
  mainWaBtn.target = "_blank";

  const textSpan = mainWaBtn.querySelector('span');
  if (textSpan) {
    textSpan.innerText = `Chatea con Gymboree ${sede.nombre}`;
  }
}

// Ejecución inicial
detectLocation();

// ═══════════════════════════════════════════════════
// EFECTO ROMPECABEZAS: La imagen se descompone en piezas al hacer scroll
// ═══════════════════════════════════════════════════

const COLS = 5;
const ROWS = 4;

interface PuzzlePiece {
  el: HTMLDivElement;
  dx: number;
  dy: number;
  rot: number;
}

let puzzlePieces: PuzzlePiece[] = [];
let puzzleReady = false;
let ticking = false;

function buildPuzzle() {
  const container = document.querySelector('.hero-bg-image') as HTMLElement;
  const img = container?.querySelector('img') as HTMLImageElement;
  if (!container || !img || puzzleReady) return;

  img.style.opacity = '0';
  img.style.position = 'absolute';

  const W = container.offsetWidth;
  const H = container.offsetHeight;
  const pieceW = W / COLS;
  const pieceH = H / ROWS;
  const imgSrc = img.src;

  container.querySelectorAll('.puzzle-piece').forEach(el => el.remove());
  puzzlePieces = [];

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const piece = document.createElement('div');
      piece.className = 'puzzle-piece';

      Object.assign(piece.style, {
        position: 'absolute',
        left: `${col * pieceW}px`,
        top: `${row * pieceH}px`,
        width: `${pieceW}px`,
        height: `${pieceH}px`,
        backgroundImage: `url("${imgSrc}")`,
        backgroundSize: `${W}px ${H}px`,
        backgroundPosition: `-${col * pieceW}px -${row * pieceH}px`,
        backgroundRepeat: 'no-repeat',
        willChange: 'transform, opacity',
        zIndex: '1',
        border: '0.5px solid rgba(255,255,255,0.05)', // Borde casi invisible para separar cuadros
      });

      container.appendChild(piece);

      const angle = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 2;
      puzzlePieces.push({
        el: piece,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        rot: (Math.random() - 0.5) * 2,
      });
    }
  }

  puzzleReady = true;
}

function onScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      animatePuzzle();
      ticking = false;
    });
    ticking = true;
  }
}

window.addEventListener('load', () => {
  const img = document.querySelector('.hero-bg-image img') as HTMLImageElement;
  if (img?.complete) buildPuzzle();
  else img?.addEventListener('load', buildPuzzle);

  const wrapper = document.querySelector('.main-wrapper') as HTMLElement;
  if (wrapper) wrapper.addEventListener('scroll', onScroll);
  else window.addEventListener('scroll', onScroll);

  let resizeTimer: ReturnType<typeof setTimeout>;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      puzzleReady = false;
      buildPuzzle();
    }, 200);
  });
});

function animatePuzzle() {
  if (!puzzleReady || puzzlePieces.length === 0) return;

  const wrapper = document.querySelector('.main-wrapper') as HTMLElement;
  const scrollY = wrapper ? wrapper.scrollTop : window.scrollY;
  const progress = Math.min(1, scrollY / 500);

  puzzlePieces.forEach(({ el, dx, dy, rot }) => {
    if (progress <= 0) {
      el.style.transform = 'translate(0,0) rotate(0deg) scale(1)';
      el.style.opacity = '1';
      return;
    }

    const dist = progress * 600;
    const tx = dx * dist;
    const ty = dy * dist;
    const angle = rot * progress * 720;
    const scale = 1 + (Math.sin(progress * Math.PI) * 0.5) - (progress * 0.8);
    const opacity = 1 - (progress * progress * 1.2);

    el.style.transform = `translate(${tx}px, ${ty}px) rotate(${angle}deg) scale(${Math.max(0, scale)})`;
    el.style.opacity = `${Math.max(0, opacity)}`;
  });
}
