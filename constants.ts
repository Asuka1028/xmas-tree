
// Colors - "Trump Style" Luxury Palette
export const COLORS = {
  GOLD_MAIN: '#FFD700',      // Classic Gold
  GOLD_LIGHT: '#FFFACD',     // Lemon Chiffon (Highlights)
  ORANGE_GLOW: '#FFA500',    // Orange for depth
  RED_RUBY: '#C70039',       // Deep Red points
  WARM_WHITE: '#FFFFF0',
  DEEP_BLACK: '#000000'
};

// Tree Config
export const TREE_HEIGHT = 14;
export const TREE_RADIUS = 5.5;
export const FOLIAGE_COUNT = 35000; // Reduced for more elegant transparency
export const ORNAMENT_COUNT = 150;  

// Shaders for Foliage (Points)
export const foliageVertexShader = `
  uniform float uProgress;
  uniform float uTime;
  attribute vec3 aChaosPos;
  attribute vec3 aTargetPos;
  attribute float aSize;
  attribute vec3 aColor;
  varying vec3 vColor;

  void main() {
    // Lerp between Chaos and Target
    // uProgress: 0 = Chaos, 1 = Formed
    
    vec3 pos = mix(aChaosPos, aTargetPos, uProgress);
    
    // Add "Breathing" and "Twinkle" movement when formed
    if (uProgress > 0.9) {
        // Slowed down motion (0.2 -> 0.12)
        float angle = uTime * 0.12 + pos.y * 0.5;
        float radiusOffset = sin(angle) * 0.05;
        pos.x += cos(angle) * radiusOffset;
        pos.z += sin(angle) * radiusOffset;
    } else {
        // Slowed down drift (uTime -> uTime * 0.6)
        pos.x += sin(uTime * 0.6 + pos.y) * 0.02;
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    float sizeMult = mix(1.5, 1.0, uProgress);
    gl_PointSize = (aSize * sizeMult) * (400.0 / -mvPosition.z);
    
    vColor = aColor;
  }
`;

export const foliageFragmentShader = `
  varying vec3 vColor;
  void main() {
    float r = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;
    
    float glow = 1.0 - (r * 2.0);
    glow = pow(glow, 1.5); 

    gl_FragColor = vec4(vColor * 1.5, glow);
  }
`;
