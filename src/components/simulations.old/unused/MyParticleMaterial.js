import * as THREE from 'three';

/*
Adapted from https://www.shadertoy.com/view/Ms2SD1

 * "Seascape" by Alexander Alekseev aka TDM - 2014
 * License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
 * Contact: tdmaav@gmail.com

*/

class MyParticleMaterial extends THREE.ShaderMaterial {
    
    constructor(app, texture1Url, texture2Url) {
        super();
        this.app = app

        this.vertexShader = `
                precision highp float;
                precision highp int;
                
                varying vec2 vUv;
                
                float rand(vec2 co){
                    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
                }

                void main() {
                    vUv = uv;
                    vec3 p = vec3(position);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( p, 1.0 );
                }    
            `

        this.fragmentShader = `
                precision mediump float;
                uniform sampler2D texture1;
                uniform sampler2D texture2;
                varying vec2 vUv;
                
                void main() {
                    vec4 t1 = texture2D( texture1, vUv );
                    vec4 t2 = texture2D( texture2, vUv );
                    gl_FragColor = vec4(mix(t1.rgb, t2.rgb, t2.a), 1.0);
                }
            `

        this.texture1 = new THREE.TextureLoader().load( texture1Url );
        this.texture2 = new THREE.TextureLoader().load( texture2Url );
        this.uniforms = THREE.UniformsUtils.merge([{
            texture1: null,
            texture2: null,
          }]),
        this.wireframe = false
        this.flatShading = false
       

        this.uniforms.texture1.value = this.texture1
        this.uniforms.texture2.value = this.texture2

        this.side = THREE.DoubleSide;
        this.blending = THREE.NormalBlending // THREE.AdditiveBlending
        this.depthTest = false
        this.transparent = true
    }
}

export { MyParticleMaterial };