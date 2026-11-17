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
scene.background = new THREE.Color(0xfdba74);
scene.fog = new THREE.FogExp2(0xfdba74, 0.008);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.5, 1000);

const hemiLight = new THREE.HemisphereLight(0xfff7ed, 0x0c4a6e, 0.6);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffedd5, 1.2);
dirLight.position.set(100, 150, 50);
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
    policeMgr.setWanted(3);
    playerCar.mesh.position.set(0, 0, 0);
  } else if (shotMode === 'drive') {
    player.enterVehicle(playerCar);
    playerCar.mesh.position.set(20, 0, 40);
  } else if (shotMode === 'foot') {
    player.position.set(5, 0, 5);
  } else if (shotMode === 'mission') {
    player.position.set(10, 0, 10);
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
        if (dist < 4.5) {
          player.enterVehicle(playerCar);
          audioMgr.playBeep(500, 0.1);
        }
      }
    }

    player.update(dt, input, world.buildings);
    vehicleMgr.updateCar(playerCar, dt, input, world.buildings);
    trafficMgr.update(dt);
    pedMgr.update(dt);
    policeMgr.update(dt, player.inCar ? playerCar.mesh.position : player.position);
    combatMgr.update(dt);
    effectMgr.update(dt);

    const targetPos = player.inCar ? playerCar.mesh.position : player.position;
    const targetRot = player.inCar ? playerCar.mesh.rotation.y : player.rotation;

    const camOffset = new THREE.Vector3(
      Math.sin(targetRot + Math.PI) * 8,
      4.5,
      Math.cos(targetRot + Math.PI) * 8
    );
    camera.position.lerp(targetPos.clone().add(camOffset), 0.1);
    camera.lookAt(targetPos.clone().add(new THREE.Vector3(0, 1.2, 0)));

    const currentMission = missionMgr.getCurrent();
    hud.update({
      cash,
      wanted: policeMgr.wantedLevel,
      mission: currentMission,
      speed: Math.round(Math.abs(playerCar.speed) * 3.6)
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
