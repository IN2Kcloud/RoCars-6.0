document.documentElement.className="js";var supportsCssVars=function(){var e,t=document.createElement("style");return t.innerHTML="root: { --tmp-var: bold; }",document.head.appendChild(t),e=!!(window.CSS&&window.CSS.supports&&window.CSS.supports("font-weight","var(--tmp-var)")),t.parentNode.removeChild(t),e};supportsCssVars()||alert("Please view this demo in a modern browser that supports CSS Variables.");

// External Dependencies
import { gsap } from 'https://esm.sh/gsap';
import Splitting from 'https://cdn.skypack.dev/splitting';
import imagesLoaded from 'https://esm.sh/imagesloaded';

// Utility Functions
const preloadImages = (selector = 'img') => {
    return new Promise(resolve => {
        imagesLoaded(document.querySelectorAll(selector), { background: true }, resolve);
    });
};

const map = (x, a, b, c, d) => (x - a) * (d - c) / (b - a) + c;
const lerp = (a, b, n) => (1 - n) * a + n * b;
const calcWinsize = () => ({ width: window.innerWidth, height: window.innerHeight });
const getMousePos = e => ({ x: e.clientX, y: e.clientY });

// MouseMoveController Class
let winsize = calcWinsize();
window.addEventListener('resize', () => winsize = calcWinsize());

let mousepos = { x: winsize.width / 2, y: winsize.height / 2 };
window.addEventListener('mousemove', ev => mousepos = getMousePos(ev));

class MouseMoveController {
    constructor(el, boundaries) {
        this.DOM = { el };
        this.boundaries = boundaries;
        this.transformVals = { tx: 0, ty: 0, r: 0 };
    }

    start() {
        if (!this.requestId) {
            this.requestId = requestAnimationFrame(() => this.render());
        }
    }

    stop() {
        if (this.requestId) {
            window.cancelAnimationFrame(this.requestId);
            this.requestId = undefined;
        }
    }

    render() {
        this.requestId = undefined;
        this.transformVals.tx = lerp(this.transformVals.tx, map(mousepos.x, 0, winsize.width, -this.boundaries.x, this.boundaries.x), 0.07);
        this.transformVals.ty = lerp(this.transformVals.ty, map(mousepos.y, 0, winsize.height, -this.boundaries.y, this.boundaries.y), 0.07);
        this.transformVals.r = lerp(this.transformVals.r, map(mousepos.x, 0, winsize.width, -this.boundaries.r || 0, this.boundaries.r || 0), 0.07);

        gsap.set(this.DOM.el, {
            x: this.transformVals.tx,
            y: this.transformVals.ty,
            rotation: this.transformVals.r
        });

        this.start();
    }
}

// Circle Class
class Circle {
    constructor(DOM_el) {
        this.DOM = { el: DOM_el };
        gsap.set(this.DOM.el, { opacity: 0 });
        const boundaries = { x: -100, y: -100 };
        this.mouseMoveController = new MouseMoveController(this.DOM.el, boundaries);
    }

    show() { gsap.to(this.DOM.el, { duration: 0.8, opacity: 1 }); }
    hide() { gsap.to(this.DOM.el, { duration: 0.8, opacity: 0 }); }
    startMouseMoveMotion() { this.mouseMoveController.start(); }
    stopMouseMoveMotion() { this.mouseMoveController.stop(); }
}

// MenuItem Class
class MenuItem {
    constructor(DOM_el) {
        this.DOM = { el: DOM_el };
        this.DOM.el.dataset.splitting = '';

        this.DOM.imgStack = document.getElementById(this.DOM.el.dataset.stack);
        this.DOM.stackImages = this.DOM.imgStack.querySelectorAll('img');

        this.DOM.content = document.getElementById(this.DOM.el.dataset.content);
        this.DOM.contentTitle = this.DOM.content.querySelector('.content__title');
        this.DOM.contentTitle.dataset.splitting = '';
        this.DOM.contentText = this.DOM.content.querySelector('.content__text');

        const boundariesItem = { x: gsap.utils.random(-10, 10), y: gsap.utils.random(-15, 15), r: gsap.utils.random(-2, 2) };
        this.mouseMoveItemController = new MouseMoveController(this.DOM.el, boundariesItem);
        const boundariesStack = { x: 50, y: 100 };
        this.mouseMoveStackController = new MouseMoveController(this.DOM.imgStack, boundariesStack);

        Splitting();
        this.DOM.chars = this.DOM.el.querySelectorAll('.char');
        this.DOM.contentTitleChars = this.DOM.contentTitle.querySelectorAll('.char');
    }

    showImageStack() {
        gsap.killTweensOf(this.DOM.imgStack);
        gsap.timeline()
            .set(this.DOM.imgStack, { opacity: 0.5 }, 0.04)
            .set(this.DOM.stackImages, { x: () => `${gsap.utils.random(-8, 8)}%` }, 0.04)
            .set(this.DOM.imgStack, { opacity: 0.2 }, '+=0.04')
            .set(this.DOM.stackImages, {
                x: () => `${gsap.utils.random(-8, 8)}%`,
                rotation: () => gsap.utils.random(-2, 2)
            }, '+=0.04')
            .set(this.DOM.imgStack, { opacity: 0.5 }, '+=0.04')
            .set(this.DOM.stackImages, {
                x: '0%', y: '0%', rotation: 0
            }, '+=0.04');
    }

    hideImageStack() {
        gsap.killTweensOf(this.DOM.imgStack);
        gsap.set(this.DOM.imgStack, { opacity: 0 });
    }

    glitch() {
        gsap.killTweensOf(this.DOM.imgStack);
        gsap.timeline()
            .set(this.DOM.imgStack, { opacity: 0.2 }, 0.04)
            .set(this.DOM.stackImages, {
                x: () => `+=${gsap.utils.random(-15, 15)}%`,
                y: () => `+=${gsap.utils.random(-15, 15)}%`,
                opacity: () => gsap.utils.random(1, 10) / 10
            }, 0.08)
            .set(this.DOM.imgStack, { opacity: 0.4 }, '+=0.04')
            .set(this.DOM.stackImages, {
                y: () => `+=${gsap.utils.random(-8, 8)}%`,
                rotation: () => gsap.utils.random(-2, 2),
                opacity: () => gsap.utils.random(1, 10) / 10,
                scale: () => gsap.utils.random(75, 95) / 100
            }, '+=0.06')
            .set(this.DOM.imgStack, { opacity: 1 }, '+=0.06')
            .set(this.DOM.stackImages, {
                x: (_, t) => t.dataset.tx,
                y: (_, t) => t.dataset.ty,
                rotation: (_, t) => t.dataset.r,
                opacity: 1,
                scale: 1
            }, '+=0.06');
    }

    startItemMouseMoveMotion() { this.mouseMoveItemController.start(); }
    stopItemMouseMoveMotion() { this.mouseMoveItemController.stop(); }
    startStackMouseMoveMotion() { this.mouseMoveStackController.start(); }
    stopStackMouseMoveMotion() { this.mouseMoveStackController.stop(); }
}

// Menu Class
class Menu {
    constructor(DOM_el) {
        this.DOM = { el: DOM_el };
        this.DOM.items = [...this.DOM.el.querySelectorAll('.menu__item')];
        this.menuItems = this.DOM.items.map(item => new MenuItem(item));
        this.current = -1;
        this.circle = new Circle(document.querySelector('.circle'));
        this.DOM.closeContentCtrl = document.querySelector('.content-wrap button');

        this.circle.startMouseMoveMotion();
        this.menuItems.forEach(item => item.startItemMouseMoveMotion());
        this.initEvents();
    }

    initEvents() {
        this.menuItems.forEach((item, pos) => {
            item.DOM.el.addEventListener('click', ev => {
                ev.preventDefault();
                this.selectItem(pos);
            });

            item.DOM.el.addEventListener('mouseenter', () => {
                if (this.isOpen) return;
                item.startStackMouseMoveMotion();
                item.mouseEnterTime = setTimeout(() => item.showImageStack(), 125);
            });

            item.DOM.el.addEventListener('mouseleave', () => {
                if (this.isOpen) return;
                clearTimeout(item.mouseEnterTime);
                item.stopStackMouseMoveMotion();
                item.hideImageStack();
            });
        });

        this.DOM.el.addEventListener('mouseenter', () => this.circle.show());
        this.DOM.el.addEventListener('mouseleave', () => this.circle.hide());
        this.DOM.closeContentCtrl.addEventListener('click', () => this.show());
        this.DOM.closeContentCtrl.addEventListener('mouseenter', () => this.menuItems[this.current]?.glitch());
        window.addEventListener('resize', () => this.resize());
    }

    selectItem(pos) {
        if (this.current === pos || this.isOpen || this.isAnimating) return;
        this.isOpen = true;
        this.isAnimating = true;
        this.current = pos;

        const menuItemCurrent = this.menuItems[this.current];
        menuItemCurrent.DOM.el.classList.add('menu__item--current');
        menuItemCurrent.stopStackMouseMoveMotion();
        this.circle.stopMouseMoveMotion();
        this.DOM.el.classList.remove('menu--open');
        menuItemCurrent.DOM.content.classList.add('content--current');

        this.openItemTimeline = gsap.timeline({
            onComplete: () => this.isAnimating = false
        });

        this.animateMenuItemsCharsOut();

        this.openItemTimeline
            .set([menuItemCurrent.DOM.contentTitleChars, menuItemCurrent.DOM.contentText], { opacity: 0 }, 0)
            .to(menuItemCurrent.DOM.imgStack, {
                duration: 1.6, ease: 'expo.inOut',
                opacity: 1, x: '0%', y: '0%'
            }, 0);

        let imgCounter = -1;
        this.openItemTimeline.to(menuItemCurrent.DOM.stackImages, {
            duration: 1.6,
            ease: 'expo.inOut',
            x: (_, t) => {
                imgCounter++;
                const tx = -1 * (winsize.width / 2 - t.offsetWidth / 2 - (imgCounter * t.offsetWidth + 40 * imgCounter));
                t.dataset.tx = tx;
                return tx;
            },
            y: (_, t) => {
                const ty = winsize.height / 2 - (t.offsetTop + t.offsetHeight / 2) + (imgCounter % 2 ? 35 : -35);
                t.dataset.ty = ty;
                return ty;
            },
            rotation: (_, t) => {
                const r = imgCounter % 2 ? gsap.utils.random(3, 7) : gsap.utils.random(-7, -3);
                t.dataset.r = r;
                return r;
            },
            stagger: { grid: 'auto', from: 'center', amount: 0.2 }
        }, 0)
        .to(menuItemCurrent.DOM.contentTitleChars, {
            duration: 0.8, ease: 'power4.out',
            opacity: 1,
            startAt: { x: (pos, _, arr) => 17 * (pos - arr.length / 2) },
            x: 0,
            stagger: { grid: 'auto', from: 'center' }
        }, 1)
        .to(menuItemCurrent.DOM.contentText, {
            duration: 1.8, ease: 'power4.out',
            opacity: 1,
            startAt: { y: '10%' },
            y: '0%'
        }, 1)
        .set(this.DOM.closeContentCtrl, { opacity: 0 }, 0)
        .to(this.DOM.closeContentCtrl, { duration: 1, opacity: 1 }, 0.5)
        .to(this.circle.DOM.el, {
            duration: 1, ease: 'expo.in', scale: 3, opacity: 0
        }, 0);
    }

    show() {
        if (!this.isOpen || this.isAnimating) return;

        this.isAnimating = true;
        const menuItemCurrent = this.menuItems[this.current];
        this.circle.startMouseMoveMotion();
        this.DOM.el.classList.add('menu--open');

        this.closeItemTimeline = gsap.timeline({
            onComplete: () => {
                this.current = -1;
                this.isAnimating = false;
            }
        })
        .add(() => this.isOpen = false, 0.8)
        .to(this.DOM.closeContentCtrl, { duration: 0.5, opacity: 0 }, 0)
        .to(menuItemCurrent.DOM.contentTitleChars, {
            duration: 0.8, ease: 'power4.in', opacity: 0,
            x: (pos, _, arr) => 17 * (pos - arr.length / 2),
            stagger: { grid: 'auto', from: 'center' },
            onComplete: () => menuItemCurrent.DOM.content.classList.remove('content--current')
        }, 0)
        .to(menuItemCurrent.DOM.contentText, {
            duration: 0.8, ease: 'power4.in', opacity: 0, y: '10%'
        }, 0);

        let imgCounter = -1;
        this.closeItemTimeline
        .to(menuItemCurrent.DOM.stackImages, {
            duration: 1.4, ease: 'expo.inOut',
            x: 0, y: 0, rotation: 0,
            stagger: { grid: 'auto', from: 'center', amount: -0.2 }
        }, 0)
        .to(menuItemCurrent.DOM.imgStack, {
            duration: 1.4, ease: 'power2.inOut', opacity: 0
        }, 0)
        .to(this.circle.DOM.el, {
            duration: 1.2, ease: 'expo', scale: 1, opacity: 1
        }, 0.8);

        this.animateMenuItemsCharsIn();
    }

    animateMenuItemsCharsOut() {
        this.menuItems.forEach(item => {
            item.stopItemMouseMoveMotion();
            this.openItemTimeline.to(item.DOM.chars, {
                duration: 0.8, ease: 'power4.in',
                opacity: 0,
                x: (pos, _, arr) => 17 * (pos - arr.length / 2),
                stagger: { grid: 'auto', from: 'center' },
                onComplete: () => this.menuItems[this.current].DOM.el.classList.remove('menu__item--current')
            }, 0);
        });
    }

    animateMenuItemsCharsIn() {
        this.menuItems.forEach(item => {
            item.startItemMouseMoveMotion();
            this.closeItemTimeline.to(item.DOM.chars, {
                duration: 1.2, ease: 'power4.out',
                opacity: 1, x: 0,
                stagger: { grid: 'auto', from: 'center' }
            }, 1.1);
        });
    }

    resize() {
        if (!this.isOpen) return;
        let imgCounter = -1;
        gsap.set(this.menuItems[this.current].DOM.stackImages, {
            x: (_, t) => {
                imgCounter++;
                return -1 * (winsize.width / 2 - t.offsetWidth / 2 - (imgCounter * t.offsetWidth + 40 * imgCounter));
            },
            y: (_, t) => winsize.height / 2 - (t.offsetTop + t.offsetHeight / 2) + (imgCounter % 2 ? 35 : -35),
            stagger: { grid: 'auto', from: 'center', amount: 0.2 }
        });
    }
}

// INIT
preloadImages('.stack__img').then(() => document.body.classList.remove('loading'));
new Menu(document.querySelector('.menu'));
