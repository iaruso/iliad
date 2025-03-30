export const dayNightShader = {
  vertexShader: `
    varying vec3 vWorldPos;
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vUv = uv;
      vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    #define PI 3.141592653589793

    uniform sampler2D dayTexture;
    uniform sampler2D nightTexture;
    uniform sampler2D noLightsTexture;
    uniform vec2 sunPosition;

    varying vec3 vWorldPos;
    varying vec2 vUv;
    varying vec3 vNormal;

    float toRad(float deg) {
      return deg * PI / 180.0;
    }
    
    float getWorldLongitude(vec3 pos) {
      return degrees(atan(pos.z, pos.x));
    }

    void main() {
      float worldLon = getWorldLongitude(vWorldPos);
      float delta = worldLon - sunPosition.x;
      delta = mod(sunPosition.x + worldLon + 180.0, 360.0) - 180.0;

      vec4 dayColor = texture2D(dayTexture, vUv);
      vec4 nightColor = texture2D(nightTexture, vUv);
      vec4 noLightsColor = texture2D(noLightsTexture, vUv);
      vec4 finalColor;

      if(delta < -90.0) {
        finalColor = dayColor;
      } else if(delta < 30.0) {
        float t = smoothstep(-90.0, 0.0, delta);
        finalColor = mix(dayColor, noLightsColor, t);
      } else if(delta < 90.0) {
        float t = smoothstep(30.0, 90.0, delta);
        finalColor = mix(noLightsColor, nightColor, t);
      } else if(delta < 270.0) {
        float t = smoothstep(90.0, 180.0, delta);
        finalColor = mix(nightColor, dayColor, t);
      } else {
        finalColor = dayColor;
      }

      gl_FragColor = finalColor;
    }
  `
}
