class MyTerrain extends Plane {
  
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