// Three.js Hero Scene for BuildCares
(function() {
    // Check if THREE is loaded
    if (typeof window.THREE === 'undefined') {
        console.warn('Three.js is not loaded.');
        return;
    }

    class HeroSceneController {
        constructor() {
            this.container = null;
            this.scene = null;
            this.camera = null;
            this.renderer = null;
            this.particles = null;
            this.buildingGroup = null;
            this.clock = new THREE.Clock();
            this.mouseX = 0;
            this.mouseY = 0;
            this.targetX = 0;
            this.targetY = 0;
            this.windowHalfX = window.innerWidth / 2;
            this.windowHalfY = window.innerHeight / 2;
            
            this.animatingObjects = [];
            this.windowMeshes = [];
            this.annotations = [];
            
            this.animationFrameId = null;
            
            this.handleResize = this.handleResize.bind(this);
            this.handleMouseMove = this.handleMouseMove.bind(this);
            this.handlePointerDown = this.handlePointerDown.bind(this);
            this.handlePointerMove = this.handlePointerMove.bind(this);
            this.handlePointerUp = this.handlePointerUp.bind(this);
            this.render = this.render.bind(this);

            // Drag Rotation State
            this.isDragging = false;
            this.previousPointerX = 0;
            this.previousPointerY = 0;
            this.rotationVelocityX = 0;
            this.rotationVelocityY = 0;
        }

        init(containerId) {
            this.container = document.getElementById(containerId);
            if (!this.container) {
                console.error('Container ' + containerId + ' not found.');
                return;
            }

            // Setup Scene
            this.scene = new THREE.Scene();

            // Setup Camera
            const aspect = this.container.clientWidth / this.container.clientHeight;
            this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
            this.camera.position.set(15, 12, 15);
            this.camera.lookAt(0, 0, 0);

            // Setup Renderer
            this.renderer = new THREE.WebGLRenderer({ 
                antialias: true, 
                alpha: true,
                powerPreference: 'high-performance'
            });
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.container.appendChild(this.renderer.domElement);

            // Set grab cursor
            this.container.style.cursor = 'grab';

            // Lighting
            const ambientLight = new THREE.AmbientLight(0x4488cc, 0.3);
            this.scene.add(ambientLight);

            const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
            dirLight.position.set(10, 20, 10);
            this.scene.add(dirLight);

            const pointLight = new THREE.PointLight(0x00e5ff, 0.4, 20);
            pointLight.position.set(2, 5, 2);
            this.scene.add(pointLight);

            // Building Group
            this.buildingGroup = new THREE.Group();
            this.scene.add(this.buildingGroup);

            this.createGrid();
            this.createBuilding();
            this.createParticles();

            // Event Listeners
            window.addEventListener('resize', this.handleResize);
            document.addEventListener('mousemove', this.handleMouseMove);

            // Pointer Drag Listeners for 360 House Rotation (UP, DOWN, LEFT, RIGHT)
            const heroSec = document.getElementById('hero-section') || this.container;
            if (heroSec) {
                heroSec.style.cursor = 'grab';
                heroSec.addEventListener('pointerdown', this.handlePointerDown);
            }
            this.container.addEventListener('pointerdown', this.handlePointerDown);
            window.addEventListener('pointermove', this.handlePointerMove);
            window.addEventListener('pointerup', this.handlePointerUp);


            // Start Render Loop
            this.render();

            // Start Construction Sequence
            this.startConstructionSequence();
        }


        createGrid() {
            // Main Grid
            const gridHelper = new THREE.GridHelper(30, 30, 0x00e5ff, 0x00e5ff);
            gridHelper.material.opacity = 0.0;
            gridHelper.material.transparent = true;
            this.scene.add(gridHelper);
            this.gridHelper = gridHelper;
            
            // Floor Plan Lines (Phase 2)
            const floorPlanGroup = new THREE.Group();
            this.scene.add(floorPlanGroup);
            this.floorPlanGroup = floorPlanGroup;
            
            // Draw a basic L shape floor plan
            const material = new THREE.LineBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0 });
            
            const points = [];
            points.push(new THREE.Vector3(-4, 0.01, -3));
            points.push(new THREE.Vector3(4, 0.01, -3));
            points.push(new THREE.Vector3(4, 0.01, 3));
            points.push(new THREE.Vector3(1, 0.01, 3));
            points.push(new THREE.Vector3(1, 0.01, 7));
            points.push(new THREE.Vector3(-4, 0.01, 7));
            points.push(new THREE.Vector3(-4, 0.01, -3));
            
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            this.floorPlanLine = new THREE.Line(geometry, material);
            floorPlanGroup.add(this.floorPlanLine);
        }

        createBrickTexture() {
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
            const ctx = canvas.getContext('2d');
            
            // Mortar background
            ctx.fillStyle = '#b5ab9e';
            ctx.fillRect(0, 0, 512, 512);
            
            const rows = 32;
            const cols = 16;
            const rowH = 512 / rows;
            const colW = 512 / cols;
            
            for (let r = 0; r < rows; r++) {
                const offset = (r % 2 === 0) ? 0 : colW / 2;
                for (let c = -1; c <= cols; c++) {
                    const x = c * colW + offset;
                    const y = r * rowH;
                    
                    const tones = ['#9e3424', '#8c2b1d', '#7a2216', '#a63a29', '#85281a', '#b04130'];
                    ctx.fillStyle = tones[(r * 7 + c * 3) % tones.length];
                    ctx.fillRect(x + 1, y + 1, colW - 2, rowH - 2);
                }
            }
            
            const texture = new THREE.CanvasTexture(canvas);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(3, 2);
            return texture;
        }

        createRoofTexture() {
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
            const ctx = canvas.getContext('2d');
            
            ctx.fillStyle = '#1c222b';
            ctx.fillRect(0, 0, 512, 512);
            
            const rows = 24;
            const cols = 12;
            const rowH = 512 / rows;
            const colW = 512 / cols;
            
            for (let r = 0; r < rows; r++) {
                const offset = (r % 2 === 0) ? 0 : colW / 2;
                for (let c = -1; c <= cols; c++) {
                    const x = c * colW + offset;
                    const y = r * rowH;
                    
                    const tones = ['#2c333f', '#222833', '#384252', '#1a1e26'];
                    ctx.fillStyle = tones[(r * 5 + c * 2) % tones.length];
                    ctx.fillRect(x + 1, y + 1, colW - 2, rowH - 2);
                }
            }
            
            const texture = new THREE.CanvasTexture(canvas);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(3, 3);
            return texture;
        }

        createWindowTexture() {
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 256;
            const ctx = canvas.getContext('2d');
            
            // White uPVC frame
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 256, 256);
            
            // Inner glass panes
            ctx.fillStyle = '#00c3ff';
            const margin = 14;
            const paneW = (256 - margin * 3) / 2;
            const paneH = (256 - margin * 3) / 2;
            
            ctx.fillRect(margin, margin, paneW, paneH);
            ctx.fillRect(margin * 2 + paneW, margin, paneW, paneH);
            ctx.fillRect(margin, margin * 2 + paneH, paneW, paneH);
            ctx.fillRect(margin * 2 + paneW, margin * 2 + paneH, paneW, paneH);
            
            // Reflection
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.moveTo(margin, margin);
            ctx.lineTo(256 - margin, margin);
            ctx.lineTo(margin, 256 - margin);
            ctx.fill();
            
            const texture = new THREE.CanvasTexture(canvas);
            return texture;
        }

        createGabledRoofGeometry(width, depth, height) {
            const hw = width / 2;
            const hd = depth / 2;
            
            // 6 vertices defining a true triangular prism gabled roof
            const positions = new Float32Array([
                // Front slope quad (2 triangles)
                -hw, 0, hd,   hw, 0, hd,   hw, height, 0,
                -hw, 0, hd,   hw, height, 0,  -hw, height, 0,

                // Back slope quad (2 triangles)
                -hw, 0, -hd,  -hw, height, 0,  hw, height, 0,
                -hw, 0, -hd,  hw, height, 0,   hw, 0, -hd,

                // Left triangular gable end
                -hw, 0, hd,   -hw, height, 0,  -hw, 0, -hd,

                // Right triangular gable end
                hw, 0, -hd,   hw, height, 0,   hw, 0, hd,

                // Bottom flat quad (sits flush on top of walls)
                -hw, 0, -hd,  hw, 0, -hd,      hw, 0, hd,
                -hw, 0, -hd,  hw, 0, hd,       -hw, 0, hd
            ]);

            const uvs = new Float32Array([
                // Front slope
                0, 0,  1, 0,  1, 1,
                0, 0,  1, 1,  0, 1,

                // Back slope
                0, 0,  0, 1,  1, 1,
                0, 0,  1, 1,  1, 0,

                // Left gable end
                0, 0,  0.5, 1,  1, 0,

                // Right gable end
                0, 0,  0.5, 1,  1, 0,

                // Bottom
                0, 0,  1, 0,  1, 1,
                0, 0,  1, 1,  0, 1
            ]);

            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
            geo.computeVertexNormals();
            return geo;
        }

        createBuilding() {
            // Textures
            const brickTex = this.createBrickTexture();
            const roofTex = this.createRoofTexture();
            const winTex = this.createWindowTexture();

            // Materials
            const brickMaterial = new THREE.MeshPhongMaterial({ 
                map: brickTex,
                shininess: 10
            });

            const roofMaterial = new THREE.MeshPhongMaterial({ 
                map: roofTex,
                shininess: 20
            });

            const wallMaterial = new THREE.MeshPhongMaterial({
                color: 0xe2dad0, // Cream/render wall section
                shininess: 5
            });

            const whiteFrameMaterial = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                shininess: 30
            });
            
            const windowMaterial = new THREE.MeshBasicMaterial({
                map: winTex
            });
            this.windowMaterial = windowMaterial;

            const edgeMaterial = new THREE.LineBasicMaterial({
                color: 0x00e5ff,
                transparent: true,
                opacity: 0.5
            });

            const foundationMaterial = new THREE.MeshPhongMaterial({
                color: 0x222730
            });

            // 1. Foundation
            const fGeo = new THREE.BoxGeometry(14, 0.5, 10);
            fGeo.translate(0, 0.25, 0);
            const foundation = new THREE.Mesh(fGeo, foundationMaterial);
            foundation.position.set(0, 0, 0.5);
            this.buildingGroup.add(foundation);
            this.animatingObjects.push({ mesh: foundation, delay: 0.2, duration: 0.5 });
            
            const fEdges = new THREE.LineSegments(new THREE.EdgesGeometry(fGeo), edgeMaterial.clone());
            foundation.add(fEdges);
            this.animatingObjects.push({ edge: fEdges, delay: 0.2 });

            // 2. Main Red Brick House (8 x 4.8 x 6)
            const mbGeo = new THREE.BoxGeometry(8, 4.8, 6);
            mbGeo.translate(0, 2.4, 0);
            const mainBlock = new THREE.Mesh(mbGeo, brickMaterial);
            mainBlock.position.set(-0.5, 0.5, 0);
            this.buildingGroup.add(mainBlock);
            this.animatingObjects.push({ mesh: mainBlock, delay: 0.4, duration: 0.8 });
            
            const mbEdges = new THREE.LineSegments(new THREE.EdgesGeometry(mbGeo), edgeMaterial.clone());
            mainBlock.add(mbEdges);
            this.animatingObjects.push({ edge: mbEdges, delay: 0.4 });

            // 3. Ground Floor UK Bay Window Feature
            const bayGeo = new THREE.BoxGeometry(2.6, 1.8, 1.2);
            bayGeo.translate(0, 0.9, 0);
            const bayWindow = new THREE.Mesh(bayGeo, brickMaterial);
            bayWindow.position.set(1.4, 0.5, 3.1);
            this.buildingGroup.add(bayWindow);
            this.animatingObjects.push({ mesh: bayWindow, delay: 0.6, duration: 0.6 });

            const bayEdges = new THREE.LineSegments(new THREE.EdgesGeometry(bayGeo), edgeMaterial.clone());
            bayWindow.add(bayEdges);
            this.animatingObjects.push({ edge: bayEdges, delay: 0.6 });

            // Bay Window Roof
            const bayRoofGeo = new THREE.BoxGeometry(2.8, 0.25, 1.4);
            bayRoofGeo.translate(0, 0.125, 0);
            const bayRoof = new THREE.Mesh(bayRoofGeo, roofMaterial);
            bayRoof.position.set(1.4, 2.3, 3.1);
            this.buildingGroup.add(bayRoof);
            this.animatingObjects.push({ mesh: bayRoof, delay: 0.7, duration: 0.4 });

            // 4. Front Entrance Porch
            const porchGeo = new THREE.BoxGeometry(1.8, 2.2, 1.0);
            porchGeo.translate(0, 1.1, 0);
            const porch = new THREE.Mesh(porchGeo, whiteFrameMaterial);
            porch.position.set(-2.2, 0.5, 3.1);
            this.buildingGroup.add(porch);
            this.animatingObjects.push({ mesh: porch, delay: 0.6, duration: 0.6 });

            // 5. Main Slate Pitched Roof (True Triangular Prism Gabled Roof!)
            const roofGeo = this.createGabledRoofGeometry(8.4, 6.4, 2.6);
            const roof = new THREE.Mesh(roofGeo, roofMaterial);
            roof.position.set(-0.5, 5.3, 0);
            this.buildingGroup.add(roof);
            this.animatingObjects.push({ mesh: roof, delay: 0.8, duration: 0.8 });

            const roofEdges = new THREE.LineSegments(new THREE.EdgesGeometry(roofGeo), edgeMaterial.clone());
            roof.add(roofEdges);
            this.animatingObjects.push({ edge: roofEdges, delay: 0.8 });

            // 6. Chimney Stack & Pots (Iconic UK Detail)
            const chimneyGeo = new THREE.BoxGeometry(1.0, 2.6, 1.0);
            chimneyGeo.translate(0, 1.3, 0);
            const chimney = new THREE.Mesh(chimneyGeo, brickMaterial);
            chimney.position.set(-3.8, 5.8, -1.0);
            this.buildingGroup.add(chimney);
            this.animatingObjects.push({ mesh: chimney, delay: 1.0, duration: 0.5 });

            // Chimney Pots
            const potMaterial = new THREE.MeshPhongMaterial({ color: 0xc45437 });
            const pot1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.6), potMaterial);
            pot1.position.set(-4.0, 8.7, -1.2);
            this.buildingGroup.add(pot1);

            const pot2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.6), potMaterial);
            pot2.position.set(-3.6, 8.7, -0.8);
            this.buildingGroup.add(pot2);

            // 7. Side Extension (Garage Conversion / Ground Extension)
            const extGeo = new THREE.BoxGeometry(3.6, 3.2, 5.4);
            extGeo.translate(0, 1.6, 0);
            const extension = new THREE.Mesh(extGeo, brickMaterial);
            extension.position.set(5.1, 0.5, 0.2);
            this.buildingGroup.add(extension);
            this.animatingObjects.push({ mesh: extension, delay: 0.5, duration: 0.8 });

            const extRoofGeo = this.createGabledRoofGeometry(3.8, 5.6, 1.8);
            const extRoof = new THREE.Mesh(extRoofGeo, roofMaterial);
            extRoof.position.set(5.1, 3.7, 0.2);
            this.buildingGroup.add(extRoof);
            this.animatingObjects.push({ mesh: extRoof, delay: 0.8, duration: 0.5 });

            const extRoofEdges = new THREE.LineSegments(new THREE.EdgesGeometry(extRoofGeo), edgeMaterial.clone());
            extRoof.add(extRoofEdges);
            this.animatingObjects.push({ edge: extRoofEdges, delay: 0.8 });

            // 8. Loft Dormer Window & Pitched Roof
            const dormerGeo = new THREE.BoxGeometry(1.8, 1.4, 1.6);
            dormerGeo.translate(0, 0.7, 0);
            const dormer = new THREE.Mesh(dormerGeo, wallMaterial);
            dormer.position.set(-1.0, 5.6, 1.8);
            this.buildingGroup.add(dormer);
            this.animatingObjects.push({ mesh: dormer, delay: 0.9, duration: 0.5 });

            const dormerRoofGeo = this.createGabledRoofGeometry(2.0, 1.8, 0.7);
            const dormerRoof = new THREE.Mesh(dormerRoofGeo, roofMaterial);
            dormerRoof.position.set(-1.0, 7.0, 1.8);
            this.buildingGroup.add(dormerRoof);
            this.animatingObjects.push({ mesh: dormerRoof, delay: 1.0, duration: 0.4 });

            // 9. Windows
            const winFront1 = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.5), windowMaterial);
            winFront1.position.set(-2.2, 3.8, 3.01);
            this.buildingGroup.add(winFront1);

            const winFront2 = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.5), windowMaterial);
            winFront2.position.set(1.4, 3.8, 3.01);
            this.buildingGroup.add(winFront2);

            const winBay = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.2), windowMaterial);
            winBay.position.set(1.4, 1.4, 3.71);
            this.buildingGroup.add(winBay);

            const winDormer = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.0), windowMaterial);
            winDormer.position.set(-1.0, 6.3, 2.61);
            this.buildingGroup.add(winDormer);

            const winExt = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.2), windowMaterial);
            winExt.position.set(5.1, 1.8, 2.91);
            this.buildingGroup.add(winExt);

            this.createAnnotations();
        }

        createAnnotations() {
            const createLineAnnotation = (x, y, z, length) => {
                const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 });
                const pts = [new THREE.Vector3(0,0,0), new THREE.Vector3(length, 0, 0)];
                const geo = new THREE.BufferGeometry().setFromPoints(pts);
                const line = new THREE.Line(geo, mat);
                line.position.set(x, y, z);
                this.buildingGroup.add(line);
                this.annotations.push(line);
            };
            
            createLineAnnotation(-4.5, 6, 0, 1.5);
            createLineAnnotation(3.5, 3.5, 0, 1.5);
        }

        createParticles() {
            const particleCount = 100;
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(particleCount * 3);
            
            for(let i = 0; i < particleCount; i++) {
                positions[i * 3] = (Math.random() - 0.5) * 20;
                positions[i * 3 + 1] = Math.random() * 15;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
            }
            
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            
            const material = new THREE.PointsMaterial({
                color: 0x00e5ff,
                size: 0.05,
                transparent: true,
                opacity: 0.4
            });
            
            this.particles = new THREE.Points(geometry, material);
            this.scene.add(this.particles);
        }

        startConstructionSequence() {
            const gsap = window.gsap;

            // Enforce immediate default visibility for safety
            this.animatingObjects.forEach(obj => {
                if (obj.mesh) obj.mesh.scale.y = 1;
                if (obj.edge) obj.edge.material.opacity = 0.6;
            });
            if (this.windowMaterial) this.windowMaterial.opacity = 0.4;
            if (this.gridHelper) this.gridHelper.material.opacity = 0.1;

            if (!gsap) return;

            const tl = gsap.timeline();

            // Phase 1: Grid Appears
            tl.fromTo(this.gridHelper.material, { opacity: 0 }, { opacity: 0.1, duration: 0.5 }, 0);
            
            // Phase 2: Floor Plan
            if (this.floorPlanLine) {
                tl.fromTo(this.floorPlanLine.material, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.2);
                const maxPoints = 7;
                this.floorPlanLine.geometry.setDrawRange(0, 0);
                let drawRangeObj = { count: 0 };
                tl.to(drawRangeObj, {
                    count: maxPoints,
                    duration: 0.7,
                    ease: "none",
                    onUpdate: () => {
                        this.floorPlanLine.geometry.setDrawRange(0, Math.floor(drawRangeObj.count));
                    }
                }, 0.2);
                tl.to(this.floorPlanLine.material, { opacity: 0, duration: 0.5 }, 1.0);
            }

            // Phase 3: Building Rise Animation
            this.animatingObjects.forEach(obj => {
                const pos = (typeof obj.delay === 'number') ? obj.delay : 0.5;
                if (obj.mesh) {
                    tl.fromTo(obj.mesh.scale, 
                        { y: 0.001 },
                        { y: 1, duration: obj.duration || 0.8, ease: "back.out(1.2)" },
                        pos
                    );
                }
                if (obj.edge) {
                    tl.fromTo(obj.edge.material,
                        { opacity: 0 },
                        { opacity: 0.6, duration: 0.5 },
                        pos
                    );
                }
            });
        }

        handleResize() {
            if (!this.container) return;
            const width = this.container.clientWidth;
            const height = this.container.clientHeight;
            
            this.windowHalfX = window.innerWidth / 2;
            this.windowHalfY = window.innerHeight / 2;

            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();

            this.renderer.setSize(width, height);
        }

        handleMouseMove(event) {
            this.mouseX = (event.clientX - this.windowHalfX);
            this.mouseY = (event.clientY - this.windowHalfY);
            
            // Normalize target parallax offsets
            this.targetX = (this.mouseX / this.windowHalfX) * 1.5;
            this.targetY = (this.mouseY / this.windowHalfY) * 1.5;
        }

        handlePointerDown(event) {
            // Ignore clicks on buttons/links
            if (event.target.closest('a, button, input')) return;
            this.isDragging = true;
            this.previousPointerX = event.clientX;
            this.previousPointerY = event.clientY;
            document.body.style.cursor = 'grabbing';
            if (this.container) this.container.style.cursor = 'grabbing';
        }

        handlePointerMove(event) {
            if (!this.isDragging || !this.buildingGroup) return;

            const deltaX = event.clientX - this.previousPointerX;
            const deltaY = event.clientY - this.previousPointerY;

            // Full 360 degree Y (horizontal yaw) and X (vertical pitch) rotation
            this.rotationVelocityY = deltaX * 0.01;
            this.rotationVelocityX = deltaY * 0.01;

            this.buildingGroup.rotation.y += this.rotationVelocityY;
            this.buildingGroup.rotation.x += this.rotationVelocityX;

            this.previousPointerX = event.clientX;
            this.previousPointerY = event.clientY;
        }

        handlePointerUp() {
            this.isDragging = false;
            document.body.style.cursor = '';
            if (this.container) this.container.style.cursor = 'grab';
        }

        render() {
            this.animationFrameId = requestAnimationFrame(this.render);
            
            const time = this.clock.getElapsedTime();

            // Unconstrained 360 Degree Rotation & Inertia Damping Logic
            if (this.buildingGroup) {
                if (this.isDragging) {
                    // Direct 360 user drag active
                } else if (Math.abs(this.rotationVelocityY) > 0.0001 || Math.abs(this.rotationVelocityX) > 0.0001) {
                    // Smooth spin momentum damping in all directions (UP/DOWN/LEFT/RIGHT)
                    this.buildingGroup.rotation.y += this.rotationVelocityY;
                    this.buildingGroup.rotation.x += this.rotationVelocityX;
                    this.rotationVelocityY *= 0.95;
                    this.rotationVelocityX *= 0.95;
                } else {
                    // Gentle auto-spin around Y axis
                    this.buildingGroup.rotation.y += 0.002;
                }
            }

            
            // Idle Animation: Window pulsing
            if (this.windowMaterial) {
                // Pulse only after construction finishes (roughly time > 4)
                if (time > 4) {
                    const pulse = Math.sin(time * 1.5) * 0.1;
                    this.windowMaterial.opacity = 0.3 + pulse;
                }
            }
            
            // Idle Animation: Particle drift
            if (this.particles) {
                const positions = this.particles.geometry.attributes.position.array;
                for(let i = 1; i < positions.length; i += 3) {
                    positions[i] += 0.01;
                    if (positions[i] > 15) {
                        positions[i] = 0; // reset to bottom roughly
                    }
                }
                this.particles.geometry.attributes.position.needsUpdate = true;
            }

            // Camera Parallax Interaction
            this.camera.position.x += (15 + this.targetX - this.camera.position.x) * 0.05;
            this.camera.position.y += (12 + this.targetY - this.camera.position.y) * 0.05;
            this.camera.lookAt(0, 0, 0);

            this.renderer.render(this.scene, this.camera);
        }


        dispose() {
            window.removeEventListener('resize', this.handleResize);
            document.removeEventListener('mousemove', this.handleMouseMove);
            
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
            }
            
            if (this.renderer) {
                this.renderer.dispose();
                if (this.container && this.renderer.domElement.parentNode) {
                    this.container.removeChild(this.renderer.domElement);
                }
            }
        }
    }

    // Export to window
    window.HeroScene = new HeroSceneController();
})();
