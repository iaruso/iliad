import * as THREE from 'three'
import { GerstnerWater } from './GerstnerWater.js'

class MyWater {

     constructor(app, contents) {
        this.app = app
        this.gw = null
        this.contents = contents
        this.args = {
            quadSize: 4096,
            textureWidth: 512,
            textureHeight: 512,
            sunColor: 0xffffff,
			waterColor: 0x4282ec,
			distortionScale: 8.0,
            size: 0.1, 
            alpha: 1.0,
            fog: true,
            side: THREE.DoubleSide,
            wireframe: false,
        }
    }

    init() {
        this.gw = new GerstnerWater(this.app, this.args)
        this.gw.water.material.side = THREE.DoubleSide
        this.app.scene.add(this.gw.water)
    }

    appendGUI(gui) {
        this.gw.appendGUI(gui)

        const folder = gui.addFolder('Water')
        folder.add(this.args, 'distortionScale', 0, 8, 0.1).name('distortionScale').onChange( this.onUpdateWater.bind(this) )
        folder.add(this.args, 'size', 0.1, 10, 0.1).name('size').onChange( this.onUpdateWater.bind(this) )
        folder.add(this.args, 'wireframe').onChange( this.onUpdateWater.bind(this) )
        folder.add(this.args, 'alpha', 0.0, 1.0, 0.1).name('alpha').onChange( this.onUpdateWater.bind(this) )
        folder.addColor (this.args, 'waterColor').name("waterColor").listen().onChange( this.onUpdateWater.bind(this) )
        //folderWater.open()

    }

    onUpdateWater() {
        const waterUniforms = this.gw.water.material.uniforms
        waterUniforms['distortionScale'].value = this.args.distortionScale
        waterUniforms['size'].value = this.args.size
        waterUniforms['waterColor'].value = new THREE.Color(this.args.waterColor)
        waterUniforms['alpha'].value = this.args.alpha
        this.gw.water.material.wireframe = this.args.wireframe
    }
    
    onControlsChange() {
        let camPos = this.app.activeCamera.position
        const waveInfo = this.gw.getWaveInfo(0, 0, position.x, position.z, this.gw.getTime());
        
        let depthInfo = this.args.cameraDepth;
        depthInfo.last = depthInfo.current;
        depthInfo.current = camPos.y - waveInfo.position.y
        
        if (depthInfo.last < 0 && depthInfo.current >= 0 ) {
            console.log("depth: " + this.depth.current + ", emerged")
            this.contents.onCameraEmerged()
        }
        else
        if (this.depth.last >= 0 && this.depth.current < 0 ) {
            console.log("depth: " + this.depth.current + ", submerged")
            this.contents.onCameraSubmerged()
        }
    }

    getTime() {
        return this.gw.getTime()
    }

    onSunUpdate(sun) {
        this.gw.water.material.uniforms['sunDirection'].value.copy(sun.direction)

        this.args.sunColor = new THREE.Color(sun.color)
        this.gw.water.material.uniforms['sunColor'].value = this.args.sunColor
    }

    update(delta, texture) {
        this.gw.update(delta, texture)
    }
}

export { MyWater };