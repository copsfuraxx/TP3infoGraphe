import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

@Component({
  selector: 'app-three-view',
  templateUrl: './three-view.component.html',
  styleUrls: ['./three-view.component.css']
})
export class ThreeViewComponent implements OnInit, AfterViewInit {

  renderer: any
  scene = new THREE.Scene
  camera: any
  soleil: any
  terre: any
  lune: any
  curTime: any
  dir = new THREE.Vector3(0,0,-1);
  axisUP = new THREE.Vector3(0,1,0);
  axisRIGHT = new THREE.Vector3(1,0,0);
  moove = true

  vaiseau = new THREE.Group();
  systemeSolaire = new THREE.Group();
  terreLune = new THREE.Group();
  luneGroup = new THREE.Group();

  beams: Array<THREE.Mesh> = [];
  beamsDir:Array<THREE.Vector3> = [];
  beamstimer:Array<number> = [];

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.curTime = Date.now();

    const canvas = document.getElementById("webglcanvas");
    document.body.addEventListener("keypress", this.OnkeyDown.bind(this));
    this.renderer = new THREE.WebGLRenderer({ canvas: canvas!, antialias: true });
    this.renderer.setSize(canvas!.clientWidth, canvas!.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    let path = "assets/images/MilkyWay/";
    let format = '.jpg';
    let urls = [
      path + 'posx' + format, path + 'negx' + format,
      path + 'posy' + format, path + 'negy' + format,
      path + 'posz' + format, path + 'negz' + format];

    let textureCube = new THREE.CubeTextureLoader().load(urls);
    textureCube.format = THREE.RGBAFormat;
    this.scene.background = textureCube;

    this.camera = new THREE.PerspectiveCamera(45, canvas!.clientWidth / canvas!.clientHeight, 1, 4000);

    let geometry = new THREE.SphereGeometry(0.5, 32, 32)

    let map = new THREE.TextureLoader().load("assets/images/earth_atmos_2048.jpg");

    let material = new THREE.MeshPhongMaterial({
      map: map
    })

    this.terre = new THREE.Mesh(geometry, material);

    this.terre.position.x = 6;
    this.terre.rotation.x = Math.PI / 5;
    this.terre.rotation.y = Math.PI / 5;
    this.terre.castShadow = true;
    this.terre.receiveShadow = true;
    this.terreLune.add(this.terre);

    map = new THREE.TextureLoader().load("assets/images/moon_1024.jpg");
    material = new THREE.MeshPhongMaterial({
      map: map
    })

    geometry = new THREE.SphereGeometry(0.2, 32, 32)
    this.lune = new THREE.Mesh(geometry, material);

    this.lune.position.x = -1;
    this.lune.rotation.x = Math.PI / 5;
    this.lune.rotation.y = Math.PI / 5;
    this.lune.castShadow = true;
    this.lune.receiveShadow = true;

    this.luneGroup.position.x = 6;
    this.luneGroup.add(this.lune);

    this.terreLune.add(this.luneGroup);

    this.systemeSolaire.add(this.terreLune);

    let light = new THREE.PointLight(0xffffff, 1.5);
    light.castShadow = true;
    light.shadow.mapSize.width = 512;
    light.shadow.mapSize.height = 512;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 50;
    this.systemeSolaire.add(light);

    geometry = new THREE.SphereGeometry(1, 32, 32)
    map = new THREE.TextureLoader().load("assets/images/2k_sun.jpg");
    let soleilMaterial = new THREE.MeshBasicMaterial({
      map: map
    });

    this.soleil = new THREE.Mesh(geometry, soleilMaterial);

    this.soleil.rotation.x = Math.PI / 5;
    this.soleil.rotation.y = Math.PI / 5;

    this.systemeSolaire.position.z = -16;
    this.systemeSolaire.add(this.soleil);

    this.scene.add(this.systemeSolaire)

    this.createVaisseau();

    this.run();
  }

  OnkeyDown(key: KeyboardEvent) {
    let angle = 0.1;

    if (key.code == "KeyW") {
      this.dir.applyAxisAngle(this.axisRIGHT, angle);
      this.vaiseau.rotateX(angle);
      this.axisUP.applyAxisAngle(this.axisRIGHT, angle);
    }

    if (key.code == "KeyS") {
      this.dir.applyAxisAngle(this.axisRIGHT, -angle);
      this.vaiseau.rotateX(-angle);
      this.axisUP.applyAxisAngle(this.axisRIGHT, -angle);

    }

    if (key.code == "KeyD") {
      this.dir.applyAxisAngle(this.axisUP, -angle);
      this.vaiseau.rotateY(-angle);
      this.axisRIGHT.applyAxisAngle(this.axisUP, -angle);
    }
    if (key.code == "KeyA") {
      this.dir.applyAxisAngle(this.axisUP, angle);
      this.vaiseau.rotateY(angle);
      this.axisRIGHT.applyAxisAngle(this.axisUP, angle);
    }

    if (key.code == "KeyF") {
      this.Fire();
      console.log("fire")
    }

    if (key.code == "Space") {
      this.moove = !this.moove;
    }
  }

  Fire(){
    let geometry = new THREE.CapsuleGeometry(0.01,1,32,16);
    let mat = new THREE.MeshBasicMaterial( {color : 0xff0000})
    let mesh = new THREE.Mesh(geometry, mat);
    mesh.position.setFromMatrixPosition(this.vaiseau.matrixWorld)
    mesh.setRotationFromEuler(this.vaiseau.rotation)
    mesh.rotateX(Math.PI/2)
    this.scene.add(mesh)
    this.beams.push(mesh)
    this.beamsDir.push(this.dir.clone())
    this.beamstimer.push(3)
  }
  
  createVaisseau() {
    const loader = new GLTFLoader();
    let _vaisseau = this.vaiseau;
    loader.load(
      'assets/x-_wing/scene.gltf',
      function (gltf) {
        gltf.scene.scale.set(0.01, 0.01, 0.01);
        gltf.scene.rotateY(Math.PI);
        _vaisseau.add(gltf.scene);
      })

    //this.camera.position.x = -1;
    this.camera.position.y = 0.5;
    this.camera.position.z = 1.5;

    let light = new THREE.PointLight(0xffffff, 1.5);
    light.position.set(0,1,1);
    this.vaiseau.add(light);

    this.vaiseau.add(this.camera);
    this.vaiseau.position.z = 20;
    //this.camera.lookAt(new THREE.Vector3().setFromMatrixPosition(this.vaiseau.matrixWorld));
    this.scene.add(this.vaiseau);
  }

  run() {
    requestAnimationFrame(() => {
      this.run();
    });

    this.render();

    this.animate();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  animate() {
    // Computes how time has changed since last display
    let now = Date.now();
    let deltaTime = now - this.curTime;
    this.curTime = now;
    let fracTime = deltaTime / 1000; // in seconds
    // Now we can move objects, camera, etc.
    // Example: rotation cube
    //let angle = 0.1 * Math.PI * 2 * fracTime; // one turn per 10 second.
    let angle = fracTime * Math.PI * 2;

    this.soleil.rotation.y += angle / 7;
    this.terreLune.rotation.y += angle / 365; // la terre tourne en 365 jours
    this.terre.rotation.y += angle; // et en un jour sur elle-même
    this.luneGroup.rotation.y += angle / 28; // la lune tourne en 28 jours autour de la terre
    this.lune.rotation.y += angle / 28; // et en 28 jours aussi sur elle-même pour faire face à la terre
    if(this.moove)this.vaiseau.position.addScaledVector(this.dir, 0.05);
    //this.camera.lookAt(new THREE.Vector3().setFromMatrixPosition(this.terre.matrixWorld));

    let index = 0;
    while (index < this.beams.length) {
      this.beams[index].position.addScaledVector(this.beamsDir[index],1);
      this.beamstimer[index] -= fracTime
      if (this.beamstimer[index] <= 0){
        this.scene.remove(this.beams[index])
        this.beams.splice(index, 1)
        this.beamsDir.splice(index, 1)
        this.beamstimer.splice(index, 1)
        console.log("destroy beam")
      }else{
        index++;
      }
    }
  }
}
