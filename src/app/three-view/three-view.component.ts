import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

@Component({
  selector: 'app-three-view',
  templateUrl: './three-view.component.html',
  styleUrls: ['./three-view.component.css']
})
export class ThreeViewComponent implements OnInit, AfterViewInit {

  solarSystemScene = new THREE.Scene();

  earth: THREE.Mesh | null = null;
  earthGroup = new THREE.Group();
  moon: THREE.Mesh | null = null;
  moonGroup = new THREE.Group();
  sun: THREE.Mesh | null = null;
  sunGroup = new THREE.Group();
  mars: THREE.Mesh | null = null;
  marsGroup = new THREE.Group();
  venus: THREE.Mesh | null = null;
  venusGroup = new THREE.Group();
  mercure: THREE.Mesh | null = null;
  mercureGroup = new THREE.Group();
  jupiter: THREE.Mesh | null = null;
  jupiterGroup = new THREE.Group();
  saturn: THREE.Mesh | null = null;
  //saturnRing: THREE.Mesh | null = null;
  saturnGroup = new THREE.Group();
  curTime = Date.now();

  renderer: THREE.WebGLRenderer | null = null;
  camera: THREE.PerspectiveCamera | null = null;

  dir = new THREE.Vector3(0, 0, -1);
  axisUP = new THREE.Vector3(0, 1, 0);
  axisRIGHT = new THREE.Vector3(1, 0, 0);
  moove = true

  vaiseau = new THREE.Group();

  beams: Array<THREE.Mesh> = [];
  beamsDir: Array<THREE.Vector3> = [];
  beamstimer: Array<number> = [];

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    document.body.addEventListener("keypress", this.OnkeyPress.bind(this))
    let canvas = document.getElementById("webglcanvas");

    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas!,
      antialias: true
    });
    this.renderer.setSize(canvas!.clientWidth, canvas!.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.camera = new THREE.PerspectiveCamera(45, canvas!.clientWidth / canvas!.clientHeight, 1, 4000);

    let earthMapUrl = "assets/images/earth_atmos_2048.jpg";
    let moonMapUrl = "assets/images/moon_1024.jpg";
    let sunMapUrl = "assets/images/2k_sun.jpg";
    let marsMapUrl = "assets/images/2k_mars.jpg";
    let venusMapUrl = "assets/images/2k_venus_atmosphere.jpg";
    let mercureMapUrl = "assets/images/2k_mercury.jpg";
    let jupiterMapUrl = "assets/images/2k_jupiter.jpg";
    let saturnMapUrl = "assets/images/2k_saturn.jpg";
    //let saturnRingMapUrl = "assets/images/2k_saturn_ring_alpha.png";

    let earthMap = new THREE.TextureLoader().load(earthMapUrl);
    let moonMap = new THREE.TextureLoader().load(moonMapUrl);
    let sunMap = new THREE.TextureLoader().load(sunMapUrl);
    let marsMap = new THREE.TextureLoader().load(marsMapUrl);
    let venusMap = new THREE.TextureLoader().load(venusMapUrl);
    let mercureMap = new THREE.TextureLoader().load(mercureMapUrl);
    let jupiterMap = new THREE.TextureLoader().load(jupiterMapUrl);
    let saturnMap = new THREE.TextureLoader().load(saturnMapUrl);
    //let saturnRingMap = new THREE.TextureLoader().load(saturnRingMapUrl);

    // Now, create a Basic material; pass in the map
    let earthMaterial = new THREE.MeshPhongMaterial({ map: earthMap });
    let moonMaterial = new THREE.MeshPhongMaterial({ map: moonMap });
    let sunMaterial = new THREE.MeshBasicMaterial({ map: sunMap });
    let marsMaterial = new THREE.MeshPhongMaterial({ map: marsMap });
    let venusMaterial = new THREE.MeshPhongMaterial({ map: venusMap });
    let mercureMaterial = new THREE.MeshPhongMaterial({ map: mercureMap });
    let jupiterMaterial = new THREE.MeshPhongMaterial({ map: jupiterMap });
    let saturnMaterial = new THREE.MeshPhongMaterial({ map: saturnMap });
    //let saturnRingMaterial = new THREE.MeshPhongMaterial({ map: saturnRingMap });

    //Pour la géométrie nous allons dire que 10 000 km = 1 unité pour la taille des astres
    //Pour la géométrie nous allons dire que 10 000 000 km = 1 unité pour les distances entre les astres

    //Saturn radius 60 000 km
    //Sauf pour jupiter où nous divisons sa taille par 4
    //Ring start 70 000 km end 200 000 km
    let SaturnGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    //let SaturnRingGeometry = new THREE.RingGeometry(1.75, 5, 32, 32);

    //Jupiter radius 70 000 km
    //Sauf pour jupiter où nous divisons sa taille par 4
    let jupiterGeometry = new THREE.SphereGeometry(1.75, 32, 32);

    // Sun radius 700 000 km
    // Sauf pour le soleil où nous divisons sa taille par 20
    let sunGeometry = new THREE.SphereGeometry(3.5, 32, 32);

    // earth radius 6 400 km
    let earthGeometry = new THREE.SphereGeometry(0.64, 32, 32);

    // moon radius 1 700 km
    let moonGeometry = new THREE.SphereGeometry(0.17, 32, 32);

    // mars radius 3 400 km
    let marsGeometry = new THREE.SphereGeometry(0.34, 32, 32);

    // venus radius 6 000 km
    let venusGeometry = new THREE.SphereGeometry(0.6, 32, 32);

    // mercure radius 2 400 km
    let mercureGeometry = new THREE.SphereGeometry(0.24, 32, 32);

    // And put the geometry and material together into a mesh
    this.saturn = new THREE.Mesh(SaturnGeometry, saturnMaterial);
    //this.saturnRing = new THREE.Mesh(SaturnRingGeometry, saturnRingMaterial);
    this.jupiter = new THREE.Mesh(jupiterGeometry, jupiterMaterial);
    this.earth = new THREE.Mesh(earthGeometry, earthMaterial);
    this.moon = new THREE.Mesh(moonGeometry, moonMaterial);
    this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
    this.mars = new THREE.Mesh(marsGeometry, marsMaterial);
    this.venus = new THREE.Mesh(venusGeometry, venusMaterial);
    this.mercure = new THREE.Mesh(mercureGeometry, mercureMaterial);
    let light = new THREE.PointLight(0xffffff, 2.5, 5000);

    // Ombre par rapport à la ource de lumière du soleil
    light.castShadow = true;
    // On peut aussi paramétrer la qualité du calcul
    light.shadow.mapSize.width = 512;  // default
    light.shadow.mapSize.height = 512; // default
    light.shadow.camera.near = 0.5;    // default

    this.saturn.castShadow = true;
    this.saturn.receiveShadow = true;
    //this.saturnRing.castShadow = true;
    //this.saturnRing.receiveShadow = true;
    this.jupiter.castShadow = true;
    this.jupiter.receiveShadow = true;
    this.earth.castShadow = true;
    this.earth.receiveShadow = true;
    this.moon.castShadow = true;
    this.moon.receiveShadow = true;
    this.mars.castShadow = true;
    this.mars.receiveShadow = true;

    //Distance saturn soleil 1 430 000 000 km
    this.saturn.position.set(143, 0, 0);
    //this.saturnRing.position.set(143, 0, 0);

    //Distance jupiter soleil 778 600 000 km
    this.jupiter.position.set(77.86, 0, 0);

    // Distance terre soleil 150 000 000 km
    this.earth.position.set(15, 0, 0);
    this.moonGroup.position.set(15, 0, 0);

    // Distance terre lune 384 400 km
    this.moon.position.set(3.84, 0, 0);

    // TODO ajouter les deux lune de mars
    // Distance mars soleil 227 944 000 km
    this.mars.position.set(22.7944, 0, 0);

    // Distance venus soleil 108 209 500 km
    this.venus.position.set(10.8209, 0, 0);

    // Distance mercure soleil 57 909 050 km
    this.mercure.position.set(5.7909, 0, 0);

    this.moonGroup.add(this.moon);
    this.earthGroup.add(this.earth);
    this.earthGroup.add(this.moonGroup);
    this.marsGroup.add(this.mars);
    this.venusGroup.add(this.venus);
    this.mercureGroup.add(this.mercure);
    this.jupiterGroup.add(this.jupiter);
    this.saturnGroup.add(this.saturn);
    //this.saturnGroup.add(this.saturnRing);

    this.sunGroup.add(this.sun);
    this.sunGroup.add(this.earthGroup);
    this.sunGroup.add(this.marsGroup);
    this.sunGroup.add(this.venusGroup);
    this.sunGroup.add(this.mercureGroup);
    this.sunGroup.add(this.jupiterGroup);
    this.sunGroup.add(this.saturnGroup);

    this.sunGroup.add(light);
    this.sunGroup.position.z = -50;

    let path = "assets/images/MilkyWay/";
    let format = '.jpg';
    let urls = [
      path + 'posx' + format, path + 'negx' + format,
      path + 'posy' + format, path + 'negy' + format,
      path + 'posz' + format, path + 'negz' + format
    ];

    let textureCube = new THREE.CubeTextureLoader().load(urls);
    textureCube.format = THREE.RGBAFormat;
    this.solarSystemScene.background = textureCube;

    this.solarSystemScene.add(this.sunGroup);

    this.createVaisseau();

    this.run();
  }

  OnkeyPress(key: KeyboardEvent) {
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

  Fire() {
    let geometry = new THREE.CapsuleGeometry(0.01, 1, 32, 16);
    let mat = new THREE.MeshBasicMaterial({ color: 0xff0000 })
    let mesh = new THREE.Mesh(geometry, mat);
    mesh.position.setFromMatrixPosition(this.vaiseau.matrixWorld)
    mesh.setRotationFromEuler(this.vaiseau.rotation)
    mesh.rotateX(Math.PI / 2)
    this.solarSystemScene.add(mesh)
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
    this.camera!.position.y = 0.5;
    this.camera!.position.z = 1.5;

    let light = new THREE.PointLight(0xffffff, 1.5, 10);
    light.position.set(0, 1, 1);
    this.vaiseau.add(light);

    this.vaiseau.add(this.camera!);
    this.vaiseau.position.z = 20;
    //this.camera.lookAt(new THREE.Vector3().setFromMatrixPosition(this.vaiseau.matrixWorld));
    this.solarSystemScene.add(this.vaiseau);
  }

  run() {
    requestAnimationFrame(() => {
      this.run();
    });

    this.render();

    this.animate();
  }

  render() {
    this.renderer!.render(this.solarSystemScene, this.camera!);
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

    //Jupiter
    this.jupiterGroup.rotation.y += angle / 4380; //12 ans
    this.jupiter!.rotation.y += angle * 2.4 //10 h

    this.earthGroup.rotation.y += angle / 365; // la terre tourne en 365 jours
    this.earth!.rotation.y += angle; // et en un jour sur elle-même
    this.moonGroup.rotation.y += angle / 28; // la lune tourne en 28 jours autour de la terre
    this.moon!.rotation.y += angle / 28; // et en 28 jours aussi sur elle-même pour faire face à la terre

    // Mars
    this.marsGroup.rotation.y += angle / 686; // Mars tourne en 686 jours
    this.mars!.rotation.y += angle; // et en un jour sur elle-même

    // Venus
    this.venusGroup.rotation.y += angle / 224; // Mars tourne en 224 jours
    this.venus!.rotation.y += angle / 243; // et en 243 jours sur elle-même

    // Mercure
    this.mercureGroup.rotation.y += angle / 88; // Mars tourne en 88 jours
    this.mercure!.rotation.y += angle / 58; // et en 58 jours sur elle-même

    // Soleil
    this.sun!.rotation.y += angle / 26; // et en 26 jours sur elle-même

    if (this.moove) this.vaiseau.position.addScaledVector(this.dir, 0.05);
    //this.camera.lookAt(new THREE.Vector3().setFromMatrixPosition(this.terre.matrixWorld));

    let index = 0;
    while (index < this.beams.length) {
      this.beams[index].position.addScaledVector(this.beamsDir[index], 1);
      this.beamstimer[index] -= fracTime
      if (this.beamstimer[index] <= 0) {
        this.solarSystemScene.remove(this.beams[index])
        this.beams.splice(index, 1)
        this.beamsDir.splice(index, 1)
        this.beamstimer.splice(index, 1)
        console.log("destroy beam")
      } else {
        index++;
      }
    }
  }
}
