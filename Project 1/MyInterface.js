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

        // add a group of controls (and open/expand by defult)

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

        let omniGroup = group.addFolder("Omnis");
        omniGroup.open();

        for (let i = 0; i < lights.omnis.length; i++) {
            const light = lights.omnis[i];
            this.scene.lightValues[light.id] = light;
            //TODO: Add to GUI
            //omniGroup.add(this.scene.lightValues[light.id], light.enabled)

        }


        /*
                for (var key in lights) {
                    if (lights.hasOwnProperty(key)) {
                        this.scene.lightValues[key] = lights[key][0];
                        group.add(this.scene.lightValues, key);
                    }
                }
                */
    }

    addCameraOptions(views) {
        this.cameras = {};
        this.cameras.activeCamera = views.default;

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

        this.gui.add(this.cameras, 'activeCamera', cameras);
    }
}