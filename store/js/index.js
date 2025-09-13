// TEXT DESTORTION

const turb = document.querySelector('feTurbulence');
  let frame = 0;

  function animateDistortion() {
    frame += 1;
    const freq = 0.01 + Math.sin(frame * 0.02) * 0.005; // wavy variation
    turb.setAttribute('baseFrequency', freq + ' ' + freq);
    requestAnimationFrame(animateDistortion);
  }

  animateDistortion();

/*
 * Linear interpolation
 */
const lerp = (a, b, n) => (1 - n) * a + n * b;

/**
 * Gets the cursor position
 */
const getCursorPos = ev => ({ x: ev.clientX, y: ev.clientY });

/**
 * Map number x from range [a, b] to [c, d] 
 */
const map = (x, a, b, c, d) => (x - a) * (d - c) / (b - a) + c;

/**
 * Distance between point A(x1,y1) and B(x2,y2)
 */
const distance = (x1, x2, y1, y2) => Math.hypot(x1 - x2, y1 - y2);

/**
 * Calculates the viewport size
 */
const calcWinsize = () => ({
    width: window.innerWidth,
    height: window.innerHeight
});

// Viewport size
let winsize = calcWinsize();
window.addEventListener('resize', () => winsize = calcWinsize());

// Track the cursor position
let cursor = { x: winsize.width / 2, y: winsize.height / 2 };
let cachedCursor = { ...cursor };
window.addEventListener('mousemove', ev => cursor = getCursorPos(ev));

/**
 * Class representing an SVG image that follows the cursor 
 * and gets "distorted" as the cursor moves faster or oscillates while idle.
 */
class SVGImageFilterEffect {
    DOM = {
        el: null,
        image: null,
        feDisplacementMapEl: null,
    };

    defaults = {
        valuesFromTo: {
            transform: {
                x: [-120, 120],
                y: [-120, 120],
                rz: [-10, 10]
            },
            displacementScale: [0, 400]
        },
        amt: {
            transform: 0.1,
            displacementScale: 0.06
        },
    };

    imgValues = {
        imgTransforms: { x: 0, y: 0, rz: 0 },
        displacementScale: 0
    };

    isIdle = false;
    idleTimer = 0;
    idleFrequency = 0.1;  // Controls speed of idle wave
    idleBase = 80;
    idleRange = 40;

    constructor(DOM_el, options) {
        this.DOM.el = DOM_el;
        this.DOM.image = this.DOM.el.querySelector('image');
        this.DOM.feDisplacementMapEl = this.DOM.el.querySelector('feDisplacementMap');
        this.options = Object.assign(this.defaults, options);
        requestAnimationFrame(() => this.render());
    }

    render() {
        // Interpolated cursor transform
        this.imgValues.imgTransforms.x = lerp(
            this.imgValues.imgTransforms.x,
            map(cursor.x, 0, winsize.width, this.options.valuesFromTo.transform.x[0], this.options.valuesFromTo.transform.x[1]),
            this.options.amt.transform
        );
        this.imgValues.imgTransforms.y = lerp(
            this.imgValues.imgTransforms.y,
            map(cursor.y, 0, winsize.height, this.options.valuesFromTo.transform.y[0], this.options.valuesFromTo.transform.y[1]),
            this.options.amt.transform
        );
        this.imgValues.imgTransforms.rz = lerp(
            this.imgValues.imgTransforms.rz,
            map(cursor.x, 0, winsize.width, this.options.valuesFromTo.transform.rz[0], this.options.valuesFromTo.transform.rz[1]),
            this.options.amt.transform
        );

        this.DOM.el.style.transform = `translateX(${this.imgValues.imgTransforms.x}px) translateY(${this.imgValues.imgTransforms.y}px) rotateZ(${this.imgValues.imgTransforms.rz}deg)`;

        const cursorTravelledDistance = distance(cachedCursor.x, cursor.x, cachedCursor.y, cursor.y);

        if (cursorTravelledDistance < 1.5) {
            this.isIdle = true;
            this.idleTimer += 1;

            const idleDistortion = this.idleBase + Math.sin(this.idleTimer * this.idleFrequency) * this.idleRange;

            this.imgValues.displacementScale = lerp(
                this.imgValues.displacementScale,
                idleDistortion,
                this.options.amt.displacementScale
            );
        } else {
            this.isIdle = false;
            this.idleTimer = 0;

            const motionDistortion = map(
                cursorTravelledDistance,
                0, 200,
                this.options.valuesFromTo.displacementScale[0],
                this.options.valuesFromTo.displacementScale[1]
            );

            this.imgValues.displacementScale = lerp(
                this.imgValues.displacementScale,
                motionDistortion,
                this.options.amt.displacementScale
            );
        }

        this.DOM.feDisplacementMapEl.scale.baseVal = this.imgValues.displacementScale;

        cachedCursor = { ...cursor };

        requestAnimationFrame(() => this.render());
    }
}

// Initialize effect
new SVGImageFilterEffect(document.querySelector('#theSVG'), {
    valuesFromTo: {
        transform: {
            x: [-40, 40],
            y: [-40, 40],
            rz: [-5, 5]
        },
        displacementScale: [30, 200]
    },
    amt: {
        transform: 0.1,
        displacementScale: 0.04
    }
});

//REVEAL EFFECTS

// MARQUE
    gsap.from(".marquee", 1, {
      bottom: "-10em",
      ease: "power4.out",
      delay: 1,
    });

    gsap.from(".marquee-II", 1, {
      top: "-10em",
      ease: "power4.out",
      delay: 1,
    });