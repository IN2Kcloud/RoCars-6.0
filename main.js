import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

window.addEventListener('load', () => {
  document.body.classList.remove('before-load');
});

document.querySelector('.loading').addEventListener('transitionend', (e) => {
  document.body.removeChild(e.currentTarget);
});

/* -- Glow effect -- */

const blob = document.getElementById("blob");
window.onpointermove = event => { 
  const { clientX, clientY } = event;
 
  blob.animate({
    left: `${clientX}px`,
    top: `${clientY}px`
  }, { duration: 3000, fill: "forwards" });
}
// JS to force remove scroll
document.body.style.overflow = 'hidden';
document.documentElement.style.overflow = 'hidden';

 
// SVG turbulence animation
const turbulencemax = document.getElementById("text-turbulence-max");
const turbulence = document.getElementById("text-turbulence");

let svgFrame = 0;
let lastSVGTime = 0;

function animateSVGFilter(time) {
  if (time - lastSVGTime > 100) {
    svgFrame += 0.02;
    const freq = 0.05 + Math.sin(svgFrame) * 0.01;
    turbulencemax?.setAttribute("baseFrequency", freq);
    turbulence?.setAttribute("baseFrequency", freq);
    lastSVGTime = time;
  }
  requestAnimationFrame(animateSVGFilter);
}
animateSVGFilter();

// LPtext animation



// Logo magnet + animation
const logo = document.querySelector('.logo-glitch-wrapper');
let logoBounds = null;
let logoTargetX = 0;
let logoTargetY = 0;
let logoCurrentX = 0;
let logoCurrentY = 0;
let logoGlitchTimeout;

function updateLogoBounds() {
  logoBounds = logo.getBoundingClientRect();
}
function applyLogoMagnet(x, y) {
  if (!logoBounds) return;
  const centerX = logoBounds.left + logoBounds.width / 2;
  const centerY = logoBounds.top + logoBounds.height / 2;
  const offsetX = x - centerX;
  const offsetY = y - centerY;
  logoTargetX = offsetX * 0.2;
  logoTargetY = offsetY * 0.2;
  const distance = Math.hypot(offsetX, offsetY);
}
function resetLogoMagnet() {
  logoTargetX = 0;
  logoTargetY = 0;
  logo.classList.remove('glitching');
}
function animateLogo() {
  logoCurrentX += (logoTargetX - logoCurrentX) * 0.1;
  logoCurrentY += (logoTargetY - logoCurrentY) * 0.1;
  logo.style.transform = `translate(calc(-50% + ${logoCurrentX}px), calc(-50% + ${logoCurrentY}px)) rotate(-20deg)`;
  requestAnimationFrame(animateLogo);
}
animateLogo();
logo.addEventListener('mouseenter', updateLogoBounds);
logo.addEventListener('mousemove', (e) => applyLogoMagnet(e.clientX, e.clientY));
logo.addEventListener('mouseleave', resetLogoMagnet);
logo.addEventListener('touchstart', (e) => {
  updateLogoBounds();
  applyLogoMagnet(e.touches[0].clientX, e.touches[0].clientY);
});
logo.addEventListener('touchmove', (e) => applyLogoMagnet(e.touches[0].clientX, e.touches[0].clientY));
logo.addEventListener('touchend', resetLogoMagnet);
logo.addEventListener('touchcancel', resetLogoMagnet);

// TV window magnet
const tv = document.getElementById('window');
let tvBounds = null;
function applyTVMagnet(x, y) {
  if (!tvBounds) return;
  const offsetX = x - (tvBounds.left + tvBounds.width / 2);
  const offsetY = y - (tvBounds.top + tvBounds.height / 2);
  tv.style.transform = `translate(${offsetX * 0.2}px, ${offsetY * 0.2}px)`;
}
function resetTVMagnet() {
  tv.style.transform = 'translate(0, 0)';
}
tv.addEventListener('mouseenter', () => {
  tvBounds = tv.getBoundingClientRect();
});
tv.addEventListener('mousemove', (e) => applyTVMagnet(e.clientX, e.clientY));
tv.addEventListener('mouseleave', resetTVMagnet);
tv.addEventListener('touchstart', (e) => {
  tvBounds = tv.getBoundingClientRect();
  applyTVMagnet(e.touches[0].clientX, e.touches[0].clientY);
});
tv.addEventListener('touchmove', (e) => applyTVMagnet(e.touches[0].clientX, e.touches[0].clientY));
tv.addEventListener('touchend', resetTVMagnet);
tv.addEventListener('touchcancel', resetTVMagnet);

// MENU animation
document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(CustomEase);
  CustomEase.create("hop", "M0,0 C0.354,0 0.464,0.133 0.498,0.502 0.532,0.872 0.651,1 1,1");
  const menuToggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".menu");
  const links = document.querySelectorAll(".link");
  const socialLinks = document.querySelectorAll(".socials p");
  let isAnimating = false;
  function splitTextIntoSpans(selector) {
    document.querySelectorAll(selector).forEach((element) => {
      let split = element.innerText.split("").map(char =>
        `<span>${char === " " ? "&nbsp;&nbsp;" : char}</span>`).join("");
      element.innerHTML = split;
    });
  }
  splitTextIntoSpans(".header h1");

  menuToggle.addEventListener("click", () => {
    if (isAnimating) return;
    isAnimating = true;
    const isOpen = menuToggle.classList.contains("opened");
    menuToggle.classList.toggle("opened", !isOpen);
    menuToggle.classList.toggle("closed", isOpen);

    if (!isOpen) {
      gsap.to(menu, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        ease: "hop",
        duration: 1.5,
        onStart: () => (menu.style.pointerEvents = "all"),
        onComplete: () => (isAnimating = false)
      });
      gsap.to(links, {
        y: 0, opacity: 1, stagger: 0.1, delay: 0.85, duration: 1, ease: "power3.out"
      });
      gsap.to(socialLinks, {
        y: 0, opacity: 1, stagger: 0.05, delay: 0.85, duration: 1, ease: "power3.out"
      });
      gsap.to(".video-wrapper", {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        ease: "hop", duration: 1.5, delay: 0.5
      });
      gsap.to(".header h1 span", {
        rotateY: 0, y: 0, scale: 1,
        stagger: 0.05, delay: 0.5, duration: 1.5, ease: "power4.out"
      });
    } else {
      gsap.to(menu, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
        ease: "hop",
        duration: 1.5,
        onComplete: () => {
          menu.style.pointerEvents = "none";
          gsap.set(menu, { clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)" });
          gsap.set(links, { y: 30, opacity: 0 });
          gsap.set(socialLinks, { y: 30, opacity: 0 });
          gsap.set(".video-wrapper", {
            clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)"
          });
          gsap.set(".header h1 span", {
            y: 500, rotateY: 90, scale: 0.8
          });
          isAnimating = false;
        }
      });
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const videos = [
    document.getElementById("window-video"),
    document.getElementById("glitch-video")
  ];

  videos.forEach(vid => {
    if (vid) {
      vid.play().catch(() => {
        vid.muted = true; // force mute if needed
        vid.play().catch(() => {});
      });
    }
  });
});
