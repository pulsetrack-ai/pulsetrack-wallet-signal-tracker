// Three.js utility functions for PulseTrack
import * as THREE from 'three';

export class SceneManager {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            backgroundColor: 0x000011,
            cameraFov: 75,
            cameraNear: 0.1,
            cameraFar: 1000,
            ...options
        };
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.objects = new Map();
        
        this.init();
    }

    init() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.options.backgroundColor);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            this.options.cameraFov,
            this.container.clientWidth / this.container.clientHeight,
            this.options.cameraNear,
            this.options.cameraFar
        );

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        this.container.appendChild(this.renderer.domElement);
    }

    addObject(name, object) {
        this.objects.set(name, object);
        this.scene.add(object);
    }

    removeObject(name) {
        const object = this.objects.get(name);
        if (object) {
            this.scene.remove(object);
            this.objects.delete(name);
        }
    }

    getObject(name) {
        return this.objects.get(name);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    resize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    dispose() {
        this.renderer.dispose();
        this.container.removeChild(this.renderer.domElement);
        this.objects.clear();
    }
}

export function createBasicMaterial(color = 0xffffff, options = {}) {
    return new THREE.MeshBasicMaterial({
        color: color,
        transparent: options.transparent || false,
        opacity: options.opacity || 1.0,
        wireframe: options.wireframe || false,
        ...options
    });
}

export function createLambertMaterial(color = 0xffffff, options = {}) {
    return new THREE.MeshLambertMaterial({
        color: color,
        transparent: options.transparent || false,
        opacity: options.opacity || 1.0,
        ...options
    });
}

export function createPhongMaterial(color = 0xffffff, options = {}) {
    return new THREE.MeshPhongMaterial({
        color: color,
        shininess: options.shininess || 100,
        specular: options.specular || 0x111111,
        transparent: options.transparent || false,
        opacity: options.opacity || 1.0,
        ...options
    });
}

export function addLighting(scene, options = {}) {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(
        options.ambientColor || 0x404040,
        options.ambientIntensity || 0.4
    );
    scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(
        options.directionalColor || 0xffffff,
        options.directionalIntensity || 0.8
    );
    directionalLight.position.set(
        options.directionalX || 1,
        options.directionalY || 1,
        options.directionalZ || 1
    );
    directionalLight.castShadow = options.castShadows || false;
    scene.add(directionalLight);

    return { ambientLight, directionalLight };
}

export function createParticleSystem(count = 1000, options = {}) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const color = new THREE.Color();

    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        
        // Position
        positions[i3] = (Math.random() - 0.5) * (options.spread || 100);
        positions[i3 + 1] = (Math.random() - 0.5) * (options.spread || 100);
        positions[i3 + 2] = (Math.random() - 0.5) * (options.spread || 100);

        // Color
        color.setHSL(Math.random(), 0.7, 0.5);
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: options.size || 2,
        vertexColors: true,
        transparent: true,
        opacity: options.opacity || 0.8
    });

    return new THREE.Points(geometry, material);
}

export function loadTexture(url, onLoad, onError) {
    const loader = new THREE.TextureLoader();
    return loader.load(url, onLoad, undefined, onError);
}

export function createAxesHelper(size = 10) {
    return new THREE.AxesHelper(size);
}

export function createGridHelper(size = 100, divisions = 10, colorCenterLine = 0x444444, colorGrid = 0x888888) {
    return new THREE.GridHelper(size, divisions, colorCenterLine, colorGrid);
}
