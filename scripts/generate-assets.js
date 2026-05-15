/**
 * TheBharatAI – Asset Generator
 * File: scripts/generate-assets.js
 * Run:  node scripts/generate-assets.js
 *
 * Generates:
 *   icons/icon-72.png  … icon-512.png   (PWA icons)
 *   og-image.png                         (1200×630 social card)
 *
 * Pure pngjs — zero native binaries — works on Windows/Mac/Linux.
 */
'use strict';

const { PNG } = require('pngjs');
const fs      = require('fs');
const path    = require('path');
const ROOT    = path.join(__dirname, '..');

// ─── Colours ────────────────────────────────────────────────────
const NAVY  = [15,  23,  41  ];
const SF    = [255, 107, 53  ];   // #FF6B35 saffron
const TEAL  = [0,   200, 150 ];   // #00C896
const GOLD  = [245, 166, 35  ];   // #F5A623

// ─── Low-level drawing ──────────────────────────────────────────
function lerp(a, b, t) { return a + (b - a) * t; }

function setPixel(buf, W, H, x, y, r, g, b, a) {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (Math.round(y) * W + Math.round(x)) * 4;
  buf[i] = r; buf[i+1] = g; buf[i+2] = b; buf[i+3] = (a ?? 255);
}

function fillRoundRect(buf, W, H, x0, y0, w, h, r, c) {
  for (let y = y0; y < y0+h && y < H; y++) {
    for (let x = x0; x < x0+w && x < W; x++) {
      if (x < 0 || y < 0) continue;
      const cx = x-x0, cy = y-y0;
      const corner =
        (cx < r && cy < r   && Math.hypot(cx-r,   cy-r)   > r) ||
        (cx>=w-r && cy < r  && Math.hypot(cx-(w-r),cy-r)   > r) ||
        (cx < r && cy>=h-r  && Math.hypot(cx-r,   cy-(h-r))> r) ||
        (cx>=w-r && cy>=h-r && Math.hypot(cx-(w-r),cy-(h-r))>r);
      if (!corner) setPixel(buf,W,H,x,y,c[0],c[1],c[2]);
    }
  }
}

function drawLine(buf, W, H, x1, y1, x2, y2, thick, c) {
  const steps = Math.ceil(Math.max(Math.abs(x2-x1),Math.abs(y2-y1)) * 3);
  for (let i = 0; i <= steps; i++) {
    const t = i/steps;
    const px = lerp(x1,x2,t), py = lerp(y1,y2,t);
    for (let dy = -thick; dy <= thick; dy++)
      for (let dx = -thick; dx <= thick; dx++)
        if (dx*dx+dy*dy <= thick*thick)
          setPixel(buf,W,H,Math.round(px+dx),Math.round(py+dy),c[0],c[1],c[2]);
  }
}

function fillCircle(buf, W, H, cx, cy, r, c) {
  for (let y = Math.floor(cy-r); y <= Math.ceil(cy+r); y++)
    for (let x = Math.floor(cx-r); x <= Math.ceil(cx+r); x++)
      if (Math.hypot(x-cx,y-cy) <= r)
        setPixel(buf,W,H,x,y,c[0],c[1],c[2]);
}

function fillRect(buf, W, H, x0, y0, w, h, c) {
  for (let y = y0; y < y0+h && y < H; y++)
    for (let x = x0; x < x0+w && x < W; x++)
      setPixel(buf,W,H,x,y,c[0],c[1],c[2]);
}

// ─── Icon generator ──────────────────────────────────────────────
function makeIcon(size) {
  const png = new PNG({ width: size, height: size });
  const buf = png.data;
  buf.fill(0);

  // Navy background with rounded corners
  fillRoundRect(buf, size, size, 0, 0, size, size, Math.round(size*0.22), NAVY);

  // Logo: stylised "A" for BharatAI
  const pad = size * 0.18, inner = size - pad*2;
  const thick = Math.max(2, Math.round(size*0.057));

  const tx = size/2,           ty = pad + inner*0.06;
  const blx = pad+inner*0.02,  bly = pad + inner*0.90;
  const brx = pad+inner*0.98,  bry = bly;

  drawLine(buf, size, size, tx, ty, blx, bly, thick, SF);
  drawLine(buf, size, size, tx, ty, brx, bry, thick, SF);

  const r = 0.56;
  const cbY  = lerp(ty, bly, r),  cbX1 = lerp(tx, blx, r), cbX2 = lerp(tx, brx, r);
  drawLine(buf, size, size, cbX1, cbY, cbX2, cbY, Math.max(1, Math.round(thick*0.58)), GOLD);

  fillCircle(buf, size, size, tx, ty + (bly-ty)*0.45, Math.max(2, Math.round(size*0.075)), TEAL);

  return PNG.sync.write(png);
}

// ─── OG Image 1200×630 ──────────────────────────────────────────
function makeOG() {
  const W = 1200, H = 630;
  const png = new PNG({ width: W, height: H });
  const buf = png.data;
  buf.fill(0);

  // Background gradient
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const t = x/W*0.35 + y/H*0.65;
      const r = Math.round(lerp(15,28,t));
      const g = Math.round(lerp(23,38,t));
      const b = Math.round(lerp(41,68,t));
      setPixel(buf,W,H,x,y,r,g,b);
    }

  // Dot grid
  for (let y = 36; y < H; y += 56) for (let x = 36; x < W; x += 56) {
    setPixel(buf,W,H,x,y,32,48,82); setPixel(buf,W,H,x+1,y,32,48,82);
    setPixel(buf,W,H,x,y+1,32,48,82);
  }

  // Glow – saffron left
  for (let y = 0; y < H; y++) for (let x = 0; x < 480; x++) {
    const d = Math.hypot(x-160, y-200);
    if (d < 260) {
      const i = (y*W+x)*4, k = Math.pow(Math.max(0,1-d/260),2)*0.1;
      buf[i]   = Math.min(255, buf[i]   + Math.round(SF[0]*k));
      buf[i+1] = Math.min(255, buf[i+1] + Math.round(SF[1]*k));
      buf[i+2] = Math.min(255, buf[i+2] + Math.round(SF[2]*k));
    }
  }
  // Glow – teal right
  for (let y = 200; y < H; y++) for (let x = 720; x < W; x++) {
    const d = Math.hypot(x-1060, y-490);
    if (d < 240) {
      const i = (y*W+x)*4, k = Math.pow(Math.max(0,1-d/240),2)*0.08;
      buf[i]   = Math.min(255, buf[i]   + Math.round(TEAL[0]*k));
      buf[i+1] = Math.min(255, buf[i+1] + Math.round(TEAL[1]*k));
      buf[i+2] = Math.min(255, buf[i+2] + Math.round(TEAL[2]*k));
    }
  }

  // Logo
  const lx=130, ly=130, lw=200, lh=330;
  const tx=lx+lw/2,ty=ly, blx=lx,bly=ly+lh, brx=lx+lw,bry=bly;
  drawLine(buf,W,H,tx,ty,blx,bly,22,SF);
  drawLine(buf,W,H,tx,ty,brx,bry,22,SF);
  const cbY=lerp(ty,bly,0.55), cbX1=lerp(tx,blx,0.55), cbX2=lerp(tx,brx,0.55);
  drawLine(buf,W,H,cbX1,cbY,cbX2,cbY,12,GOLD);
  fillCircle(buf,W,H,tx,ty+(bly-ty)*0.44,26,TEAL);

  // Text blocks (visual placeholders – white/dim bars)
  fillRect(buf,W,H,420,158,680,5,SF);           // accent line
  fillRect(buf,W,H,420,180,620,56,NAVY);
  // "The" bar
  fillRect(buf,W,H,420,182,110,20,[200,210,225]);
  // "BharatAI" bar (large white)
  fillRect(buf,W,H,540,182,420,48,[255,255,255]);
  // tagline bar
  fillRect(buf,W,H,420,250,580,24,[160,175,200]);
  fillRect(buf,W,H,420,284,480,18,[110,128,160]);
  fillRect(buf,W,H,420,310,420,18,[90,108,145]);

  // Stat badges
  [[420,350,180,44,SF],[616,350,200,44,TEAL],[832,350,180,44,GOLD]].forEach(([bx,by,bw,bh,c])=>{
    fillRect(buf,W,H,bx,by,bw,bh,[
      Math.round(NAVY[0]+c[0]*0.12), Math.round(NAVY[1]+c[1]*0.12), Math.round(NAVY[2]+c[2]*0.12)]);
    fillRect(buf,W,H,bx,by,bw,3,c);
    fillRect(buf,W,H,bx+10,by+12,Math.round(bw*0.55),12,c);
    fillRect(buf,W,H,bx+10,by+30,Math.round(bw*0.35),8,[100,115,145]);
  });

  // URL bar
  fillRect(buf,W,H,420,424,360,28,[NAVY[0]+8,NAVY[1]+12,NAVY[2]+20]);
  fillRect(buf,W,H,420,424,8,28,SF);
  fillRect(buf,W,H,434,432,160,12,[80,100,140]);

  // Bottom gradient bar
  for (let x = 0; x < W; x++) {
    const t = x/W;
    const r = t<0.33?SF[0]:t<0.66?Math.round(lerp(SF[0],GOLD[0],(t-0.33)/0.33)):Math.round(lerp(GOLD[0],TEAL[0],(t-0.66)/0.34));
    const g = t<0.33?SF[1]:t<0.66?Math.round(lerp(SF[1],GOLD[1],(t-0.33)/0.33)):Math.round(lerp(GOLD[1],TEAL[1],(t-0.66)/0.34));
    const b = t<0.33?SF[2]:t<0.66?Math.round(lerp(SF[2],GOLD[2],(t-0.33)/0.33)):Math.round(lerp(GOLD[2],TEAL[2],(t-0.66)/0.34));
    for (let y = H-7; y < H; y++) setPixel(buf,W,H,x,y,r,g,b);
  }
  // Left accent bar
  fillRect(buf,W,H,0,0,6,H,SF);

  return PNG.sync.write(png);
}

// ─── Run ─────────────────────────────────────────────────────────
console.log('\n  🎨  TheBharatAI Asset Generator\n');

// Icons
const iconsDir = path.join(ROOT,'icons');
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir,{recursive:true});

[72,96,128,144,152,192,384,512].forEach(s => {
  const buf  = makeIcon(s);
  const file = path.join(iconsDir,`icon-${s}.png`);
  fs.writeFileSync(file, buf);
  console.log(`  ✅  icons/icon-${s}.png  (${(buf.length/1024).toFixed(1)} KB)`);
});

// OG image
const ogBuf = makeOG();
fs.writeFileSync(path.join(ROOT,'og-image.png'), ogBuf);
console.log(`  ✅  og-image.png  (${(ogBuf.length/1024).toFixed(1)} KB)`);

console.log('\n  ✨  All assets ready. Run: npm run dev\n');