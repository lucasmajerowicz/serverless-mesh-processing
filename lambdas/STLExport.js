'use strict';

var THREE = require('./three.min');

THREE.STLExporter = function () {


};

THREE.STLExporter.prototype = {

    parse: function(scene) {

        const vector = new THREE.Vector3();
        const normalMatrixWorld = new THREE.Matrix3();

        let triangles = 0;

        scene.traverse((object) => {
            if (!(object instanceof THREE.Mesh)) {
                return;
            }

            if (object.sceneObject) {
                if (object.sceneObject.isEnabled === 'false') {
                    return;
                }
            }

            let geometry = object.geometry;

            if (geometry instanceof THREE.BufferGeometry) {
                geometry = new THREE.Geometry().fromBufferGeometry(geometry);
            }

            if (!(geometry instanceof THREE.Geometry)) {
                return;
            }

            triangles += geometry.faces.length;
        });

        let offset = 80; // skip header
        const bufferLength = triangles * 2 + triangles * 3 * 4 * 4 + 80 + 4;
        const arrayBuffer = new ArrayBuffer(bufferLength);
        const output = new DataView(arrayBuffer);

        output.setUint32(offset, triangles, true);
        offset += 4;

        scene.traverse((object) => {
            if (!(object instanceof THREE.Mesh)) {
                return;
            }

            if (object.sceneObject) {
                if (object.sceneObject.isEnabled === 'false') {
                    return;
                }
            }

            let geometry = object.geometry;

            if (geometry instanceof THREE.BufferGeometry) {
                geometry = new THREE.Geometry().fromBufferGeometry(geometry);
            }

            if (!(geometry instanceof THREE.Geometry)) {
                return;
            }

            const matrixWorld = object.matrixWorld;
            const vertices = geometry.vertices;
            const faces = geometry.faces;

            normalMatrixWorld.getNormalMatrix(matrixWorld);

            for (let i = 0, l = faces.length; i < l; i++) {

                const face = faces[i];

                vector.copy(face.normal).applyMatrix3(normalMatrixWorld).normalize();

                output.setFloat32(offset, vector.x, true);
                offset += 4; // normal
                output.setFloat32(offset, vector.y, true);
                offset += 4;
                output.setFloat32(offset, vector.z, true);
                offset += 4;

                const indices = [face.a, face.b, face.c];

                for (let j = 0; j < 3; j++) {

                    vector.copy(vertices[indices[j]]).applyMatrix4(matrixWorld);

                    output.setFloat32(offset, vector.x, true);
                    offset += 4; // vertices
                    output.setFloat32(offset, vector.y, true);
                    offset += 4;
                    output.setFloat32(offset, vector.z, true);
                    offset += 4;
                }
                output.setUint16(offset, 0, true);
                offset += 2; // attribute byte count
            }
        });
        return output;
    }
};
