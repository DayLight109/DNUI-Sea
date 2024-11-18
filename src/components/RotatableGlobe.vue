<template>
    <div class="globe-container" ref="globeContainer"></div>
  </template>
  
  <script>
  import * as THREE from "three";
  
  export default {
    name: "RotatableGlobe",
    mounted() {
      this.initGlobe();
    },
    methods: {
      initGlobe() {
        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        this.$refs.globeContainer.appendChild(renderer.domElement);
  
        // Create a sphere (Earth)
        const geometry = new THREE.SphereGeometry(5, 32, 32);
        const texture = new THREE.TextureLoader().load("path/to/earth_texture.jpg"); // Add texture path
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const globe = new THREE.Mesh(geometry, material);
        scene.add(globe);
  
        camera.position.z = 15;
  
        // Animation for rotation
        const animate = () => {
          requestAnimationFrame(animate);
          globe.rotation.y += 0.001;
          renderer.render(scene, camera);
        };
        animate();
      },
    },
  };
  </script>
  
  <style scoped>
  .globe-container {
    width: 100%;
    height: 100%;
  }
  </style>
  