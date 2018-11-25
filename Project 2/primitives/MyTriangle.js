/**
 * Creates a triangle on specified coordinates. if not specified
 * will create triangle with (0,0,0), (1, 0, 0) and (0,1,0) vertices
 *
 * @extends {CGFobject}
 */

class MyTriangle extends CGFobject {

	/**
	 *Creates an instance of MyTriangle.
	 * @param {CGFscene} scene this instance scene
	 * @param {number} x1 the first vertex X value
	 * @param {number} x2 the second vertex X value
	 * @param {number} x3 the third vertex X value
	 * @param {number} y1 the first vertex Y value
	 * @param {number} y2 the second vertex Y value
	 * @param {number} y3 the third vertex Y value
	 * @param {number} z1 the first vertex Z value
	 * @param {number} z2 the second vertex Z value
	 * @param {number} z3 the third vertex Z value
	 * @memberof MyTriangle
	 */
	constructor(scene, x1, x2, x3, y1, y2, y3, z1, z2, z3) {
		super(scene);

		this.minS = 0;
		this.maxS = 1;
		this.minT = 0;
		this.maxT = 1;

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


	/**
	 * Initializes this instance vertices, indices, normals and texture coordinates.
	 *
	 * @memberof MyTriangle
	 */
	initVIN() {
		this.vertices = [
			this.x1, this.y1, this.z1,
			this.x2, this.y2, this.z2,
			this.x3, this.y3, this.z3,
		];

		this.indices = [
			0, 1, 2,
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
	 * @memberof MyTriangle
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
	 * @memberof MyTriangle
	 */
	setTexCoords(ls, lt) {

		var a = Math.sqrt(Math.pow(this.x1 - this.x3, 2) + Math.pow(this.y1 - this.y3, 2) + Math.pow(this.z1 - this.z3, 2));
		var b = Math.sqrt(Math.pow(this.x2 - this.x3, 2) + Math.pow(this.y2 - this.y3, 2) + Math.pow(this.z2 - this.z3, 2));
		var c = Math.sqrt(Math.pow(this.x3 - this.x2, 2) + Math.pow(this.y3 - this.y2, 2) + Math.pow(this.z3 - this.z2, 2));

		//var alpha = Math.acos((- Math.pow(a, 2) + Math.pow(b, 2) + Math.pow(c, 2)) / (2*b*c));
		var beta = Math.acos((Math.pow(a, 2) - Math.pow(b, 2) + Math.pow(c, 2)) / (2 * a * c));
		//var upsilon = Math.acos((Math.pow(a, 2) + Math.pow(b, 2) - Math.pow(c, 2)) / (2*a*b));

		var x0 = c - a * Math.cos(beta);
		var y0 = lt - a * Math.sin(beta);

		this.texCoords = [
			0, 1,
			c / ls, 1,
			x0 / ls, y0 / lt
		];

		this.updateTexCoordsGLBuffers();
	}
};