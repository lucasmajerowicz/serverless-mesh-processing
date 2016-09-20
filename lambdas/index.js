'use strict';

var THREE = require('./three.min');
require('./SimplifyModifier');
require('./STLLoader');
require('./STLExport');

const AWS = require('aws-sdk');
const Utils = require('./Utils');
const path = require('path');

AWS.config.update({
    region: "us-east-1"
});
const bucket = 'hecodes-p6';

const docClient = new AWS.DynamoDB.DocumentClient();
const params = {
    TableName: 'hecodes-models'
};

exports.insert = function (event, context, callback) {
    params.Item = {
        "name": event.name,
        "url": event.url
    };

    docClient.put(params, function(err, data) {
        if (err) {
            callback(JSON.stringify(err));
        } else {
            callback(null, JSON.stringify(data));
        }
    });
};

exports.simplify = function (event, context, callback) {
    simplifyModel(event.name, event.perc, callback);
};

exports.list = function (event, context, callback) {

    docClient.scan(params, (err, data) => {
        if (err) {
            callback(JSON.stringify(err));
        } else {
            callback(null, JSON.stringify(data.Items));
        }
    });
};

function simplifyGeometry(url, perc, callback) {
    var loader = new THREE.STLLoader();

    Utils.readRemoteFile(url, (response) => {
        const bufferGeometry = loader.parse(response);

        const geometry = new THREE.Geometry().fromBufferGeometry(bufferGeometry);
        geometry.mergeVertices();

        const modifier = new THREE.SimplifyModifier();
        const simplifiedGeometry = modifier.modify(geometry, geometry.vertices.length * perc | 0);

        callback(simplifiedGeometry);
    });
}

function simplifyModel(name, perc, callback) {
    params.Key = {
        "name": name
    };

    docClient.get(params, (err, data) => {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            const fileName = 'simplified_' + perc + '_' + path.basename(data.Item.url);
            const targetUrl = 'http://s3.amazonaws.com/' + bucket + '/' + fileName;

            Utils.checkUrlExists(targetUrl, (exists) => {
                if (exists) {
                    callback(null, JSON.stringify({url: targetUrl}));
                } else {
                    simplifyGeometry(data.Item.url, perc, (simplifiedGeometry) => {
                        const exporter = new THREE.STLExporter();
                        const stlData = exporter.parse(new THREE.Mesh(simplifiedGeometry));

                        Utils.uploadFileToS3(bucket, new Buffer(new Uint8Array(stlData.buffer)), fileName, () => {
                            console.log('done');

                            callback(null, JSON.stringify({url: targetUrl}));
                        }, (error) => {
                            console.log(error);
                            console.log('error');
                            callback(error);
                        });
                    });
                }
            });
        }
    });
}