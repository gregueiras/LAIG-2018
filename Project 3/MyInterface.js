//Name to appear in the dropdown interface
const ACTIVE_CAMERA = 'Active Camera';

/**
 * MyInterface class, creating a GUI interface.
 */
class MyInterface extends CGFinterface {
    /**
     * Calls CGFinterface constructor
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * Initializes the interface.
     * @param {CGFapplication} application
     */
    init(application) {
        super.init(application);
        // init GUI. For more information on the methods, check:
        //  http://workshop.chromeexperiments.com/examples/gui

        this.gui = new dat.GUI();
        this.initKeys();

        return true;
    }

    /**
     * Adds a folder containing the IDs of the lights passed as parameter.
     * @param {string[]} lights
     */
    addLightsGroup(lights) {

        var group = this.gui.addFolder("Lights");
        group.open();

        for (let i = 0; i < lights.omnis.length; i++) {
            const light = lights.omnis[i];
            this.scene.lightValues[light.id] = (light.enabled ? true : false);
            let name = light.id;
            group.add(this.scene.lightValues, name);

        }
        for (let i = 0; i < lights.spots.length; i++) {
            const light = lights.spots[i];
            this.scene.lightValues[light.id] = (light.enabled ? true : false);
            let name = light.id;
            group.add(this.scene.lightValues, name);

        }

    }

    /**
     * Add cameras to the dropdown menu
     * @param {Object} views - views object created by XML parser
     * @memberof MyInterface
     */
    addCameraOptions(views) {
        this.cameras = {};
        this.cameras[ACTIVE_CAMERA] = views.default;

        let cameras = {};

        let keys = Object.keys(views.orthos);
        for (let key of keys) {
            let cam = views.orthos[key];
            cameras[cam.id] = cam.id;
        }

        keys = Object.keys(views.perspectives);
        for (let key of keys) {
            let cam = views.perspectives[key];
            cameras[cam.id] = cam.id;
        }

        this.gui.add(this.cameras, ACTIVE_CAMERA, cameras);
    }


    /**
     * Overrides processKeyboard function from WebCGF and starts listening for pressed keys
     * @memberof MyInterface
     */
    initKeys() {
        this.processKeyboard = function () { };
        this.activeKeys = {};
    }

    /**
     * Overrides processKeyDown function from WebCGF and processes a pressed key
     * @param {keyEvent} event
     * @memberof MyInterface
     */
    processKeyDown(event) {
        this.activeKeys[event.code] = true;
    };

    /**
    * Overrides processKeyUp function from WebCGF
    * @param {keyEvent} event
    * @memberof MyInterface
    */
    processKeyUp(event) { };


    /**
     * Process key released (manually called)
     * @param {keyEvent} event
     * @memberof MyInterface
     */
    releaseKey(event) {
        this.activeKeys[event] = false;
    };

    
    /**
     * Returns true if a key is active, false if it isn't
     *
     * @param {keyCode} keyCode
     * @returns {boolean} true if key is active or false if it isn't
     * @memberof MyInterface
     */
    isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;
        let a = [1, 2 , 4];
    };
}