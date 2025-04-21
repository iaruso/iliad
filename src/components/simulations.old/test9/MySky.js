import * as THREE from 'three'
import { Sky } from './addons/Sky.js'
class MySky {

    constructor(app, contents) {
        this.app = app
        this.contents = contents
        this.args = {
            geom : null,
            turbidity:20,
            rayleigh: 2.7,
            mieCoefficient: 0.005,
            mieDirectionalG: 0.7,
            pmremGenerator: new THREE.PMREMGenerator(this.app.renderer),
            exposure: 0.5
        }
    }

    init() {
        let geom = new Sky()
        geom.scale.setScalar(this.contents.water.args.quadSize)
        this.app.scene.add(geom)
        this.args.geom = geom
        this.onUpdateSky()
    }

    update() {
    }

    onUpdateSky() {
        let uniforms = this.args.geom.material.uniforms
        uniforms[ 'turbidity' ].value = this.args.turbidity
        uniforms[ 'rayleigh' ].value = this.args.rayleigh
        uniforms[ 'mieCoefficient' ].value = this.args.mieCoefficient
        uniforms[ 'mieDirectionalG' ].value = this.args.mieDirectionalG 
        
        this.args.geom.scale.setScalar(this.contents.water.args.quadSize)
    }

    onUpdateExposure() {
        this.app.renderer.toneMappingExposure = this.args.exposure
    }
    onSunUpdate(sun) {
        this.args.geom.material.uniforms['sunPosition'].value.copy(sun.direction)
        this.app.scene.environment = this.args.pmremGenerator.fromScene(this.args.geom).texture
    }

    appendGUI(gui) {
        const folder = gui.addFolder('Sky')
        folder.add( this.args, 'turbidity', 0.1, 30 ).onChange( this.onUpdateSky.bind(this) )
        folder.add( this.args, 'rayleigh', 0.001, 4 ).onChange( this.onUpdateSky.bind(this) )
        folder.add( this.args, 'mieCoefficient', 0, 1, 0.001 ).onChange( this.onUpdateSky.bind(this) )
        folder.add( this.args, 'mieDirectionalG', 0, 1, 0.001 ).onChange( this.onUpdateSky.bind(this) )
        folder.add( this.args, 'exposure', 0, 2, 0.0001 ).onChange( this.onUpdateExposure.bind(this) )
        folder.open();
    }
    
    update(delta) {
    }
}

export { MySky };