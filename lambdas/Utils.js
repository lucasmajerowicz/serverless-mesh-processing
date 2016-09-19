'use strict';
const http = require('http');
const url = require('url');
const AWS = require('aws-sdk');

class Utils {

    static readRemoteFile(url, cb) {
        http.get(url, (res) => {
            var data = [];

            res.on('data', (chunk) => {
                data.push(chunk);
            });
            res.on('end', () => {
                var binary = Buffer.concat(data);

                cb(Utils.toArrayBuffer(binary));
            });

        }).on('error', (err) => { // Handle errors
            if (cb) cb(err.message);
        });
    };

    static toBuffer(ab) {
        var buf = new Buffer(ab.byteLength);
        var view = new Uint8Array(ab);
        for (var i = 0; i < buf.length; ++i) {
            buf[i] = view[i];
        }
        return buf;
    }

    static toArrayBuffer(buf) {
        var ab = new ArrayBuffer(buf.length);
        var view = new Uint8Array(ab);
        for (var i = 0; i < buf.length; ++i) {
            view[i] = buf[i];
        }
        return ab;
    }

    static uploadFileToS3(Bucket, data, key, onSuccess, onError) {
        const config = {
            params: {Bucket}
        };
        const bucket = new AWS.S3(config);

        const putParams = {
            Key: key,
            ACL: 'public-read',
            ContentType: 'binary/octet-stream',
            Body: data
        };

        bucket.putObject(putParams, (err) => {
            if (err) {
                if (onError) {
                    onError(err);
                }
            } else if (onSuccess) {
                onSuccess();
            }
        });
    }

    static checkUrlExists (Url, callback) {
        var http = require('http'),
            url = require('url');
        var options = {
            method: 'HEAD',
            host: url.parse(Url).host,
            port: 80,
            path: url.parse(Url).pathname
        };
        var req = http.request(options, function (r) {
            callback( r.statusCode== 200);});
        req.end();
    }
}

module.exports = Utils;
