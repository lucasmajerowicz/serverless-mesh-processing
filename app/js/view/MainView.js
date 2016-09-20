import RenderingContext from './RenderingContext';
import { dat } from '../../bin/dat.gui.min.js';

export default class MainView {
    constructor(controller) {
        this.controller = controller;
        this.renderingContext = this.createRenderingContext();
        this.uiSettings = {};
        this.modelsByName = {};
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
            const modelOptions = {};

            models.forEach((model) => {
                modelOptions[model.name] = model.name;
                this.modelsByName[model.name] = model;
            });

            this.uiSettings.model = models[0].name;
            this.uiSettings.quality = 1;

            const gui = new dat.GUI();

            gui.add(this.uiSettings, "model", modelOptions).onChange(() => {
                this.uiSettings.quality = 1;
                this.controller.updateModel(this.getSelectedModel());

                for (var i in gui.__controllers) {
                    gui.__controllers[i].updateDisplay();
                }
            });

            gui.add( this.uiSettings, "quality", [1, 0.75, 0.5, 0.25, 0.1] ).onChange( () => {
                this.controller.simplify(this.getSelectedModel(), 1 - this.uiSettings.quality);
            });

            this.controller.updateModel(models[0]);
        });
    }

    getSelectedModel() {
        return this.modelsByName[this.uiSettings.model];
    }
}