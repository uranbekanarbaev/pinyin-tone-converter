# pinyin-tone-converter: convert pinyin tones between tone marks and tone numbers

Convert **pinyin tones** between tone marks (`nǐ hǎo`), tone numbers (`ni3 hao3`) and no tones (`ni hao`). Zero dependencies, one file, works in Node.js and the browser.

[Pinyin tones explained](https://pinyin.hsk-tutor.com/guides/pinyin-tones-explained/) · [Online Chinese to pinyin converter](https://pinyin.hsk-tutor.com/)

```js
const { toMarks, toNumbers, toPlain, tone } = require('pinyin-tone-converter');

toMarks('ni3 hao3');          // 'nǐ hǎo'
toMarks('zhong1guo2');        // 'zhōngguó'
toMarks('lv4');               // 'lǜ'      (v and u: stand for ü)
toNumbers('nǐ hǎo');          // 'ni3 hao3'
toNumbers('lǜ', { umlaut: 'v' }); // 'lv4'
toPlain('nǐ hǎo');            // 'ni hao'
tone('mǎ');                   // 3
```

## Install

```bash
git clone https://github.com/uranbekanarbaev/pinyin-tone-converter.git
cd pinyin-tone-converter
node --test
```

Copy `src/index.js` into your project, or require it from the cloned folder.

## API

| Function | What it does |
|---|---|
| `toMarks(text)` | tone numbers to tone marks. Accepts `v` and `u:` for ü and `5` or `0` for the neutral tone |
| `toNumbers(text, { umlaut, neutral })` | tone marks to tone numbers. `umlaut`: `'ü'` (default), `'v'`, `'u:'`. `neutral`: `''` (default), `'5'`, `'0'` |
| `toPlain(text, { umlaut })` | remove all tone information |
| `tone(syllable)` | tone of one syllable: 1 to 4, or 5 for the neutral tone |

Only text shaped like a pinyin syllable is changed, so `iPhone5` and `Windows10` are left alone.

## Where does the tone mark go?

1. If the syllable has `a` or `e`, the mark goes on it: `hǎo`, `hēi`.
2. In `ou` the mark goes on the `o`: `kǒu`.
3. Otherwise on the last vowel: `jiǔ`, `huì`.

## FAQ

**How do I convert pinyin tone numbers to tone marks?** `toMarks('ni3 hao3')` returns `nǐ hǎo`.

**How do I convert tone marks to tone numbers?** `toNumbers('nǐ hǎo')` returns `ni3 hao3`.

**How is ü written with tone numbers?** Usually `v` or `u:`; both are accepted by `toMarks`, and `toNumbers` can output either with the `umlaut` option.

**Does it split run-together syllables?** `toNumbers('Zhōngguó')` gives `Zhong1guo2`. For exact results separate syllables with a space or an apostrophe.

**Need pinyin from Chinese characters?** Use the [Chinese to pinyin converter](https://pinyin.hsk-tutor.com/) or the [chinese-to-pinyin](https://github.com/uranbekanarbaev/chinesetopinyin) library.

## License

MIT
