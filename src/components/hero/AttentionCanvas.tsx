import { useEffect, useRef } from 'react';

/* ============================================================
   RÉGLAGES : ajuster ici la visualisation d'« attention ».
   Métaphore : une feature map clinique balayée par une onde
   d'attention ; les cellules « chaudes » expliquent la décision
   (nœud lumineux à droite) via de fines lignes de signal.
   ============================================================ */
const VIZ = {
  COLS: 14, // colonnes de la carte
  ROWS: 7, // lignes
  PERIOD: 10, // durée d'un balayage gauche→droite (secondes)
  SIGMA: 0.16, // largeur de l'onde d'attention (0–1)
  // Cellules « importantes » (colonne, ligne) d'où partent les liens explicatifs.
  HOT_CELLS: [
    [3, 1],
    [5, 4],
    [8, 2],
    [10, 5],
    [11, 3],
  ] as [number, number][],
  colors: {
    base: [38, 70, 120], // bleu nuit atténué (cellules froides)
    hot: [52, 197, 211], // cyan/teal médical (attention)
    line: [150, 138, 220], // violet « neuro » (liens)
    node: [120, 225, 235], // nœud de décision
  },
};

interface Cell {
  c: number;
  r: number;
  x: number;
  y: number;
  size: number;
  hot: boolean;
  colNorm: number;
}

export default function AttentionCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hotSet = new Set(VIZ.HOT_CELLS.map(([c, r]) => `${c}:${r}`));

    let w = 0;
    let h = 0;
    let cells: Cell[] = [];
    let node = { x: 0, y: 0, r: 0 };
    let running = false;
    let rafId = 0;
    let startTs: number | null = null;
    let inView = true;

    const rgba = (a: number[], alpha: number) => `rgba(${a[0]},${a[1]},${a[2]},${alpha})`;

    function layout() {
      const rect = canvas!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // plafonné pour la perf
      w = rect.width;
      h = rect.height;
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const padL = w * 0.06;
      const padT = h * 0.16;
      const padB = h * 0.16;
      const nodeZone = w * 0.16;
      const gridW = w - padL - nodeZone;
      const gridH = h - padT - padB;
      const gapX = gridW / VIZ.COLS;
      const gapY = gridH / VIZ.ROWS;
      const cellSize = Math.min(gapX, gapY) * 0.78;

      cells = [];
      for (let r = 0; r < VIZ.ROWS; r++) {
        for (let c = 0; c < VIZ.COLS; c++) {
          cells.push({
            c,
            r,
            x: padL + c * gapX + gapX / 2,
            y: padT + r * gapY + gapY / 2,
            size: cellSize,
            hot: hotSet.has(`${c}:${r}`),
            colNorm: VIZ.COLS > 1 ? c / (VIZ.COLS - 1) : 0,
          });
        }
      }
      node = { x: w - nodeZone * 0.45, y: padT + gridH / 2, r: Math.max(6, cellSize * 0.5) };
    }

    function roundRect(x: number, y: number, s: number, rad: number) {
      const half = s / 2;
      ctx!.beginPath();
      ctx!.moveTo(x - half + rad, y - half);
      ctx!.arcTo(x + half, y - half, x + half, y + half, rad);
      ctx!.arcTo(x + half, y + half, x - half, y + half, rad);
      ctx!.arcTo(x - half, y + half, x - half, y - half, rad);
      ctx!.arcTo(x - half, y - half, x + half, y - half, rad);
      ctx!.closePath();
    }

    const attentionAt = (colNorm: number, wave: number) => {
      const d = colNorm - wave;
      return Math.exp(-(d * d) / (2 * VIZ.SIGMA * VIZ.SIGMA));
    };

    function render(wave: number, pulse: number) {
      const g = ctx!;
      g.clearRect(0, 0, w, h);

      // 1) Liens explicatifs (cellules chaudes → nœud)
      for (const cell of cells) {
        if (!cell.hot) continue;
        const att = attentionAt(cell.colNorm, wave);
        g.strokeStyle = rgba(VIZ.colors.line, 0.1 + 0.55 * att);
        g.lineWidth = 1 + att * 1.2;
        g.beginPath();
        g.moveTo(cell.x, cell.y);
        const midX = (cell.x + node.x) / 2;
        g.quadraticCurveTo(midX, cell.y, node.x, node.y);
        g.stroke();
      }

      // 2) Cellules de la feature map
      for (const cell of cells) {
        const att = attentionAt(cell.colNorm, wave);
        const boost = cell.hot ? 1.0 : 0.42;
        let intensity = 0.1 + att * boost + (cell.hot ? 0.1 * att : 0);
        if (intensity > 1) intensity = 1;

        const mix = cell.hot ? Math.min(1, intensity * 1.15) : intensity * 0.7;
        const col = [
          Math.round(VIZ.colors.base[0] + (VIZ.colors.hot[0] - VIZ.colors.base[0]) * mix),
          Math.round(VIZ.colors.base[1] + (VIZ.colors.hot[1] - VIZ.colors.base[1]) * mix),
          Math.round(VIZ.colors.base[2] + (VIZ.colors.hot[2] - VIZ.colors.base[2]) * mix),
        ];
        if (intensity > 0.55) {
          g.shadowColor = rgba(VIZ.colors.hot, 0.5);
          g.shadowBlur = 12 * intensity;
        } else {
          g.shadowBlur = 0;
        }
        g.fillStyle = rgba(col, 0.14 + intensity * 0.5);
        roundRect(cell.x, cell.y, cell.size, cell.size * 0.32);
        g.fill();
      }
      g.shadowBlur = 0;

      // 3) Nœud de décision (halo + cœur, léger pulse)
      const grad = g.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.r * 4.5);
      grad.addColorStop(0, rgba(VIZ.colors.node, 0.55 + 0.2 * pulse));
      grad.addColorStop(0.35, rgba(VIZ.colors.node, 0.22 + 0.12 * pulse));
      grad.addColorStop(1, rgba(VIZ.colors.node, 0));
      g.fillStyle = grad;
      g.beginPath();
      g.arc(node.x, node.y, node.r * 4.5, 0, Math.PI * 2);
      g.fill();

      g.fillStyle = rgba(VIZ.colors.node, 0.9);
      g.beginPath();
      g.arc(node.x, node.y, node.r * (0.85 + 0.12 * pulse), 0, Math.PI * 2);
      g.fill();
    }

    function frame(ts: number) {
      if (!running) return;
      if (startTs === null) startTs = ts;
      const elapsed = (ts - startTs) / 1000;
      const wave = (elapsed % VIZ.PERIOD) / VIZ.PERIOD;
      const pulse = (Math.sin(elapsed * 1.5) + 1) / 2;
      render(wave, pulse);
      rafId = requestAnimationFrame(frame);
    }

    function start() {
      if (running || reduce || !inView || document.hidden) return;
      running = true;
      startTs = null;
      rafId = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    }

    // État statique élégant (reduced-motion) : onde figée sur la zone des cellules chaudes
    function drawStatic() {
      const avgHot =
        VIZ.HOT_CELLS.reduce((s, [c]) => s + (VIZ.COLS > 1 ? c / (VIZ.COLS - 1) : 0), 0) /
        VIZ.HOT_CELLS.length;
      render(avgHot, 0.5);
    }

    layout();
    drawStatic();
    if (!reduce) start();

    // Redimensionnement (debounce léger)
    let resizeT: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeT);
      resizeT = setTimeout(() => {
        layout();
        if (reduce || !running) drawStatic();
      }, 150);
    };
    window.addEventListener('resize', onResize);

    // Pause si l'onglet est masqué
    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener('visibilitychange', onVisibility);

    // Pause hors viewport
    let io: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            inView = e.isIntersecting;
            if (inView) start();
            else stop();
          }
        },
        { threshold: 0.05 },
      );
      io.observe(canvas);
    }

    return () => {
      stop();
      clearTimeout(resizeT);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      io?.disconnect();
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}
