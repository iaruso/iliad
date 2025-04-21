import * as THREE from 'three'
import { MySky } from './MySky.js';
import { MySun } from './MySun.js';
import { MyWater } from './MyWater.js';
import { MyOilspillParticles } from './MyOilspillParticles.js';
import { MyOilspillTexture } from './MyOilspillTexture.js';

/**
 * Gerstner/Trichoidal algorithm to displace the geometry of the classic Three.js Ocean shader example
 * Water by: https://sbcode.net/threejs/gerstnerwater/
 * https://en.wikipedia.org/wiki/Trochoidal_wave
 * 
 */
class MyContents9 {

    constructor(app) {
        this.app = app
        this.water = null
        this.sky = null
        this.sun = null
        this.oilspill = null
    }

    init() {

        this.initWater() 
        this.initSky()
        this.initSun()
        this.initOilspill()
        
        this.app.activeCamera.position.set(500, 300, 500);
    }

    initWater() {
        this.water = new MyWater(this.app, this)
        this.water.init()
    }

    initSky() {
       this.sky = new MySky(this.app, this)
       this.sky.init()
    }

    initSun() {
        this.sun = new MySun(this.app, this)
        this.sun.init()
    }

    initOilspill() {
        this.oilspill = new MyOilspillTexture(this.app, this)
        this.oilspill.init()
    }

    appendGUI(gui) {
        this.water.appendGUI(gui)
        this.sky.appendGUI(gui)
        this.sun.appendGUI(gui)
        this.oilspill.appendGUI(gui) 
    }
    
    updateOnControlsChange() {
        this.water.onControlsChange()
    }

    onSunUpdate(args) {
        if (this.sky) this.sky.onSunUpdate(args)
        if (this.water) this.water.onSunUpdate(args)
    }

    onCameraEmerged() {
        //    this.app.scene.background = new THREE.Color(0x909497)
        //    this.app.scene.fog = new THREE.FogExp2(0x909497, 0.001);
        //    this.app.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        console.log("emerged")
    }

    onCameraSubmerged() {
        console.log("submerged")
    }

    update() {
        this.delta = this.app.clock.getDelta()
        this.sky.update(this.delta)
        this.sun.update(this.delta) 
        let time = this.water.getTime()
        let texture = this.oilspill.update(time, this.delta)
        this.water.update(this.delta, texture)
    }

}

export { MyContents9 };