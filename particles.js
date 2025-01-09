class Particle {
  constructor(scene, config) {
    // Gebruik een PointsMaterial in plaats van MeshBasicMaterial
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute([0, 0, 0], 3)
    );

    // Laad de texture voor een zacht particle effect
    const sprite = new THREE.TextureLoader().load("particle.png");

    const material = new THREE.PointsMaterial({
      size: config.minSize + Math.random() * (config.maxSize - config.minSize),
      map: sprite,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: config.opacity,
      color: config.baseColor,
    });

    this.mesh = new THREE.Points(geometry, material);

    // Random snelheid tussen min en max
    this.speed =
      config.minSpeed + Math.random() * (config.maxSpeed - config.minSpeed);

    // Initiële richting
    this.direction = new THREE.Vector3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    ).normalize();

    // Random startpositie
    this.mesh.position.set(
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 8
    );

    // Voor organische beweging
    this.offset = Math.random() * Math.PI * 2;

    scene.add(this.mesh);
  }

  update(time) {
    // Organische beweging toevoegen met sin/cos
    const xMovement = Math.sin(time * 0.0005 + this.offset) * 0.001;
    const yMovement = Math.cos(time * 0.0003 + this.offset) * 0.001;
    const zMovement = Math.sin(time * 0.0004 + this.offset) * 0.001;

    this.direction.add(new THREE.Vector3(xMovement, yMovement, zMovement));
    this.direction.normalize();

    this.mesh.position.add(this.direction.multiplyScalar(this.speed));

    // Reset positie als particle te ver gaat
    if (this.mesh.position.length() > 6) {
      this.mesh.position.set(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      );
    }
  }
}
