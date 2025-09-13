
// SECTION 02

const config = {
  maskRadius: 0.15,
  maskSpeed: 0.75,
  lerpFactor: 0.05,
  radiusLerpSpeed: 0.1,
  turbulenceIntensity: 0.075,
};

document.querySelectorAll(".inversion-lens").forEach((container) => {
  initHoverEffect(container);
});

function initHoverEffect(container) {
  let scene, camera, renderer, uniforms;

  const targetMouse = new THREE.Vector2(0.5, 0.5);
  const lerpedMouse = new THREE.Vector2(0.5, 0.5);
  let targetRadius = 0.0;

  let isInView = false;
  let isMouseInsideContainer = false;
  let lastMouseX = 0;
  let lastMouseY = 0;

  const img = container.querySelector("img");
  const loader = new THREE.TextureLoader();
  
  loader.load(img.src, (texture) => {
      setupScene(texture);
      //setupDebugger();
      setupEventListeners();
      animate();
    });


  const setupScene = (texture) => {
    const imageAspect = texture.image.width / texture.image.height;

    texture.minFilter = THREE.LinearMipMapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = 16;

    scene = new THREE.Scene();
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    uniforms = {
      u_texture: { value: texture },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
      u_time: { value: 0.0 },
      u_resolution: { value: new THREE.Vector2(width, height) },
      u_radius: { value: 0.0 },
      u_speed: { value: config.maskSpeed },
      u_imageAspect: { value: imageAspect },
      u_turbulenceIntensity: { value: config.turbulenceIntensity },
    };

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: window.vertexShader,
      fragmentShader: window.fragmentShader,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.capabilities.anisotropy = 16;

    container.appendChild(renderer.domElement);
  };

  const setupDebugger = () => {
    const gui = new lil.GUI();
    gui.domElement.style.position = "absolute";
    gui.domElement.style.top = "10px";
    gui.domElement.style.right = "10px";

    gui.add(config, "maskRadius", 0.05, 1.0, 0.01).name("Mask Radius");

    gui
      .add(config, "turbulenceIntensity", 0, 1.0, 0.001)
      .name("Turbulence")
      .onChange((value) => {
        if (uniforms) {
          uniforms.u_turbulenceIntensity.value = value;
        }
      });
  };

  const setupEventListeners = () => {
    document.addEventListener("mousemove", (e) => {
      updateCursorState(e.clientX, e.clientY);
    });

    window.addEventListener("scroll", () => {
      updateCursorState(lastMouseX, lastMouseY);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isInView = entry.isIntersecting;
          if (!isInView) {
            targetRadius = 0.0;
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(container);
  };

  const updateCursorState = (x, y) => {
    lastMouseX = x;
    lastMouseY = y;

    const rect = container.getBoundingClientRect();
    const inside =
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

    isMouseInsideContainer = inside;

    if (inside) {
      targetMouse.x = (x - rect.left) / rect.width;
      targetMouse.y = 1.0 - (y - rect.top) / rect.height;
      targetRadius = config.maskRadius;
    } else {
      targetRadius = 0.0;
    }
  };

  const animate = () => {
    requestAnimationFrame(animate);

    lerpedMouse.lerp(targetMouse, config.lerpFactor);

    if (uniforms) {
      uniforms.u_mouse.value.copy(lerpedMouse);
      uniforms.u_time.value += 0.01;
      uniforms.u_radius.value +=
        (targetRadius - uniforms.u_radius.value) * config.radiusLerpSpeed;
    }

    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  };
}

// TEXT DISTORTION
const turbulencemax = document.getElementById("text-turbulence-max");
const turbulence = document.getElementById("text-turbulence");
  let frame = 0;

  function animate() {
    frame += 0.02;
    const freq = 0.05 + Math.sin(frame) * 0.01;
    turbulencemax.setAttribute("baseFrequency", freq);
    turbulence.setAttribute("baseFrequency", freq);

    requestAnimationFrame(animate);
  }

  animate();

  // SECTION 03

  document.addEventListener("DOMContentLoaded", () => {
  //const lenis = new Lenis({ autoRaf: true });

  const container = document.querySelector(".trail-container");

  const config = {
    imageCount: 35,
    imageLifespan: 750,
    removalDelay: 50,
    mouseThreshold: 100,
    scrollThreshold: 50,
    idleCursorInterval: 300,
    inDuration: 750,
    outDuration: 1000,
    inEasing: "cubic-bezier(.07,.5,.5,1)",
    outEasing: "cubic-bezier(.87, 0, .13, 1)",
  };

  const images = Array.from(
    { length: config.imageCount },
    (_, i) => `assets/img${i + 1}.jpeg`
  );
  const trail = [];

  let mouseX = 0,
    mouseY = 0,
    lastMouseX = 0,
    lastMouseY = 0;
  let isMoving = false,
    isCursorInContainer = false;
  let lastRemovalTime = 0,
    lastSteadyImageTime = 0,
    lastScrollTime = 0;
  let isScrolling = false,
    scrollTicking = false;

  const isInContainer = (x, y) => {
    const rect = container.getBoundingClientRect();
    return (
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    );
  };

  const setInitialMousePos = (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    lastMouseX = mouseX;
    lastMouseY = mouseY;
    isCursorInContainer = isInContainer(mouseX, mouseY);
    document.removeEventListener("mouseover", setInitialMousePos, false);
  };
  document.addEventListener("mouseover", setInitialMousePos, false);

  const hasMovedEnough = () => {
    const distance = Math.sqrt(
      Math.pow(mouseX - lastMouseX, 2) + Math.pow(mouseY - lastMouseY, 2)
    );
    return distance > config.mouseThreshold;
  };

  const createTrailImage = () => {
    if (!isCursorInContainer) return;

    const now = Date.now();

    if (isMoving && hasMovedEnough()) {
      lastMouseX = mouseX;
      lastMouseY = mouseY;
      createImage();
      return;
    }

    if (!isMoving && now - lastSteadyImageTime >= config.idleCursorInterval) {
      lastSteadyImageTime = now;
      createImage();
    }
  };

  const createImage = () => {
    const img = document.createElement("img");
    img.classList.add("trail-img");

    const randomIndex = Math.floor(Math.random() * images.length);
    const rotation = (Math.random() - 0.5) * 50;
    img.src = images[randomIndex];

    const rect = container.getBoundingClientRect();
    const imageSize = 200; // match .trail-img width/height
    const offset = imageSize / 2;

    const relativeX = Math.min(Math.max(mouseX - rect.left, offset), rect.width - offset);
    const relativeY = Math.min(Math.max(mouseY - rect.top, offset), rect.height - offset);


    img.style.left = `${relativeX}px`;
    img.style.top = `${relativeY}px`;
    img.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(0)`;
    img.style.transition = `transform ${config.inDuration}ms ${config.inEasing}`;

    container.appendChild(img);

    setTimeout(() => {
      img.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(1)`;
    }, 10);

    trail.push({
      element: img,
      rotation: rotation,
      removeTime: Date.now() + config.imageLifespan,
    });
  };

  const createScrollTrailImage = () => {
    if (!isCursorInContainer) return;

    lastMouseX += (config.mouseThreshold + 10) * (Math.random() > 0.5 ? 1 : -1);
    lastMouseY += (config.mouseThreshold + 10) * (Math.random() > 0.5 ? 1 : -1);

    createImage();

    lastMouseX = mouseX;
    lastMouseY = mouseY;
  };

  const removeOldImages = () => {
    const now = Date.now();

    if (now - lastRemovalTime < config.removalDelay || trail.length === 0)
      return;

    const oldestImage = trail[0];
    if (now >= oldestImage.removeTime) {
      const imgToRemove = trail.shift();

      imgToRemove.element.style.transition = `transform ${config.outDuration}ms ${config.outEasing}`;
      imgToRemove.element.style.transform = `translate(-50%, -50%) rotate(${imgToRemove.rotation}deg) scale(0)`;

      lastRemovalTime = now;

      setTimeout(() => {
        if (imgToRemove.element.parentNode) {
          imgToRemove.element.parentNode.removeChild(imgToRemove.element);
        }
      }, config.outDuration);
    }
  };

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    isCursorInContainer = isInContainer(mouseX, mouseY);

    if (isCursorInContainer) {
      isMoving = true;
      clearTimeout(window.moveTimeout);
      window.moveTimeout = setTimeout(() => {
        isMoving = false;
      }, 100);
    }
  });

  window.addEventListener(
    "scroll",
    () => {
      isCursorInContainer = isInContainer(mouseX, mouseY);

      if (isCursorInContainer) {
        isMoving = true;
        lastMouseX += (Math.random() - 0.5) * 10;

        clearTimeout(window.scrollTimeout);
        window.scrollTimeout = setTimeout(() => {
          isMoving = false;
        }, 100);
      }
    },
    { passive: true }
  );

  window.addEventListener(
    "scroll",
    () => {
      const now = Date.now();
      isScrolling = true;

      if (now - lastScrollTime < config.scrollThreshold) return;

      lastScrollTime = now;

      if (!scrollTicking) {
        requestAnimationFrame(() => {
          if (isScrolling) {
            createScrollTrailImage();
            isScrolling = false;
          }
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    },
    { passive: true }
  );

  const animate = () => {
    createTrailImage();
    removeOldImages();
    requestAnimationFrame(animate);
  };
  animate();
});

//REVEAL EFFECTS
/*
// MARQUE
    gsap.from(".marquee-trial", 1, {
      bottom: "-10em",
      ease: "power4.out",
      delay: 1,
    });

    gsap.from(".marquee-trial-II", 1, {
      top: "-10em",
      ease: "power4.out",
      delay: 1,
    });
*/

/* -- Glow effect -- */
/*
const blob = document.getElementById("blob");
window.onpointermove = event => { 
  const { clientX, clientY } = event;
 
  blob.animate({
    left: `${clientX}px`,
    top: `${clientY}px`
  }, { duration: 3000, fill: "forwards" });
}
*/