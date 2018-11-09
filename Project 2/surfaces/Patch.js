class Patch extends CGFobject {

    constructor(scene, npartsU, npartsV, npointsU, npointsV, controlVertex) {

        super(scene);

        npartsU = typeof npartsU !== 'undefined' ? npartsU : 1;
        npartsV = typeof npartsV !== 'Vndefined' ? npartsV : 1;
        npointsU = typeof npointsU !== 'undefined' ? npointsU : 1;
        npointsV = typeof npointsV !== 'Vndefined' ? npointsV : 1;

        this.npartsU = npartsU;
        this.npartsV = npartsV;
        this.npointsU = npointsU;
        this.npointsV = npointsV;
        this.degreesU = npointsU - 1;
        this.degreesV = npointsV - 1;

        this.initControlPoints(controlVertex);

        this.initGeometry();

        this.initBuffers();

    }

    initControlPoints(controlVertex) {
        this.controlVertex = [];
        for (let i = 0; i < this.npointsU; i++) {
            let uArr = [];
            for (let j = 0; j < this.npointsV; j++) {
                uArr.push(controlVertex[i * this.npointsV + j]);
            }
            this.controlVertex.push(uArr);
        }
    }

    initGeometry() {
        console.log(this.controlVertex);
        console.log(this.degreesU);
        console.log(this.degreesV);
        console.log(this.npartsU);
        console.log(this.npartsV);
        var nurbsSurface = new CGFnurbsSurface(this.degreesU, this.degreesV, this.controlVertex);

        this.obj = new CGFnurbsObject(this.scene, this.npartsU, this.npartsV, nurbsSurface);

        console.log(nurbsSurface);
        console.log(this.obj);
    }

    display() {
        this.obj.display();
    }
}