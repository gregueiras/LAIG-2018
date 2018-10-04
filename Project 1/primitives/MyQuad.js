/**
 * MyObject
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

class MyQuad extends CGFobject
{
	constructor(scene, x1, x2, y1, y2, minS, maxS, minT, maxT)
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

		x1 = typeof x1 !== 'undefined' ? x1 : -0.5;
		y1 = typeof y1 !== 'undefined' ? y1 : -0.5;
		x2 = typeof x2 !== 'undefined' ? x2 : 0.5;
		y2 = typeof y2 !== 'undefined' ? y2 : 0.5;

		this.x1 = x1;
		this.x2 = x2;
		this.y1 = y1;
		this.y2 = y2;

		this.initBuffers();
	};

	initBuffers()
	{
		this.vertices = [
				this.x1, this.y1, 0,
				this.x2, this.y1, 0,
				this.x1, this.y2, 0,
				this.x2, this.y2, 0,
				];

		this.indices = [
				0, 1, 2,
				3, 2, 1,
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