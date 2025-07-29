// Animation controller for examples
class AnimationController {
    constructor() {
        this.animations = new Map();
        this.isRunning = false;
    }

    addAnimation(name, element, keyframes, options) {
        const animation = element.animate(keyframes, options);
        this.animations.set(name, animation);
        return animation;
    }

    playAnimation(name) {
        const animation = this.animations.get(name);
        if (animation) {
            animation.play();
        }
    }

    pauseAnimation(name) {
        const animation = this.animations.get(name);
        if (animation) {
            animation.pause();
        }
    }

    stopAnimation(name) {
        const animation = this.animations.get(name);
        if (animation) {
            animation.cancel();
        }
    }

    fadeIn(element, duration = 500) {
        return this.addAnimation(`fadeIn_${Date.now()}`, element, [
            { opacity: 0 },
            { opacity: 1 }
        ], { duration, fill: 'forwards' });
    }

    slideUp(element, duration = 300) {
        return this.addAnimation(`slideUp_${Date.now()}`, element, [
            { transform: 'translateY(100%)', opacity: 0 },
            { transform: 'translateY(0)', opacity: 1 }
        ], { duration, fill: 'forwards' });
    }

    bounce(element, duration = 600) {
        return this.addAnimation(`bounce_${Date.now()}`, element, [
            { transform: 'scale(1)' },
            { transform: 'scale(1.1)' },
            { transform: 'scale(0.9)' },
            { transform: 'scale(1)' }
        ], { duration, easing: 'ease-in-out' });
    }
}

export default AnimationController;
