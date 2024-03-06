const mouse = new THREE.Vector2();

document.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

const setupScene = () => {
  const bodyElement = document.body;
  const configJSON = bodyElement.dataset.config;
  config = JSON.parse(configJSON ?? '{}');


  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = config.cameraZ ?? 8;
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  return { scene, camera, renderer };
};

const createParticles = (scene, sculptureColor = new THREE.Color(0xffffff)) => {
  const particleCount = 22222;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

    colors[i * 3] = sculptureColor.r;
    colors[i * 3 + 1] = sculptureColor.g;
    colors[i * 3 + 2] = sculptureColor.b;
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const particleMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      size: { value: 0.1 },
      mouse: { value: new THREE.Vector2() }
    },
    vertexShader: `
      uniform float time;
      uniform float size;
      attribute vec3 color;
      varying vec3 vColor;

      void main() {
        vColor = color;
        vec3 pos = position;
        pos.x += sin(time * 0.001 + position.x * 0.1) * 0.1;
        pos.y += cos(time * 0.001 + position.y * 0.1) * 0.1;
        pos.z += sin(time * 0.001 + position.z * 0.1) * 0.1;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
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
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true
  });

  const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particleSystem);
  return particleSystem;
};


const updateParticlePositions = (particleSystem, sculptureColor) => {
  particleSystem.material.uniforms.time.value = performance.now() * 0.001;
  particleSystem.material.uniforms.size.value = Math.sin(performance.now() * 0.001) * 0.05 + 0.1;
  particleSystem.material.uniforms.mouse.value = mouse;

  const positions = particleSystem.geometry.attributes.position.array;
  const colors = particleSystem.geometry.attributes.color.array;

  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];

    const distanceX = mouse.x * 5 - x;
    const distanceY = mouse.y * 5 - y;

    positions[i] += distanceX * 0.000008; // speed for x-axis
    positions[i + 1] += distanceY * 0.0000008; // speed for y-axis
    positions[i + 2] += Math.sin(performance.now() * 0.000000008 + x * 0.05) * 0.005; // speed for z-axis

    colors[i] = sculptureColor.r;
    colors[i + 1] = sculptureColor.g;
    colors[i + 2] = sculptureColor.b;
  }

  particleSystem.geometry.attributes.position.needsUpdate = true;
  particleSystem.geometry.attributes.color.needsUpdate = true;
};

const createLights = (scene) => {
  const lightPositions = [
    { x: 5, y: 5, z: 5 },
    { x: -5, y: -5, z: -5 }
  ];
  lightPositions.forEach(({ x, y, z }) => {
    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(x, y, z);
    scene.add(light);
  });
};

const createMeshes = (scene) => {
  const materials = new Array(10).fill().map(() => new THREE.MeshPhongMaterial({
    color: Math.random() * 0xffffff,
    flatShading: false,
    shininess: 75
  }));

  const createRandomGeometries = (count, minRadius, maxRadius, minTubularSegments, maxTubularSegments, minRadialSegments, maxRadialSegments, minP, maxP, minQ, maxQ) => {
    const geometries = [];

    for (let i = 0; i < count; i++) {
      const radius = Math.random() * (maxRadius - minRadius) + minRadius;
      const tube = 0.02;
      const tubularSegments = Math.floor(Math.random() * (maxTubularSegments - minTubularSegments + 1)) + minTubularSegments;
      const radialSegments = Math.floor(Math.random() * (maxRadialSegments - minRadialSegments + 1)) + minRadialSegments;
      const p = Math.floor(Math.random() * (maxP - minP + 1)) + minP;
      const q = Math.floor(Math.random() * (maxQ - minQ + 1)) + minQ;

      const geometry = new THREE.TorusKnotGeometry(radius, tube, tubularSegments, radialSegments, p, q);
      geometries.push(geometry);
    }

    return geometries;
  };


  const geometries = createRandomGeometries(
    config.count ?? 7,
    config.minRadius ?? 0.3,
    config.maxRadius ?? 2.4,
    config.minTubularSegments ?? 48,
    config.maxTubularSegments ?? 384,
    config.minRadialSegments ?? 12,
    config.maxRadialSegments ?? 48,
    config.minP ?? 2,
    config.maxP ?? 10,
    config.minQ ?? 3,
    config.maxQ ?? 12);

  return geometries.map((geometry, i) => {
    const mesh = new THREE.Mesh(geometry, materials[i % materials.length]);
    scene.add(mesh);
    return mesh;
  });
};

const updateMeshPositions = (meshes, buttonElement, currentColor) => {
  meshes.forEach((mesh, index) => {
    mesh.rotation.x += 0.001 * (index + 1);
    mesh.rotation.y += 0.001 * (index + 1);
    mesh.material.color.copy(currentColor);
  });

  buttonElement.style.backgroundColor = currentColor.getStyle();
  const computedBgColor = window.getComputedStyle(buttonElement).backgroundColor;
  const rgb = computedBgColor.match(/\d+/g).map(Number);
  const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
  buttonElement.style.color = luminance > 0.5 ? '#000000' : '#ffffff';
};

const onWindowResize = (camera, renderer) => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

const animate = (meshes, particleSystem, scene, camera, renderer, buttonElement) => {
  const animateLoop = () => {
    requestAnimationFrame(animateLoop);
    const currentColor = new THREE.Color(`hsl(${(Date.now() * 0.0001) % 1 * 360}, 100%, 50%)`);
    updateMeshPositions(meshes, buttonElement, currentColor);
    updateParticlePositions(particleSystem, currentColor);
    renderer.render(scene, camera);
  };
  animateLoop();
};

document.addEventListener('DOMContentLoaded', () => {
  const { scene, camera, renderer } = setupScene();
  const buttonElement = document.getElementById('website');
  createLights(scene);
  const initialColor = new THREE.Color(`hsl(${(Date.now() * 0.0001) % 1 * 360}, 100%, 50%)`);
  const particleSystem = createParticles(scene, initialColor);
  const meshes = createMeshes(scene);
  window.addEventListener('resize', () => onWindowResize(camera, renderer), false);
  onWindowResize(camera, renderer);
  animate(meshes, particleSystem, scene, camera, renderer, buttonElement);
  document.getElementById('randomSceneButton').addEventListener('click', function () {
    fetch('pages.json')
      .then(response => response.json())
      .then(data => window.location.href = data.pages[Math.floor(Math.random() * data.pages.length)])
      .catch(error => console.error('Error loading the pages list:', error));
  });
});
