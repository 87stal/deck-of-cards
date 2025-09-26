import {Application} from 'pixi.js';
import {AppController} from './controller/AppController';

const appWidth: number = 1200;
const appHeight: number = 600;

(async () => {

    // Create a new application
    const app = new Application();
    app.stage.eventMode = 'static';

    // Initialize the application
    await app.init({
        background: '#96d1e3',
        width: appWidth / 2,
        height: appHeight / 2,
        resizeTo: document.getElementById("game-field") as HTMLDivElement
    });

    // Append the application canvas to the document body
    document.getElementById("cards-deck")?.appendChild(app.canvas);

    new AppController(app);
})();
