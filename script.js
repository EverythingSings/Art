let config = null;

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

const updateMeshPositions = (meshes, buttonElement) => {
  const currentTime = Date.now();
  const currentColor = `hsl(${(currentTime * 0.0001) % 1 * 360}, 100%, 50%)`;

  meshes.forEach((mesh, index) => {
    mesh.rotation.x += 0.001 * (index + 1);
    mesh.rotation.y += 0.001 * (index + 1);
    mesh.material.color.setStyle(currentColor);
  });

  buttonElement.style.backgroundColor = currentColor;
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

const animate = (meshes, scene, camera, renderer, buttonElement) => {
  const animateLoop = () => {
    requestAnimationFrame(animateLoop);
    updateMeshPositions(meshes, buttonElement);
    renderer.render(scene, camera);
  };
  animateLoop();
};

document.addEventListener('DOMContentLoaded', () => {
  const { scene, camera, renderer } = setupScene();
  const buttonElement = document.getElementById('website');
  createLights(scene);
  const meshes = createMeshes(scene);
  window.addEventListener('resize', () => onWindowResize(camera, renderer), false);
  onWindowResize(camera, renderer);
  animate(meshes, scene, camera, renderer, buttonElement);

  document.getElementById('randomSceneButton').addEventListener('click', function () {
    fetch('pages.json')
      .then(response => response.json())
      .then(data => window.location.href = data.pages[Math.floor(Math.random() * data.pages.length)])
      .catch(error => console.error('Error loading the pages list:', error));
  });
});
