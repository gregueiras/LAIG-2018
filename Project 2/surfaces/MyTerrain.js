/**
 * MyTerrain Class, based on Plane, creates a 1x1 plane simulating the relief
 * defined by a height map, heightScale and a texture
 * @class MyTerrain
 * @extends {Plane}
 */
class MyTerrain extends Plane {

  /**
   *Creates an instance of MyTerrain.
   * Calls Plane contructor
   * @param {CGFscene} scene this instance CGFscene
   * @param {Number} div number of parts to divide the plane, in both axis
   * @param {String} idHeightMap id of the height map texture
   * @param {String} idTexture id of the "real" texture
   * @param {Number} heightScale height scale factor, differentiates between the lower and the upper parts of the image 
   * @memberof MyTerrain
   */
  constructor(scene, div, idHeightMap, idTexture, heightScale) {
    super(scene, div, div);

    this.scene.heightMap = this.scene.graph.textures[idHeightMap];
    this.scene.texture = this.scene.graph.textures[idTexture];
    this.myShader = new CGFshader(this.scene.gl, './shaders/map.vertex', './shaders/texture2.frag');

    const options = {
      timeFactor: 1,
      normScale: heightScale,
      myHeightmap: 1,
      myTexture: 0
    }
    this.myShader.setUniformsValues(options);
  }

  /**
   * Changes the activeShader to the custom one
   * After drawing, sets the activeShader back to the default one
   * @memberof MyWater
   */
  display() {
    this.scene.setActiveShader(this.myShader);
    this.scene.pushMatrix();
    this.scene.heightMap.bind(1);
    this.scene.texture.bind(0);

    super.display()

    this.scene.popMatrix();
    this.scene.setActiveShader(this.scene.defaultShader);
  }
}