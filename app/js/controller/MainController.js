import MainView from '../view/MainView';
import '../../bin/STLLoader';

const API_ENDPOINT = 'https://wt71fxqigg.execute-api.us-east-1.amazonaws.com/prod/model/';

const loader = new THREE.STLLoader();
const material = new THREE.MeshNormalMaterial();

export default class MainController {
    constructor() {
        this.view = new MainView(this);
        this.view.initialize();
        this.mesh = null;
    }

    getModels(cb) {
        fetch(API_ENDPOINT + 'list')
            .then((response) => {
                return response.json();
            })
            .then((res) => {
                cb(JSON.parse(res));
            })
            .catch((res) => {
                console.error(res)
            });
    }

    updateModel(model) {
        this.loadModelFromUrl(model.url);
    }

    simplify(model, perc) {
        fetch(API_ENDPOINT + 'simplify?name=' + model.name + '&perc=' + perc)
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                const result = JSON.parse(data);

                this.loadModelFromUrl(result.url);
                console.log('done');
            })
            .catch((res) => {
                console.error(res)
            });

        console.log(model);
    }

    loadModelFromUrl(url) {
        loader.load(url.replace(/^http:\/\//i, 'https://'), (geometry) => {
            if (this.mesh) {
                this.mesh.geometry = geometry;
                this.mesh.geometry.computeVertexNormals();
            } else {
                this.mesh = new THREE.Mesh(geometry, material);
                this.mesh.scale.x = 10;
                this.mesh.scale.y = 10;
                this.mesh.scale.z = 10;
                this.view.renderingContext.scene.add(this.mesh);
            }
        });
    }
}
