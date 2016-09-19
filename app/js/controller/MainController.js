import MainView from '../view/MainView';

const API_ENDPOINT = 'https://wt71fxqigg.execute-api.us-east-1.amazonaws.com/prod/model/';

export default class MainController {
    constructor() {
        this.view = new MainView(this);
        this.view.initialize();
    }

    getModels(cb) {
        fetch(API_ENDPOINT + 'list')
            .then(function (response) {
                return response.json();
            })
            .then(function (res) {
                cb(JSON.parse(res));
            });
    }
}
