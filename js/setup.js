let SCREEN_WIDTH = window.innerWidth - 100;
let SCREEN_HEIGHT = window.innerHeight - 100;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
let running = false;
//Setup renderer
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
let renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
window.addEventListener('resize', onWindowResize, false);
window.addEventListener("keydown", function(event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    if (running) running = false;
    else running = true;
  }
  if (event.keyCode === 32) {
    event.preventDefault();
    resetPositions();
  }
});

//lights and shadows
let ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);
let pointLight = new THREE.PointLight(0xffffff, 1, 50);
pointLight.position.set(3, 10, 5);
pointLight.castShadow = true;
pointLight.shadow.camera.near = 0.1;
pointLight.shadow.camera.far = 100;
scene.add(pointLight);

console.log(scene);
//Geometries
let loader = new THREE.OBJLoader();
let items = []; // arg: object, axis, angle, id, area || Lägger till object
let constants = []; // arg: id, stiffness, damping, mass, ts, ground || Parameter för objektet
let jelly;

loader.load('meshes/jelly.obj', function(object) {

    let buff = object.children[0].geometry;
    let geometry = new THREE.Geometry().fromBufferGeometry(buff);
    geometry.mergeVertices();

    let texture = new THREE.TextureLoader().load('textures/ground/spec.jpg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(5, 5);

    let norm_texture = new THREE.TextureLoader().load('textures/ground/norm.jpg');
    norm_texture.wrapS = THREE.RepeatWrapping;
    norm_texture.wrapT = THREE.RepeatWrapping;
    norm_texture.repeat.set(10, 10);

    let spec_texture = new THREE.TextureLoader().load('textures/ground/spec.jpg');
    spec_texture.wrapS = THREE.RepeatWrapping;
    spec_texture.wrapT = THREE.RepeatWrapping;
    spec_texture.repeat.set(10, 10);

    let rough_texture = new THREE.TextureLoader().load('textures/ground/rough.jpg');
    rough_texture.wrapS = THREE.RepeatWrapping;
    rough_texture.wrapT = THREE.RepeatWrapping;
    rough_texture.repeat.set(10, 10);

    let jelly_texture = new THREE.TextureLoader().load('textures/jelly_texture.jpg');
    rough_texture.wrapS = THREE.RepeatWrapping;
    rough_texture.wrapT = THREE.RepeatWrapping;
    rough_texture.repeat.set(10, 10);

    let boxTexture = new THREE.TextureLoader().load('textures/bump_ball.jpg');
    boxTexture.wrapS = THREE.RepeatWrapping;
    boxTexture.wrapT = THREE.RepeatWrapping;
    boxTexture.repeat.set(4, 4);

    let material = new THREE.MeshStandardMaterial({
      map: jelly_texture,
      bumpMap: jelly_texture,
      specular:1,
      bumpScale:0.05,
      roughness: 0.1,
      reflectivity: 100

    });

    let jelly = new THREE.Mesh(geometry, material);

    jelly.castShadow = true; //default is false
    jelly.receiveShadow = true; //default

    let plane_geo = new THREE.PlaneGeometry(50, 50, 6);
    let plane_mat = new THREE.MeshStandardMaterial({
      map: texture,
      normalMap: norm_texture,
      roughnessMap: rough_texture,
      bumpMap: spec_texture
    });
    let plane = new THREE.Mesh(plane_geo, plane_mat);
    plane.receiveShadow = true;
    scene.add(plane);

    let torusGeo = new THREE.TorusGeometry(0.7, 0.4, 16, 16);
    let torusMat = new THREE.MeshStandardMaterial({
      color: 'rgb(233, 142, 242)',
      map: boxTexture,
      bumpMap: boxTexture,
      bumpScale: 0.01,
      shininess: 1,
      roughness: 0,
      reflectivity: 1,
    });

    let donut = new THREE.Mesh(torusGeo, torusMat);
    donut.castShadow = true; //default is false
    donut.receiveShadow = false; //default


    let boxGeo = new THREE.SphereGeometry(1.5, 32, 32);

    let boxMat = new THREE.MeshStandardMaterial({
      // map: boxTexture,
      color: 'rgb(120, 220, 255)',
      map: boxTexture,
      bumpMap: boxTexture,
      bumpScale: 0.01,
      shininess: 1,
      roughness: 0,
      reflectivity: 100,
      wireframe: false,
    });


    let softThing = new THREE.Mesh(boxGeo, boxMat);
    softThing.castShadow = true; //default is false
    softThing.receiveShadow = true; //default

    //ball
    let sphereGeo = new THREE.SphereGeometry(1, 16, 16);
    let sphereTexture = new THREE.TextureLoader().load('basketball.png');
    let sphereMat = new THREE.MeshStandardMaterial({
      map: sphereTexture,
      wireframe: false,
      specular: 'rgb(255, 255, 255)',
      shininess: 1,
      reflectivity: 40,
      bumpMap: sphereTexture,
      bumpScale: 0.1

    });

    let ball = new THREE.Mesh(sphereGeo, sphereMat);
    ball.castShadow = true; //default is false
    ball.receiveShadow = true; //default


    //Transforms
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = 0;

    jelly.scale.set(1, 1, 1);
    jelly.position.y = 5;
    jelly.position.z = 4;

    donut.position.y = 5;

    softThing.position.y = 4;
    softThing.position.z = -3;
    softThing.position.x = 3;

    ball.position.y = 5;
    ball.position.z = -9;

    //Camera
    let controls = new THREE.OrbitControls(camera, renderer.domElement);
    camera.position.set(10, 3, 0);
    controls.update();


    let axishelp = new THREE.AxesHelper(2);
    scene.add(axishelp);

    //jelly
    items.push([jelly, new THREE.Vector3(0, 0, 1), Math.PI / 4, 0, 2]); //arg: object, axis, angle, id, area
    constants.push([0, -50, -1, 1, 0.01, (plane.position.y - jelly.position.y)]); //id, stiffness, damping, mass, ts, ground

    //Donut
    items.push([donut, new THREE.Vector3(1, 0, 1), Math.PI / 4, 1, 1]);
    constants.push([1, -300, -2, 1, 0.01, (plane.position.y - donut.position.y)]);

    //softThing
    items.push([softThing, new THREE.Vector3(1, 0, 0), Math.PI / 4, 2, 1]);
    constants.push([2, -200, -2, 1.5, 0.01, (plane.position.y - softThing.position.y)]);

    //ball
    items.push([ball, new THREE.Vector3(1, 0, 0), Math.PI / 4, 3, 2]);
    constants.push([3, -100, -0.5, 1, 0.01, (plane.position.y - ball.position.y)]);


    for (let i = 0; i < items.length; i++) {
      scene.add(items[i][0]);
      buildNodes(items[i][0].geometry.vertices, items[i][1], items[i][2], items[i][3], items[i][4]) //arg: object, axis, angle, id, area
    }

    let animate = function() {
      requestAnimationFrame(animate);

      if (running) {

        for (let i = 0; i < items.length; i++) {
          // arg: object, id, stiffness, damping, mass, ts, ground
          items[i][0].geometry.verticesNeedUpdate = true;
          items[i][0].geometry.computeVertexNormals();
          updatePoints(items[i][0], constants[i][0], constants[i][1], constants[i][2], constants[i][3], constants[i][4], constants[i][5]);

        }
      }else{
        for (let i = 0; i < items.length; i++) {
          // arg: object, id, stiffness, damping, mass, ts, ground
          items[i][0].geometry.verticesNeedUpdate = true;
          items[i][0].geometry.computeVertexNormals();
        }
      }


      controls.update();
      renderer.render(scene, camera);
    };
    animate();
  },
  // called when loading is in progresses
  function(xhr) {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },
  // called when loading has errors
  function(error) {
    console.log('An error happened');
  }
);


function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}
