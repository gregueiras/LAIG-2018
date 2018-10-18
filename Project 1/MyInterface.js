const ACTIVE_CAMERA = 'Active Camera';

/**
 * MyInterface class, creating a GUI interface.
 */
class MyInterface extends CGFinterface {
    /**
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
     * @param {array} lights
     */
    addLightsGroup(lights) {

        var group = this.gui.addFolder("Lights");
        group.open();

        // add two check boxes to the group. The identifiers must be members variables of the scene initialized in scene.init as boolean
        // e.g. this.option1=true; this.option2=false;


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
     *
     *
     * @param {*} views
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
     *
     *
     * @memberof MyInterface
     */
    initKeys() {
        this.processKeyboard = function () { };
        this.activeKeys = {};
    }
    processKeyDown(event) {
        this.activeKeys[event.code] = true;
    };
    processKeyUp(event) {

    };
    releaseKey(event) {
        this.activeKeys[event] = false;
    };
    isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;
    };
}