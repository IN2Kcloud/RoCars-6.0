window.addEventListener('load', () => {
  document.body.classList.remove('before-load');
});

document.querySelector('.loading').addEventListener('transitionend', (e) => {
  document.body.removeChild(e.currentTarget);
});

const container = document.querySelector(".container");
const items = document.querySelector(".items");
const indicator = document.querySelector(".indicator");
const itemElements = document.querySelectorAll(".item");
const previewImage = document.querySelector(".img-preview img");
const itemImages = document.querySelectorAll(".item img");

let isHorizontal = window.innerWidth <= 900;
let dimensions = {
  itemSize: 0,
  containerSize: 0,
  indicatorSize: 0,
};

let maxTranslate = 0;
let currentTranslate = 0;
let targetTranslate = 0;
let isClickMove = false;
let currentImageIndex = 0;
const activeItemOpacity = 0.3;

function lerp(start, end, factor) {
  return start + (end - start) * factor;
}

function updateDimensions() {
  isHorizontal = window.innerWidth <= 900;
  if (isHorizontal) {
    dimensions = {
      itemSize: itemElements[0].getBoundingClientRect().width,
      containerSize: items.scrollWidth,
      indicatorSize: indicator.getBoundingClientRect().width,
    };
  } else {
    dimensions = {
      itemSize: itemElements[0].getBoundingClientRect().height,
      containerSize: items.getBoundingClientRect().height,
      indicatorSize: indicator.getBoundingClientRect().height,
    };
  }
  return dimensions;
}

dimensions = updateDimensions();
maxTranslate = dimensions.containerSize - dimensions.indicatorSize;

function getItemInIndicator() {
  itemImages.forEach((img) => (img.style.opacity = "1"));

  const indicatorStart = -currentTranslate;
  const indicatorEnd = indicatorStart + dimensions.indicatorSize;

  let maxOverlap = 0;
  let selectedIndex = 0;

  itemElements.forEach((item, index) => {
    const itemStart = index * dimensions.itemSize;
    const itemEnd = itemStart + dimensions.itemSize;

    const overlapStart = Math.max(indicatorStart, itemStart);
    const overlapEnd = Math.min(indicatorEnd, itemEnd);
    const overlap = Math.max(0, overlapEnd - overlapStart);

    if (overlap > maxOverlap) {
      maxOverlap = overlap;
      selectedIndex = index;
    }
  });

  itemImages[selectedIndex].style.opacity = activeItemOpacity;
  return selectedIndex;
}

function updatePreviewImage(index) {
  if (currentImageIndex === index) return;
  currentImageIndex = index;

  const targetItem = itemElements[index].querySelector("img");
  const dataSrc = targetItem.dataset.src || targetItem.src;

  const previewImg = document.querySelector(".img-preview img");
  const previewVid = document.querySelector(".img-preview video");
  const previewIframe = document.querySelector(".img-preview iframe");

  // Hide all preview types
  previewImg.style.display = "none";
  previewVid.style.display = "none";
  previewIframe.style.display = "none";

  // Clear previous video/iframe sources
  previewVid.pause();
  previewVid.removeAttribute("src");
  previewIframe.removeAttribute("src");

  // Show appropriate preview
  if (dataSrc.match(/\.(mp4|webm|ogg)$/)) {
    previewVid.src = dataSrc;
    previewVid.style.display = "block";
    previewVid.load();
    previewVid.play();
  } else if (dataSrc.includes("youtube.com") || dataSrc.includes("youtu.be")) {
    const videoId = extractYouTubeId(dataSrc);
    if (videoId) {
      previewIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
      previewIframe.style.display = "block";
    }
  } else {
    previewImg.src = dataSrc;
    previewImg.style.display = "block";
  }
}

function extractYouTubeId(url) {
  const regex = /(?:youtube\.com.*v=|youtu\.be\/)([^?&]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

updatePreviewImage(currentImageIndex);


function animate() {
  const lerpFactor = isClickMove ? 0.05 : 0.075;
  currentTranslate = lerp(currentTranslate, targetTranslate, lerpFactor);

  if (Math.abs(currentTranslate - targetTranslate) > 0.01) {
    const transform = isHorizontal
      ? `translateX(${currentTranslate}px)`
      : `translateY(${currentTranslate}px)`;
    items.style.transform = transform;

    const activeIndex = getItemInIndicator();
    updatePreviewImage(activeIndex);
  } else {
    isClickMove = false;
  }

  requestAnimationFrame(animate);
}

container.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    isClickMove = false;

    let delta;
    delta = e.deltaY;

    const scrollVelocity = Math.min(Math.max(delta * 0.5, -20), 20);

    targetTranslate = Math.min(
      Math.max(targetTranslate - scrollVelocity, -maxTranslate),
      0
    );
  },
  { passive: false }
);

let touchStartY = 0;
container.addEventListener("touchstart", (e) => {
  if (isHorizontal) {
    touchStartY = e.touches[0].clientY;
  }
});

container.addEventListener(
  "touchmove",
  (e) => {
    if (isHorizontal) {
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY;

      const delta = deltaY;
      const scrollVelocity = Math.min(Math.max(delta * 0.5, -20), 20);

      targetTranslate = Math.min(
        Math.max(targetTranslate - scrollVelocity, -maxTranslate),
        0
      );

      touchStartY = touchY;
      e.preventDefault();
    }
  },
  { passive: false }
);

itemElements.forEach((item, index) => {
  item.addEventListener("click", () => {
    // Update preview image directly
    currentImageIndex = index;
    updatePreviewImage(index);

    // Optional: move indicator to that image (if you want it)
    isClickMove = true;
    targetTranslate =
      -index * dimensions.itemSize +
      (dimensions.indicatorSize - dimensions.itemSize) / 2;
    targetTranslate = Math.max(Math.min(targetTranslate, 0), -maxTranslate);
  });
});


window.addEventListener("resize", () => {
  dimensions = updateDimensions();
  const newMaxTranslate = dimensions.containerSize - dimensions.indicatorSize;

  targetTranslate = Math.min(Math.max(targetTranslate, -newMaxTranslate), 0);
  currentTranslate = targetTranslate;

  const transform = isHorizontal
    ? `translateX(${currentTranslate}px)`
    : `translateY(${currentTranslate}px)`;
  items.style.transform = transform;
});

itemImages[0].style.opacity = activeItemOpacity;
updatePreviewImage(0);
animate();

// Initial Reveal Animation using GSAP
window.addEventListener("load", () => {
  const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

  // Set initial states
  gsap.set(".container", { opacity: 0 });
  gsap.set("nav p", { y: -30, opacity: 0 });
  gsap.set(".site-info p", { y: 30, opacity: 0 });
  gsap.set(".img-preview", { scale: 1.1, opacity: 0 });
  gsap.set(".minimap", { x: 100, opacity: 0 });
  gsap.set(".indicator", { scaleY: 0 });

  tl.to(".container", { opacity: 1, duration: 0.3 })

    // Nav reveal
    .to("nav p", {
      y: 0,
      opacity: 1,
      stagger: 0.1,
      duration: 0.6,
    }, "<0.2")

    // Site info
    .to(".site-info p", {
      y: 0,
      opacity: 1,
      stagger: 0.1,
      duration: 0.6
    }, "-=0.4")

    // Image reveal with blend
    .to(".img-preview", {
      scale: 1,
      opacity: 1,
      duration: 0.8
    }, "-=0.4")

    // Minimap slide in
    .to(".minimap", {
      x: 0,
      opacity: 1,
      duration: 0.6
    }, "-=0.5")

    // Indicator bounce
    .to(".indicator", {
      scaleY: 1,
      duration: 0.4,
      ease: "back.out(1.7)"
    }, "-=0.3");
});

window.addEventListener("load", () => {
  const details = document.querySelector(".car-details");
  details.classList.add("show");
});
