import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { MyApp } from './MyApp.js';

/**
    This class customizes the gui interface for the app
*/
class MyGuiInterface  {

    /**
     * 
     * @param {MyApp} app The application object 
     */
    constructor(app) {
        this.app = app
        this.datgui =  new GUI();
        this.contents = null
    }

    setContents(contents) {
        this.contents = contents
        try {
            this.contents.appendGUI(this.datgui)
        }
        catch (e) {
            console.log(e)
        }
    }

    /**
     * Initialize the gui interface
     */
    init() {
        let args = null;
        try {
            args = this.contents.retriveArgs();
        }
        catch (e) {
            console.info("No args to retrive");
        }

        if (args !== null) {
            const folder = this.datgui.addFolder( args.id );
            for (let i=0; i<args.gui.length; i++) {
                let key = args.gui[i];
                let item = args[key];
                if (item.type==="direction") {
                    const grp = folder.addFolder(item.label);
                    grp.add(item.value, 'x', -1, 1).name("x");
                    grp.add(item.value, 'y', -1, 1).name("y");
                    grp.add(item.value, 'z', -1, 1).name("z");
                }
                else
                if (item.type==="color") {
                    let obj = folder.addColor(item, 'value').name(item.label).listen();
                    if (item.cb !== undefined && item.cb !== null) {
                        obj.onChange(function(e) {
                            item.cb(e)
                        });
                    }
                }
                else {
                    if (item.step !== undefined && item.step !== null) {    
                        let obj = folder.add(item, "value", item.min, item.max, item.step).name(item.label);
                        if (item.cb !== null) {
                            obj.onChange(function(e) {
                                item.cb.bind(args.object)(key, item, e)
                            });
                        }
                    }
                    else {
                        let obj = folder.add(item, "value", item.min, item.max).name(item.label);
                        if (item.cb !== undefined && item.cb !== null) {
                            if (item.cb !== null) {
                                obj.onChange(function(e) {
                                    item.cb.bind(args.object)(key, item, e)
                                });
                            }
                        }
                    }
                }
            }
            folder.open()
        }
        // add a folder to the gui interface for the box
        // note that we are using a property from the contents object 
        
        
       
        
       
    }
}

export { MyGuiInterface };