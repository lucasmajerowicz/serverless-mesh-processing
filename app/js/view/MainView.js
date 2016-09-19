import RenderingContext from './RenderingContext';
import { dat } from '../../bin/dat.gui.min.js';

export default class MainView {
    constructor(controller) {
        this.controller = controller;
        this.renderingContext = this.createRenderingContext();
    }

    createRenderingContext() {
        const domContainer = document.createElement('div');

        document.body.appendChild(domContainer);

        return RenderingContext.getDefault(domContainer);
    }

    initialize() {
        this.initGUI();

        window.addEventListener('resize', (e) => this.onWindowResize(), false);
        this.render();
    }

    render() {
        this.renderingContext.controls.update();
        requestAnimationFrame(() => this.render());

        this.renderingContext.renderer.render(this.renderingContext.scene, this.renderingContext.camera);
    }

    onWindowResize() {
        this.renderingContext.camera.aspect = window.innerWidth / window.innerHeight;
        this.renderingContext.camera.updateProjectionMatrix();

        this.renderingContext.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    initGUI() {
        this.controller.getModels((models) => {

            console.log(models);
        });

/*
        const types = {'brick': Voxel.Brick, 'grass': Voxel.Grass, 'crate': Voxel.Crate, 'water': Voxel.Water, 'stone': Voxel.Stone};

        this.uiSettings = {
            type: Voxel.Stone
        };
        const gui = new dat.GUI();

        gui.add(this.uiSettings, "type", types);
*/
    }


}