const Observable = require('../Observable');
const Voxel = require('./Voxel');

class VoxelGrid extends Observable {
    constructor(numCells, cellSize) {
        super();
        this.numCells = numCells;
        this.cellSize = cellSize;
        this.voxels = new Map();
        this.className = 'VoxelGrid';
    }

    addVoxel(voxel) {
        this.voxels.set(voxel.id, voxel);
        this.emit('VoxelAdded', { voxel });
    }

    moveVoxel(voxel, x, y, z) {
        voxel.x = x;
        voxel.y = y;
        voxel.z = z;

        this.emit('VoxelMoved', { voxel });
    }

    removeVoxel(voxel) {
        this.voxels.delete(voxel.id);

        this.emit('VoxelRemoved', { voxel });
    }

    getVoxelById(id) {
        return this.voxels.get(id);
    }

    getNonPointerVoxelByPosition(x, y, z) {
        for (const voxel of this.voxels.values()) {
            if (voxel.type !== Voxel.Pointer && voxel.x === x && voxel.y === y && voxel.z === z) {
                return voxel;
            }
        }

        return null;
    }
}

module.exports = VoxelGrid;
