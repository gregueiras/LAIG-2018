/**
 * Creates a square on specified coordinates. if not specified
 * will create square with side 1, centered on XY
 *
 * @extends {CGFobject}
 */
class MyRect2 extends CGFobject {

	/**
	 *Creates an instance of MyQuad.
	 * @param {CGFscene} scene this instance CGFscene
	 * @param {number} x1 the first x value
	 * @param {number} x2 the second x value
	 * @param {number} y1 the first y value
	 * @param {number} y2 the second y value
	 * @memberof MyQuad
	 */
	constructor(scene, x1, x2, y1, y2, cornerOffset) {
		super(scene);

		this.minS = 0;
		this.maxS = 1;
		this.minT = 0;
		this.maxT = 1;

		x1 = typeof x1 !== 'undefined' ? x1 : -0.5;
		y1 = typeof y1 !== 'undefined' ? y1 : -0.5;
		x2 = typeof x2 !== 'undefined' ? x2 : 0.5;
		y2 = typeof y2 !== 'undefined' ? y2 : 0.5;

		this.x1 = x1;
		this.x2 = x2 * (1 + cornerOffset/100);
		this.y1 = y1;
		this.y2 = y2 * (1 + cornerOffset/100);

		this.initBuffers();
	};


	/**
	 * Initializes this instance vertices, indices, normals and texture coordinates.
	 *
	 * @memberof MyQuad
	 */
	initVIN() {
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
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
			0, 0, 1
		];

		this.texCoords = [
			this.minS, this.maxT,
			this.maxS, this.maxT,
			this.minS, this.minT,
			this.maxS, this.minT
		];

	}


	/**
	 * Initializes this instance buffers.
	 *
	 * @memberof MyQuad
	 */
	initBuffers() {

		this.initVIN();
		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	};


	/**
	 * Modifies texture appliance parameters to this instance.
	 *
	 * @param {*} ls the number of units that texture should occupy on X coordinate
	 * @param {*} lt the number of units that texture should occupy on Y coordinate
	 * @memberof MyQuad
	 */
	setTexCoords(ls, lt) {

		this.maxS = this.x1 > this.x2 ? ((this.x1 - this.x2) / ls) : ((this.x2 - this.x1) / ls);
		this.maxT = this.y1 > this.y2 ? 1 / ((this.y1 - this.y2) / lt) : ((this.y2 - this.y1) / lt);

		this.texCoords = [
			this.minS, this.maxT,
			this.maxS, this.maxT,
			this.minS, this.minT,
			this.maxS, this.minT
		];

		this.updateTexCoordsGLBuffers();
	}
};