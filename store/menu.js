const toggleBtn = document.getElementById('menu-toggle');
const menuWrapper = document.getElementById('menu-wrapper');
const filter = document.querySelector('.menudisp');

let isOpen = false;

toggleBtn.addEventListener('click', () => {
	isOpen = !isOpen;
	menuWrapper.classList.toggle('open', isOpen);

	if (isOpen) {
		// Ultra-smooth open animation
		gsap.timeline()
			.to(filter, {
				attr: { scale: 0 },
				duration: 0,
			})
			.to(filter, {
				attr: { scale: 60 },
				duration: 0.1,
				ease: "none"
			})
			.to(filter, {
				attr: { scale: 90 },
				duration: 0.1,
				ease: "none"
			})
			.to(filter, {
				attr: { scale: 30 },
				duration: 0.1,
				ease: "none"
			})
			.to(filter, {
				attr: { scale: 0 },
				duration: 0.5,
				ease: "power4.out"
			});

		// ✅ Add menu-open class to body
		document.body.classList.add('menu-open');
	} else {
		// Ultra-smooth close animation
		gsap.timeline()
			.to(filter, {
				attr: { scale: 0 },
				duration: 0,
			})
			.to(filter, {
				attr: { scale: 50 },
				duration: 0.3,
				ease: "none"
			})
			.to(filter, {
				attr: { scale: 30 },
				duration: 0.3,
				ease: "none"
			})
			.to(filter, {
				attr: { scale: 70 },
				duration: 0.3,
				ease: "none"
			})
			.to(filter, {
				attr: { scale: 0 },
				duration: 0.5,
				ease: "expo.out"
			});

		// ✅ Remove menu-open class from body
		document.body.classList.remove('menu-open');
	}
});




const turbulence = document.querySelector('#turbulence');
  let frame = 0;

  function animateDistortion() {
    frame += 0.005;
    const bfX = 0.01 + Math.sin(frame) * 0.005;
    const bfY = 0.01 + Math.cos(frame) * 0.005;

    turbulence.setAttribute('baseFrequency', `${bfX} ${bfY}`);

    requestAnimationFrame(animateDistortion);
  }

  animateDistortion();


  const textTurbulence = document.querySelector('#text-turbulence');
  let distortionFrame = 0;

  function animateTextDistortion() {
    distortionFrame += 0.01;
    const freqX = 0.015 + Math.sin(distortionFrame) * 0.005;
    const freqY = 0.02 + Math.cos(distortionFrame) * 0.005;

    textTurbulence.setAttribute('baseFrequency', `${freqX} ${freqY}`);
    requestAnimationFrame(animateTextDistortion);
  }

  // Start immediately
  animateTextDistortion();