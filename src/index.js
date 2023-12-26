import './index.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import TWEEN from '@tweenjs/tween.js';
import logoSrc from './assets/logo-data.png';

const containerEl = document.querySelector(".globe-wrapper");
const canvas3D = containerEl.querySelector("#globe-3d");
const overlay = document.getElementById("overlay");
const startButton = document.getElementById("startButton");
const fadeOverlay = document.getElementById('fadeOverlay');

let renderer, scene, camera, controls;
let earthTexture, globeMesh;

initScene();

function initScene() {
    renderer = new THREE.WebGLRenderer({
        canvas: canvas3D,
        alpha: true,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 40);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controls.enabled = false;

    new THREE.TextureLoader().load(
        "https://ksenia-k.com/img/earth-map-colored.png",
        function (texture) {
            earthTexture = texture;
            createGlobe();
        }
    );

    window.addEventListener('resize', onWindowResize, false);

    startButton.addEventListener('click', function() {
        zoomAndRotateToFrance();
    });
}

function createGlobe() {
    const globeGeometry = new THREE.SphereGeometry(5, 32, 32);
    const globeMaterial = new THREE.MeshBasicMaterial({ map: earthTexture });
    globeMesh = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globeMesh);
    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(time) {
    requestAnimationFrame(animate);
    TWEEN.update(time);
    controls.update();
    renderer.render(scene, camera);
}

function addMapPointer(lat, lon) {
    const phi = THREE.MathUtils.degToRad(90 - lat);
    const theta = THREE.MathUtils.degToRad(lon + 180);
    const radius = 5.1;

    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    const pointerConeGeometry = new THREE.ConeGeometry(0.1, 0.4, 32);
    const pointerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const pointerCone = new THREE.Mesh(pointerConeGeometry, pointerMaterial);
    pointerCone.position.set(x, y - 0.2, z);
    pointerCone.rotateX(Math.PI);

    const pointerCylinderGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.2, 12);
    const pointerCylinder = new THREE.Mesh(pointerCylinderGeometry, pointerMaterial);
    pointerCylinder.position.set(x, y - 0.1, z);

    scene.add(pointerCone);
    scene.add(pointerCylinder);

    setTimeout(() => additionalZoom(x, y, z), 500);
}

function additionalZoom(x, y, z) {
    const newTargetPosition = { x: x * 1.5, y: y * 1.5, z: z * 1.5 };

    new TWEEN.Tween(camera.position)
        .to(newTargetPosition, 3000)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(() => {
            camera.lookAt(new THREE.Vector3(x, y, z));
        })
        .onComplete(() => {
            setTimeout(triggerFadeToWhite, 500);
        })
        .start();
}

function triggerFadeToWhite() {
    fadeOverlay.style.display = 'block';
    fadeOverlay.style.opacity = 0;
    new TWEEN.Tween({ opacity: 0 })
        .to({ opacity: 1 }, 1000)
        .onUpdate(function(v) {
            fadeOverlay.style.opacity = v.opacity;
        })
        .onComplete(function() {
            redirectToPage();
        })
        .start();
}

function redirectToPage() {
    window.location.href = 'page2.html';
}

function zoomAndRotateToFrance() {
    const lat = 48.8566;
    const lon = 2.3522;
    const phi = THREE.MathUtils.degToRad(90 - lat);
    const theta = THREE.MathUtils.degToRad(lon + 180);
    const radius = 5;

    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    const position = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
    const targetPosition = { x: x * 2, y: y * 2, z: z * 2 };

    new TWEEN.Tween(position)
        .to(targetPosition, 2000)
        .easing(TWEEN.Easing.Cubic.Out)
        .onUpdate(() => {
            camera.position.set(position.x, position.y, position.z);
            camera.lookAt(new THREE.Vector3(x, y, z));
        })
        .onComplete(() => {
            controls.enabled = true;
            controls.target.set(x, y, z);
            setTimeout(() => addMapPointer(48.8400, 2.2700), 500);
        })
        .start();

    new TWEEN.Tween({ opacity: 1 })
        .to({ opacity: 0 }, 1000)
        .onUpdate(function() {
            overlay.style.opacity = this.opacity;
        })
        .onComplete(function() {
            overlay.style.display = 'none';
        })
        .start();
}

document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('logo').src = logoSrc;
});













