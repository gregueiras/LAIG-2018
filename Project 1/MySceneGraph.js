/*jshint esversion: 6 */

var DEGREE_TO_RAD = Math.PI / 180;

// Order of the groups in the XML document.
const YAS_INDEX = 0;
const SCENE_INDEX = 0;
const VIEWS_INDEX = 1;
const AMBIENT_INDEX = 2;
const LIGHTS_INDEX = 3;
const TEXTURES_INDEX = 4;
const MATERIALS_INDEX = 5;
const TRANSFORMATIONS_INDEX = 6;
const PRIMITIVES_INDEX = 7;
const COMPONENTS_INDEX = 8;
const INHERIT = "inherit";
const NONE = "none";

/**
 * MySceneGraph class, representing the scene graph.
 */
class MySceneGraph {
  /**
   * @constructor
   */
  constructor(filename, scene) {
    this.loadedOk = null;

    // Establish bidirectional references between scene and graph.
    this.scene = scene;
    scene.graph = this;

    this.nodes = [];

    this.idRoot = null; // The id of the root element.

    this.axisCoords = [];
    this.axisCoords['x'] = [1, 0, 0];
    this.axisCoords['y'] = [0, 1, 0];
    this.axisCoords['z'] = [0, 0, 1];

    // File reading 
    this.reader = new CGFXMLreader();

    /*
     * Read the contents of the xml file, and refer to this class for loading and error handlers.
     * After the file is read, the reader calls onXMLReady on this object.
     * If any error occurs, the reader calls onXMLError on this object, with an error message
     */

    this.reader.open('scenes/' + filename, this);
  }

  buildComponents() {
    let keys = Object.keys(this.primitives);
    for (let key of keys) {
      switch (this.primitives[key].type) {
        case "rectangle":
          this.primitives[key].shape = new MyQuad(
            this.scene,
            this.primitives[key].specs.x1,
            this.primitives[key].specs.x2,
            this.primitives[key].specs.y1,
            this.primitives[key].specs.y2);
          break;
        case "triangle":
          this.primitives[key].shape = new MyTriangle(
            this.scene,
            this.primitives[key].specs.x1,
            this.primitives[key].specs.x2,
            this.primitives[key].specs.x3,
            this.primitives[key].specs.y1,
            this.primitives[key].specs.y2,
            this.primitives[key].specs.y3,
            this.primitives[key].specs.z1,
            this.primitives[key].specs.z2,
            this.primitives[key].specs.z3);
          break;
        case "cylinder":
          this.primitives[key].shape = new MyCylinderBase(
            this.scene,
            this.primitives[key].specs.slices,
            this.primitives[key].specs.stacks,
            this.primitives[key].specs.base,
            this.primitives[key].specs.top,
            this.primitives[key].specs.height);
          break;

        case "torus":
          this.primitives[key].shape = new MyTorus(
            this.scene,
            this.primitives[key].specs.outer,
            this.primitives[key].specs.inner,
            this.primitives[key].specs.slices,
            this.primitives[key].specs.loops);
          break;
        case "sphere":
          this.primitives[key].shape = new MySphere(
            this.scene,
            this.primitives[key].specs.radius,
            this.primitives[key].specs.slices,
            this.primitives[key].specs.stacks);
          break;
        default:
          break;
      }

    }
  }

  /*
   * Callback to be executed after successful reading
   */
  onXMLReady() {
    this.log("XML Loading finished.");
    var rootElement = this.reader.xmlDoc.documentElement;

    // Here should go the calls for different functions to parse the various blocks
    var error = this.parseXMLFile(rootElement);

    if (error != null) {
      this.onXMLError(error);
      return;
    }

    this.loadedOk = true;

    // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
    this.scene.onGraphLoaded();
  }


  parseBlock(node, index) {
    var error;
    switch (index) {
      case SCENE_INDEX:
        error = this.parseScene(node);
        break;
      case VIEWS_INDEX:
        error = this.parseViews(node);
        break;
      case AMBIENT_INDEX:
        error = this.parseAmbient(node);
        break;
      case LIGHTS_INDEX:
        error = this.parseLights(node);
        break;
      case TEXTURES_INDEX:
        error = this.parseTextures(node);
        break;
      case MATERIALS_INDEX:
        error = this.parseMaterials(node);
        break;
      case TRANSFORMATIONS_INDEX:
        error = this.parseTransformations(node);
        break;
      case PRIMITIVES_INDEX:
        error = this.parsePrimitives(node);
        this.buildComponents();
        break;
      case COMPONENTS_INDEX:
        error = this.parseComponents(node);
        break;
    }
    return error;
  }

  processTag(node, nodeNames, tag, tagIndex) {
    var index;
    if ((index = nodeNames.indexOf(tag)) == null)
      return "tag <" + tag + "> missing";
    else {
      if (index != tagIndex)
        this.onXMLMinorError("tag <" + tag + "> out of order");

      //Parse block
      var error;
      if ((error = this.parseBlock(node, tagIndex)) != null)
        return error;
    }
  }

  /**
   * Parses the XML file, processing each block.
   * @param {XML root element} rootElement
   */
  parseXMLFile(rootElement) {
    if (rootElement.nodeName != "yas")
      return "root tag <yas> missing";

    var nodes = rootElement.children;
    if (nodes[0].nodeName == 'parsererror')
      return `invalid XML in ${nodes[nodes.length-1].nodeName} node`;

    // Reads the names of the nodes to an auxiliary buffer.
    var nodeNames = [];

    for (var i = 0; i < nodes.length; i++) {
      nodeNames.push(nodes[i].nodeName);
    }

    var error;

    // Processes each node, verifying errors.

    // <scene>
    error = this.processTag(nodes[SCENE_INDEX], nodeNames, "scene", SCENE_INDEX);
    if (error != null)
      return error;

    // <views>
    error = this.processTag(nodes[VIEWS_INDEX], nodeNames, "views", VIEWS_INDEX);
    if (error != null)
      return error;

    // <lights>
    error = this.processTag(nodes[LIGHTS_INDEX], nodeNames, "lights", LIGHTS_INDEX);
    if (error != null)
      return error;

    // <textures>
    error = this.processTag(nodes[TEXTURES_INDEX], nodeNames, "textures", TEXTURES_INDEX);
    if (error != null)
      return error;

    // <materials>
    error = this.processTag(nodes[MATERIALS_INDEX], nodeNames, "materials", MATERIALS_INDEX);
    if (error != null)
      return error;

    // <transformations>
    error = this.processTag(nodes[TRANSFORMATIONS_INDEX], nodeNames, "transformations", TRANSFORMATIONS_INDEX);
    if (error != null)
      return error;

    // <ambient>
    error = this.processTag(nodes[AMBIENT_INDEX], nodeNames, "ambient", AMBIENT_INDEX);
    if (error != null)
      return error;

    // <primitives>
    error = this.processTag(nodes[PRIMITIVES_INDEX], nodeNames, "primitives", PRIMITIVES_INDEX);
    if (error != null)
      return error;

    // <components>
    error = this.processTag(nodes[COMPONENTS_INDEX], nodeNames, "components", COMPONENTS_INDEX);
    if (error != null)
      return error;

  }

  /**
   * Parses the <INITIALS> block.
   */
  parseScene(sceneNode) {
    this.log("Will parse scene");
    let attributes = sceneNode.attributes;

    let nodeNames = [];

    for (let i = 0; i < attributes.length; i++) {
      nodeNames.push(attributes[i].nodeName);
    }

    // Scene root
    let indexRoot = nodeNames.indexOf("root");
    if (indexRoot == -1) {
      return "scene root missing";
    } else {
      this.idRoot = this.reader.getString(sceneNode, 'root');

      if (!(this.idRoot != -1 && isString(this.idRoot))) {
        return "unable to parse root value";
      }

    }


    // Axis Length
    // (default values)
    this.axis_length = 100;
    var indexAxisLength = nodeNames.indexOf("axis_length");
    if (indexAxisLength == null) {
      // TODO: gregueiras test dollar string 
      this.onXMLMinorError(`axis length missing; assuming ${this.axis_length}`);
    } else {
      this.axis_length = this.reader.getFloat(sceneNode, 'axis_length');
      if (!(this.axis_length != null && !isNaN(this.axis_length))) {
        this.axis_length = 100;
        this.onXMLMinorError(`unable to parse value for axis length; assuming ${this.axis_length}`);
      }
    }

    this.log("Parsed scene");

    return null;
  }

  parseViewOrtho(child) {
    var ortho = {
      id: null,
      near: null,
      far: null,
      left: null,
      right: null,
      top: null,
      bottom: null,
      from: {
        x: null,
        y: null,
        z: null
      },
      to: {
        x: null,
        y: null,
        z: null
      }
    }

    ortho.id = this.reader.getString(child, 'id');
    if (ortho.id == null || !isString(ortho.id)) {
      return "unable to parse id value";
    }

    // Check for repeated id
    var reply;
    if ((reply = this.checkForRepeatedId(ortho.id, this.views.perspectives)) != "OK")
      return reply;

    if ((reply = this.checkForRepeatedId(ortho.id, this.views.orthos)) != "OK")
      return reply;

    ortho.near = this.reader.getFloat(child, 'near');
    if (ortho.near == null || isNaN(ortho.near)) {
      return "unable to parse near value";
    }

    ortho.far = this.reader.getFloat(child, 'far');
    if (ortho.far == null || isNaN(ortho.far)) {
      return "unable to parse far value";
    }

    ortho.left = this.reader.getFloat(child, 'left');
    if (ortho.left == null || isNaN(ortho.left)) {
      return "unable to parse left value";
    }

    ortho.right = this.reader.getFloat(child, 'right');
    if (ortho.right == null || isNaN(ortho.right)) {
      return "unable to parse right value";
    }

    ortho.top = this.reader.getFloat(child, 'top');
    if (ortho.top == null || isNaN(ortho.top)) {
      return "unable to parse top value";
    }

    ortho.bottom = this.reader.getFloat(child, 'bottom');
    if (ortho.bottom == null || isNaN(ortho.bottom)) {
      return "unable to parse bottom value";
    }

    var grandchildren = child.children;

    for (var j = 0; j < grandchildren.length; j++) {
      this.parseViewPerspectiveChildren(grandchildren[j], ortho);
    }

    this.views.orthos[ortho.id] = ortho;
    return 0;
  }

  parseViewPerspectiveChildren(child, perspective) {
    if (child.nodeName == "from") {
      perspective.from.x = this.reader.getFloat(child, 'x');
      if (perspective.from.x == null || isNaN(perspective.from.x)) {
        return "unable to parse from/x value";
      }

      perspective.from.y = this.reader.getFloat(child, 'y');
      if (perspective.from.y == null || isNaN(perspective.from.y)) {
        return "unable to parse from/y value";
      }

      perspective.from.z = this.reader.getFloat(child, 'z');
      if (perspective.from.z == null || isNaN(perspective.from.z)) {
        return "unable to parse from/z value";
      }
    } else if (child.nodeName == "to") {
      perspective.to.x = this.reader.getFloat(child, 'x');
      if (perspective.to.x == null || isNaN(perspective.to.x)) {
        return "unable to parse to/x value";
      }

      perspective.to.y = this.reader.getFloat(child, 'y');
      if (perspective.to.y == null || isNaN(perspective.to.y)) {
        return "unable to parse to/y value";
      }

      perspective.to.z = this.reader.getFloat(child, 'z');
      if (perspective.to.z == null || isNaN(perspective.to.z)) {
        return "unable to parse to/z value";
      }
    } else
      this.onXMLMinorError("unknown tag <" + child.nodeName + "/" + child.nodeName + ">");
  }

  parseViewPerspective(child) {
    var perspective = {
      id: null,
      near: null,
      far: null,
      angle: null,
      from: {
        x: null,
        y: null,
        z: null
      },
      to: {
        x: null,
        y: null,
        z: null
      },
    }

    perspective.id = this.reader.getString(child, 'id');
    if (perspective.id == null || !isString(perspective.id)) {
      return "unable to parse id value";
    }

    // Check for repeated id
    var reply;
    if ((reply = this.checkForRepeatedId(perspective.id, this.views.perspectives)) != "OK")
      return reply;

    if ((reply = this.checkForRepeatedId(perspective.id, this.views.orthos)) != "OK")
      return reply;

    perspective.near = this.reader.getFloat(child, 'near');
    if (perspective.near == null || isNaN(perspective.near)) {
      return "unable to parse near value";
    }

    perspective.far = this.reader.getFloat(child, 'far');
    if (perspective.far == null || isNaN(perspective.far)) {
      return "unable to parse far value";
    }

    perspective.angle = this.reader.getFloat(child, 'angle');
    if (perspective.angle == null || isNaN(perspective.angle)) {
      return "unable to parse angle value";
    }

    var grandchildren = child.children;

    for (var j = 0; j < grandchildren.length; j++) {
      this.parseViewPerspectiveChildren(grandchildren[j], perspective);
    }

    //this.views.perspectives.push(perspective);
    this.views.perspectives[perspective.id] = perspective;
    return 0;
  }

  checkDefaultViewExistance() {

    let def = this.views.default;
    let orthos = this.views.orthos;

    if (orthos[def] != undefined) {
      return true;
    }

    let persps = this.views.perspectives;

    if (persps[def] != undefined) {
      return true;
    }

    return false;
  }

  /**
   * Parses the <views> block.
   * @param {views block element} viewsNode
   */
  parseViews(viewsNode) {
    this.log("Will parse views");
    var children = viewsNode.children;
    let attributes = viewsNode.attributes;
    let viewsNames = [];

    for (let i = 0; i < attributes.length; i++) {
      viewsNames.push(attributes[i].nodeName);
    }

    this.views = {
      default: null,
      perspectives: [],
      orthos: []
    }

    // Views default
    let viewsDefault = viewsNames.indexOf("default");
    if (viewsDefault == null) {
      return "views default missing";
    } else {
      this.views.default = this.reader.getString(viewsNode, 'default');

      if (this.views.default == null || !isString(this.views.default)) {
        return "unable to parse default value";
      }
    }

    //Any number of Views
    if (children.length < 1)
      return "no views available";

    for (var i = 0; i < children.length; i++) {

      if (children[i].nodeName == "perspective") {
        let error = this.parseViewPerspective(children[i]);
        if (error == 0)
          this.log("perspective parsed");
        else
          return error;

      } else if (children[i].nodeName == "ortho") {
        let error = this.parseViewOrtho(children[i]);
        if (error == 0)
          this.log("ortho parsed");
        else
          return error;
      } else
        this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
    }

    if (!this.checkDefaultViewExistance()) {
      return "Nonexistent default view";
    }
    this.log("Parsed views");
    return null;
  }


  /**
   * Parses the <ambient> node.
   * @param {ambient block element} ambientNode
   */
  parseAmbient(ambientNode) {

    var children = ambientNode.children;

    var nodeNames = [];

    for (let child of children)
      nodeNames.push(child.nodeName);

    // Ambient light values
    // (default values)
    this.ambient = {
      r: 0,
      g: 0,
      b: 0,
      a: 1
    };

    var indexAmbient = nodeNames.indexOf("ambient");
    if (indexAmbient == null) {
      this.onXMLMinorError(`ambient light values missing; assuming RGBA(${this.ambient.r}, ${this.ambient.g}, ${this.ambient.b}, ${this.ambient.a})`);
    } else {
      this.ambient.r = this.reader.getFloat(children[indexAmbient], 'r');
      this.ambient.g = this.reader.getFloat(children[indexAmbient], 'g');
      this.ambient.b = this.reader.getFloat(children[indexAmbient], 'b');
      this.ambient.a = this.reader.getFloat(children[indexAmbient], 'a');

      if (!(this.ambient.r != null && !isNaN(this.ambient.r))) {
        this.ambient.r = 0;
        this.onXMLMinorError(`unable to parse value for ambient red component; assuming 'r=${this.ambient.r}`);
      }
      if (!(this.ambient.g != null && !isNaN(this.ambient.g))) {
        this.ambient.g = 0;
        this.onXMLMinorError(`unable to parse value for ambient green component; assuming 'r=${this.ambient.g}`);
      }
      if (!(this.ambient.b != null && !isNaN(this.ambient.b))) {
        this.ambient.b = 0;
        this.onXMLMinorError(`unable to parse value for ambient blue component; assuming 'r=${this.ambient.b}`);
      }
      if (!(this.ambient.a != null && !isNaN(this.ambient.a))) {
        this.ambient.a = 1;
        this.onXMLMinorError(`unable to parse value for ambient alpha component; assuming 'r=${this.ambient.a}`);
      }

      if (!isBetween(this.ambient.r, 0, 1)) {
        return "red ambient component must be between 0 and 1";
      }
      if (!isBetween(this.ambient.g, 0, 1)) {
        return "green ambient component must be between 0 and 1";
      }
      if (!isBetween(this.ambient.b, 0, 1)) {
        return "blue ambient component must be between 0 and 1";
      }
      if (!isBetween(this.ambient.a, 0, 1)) {
        return "alpha ambient component must be between 0 and 1";
      }
    }
    // Background color values
    // (default values)
    this.background = {
      r: 0,
      g: 0,
      b: 0,
      a: 1
    };


    var indexBackground = nodeNames.indexOf("background");
    if (indexBackground == null) {
      this.onXMLMinorError(`background light values missing; assuming RGBA(${this.background.r}, ${this.background.g}, ${this.background.b}, ${this.background.a})`);
    } else {
      this.background.r = this.reader.getFloat(children[indexBackground], 'r');
      this.background.g = this.reader.getFloat(children[indexBackground], 'g');
      this.background.b = this.reader.getFloat(children[indexBackground], 'b');
      this.background.a = this.reader.getFloat(children[indexBackground], 'a');

      if (!(this.background.r != null && !isNaN(this.background.r))) {
        this.background.r = 0;
        this.onXMLMinorError(`unable to parse value for background red component; assuming 'r=${this.background.r}`);
      }
      if (!(this.background.g != null && !isNaN(this.background.g))) {
        this.background.g = 0;
        this.onXMLMinorError(`unable to parse value for background green component; assuming 'r=${this.background.g}`);
      }
      if (!(this.background.b != null && !isNaN(this.background.b))) {
        this.background.b = 0;
        this.onXMLMinorError(`unable to parse value for background blue component; assuming 'r=${this.background.b}`);
      }
      if (!(this.background.a != null && !isNaN(this.background.a))) {
        this.background.a = 1;
        this.onXMLMinorError(`unable to parse value for background alpha component; assuming 'r=${this.background.a}`);
      }

      if (!isBetween(this.background.r, 0, 1)) {
        return "red background component must be between 0 and 1";
      }
      if (!isBetween(this.background.g, 0, 1)) {
        return "green background component must be between 0 and 1";
      }
      if (!isBetween(this.background.b, 0, 1)) {
        return "blue background component must be between 0 and 1";
      }
      if (!isBetween(this.background.a, 0, 1)) {
        return "alpha background component must be between 0 and 1";
      }
    }
  }

  checkForRepeatedId(id, arr) {
    let keys = Object.keys(arr);
    for (let key of keys) {
      if (id == arr[key].id)
        return "repeated id value";
    }
    return "OK";
  }

  parseChildrenColours(param, child) {
    param.r = this.reader.getFloat(child, 'r');
    if (param.r == null || isNaN(param.r) || !isBetween(param.r, 0, 1)) {
      return "unable to parse r value";
    }

    param.g = this.reader.getFloat(child, 'g');
    if (param.g == null || isNaN(param.g) || !isBetween(param.g, 0, 1)) {
      return "unable to parse g value";
    }

    param.b = this.reader.getFloat(child, 'b');
    if (param.b == null || isNaN(param.b) || !isBetween(param.b, 0, 1)) {
      return "unable to parse b value";
    }

    param.a = this.reader.getFloat(child, 'a');
    if (param.a == null || isNaN(param.a) || !isBetween(param.a, 0, 1)) {
      return "unable to parse a value";
    }
  }

  parseChildrenCoordinates(param, child, forthCoor) {
    param.x = this.reader.getFloat(child, 'x');
    if (param.x == null || isNaN(param.x)) {
      return "unable to parse location/x value";
    }

    param.y = this.reader.getFloat(child, 'y');
    if (param.y == null || isNaN(param.y)) {
      return "unable to parse location/y value";
    }

    param.z = this.reader.getFloat(child, 'z');
    if (param.z == null || isNaN(param.z)) {
      return "unable to parse location/z value";
    }

    if (forthCoor == 1) {
      param.w = this.reader.getFloat(child, 'w');
      if (param.w == null || isNaN(param.w)) {
        return "unable to parse location/w value";
      }
    }

    return 0;
  }

  parseLightsOmniChildren(child, omni) {
    switch (child.nodeName) {
      case "location":
        return this.parseChildrenCoordinates(omni.location, child, 1);

      case "ambient":
        return this.parseChildrenColours(omni.ambient, child);

      case "diffuse":
        return this.parseChildrenColours(omni.diffuse, child);

      case "specular":
        return this.parseChildrenColours(omni.specular, child);

      default:
        this.onXMLMinorError("unknown tag <" + child.nodeName + ">");
        return 0;

    }
  }

  parseLightsOmni(child) {
    var omni = {
      id: null,
      enabled: null,
      location: {
        x: null,
        y: null,
        z: null,
        w: null
      },
      ambient: {
        r: null,
        g: null,
        b: null,
        a: null
      },
      diffuse: {
        r: null,
        g: null,
        b: null,
        a: null
      },
      specular: {
        r: null,
        g: null,
        b: null,
        a: null
      }
    }

    omni.id = this.reader.getString(child, 'id');
    if (omni.id == null || !isString(omni.id)) {
      return "unable to parse id value";
    }

    // Check for repeated id
    var reply;
    if ((reply = this.checkForRepeatedId(omni.id, this.light.omnis)) != "OK")
      return reply;

    if ((reply = this.checkForRepeatedId(omni.id, this.light.spots)) != "OK")
      return reply;

    omni.enabled = this.reader.getFloat(child, 'enabled');
    if (omni.enabled == null || !isBoolean(omni.enabled)) {
      return "unable to parse enabled value";
    }

    var grandchildren = child.children;

    for (var j = 0; j < grandchildren.length; j++) {
      this.parseLightsOmniChildren(grandchildren[j], omni);
    }

    this.light.omnis.push(omni);
    return 0;
  }

  parseLightsSpotChildren(child, spot) {
    switch (child.nodeName) {
      case "location":
        this.parseChildrenCoordinates(spot.location, child, 1);
        break;
      case "target":
        this.parseChildrenCoordinates(spot.target, child, 0);
        break;
      case "ambient":
        this.parseChildrenColours(spot.ambient, child);
        break;
      case "diffuse":
        this.parseChildrenColours(spot.diffuse, child);
        break;
      case "specular":
        this.parseChildrenColours(spot.specular, child);
        break;
      default:
        this.onXMLMinorError("unknown tag <" + child.nodeName + "/" + child.nodeName + ">");
        break;
    }
  }

  parseLightsSpot(child) {
    var spot = {
      id: null,
      enabled: null,
      angle: null,
      exponent: null,
      location: {
        x: null,
        y: null,
        z: null,
        w: null
      },
      target: {
        x: null,
        y: null,
        z: null
      },
      ambient: {
        r: null,
        g: null,
        b: null,
        a: null
      },
      diffuse: {
        r: null,
        g: null,
        b: null,
        a: null
      },
      specular: {
        r: null,
        g: null,
        b: null,
        a: null
      }
    }

    spot.id = this.reader.getString(child, 'id');
    if (spot.id == null || !isString(spot.id)) {
      return "unable to parse id value";
    }

    // Check for repeated id
    var reply;
    if ((reply = this.checkForRepeatedId(spot.id, this.light.omnis)) != "OK")
      return reply;

    if ((reply = this.checkForRepeatedId(spot.id, this.light.spots)) != "OK")
      return reply;

    spot.enabled = this.reader.getFloat(child, 'enabled');
    if (spot.enabled == null || !isBoolean(spot.enabled)) {
      return "unable to parse enabled value";
    }

    spot.angle = this.reader.getFloat(child, 'angle');
    if (spot.angle == null || isNaN(spot.angle)) {
      return "unable to parse angle value";
    }

    spot.exponent = this.reader.getFloat(child, 'exponent');
    if (spot.exponent == null || isNaN(spot.exponent)) {
      return "unable to parse exponent value";
    }

    var grandchildren = child.children;

    for (var j = 0; j < grandchildren.length; j++) {
      this.parseLightsSpotChildren(grandchildren[j], spot);
    }

    this.light.spots.push(spot);
    return 0;
  }

  /**
   * Parses the <LIGHTS> block. 
   * @param {lights block element} lightsNode
   */
  parseLights(lightsNode) {
    var children = lightsNode.children;

    this.light = {
      omnis: [],
      spots: []
    }

    //Any number of Lights
    if (children.length < 1)
      return "no lights available"
    for (var i = 0; i < children.length; i++) {

      if (children[i].nodeName == "omni") {
        let error = this.parseLightsOmni(children[i]);
        if (error == 0)
          this.log("omni parsed");
        else
          return error;
      } else if (children[i].nodeName == "spot") {
        let error = this.parseLightsSpot(children[i]);
        if (error == 0)
          this.log("spot parsed");
        else
          return error;
      } else
        this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
    }

    this.log("Parsed lights");
    return null;
  }

  parseTexturesTexture(child) {
    var texture = {
      id: null,
      file: null
    }

    texture.id = this.reader.getString(child, 'id');
    if (texture.id == null || !isString(texture.id)) {
      return "unable to parse id value";
    }

    //Check for repeated Id
    var reply;
    if ((reply = this.checkForRepeatedId(texture.id, this.textures)) != "OK")
      return reply;

    texture.file = this.reader.getString(child, 'file');
    if (texture.file == null || !isString(texture.file)) {
      return "unable to parse file value";
    }

    this.createTexture(texture);
    return 0;
  }

  createTexture(texture) {
    let tex = new CGFtexture(this.scene, texture.file);
    this.textures[texture.id] = tex;
  }

  parseTextures(texturesNode) {
    var children = texturesNode.children;

    this.textures = [];
    //    this.textures[NONE] = new CGFtexture(this.scene);
    if (children.length < 1)
      return "no textures available"
    for (var i = 0; i < children.length; i++) {
      let error = this.parseTexturesTexture(children[i]);
      if (error != 0)
        return error;
    }

    this.log("Parsed textures");
    return null;
  }

  parseMaterialsMaterialChildren(child, material) {
    switch (child.nodeName) {
      case "emission":
        this.parseChildrenColours(material.emission, child);
        break;
      case "ambient":
        this.parseChildrenColours(material.ambient, child);
        break;
      case "diffuse":
        this.parseChildrenColours(material.diffuse, child);
        break;
      case "specular":
        this.parseChildrenColours(material.specular, child);
        break;
      default:
        this.onXMLMinorError("unknown tag <" + child.nodeName + ">");
        break;
    }
  }

  parseMaterial(child) {
    var material = {
      id: null,
      shininess: null,
      emission: {
        r: null,
        g: null,
        b: null,
        a: null
      },
      ambient: {
        r: null,
        g: null,
        b: null,
        a: null
      },
      diffuse: {
        r: null,
        g: null,
        b: null,
        a: null
      },
      specular: {
        r: null,
        g: null,
        b: null,
        a: null
      }
    }

    material.id = this.reader.getString(child, 'id');
    if (material.id == null || !isString(material.id)) {
      return "unable to parse id value";
    }

    // Check for repeated id
    var reply;
    if ((reply = this.checkForRepeatedId(material.id, this.materials)) != "OK")
      return reply;

    material.shininess = this.reader.getFloat(child, 'shininess');
    if (material.shininess == null || isNaN(material.shininess)) {
      return "unable to parse shininess value";
    }

    var grandchildren = child.children;

    for (var j = 0; j < grandchildren.length; j++) {
      this.parseMaterialsMaterialChildren(grandchildren[j], material);
    }


    this.createMaterial(material);
    return 0;
  }

  createMaterial(material) {
    let newMaterial = new CGFappearance(this.scene);
    newMaterial.setShininess(material.shininess);

    let color = material.emission;
    newMaterial.setEmission(color.r, color.g, color.b, color.a);

    color = material.ambient;
    newMaterial.setAmbient(color.r, color.g, color.b, color.a);

    color = material.diffuse;
    newMaterial.setDiffuse(color.r, color.g, color.b, color.a);

    color = material.specular;
    newMaterial.setSpecular(color.r, color.g, color.b, color.a);

    //newMaterial.setTextureWrap('CLAMP_TO_EDGE','CLAMP_TO_EDGE');

    this.materials[material.id] = newMaterial;
  }

  /**
   * Parses the <MATERIALS> node.
   * @param {materials block element} materialsNode
   */
  parseMaterials(materialsNode) {
    var children = materialsNode.children;

    this.materials = [];

    //Any number of Materials
    if (children.length < 1)
      return "no materials available"
    for (var i = 0; i < children.length; i++) {
      let error = this.parseMaterial(children[i]);
      if (error != 0)
        return error;
    }
    this.log("Parsed materials");
    return null;

  }

  parseChildrenRotation(param, child) {
    param.axis = this.reader.getString(child, 'axis');
    if (param.axis == null || !isAxis(param.axis)) {
      return "unable to parse axis value";
    }

    param.angle = this.reader.getFloat(child, 'angle');
    if (param.angle == null || isNaN(param.angle)) {
      return "unable to parse angle value";
    }
  }

  parseTransformationsTransformationChildren(child, material) {
    switch (child.nodeName) {
      case "translate":
      case "scale":
        var tmpCoor = {
          x: null,
          y: null,
          z: null,
          type: null
        };

        this.parseChildrenCoordinates(tmpCoor, child, 0);
        tmpCoor.type = child.nodeName;

        if (child.nodeName == "translate") {
          material.steps.push(tmpCoor);
        } else {
          material.steps.push(tmpCoor);
        }
        break;
      case "rotate":
        var tmpRot = {
          axis: null,
          angle: null,
          type: "rotate"
        };
        this.parseChildrenRotation(tmpRot, child);
        material.steps.push(tmpRot);
        break;
      default:
        this.onXMLMinorError("unknown tag <" + child.nodeName + ">");
        break;
    }
  }

  parseTransformation(child) {
    var transformation = {
      id: null,
      steps: []
    };

    transformation.id = this.reader.getString(child, 'id');
    if (transformation.id == null || !isString(transformation.id)) {
      return "unable to parse id value";
    }

    // Check for repeated id
    var reply;
    if ((reply = this.checkForRepeatedId(transformation.id, this.transformations)) != "OK")
      return reply;

    var grandchildren = child.children;

    for (var j = 0; j < grandchildren.length; j++) {
      this.parseTransformationsTransformationChildren(grandchildren[j], transformation);
    }

    this.transformations[transformation.id] = transformation;
    return 0;
  }

  /**
   * Parses the <TRANSFORMATIONS> node.
   * @param {transformations block element} transformationsNode
   */
  parseTransformations(transformationsNode) {
    var children = transformationsNode.children;

    this.transformations = [];

    //Any number of transformations
    if (children.length < 1)
      return "no transformations available"
    for (var i = 0; i < children.length; i++) {
      let error = this.parseTransformation(children[i]);
      if (error != 0)
        return error;
    }
    this.log("Parsed transformations");
    return null;

  }

  parseChildrenRectangle(rectangle, child) {
    rectangle.x1 = this.reader.getFloat(child, 'x1');
    if (rectangle.x1 == null || isNaN(rectangle.x1)) {
      return "unable to parse x1 value";
    }

    rectangle.x2 = this.reader.getFloat(child, 'x2');
    if (rectangle.x2 == null || isNaN(rectangle.x2)) {
      return "unable to parse x2 value";
    }

    rectangle.y1 = this.reader.getFloat(child, 'y1');
    if (rectangle.y1 == null || isNaN(rectangle.y1)) {
      return "unable to parse y1 value";
    }

    rectangle.y2 = this.reader.getFloat(child, 'y2');
    if (rectangle.y2 == null || isNaN(rectangle.y2)) {
      return "unable to parse y2 value";
    }
  }

  parseChildrenTriangle(triangle, child) {
    triangle.x1 = this.reader.getFloat(child, 'x1');
    if (triangle.x1 == null || isNaN(triangle.x1)) {
      return "unable to parse x1 value";
    }

    triangle.x2 = this.reader.getFloat(child, 'x2');
    if (triangle.x2 == null || isNaN(triangle.x2)) {
      return "unable to parse x2 value";
    }

    triangle.x3 = this.reader.getFloat(child, 'x3');
    if (triangle.x3 == null || isNaN(triangle.x3)) {
      return "unable to parse x3 value";
    }

    triangle.y1 = this.reader.getFloat(child, 'y1');
    if (triangle.y1 == null || isNaN(triangle.y1)) {
      return "unable to parse y1 value";
    }

    triangle.y2 = this.reader.getFloat(child, 'y2');
    if (triangle.y2 == null || isNaN(triangle.y2)) {
      return "unable to parse y2 value";
    }

    triangle.y3 = this.reader.getFloat(child, 'y3');
    if (triangle.y3 == null || isNaN(triangle.y3)) {
      return "unable to parse y3 value";
    }

    triangle.z1 = this.reader.getFloat(child, 'z1');
    if (triangle.z1 == null || isNaN(triangle.z1)) {
      return "unable to parse z1 value";
    }

    triangle.z2 = this.reader.getFloat(child, 'z2');
    if (triangle.z2 == null || isNaN(triangle.z2)) {
      return "unable to parse z2 value";
    }

    triangle.z3 = this.reader.getFloat(child, 'z3');
    if (triangle.z3 == null || isNaN(triangle.z3)) {
      return "unable to parse z3 value";
    }
  }

  parseChildrenCylinder(cylinder, child) {
    cylinder.base = this.reader.getFloat(child, 'base');
    if (cylinder.base == null || isNaN(cylinder.base)) {
      return "unable to parse base value";
    }

    cylinder.top = this.reader.getFloat(child, 'top');
    if (cylinder.top == null || isNaN(cylinder.top)) {
      return "unable to parse top value";
    }

    cylinder.height = this.reader.getFloat(child, 'height');
    if (cylinder.height == null || isNaN(cylinder.height)) {
      return "unable to parse height value";
    }

    cylinder.slices = this.reader.getFloat(child, 'slices');
    if (cylinder.slices == null || !isInteger(cylinder.slices)) {
      return "unable to parse slices value";
    }

    cylinder.stacks = this.reader.getFloat(child, 'stacks');
    if (cylinder.stacks == null || !isInteger(cylinder.stacks)) {
      return "unable to parse stacks value";
    }
  }

  parseChildrenSphere(sphere, child) {
    sphere.radius = this.reader.getFloat(child, 'radius');
    if (sphere.radius == null || isNaN(sphere.radius)) {
      return "unable to parse radius value";
    }

    sphere.slices = this.reader.getFloat(child, 'slices');
    if (sphere.slices == null || !isInteger(sphere.slices)) {
      return "unable to parse slices value";
    }

    sphere.stacks = this.reader.getFloat(child, 'stacks');
    if (sphere.stacks == null || !isInteger(sphere.stacks)) {
      return "unable to parse stacks value";
    }
  }

  parseChildrenTorus(torus, child) {
    torus.inner = this.reader.getFloat(child, 'inner');
    if (torus.inner == null || isNaN(torus.inner)) {
      return "unable to parse inner value";
    }

    torus.outer = this.reader.getFloat(child, 'outer');
    if (torus.outer == null || isNaN(torus.outer)) {
      return "unable to parse outer value";
    }

    torus.slices = this.reader.getFloat(child, 'slices');
    if (torus.slices == null || !isInteger(torus.slices)) {
      return "unable to parse slices value";
    }

    torus.loops = this.reader.getFloat(child, 'loops');
    if (torus.loops == null || !isInteger(torus.loops)) {
      return "unable to parse loops value";
    }
  }

  parsePrimitivesPrimitiveChildren(child, primitive) {

    if (primitive.type != null)
      return -1;

    switch (child.nodeName) {
      case "rectangle":
        var rectangle = {
          x1: null,
          x2: null,
          y1: null,
          y2: null
        }
        this.parseChildrenRectangle(rectangle, child);
        primitive.type = "rectangle";
        primitive.specs = rectangle;
        break;
      case "triangle":
        var triangle = {
          x1: null,
          x2: null,
          x3: null,
          y1: null,
          y2: null,
          y3: null,
          z1: null,
          z2: null,
          z3: null
        }
        this.parseChildrenTriangle(triangle, child);
        primitive.type = "triangle";
        primitive.specs = triangle;
        break;
      case "cylinder":
        var cylinder = {
          base: null,
          top: null,
          height: null,
          slices: null,
          stacks: null
        }
        this.parseChildrenCylinder(cylinder, child);
        primitive.type = "cylinder";
        primitive.specs = cylinder;
        break;
      case "sphere":
        var sphere = {
          radius: null,
          slices: null,
          stacks: null
        }
        this.parseChildrenSphere(sphere, child);
        primitive.type = "sphere";
        primitive.specs = sphere;
        break;
      case "torus":
        var torus = {
          inner: null,
          outer: null,
          slices: null,
          loops: null
        }
        this.parseChildrenTorus(torus, child);
        primitive.type = "torus";
        primitive.specs = torus;
        break;
      default:
        this.onXMLMinorError("unknown tag <" + child.nodeName + ">");
        break;
    }

    return 0;

  }

  parsePrimitive(child) {
    var primitive = {
      id: null,
      type: null,
      specs: null,
      shape: null
    }

    primitive.id = this.reader.getString(child, 'id');
    if (primitive.id == null || !isString(primitive.id)) {
      return "unable to parse id value";
    }

    // Check for repeated id
    var reply;
    if ((reply = this.checkForRepeatedId(primitive.id, this.primitives)) != "OK")
      return reply;

    var grandchildren = child.children;

    for (var j = 0; j < grandchildren.length; j++) {
      let error = this.parsePrimitivesPrimitiveChildren(grandchildren[j], primitive);
      if (error != 0) {
        return error;
      }
    }

    this.primitives[primitive.id] = primitive;
    return 0;
  }

  /**
   * Parses the <PRIMITIVES> node.
   * @param {primitives block element} primitivesNode
   */
  parsePrimitives(primitivesNode) {
    var children = primitivesNode.children;

    this.primitives = [];

    //Any number of primitives
    if (children.length < 1)
      return "no primitives available"
    for (var i = 0; i < children.length; i++) {
      let error = this.parsePrimitive(children[i]);
      if (error != 0)
        return error;
    }
    this.log("Parsed primitives");
    return null;

  }

  parseChildrenTransformation(child, component) {
    let children = child.children;

    for (let i = 0; i < children.length; i++) {
      switch (children[i].nodeName) {
        case "transformationref":
          component.transformation.ref = this.reader.getString(children[i], 'id');
          if (component.transformation.ref == null || !isString(component.transformation.ref)) {
            return "unable to parse id value";
          }
          return 0;
        case "translate":
        case "scale":
          var tmpCoor = {
            x: null,
            y: null,
            z: null,
            type: children[i].nodeName
          };

          this.parseChildrenCoordinates(tmpCoor, children[i], 0);

          if (child.nodeName == "translate") {
            component.transformation.steps.push(tmpCoor);
          } else {
            component.transformation.steps.push(tmpCoor);
          }
          break;
        case "rotate":
          var tmpRot = {
            axis: null,
            angle: null,
            type: children[i].nodeName
          }
          this.parseChildrenRotation(tmpRot, children[i]);
          component.transformation.steps.push(tmpRot);
          break;
      }
    }
    return 0;
  }

  parseChildrenMaterials(child, component) {
    let children = child.children;

    for (let i = 0; i < children.length; i++) {
      var id;
      id = this.reader.getString(children[i], 'id');
      if (id == null || !isString(id)) {
        return "unable to parse id value";
      }
      if (id != "inherit" && !this.materials.hasOwnProperty(id)) {
        return `material "${id}" is not defined in <materials> node`
      }
      component.materials.push(id);
    }
    return 0;
  }

  parseChildrenTexture(child, component) {
    var id;
    id = this.reader.getString(child, 'id');
    if (id == null || !isString(id)) {
      return "unable to parse id value";
    }

    var ls;
    ls = this.reader.getFloat(child, 'length_s');
    if (ls == null || isNaN(ls)) {
      return "unable to parse length_s value";
    }

    var lt;
    lt = this.reader.getFloat(child, 'length_t');
    if (lt == null || isNaN(lt)) {
      return "unable to parse length_t value";
    }
    component.texture.id = id;
    component.texture.length_s = ls;
    component.texture.length_t = lt;

    return 0;
  }

  parseChildrenChildren(child, component) {
    let children = child.children;

    for (let i = 0; i < children.length; i++) {
      switch (children[i].nodeName) {
        case "componentref":
          var id;
          id = this.reader.getString(children[i], 'id');
          if (id == null || !isString(id)) {
            return "unable to parse id value";
          }
          component.children.componentref.push(id);
          break;
        case "primitiveref":
          var id;
          id = this.reader.getString(children[i], 'id');
          if (id == null || !isString(id)) {
            return "unable to parse id value";
          }
          component.children.primitiveref.push(id);
          break;
      }
    }

    return 0;
  }

  parseComponentsComponentChildren(child, component) {
    switch (child.nodeName) {
      case "transformation":
        return this.parseChildrenTransformation(child, component);

      case "materials":
        return this.parseChildrenMaterials(child, component);

      case "texture":
        return this.parseChildrenTexture(child, component);

      case "children":
        return this.parseChildrenChildren(child, component);

      default:
        this.onXMLMinorError("unknown tag <" + child.nodeName + ">");
        return 0;

    }
  }

  componentErrCheck(component) {
    if (component.transformation.ref == null &&
      component.transformation.steps.length == 0)
      return "Invalid number of transformations";

    if (component.materials.length == 0)
      return "Invalid number of materials";

    if (component.texture.id == null)
      return "Invalid texture";

    if (component.children.componentref.length +
      component.children.primitiveref.length == 0)
      return "Invalid number of children";

    return "OK";
  }

  parseComponent(child) {
    var component = {
      id: null,
      transformation: { //if ref == null, is transformation, otherwise, is a reference
        ref: null,
        steps: []
      },
      materials: [],
      materialID: 0,
      texture: {
        id: null,
        length_s: null,
        length_t: null
      },
      children: {
        componentref: [],
        primitiveref: []
      }
    }

    component.id = this.reader.getString(child, 'id');
    if (component.id == null || !isString(component.id)) {
      return "unable to parse id value";
    }

    // Check for repeated id
    var reply;
    if ((reply = this.checkForRepeatedId(component.id, this.components)) != "OK")
      return reply;

    var grandchildren = child.children;

    for (var j = 0; j < grandchildren.length; j++) {
      let error = this.parseComponentsComponentChildren(grandchildren[j], component);
      if (error != 0)
        return error;
    }

    var reply;
    if ((reply = this.componentErrCheck(component)) != "OK")
      return reply;

    this.components[component.id] = component;
    return 0;
  }

  /**
   * Parses the <COMPONENTS> node.
   * @param {components block element} componentsNode
   */
  parseComponents(componentsNode) {
    var children = componentsNode.children;

    this.components = [];

    //Any number of components
    if (children.length < 1)
      return "no components available"
    for (var i = 0; i < children.length; i++) {
      let error = this.parseComponent(children[i]);
      if (error != 0) {
        return error;
      }
    }
    this.log("Parsed components");
    return null;

  }

  /**
   * Parses the <NODES> block.
   * @param {nodes block element} nodesNode
   */
  parseNodes(nodesNode) {
    // TODO: Parse block
    this.log("Parsed nodes");
    return null;
  }

  /*
   * Callback to be executed on any read error, showing an error on the console.
   * @param {string} message
   */
  onXMLError(message) {
    console.error("XML Loading Error: " + message);
    this.loadedOk = false;
  }

  /**
   * Callback to be executed on any minor error, showing a warning on the console.
   * @param {string} message
   */
  onXMLMinorError(message) {
    console.warn("Warning: " + message);
  }


  /**
   * Callback to be executed on any message.
   * @param {string} message
   */
  log(message) {
    console.log("   " + message);
  }

  setTexturePosition(component) {
    let prims = component.children.primitiveref;
    if(prims == undefined) return;
    for (let i = 0; i < prims.length; i++) {
      var key = prims[i];
      var length_s = component.texture.length_s;
      var length_t = component.texture.length_t;
      switch (this.primitives[key].type) {
        case "rectangle":
          this.primitives[key].shape.setTexCoords(length_s, length_t); 
          break;
        case "triangle":
          //TODO
          break;
        default:
          break;
      }
      
    }
  }

  applyTexture(component, texture) {
    this.setTexturePosition(component);
    switch (component.texture.id) {
      case INHERIT:
        if (texture != undefined) {
          let tex = this.textures[texture];
          if (tex)
            tex.bind();
        } else {
          this.onXMLError("No parent texture passed")
        }
        break;

      case NONE:
        //TODO: Aparentemente, nao e preciso fazer nada, ao trocar de material ja resolve, mas caso o material seja inherit talvez de asneira
        break;

      default:
        this.textures[component.texture.id].bind();
        break;
    }
  }

  applyMaterial(component, material) {

    let matID = component.materials[component.materialID];
    switch (matID) {
      case INHERIT:
        if (material != undefined) {

          this.materials[material].apply();
        } else {
          this.onXMLError("No parent material passed")
        }
        break;

      default:
        this.materials[matID].apply();
        break;
    }
  }

  transform(steps) {
    if (steps == null) {
      console.error("NULL");
      return;
    }
    if (!(Symbol.iterator in Object(steps))) {
      console.error("NOT ITERABLE");
    }
    for (let step of steps) {
      switch (step.type) {
        case "translate":
          this.scene.translate(step.x, step.y, step.z);
          break;
        case "rotate":
          let axis = {
            x: 0,
            y: 0,
            z: 0
          };

          axis[step.axis] = 1;
          this.scene.rotate(DEGREE_TO_RAD * step.angle, axis.x, axis.y, axis.z);
          break;
        case "scale":
          this.scene.scale(step.x, step.y, step.z);
          break;
        default:
          break;
      }
    }
  }

  applyTransformation(component) {
    let transf = component.transformation;
    let steps = null;
    if (transf.ref != null) {
      if (this.transformations[transf.ref] != null) {
        steps = this.transformations[transf.ref].steps;
      }
    } else {
      steps = transf.steps;
    }
    if (steps == null) {
      console.error("WILL NULL");
    }
    this.transform(steps);

  }

  displayComponent(component, material, texture) {

    this.scene.pushMatrix();

    this.applyMaterial(component, material);
    this.applyTexture(component, texture);
    this.applyTransformation(component);

    let primRef = component.children.primitiveref;
    if (Object.keys(primRef).length != 0) {
      primRef.forEach(primID => {
        let prim = this.primitives[primID];
        prim.shape.display();
      });
    }

    let compRef = component.children.componentref;
    compRef.forEach(reference => {
      let child = this.components[reference];
      let texID;
      if (component.texture.id == "inherit")
        texID = texture;
      else
        texID = component.texture.id;

      let matID;
      if (component.texture.id == "inherit")
        matID = material;
      else
        matID = component.materials[component.materialID];

      this.displayComponent(child, matID, texID);

    });
    this.scene.popMatrix();
  }

  /**
   * Displays the scene, processing each node, starting in the root node.
   */
  displayScene() {
    // entry point for graph rendering
    let rootNode = this.components[this.idRoot];

    this.displayComponent(rootNode);

  }

}



function isBoolean(value) {
  if (isNaN(value) || value < 0 || value > 1)
    return false;
  return true;
}

function isAxis(axis) {

  switch (axis) {
    case "x":
    case "X":
    case "y":
    case "Y":
    case "z":
    case "Z":
      return true;
      break;
    default:
      return false;
      break;
  }
}

/**
 * Check if param is a string
 * @param {string} string to test
 * @return true if it is a string, false if not
 */
function isString(string) {
  return (typeof string === 'string');
}

/**
 * Check if param is an integer
 * @param {number} number to test
 * @return true if it is an integer, false if not
 */
function isInteger(number) {
  return (!isNaN(number) && number % 1 == 0);
}

/**
 * Check if param is between two values
 * @param {string} string to test
 * @return true if value is between the two, false if not
 */
function isBetween(a, min, max) {
  return ((a >= min) && (a <= max));
}