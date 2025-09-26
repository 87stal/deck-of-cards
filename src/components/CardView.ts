import * as PIXI from 'pixi.js';


export class CardView extends PIXI.Sprite {
    private revealed = false;

    constructor(backTexture: PIXI.Texture, private frontTexture: PIXI.Texture) {
        super(backTexture);
        this.anchor.set(0.5);
        this.scale.set(0.5);
    }

    public reveal(onComplete?: () => void) {
        if (this.revealed) return;
        this.revealed = true;

        const ticker = PIXI.Ticker.shared;
        const startScaleX = this.scale.x;
        let flipping = true;
        let fading = false;

        // main animation loop
        ticker.add(function tick(this: any, delta: PIXI.Ticker) {
            if (flipping) {
                this.scale.x -= 0.1 * delta.deltaTime; //shrink horizontally
                if (this.scale.x <= 0) {
                    this.texture = this.frontTexture; // switch to front
                    flipping = false;
                }
            } else if (!fading) {
                this.scale.x += 0.1 * delta.deltaTime; //expand back to original scale
                if (this.scale.x >= startScaleX) {
                    this.scale.x = startScaleX;
                    fading = true;// start fading
                }
            } else {
                this.alpha -= 0.02 * delta.deltaTime;
                if (this.alpha <= 0) {
                    this.visible = false; //hide sprite
                    ticker.remove(tick); //stop ticker for this card
                    onComplete?.();
                }
            }
        }.bind(this));
    }
}
