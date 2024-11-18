<template>
  <div ref="globeContainer" class="globe-container"></div>
</template>

<script>
import * as THREE from "three";

export default {
  name: "EarthMap",
  mounted() {
    this.initGlobe();
  },
  methods: {
    initGlobe() {
      const width = this.$refs.globeContainer.clientWidth;
      const height = this.$refs.globeContainer.clientHeight;

      // Scene and Camera
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      this.$refs.globeContainer.appendChild(renderer.domElement);

      // Load Textures for East and West Hemispheres
      const textureLoader = new THREE.TextureLoader();
      const eastEarthTexture = textureLoader.load("/src/components/texture/east earth texture.jpg"); // Eastern Hemisphere texture
      const westEarthTexture = textureLoader.load("/src/components/texture/west earth texture.jpg"); // Western Hemisphere texture

      const bumpTexture = textureLoader.load("/textures/earth_bump.jpg");
      const specularTexture = textureLoader.load("/textures/earth_specular.jpg");

      // Create materials for East and West hemispheres
      const eastMaterial = new THREE.MeshPhongMaterial({
        map: eastEarthTexture, // Eastern Hemisphere texture
        bumpMap: bumpTexture, 
        bumpScale: 0.1, 
        specularMap: specularTexture,
        specular: new THREE.Color(0xffffff),
        shininess: 60,
      });

      const westMaterial = new THREE.MeshPhongMaterial({
        map: westEarthTexture, // Western Hemisphere texture
        bumpMap: bumpTexture, 
        bumpScale: 0.1, 
        specularMap: specularTexture,
        specular: new THREE.Color(0xffffff),
        shininess: 60,
      });

      // Geometry for the globe
      const geometry = new THREE.SphereGeometry(5, 64, 64); // Higher resolution for better detail

      // Globe Mesh for the East Hemisphere
      const eastGlobe = new THREE.Mesh(geometry, eastMaterial);
      eastGlobe.rotation.y = Math.PI / 2; // Rotate to position the Eastern Hemisphere
      scene.add(eastGlobe);

      // Globe Mesh for the West Hemisphere
      const westGlobe = new THREE.Mesh(geometry, westMaterial);
      westGlobe.rotation.y = -Math.PI / 2; // Rotate to position the Western Hemisphere
      scene.add(westGlobe);

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Bright ambient light
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2); // Stronger directional light
      directionalLight.position.set(10, 10, 10);
      scene.add(ambientLight, directionalLight);

      // Camera position
      camera.position.z = 15;

      // Rotation animation
      const animate = () => {
        requestAnimationFrame(animate);
        eastGlobe.rotation.y += 0.002; // Smooth rotation for Eastern Hemisphere
        westGlobe.rotation.y += 0.002; // Smooth rotation for Western Hemisphere
        renderer.render(scene, camera);
      };
      animate();

      // Resize handling
      window.addEventListener("resize", () => {
        const newWidth = this.$refs.globeContainer.clientWidth;
        const newHeight = this.$refs.globeContainer.clientHeight;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      });
    },
  },
};
</script>

<style scoped>
.globe-container {
  width: 100%;
  height: 100%;
  background-color: #000; /* Optional: Black background for better contrast */
}
</style>
