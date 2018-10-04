/**
 * MyObject
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

class MyTriangle extends CGFobject
{
	constructor(scene, x1, x2, x3, y1, y2, y3, z1, z2, z3, minS, maxS, minT, maxT)
	{
		super(scene);

		minS = typeof minS !== 'undefined' ? minS : 0;
		minT = typeof minT !== 'undefined' ? minT : 0;
		maxS = typeof maxS !== 'undefined' ? maxS : 1;
		maxT = typeof maxT !== 'undefined' ? maxT : 1;

		this.minS = minS;
		this.maxS = maxS;
		this.minT = minT;
		this.maxT = maxT;

		x1 = typeof x1 !== 'undefined' ? x1 : 0;
        y1 = typeof y1 !== 'undefined' ? y1 : 0;
        z1 = typeof z1 !== 'undefined' ? z1 : 0;
		x2 = typeof x2 !== 'undefined' ? x2 : 1;
        y2 = typeof y2 !== 'undefined' ? y2 : 0;
        z2 = typeof z2 !== 'undefined' ? z2 : 0;
        x3 = typeof x3 !== 'undefined' ? x3 : 0;
        y3 = typeof y3 !== 'undefined' ? y3 : 1;
        z3 = typeof z3 !== 'undefined' ? z3 : 0;

		this.x1 = x1;
        this.x2 = x2;
        this.x3 = x3;
		this.y1 = y1;
        this.y2 = y2;
        this.y3 = y3;
        this.z1 = z1;
        this.z2 = z2;
        this.z3 = z3;

		this.initBuffers();
	};

	initBuffers()
	{
		this.vertices = [
                this.x1, this.y1, this.z1,
                this.x2, this.y2, this.z2,
                this.x3, this.y3, this.z3,
				];

		this.indices = [
				0, 1, 2,
		];

		this.normals = [
			0,0,1,
			0,0,1,
			0,0,1,
			0,0,1
		];

		this.texCoords = [
				this.minS, this.maxT,
				this.maxS, this.maxT,
				this.minS, this.minT,
				this.maxS, this.minT
		];

		this.primitiveType=this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	};
};