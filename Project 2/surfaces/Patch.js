/**
 * Creates a surface based on NURBS representation, 
 * given a list of control points.
 */
class Patch extends CGFobject {

    /**
     * Creates an instance of Patch.
     * 
     * @param {*} scene the scene
     * @param {*} npartsU the number of division along X
     * @param {*} npartsV the number of division along Y
     * @param {*} npointsU the number of points to consider along X
     * @param {*} npointsV the number of points to consider along Y
     * @param {*} controlVertex the list of control points
     */
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

    /**
     * Divides control points accordingly to NURBS parameters.
     * 
     * @param {Points[]} controlVertex the list of control points
     */
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

    /**
     *  Creates the displayable object based on the NURBS surface.
     */
    initGeometry() {
        var nurbsSurface = new CGFnurbsSurface(this.degreesU, this.degreesV, this.controlVertex);

        this.obj = new CGFnurbsObject(this.scene, this.npartsU, this.npartsV, nurbsSurface);
    }

    /**
     * Displays the object.
     */
    display() {
        this.obj.display();
    }
}