const setupScene = () => {
  const bodyElement = document.body;
  const configJSON = bodyElement.dataset.config;
  const config = JSON.parse(configJSON ?? '{}');


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

  const geometries = [
    new THREE.TorusKnotGeometry(2.4, 0.02, 384, 12),
    new THREE.TorusKnotGeometry(1.2, 0.02, 192, 24),
    new THREE.TorusKnotGeometry(0.6, 0.02, 96, 36),
    new THREE.TorusKnotGeometry(0.3, 0.02, 48, 48)
  ];

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
    mesh.rotation.x += 0.01 * (index + 1);
    mesh.rotation.y += 0.01 * (index + 1);
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
