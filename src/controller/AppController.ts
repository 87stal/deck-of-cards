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

// constants for button styles
const BUTTON_STYLES = {
    reveal: { fontSize: 36, bgColor: 0x17416a },
    restart: { fontSize: 28, textColor: 0xffcc00, bgColor: 0x597592 }
};

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
        this.revealBtn = this.createButton('Reveal', () => this.handleReveal(), BUTTON_STYLES.reveal);
        this.restartBtn = this.createButton('Restart', () => this.handleRestart(), BUTTON_STYLES.restart);

        this.setButtonsState({ reveal: true, restart: false });

        this.app.stage.addChild(this.revealBtn, this.restartBtn);
        this.layoutUI();
    }

    // handle reveal click
    private async handleReveal() {
        if (this.deck.currentIndex >= this.deck.cards.length) return;

        this.setBtnEnabled(false, this.revealBtn); // disable while animation
        sound.play('flip');
        await this.deck.revealNext();
        this.setBtnEnabled(true, this.revealBtn);

        if (this.deck.currentIndex >= this.deck.cards.length) {
            this.setButtonsState({ reveal: false, restart: true });
        }
    }

    // handle restart click
    private handleRestart() {
        this.app.stage.removeChild(this.deck);
        this.createDeck();
        sound.play('button');
        this.setButtonsState({ reveal: true, restart: false });
    }

    //set state for button
    private setBtnEnabled(enabled: boolean, button: PIXI.Container) {
        button.eventMode = enabled ? 'static' : 'none';
        button.cursor = enabled ? 'pointer' : 'not-allowed';
        button.alpha = enabled ? 1 : 0.5;
    }

    private setButtonsState(options: { reveal?: boolean; restart?: boolean }) {
        if (options.reveal !== undefined) this.setBtnEnabled(options.reveal, this.revealBtn);
        if (options.restart !== undefined) this.setBtnEnabled(options.restart, this.restartBtn);
    }

    private layoutUI() {
        if (!this.deck || !this.revealBtn || !this.restartBtn) return;

        const spacing = 20;
        const deckBounds = this.deck.getBounds();
        const baseY = deckBounds.y + deckBounds.height + spacing;
        const centerX = deckBounds.x + deckBounds.width / 2;

        this.revealBtn.x = centerX - (this.revealBtn.width + spacing + this.restartBtn.width) / 2;
        this.revealBtn.y = baseY;

        this.restartBtn.x = this.revealBtn.x + this.revealBtn.width + spacing;
        this.restartBtn.y = baseY + (this.revealBtn.height - this.restartBtn.height) / 2;
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