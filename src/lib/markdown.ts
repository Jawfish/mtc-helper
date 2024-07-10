import TurndownService from 'turndown';

type Options = {
    emDelimiter: TurndownService.Options['emDelimiter'];
    strongDelimiter: TurndownService.Options['strongDelimiter'];
    emptyLinesAfterHeading: number;
    listItemSpaces: number;
    hasHeadingInInput: boolean;
};

class HTMLToMarkdown {
    private static _instance: HTMLToMarkdown | undefined = undefined;

    private turndownService: TurndownService;

    private constructor() {
        this.turndownService = new TurndownService({
            headingStyle: 'atx',
            bulletListMarker: '-',
            codeBlockStyle: 'fenced',
            emDelimiter: '*',
            strongDelimiter: '**',
            br: '',
            hr: '---'
        });

        this.turndownService.addRule('heading', {
            filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
            replacement(content, node, _) {
                const level = Number(node.nodeName.charAt(1));
                const prefix = '#'.repeat(level);

                return `${prefix} ${content}`;
            }
        });
    }

    public static get instance(): HTMLToMarkdown {
        if (!HTMLToMarkdown._instance) {
            HTMLToMarkdown._instance = new HTMLToMarkdown();
        }

        return HTMLToMarkdown._instance;
    }

    /**
     * Converts HTML to markdown, taking into account the input string to determine
     * what style of markdown to convert to.
     *
     * @param html - The HTML to convert to markdown (such as the model's response)
     * @param inputString - The markdown string (such as the operator's edited response)
     */
    public htmlToMarkdown(html: string | HTMLElement, inputString: string): string {
        const options = this.analyzeInput(inputString);
        this.updateTurndownOptions(options);
        let markdown = this.turndownService.turndown(html);
        markdown = this.postProcessMarkdown(markdown, options);

        return markdown;
    }

    /**
     * Analyzes the input string (intended to be the markdown written by the operator)
     * to determine how to format the markdown conversion of the HTML from the model
     * response. This prevents issues where the model response uses e.g. _emphasis_, but
     * the operator uses *emphasis*, resulting in the diff view showing a difference
     * where there functionally is none.
     */
    private analyzeInput(input: string): Options {
        const options: Options = {
            emDelimiter: '*',
            strongDelimiter: '**',
            emptyLinesAfterHeading: 0,
            listItemSpaces: 1,
            hasHeadingInInput: /^#+\s/.test(input)
        };

        if (/_[^_]+_/.test(input)) options.emDelimiter = '_';
        if (/\*[^*]+\*/.test(input)) options.emDelimiter = '*';
        if (/__[^_]+__/.test(input)) options.strongDelimiter = '__';
        if (/\*\*[^*]+\*\*/.test(input)) options.strongDelimiter = '**';

        const headingMatch = input.match(/^#+\s.+(\n*)/m);
        if (headingMatch) {
            options.emptyLinesAfterHeading = headingMatch[1].length - 1;
        }

        return options;
    }

    private updateTurndownOptions(options: {
        emDelimiter: TurndownService.Options['emDelimiter'];
        strongDelimiter: TurndownService.Options['strongDelimiter'];
    }): void {
        this.turndownService.options.emDelimiter = options.emDelimiter;
        this.turndownService.options.strongDelimiter = options.strongDelimiter;
    }

    private postProcessMarkdown(markdown: string, options: Options): string {
        if (options.emptyLinesAfterHeading > 0) {
            markdown = markdown.replace(/^(#+\s.+)$/gm, match => {
                return match + '\n'.repeat(options.emptyLinesAfterHeading - 1);
            });
        } else if (options.hasHeadingInInput) {
            // replace empty line after heading inserted from turndown
            markdown = markdown.replace(/^(#+\s.+\n)\n/gm, '$1');
        }

        const spaces = ' '.repeat(options.listItemSpaces);
        markdown = markdown.replace(/^(-|\d+\.)\s+/gm, `$1${spaces}`);

        return markdown;
    }
}

export default HTMLToMarkdown;
