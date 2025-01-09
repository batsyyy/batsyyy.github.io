// Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container").appendChild(renderer.domElement);

// Shader materiaal voor de gradient
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform float u_time;
  varying vec2 vUv;

  void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec2 mouse = u_mouse/u_resolution.xy;
    
    // Creëer meerdere kleurcentra die bewegen
    vec2 center1 = vec2(
      0.5 + 0.3 * sin(u_time * 0.3) + (mouse.x - 0.5) * 0.2,
      0.5 + 0.3 * cos(u_time * 0.4) + (mouse.y - 0.5) * 0.2
    );
    
    vec2 center2 = vec2(
      0.5 + 0.3 * cos(u_time * 0.4),
      0.5 + 0.3 * sin(u_time * 0.5)
    );
    
    // Bereken afstanden tot de centra
    float d1 = length(st - center1);
    float d2 = length(st - center2);
    
    // Meng kleuren op basis van afstand
    vec3 color1 = vec3(0.01,0.00,0.13);
    vec3 color2 = vec3(0.01,0.15,0.43);
    vec3 color3 = vec3(0.23,0.01,0.43);  
    
    vec3 color = mix(
      mix(color1, color2, smoothstep(0.0, 1.0, d1)),
      color3,
      smoothstep(0.0, 1.0, d2)
    );
    
    gl_FragColor = vec4(color, 0.5);
  }
`;

// Uniforms voor de shader
const uniforms = {
  u_time: { value: 0 },
  u_resolution: {
    value: new THREE.Vector2(window.innerWidth, window.innerHeight),
  },
  u_mouse: { value: new THREE.Vector2(0, 0) },
};

// Maak een vlak voor de gradient
const geometry = new THREE.PlaneGeometry(2, 2);
const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms,
  transparent: true,
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Update mouse positie
document.addEventListener("mousemove", (e) => {
  uniforms.u_mouse.value.x = e.clientX;
  uniforms.u_mouse.value.y = window.innerHeight - e.clientY;
});

// Animatie loop
function animate(time) {
  requestAnimationFrame(animate);
  uniforms.u_time.value = time * 0.001;
  renderer.render(scene, camera);
}

// Start animatie
animate();

// Resize handler
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
});
