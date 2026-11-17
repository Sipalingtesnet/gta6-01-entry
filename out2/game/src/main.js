import * as THREE from 'three';
import { createWorld } from './world.js';
import { Player } from './player.js';
import { VehicleManager } from './vehicles.js';
import { TrafficManager } from './traffic.js';
import { PedestrianManager } from './pedestrians.js';
import { PoliceManager } from './police.js';
import { MissionManager } from './missions.js';
import { CombatManager } from './combat.js';
import { Hud } from './hud.js';
import { AudioManager } from './audio.js';
import { SaveManager } from './save.js';
import { EffectManager } from './effects.js';
import { Input } from './input.js';

const canvas = document.getElementById('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xfcbd88);
scene.fog = new THREE.FogExp2(0xfcbd88, 0.005);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.5, 1000);

const hemiLight = new THREE.HemisphereLight(0xfffbeb, 0x0284c7, 0.9);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffedd5, 1.8);
dirLight.position.set(150, 200, 100);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 1024;
dirLight.shadow.mapSize.height = 1024;
scene.add(dirLight);

const saveMgr = new SaveManager();
const savedState = saveMgr.load();

const world = createWorld(scene, 42);
const player = new Player(scene);
const vehicleMgr = new VehicleManager(scene);
const trafficMgr = new TrafficManager(vehicleMgr, world.spawnPoints);
const pedMgr = new PedestrianManager(scene);
const policeMgr = new PoliceManager(scene, vehicleMgr);
const missionMgr = new MissionManager();
const combatMgr = new CombatManager(scene);
const hud = new Hud();
const audioMgr = new AudioManager();
const effectMgr = new EffectManager(scene);
const input = new Input();

const playerCar = vehicleMgr.spawnCar(10, 10, 0xef4444, true);

const markerGeo = new THREE.ConeGeometry(2, 5, 8);
const markerMat = new THREE.MeshBasicMaterial({ color: 0xeab308 });
const objectiveMarker = new THREE.Mesh(markerGeo, markerMat);
objectiveMarker.rotation.x = Math.PI;
scene.add(objectiveMarker);

let cash = savedState.cash;
let gameState = 'title';

const overlay = document.createElement('div');
overlay.style.cssText = 'position:fixed;inset:0;background:rgba(18,9,10,0.85);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:sans-serif;z-index:100;';
document.body.appendChild(overlay);

function showTitleScreen() {
  gameState = 'title';
  overlay.style.display = 'flex';
  overlay.innerHTML = `
    <h1 style="font-size:56px;color:#f97316;margin-bottom:10px;text-shadow:0 0 20px rgba(249,115,22,0.6)">SUNSET BAY</h1>
    <p style="font-size:20px;color:#cbd5e1;margin-bottom:30px">An Open World Crime Epic</p>
    <div style="background:rgba(255,255,255,0.05);padding:20px;border-radius:12px;margin-bottom:30px;text-align:center;line-height:1.6">
      <b>CONTROLS:</b><br>
      WASD / Arrows — Move / Drive<br>
      E — Enter / Exit Vehicle<br>
      F — Punch / Shoot<br>
      ESC — Pause
    </div>
    <button id="start-btn" style="background:#f97316;color:#fff;border:none;padding:14px 40px;font-size:20px;font-weight:bold;border-radius:8px;cursor:pointer;box-shadow:0 4px 14px rgba(249,115,22,0.4)">START GAME</button>
  `;
  document.getElementById('start-btn').onclick = () => {
    audioMgr.init();
    overlay.style.display = 'none';
    gameState = 'playing';
  };
}

showTitleScreen();

const urlParams = new URLSearchParams(window.location.search);
const shotMode = urlParams.get('shot');
if (shotMode) {
  overlay.style.display = 'none';
  gameState = 'playing';
  if (shotMode === 'chase') {
    player.enterVehicle(playerCar);
    playerCar.mesh.position.set(0, 0, 0);
    policeMgr.setWanted(3);
    policeMgr.policeCars.push(vehicleMgr.spawnCar(0, 15, 0x1e3a8a, false));
    policeMgr.policeCars.push(vehicleMgr.spawnCar(-4, 20, 0x1e3a8a, false));
    policeMgr.policeCars.push(vehicleMgr.spawnCar(4, 20, 0x1e3a8a, false));
  } else if (shotMode === 'drive') {
    player.enterVehicle(playerCar);
    playerCar.mesh.position.set(0, 0, 10);
  } else if (shotMode === 'foot') {
    player.position.set(5, 0, 5);
    player.inCar = false;
    player.mesh.visible = true;
    playerCar.mesh.position.set(8, 0, 5);
  } else if (shotMode === 'mission') {
    player.position.set(10, 0, 10);
    player.inCar = false;
    player.mesh.visible = true;
    playerCar.mesh.position.set(14, 0, 10);
  }
}

let lastTime = performance.now();

function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min(0.1, (now - lastTime) / 1000);
  lastTime = now;

  if (gameState === 'playing') {
    if (input.consumeClick() || input.isDown('KeyE')) {
      if (player.inCar) {
        player.exitVehicle();
        audioMgr.playBeep(300, 0.1);
      } else {
        const dist = player.position.distanceTo(playerCar.mesh.position);
        if (dist < 5.0) {
          player.enterVehicle(playerCar);
          audioMgr.playBeep(500, 0.1);
        }
      }
    }

    if (input.isDown('KeyF')) {
      if (player.inCar) {
        combatMgr.shoot(playerCar.mesh.position, new THREE.Vector3(0, 0, -1));
      } else {
        combatMgr.shoot(player.position, new THREE.Vector3(Math.sin(player.rotation), 0, Math.cos(player.rotation)));
      }
    }

    player.update(dt, input, world.buildings);
    vehicleMgr.updateCar(playerCar, dt, input, world.buildings);
    trafficMgr.update(dt);
    pedMgr.update(dt);
    policeMgr.update(dt, player.inCar ? playerCar.mesh.position : player.position);
    combatMgr.update(dt);
    effectMgr.update(dt);

    const curMission = missionMgr.getCurrent();
    if (curMission && curMission.pos) {
      objectiveMarker.position.copy(curMission.pos);
      objectiveMarker.position.y = 3 + Math.sin(now * 0.005) * 1.5;
      objectiveMarker.rotation.y += dt * 2;
    }

    const targetPos = player.inCar ? playerCar.mesh.position : player.position;
    const targetRot = player.inCar ? playerCar.mesh.rotation.y : player.rotation;

    const camOffset = new THREE.Vector3(
      Math.sin(targetRot + Math.PI) * 9,
      4.8,
      Math.cos(targetRot + Math.PI) * 9
    );
    camera.position.lerp(targetPos.clone().add(camOffset), 0.15);
    camera.lookAt(targetPos.clone().add(new THREE.Vector3(0, 1.4, 0)));

    hud.update({
      cash,
      wanted: policeMgr.wantedLevel,
      mission: curMission,
      speed: Math.round(Math.abs(playerCar.speed) * 3.6),
      playerPos: targetPos,
      trafficCars: trafficMgr.trafficCars,
      policeCars: policeMgr.policeCars,
      missionPos: curMission ? curMission.pos : null
    });
  }

  renderer.render(scene, camera);
}

requestAnimationFrame(animate);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
