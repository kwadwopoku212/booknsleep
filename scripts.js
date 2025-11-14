// scripts.js — BooknSleep interactive logic

// =====================
// COUNTDOWN TIMER
// =====================
const launchDate = new Date("2025-03-18T12:00:00Z");

function updateCountdown() {
  const now = new Date().getTime();
  const target = launchDate.getTime();
  const distance = target - now;
  const countdownEl = document.getElementById("countdown");

  if (!countdownEl) return; // Prevent errors if element not found

  if (distance < 0) {
    countdownEl.innerHTML = "<span>The system is awakening…</span>";
    return;
  }

  const days = Math.floor(distance / (1000*60*60*24));
  const hours = Math.floor((distance % (1000*60*60*24)) / (1000*60*60));
  const minutes = Math.floor((distance % (1000*60*60)) / (1000*60));
  const seconds = Math.floor((distance % (1000*60)) / 1000);

  let daysLabel = days === 1 ? "day" : "days";
  countdownEl.innerHTML =
    `<span>${days} ${daysLabel}:</span> <span>${String(hours).padStart(2,"0")}:${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}</span>`;
}
setInterval(updateCountdown, 1000);
updateCountdown();

// =====================
// TAGLINE TYPEWRITER
// =====================
const taglines = [
  "A super-intelligent OTA ecosystem is forming…",
  "Let AI plan your stay, perfectly tailored for you.",
  "Get ready for the future of travel booking."
];
let tagIndex = 0, typeIndex = 0, isDeleting = false;
const typeSpeed = 80, deleteSpeed = 40, pause = 1800;

function typeIt() {
  const el = document.getElementById("tagline-animated");
  if (!el) return;
  const text = taglines[tagIndex];
  if (isDeleting) {
    el.textContent = text.substring(0, typeIndex--);
  } else {
    el.textContent = text.substring(0, ++typeIndex);
  }
  if (!isDeleting && typeIndex === text.length) {
    isDeleting = true;
    setTimeout(typeIt, pause);
  } else if (isDeleting && typeIndex === 0) {
    isDeleting = false;
    tagIndex = (tagIndex + 1) % taglines.length;
    setTimeout(typeIt, 900);
  } else {
    setTimeout(typeIt, isDeleting ? deleteSpeed : typeSpeed);
  }
}
setTimeout(typeIt, 900);

// =====================
// PARTICLE BACKGROUND
// =====================
const canvas = document.getElementById("aiBackground");
if (canvas && canvas.getContext) {
  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const particles = [], count = 77;
  function randClamped(v=1){return (Math.random()-0.5)*v;}
  for(let i=0;i<count;i++) particles.push({
    x:Math.random()*canvas.width,
    y:Math.random()*canvas.height,
    vx:randClamped(.5),
    vy:randClamped(.5),
    r:Math.random()*2+1.4
  });

  function drawNetwork(){
    ctx.save();
    for(let i=0;i<count;i++)for(let j=i+1;j<count;j++){
      const dx=particles[i].x-particles[j].x,
            dy=particles[i].y-particles[j].y,
            dist=Math.sqrt(dx*dx+dy*dy);
      if(dist<85){
        ctx.strokeStyle=`rgba(255,215,0,${0.15-dist/610})`;
        ctx.lineWidth=1.1-dist/120;
        ctx.beginPath();
        ctx.moveTo(particles[i].x,particles[i].y);
        ctx.lineTo(particles[j].x,particles[j].y);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function animate(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(const p of particles){
      p.x+=p.vx;p.y+=p.vy;
      if(p.x<0||p.x>canvas.width) p.vx*=-1;
      if(p.y<0||p.y>canvas.height) p.vy*=-1;
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle="rgba(255,215,0,0.7)";
      ctx.shadowBlur=9;
      ctx.shadowColor="#ffd70088";
      ctx.fill();
    }
    drawNetwork();
    requestAnimationFrame(animate);
  }
  animate();
}

// =====================
// THEME TOGGLE & MODAL
// =====================
const themeBtn = document.querySelector('.toggle-theme');
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    const theme = document.body.getAttribute('data-theme')==='dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    themeBtn.innerHTML = theme==='dark' ? '🌙' : '☀️';
  });
}

// Modal close with background click or Escape key
const modalBg = document.getElementById('modal-bg');
if (modalBg) {
  modalBg.onclick = (e) => {
    if(e.target.id==='modal-bg') e.target.classList.remove('active');
  };
  window.addEventListener('keydown', (e)=>{
    if(e.key==='Escape') modalBg.classList.remove('active');
  });
}
