import { genericProcessStore } from '@src/store/genericProcessStore';
import '@testing-library/jest-dom/vitest';
import { renderHook } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { globalStore } from '@src/store/globalStore';

import { useWordCount } from './useWordCount';

describe('Word counting', () => {
    afterEach(() => {
        genericProcessStore.getState().reset();
        globalStore.setState({ ignoreListNumbers: false });
    });

    describe('Basic functionality', () => {
        it('counts space-separated words correctly', () => {
            genericProcessStore.setState({ prompt: 'one two three' });
            const { result } = renderHook(() => useWordCount());
            expect(result.current.promptWordCount).toBe(3);
        });

        it('ignores leading and trailing whitespace', () => {
            genericProcessStore.setState({ prompt: '  start   end  ' });
            const { result } = renderHook(() => useWordCount());
            expect(result.current.promptWordCount).toBe(2);
        });

        it('handles multiple spaces between words', () => {
            genericProcessStore.setState({ prompt: 'word1    word2     word3' });
            const { result } = renderHook(() => useWordCount());
            expect(result.current.promptWordCount).toBe(3);
        });

        it('counts words in a sentence the same way Google Docs does (1)', () => {
            const sentence =
                '"Example Product Direct: Product Direct courses offer individualized study focused on state standards, while supported by certified teachers."';
            genericProcessStore.setState({ prompt: sentence });
            const { result } = renderHook(() => useWordCount());
            expect(result.current.promptWordCount).toBe(18);
        });

        it('counts words in a sentence the same way Google Docs does (2)', () => {
            const sentence =
                'Students in grades K-8 complete 9 units and the correlating checkpoint worksheets each semester, submitting one worksheet every two weeks.';
            genericProcessStore.setState({ prompt: sentence });
            const { result } = renderHook(() => useWordCount());
            expect(result.current.promptWordCount).toBe(20);
        });
    });

    describe('Special cases', () => {
        it('counts empty input as zero', () => {
            genericProcessStore.setState({ prompt: '' });
            const { result } = renderHook(() => useWordCount());
            expect(result.current.promptWordCount).toBe(0);
        });

        it('counts whitespace-only input as zero', () => {
            genericProcessStore.setState({ prompt: '   \t   \n   ' });
            const { result } = renderHook(() => useWordCount());
            expect(result.current.promptWordCount).toBe(0);
        });

        it('handles a mix of spaces and tabs', () => {
            genericProcessStore.setState({ prompt: 'word1\t\tword2 \t word3' });
            const { result } = renderHook(() => useWordCount());
            expect(result.current.promptWordCount).toBe(3);
        });

        it('includes list numbers by default', () => {
            genericProcessStore.setState({ prompt: '1. word' });
            const { result } = renderHook(() => useWordCount());
            expect(result.current.promptWordCount).toBe(2);

            genericProcessStore.setState({ prompt: '10. word' });
            const { result: result2 } = renderHook(() => useWordCount());
            expect(result2.current.promptWordCount).toBe(2);

            genericProcessStore.setState({ prompt: '100. word' });
            const { result: result3 } = renderHook(() => useWordCount());
            expect(result3.current.promptWordCount).toBe(2);
        });

        it('counts list numbers that only have a space following them', () => {
            genericProcessStore.setState({ prompt: '1. ' });
            const { result } = renderHook(() => useWordCount());
            expect(result.current.promptWordCount).toBe(1);
        });

        it("doesn't list numbers that only have a space following them when list items are ignored", () => {
            globalStore.setState({ ignoreListNumbers: true });
            genericProcessStore.setState({ prompt: '1. ' });
            const { result } = renderHook(() => useWordCount());
            expect(result.current.promptWordCount).toBe(0);
        });

        it('optionally ignores list numbers', () => {
            globalStore.setState({ ignoreListNumbers: true });
            genericProcessStore.setState({ prompt: '1. word' });
            const { result } = renderHook(() => useWordCount());
            expect(result.current.promptWordCount).toBe(1);

            genericProcessStore.setState({ prompt: '10. word' });
            const { result: result2 } = renderHook(() => useWordCount());
            expect(result2.current.promptWordCount).toBe(1);

            genericProcessStore.setState({ prompt: '100. word' });
            const { result: result3 } = renderHook(() => useWordCount());
            expect(result3.current.promptWordCount).toBe(1);
        });

        it('counts a list number as a word when the list spans multiple lines', () => {
            genericProcessStore.setState({
                prompt: '1. Lake One\n2. Lake Two\n3. Lake Three'
            });
            const { result } = renderHook(() => useWordCount());
            expect(result.current.promptWordCount).toBe(9);
        });

        it("doesn't count a list number as a word when the list spans multiple lines if list numbers are ignored", () => {
            globalStore.setState({ ignoreListNumbers: true });
            genericProcessStore.setState({
                prompt: '1. Lake One\n2. Lake Two\n3. Lake Three'
            });
            const { result } = renderHook(() => useWordCount());
            expect(result.current.promptWordCount).toBe(6);
        });

        it('counts standalone numbers as words', () => {
            genericProcessStore.setState({ prompt: "It's 20 degrees outside" });
            const { result } = renderHook(() => useWordCount());
            expect(result.current.promptWordCount).toBe(4);
        });

        it('treats hyphenated words as single words', () => {
            genericProcessStore.setState({
                prompt: 'word - word word-word word- -word'
            });
            const { result } = renderHook(() => useWordCount());
            expect(result.current.promptWordCount).toBe(5);
        });

        it('treats underscored words as single words', () => {
            genericProcessStore.setState({
                prompt: 'word _ word word_word word_ _word'
            });
            const { result } = renderHook(() => useWordCount());
            expect(result.current.promptWordCount).toBe(5);
        });

        it('counts contractions as single words', () => {
            genericProcessStore.setState({ prompt: "don't can't won't" });
            const { result } = renderHook(() => useWordCount());
            expect(result.current.promptWordCount).toBe(3);
        });

        it('ignores punctuation', () => {
            genericProcessStore.setState({ prompt: 'word! word? word. word,' });
            const { result } = renderHook(() => useWordCount());
            expect(result.current.promptWordCount).toBe(4);
        });

        it('handles newlines', () => {
            genericProcessStore.setState({ prompt: 'word\nword\nword' });
            const { result } = renderHook(() => useWordCount());
            expect(result.current.promptWordCount).toBe(3);
        });

        it("doesn't count standalone special characters", () => {
            genericProcessStore.setState({
                prompt: 'one " two \' three" / four one ! two . three ? four'
            });
            const { result } = renderHook(() => useWordCount());
            expect(result.current.promptWordCount).toBe(8);

            genericProcessStore.setState({
                prompt: '! @ # $ % ^ & * ( ) \\ | / \' ; , . [ ] { } | < > ? : " !! @@ ## $$ %^&% ($%*#%()* (@#*%() *@<:{ >:?|} <:)) ***'
            });
            const { result: result2 } = renderHook(() => useWordCount());
            expect(result2.current.promptWordCount).toBe(0);
        });
    });

    describe('STEM', () => {
        it('counts a LaTeX function the same way as Google Docs', () => {
            genericProcessStore.setState({ prompt: '$$f(10) = (10^3)/3 = 1000/3$$' });
            const { result } = renderHook(() => useWordCount());
            expect(result.current.promptWordCount).toBe(7);
        });

        it('counts multi-line LaTeX the same way as Google Docs', () => {
            const latex = `$$
\\begin{align*}
f(x) &= \\int f'(x) \\, \\mathrm{d}x \\\\
    &= \\int x^2 \\, \\mathrm{d}x  \\\\
    &= \\frac{x^3}{3} + C \\, .
\\end{align*}
$$`;
            genericProcessStore.setState({ prompt: latex });
            const { result } = renderHook(() => useWordCount());
            expect(result.current.promptWordCount).toBe(23);
        });

        it('counts additional multi-line LaTeX the same way as Google Docs', () => {
            const latex = `$$
\\begin{align*}
f(0) &= 0\\\\
\\frac{0^3}{3} + C  &= 0  \\\\
  C  &= 0 \\, .
\\end{align*}
$$

So, $$f(x) =\\frac{x^3}{3}\\, ,$$ and

$$
\\begin{align*}
f(10) &= \\frac{10^3}{3} \\\\
		&= \\frac{1 000}{3} \\\\
		& \\approx 333.33 \\, .
\\end{align*}
$$`;
            genericProcessStore.setState({ prompt: latex });
            const { result } = renderHook(() => useWordCount());
            expect(result.current.promptWordCount).toBe(40);
        });

        it('counts a sentence with math the same way as Google Docs', () => {
            genericProcessStore.setState({
                prompt: "If F(x) is the definite integral of f(x), then F'(x) = f(x)."
            });
            const { result } = renderHook(() => useWordCount());
            expect(result.current.promptWordCount).toBe(15);
        });

        it('counts a number followed by a word separated by a backslash as two words', () => {
            genericProcessStore.setState({ prompt: '1535\\mathrm' });
            const { result } = renderHook(() => useWordCount());
            expect(result.current.promptWordCount).toBe(2);
        });

        it('counts equations in parity with Google Docs', () => {
            genericProcessStore.setState({ prompt: '1/2' });
            const { result } = renderHook(() => useWordCount());
            expect(result.current.promptWordCount).toBe(2);

            genericProcessStore.setState({ prompt: '1*2' });
            const { result: result2 } = renderHook(() => useWordCount());
            expect(result2.current.promptWordCount).toBe(2);

            genericProcessStore.setState({ prompt: '1-2' });
            const { result: result3 } = renderHook(() => useWordCount());
            expect(result3.current.promptWordCount).toBe(1);

            genericProcessStore.setState({ prompt: '1+2' });
            const { result: result4 } = renderHook(() => useWordCount());
            expect(result4.current.promptWordCount).toBe(2);

            genericProcessStore.setState({ prompt: '1&2' });
            const { result: result5 } = renderHook(() => useWordCount());
            expect(result5.current.promptWordCount).toBe(2);

            genericProcessStore.setState({ prompt: '1=2' });
            const { result: result6 } = renderHook(() => useWordCount());
            expect(result6.current.promptWordCount).toBe(2);

            genericProcessStore.setState({ prompt: '1^2' });
            const { result: result7 } = renderHook(() => useWordCount());
            expect(result7.current.promptWordCount).toBe(2);

            genericProcessStore.setState({ prompt: '1+2-3*4/5' });
            const { result: result8 } = renderHook(() => useWordCount());
            expect(result8.current.promptWordCount).toBe(4);
        });

        it('counts LaTeX numbers as two words to keep parity with Google Docs', () => {
            genericProcessStore.setState({ prompt: '$$99.2$$' });
            const { result } = renderHook(() => useWordCount());
            expect(result.current.promptWordCount).toBe(2);
        });
    });

    describe('Internationalization', () => {
        it('counts words with accented characters', () => {
            genericProcessStore.setState({ prompt: 'Café au lait' });
            const { result } = renderHook(() => useWordCount());
            expect(result.current.promptWordCount).toBe(3);
        });

        it('counts words with umlauts', () => {
            genericProcessStore.setState({ prompt: 'Über Äpfel und Öl' });
            const { result } = renderHook(() => useWordCount());
            expect(result.current.promptWordCount).toBe(4);
        });

        it('counts Cyrillic words', () => {
            genericProcessStore.setState({ prompt: 'Россия и Україна' });
            const { result } = renderHook(() => useWordCount());
            expect(result.current.promptWordCount).toBe(3);
        });

        it('counts Japanese words', () => {
            genericProcessStore.setState({ prompt: 'こんにちは さようなら' });
            const { result } = renderHook(() => useWordCount());
            expect(result.current.promptWordCount).toBe(2);
        });

        // TODO: Currently, if the language is not Chinese but contains Chinese
        // characters, it will inappropriately count individual contiguous Chinese
        // characters as individual words. For example, 水水水 would be one word, but it
        // should be counted as three.
        // UPDATE: A Japanese MTL agent has informed me that they use the default Google
        // Docs word count behavior, which does indeed count contiguous Kanji as one
        // word, so this might be fine.
        it('counts Japanese text that includes hirigana, katakana, and kanji as Japanese rather than Chinese', () => {
            genericProcessStore.setState({ prompt: 'あああ アアア 水水水' });

            const { result } = renderHook(() => useWordCount());

            expect(result.current.promptWordCount).toBe(3);
        });

        it('counts Chinese words', () => {
            const chinese = `平課包吉相草星點瓜兌想事波詞貓牠蝶裝，肖帽第早向身蝴老字事空就；校麼國我再昔千書弓音借、院把品五真燈多兒飛冒知買，扒抄能讀「說幫停」定遠忍重孝面。

安香蝴停樹怎，半眼多實，男音常前呀春魚買歡像穴幸金高棵斗久。姐着小占把休、記會首多吹歌朵實的蝸種羊，三各夕吹出植言意童言還入交黃完八婆大，呢位怕爸圓掃。

孝更色連肖停蝴十消五服古蝸它陽媽几細急，你古爪拉甲很玉色但黑是中，遠豆根五後珠冰隻蝶中？幾根汗外秋木校鴨幫假好吉海新尺良歡黃，害信十可哭把經珠花只讀害頭習直金言。回拉幾里時！們飯福久旦。

力兄山尾學次青菜斤教假，丁請固聽巴松他前紅：校民帶土過常買品訴，回遠丁吉得貫棵平冒、各從力加怎了朋牠候，口布跳北坡支立。

重八對請杯支林夏四呀，玉叫許因蝴，不封申又結躲出；什午言急冰室東可第姊害夕。樹海他候只進北身喜學到？才昔交升申何根目吉品土書，尺房戊，耳中馬坐兔平。

吉視頭月黃河平遠，甲羽各教姊道目何日找坡上書吹祖立夏辛！停瓜民快念己遠冬反山想，過葉色一年尾月快貫吉里。

奶片您口目秋兩？美穿胡哥母原示過，三連苗加馬躲男坐河誰休男訴會，升苗細子，陽金蝴至祖穴節海才旁貝文中住裏筆何記「害乞具只」昔來天；加呢昌士雪院。`;

            genericProcessStore.setState({ prompt: chinese });
            const { result } = renderHook(() => useWordCount());
            expect(result.current.promptWordCount).toBe(500);
        });

        it('counts RTL words', () => {
            const phraseOne =
                '10. بريتوريا (العاصمة التنفيذية) بلومفونتين (العاصمة القضائية) كيب تاون (العاصمة التشريعية)، جنوب أفريقيا';
            genericProcessStore.setState({ prompt: phraseOne });
            const { result } = renderHook(() => useWordCount());
            expect(result.current.promptWordCount).toBe(14);

            const phraseTwo = '5. أنتاناناريفو، مدغشقر';
            genericProcessStore.setState({ prompt: phraseTwo });
            const { result: result2 } = renderHook(() => useWordCount());
            expect(result2.current.promptWordCount).toBe(3);
        });
    });

    describe('Special formatting', () => {
        it('ignores markdown formatting', () => {
            genericProcessStore.setState({ prompt: '*one* _two_ **three** __four__' });
            const { result } = renderHook(() => useWordCount());
            expect(result.current.promptWordCount).toBe(4);
        });

        it('counts alphanumeric combinations as single words', () => {
            genericProcessStore.setState({ prompt: 'COVID-19' });
            const { result } = renderHook(() => useWordCount());
            expect(result.current.promptWordCount).toBe(1);

            genericProcessStore.setState({ prompt: 'A1' });
            const { result: result2 } = renderHook(() => useWordCount());
            expect(result2.current.promptWordCount).toBe(1);

            genericProcessStore.setState({ prompt: '3D-printed' });
            const { result: result3 } = renderHook(() => useWordCount());
            expect(result3.current.promptWordCount).toBe(1);

            genericProcessStore.setState({ prompt: 'COVID-19 A1' });
            const { result: result4 } = renderHook(() => useWordCount());
            expect(result4.current.promptWordCount).toBe(2);

            genericProcessStore.setState({ prompt: 'COVID-19 A1 3D-printed' });
            const { result: result5 } = renderHook(() => useWordCount());
            expect(result5.current.promptWordCount).toBe(3);
        });

        it('treats slash-separated items as separate words', () => {
            genericProcessStore.setState({ prompt: 'yes/no three/four/five' });
            const { result } = renderHook(() => useWordCount());
            expect(result.current.promptWordCount).toBe(5);
        });

        it('counts multiple consecutive slashes the same as single slashes', () => {
            genericProcessStore.setState({ prompt: 'one//two///three' });
            const { result } = renderHook(() => useWordCount());
            expect(result.current.promptWordCount).toBe(3);
        });

        it('counts colon-separated words as separate words', () => {
            genericProcessStore.setState({ prompt: 'one:two three:four:five' });
            const { result } = renderHook(() => useWordCount());
            expect(result.current.promptWordCount).toBe(5);
        });

        it('counts emojis as words', () => {
            genericProcessStore.setState({
                prompt: 'chicken: 🐤 (chicken) turtle:🐢 (turtle).'
            });
            const { result } = renderHook(() => useWordCount());
            expect(result.current.promptWordCount).toBe(6);
        });

        it('counts monetary values as two words', () => {
            genericProcessStore.setState({
                prompt: 'An advance of $20,000 upon signing.'
            });
            const { result } = renderHook(() => useWordCount());
            expect(result.current.promptWordCount).toBe(7);
        });

        it('counts decimal values as two words', () => {
            genericProcessStore.setState({ prompt: '3.14' });
            const { result } = renderHook(() => useWordCount());
            expect(result.current.promptWordCount).toBe(2);

            genericProcessStore.setState({ prompt: '3.14.' });
            const { result: result2 } = renderHook(() => useWordCount());
            expect(result2.current.promptWordCount).toBe(2);

            genericProcessStore.setState({ prompt: '.14' });
            const { result: result3 } = renderHook(() => useWordCount());
            expect(result3.current.promptWordCount).toBe(1);

            genericProcessStore.setState({ prompt: '.14.' });
            const { result: result4 } = renderHook(() => useWordCount());
            expect(result4.current.promptWordCount).toBe(1);

            genericProcessStore.setState({ prompt: 'The value is 3.14.' });
            const { result: result5 } = renderHook(() => useWordCount());
            expect(result5.current.promptWordCount).toBe(5);
        });

        it('treats words separated by en or em dashes as separate', () => {
            genericProcessStore.setState({ prompt: '1–2 em—dash hy-phen' });
            const { result } = renderHook(() => useWordCount());
            expect(result.current.promptWordCount).toBe(5);
        });
    });
});
