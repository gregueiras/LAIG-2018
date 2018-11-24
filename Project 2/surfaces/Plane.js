/**
 * Creates a square plane based on NURBS representation, 
 * with 1 unit of side.
 */
class Plane extends CGFobject {

    /**
     * Creates an instance of Plane.
     * 
     * @param {*} scene the scene
     * @param {*} divU the number of division along X
     * @param {*} divV the number of division along Y
     */
    constructor(scene, divU, divV) {

        super(scene);

        divU = typeof divU !== 'undefined' ? divU : 1;
        divV = typeof divV !== 'undefined' ? divV : 1;

        this.divU = divU;
        this.divV = divV;

        this.ctrlDegreesU = 1;
        this.ctrlDegreesV = 1;

        this.controlVertex = [ // U = 0
            [ // V = 0..1;
                [-0.5, -0.5, 0.0, 1],
                [-0.5, 0.5, 0.0, 1]

            ],
            // U = 1
            [ // V = 0..1
                [0.5, -0.5, 0.0, 1],
                [0.5, 0.5, 0.0, 1]
            ]
        ];

        this.initGeometry();

        this.initBuffers();

    }

    /**
     * Creates the displayable object based on the NURBS surface.
     */
    initGeometry() {
        var nurbsSurface = new CGFnurbsSurface(this.ctrlDegreesU, this.ctrlDegreesV, this.controlVertex);

        this.obj = new CGFnurbsObject(this.scene, this.divU, this.divV, nurbsSurface);
    }

    /**
     * Displays the object.
     */
    display() {
        this.obj.display();
    }
}