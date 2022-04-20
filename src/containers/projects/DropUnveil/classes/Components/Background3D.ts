import * as THREE from 'three';
import GUI from 'lil-gui';

import { UpdateInfo, Bounds, Mouse } from 'utils/sharedTypes';

import vertexShader from '../shaders/background/vertex.glsl';
import fragmentShader from '../shaders/background/fragment.glsl';
import { InteractiveObject3D } from './InteractiveObject3D';

interface Constructor {
  gui: GUI;
}
export class Background3D extends InteractiveObject3D {
  _mesh: THREE.Mesh<THREE.PlaneBufferGeometry, THREE.ShaderMaterial> | null = null;
  _geometry: THREE.PlaneBufferGeometry | null = null;
  _material: THREE.ShaderMaterial | null = null;
  _gui: GUI;
  _background = {
    color1: [255 / 255, 255 / 255, 229 / 255],
    color2: [255 / 255, 113 / 255, 66 / 255],
    colorAccent: [61 / 255, 66 / 255, 148 / 255],
  };
  _mouse2D = [0, 0];

  constructor({ gui }: Constructor) {
    super();
    this._gui = gui;
    this._setGui();
    this._drawObject();
  }

  _drawObject() {
    this._geometry = new THREE.PlaneBufferGeometry(1, 1, 32, 32);
    this._material = new THREE.ShaderMaterial({
      side: THREE.FrontSide,
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColor1: { value: this._background.color1 },
        uColor2: { value: this._background.color2 },
        uColorAccent: { value: this._background.colorAccent },
        uPlaneRes: {
          value: [1, 1], //Plane size in pixels
        },
        uMouse2D: {
          value: [1, 1], //Mouse coords from [0,0] (top left corner) to [screenWidth , screenHeight]
        },
      },
      wireframe: false,
    });

    this._mesh = new THREE.Mesh(this._geometry, this._material);
    this.add(this._mesh);
  }

  _setGui() {
    const background = this._gui.addFolder('Background');
    background.close();
    background.addColor(this._background, 'color1', 1).name('Color 1');
    background.addColor(this._background, 'color2', 1).name('Color 2');
    background.addColor(this._background, 'colorAccent', 1).name('Color accent');
  }

  setSize(bounds: Bounds) {
    if (this._mesh) {
      this._mesh.scale.x = bounds.width;
      this._mesh.scale.y = bounds.height;
      this._mesh.material.uniforms.uPlaneRes.value = [this._mesh.scale.x, this._mesh.scale.y];
    }
  }

  setMouse2D(mouse: Mouse) {
    if (this._mesh) {
      this._mesh.material.uniforms.uMouse2D.value = [mouse.current.x, mouse.current.y];
    }
  }

  update(updateInfo: UpdateInfo) {
    super.update(updateInfo);

    if (this._mesh) {
      this._mesh.material.uniforms.uTime.value = updateInfo.time * 0.001;
    }
  }

  destroy() {
    super.destroy();
    this._geometry?.dispose();
    this._material?.dispose();
    if (this._mesh) {
      this.remove(this._mesh);
    }
  }
}