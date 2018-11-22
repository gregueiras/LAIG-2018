class MyWater extends Plane {

  constructor(scene, div, idWaveMap, idTexture, heightScale, textureScale) {
    super(scene, div, div);

    this.time = 0;
    this.scene.idWaveMap = this.scene.graph.textures[idWaveMap];
    this.scene.textureWater = this.scene.graph.textures[idTexture];
    this.myShader = new CGFshader(this.scene.gl, './shaders/wave.vertex', './shaders/texture2.frag');

    const options = {
      timeFactor: 1,
      normScale: heightScale,
      myHeightmap: 1,
      myTexture: 0
    }
    this.myShader.setUniformsValues(options);
  }

  display() {
    if (this.scene.elapsedTime) {
      this.time += this.scene.elapsedTime;
      let factor = this.time / 8;
      console.log(this.time, factor);
      this.myShader.setUniformsValues({
        timeFactor: factor
      });

      this.scene.setActiveShader(this.myShader);
      this.scene.pushMatrix();
      this.scene.idWaveMap.bind(1);
      this.scene.textureWater.bind(0);

      super.display()

      this.scene.popMatrix();
      this.scene.setActiveShader(this.scene.defaultShader);
    }
  }
}