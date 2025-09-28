import PIXI, {
    Application,
    Text,
    Assets,
    Graphics
} from 'pixi.js';
import { CardDeck } from '../components/CardDeck';
import { sound } from '@pixi/sound';

interface ButtonOptions {
    fontSize?: number;
    textColor?: number;
    bgColor?: number;
    bgAlpha?: number;
    padding?: number;
    radius?: number;
}

export class AppController {
    private deck!: CardDeck;
    private loadingText!: Text;
    private atlasTextures!: Record<string, PIXI.Texture>;
    private backTexture!: PIXI.Texture;
    private restartBtn!: PIXI.Container;
    private revealBtn!: PIXI.Container;

    constructor(private app: Application) {
        this.setup();
    }

    private async setup() {
        try {
            this.showPreloader('Loading assets...');

            // load resources
            await this.loadAssets();

            sound.add('flip',   'public/media/flipcard.mp3');
            sound.add('button', 'public/media/button.mp3');

            this.app.stage.removeChild(this.loadingText);

            this.createDeck();
            this.createButtons();
        } catch (error) {
            this.showError('Failed to load assets');
            console.error('Asset loading error:', error);
        }
    }

    private async loadAssets(): Promise<void> {
        Assets.addBundle('cards', {
            cards: 'public/media/PNG.json',
            back:  'public/media/back.png'
        });

        const resources = await Assets.loadBundle('cards');

        this.atlasTextures = resources['cards'].textures;
        this.backTexture = resources['back'];
    }

    private createDeck() {
         this.deck = new CardDeck(this.atlasTextures, this.backTexture, this.app.screen.width,
            this.app.screen.height
        );
        this.app.stage.addChild(this.deck);
    }

    // creating of buttons
    private createButton(
        labelText: string,
        onClick: () => void,
        options?: ButtonOptions
    ): PIXI.Container {
        const opts:Required<ButtonOptions> = {
            fontSize: 32,
            textColor: 0xffffff,
            bgColor: 0x333333,
            bgAlpha: 0.8,
            padding: 12,
            radius: 10,
            ...options
        };

        const container = new PIXI.Container();

        const label = new PIXI.Text( {
            text: labelText,
            style:{
                fontFamily: 'Arial',
                fontSize:  opts.fontSize,
                fill:      opts.textColor
            }
        });

        const width = label.width  + opts.padding * 2;
        const height = label.height + opts.padding * 2;

        const bg = new Graphics()
            .roundRect(0, 0, width, height, opts.radius)
            .fill({ color: opts.bgColor, alpha: opts.bgAlpha });

        label.x = (width - label.width)  / 2;
        label.y = (height - label.height) / 2;

        container.addChild(bg, label);
        container.eventMode = 'static';
        container.cursor    = 'pointer';
        container.on('pointerdown', onClick);

        return container;
    }

    private createButtons() {
        const revealFontSize = 36;
        const revealBgColor = 0x17416a;

        const restartFontSize = 28;
        const restartTextColor = 0xffcc00;
        const restartBgColor = 0x597592;

        const baseY = this.app.screen.height - 100;
        const spacing = 20;

        // reveal
        this.revealBtn = this.createButton('Reveal', async () => {
            if (this.deck.currentIndex < this.deck.cards.length) {
                this.enableBtn(false, this.revealBtn);
                sound.play('flip');
                await this.deck.revealNext();
                this.enableBtn(true, this.revealBtn);

                // after each opening, check if it`s the end
                if (this.deck.currentIndex >= this.deck.cards.length) {
                    this.enableBtn(true, this.restartBtn);
                }
            }
        }, { fontSize: revealFontSize, bgColor: revealBgColor });

        // restart
        this.restartBtn = this.createButton('Restart', () => {
            this.app.stage.removeChild(this.deck);
            this.createDeck();
            sound.play('button');
            this.enableBtn(false, this.restartBtn); // set disable after resetting
        }, { fontSize: restartFontSize, textColor: restartTextColor, bgColor: restartBgColor });

        this.enableBtn(false, this.restartBtn);

        const centerX = this.app.screen.width / 2;

        this.revealBtn.x = centerX - (this.revealBtn.width + spacing + this.restartBtn.width) / 2;
        this.revealBtn.y = baseY;

        this.restartBtn.x = this.revealBtn.x + this.revealBtn.width + spacing;
        this.restartBtn.y = baseY + (this.revealBtn.height - this.restartBtn.height) / 2;

        this.app.stage.addChild(this.revealBtn, this.restartBtn);
    }

    //set state for button
    private enableBtn(enabled: boolean, button: PIXI.Container) {
        button.eventMode = enabled ? 'static' : 'none';
        button.cursor    = enabled ? 'pointer' : 'not-allowed';
        button.alpha     = enabled ? 1 : 0.5;
    }

    private showPreloader(message: string) {
        this.loadingText = new PIXI.Text( {
            text: message,
            style:{
                fontFamily: 'Arial',
                fontSize:   28,
                fill:       0xffffff
            }
        });
        this.loadingText.anchor.set(0.5);
        this.loadingText.x = this.app.screen.width / 2;
        this.loadingText.y = this.app.screen.height / 2;
        this.app.stage.addChild(this.loadingText);
    }

    private showError(message: string) {
        const errorText = new Text( {
            text: message,
            style:{
                fontFamily: 'Arial',
                fontSize:   28,
                fill:       0xff0000
            }
        });
        errorText.anchor.set(0.5);
        errorText.x = this.app.screen.width / 2;
        errorText.y = this.app.screen.height / 2;
        this.app.stage.addChild(errorText);
    }
}