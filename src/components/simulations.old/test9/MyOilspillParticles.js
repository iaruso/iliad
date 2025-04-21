import * as THREE from 'three'

/**
 * Supported by particles that are affected by the waves using the gerstner/trichoidal 
 * algorithm implemented in GertsnerWater.js 
 */
class MyOilspillParticles {

    constructor(app, contents) {
        this.app = app
        this.contents = contents
        this.needsUpdate = true
        
        this.quadSize = this.contents.water.args.quadSize

        let size = 150
        this.particles = {
            color: 0x550000,
            items: [],
            size: size,
            layers: {
                startY : -size * .8 / 15, // the starting Y for the first layer
                stepY : -1.0 , // the depth increase in Y for each next layer
                startTotal: 100, // the number of particles for the first layer
                stepTotal: -1000, // the number of particles to be removed for the next layer
            },
            wireframe : false,
            noWaveEffectDepth: 200.0, // 
            opacity: 0.9, 
            material: null,  
            threshold: 50       
        } 
        this.up = new THREE.Vector3(0, 1, 0)
    }

    init() {
        let map1 = new THREE.TextureLoader().load( "textures/radial-gradient.1.png" );
    
        this.particles.material = new THREE.MeshBasicMaterial( { 
            color: this.particles.color,
            map: map1, 
            alphaMap: map1,
            side: THREE.DoubleSide, 
            depthTest: false,
            transparent: true,
            opacity: this.particles.opacity,
        } );

        // floating boxes
        //const geometry = new THREE.BoxGeometry(5,5,5);
        const geometry = new THREE.BufferGeometry();
        // create a simple square shape. We duplicate the top left and bottom right
        // vertices because each vertex needs to appear once per triangle.
        const vertices = new Float32Array( [
            -1.0, -1.0,  1.0, // v0
             1.0, -1.0,  1.0, // v1
             1.0,  1.0,  1.0, // v2
            -1.0,  1.0,  1.0, // v3
        ] );
        
        const indices = [
            0, 1, 2,
            2, 3, 0,
        ];

        const uvs = new Float32Array( [
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0
        ]);
          
        geometry.setIndex(indices)
        // itemSize = 3 because there are 3 values (components) per vertex
        geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
        geometry.setAttribute( 'uv', new THREE.BufferAttribute(uvs, 2));
        geometry.computeVertexNormals();

        let total = this.particles.layers.startTotal
        let Y = this.particles.layers.startY
        let count = 0;

        let quadSizeBy2 = this.quadSize / 2
        let quadSizeBy4 = this.quadSize / 4

        while (total > 0) {
            for (let i = 0; i < total; i++) {
                
                const mesh = new THREE.Mesh(geometry, this.particles.material)
                mesh.rotation.x = -Math.PI / 2;

                let size = this.particles.size * (0.5 + Math.random() * 0.7)

                mesh.scale.set(size, size,1.0);
                mesh.position.set(0.0, Y, 0.0)
                
                const parent = new THREE.Group()
                parent.position.set(Math.random() * 300, 0, Math.random() * 300)
                parent.add(mesh);
                
                this.particles.items.push({geom: parent, depth: Y, size: this.particles.size})
                this.app.scene.add(parent)
                count++
            }
            total += this.particles.layers.stepTotal
            Y += this.particles.layers 
        }
    }

    updateAnim(delta) {

        const gw = this.contents.water.gw;

        const t = gw.getTime()
       
        let affectedNormal = this.up
        this.particles.items.forEach((item) => {
            const geometry = item.geom;
            if (this.particles.size < this.particles.threshold) {
                const waveInfo = gw.getWaveInfo(0, 0, geometry.position.x, geometry.position.z, t);
                geometry.position.y = waveInfo.position.y;
            
                const surfaceDepthRatio = 1 - (item.depth / this.particles.noWaveEffectDepth)

                // lerp between normal at surface and normal at max depth (0,1,0)
                 affectedNormal = waveInfo.normal // .lerp(this.up, surfaceDepthRatio)
            }
            const quat = new THREE.Quaternion().setFromEuler(
                new THREE.Euler(affectedNormal.x, affectedNormal.y, affectedNormal.z)
            );
            geometry.quaternion.rotateTowards(quat, delta * 0.5);
        })
    }

    updateSize() {
        let Y = -this.particles.size * .8 / 10
        this.particles.items.forEach((item) => {
            const parent = item.geom
            item.size = this.particles.size

            let mesh = parent.children[0]
            mesh.scale.set(this.particles.size, this.particles.size, 1.0);
            mesh.position.set(0.0, Y, 0.0)
          })
        this.needsUpdate = true
    }
    
    updateOther() {
        this.needsUpdate = true
    }

    appendGUI(gui) {
        const folder = gui.addFolder('Oilspill')
        folder.addColor(this.particles.material, 'color').name("Color").listen().onChange( this.updateOther.bind(this) )
        folder.add(this.particles.material, 'opacity', 0, 1).name('Density').onChange( this.updateOther.bind(this) )
        folder.add(this.particles, 'size', 1, 1000).name('Size').onChange( this.updateSize.bind(this) )
    }

    update(time, delta) {
       this.updateAnim(delta)
       return null
    }
}

export { MyOilspillParticles };