// let stiffness = -50; //N/m
// let damping = -2; // Ns/m
// let mass = 1; // Kg
// let ts = 0.01; // Seconds
//let axis = new THREE.Vector3( 1, 0, 0 );
//let angle = Math.PI / 4;


let collection = [];

var buildNodes = (p, axis, angle, id, area) => {

collection[id] = [];
  for (var i = 0; i < p.length; i++) {


    collection[id][i] = new Point();

    let k = new THREE.Vector3();
    k.copy(p[i]);
    collection[id][i].initialpos = k.applyAxisAngle(axis, angle);
    collection[id][i].pos = p[i].applyAxisAngle(axis, angle);
    collection[id][i].vel = new THREE.Vector3();
    collection[id][i].force = new THREE.Vector3();
    collection[id][i].acc = new THREE.Vector3();
  }

  for (var i = 0; i < collection[id].length; i++) {
    let step = 0;
    for (var j = 0; j < collection[id].length; j++) {
      var dist = new THREE.Vector3();
      dist.subVectors(collection[id][i].pos, collection[id][j].pos);
      let n = distanceVector(collection[id][i].pos, collection[id][j].pos);
      // console.log(n);
      if (n <= area && n != 0) {
        collection[id][i].neighbours[step] = j;
        step++;
      }
    }
  }
}

var updatePoints = (cube, id, stiffness, damping, mass, ts, ground) => {
  // console.log(collection.length);
  for (var i = 0; i < collection[id].length; i++) {
    let g = new THREE.Vector3(0, -9.82, 0);
    let f = new THREE.Vector3();
    // console.log("here"+collection[id][i].neighbours.length);
    for (var j = 0; j < collection[id][i].neighbours.length; j++) {
      let l0 = new THREE.Vector3();
      let lt = new THREE.Vector3();

      //l0.subVectors(collection[id][i].initialpos, collection[collection[id][i].neighbours[j]].initialpos);
      lt.subVectors(collection[id][i].pos, collection[id][collection[id][i].neighbours[j]].pos);
      let n = distanceVector(collection[id][i].pos, collection[id][collection[id][i].neighbours[j]].pos);
      let n2 = distanceVector(collection[id][i].initialpos, collection[id][collection[id][i].neighbours[j]].initialpos);

      let temp2 =  new THREE.Vector3();
      temp2.copy(lt);
      f.add(temp2.multiplyScalar((stiffness * (n - n2)) / n));
      //console.log(f);

    }

    let temp = new THREE.Vector3();
    temp.copy(collection[id][i].vel);
    f.add(temp.multiplyScalar(damping));

    let mg = g.multiplyScalar(mass);
    f.add(mg);
    collection[id][i].force.copy(f);
  }

  for (var i = 0; i < collection[id].length; i++) {



    let temp = new THREE.Vector3();
    temp.copy(collection[id][i].force);
    collection[id][i].acc.copy(temp.divideScalar(mass));

    temp = new THREE.Vector3();
    temp.copy(collection[id][i].acc);
    collection[id][i].vel.add(temp.multiplyScalar(ts));

    temp = new THREE.Vector3();
    temp.copy(collection[id][i].vel);
    collection[id][i].pos.add(temp.multiplyScalar(ts));


    if(collection[id][i].pos.y <= ground) {

      temp = new THREE.Vector3();
      temp.copy(collection[id][i].vel);
      collection[id][i].pos.sub(temp.multiplyScalar(ts));
      //console.log(collection[id][i].pos);
      collection[id][i].vel.multiplyScalar(-1);
    }

    cube.geometry.vertices[i] = collection[id][i].pos;
  }
}

function Point(initialpos, pos, vel, acc, force) {
  this.initialpos = initialpos;
  this.pos = pos;
  this.vel = vel;
  this.acc = acc;
  this.neighbours = [];
  this.force = force;
}

function distanceVector(v1, v2) {
  var dx = v1.x - v2.x;
  var dy = v1.y - v2.y;
  var dz = v1.z - v2.z;

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
