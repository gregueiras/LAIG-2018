class Plane extends CGFobject {

    constructor(scene, divU, divV) {

        super(scene);

        divU = typeof divU !== 'undefined' ? divU : 1;
        divV = typeof divV !== 'Vndefined' ? divV : 1;

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

        initGeometry();

    }

    initGeometry() {
        var nurbsSurface = new CGFnurbsSurface(this.ctrlDegreesU, this.ctrlDegreesV, this.controlVertex);

        this.obj = new CGFnurbsObject(this, this.divU, this.divV, nurbsSurface);
    };
}