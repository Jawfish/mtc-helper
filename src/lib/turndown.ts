import TurndownService from 'turndown';

class TurndownSingleton {
    static instance: TurndownService | null = null;

    constructor() {
        if (!TurndownSingleton.instance) {
            TurndownSingleton.instance = new TurndownService({
                headingStyle: 'atx',
                bulletListMarker: '-',
                codeBlockStyle: 'fenced',
                emDelimiter: '_',
                strongDelimiter: '**'
            });
        }
    }

    getInstance() {
        return TurndownSingleton.instance;
    }
}

const Turndown = new TurndownSingleton();

export default Turndown;
