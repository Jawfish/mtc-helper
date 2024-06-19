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
                strongDelimiter: '**',
                br: ''
            });

            TurndownSingleton.instance.addRule('heading', {
                filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
                replacement(content, node, _) {
                    const level = Number(node.nodeName.charAt(1));
                    const prefix = '#'.repeat(level);

                    return `\n${prefix} ${content}\n\n`;
                }
            });
        }
    }

    getInstance() {
        return TurndownSingleton.instance;
    }
}

const Turndown = new TurndownSingleton();

export default Turndown;
