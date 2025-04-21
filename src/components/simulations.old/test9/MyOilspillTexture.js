import * as THREE from 'three'

/**
 * Suported by RTT and texture generation
 */

class MyOilspillTexture {

    constructor(app, contents) {
        this.app = app
        this.contents = contents
        this.needsUpdate = true
        this.quadSize = 4096

        this.renderer = this.app.renderer
        
        // Append Renderer to DOM
        // let elem = document.getElementById("view1")
        // let canvas = this.renderer.domElement
        // elem.appendChild( canvas );
        // canvas.style.width="100%"
        // canvas.style.height="100%"
        // canvas.style.objectFit = "cover"

        // Create a different scene to hold our buffer objects
        this.sceneRTT = new THREE.Scene();
        this.renderTarget = new THREE.WebGLRenderTarget(this.quadSize, this.quadSize, 
            { 
              minFilter: THREE.LinearFilter, 
              magFilter: THREE.NearestFilter, 
              generateMipmaps: false,
              depthBuffer: false,
              stencilBuffer: false,
              format: THREE.RGBAFormat,
              type: THREE.UnsignedByteType,
              colorSpace: THREE.SRGBColorSpace,
              samples: 0
            } 
        ) 

        this.bufferData = new Uint8Array(this.quadSize * this.quadSize * 4);
        this.bufferTexture = null;

        this.cameraRTT = new THREE.OrthographicCamera( -this.quadSize / 2, this.quadSize / 2, this.quadSize / 2, -this.quadSize /2 , -this.quadSize/2, this.quadSize /2 );
        this.cameraRTT.position.z = -1000;

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
            threshold: 50,
            renderToImage: false,  

        } 
        this.up = new THREE.Vector3(0, 1, 0)
    }

    init() {
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

        let quadSizeBy2 = this.quadSize  
        let quadSizeBy4 = this.quadSize / 2

        const geometry1 = new THREE.PlaneGeometry( this.quadSize, this.quadSize);
        const material1 = new THREE.MeshBasicMaterial( {color: new THREE.Color(1.0,1.0,1.0,1.0), opacity: 1.0, transparent: false, } );
        const plane1 = new THREE.Mesh( geometry1, material1 );
        this.sceneRTT.add(plane1)

        this.particles.material = new THREE.MeshBasicMaterial( { 
            color: this.particles.color,
            map: new THREE.TextureLoader().load( "textures/radial-gradient.1.png" ), 
            depthTest: false,
            transparent: true,
            opacity: this.particles.opacity,
        } );


        while (total > 0) {
            for (let i = 0; i < total; i++) {
                /*
                const mesh = new THREE.Mesh(geometry, this.particles.material)
                mesh.rotation.x = -Math.PI / 2;
                mesh.scale.set(this.particles.size,this.particles.size,1.0);
                mesh.pozoomsition.set(0.0, Y, 0.0)
                
                const parent = new THREE.Group()
                parent.position.set(Math.random() * 500 - 100, 0, Math.random() * 500 - 100)
                parent.add(mesh);
                
                this.particles.items.push({geom: parent, depth: Y, size: this.particles.size})
                this.app.scene.add(parent)
                count++
                */

                const mesh = new THREE.Mesh(geometry, this.particles.material)
                mesh.scale.set(this.particles.size,this.particles.size,1.0);
                mesh.position.set(0.0, 0.0, 0.0)
                
                const parent = new THREE.Group()
                parent.position.set(Math.random() * quadSizeBy2 - quadSizeBy4, Math.random() * quadSizeBy2 - quadSizeBy4, 0)
                parent.add(mesh);
                
                this.particles.items.push({geom: parent, depth: Y, size: this.particles.size})
                this.sceneRTT.add(parent)
                count++
            }
            total += this.particles.layers.stepTotal
            Y += this.particles.layers 
        }

        this.initControlSphere()

        this.initHtmlElements()

    }

    initHtmlElements() {
        this.viewElement = document.createElement('div')
        this.viewElement.id = "texture-view"

        this.imgElement = document.createElement('img')
        this.imgElement.id = "texture-img"
        
        this.viewElement.appendChild(this.imgElement)
        document.body.appendChild(this.viewElement)
        
        this.updateImg()

    }

    initControlSphere() {

        const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
        directionalLight.position.set( 100, 500, 100 );   
        this.app.scene.add( directionalLight );

        this.controlGeometry = new THREE.SphereGeometry( 150, 32, 33 ); 
        this.controlMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, map: this.renderTarget.texture } ); 
        this.controlSphere = new THREE.Mesh( this.controlGeometry, this.controlMaterial );
        this.controlSphere.position.set(0,160,0); 

        this.controlSphere.position.set(-this.quadSize / 2, 150, -this.quadSize / 2)
        // this.app.scene.add( this.controlSphere );
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

    updateImg() {
        if (this.particles.renderToImage) {
            this.viewElement.style.visibility = "visible"
        }
        else {
            this.viewElement.style.visibility = "hidden"
        }
    }
    
    appendGUI(gui) {
        const folder = gui.addFolder('Oilspill')
        folder.addColor(this.particles.material, 'color').name("Color").listen().onChange( this.updateOther.bind(this) )
        folder.add(this.particles.material, 'opacity', 0, 1).name('Density').onChange( this.updateOther.bind(this) )
        folder.add(this.particles, 'size', 1, 1000).name('Size').onChange( this.updateSize.bind(this) )
        folder.add(this.particles, 'renderToImage').name('render to image').onChange( this.updateImg.bind(this))
    }

    update(time, delta) {
        // if  (this.needsUpdate === true) {
           
            // this.renderer.setSize( this.quadSize, this.quadSize )
            this.renderer.setRenderTarget(this.renderTarget)
            this.renderer.clear()
            this.renderer.render(this.sceneRTT, this.cameraRTT)
        
           
            this.renderer.setRenderTarget(null)
            this.renderer.clear()
            this.renderer.render(this.sceneRTT, this.cameraRTT)

            if (this.particles.renderToImage) {
                this.imgElement.src = this.renderer.domElement.toDataURL('img/png')
            }
            /*
            let gl = this.renderer.getContext()
            gl.readPixels(0, 0, this.quadSize, this.quadSize, gl.RGBA, gl.UNSIGNED_BYTE, this.bufferData);

            if (this.bufferTexture === null) {
                this.bufferTexture = new THREE.DataTexture( this.bufferData, this.quadSize, this.quadSize );
            }
            else {
                this.bufferTexture.image = { data: this.bufferData, width: this.quadSize, height: this.quadSize };
            }
            this.bufferTexture.needsUpdate = true;
            
            var allZeroes = this.bufferData.reduce(function(prev, item) {
                return prev && (item === 255);
              }, true);
            if (allZeroes) {
                console.log("All zeroes!");
            } else {
                console.log("Never mind, the data is okay.");
                this.needsUpdate = false
            }

        }
        */
 
        return this.renderTarget.texture //  this.bufferTexture
        
    }
}

export { MyOilspillTexture  };