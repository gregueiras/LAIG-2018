/**
 * MyWater Class, based on Plane, creates a 1x1 plane simulating the movement of waves
 * defined by a waveMap, heightScale and a texture
 * @class MyWater
 * @extends {Plane}
 */
class MyWater extends Plane {

  /**
   * Creates an instance of MyWater.
   * Calls Plane contructor
   * @param {CGFscene} scene this instance CGFscene
   * @param {Number} div number of parts to divide the plane, in both axis
   * @param {String} idWaveMap id of the wave map texture
   * @param {String} idTexture id of the "real" texture
   * @param {Number} heightScale height scale factor, differentiates between the lower and the upper parts of the image 
   * @param {Number} textureScale TODO
   */
  constructor(scene, div, idWaveMap, idTexture, heightScale, textureScale) {
    super(scene, div, div);

    this.time = 0;
    this.idWaveMap = this.scene.graph.textures[idWaveMap];
    this.textureWater = this.scene.graph.textures[idTexture];
    this.myShader = new CGFshader(this.scene.gl, './shaders/wave.vertex', './shaders/texture2.frag');

    const options = {
      timeFactor: 1,
      normScale: heightScale,
      myHeightmap: 1,
      myTexture: 0
    }
    this.myShader.setUniformsValues(options);
  }

  /**
   * Changes the activeShader to the custom one and updates the animation time
   * After drawing, sets the activeShader back to the default one
   * @memberof MyWater
   */
  display() {
    if (this.scene.elapsedTime) {
      this.time += this.scene.elapsedTime;
      let factor = this.time / 8;
      this.myShader.setUniformsValues({
        timeFactor: factor
      });

      this.scene.setActiveShader(this.myShader);
      this.scene.pushMatrix();
      this.idWaveMap.bind(1);
      this.textureWater.bind(0);

      super.display()

      this.scene.popMatrix();
      this.scene.setActiveShader(this.scene.defaultShader);
    }
  }
}