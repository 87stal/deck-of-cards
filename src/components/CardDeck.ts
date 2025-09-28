import * as PIXI from 'pixi.js';
import { CardView } from './CardView';

export class CardDeck extends PIXI.Container {
    cards: CardView[] = [];
    currentIndex = 0;

    constructor(atlasTextures: Record<string, PIXI.Texture>, backTexture: PIXI.Texture, screenWidth: number,
                screenHeight: number) {
        super();

        const cardKeys = Object.keys(atlasTextures)
            .sort(() => Math.random() - 0.5)
            .slice(0, 5);
        const offsetX = -30;
        const offsetY = 15;
        const centerX = screenWidth / 2;
        const centerY = screenHeight / 2;


        cardKeys.forEach((key, i) => {
            const card = new CardView(backTexture, atlasTextures[key]);
            card.x = centerX + (i - cardKeys.length / 2) * offsetX;
            card.y = centerY + (i - cardKeys.length / 2) * offsetY;

            this.cards.push(card);
            this.addChild(card);
        });

        this.cards.reverse();
    }

    public async revealNext() {
        if (this.currentIndex >= this.cards.length) return;
        await this.cards[this.currentIndex].reveal();
        this.currentIndex++;
    }
}
