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

        // Reads the names of the nodes to an auxiliary buffer.
        var nodeNames = [];

        for (var i = 0; i < nodes.length; i++) {
            nodeNames.push(nodes[i].nodeName);
        }

        var error;

        // Processes each node, verifying errors.

        // <scene>
        this.processTag(nodes[SCENE_INDEX], nodeNames, "scene", SCENE_INDEX);

        // <views>
        this.processTag(nodes[VIEWS_INDEX], nodeNames, "views", VIEWS_INDEX);

        // <lights>
        this.processTag(nodes[LIGHTS_INDEX], nodeNames, "lights", LIGHTS_INDEX);

        // <textures>
        this.processTag(nodes[TEXTURES_INDEX], nodeNames, "textures", TEXTURES_INDEX);

        // <materials>
        this.processTag(nodes[MATERIALS_INDEX], nodeNames, "materials", MATERIALS_INDEX);

        // <transformations>
        this.processTag(nodes[TRANSFORMATIONS_INDEX], nodeNames, "transformations", TRANSFORMATIONS_INDEX);

        /*
             // <ambient>
            this.processTag(nodes[AMBIENT_INDEX], nodeNames, "ambient", AMBIENT_INDEX);
    
            // <primitives>
            this.processTag(nodes[PRIMITIVES_INDEX], nodeNames, "primitives", PRIMITIVES_INDEX);
    
            // <components>
            this.processTag(nodes[COMPONENTS_INDEX], nodeNames, "components", COMPONENTS_INDEX);
        */
    }

    /**
     * Parses the <INITIALS> block.
     */
    parseScene(sceneNode) {
        console.log("Will parse scene");
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
            this.root = this.reader.getString(sceneNode, 'root');

            if (!(this.root != -1 && isString(this.root))) {
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

        console.log("Parsed scene");

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

        this.views.orthos.push(ortho);
        return 0;
    }

    parseViewPrespectiveChildren(child, perspective) {
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

    parseViewPrespective(child) {
        var perspective = {
            id: null,
            near: null,
            far: null,
            angle: null,
            from: { x: null, y: null, z: null },
            to: { x: null, y: null, z: null },
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

        perspective.angle = this.reader.getFloat(child, 'angle');
        if (perspective.angle == null || isNaN(perspective.angle)) {
            return "unable to parse angle value";
        }

        var grandchildren = child.children;

        for (var j = 0; j < grandchildren.length; j++) {
            this.parseViewPrespectiveChildren(grandchildren[j], perspective);
        }

        this.views.perspectives.push(perspective);
        return 0;
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
            return "no views available"
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName == "perspective") {
                if (this.parseViewPrespective(children[i]) == 0);
                this.log("perspective parsed")
            } else if (children[i].nodeName == "ortho") {
                if (this.parseViewOrtho(children[i]) == 0);
                this.log("ortho parsed")
            } else
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
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

        for (var i = 0; i < children.length; i++)
            nodeNames.push(child.nodeName);

        // Ambient light values
        // (default values)
        this.ambient.r = 0.2;
        this.ambient.g = 0.2;
        this.ambient.b = 0.2;
        this.ambient.a = 0.2;

        var indexAmbient = nodeNames.indexOf("ambient");
        if (indexAmbient == null) {
            this.onXMLMinorError(`ambient light values missing; assuming RGBA(${this.ambient.r}, ${this.ambient.g}, ${this.ambient.b}, ${this.ambient.a})`);
        }
        else {
            this.ambient.r = this.reader.getFloat(children[indexAmbient], 'r');
            this.ambient.g = this.reader.getFloat(children[indexAmbient], 'g');
            this.ambient.b = this.reader.getFloat(children[indexAmbient], 'b');
            this.ambient.a = this.reader.getFloat(children[indexAmbient], 'a');

            if (!(this.ambient.r != null && !isNaN(this.ambient.r))) {
                this.ambient.r = 0.2;
                this.onXMLMinorError(`unable to parse value for ambient red component; assuming 'r=${this.ambient.r}`);
            } else if (!(this.ambient.g != null && !isNaN(this.ambient.g))) {
                this.ambient.g = 0.2;
                this.onXMLMinorError(`unable to parse value for ambient green component; assuming 'r=${this.ambient.g}`);
            } else if (!(this.ambient.b != null && !isNaN(this.ambient.b))) {
                this.ambient.b = 0.2;
                this.onXMLMinorError(`unable to parse value for ambient blue component; assuming 'r=${this.ambient.b}`);
            } else if (!(this.ambient.a != null && !isNaN(this.ambient.a))) {
                this.ambient.a = 0.2;
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

    }

    checkForRepeatedId(id, arr) {
        for (var k = 0; k < arr.length; ++k) {
            if (id == arr[k].id)
                return "repeated id value";
        }
        return "OK";
    }

    isBoolean(value) {
        if (isNaN(value) || value < 0 || value > 1)
            return false;
        return true;
    }

    parseChildrenColours(param, child) {
        param.r = this.reader.getFloat(child, 'r');
        if (param.r == null || isNaN(param.r)) {
            return "unable to parse r value";
        }

        param.g = this.reader.getFloat(child, 'g');
        if (param.g == null || isNaN(param.g)) {
            return "unable to parse g value";
        }

        param.b = this.reader.getFloat(child, 'b');
        if (param.b == null || isNaN(param.b)) {
            return "unable to parse b value";
        }

        param.a = this.reader.getFloat(child, 'a');
        if (param.a == null || isNaN(param.a)) {
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
    }

    parseLightsOmniChildren(child, omni) {
        switch (child.nodeName) {
            case "location":
                this.parseChildrenCoordinates(omni.location, child, 1);
                break;
            case "ambient":
                this.parseChildrenColours(omni.ambient, child);
                break;
            case "diffuse":
                this.parseChildrenColours(omni.diffuse, child);
                break;
            case "specular":
                this.parseChildrenColours(omni.specular, child);
                break;
            default:
                this.onXMLMinorError("unknown tag <" + child.nodeName + ">");
                break;
        }
    }

    parseLightsOmni(child) {
        var omni = {
            id: null,
            enabled: null,
            location: { x: null, y: null, z: null, w: null },
            ambient: { r: null, g: null, b: null, a: null },
            diffuse: { r: null, g: null, b: null, a: null },
            specular: { r: null, g: null, b: null, a: null }
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
        if (omni.enabled == null || !this.isBoolean(omni.enabled)) {
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
            location: { x: null, y: null, z: null, w: null },
            target: { x: null, y: null, z: null },
            ambient: { r: null, g: null, b: null, a: null },
            diffuse: { r: null, g: null, b: null, a: null },
            specular: { r: null, g: null, b: null, a: null }
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
        if (spot.enabled == null || !this.isBoolean(spot.enabled)) {
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
                if (this.parseLightsOmni(children[i]) == 0);
                this.log("omni parsed")
            } else if (children[i].nodeName == "spot") {
                if (this.parseLightsSpot(children[i]) == 0);
                this.log("spot parsed")
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

        this.textures.push(texture);
    }

    parseTextures(texturesNode) {
        var children = texturesNode.children;

        this.textures = [];
        if (children.length < 1)
            return "no textures available"
        for (var i = 0; i < children.length; i++) {
            this.parseTexturesTexture(children[i]);
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
            emission: { r: null, g: null, b: null, a: null },
            ambient: { r: null, g: null, b: null, a: null },
            diffuse: { r: null, g: null, b: null, a: null },
            specular: { r: null, g: null, b: null, a: null }
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

        this.materials.push(material);
        return 0;
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
            this.parseMaterial(children[i]);
        }
        this.log("Parsed materials");
        return null;

    }

    isAxis(axis) {

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

    parseChildrenRotation(param, child) {
        param.axis = this.reader.getString(child, 'axis');
        if (param.axis == null || !this.isAxis(param.axis)) {
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
                var tmpCoor = { x: null, y: null, z: null}
                this.parseChildrenCoordinates(tmpCoor, child, 0);

                if (child.nodeName == "translate") {
                    material.translate.push(tmpCoor);
                } else {
                    material.scale.push(tmpCoor);
                }
                break;
            case "rotate":
                var tmpRot = { axis: null, angle: null }
                this.parseChildrenRotation(tmpRot, child);
                material.rotate.push(tmpRot);
                break;
            default:
                this.onXMLMinorError("unknown tag <" + child.nodeName + ">");
                break;
        }
    }

    parseTransformation(child) {
        var transformation = {
            id: null,
            translate: [],
            rotate: [],
            scale: []
        }

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

        this.transformations.push(transformation);
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
            this.parseTransformation(children[i]);
        }
        this.log("Parsed transformations");
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

    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {
        // entry point for graph rendering
        //TODO: Render loop starting at root of graph
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
 * Check if param is between two values
 * @param {string} string to test
 * @return true if value is between the two, false if not
 */
function isBetween(a, min, max) {
    return ((a >= min) && (a <= max));
}

