import 'katex/dist/katex.min.css';
import LatexComponent from 'react-latex-next';

type Props = {
    content: string;
};
/**
 * Replace $$ with $ for inline LaTeX while preserving block equations.
 *
 * The client specifies $$ for inline LaTeX, but the LaTeX rendering library requires $
 * for inline LaTeX, hence the need for this adjustment.
 * @param content The content to adjust.
 * @returns The adjusted content with in-line $$ replaced with $.
 */
export const adjustLatexDelimiters = (content: string): string => {
    const lines = content.split('\n');

    const processedLines = lines.map(line => {
        // If the line is a block equation (starts and ends with $$), leave it as is
        if (line.trim().startsWith('$$') && line.trim().endsWith('$$')) {
            return line;
        }

        // Replace inline $$ with $ for all other cases
        return line.replace(/\$\$(.*?)\$\$/g, '$$$1$');
    });

    return processedLines.join('\n');
};

export default function Latex({ content }: Props) {
    return (
        <div className='whitespace-pre-wrap break-words font-sans'>
            <LatexComponent>{adjustLatexDelimiters(content)}</LatexComponent>
        </div>
    );
}
