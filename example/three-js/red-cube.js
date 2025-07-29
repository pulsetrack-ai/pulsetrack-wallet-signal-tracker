// Three.js implementation of the red cube for PulseTrack
import * as THREE from 'three';

class RedCube {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.cube = null;
        this.animationId = null;
        
        this.init();
        this.animate();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011);

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75, 
            this.container.clientWidth / this.container.clientHeight, 
            0.1, 
            1000
        );
        this.camera.position.z = 5;

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.container.appendChild(this.renderer.domElement);

        // Cube geometry and material
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xff0000,
            wireframe: false 
        });
        this.cube = new THREE.Mesh(geometry, material);
        this.scene.add(this.cube);

        // Add lights
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);

        // Handle window resize
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    animate() {
        this.animationId = requestAnimationFrame(this.animate.bind(this));

        // Rotate the cube
        this.cube.rotation.x += 0.01;
        this.cube.rotation.y += 0.01;

        // Pulsing effect
        const scale = 1 + 0.1 * Math.sin(Date.now() * 0.005);
        this.cube.scale.set(scale, scale, scale);

        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.renderer) {
            this.container.removeChild(this.renderer.domElement);
            this.renderer.dispose();
        }
        
        window.removeEventListener('resize', this.onWindowResize);
    }

    setCubeColor(color) {
        if (this.cube) {
            this.cube.material.color.setHex(color);
        }
    }

    setCubeWireframe(wireframe) {
        if (this.cube) {
            this.cube.material.wireframe = wireframe;
        }
    }
}

export default RedCube;
