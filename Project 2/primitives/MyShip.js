class MyShip {
  constructor(scene) {
    this.scene = scene;

    const nParts = 4;
    const zOffset = 2.5;
    const yOffset = 2;
    const yBase = -2;
    const otherWeight = 0.707;
    const xOffset = 1;

    let controlVertices = [
      [0, -yOffset, zOffset, 1],
      [0, -yOffset, 0, 1],
      [xOffset - 0.01, -yOffset, zOffset, otherWeight],
      [xOffset - 0.01, -yOffset, 0, otherWeight],
      [xOffset - 0.01, yBase, zOffset, 1],
      [xOffset - 0.01, yBase, 0, 1],
      [xOffset - 0.01, yOffset, zOffset, otherWeight],
      [xOffset - 0.01, yOffset, 0, otherWeight],
      [-1.5, yOffset, zOffset, 1],
      [-1.5, yOffset, 0, 1],
      [xOffset, yOffset, zOffset, otherWeight],
      [xOffset, yOffset, 0, otherWeight],
      [xOffset, yBase, zOffset, 1],
      [xOffset, yBase, 0, 1],
      [xOffset, -yOffset, zOffset, otherWeight],
      [xOffset, -yOffset, 0, otherWeight],
      [0, -yOffset, zOffset, 1],
      [0, -yOffset, 0, 1],


    ]

    this.side = new Patch(scene, nParts, nParts, 9, 2, controlVertices);
    this.arms = new cylinder3(scene, 8, 10, 0.7, 0.2, 2.2);
    this.center = new MySphere(scene, 1.1, 20, 20);

    this.text_wing = new CGFtexture(this.scene, './scenes/images/dots.png');
    this.text_arms = new CGFtexture(this.scene, './scenes/images/Spaceship.jpg');
    this.text_ball = new CGFtexture(this.scene, './scenes/images/tie.jpg');

    this.myShader = new CGFshader(this.scene.gl, '../lib/CGF/shaders/Gouraud/textured/multiple_light-vertex.glsl', './shaders/texture2.frag');

    const options = {
      timeFactor: 1,
      normScale: 1,
      myHeightmap: 1,
      myTexture: 0,
      textureScale: 2
    }
    this.myShader.setUniformsValues(options);
  }

  display() {
    const xOffset = 2.3;
    const yOffset = 0.58;
    const zOffset = -1.2;

    this.scene.pushMatrix();

    this.scene.pushMatrix();
    this.text_wing.bind(0);
    this.scene.setActiveShader(this.myShader);

    this.scene.rotate(-5 * DEGREE_TO_RAD, 0, 0, 1);
    this.scene.rotate(180 * DEGREE_TO_RAD, 1, 0, 0);
    this.scene.translate(xOffset, yOffset, zOffset);
    this.side.display();
    this.scene.popMatrix();
    
    this.scene.pushMatrix();
    this.scene.rotate(5 * DEGREE_TO_RAD, 0, 0, 1);
    this.scene.translate(-xOffset, -yOffset, zOffset);
    this.scene.rotate(180 * DEGREE_TO_RAD, 1, 0, 0);
    this.scene.rotate(180 * DEGREE_TO_RAD, 0, 1, 0);
    this.side.display();

    this.text_wing.unbind(0);
    this.scene.popMatrix();
    this.scene.setActiveShader(this.scene.defaultShader);


    this.scene.pushMatrix();
    this.text_ball.bind(0);

    this.scene.rotate(90 * DEGREE_TO_RAD, 0, 1, 0);
    this.center.display();
    this.text_ball.unbind(0);

    this.scene.popMatrix();


    this.scene.pushMatrix();
    this.text_arms.bind(0);

    this.scene.translate(0.7, 0, 0);
    this.scene.rotate(90 * DEGREE_TO_RAD, 0, 1, 0);

    this.arms.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(-0.7, 0, 0);
    this.scene.rotate(-90 * DEGREE_TO_RAD, 0, 1, 0);
    this.scene.rotate(-180 * DEGREE_TO_RAD, 0, 0, 1);

    this.arms.display();
    this.text_arms.unbind(0);
    this.scene.popMatrix();

    this.scene.popMatrix();
  }
}