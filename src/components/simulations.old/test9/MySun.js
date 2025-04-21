import * as THREE from 'three'

class MySun {

    constructor(app, contents) {
        this.app = app
        this.args = {
            elevation: 90,
            azimuth: 180,
            direction: new THREE.Vector3(),
            color: 0x7F7F7F
        }
        this.contents = contents
    }

    init() {
        this.updateSun()
    }

    updateSun() {
        const phi = THREE.MathUtils.degToRad(90 - this.args.elevation)
        const theta = THREE.MathUtils.degToRad(this.args.azimuth)
        this.args.direction.setFromSphericalCoords(1, phi, theta)
        this.contents.onSunUpdate(this.args)
    }

    appendGUI(gui) {
        const folder = gui.addFolder('Sun')
        folder.add( this.args, 'elevation', -3, 183, 0.1 ).onChange( this.updateSun.bind(this) )
        folder.add( this.args, 'azimuth', -180, 180, 0.1 ).onChange( this.updateSun.bind(this) )
        let obj = folder.addColor (this.args, 'color').name("Color").listen().onChange( this.updateSun.bind(this) )
    }
    
    update() {
    }
}

export { MySun };