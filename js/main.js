		
		/***********************************************
		*╔═╗***********╔╗╔══╗**╔╗*╔╦╗**╔╗******╔═╦╗╔╗***
		*║╬╠═╦╦╦╦═╦╦╦═╦╝║║╔╗╠╦╗║╚╦╝╠╬═╦╣╠╦═╦═╦═╣═╣╠╬╬╦╗*
		*║╔╣╬║║║║╩╣╔╣╩╣╬║║╔╗║║║╚╗║╔╣║║║║═╣╬╠╗║╔╬═║═╣║║║*
		*╚╝╚═╩══╩═╩╝╚═╩═╝╚══╬╗║*╚═╝╚╩╩═╩╩╩═╝╚═╝╚═╩╩╩╬╗║*
		********************╚═╝*********************╚═╝*
		***********************************************/
		var container, stats;
		var camera, controlsO, controlsP, scene, renderer;

		var mouse = new THREE.Vector2();
		var raycaster = new THREE.Raycaster();

		var collision = [];
		var meshes = [];
		var price = [];
		var group = new THREE.Group();

		var helper, grid;
		var gpuPicker;
		var debug = false;
		var checker = true;

		var exporter = new THREE.OBJExporter();
		var manager = new THREE.LoadingManager();

		var cameraRig, activeCamera
		var cameraPerspective, cameraOrtho;
		var frustumSize = 9;
		var SCREEN_WIDTH = window.innerWidth;
		var SCREEN_HEIGHT = window.innerHeight;
		var aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

		var noActiveDelay = 10;
		var nowNoActive = 0;
		var countPos = 0;

		//sys messages

		if (WEBGL.isWebGLAvailable()) {

			init();
			animate();

		} else {

			var warning = WEBGL.getWebGLErrorMessage();
			document.getElementById('container').appendChild(warning);

		}

		manager.onStart = function(url, itemsLoaded, itemsTotal) {
			console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
			//	if(checker) {
			document.getElementById('loader').style = "display: block";
			/*    checker = false;
			}*/
		};

		manager.onLoad = function() {
			console.log('Loading complete!');
			document.getElementById('loader').style = "display: none";
		};


		manager.onProgress = function(url, itemsLoaded, itemsTotal) {
			console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
		};

		manager.onError = function(url) {
			console.log('There was an error loading ' + url);
		};


		//load objects

	/*	function promisifyLoader(loader, onProgress) {

			function promiseLoader(url) {
				return new Promise((resolve, reject) => {
					loader.load(url, resolve, onProgress, reject);
				});
			}

			return {
				originalLoader: loader,
				load: promiseLoader,
			};
		}

		const JSONPromiseLoader = promisifyLoader(new THREE.BufferGeometryLoader(manager));

		function load(objPosX, objPosY, objPosZ, objName, objRotX, objRotY, objRotZ) {

			JSONPromiseLoader.load('obj/' + objName + '.json')
				.then((geometry) => {

					//object

					var material = new THREE.MeshStandardMaterial({
						color: 0x383838,
						roughness: 0.3
					});
					var mesh = new THREE.Mesh(geometry, material);


					mesh.frustumCulled = false; 
					mesh.matrixAutoUpdate = false;
					mesh.matrixWorldNeedsUpdate = false;
					
					mesh.position.x = objPosX;
					mesh.position.y = objPosY;
					mesh.position.z = objPosZ;

					mesh.rotation.x = THREE.Math.degToRad(objRotX);
					mesh.rotation.y = THREE.Math.degToRad(objRotY);
					mesh.rotation.z = THREE.Math.degToRad(objRotZ);

					mesh.updateMatrix();

					meshes.push(group);
					group.add(mesh);
					scene.add(group);
					console.log(mesh);
					var colBox = new THREE.Box3().setFromObject(mesh);

					var x0 = colBox.min.x;
					var x1 = colBox.max.x;
					var y0 = colBox.min.y;
					var y1 = colBox.max.y;
					var z0 = colBox.min.z;
					var z1 = colBox.max.z;

					var bWidth = (x0 > x1) ? x0 - x1 : x1 - x0;
					var bHeight = (y0 > y1) ? y0 - y1 : y1 - y0;
					var bDepth = (z0 > z1) ? z0 - z1 : z1 - z0;

					var centroidX = x0 + (bWidth / 2); //+ object.position.x;
					var centroidY = y0 + (bHeight / 2); //+ object.position.y;
					var centroidZ = z0 + (bDepth / 2); //+ object.position.z;			

					var geometry = new THREE.BoxBufferGeometry(bWidth + 0.1, bHeight + 0.1, bDepth + 0.1);
					var img = new THREE.TextureLoader().load('../mtl/add.png');
					img.repeat.set(1.5, 1.5);
					img.offset.set(-0.25, -0.25);

					var material = [
						new THREE.MeshBasicMaterial({
							map: img,
							side: THREE.DoubleSide,
							transparent: true
						}),
						new THREE.MeshBasicMaterial({
							map: img,
							side: THREE.DoubleSide,
							transparent: true
						}),
						new THREE.MeshBasicMaterial({
							map: img,
							side: THREE.DoubleSide,
							transparent: true
						}),
						new THREE.MeshBasicMaterial({
							map: img,
							side: THREE.DoubleSide,
							transparent: true
						}),
						new THREE.MeshBasicMaterial({
							map: img,
							side: THREE.DoubleSide,
							transparent: true
						}),
						new THREE.MeshBasicMaterial({
							map: img,
							side: THREE.DoubleSide,
							transparent: true
						})
					];


					var box = new THREE.Mesh(geometry, material);

					box.frustumCulled = false; 
					box.matrixAutoUpdate = false;
					box.matrixWorldNeedsUpdate = false;

					box.position.x = centroidX;
					box.position.y = centroidY;
					box.position.z = centroidZ;
					box.material[0].visible = false;
					box.material[1].visible = false;
					box.material[2].visible = false;
					box.material[3].visible = false;
					box.material[4].visible = false;
					box.material[5].visible = false;
					box.name = objName;

					box.userData.sides = {
						0: false,
						1: false,
						2: false,
						3: false,
						4: false,
						5: false
					}
					
					
					box.updateMatrix();

					collision.push(box);
					box.updateMatrixWorld();
					scene.add(box);
		//			console.log(box, mesh);

					
					

				
					gpuPicker.setScene(scene);
				})
				.catch((err) => {
					console.error(err)
				});

		}*/

		









		var loader = new THREE.GLTFLoader( manager );

		THREE.DRACOLoader.setDecoderPath( 'js/decoder/' );
		loader.setDRACOLoader( new THREE.DRACOLoader() );

		function load(objPosX, objPosY, objPosZ, objName, objRotX, objRotY, objRotZ) {
			loader.load('obj/' + objName + '.glb', function(gltf) {
				
			    gltf.scene.traverse((node) => {
				    if (!node.isMesh) return;
				    var material = new THREE.MeshStandardMaterial({
							color: 0x383838,
							roughness: 0.3
					});
				    node.material = material;
				    node.frustumCulled = false; 
					node.matrixAutoUpdate = false;
					node.matrixWorldNeedsUpdate = false;
					
					node.position.x = objPosX;
					node.position.y = objPosY;
					node.position.z = objPosZ;

					node.rotation.x = THREE.Math.degToRad(objRotX);
					node.rotation.y = THREE.Math.degToRad(objRotY);
					node.rotation.z = THREE.Math.degToRad(objRotZ);

					node.updateMatrix();

					meshes.push(group);
					group.add(node);
					scene.add(group);
	
					var colBox = new THREE.Box3().setFromObject(node);

					var x0 = colBox.min.x;
					var x1 = colBox.max.x;
					var y0 = colBox.min.y;
					var y1 = colBox.max.y;
					var z0 = colBox.min.z;
					var z1 = colBox.max.z;

					var bWidth = (x0 > x1) ? x0 - x1 : x1 - x0;
					var bHeight = (y0 > y1) ? y0 - y1 : y1 - y0;
					var bDepth = (z0 > z1) ? z0 - z1 : z1 - z0;

					var centroidX = x0 + (bWidth / 2); //+ object.position.x;
					var centroidY = y0 + (bHeight / 2); //+ object.position.y;
					var centroidZ = z0 + (bDepth / 2); //+ object.position.z;			

					var geometry = new THREE.BoxBufferGeometry(bWidth + 0.1, bHeight + 0.1, bDepth + 0.1);
					var img = new THREE.TextureLoader().load('/kulagin/mtl/add.png');
					img.repeat.set(1.5, 1.5);
					img.offset.set(-0.25, -0.25);

					var material = [
						new THREE.MeshBasicMaterial({
							map: img,
							side: THREE.DoubleSide,
							transparent: true
						}),
						new THREE.MeshBasicMaterial({
							map: img,
							side: THREE.DoubleSide,
							transparent: true
						}),
						new THREE.MeshBasicMaterial({
							map: img,
							side: THREE.DoubleSide,
							transparent: true
						}),
						new THREE.MeshBasicMaterial({
							map: img,
							side: THREE.DoubleSide,
							transparent: true
						}),
						new THREE.MeshBasicMaterial({
							map: img,
							side: THREE.DoubleSide,
							transparent: true
						}),
						new THREE.MeshBasicMaterial({
							map: img,
							side: THREE.DoubleSide,
							transparent: true
						})
					];


					var box = new THREE.Mesh(geometry, material);

					box.frustumCulled = false; 
					box.matrixAutoUpdate = false;
					box.matrixWorldNeedsUpdate = false;

					box.position.x = centroidX;
					box.position.y = centroidY;
					box.position.z = centroidZ;
					box.material[0].visible = false;
					box.material[1].visible = false;
					box.material[2].visible = false;
					box.material[3].visible = false;
					box.material[4].visible = false;
					box.material[5].visible = false;
					box.name = objName;

					box.userData.sides = {
						0: false,
						1: false,
						2: false,
						3: false,
						4: false,
						5: false
					}
					var params = box.geometry.parameters;
					box.userData.dims = {
						0: params.width,
						1: params.height,
						2: params.depth
					}
					var s = box.userData.dims;
					box.userData.minDimension = s[0] > s[1] && s[0] > s[2] ? 0 : s[1] > s[0] && s[1] > s[2] ? 1 : 2;

					box.updateMatrix();

					collision.push(box);
					box.updateMatrixWorld();
					scene.add(box);
				});

			   

			 
			    gpuPicker.setScene(scene);
			});

		}


		load(0, 0, 0, 'cube', 0, 0, 0);





		function checkRaycast() {
			var raycaster = new THREE.Raycaster();
			var intersects = [];
			for (let j = 0; j < collision.length; j++) {

				var pos = collision[j].geometry.attributes.position; 
				var ori = new THREE.Vector3();
				var dir = new THREE.Vector3();
				var a = new THREE.Vector3(),
					b = new THREE.Vector3(),
					c = new THREE.Vector3(),
					tri = new THREE.Triangle();
			
				var index = collision[j].geometry.index;	
				var faces = index.count / 3;
				
				scene.updateMatrixWorld();

				for (let i = 0; i < faces; i++) {
					a.fromBufferAttribute(pos, index.array[i * 3 + 0]);
					b.fromBufferAttribute(pos, index.array[i * 3 + 1]);
					c.fromBufferAttribute(pos, index.array[i * 3 + 2]);
					a.set(a.x + collision[j].position.x, a.y + collision[j].position.y, a.z + collision[j].position.z);
					b.set(b.x + collision[j].position.x, b.y + collision[j].position.y, b.z + collision[j].position.z);
					c.set(c.x + collision[j].position.x, c.y + collision[j].position.y, c.z + collision[j].position.z);
					tri.set(a, b, c);
					tri.getMidpoint(ori);
					tri.getNormal(dir);
					
					
					raycaster.set(ori, dir);	
				/*if (ori.x > ori.y && ori.x) {
						ori.set(ori.x + 1, ori.y, ori.z);
					}*/
					
					intersects = raycaster.intersectObjects(collision, true);
					
					//scene.add(new THREE.ArrowHelper(dir, ori, 500, 0xff0000));
					if (intersects.length > 0) {

						var intFace = Math.floor(intersects[0].faceIndex / 2);
						if (intersects[0].distance > 0 && intersects[0].distance < 0.2) {
							intersects[0].object.userData.sides[intFace] = true;
						}

					}

					
				}
			}
		}
		

		function init() {

			container = document.getElementById('container');
			scene = new THREE.Scene();
			cameraPerspective = new THREE.PerspectiveCamera(30, aspect, 1, 10000);

			cameraPerspective.position.z = 10;
			cameraPerspective.position.x = 10;
			cameraPerspective.position.y = 10;

			cameraOrtho = new THREE.OrthographicCamera(frustumSize * aspect / -2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / -2, -10000, 10000);

			cameraOrtho.position.z = cameraPerspective.position.z;
			cameraOrtho.position.x = cameraPerspective.position.x;
			cameraOrtho.position.y = cameraPerspective.position.y;

			activeCamera = cameraPerspective;

			/*	cameraRig = new THREE.Group();
				cameraRig.add( cameraPerspective );
				cameraRig.add( cameraOrtho );

				scene.add( cameraRig );*/


			scene.fog = new THREE.Fog(0xffffff, 10, 1000);

			grid = new THREE.GridHelper(12000, 6000, 0x828182, 0xE6E5E6);
			//grid.position.y = -1;
			scene.add(grid);

			pickingScene = new THREE.Scene();
			pickingTexture = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
			pickingTexture.texture.minFilter = THREE.LinearFilter;
			pickingTexture.texture.generateMipmaps = false;

			var amColor = '#2D2E3B';
			var amLight = new THREE.AmbientLight(amColor);

			scene.add(amLight);

			var lightTop = new THREE.DirectionalLight(0xFFFFFF, 1.8);
			var lightBottom = new THREE.DirectionalLight(0xFFFFFF, 1.8);
			lightTop.position.set(0, 10, 0);
			lightBottom.position.set(0, -10, 0);

			scene.add(lightTop);
			scene.add(lightBottom);


			/*	var geometry = new THREE.CylinderGeometry(0, 0.8, 5);
				geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, -2.5, 0));
				geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
				helper = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ color: 0xFF0000 }));*/

			renderer = new THREE.WebGLRenderer({
				antialias: true
			});
			renderer.setClearColor(0xFFFFFFF);
			renderer.setPixelRatio(window.devicePixelRatio);
			renderer.setSize(window.innerWidth, window.innerHeight);
			renderer.sortObjects = false;
			container.appendChild(renderer.domElement);

			gpuPicker = new THREE.GPUPicker({
				renderer: renderer,
				debug: false
			});
			gpuPicker.setFilter(function(object) {
				return true;
			});
			gpuPicker.setScene(scene);
			gpuPicker.setCamera(cameraPerspective);



			stats = new Stats();
			stats.domElement.style.position = 'absolute';
			stats.domElement.style.top = '0px';
			container.appendChild(stats.domElement);

			controlsP = new THREE.OrbitControls(cameraPerspective, renderer.domElement);
			controlsO = new THREE.OrbitControls(cameraOrtho, renderer.domElement);
			controlsP.addEventListener('end', updateGPUPicker);
			controlsO.addEventListener('end', updateGPUPicker);
			renderer.domElement.addEventListener('mousemove', onMouseMove);
			renderer.domElement.addEventListener('mousemove', activeUser);
			renderer.domElement.addEventListener('contextmenu', onMouseContext);
			renderer.domElement.addEventListener('click', onMouseClick);
			renderer.domElement.addEventListener('dblclick', getProjections);
			renderer.domElement.addEventListener('touchstart', onMouseTouch);

			window.addEventListener("keydown", HandleKeyDown, false);
			window.addEventListener("keydown", HandleKeyDownDownload, false);
			window.addEventListener("resize", onWindowResize, false);
			document.addEventListener('keydown', onKeyDown, false);

			setInterval("nowNoActive++;", 1000);
			setInterval("updateActive()", 100);
		}

		function onKeyDown(event) {
			switch (event.keyCode) {
				case 79:
					/*O*/
					activeCamera = cameraOrtho;
					gpuPicker.setCamera(cameraOrtho);
					break;
				case 80:
					/*P*/
					activeCamera = cameraPerspective;
					gpuPicker.setCamera(cameraPerspective);
					break;
			}
		}

		function HandleKeyDown(e) {
			// e.preventDefault();
			var evtobj = window.event ? event : e
			if (evtobj.keyCode == 90 && evtobj.shiftKey) debug = !debug;
		}


		function HandleKeyDownDownload(e) {
			//  e.preventDefault();
			var evtobj = window.event ? event : e
			if (evtobj.keyCode == 68 && evtobj.shiftKey) saveString(exporter.parse(group), 'stage.obj');
		}


		function onMouseMove(e) {
			e.preventDefault();
			mouse.x = e.clientX;
			mouse.y = e.clientY;
			var raymouse = new THREE.Vector2();
			raymouse.x = (e.clientX / renderer.domElement.clientWidth) * 2 - 1;
			raymouse.y = -(e.clientY / renderer.domElement.clientHeight) * 2 + 1;
			raycaster.setFromCamera(raymouse, activeCamera);

			if (activeCamera === cameraOrtho) {
				raycaster.ray.origin.set(raymouse.x, raymouse.y, -1).unproject(cameraOrtho);
			}
			var intersect = gpuPicker.pick(mouse, raycaster);

			if (intersect) {
				var index = Math.floor(intersect.faceIndex / 6);
				document.body.style.cursor = 'crosshair';
				/*	helper.position.set(0, 0, 0);
					if (intersect.face) {
						var normalMatrix = new THREE.Matrix3().getNormalMatrix(intersect.object.matrixWorld);
						var worldNormal = intersect.face.normal.clone().applyMatrix3(normalMatrix).normalize();
						helper.lookAt(worldNormal);
					}
					helper.position.copy(intersect.point);*/
				
			  	let dimensionIdx = Math.floor(intersect.faceIndex / 12);
			    

				for (i = 0; i < collision.length; i++) {

					if (intersect.object == collision[i]) {

						group.children[i].material = new THREE.MeshStandardMaterial({
							color: 0x565656
						});

						if (intersect.object.name == 'cube') {

							if (index == 0) {
								if (intersect.object.userData.sides[index] == false) collision[i].material[0].visible = true;
							} else {
								collision[i].material[0].visible = false;
							}
							if (index == 1) {
								if (intersect.object.userData.sides[index] == false) collision[i].material[1].visible = true;
							} else {
								collision[i].material[1].visible = false;
							}
							if (index == 2) {
								if (intersect.object.userData.sides[index] == false) collision[i].material[2].visible = true;
							} else {
								collision[i].material[2].visible = false;
							}
							if (index == 3) {
								if (intersect.object.userData.sides[index] == false) collision[i].material[3].visible = true;
							} else {
								collision[i].material[3].visible = false;
							}
							if (index == 4) {
								if (intersect.object.userData.sides[index] == false) collision[i].material[4].visible = true;
							} else {
								collision[i].material[4].visible = false;
							}
							if (index == 5) {
								if (intersect.object.userData.sides[index] == false) collision[i].material[5].visible = true;
							} else {
								collision[i].material[5].visible = false;
							}

						} else if (intersect.object.userData.minDimension == dimensionIdx) {

							if (index == 0) {
								if (intersect.object.userData.sides[index] == false) collision[i].material[0].visible = true;
							} else {
								collision[i].material[0].visible = false;
							}
							if (index == 1) {
								if (intersect.object.userData.sides[index] == false) collision[i].material[1].visible = true;
							} else {
								collision[i].material[1].visible = false;
							}
							if (index == 2) {
								if (intersect.object.userData.sides[index] == false) collision[i].material[2].visible = true;
							} else {
								collision[i].material[2].visible = false;
							}
							if (index == 3) {
								if (intersect.object.userData.sides[index] == false) collision[i].material[3].visible = true;
							} else {
								collision[i].material[3].visible = false;
							}
							if (index == 4) {
								if (intersect.object.userData.sides[index] == false) collision[i].material[4].visible = true;
							} else {
								collision[i].material[4].visible = false;
							}
							if (index == 5) {
								if (intersect.object.userData.sides[index] == false) collision[i].material[5].visible = true;
							} else {
								collision[i].material[5].visible = false;
							}

						} else {

							for (let k = 0; k < 6; k++) {

								collision[i].material[k].visible = false;

							}
						}

					} else {
						
						group.children[i].material = new THREE.MeshStandardMaterial({
							color: 0x383838,
							roughness: 0.3
						});

						for (let k = 0; k < 6; k++) {

							collision[i].material[k].visible = false;

						}
					}

				}
			} else {

				for (i = 0; i < collision.length; i++) {

					group.children[i].material = new THREE.MeshStandardMaterial({
						color: 0x383838,
						roughness: 0.3
					});

					for (let k = 0; k < 6; k++) {

						collision[i].material[k].visible = false;

					}
				}

				document.body.style.cursor = 'default';
			}
		}

		function onMouseContext(e) {
			e.preventDefault();

			mouse.x = e.clientX;
			mouse.y = e.clientY;
			var raymouse = new THREE.Vector2();
			raymouse.x = (e.clientX / renderer.domElement.clientWidth) * 2 - 1;
			raymouse.y = -(e.clientY / renderer.domElement.clientHeight) * 2 + 1;
			raycaster.setFromCamera(raymouse, activeCamera);

			if (activeCamera === cameraOrtho) {
				raycaster.ray.origin.set(raymouse.x, raymouse.y, - 1).unproject(cameraOrtho);
			}

			var intersect = gpuPicker.pick(mouse, raycaster);

			if (intersect) {
			
				
				for (i = 0; i < collision.length; i++) {

					if (intersect.object == collision[i]) {

						//GC.remove(GC.children[i]);
						scene.remove(collision[i]);
						collision.splice(i, 1);
						group.remove(group.children[i]);
						meshes.splice(i, 1);
						gpuPicker.setScene(scene);
						//checkRaycast();

					}
				}
			}

		}

		function onMouseClick(e) {
			e.preventDefault();

			mouse.x = e.clientX;
			mouse.y = e.clientY;
			var raymouse = new THREE.Vector2();
			raymouse.x = (e.clientX / renderer.domElement.clientWidth) * 2 - 1;
			raymouse.y = -(e.clientY / renderer.domElement.clientHeight) * 2 + 1;

			raycaster.setFromCamera(raymouse, activeCamera);

			if (activeCamera === cameraOrtho) {
				raycaster.ray.origin.set(raymouse.x, raymouse.y, - 1).unproject(cameraOrtho);
			}


			var intersect = gpuPicker.pick(mouse, raycaster);


			if (intersect) {
				
			  	let dimensionIdx = Math.floor(intersect.faceIndex / 12);
			  	
				var index = Math.floor(intersect.faceIndex / 6);

				for (i = 0; i < collision.length; i++) {
					if (intersect.object == collision[i]) {

					    for (let k = 0; k < 6; k++) {

							collision[i].material[k].visible = false;

						}

					}
				}
				if (intersect.object.name == 'cube') {
				//	console.log('true');
					switch (index) {
						case 0:
							if (intersect.object.userData.sides[index] == false) load(intersect.object.position.x + 6.98, intersect.object.position.y, intersect.object.position.z, 'beam', 0, 0, 0); 
							//intersect.object.userData.sides[index] = true; 
							break;
						case 1:
							if (intersect.object.userData.sides[index] == false) load(intersect.object.position.x - 6.98, intersect.object.position.y, intersect.object.position.z, 'beam', 0, 0, 0); 
							//intersect.object.userData.sides[index] = true;
							break;
						case 2:
							if (intersect.object.userData.sides[index] == false) load(intersect.object.position.x, intersect.object.position.y + 6.98, intersect.object.position.z, 'beam', 0, 0, 90); 
							//intersect.object.userData.sides[index] = true;
							break;
						case 3:
							if (intersect.object.userData.sides[index] == false) load(intersect.object.position.x, intersect.object.position.y - 6.98, intersect.object.position.z, 'beam', 0, 0, 90); 
						//	intersect.object.userData.sides[index] = true;
							break;
						case 4:
							if (intersect.object.userData.sides[index] == false) load(intersect.object.position.x, intersect.object.position.y, intersect.object.position.z + 6.98, 'beam', 0, 90, 0); 
						//	intersect.object.userData.sides[index] = true;
							break;
						case 5:
							if (intersect.object.userData.sides[index] == false) load(intersect.object.position.x, intersect.object.position.y, intersect.object.position.z - 6.98, 'beam', 0, 90, 0);
						//	intersect.object.userData.sides[index] = true;
							break;
					}

				}

				if (intersect.object.name == 'beam') {


					switch (index) {
						case 0:
							if (intersect.object.userData.sides[index] == false) {
								if (intersect.object.userData.minDimension == dimensionIdx) load(intersect.object.position.x + 6.98, intersect.object.position.y, intersect.object.position.z, 'cube', 0, 0, 0); 
							}
							break;
						case 1:
							if (intersect.object.userData.sides[index] == false) {
								if (intersect.object.userData.minDimension == dimensionIdx) load(intersect.object.position.x - 6.98, intersect.object.position.y, intersect.object.position.z, 'cube', 0, 0, 0);
							}
							break;
						case 2:
							if (intersect.object.userData.sides[index] == false) {
								if (intersect.object.userData.minDimension == dimensionIdx) load(intersect.object.position.x, intersect.object.position.y + 6.98, intersect.object.position.z, 'cube', 0, 0, 0); 
							}
							break;
						case 3:
							if (intersect.object.userData.sides[index] == false) {
								if (intersect.object.userData.minDimension == dimensionIdx) load(intersect.object.position.x, intersect.object.position.y - 6.98, intersect.object.position.z, 'cube', 0, 0, 0); 
							}
							break;
						case 4:
							if (intersect.object.userData.sides[index] == false) {
								if (intersect.object.userData.minDimension == dimensionIdx) load(intersect.object.position.x, intersect.object.position.y, intersect.object.position.z + 6.98, 'cube', 0, 0, 0); 
							}
							break;
						case 5:
							if (intersect.object.userData.sides[index] == false) {
								if (intersect.object.userData.minDimension == dimensionIdx) load(intersect.object.position.x, intersect.object.position.y, intersect.object.position.z - 6.98, 'cube', 0, 0, 0);
							}
							break;
					}

				}

			}


		}


		function onMouseTouch(e) {
			e.preventDefault();

			mouse.x = e.touches[0].clientX;
			mouse.y = e.touches[0].clientY;
			var raymouse = new THREE.Vector2();
			raymouse.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
			raymouse.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
			raycaster.setFromCamera(raymouse, activeCamera);

			if (activeCamera === cameraOrtho) {
				raycaster.ray.origin.set(raymouse.x, raymouse.y, -1).unproject(cameraOrtho);
			}

			var intersect = gpuPicker.pick(mouse, raycaster);

			if (intersect) {
				//	alert(intersect.object.name);
				var index = Math.floor(intersect.faceIndex / 6);
				if (intersect.object.name == 'cube') {

					switch (index) {
						case 0:
							load(intersect.object.position.x + 6.58, intersect.object.position.y, intersect.object.position.z, 'beam', 0, 0, 0);
							break;
						case 1:
							load(intersect.object.position.x - 6.58, intersect.object.position.y, intersect.object.position.z, 'beam', 0, 0, 0);
							break;
						case 2:
							load(intersect.object.position.x, intersect.object.position.y + 6.58, intersect.object.position.z, 'beam', 0, 0, 90);
							break;
						case 3:
							load(intersect.object.position.x, intersect.object.position.y - 6.58, intersect.object.position.z, 'beam', 0, 0, 90);
							break;
						case 4:
							load(intersect.object.position.x, intersect.object.position.y, intersect.object.position.z + 6.58, 'beam', 0, 90, 0);
							break;
						case 5:
							load(intersect.object.position.x, intersect.object.position.y, intersect.object.position.z - 6.58, 'beam', 0, 90, 0);
							break;
					}

				}

				if (intersect.object.name == 'beam') {
					console.log(group.position);
					switch (index) {
						case 0:
							if (intersect.face.normal.x == 0.9999999999999999 || intersect.face.normal.x == -0.9999999999999999 || intersect.face.normal.y == 0.9999999999999999 || intersect.face.normal.y == -0.9999999999999999 || intersect.face.normal.z == 0.9999999999999999 || intersect.face.normal.z == -0.9999999999999999) load(intersect.object.position.x + 6.58, intersect.object.position.y, intersect.object.position.z, 'cube', 0, 0, 0);
							break;
						case 1:
							if (intersect.face.normal.x == 0.9999999999999999 || intersect.face.normal.x == -0.9999999999999999 || intersect.face.normal.y == 0.9999999999999999 || intersect.face.normal.y == -0.9999999999999999 || intersect.face.normal.z == 0.9999999999999999 || intersect.face.normal.z == -0.9999999999999999) load(intersect.object.position.x - 6.58, intersect.object.position.y, intersect.object.position.z, 'cube', 0, 0, 0);
							break;
						case 2:
							if (intersect.face.normal.x == 0.9999999999999999 || intersect.face.normal.x == -0.9999999999999999 || intersect.face.normal.y == 0.9999999999999999 || intersect.face.normal.y == -0.9999999999999999 || intersect.face.normal.z == 0.9999999999999999 || intersect.face.normal.z == -0.9999999999999999) load(intersect.object.position.x, intersect.object.position.y + 6.58, intersect.object.position.z, 'cube', 0, 0, 0);
							break;
						case 3:
							if (intersect.face.normal.x == 0.9999999999999999 || intersect.face.normal.x == -0.9999999999999999 || intersect.face.normal.y == 0.9999999999999999 || intersect.face.normal.y == -0.9999999999999999 || intersect.face.normal.z == 0.9999999999999999 || intersect.face.normal.z == -0.9999999999999999) load(intersect.object.position.x, intersect.object.position.y - 6.58, intersect.object.position.z, 'cube', 0, 0, 0);
							break;
						case 4:
							if (intersect.face.normal.x == 0.9999999999999999 || intersect.face.normal.x == -0.9999999999999999 || intersect.face.normal.y == 0.9999999999999999 || intersect.face.normal.y == -0.9999999999999999 || intersect.face.normal.z == 0.9999999999999999 || intersect.face.normal.z == -0.9999999999999999) load(intersect.object.position.x, intersect.object.position.y, intersect.object.position.z + 6.58, 'cube', 0, 0, 0);
							break;
						case 5:
							if (intersect.face.normal.x == 0.9999999999999999 || intersect.face.normal.x == -0.9999999999999999 || intersect.face.normal.y == 0.9999999999999999 || intersect.face.normal.y == -0.9999999999999999 || intersect.face.normal.z == 0.9999999999999999 || intersect.face.normal.z == -0.9999999999999999) load(intersect.object.position.x, intersect.object.position.y, intersect.object.position.z - 6.58, 'cube', 0, 0, 0);
							break;
					}

				}


			}

		}

		function updateGPUPicker() {
			gpuPicker.needUpdate = true;
		}

		function onWindowResize() {

			aspect = window.innerWidth / window.innerHeight;
			renderer.setSize(window.innerWidth, window.innerHeight);
			cameraPerspective.aspect = aspect;
			cameraPerspective.updateProjectionMatrix();
			cameraOrtho.left = -frustumSize * aspect / 2;
			cameraOrtho.right = frustumSize * aspect / 2;
			cameraOrtho.top = frustumSize / 2;
			cameraOrtho.bottom = -frustumSize / 2;
			cameraOrtho.updateProjectionMatrix();

			gpuPicker.resizeTexture(window.innerWidth, window.innerHeight);
			gpuPicker.needUpdate = true;
		}

		function animate() {

			/*if (activeCamera.position.x < 15 && activeCamera.position.y < 15 && activeCamera.position.z < 15) {
		        
		        if (countPos < 500) {
		            
		            cameraOrtho.zoom -= 0.0007; 
    		       
    		        
    		        cameraPerspective.position.x += 0.01;
    		        cameraPerspective.position.y += 0.01;
    		        cameraPerspective.position.z += 0.01;
    		        countPos++;
    		        
		        }
		        
		    }*/
		 //   console.log(renderer.info.render.calls);
		    for (let j = 0; j < collision.length; j++) {
			    for (let k = 0; k < 6; k++) {

					collision[j].userData.sides[k] = false;

				}
			}
			checkRaycast();
			requestAnimationFrame(animate);

			render();
			stats.update();

		}



		function activeUser() {
			nowNoActive = 0;

			controlsP.autoRotate = false;
			controlsP.enableDamping = false;
		}

		function updateActive() {
			if (nowNoActive >= noActiveDelay) {

				if (activeCamera == cameraPerspective) {
					cameraOrtho.position.z = cameraPerspective.position.z;
					cameraOrtho.position.x = cameraPerspective.position.x;
					cameraOrtho.position.y = cameraPerspective.position.y;
					controlsP.enableDamping = true;
					controlsP.dampingFactor = 1.9;
					controlsP.autoRotate = true;
					controlsP.autoRotateSpeed = 0.5;
				}

				return;
			}
		}

		function render() {

			if (debug) {
				renderer.render(gpuPicker.pickingScene, activeCamera);
			} else {

				if (activeCamera === cameraPerspective) {

					cameraPerspective.updateProjectionMatrix();
					controlsP.update();


				} else {

					cameraOrtho.updateProjectionMatrix();
					controlsO.update();

				}

				renderer.render(scene, activeCamera);

			}

		}
		// save func / must be rewrote

		var link = document.createElement('a');
		link.style.display = 'none';
		document.body.appendChild(link); // Firefox workaround, see #6594
		function save(blob, filename) {

			link.href = URL.createObjectURL(blob);
			link.download = filename || 'data.json';
			link.click();

			// URL.revokeObjectURL( url ); breaks Firefox...

		}

		function saveString(text, filename) {

			save(new Blob([text], {
				type: 'text/plain'
			}), filename);

		}
		// needs rewrite

		function getProjections() {

			var camType = [];

			controlsP.saveState();
			controlsO.saveState();

			if (activeCamera !== cameraOrtho) {
				camType.push(activeCamera);
				activeCamera = cameraOrtho;
			} else {
				camType.push(activeCamera);
			}

			renderer.setSize(1000, 1000);
			cameraOrtho.left = -aspect / 2;
			cameraOrtho.right = aspect / 2;
			cameraOrtho.top = aspect / 2;
			cameraOrtho.bottom = -aspect / 2;

			cameraOrtho.updateProjectionMatrix();

			grid.visible = false;
			for (i = 0; i < collision.length; i++) {
				group.children[i].material = new THREE.MeshBasicMaterial({
					color: 0x000
				});
			}
			const boundingBox = new THREE.Box3();

			boundingBox.setFromObject(group);
			var vectorC = new THREE.Vector3();
			var vectorS = new THREE.Vector3();
			const center = boundingBox.getCenter(vectorC);
			const size = boundingBox.getSize(vectorS);

			controlsO.target.x = center.x;
			controlsO.target.y = center.y;
			controlsO.target.z = center.z;


			var right = true;
			var top = true;
			var front = true;
			var isom = true;


			if (right) {

				cameraReset(1, center.y, center.z, frustumSize / 5 / Math.max(size.x, size.y, size.z)); // || y
				saveAsImage('right');

			}
			if (top) {

				cameraReset(center.x, 1, center.z, frustumSize / 5 / Math.max(size.x, size.y, size.z)); // || z
				saveAsImage('top');

			}

			if (front) {

				cameraReset(center.x, center.y, 1, frustumSize / 5 / Math.max(size.x, size.y, size.z)); // || y
				saveAsImage('front');

			}

			if (isom) {
				if (size.x > size.z) {
					cameraReset(center.x + 10, center.y + 10, center.z + 20, frustumSize / 7 / Math.max(size.x, size.y, size.z)); // || y
					saveAsImage('isometric');
				} else {
					cameraReset(center.x + 20, center.y + 10, center.z - 10, frustumSize / 7 / Math.max(size.x, size.y, size.z)); // || y
					saveAsImage('isometric');
				}


			}


			controlsP.reset();
			controlsO.reset();

			grid.visible = true;

			for (i = 0; i < collision.length; i++) {
				group.children[i].material = new THREE.MeshStandardMaterial({
					color: 0x383838,
					roughness: 0.3
				});
			}

			if (camType[0] !== cameraOrtho) {
				activeCamera = cameraPerspective;
				camType.splice(0, 1);
				cameraPerspective.updateProjectionMatrix();
			} else {
				camType.splice(0, 1);
				cameraOrtho.updateProjectionMatrix();
			}

			cameraOrtho.left = -frustumSize * aspect / 2;
			cameraOrtho.right = frustumSize * aspect / 2;
			cameraOrtho.top = frustumSize / 2;
			cameraOrtho.bottom = -frustumSize / 2;
			renderer.setSize(window.innerWidth, window.innerHeight);


		}

		function saveAsImage(projection) {
			var imgData;

			var str = "image/png";
			imgData = renderer.domElement.toDataURL(str);
			console.log(imgData);
			var link = document.createElement("a");

			link.setAttribute("href", imgData);
			link.setAttribute("download", projection);
			link.click();

		}

		function cameraReset(x, y, z, zoom) {
			cameraOrtho.position.z = z;
			cameraOrtho.position.x = x;
			cameraOrtho.position.y = y;
			cameraOrtho.zoom = zoom;
			render();

		}