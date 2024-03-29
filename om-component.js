// om-component.js

import { Scene, PerspectiveCamera, WebGLRenderer, PointLight, Mesh, TorusKnotGeometry, MeshPhongMaterial, InstancedMesh, InstancedBufferGeometry, BufferAttribute, InstancedBufferAttribute, ShaderMaterial, AdditiveBlending, Color, Vector2 } from 'https://cdn.skypack.dev/three@0.128.0';

import { OrbitControls } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/postprocessing/ShaderPass.js';
import { CopyShader } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/shaders/CopyShader.js';
import { LuminosityHighPassShader } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/shaders/LuminosityHighPassShader.js';
import { UnrealBloomPass } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { GUI } from 'https://cdn.jsdelivr.net/npm/lil-gui@0.17.0/+esm';

export function initOm() {
  const config = {
    cameraZ: 8,
    count: 7,
    minRadius: 0.3,
    maxRadius: 2.4,
    minTubularSegments: 48,
    maxTubularSegments: 384,
    minRadialSegments: 12,
    maxRadialSegments: 48,
    minP: 2,
    maxP: 10,
    minQ: 3,
    maxQ: 12
  };

  const configJSON = document.body.dataset.config;
  if (configJSON) {
    Object.assign(config, JSON.parse(configJSON));
  };


  const mouse = new Vector2();
  let scene;
  document.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  });

  const setupScene = () => {
    const bodyElement = document.body;

    const scene = new Scene();
    const camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = config.cameraZ;
    const renderer = new WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 100;

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const copyPass = new ShaderPass(CopyShader);
    composer.addPass(copyPass);

    const bloomPass = new UnrealBloomPass(new Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    composer.addPass(bloomPass);

    return { scene, camera, renderer, composer, controls };
  };
  class ParticleSystem {
    constructor(scene, sculptureColor) {
      this.particleCount = 22222;
      this.sculptureColor = sculptureColor;

      this.init();
      scene.add(this.mesh);
    }

    init() {
      const geometry = new InstancedBufferGeometry();
      const positions = new BufferAttribute(new Float32Array(4 * 3), 3);
      positions.setXYZ(0, -0.5, 0.5, 0.0);
      positions.setXYZ(1, 0.5, 0.5, 0.0);
      positions.setXYZ(2, -0.5, -0.5, 0.0);
      positions.setXYZ(3, 0.5, -0.5, 0.0);
      geometry.setAttribute('position', positions);

      const uvs = new BufferAttribute(new Float32Array(4 * 2), 2);
      uvs.setXYZ(0, 0.0, 0.0);
      uvs.setXYZ(1, 1.0, 0.0);
      uvs.setXYZ(2, 0.0, 1.0);
      uvs.setXYZ(3, 1.0, 1.0);
      geometry.setAttribute('uv', uvs);

      geometry.setIndex(new BufferAttribute(new Uint16Array([0, 1, 2, 2, 1, 3]), 1));

      const offsets = new Float32Array(this.particleCount * 3);
      const colors = new Float32Array(this.particleCount * 3);
      const sizes = new Float32Array(this.particleCount);

      for (let i = 0; i < this.particleCount; i++) {
        offsets[i * 3] = (Math.random() - 0.5) * 10;
        offsets[i * 3 + 1] = (Math.random() - 0.5) * 10;
        offsets[i * 3 + 2] = (Math.random() - 0.5) * 10;

        colors[i * 3] = this.sculptureColor.r;
        colors[i * 3 + 1] = this.sculptureColor.g;
        colors[i * 3 + 2] = this.sculptureColor.b;

        sizes[i] = Math.random() * 0.1 + 0.05;
      }

      geometry.setAttribute('offset', new InstancedBufferAttribute(offsets, 3));
      geometry.setAttribute('color', new InstancedBufferAttribute(colors, 3));
      geometry.setAttribute('size', new InstancedBufferAttribute(sizes, 1));

      const material = new ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          mouse: { value: new Vector2() }
        },
        vertexShader: `
        uniform float time;
        attribute vec3 offset;
        attribute vec3 color;
        attribute float size;
        varying vec3 vColor;

        void main() {
          vColor = color;
          vec3 pos = position;
          pos.x += sin(time * 0.001 + offset.x * 0.1) * 0.1;
          pos.y += cos(time * 0.001 + offset.y * 0.1) * 0.1;
          pos.z += sin(time * 0.001 + offset.z * 0.1) * 0.1;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos + offset, 1.0);
          gl_PointSize = size;
        }
      `,
        fragmentShader: `
        varying vec3 vColor;

        void main() {
          float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
          float strength = 1.0 - distanceToCenter;
          gl_FragColor = vec4(vColor, strength);
        }
      `,
        blending: AdditiveBlending,
        depthTest: false,
        transparent: true
      });

      this.mesh = new InstancedMesh(geometry, material, this.particleCount);
    }

    update(time, mouse, sculptureColor) {
      this.mesh.material.uniforms.time.value = time;
      this.mesh.material.uniforms.mouse.value = mouse;

      const offsets = this.mesh.geometry.attributes.offset.array;
      const colors = this.mesh.geometry.attributes.color.array;

      for (let i = 0; i < this.particleCount; i++) {
        const x = offsets[i * 3];
        const y = offsets[i * 3 + 1];
        const z = offsets[i * 3 + 2];

        const distanceX = mouse.x * 5 - x;
        const distanceY = mouse.y * 5 - y;

        offsets[i * 3] += distanceX * 0.000008; // speed for x-axis
        offsets[i * 3 + 1] += distanceY * 0.0000008; // speed for y-axis
        offsets[i * 3 + 2] += Math.sin(time * 0.000000008 + x * 0.05) * 0.005; // speed for z-axis

        colors[i * 3] = sculptureColor.r;
        colors[i * 3 + 1] = sculptureColor.g;
        colors[i * 3 + 2] = sculptureColor.b;
      }

      this.mesh.geometry.attributes.offset.needsUpdate = true;
      this.mesh.geometry.attributes.color.needsUpdate = true;
    }
  }

  const createLights = (scene) => {
    const lightPositions = [
      { x: 5, y: 5, z: 5 },
      { x: -5, y: -5, z: -5 }
    ];
    lightPositions.forEach(({ x, y, z }) => {
      const light = new PointLight(0xffffff, 1, 100);
      light.position.set(x, y, z);
      scene.add(light);
    });
  };

  class Sculpture {
    constructor(scene, config) {
      this.config = config;
      this.materials = new Array(10).fill().map(() => new MeshPhongMaterial({
        color: Math.random() * 0xffffff,
        flatShading: false,
        shininess: 75
      }));

      this.meshes = this.createMeshes();
      this.meshes.forEach(mesh => scene.add(mesh));
    }

    createMeshes() {
      return this.createRandomGeometries().map((geometry, i) => {
        const mesh = new Mesh(geometry, this.materials[i % this.materials.length]);
        return mesh;
      });
    }

    createRandomGeometries() {
      const geometries = [];

      for (let i = 0; i < this.config.count; i++) {
        const radius = Math.random() * (this.config.maxRadius - this.config.minRadius) + this.config.minRadius;
        const tube = 0.02;
        const tubularSegments = Math.floor(Math.random() * (this.config.maxTubularSegments - this.config.minTubularSegments + 1)) + this.config.minTubularSegments;
        const radialSegments = Math.floor(Math.random() * (this.config.maxRadialSegments - this.config.minRadialSegments + 1)) + this.config.minRadialSegments;
        const p = Math.floor(Math.random() * (this.config.maxP - this.config.minP + 1)) + this.config.minP;
        const q = Math.floor(Math.random() * (this.config.maxQ - this.config.minQ + 1)) + this.config.minQ;

        const geometry = new TorusKnotGeometry(radius, tube, tubularSegments, radialSegments, p, q);
        geometries.push(geometry);
      }

      return geometries;
    }

    update(currentColor) {
      this.meshes.forEach((mesh, index) => {
        mesh.rotation.x += 0.001 * (index + 1);
        mesh.rotation.y += 0.001 * (index + 1);
        mesh.material.color.copy(currentColor);
      });
    }
  }

  const onWindowResize = (camera, renderer, composer) => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
  };

  const animate = (sculpture, particleSystem, scene, camera, renderer, composer, controls, buttonElement) => {
    let lastTime = 0;

    const animateLoop = (time) => {
      requestAnimationFrame(animateLoop);

      const deltaTime = time - lastTime;
      lastTime = time;

      const currentColor = new Color(`hsl(${(time * 0.0001) % 1 * 360}, 100%, 50%)`);
      sculpture.update(currentColor);
      particleSystem.update(time * 0.001, mouse, currentColor);

      controls.update();

      composer.render();

      if (buttonElement) {
        buttonElement.style.backgroundColor = currentColor.getStyle();
        const computedBgColor = window.getComputedStyle(buttonElement).backgroundColor;
        const rgb = computedBgColor.match(/\d+/g).map(Number);
        const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
        buttonElement.style.color = luminance > 0.5 ? '#000000' : '#ffffff';
      }

    };

    animateLoop(0);
  }

  const recreateSculpture = (sculpture, scene) => {
    scene.remove(...sculpture.meshes);
    sculpture.meshes = sculpture.createMeshes();
    sculpture.meshes.forEach(mesh => scene.add(mesh));
  };

  const setupGUI = (sculpture, particleSystem) => {
    const gui = new GUI();

    const sculptureFolder = gui.addFolder('Sculpture');
    sculptureFolder.add(sculpture.config, 'count', 1, 20, 1).onChange(() => recreateSculpture(sculpture, scene));
    sculptureFolder.add(sculpture.config, 'minRadius', 0.1, 5, 0.1).onChange(() => recreateSculpture(sculpture, scene));
    sculptureFolder.add(sculpture.config, 'maxRadius', 0.1, 5, 0.1).onChange(() => recreateSculpture(sculpture, scene));
    sculptureFolder.add(sculpture.config, 'minTubularSegments', 1, 500, 1).onChange(() => recreateSculpture(sculpture, scene));
    sculptureFolder.add(sculpture.config, 'maxTubularSegments', 1, 500, 1).onChange(() => recreateSculpture(sculpture, scene));
    sculptureFolder.add(sculpture.config, 'minRadialSegments', 1, 100, 1).onChange(() => recreateSculpture(sculpture, scene));
    sculptureFolder.add(sculpture.config, 'maxRadialSegments', 1, 100, 1).onChange(() => recreateSculpture(sculpture, scene));
    sculptureFolder.add(sculpture.config, 'minP', 1, 20, 1).onChange(() => recreateSculpture(sculpture, scene));
    sculptureFolder.add(sculpture.config, 'maxP', 1, 20, 1).onChange(() => recreateSculpture(sculpture, scene));
    sculptureFolder.add(sculpture.config, 'minQ', 1, 20, 1).onChange(() => recreateSculpture(sculpture, scene));
    sculptureFolder.add(sculpture.config, 'maxQ', 1, 20, 1).onChange(() => recreateSculpture(sculpture, scene));

    const particlesFolder = gui.addFolder('Particles');
    particlesFolder.add(particleSystem, 'particleCount', 1000, 100000, 1).onChange(() => {
      scene.remove(particleSystem.mesh);
      particleSystem.init();
      scene.add(particleSystem.mesh);
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    const { scene, camera, renderer, composer, controls } = setupScene();
    const buttonElement = document.getElementById('website');
    createLights(scene);
    const initialColor = new Color(`hsl(${(Date.now() * 0.0001) % 1 * 360}, 100%, 50%)`);
    const particleSystem = new ParticleSystem(scene, initialColor);
    const sculpture = new Sculpture(scene, config);
    window.addEventListener('resize', () => onWindowResize(camera, renderer, composer), false);
    onWindowResize(camera, renderer, composer);
    setupGUI(sculpture, particleSystem);
    animate(sculpture, particleSystem, scene, camera, renderer, composer, controls, buttonElement);
  });
}
