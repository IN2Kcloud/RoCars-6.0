import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import gsap from 'https://cdn.skypack.dev/gsap';

const canvas = document.getElementById('LPtextCanvas');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

const uniforms = {
  u_time: { value: 0 },
  u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  u_texture: { value: null },
  u_turbulenceIntensity: { value: 1.0 },
  u_hover: { value: 0.0 },
  u_transition: { value: 1.0 }
};

// === TEXT CANVAS ===
const textCanvas = document.createElement('canvas');
textCanvas.width = 1024;
textCanvas.height = 512;
const ctx = textCanvas.getContext('2d');

function drawText(text) {
  ctx.clearRect(0, 0, textCanvas.width, textCanvas.height);
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 200px "Bebas Neue", sans-serif';
  ctx.fillText(text, textCanvas.width / 2, textCanvas.height / 2);
}
drawText('ROCARS');

const textTexture = new THREE.CanvasTexture(textCanvas);
uniforms.u_texture.value = textTexture;

// === SHADERS ===
const vertexShader = `
  varying vec2 v_uv;
  void main() {
    v_uv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
precision highp float;

uniform sampler2D u_texture;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_turbulenceIntensity;
uniform float u_hover;
uniform float u_transition;

varying vec2 v_uv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float turbulence(vec2 p) {
  float t = 0.0;
  float w = 0.5;
  for (int i = 0; i < 6; i++) {
    t += abs(noise(p)) * w;
    p *= 2.5;
    w *= 0.5;
  }
  return t;
}

void main() {
  vec2 uv = v_uv;

  float d = (turbulence(uv * 20.0 + u_time * 2.0) - 0.5)
          * mix(0.05, 0.15, 1.0 - u_transition)
          * mix(1.0, 2.5, u_hover)
          * u_turbulenceIntensity;

  vec2 distortion = vec2(d, d);

  float glitchOffset = mix(0.002, 0.02, 1.0 - u_transition);

  vec4 texR = texture2D(u_texture, uv + distortion + vec2(-glitchOffset, 0.0));
  vec4 texG = texture2D(u_texture, uv + distortion);
  vec4 texB = texture2D(u_texture, uv + distortion + vec2(glitchOffset, 0.0));
  vec3 glitchColor = vec3(texR.r, texG.g, texB.b);

  float stripes = step(0.99, sin((uv.y + u_time * 3.0) * 50.0 + noise(vec2(u_time * 10.0, uv.y)) * 10.0));
  glitchColor *= 1.0 - mix(0.15, 0.45, 1.0 - u_transition) * stripes;

  float grain = noise(uv * u_resolution.xy * 0.25 + u_time * 10.0);
  glitchColor += grain * mix(0.03, 0.08, 1.0 - u_transition);

  gl_FragColor = vec4(glitchColor, 1.0);
}
`;

// === MATERIAL & MESH ===
const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader
});
const geometry = new THREE.PlaneGeometry(2, 2);
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// === ANIMATION LOOP ===
function animate(time) {
  uniforms.u_time.value = time * 0.001;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// === RESIZE ===
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
});

// === MOUSE INTERACTIVITY ===
window.addEventListener('mousemove', (e) => {
  const x = e.clientX / window.innerWidth;
  const y = 1.0 - e.clientY / window.innerHeight;
  const dx = x - 0.5;
  const dy = y - 0.5;
  const dist = Math.sqrt(dx * dx + dy * dy);
  uniforms.u_hover.value = Math.max(0.0, 1.0 - dist * 2.0);
});

// === WORD LOOP WITH TRANSITION ===
const words = ['ROCARS', 'TURBOS', 'MOTORS', 'DRIFTS'];
let currentIndex = 0;

function changeWord() {
  gsap.to(uniforms.u_transition, {
    value: 0,
    duration: 0.25,
    ease: 'power2.in',
    onComplete: () => {
      currentIndex = (currentIndex + 1) % words.length;
      drawText(words[currentIndex]);
      textTexture.needsUpdate = true;

      gsap.to(uniforms.u_transition, {
        value: 1,
        duration: 0.6,
        ease: 'power3.out'
      });
    }
  });
}
setInterval(changeWord, 3000);
