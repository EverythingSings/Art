import { Scene, PerspectiveCamera, WebGLRenderer, Mesh } from 'https://cdn.skypack.dev/three@0.128.0';


export function initializeBoids() {
  const scene = new Scene();
  const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new WebGLRenderer();
  const container = document.getElementById('boids-container');
  container.appendChild(renderer.domElement);

  // Create boids
  const numBoids = 200;
  const boids = [];
  const boidGeometry = new ConeGeometry(0.2, 0.5, 8);
  const boidMaterial = new MeshBasicMaterial({ color: 0xffffff });
  for (let i = 0; i < numBoids; i++) {
    const boid = new Mesh(boidGeometry, boidMaterial);
    boid.position.set(Math.random() * 40 - 20, Math.random() * 40 - 20, Math.random() * 40 - 20);
    boid.velocity = new Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
    scene.add(boid);
    boids.push(boid);
  }

  camera.position.z = 50;
  renderer.setSize(container.clientWidth, container.clientHeight);

  // Boid properties
  const separationDistance = 2;
  const alignmentDistance = 5;
  const cohesionDistance = 7;
  const separationForce = 0.05;
  const alignmentForce = 0.05;
  const cohesionForce = 0.05;
  const maxSpeed = 0.1;

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);

    // Update boid positions and velocities
    for (let i = 0; i < numBoids; i++) {
      const boid = boids[i];
      let separation = new Vector3();
      let alignment = new Vector3();
      let cohesion = new Vector3();
      let numSeparation = 0;
      let numAlignment = 0;
      let numCohesion = 0;

      for (let j = 0; j < numBoids; j++) {
        if (i !== j) {
          const otherBoid = boids[j];
          const distance = boid.position.distanceTo(otherBoid.position);

          if (distance < separationDistance) {
            const diff = boid.position.clone().sub(otherBoid.position);
            diff.normalize().divideScalar(distance);
            separation.add(diff);
            numSeparation++;
          }

          if (distance < alignmentDistance) {
            alignment.add(otherBoid.velocity);
            numAlignment++;
          }

          if (distance < cohesionDistance) {
            cohesion.add(otherBoid.position);
            numCohesion++;
          }
        }
      }

      if (numSeparation > 0) {
        separation.divideScalar(numSeparation);
        separation.normalize().multiplyScalar(separationForce);
      }

      if (numAlignment > 0) {
        alignment.divideScalar(numAlignment);
        alignment.normalize().multiplyScalar(alignmentForce);
      }

      if (numCohesion > 0) {
        cohesion.divideScalar(numCohesion);
        cohesion.sub(boid.position).normalize().multiplyScalar(cohesionForce);
      }

      boid.velocity.add(separation).add(alignment).add(cohesion);
      boid.velocity.clampLength(0, maxSpeed);
      boid.position.add(boid.velocity);

      // Wrap around the screen edges
      if (boid.position.x > 20) boid.position.x = -20;
      if (boid.position.x < -20) boid.position.x = 20;
      if (boid.position.y > 20) boid.position.y = -20;
      if (boid.position.y < -20) boid.position.y = 20;
      if (boid.position.z > 20) boid.position.z = -20;
      if (boid.position.z < -20) boid.position.z = 20;
    }

    renderer.render(scene, camera);
  }

  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });


  animate();

}
