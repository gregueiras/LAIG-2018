// Multiply for this const to convert from degrees to radians
const DEGREE_TO_RAD = Math.PI / 180;

//Default key code for changing objects materials
const CHANGE_MATERIAL = "KeyM";

/**
 * XMLscene class, representing the scene that is to be rendered.
 */
let scene;
 class XMLscene extends CGFscene {
  /**
   *Creates an instance of XMLscene and binds it to a interface
   * @param {CGFinterface} myInterface
   * @memberof XMLscene
   */
  constructor(myInterface) {
    super();

    this.interface = myInterface;
    this.lightValues = {};
    this.oldtime = 0;
    this.cameraAnimating = false;
    scene = this;
  }

  /**
   * Initializes the scene, setting some WebGL defaults, initializing the default camera and the axis.
   * @param {CGFApplication} application
   */
  init(application) {
    super.init(application);

    this.sceneInited = false;

    this.initCameras();

    this.enableTextures(true);

    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.axis = new CGFaxis(this);

    let color = {
      r: 1,
      g: 1,
      b: 0,
      a: 0
    };
    this.highlightMaterial = new CGFappearance(this);
    this.highlightMaterial.setColor(color.r, color.g, color.b, color.a);

    this.defaultMaterial = new CGFappearance(this);
    let val = 0.14;
    this.defaultMaterial.setDiffuse(val, val, val, 1);
    this.defaultMaterial.setSpecular(val/2, val/2, val/2, 1);
    this.defaultMaterial.setAmbient(0.1, 0.1, 0.1, 1);
    this.defaultMaterial.setShininess(1.28);
    this.setPickEnabled(true);
  }

  /**
   * Initializes the scene cameras.
   */
  initCameras() {
    this.camera = new CGFcamera(
      0.1,
      0.1,
      500,
      vec3.fromValues(10, 15, 15),
      vec3.fromValues(0, 0, 0)
    );
  }
  /**
   * Initializes the scene lights with the values read from the XML file.
   */
  initLights() {
    let index = 0;

    for (let i = 0; i < this.graph.light.omnis.length && index < 8; i++) {
      const light = this.graph.light.omnis[i];
      this.lightValues[light.id] = light;

      let pos = light.location;
      let amb = light.ambient;
      let dif = light.diffuse;
      let spe = light.specular;
      let l = this.lights[index];

      l.setPosition(pos.x, pos.y, pos.z, 1);
      l.setVisible(true);
      l.setAmbient(amb.r, amb.g, amb.b, amb.a);
      l.setDiffuse(dif.r, dif.g, dif.b, dif.a);
      l.setSpecular(spe.r, spe.g, spe.b, spe.a);
      l.setConstantAttenuation(0);
      l.setLinearAttenuation(0.1);
      l.setQuadraticAttenuation(0);

      index++;
    }

    for (let i = 0; i < this.graph.light.spots.length && index < 8; i++) {
      const light = this.graph.light.spots[i];
      this.lightValues[light.id] = light;

      let pos = light.location;
      let to = light.target;
      let amb = light.ambient;
      let dif = light.diffuse;
      let spe = light.specular;
      let l = this.lights[index];

      l.setPosition(pos.x, pos.y, pos.z, 1);
      l.setVisible(true);
      l.setAmbient(amb.r, amb.g, amb.b, amb.a);
      l.setDiffuse(dif.r, dif.g, dif.b, dif.a);
      l.setSpecular(spe.r, spe.g, spe.b, spe.a);
      l.setSpotCutOff(light.angle);
      l.setSpotExponent(light.exponent);
      l.setSpotDirection(to.x - pos.x, to.y - pos.y, to.z - pos.z);

      l.setConstantAttenuation(0);
      l.setLinearAttenuation(0.1);
      l.setQuadraticAttenuation(0);

      index++;
    }
  }

  /* Handler called when the graph is finally loaded.
   * As loading is asynchronous, this may be called already after the application has started the run loop
   */
  onGraphLoaded() {
    this.axis = new CGFaxis(this, this.graph.axis_length);

    this.loadAmbient();
    this.loadBackground();
    this.initLights();

    // Adds lights group.
    this.interface.addLightsGroup(this.graph.light);

    // Adds camera options
    this.interface.addCameraOptions(this.graph.views);

    // Adds Game options
    this.interface.addGame(this.graph.game);

    this.loadCamera();
    this.sceneInited = true;

    this.oldtime = 0;
    this.setUpdatePeriod(10);
  }

  /**
   *  Apply default camera loaded from XML
   */
  loadCamera() {
    if (this.interface.cameras) {
      let selectedCamera = this.interface.cameras[ACTIVE_CAMERA];
      this.applyCamera(selectedCamera);
    }
  }

  /**
   * Applies a camera to the interface/scene
   * @param {CGFcamera|CGFcameraOrtho} selectedCamera
   * @memberof XMLscene
   */
  applyCamera(selectedCamera) {
    let defOrtho = this.graph.views.orthos[selectedCamera];
    let defPerspective = this.graph.views.perspectives[selectedCamera];
    if (defOrtho != null) {
      let cam = defOrtho;
      let target = cam.to;
      let from = cam.from;
      this.camera = new CGFcameraOrtho(
        cam.left,
        cam.right,
        cam.bottom,
        cam.top,
        cam.near,
        cam.far,
        vec3.fromValues(from.x, from.y, from.z),
        vec3.fromValues(target.x, target.y, target.z),
        vec3.fromValues(0, 1, 0)
      );
      this.camera.id = selectedCamera;
      this.interface.setActiveCamera(this.camera);
    }
    if (defPerspective != null) {
      let cam = defPerspective;
      let target = cam.to;
      let from = cam.from;
      let newC = new CGFcamera(
        DEGREE_TO_RAD * cam.angle,
        cam.near,
        cam.far,
        vec3.fromValues(from.x, from.y, from.z),
        vec3.fromValues(target.x, target.y, target.z)
      );
      this.camera = newC;
      this.camera.id = selectedCamera;
      this.interface.setActiveCamera(this.camera);
    }
    
  }

  updateCameraPosition() {

    if(this.graph.game == null) return;

    let cnt = 0;
    let maxTry = 200;
    
    if(this.graph.game.startRotationToPlayer) {
      let orientation = 1;
      if(this.graph.game.isUndoRotation) {
        orientation = -1;
        this.graph.game.isUndoRotation = false;
      }
      let interval = setInterval(() => {
        ++cnt;
        if (cnt > maxTry) {
          clearInterval(interval);
          return;
        }
        let ang = orientation * Math.PI / maxTry;
        this.camera.orbit([0, 1, 0], ang);
        
      }, 8);
      this.graph.game.startRotationToPlayer = false;
    }

    /*this.graph.game.setCameraAngle();

    this.camera.orbit([0, 1, 0], this.graph.game.cameraRotAngle);*/
    
    if (this.graph.game.state !== GameStates.ANIMATING && this.move) {
      this.cameraTime += this.elapsedTime;

      if (this.cameraTime > this.graph.game.animationSpan) {
        this.cameraTime = 0;
        this.move = undefined;
        this.cameraAnimating = false;
        this.applyCamera(this.newCamera.id)
        this.graph.game.state = GameStates.READY;
      } else {

        let stepRatio = this.cameraTime / this.graph.game.animationSpan;
        let step = vec3.fromValues(
          this.move.x * stepRatio + this.oldPos[0],
          this.move.y * stepRatio + this.oldPos[1],
          this.move.z * stepRatio + this.oldPos[2]
        );
        let stepTarget = vec3.fromValues(
          this.moveTarget.x * stepRatio + this.oldTarget[0],
          this.moveTarget.y * stepRatio + this.oldTarget[1],
          this.moveTarget.z * stepRatio + this.oldTarget[2]
        );

        this.camera.setPosition(step);
        this.camera.setTarget(stepTarget);
        this.camera.fov = this.moveFov * stepRatio + this.oldFov;
      }
    }
  }

  /**
   * Apply background color loaded from XML
   */
  loadBackground() {
    let back = this.graph.background;
    if (back != null) {
      this.gl.clearColor(back.r, back.g, back.b, back.a);
    }
  }

  /**
   * Apply ambient light loaded from XML
   */
  loadAmbient() {
    let amb = this.graph.ambient;
    if (amb != null) {
      this.setGlobalAmbientLight(amb.r, amb.g, amb.b, amb.a);
    }
  }

  /**
   * Changes active camera accordingly to interface
   */
  changeActiveCamera() {
    if (this.interface.cameras) {
      let interfaceCam = this.interface.cameras[ACTIVE_CAMERA];
      let defOrtho = this.graph.views.orthos[interfaceCam];
      let defPerspective = this.graph.views.perspectives[interfaceCam];
      if (this.camera.id != interfaceCam && !this.cameraAnimating) {
        if (defOrtho) {
          this.animateCameraChange(this.camera, defOrtho)
        } else {
          this.animateCameraChange(this.camera, defPerspective)
        }
      }
    }
  }

  animateCameraChange(activeCamera, newCamera) {
    this.cameraAnimating = true;
    this.cameraTime = 0;
    this.newCamera = newCamera;

    this.oldPos = JSON.parse(JSON.stringify(activeCamera.position));
    this.oldTarget = JSON.parse(JSON.stringify(activeCamera.target));
    this.oldFov = JSON.parse(JSON.stringify(activeCamera.fov));
    
    let destination = newCamera.from; 
    let target = newCamera.to; 
  
    this.move = {
      x: destination.x - this.oldPos[0],
      y: destination.y - this.oldPos[1],
      z: destination.z - this.oldPos[2]
    };
    this.moveTarget = {
      x: target.x - this.oldTarget[0],
      y: target.y - this.oldTarget[1],
      z: target.z - this.oldTarget[2]
    };
    this.moveFov = newCamera.angle * DEGREE_TO_RAD - this.oldFov;
    this.graph.game.state = GameStates.STOPPED;
    

  }

  logPicking() {
    if (!this.game && this.graph.primitives) {
      for(const key of Object.keys(this.graph.primitives)) {
        let primitive = this.graph.primitives[key];
        if (primitive.type === "manalath") {
          this.game = primitive.shape;
        }
      }
      this.graph.primitives.forEach(primitive => {
        console.log(primitive.type)
        if (primitive.type === "manalath")
          this.game = primitive;
      });
    }
    if (this.game) {
      if (this.pickMode == false) {
        if (this.pickResults != null && this.pickResults.length > 0) {
          for (var i = 0; i < this.pickResults.length; i++) {
            var obj = this.pickResults[i][0];
            if (obj) {
              this.game.handlePicking(obj);
            }
          }
          this.pickResults.splice(0, this.pickResults.length);
        }
      }
    }
  }
  /**
   * Displays the scene.
   */
  display() {
    this.logPicking();
    this.clearPickRegistration();

    // ---- BEGIN Background, camera and axis setup

    // Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.changeActiveCamera();
    this.updateCameraPosition();

    // Initialize Model-View matrix as identity (no transformation
    this.updateProjectionMatrix();
    this.loadIdentity();

    // Apply transformations corresponding to the camera position relative to the origin
    this.applyViewMatrix();

    this.updateEnvironment();

    this.pushMatrix();

    if (this.sceneInited) {
      // Draw axis
      this.axis.display();
      var i = 0;
      for (var key in this.lightValues) {
        if (this.lightValues.hasOwnProperty(key)) {
          if (this.lightValues[key]) {
            this.lights[i].setVisible(true);
            this.lights[i].enable();
          } else {
            this.lights[i].setVisible(false);
            this.lights[i].disable();
          }
          this.lights[i].update();
          i++;
        }
      }

      // Displays the scene (MySceneGraph function).
      this.graph.displayScene();
    } else {
      // Draw axis
      this.axis.display();
    }

    this.popMatrix();
    // ---- END Background, camera and axis setup

    this.checkKeys();
  }

   updateEnvironment() {
     if (this.interface.lastEnvironment !== this.interface.environment) {
       window.location.search = `?file=${this.interface.environment}`;
     }
   }

  /**
   * Check if the change material key is pressed and processes it
   * @memberof XMLscene
   */
  checkKeys() {
    if (this.interface.isKeyPressed(CHANGE_MATERIAL)) {
      let keys = Object.keys(this.graph.components);
      for (let key of keys) {
        let component = this.graph.components[key];
        component.materialID++;
        if (component.materialID >= component.materials.length) {
          component.materialID = 0;
        }
      }
      this.interface.releaseKey(CHANGE_MATERIAL);
    }
  }

  update(currentTime) {

    this.graph.game.updateCameraTimer(currentTime);

    if (this.oldtime == 0) {
      this.oldtime = currentTime;
      return;
    }
    this.elapsedTime = (currentTime - this.oldtime) / 1000;

    this.oldtime = currentTime;
  }
}
