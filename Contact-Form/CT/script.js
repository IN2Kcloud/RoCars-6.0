document.addEventListener("DOMContentLoaded", function () {
  const toggleButton = document.querySelector("#toggle");
  const backButton = document.querySelector("#back");
  const canvas = document.getElementById("LPtextCanvas");
  const body = document.body;
  
  // Open overlay
  toggleButton.addEventListener("click", () => {
    gsap.to(canvas, {
      left: "66%",
      duration: 0.3,
      ease: "power2.out"
    });
  
    gsap.to(".overlay", {
      opacity: 1,
      duration: 0.3,
      pointerEvents: "all"
    });
  
    body.classList.add("overlay-open");
  });
  
  // Close overlay
  backButton.addEventListener("click", () => {
    gsap.to(canvas, {
      left: "50%",
      duration: 0.3,
      ease: "power2.inOut"
    });
  
    gsap.to(".overlay", {
      opacity: 0,
      duration: 0.3,
      pointerEvents: "none"
    });
  
    body.classList.remove("overlay-open");
  });
});