'use strict';

// Tone marks per vowel: [tone1, tone2, tone3, tone4]
const MARKED = {
  a: 'āáǎà', e: 'ēéěè', i: 'īíǐì', o: 'ōóǒò', u: 'ūúǔù', ü: 'ǖǘǚǜ',
};
const BASE_OF = {};
for (const [base, marks] of Object.entries(MARKED)) {
  Array.from(marks).forEach((mark, index) => { BASE_OF[mark] = { base, tone: index + 1 }; });
}
const VOWELS = 'aeiouü';
const isVowel = ch => ch !== undefined && VOWELS.includes(ch.toLowerCase());

// Letters a pinyin syllable is made of, typed as plain ASCII: v and u: both stand for ü.
const SYLLABLE_SHAPE = /^(?:zh|ch|sh|[bpmfdtnlgkhjqxrzcsyw])?[aeiouüv]{1,4}(?:ng|n|r)?$|^(?:ng|n|m|hm|hng)$/i;

function umlautForm(options) {
  const style = (options && options.umlaut) || 'ü';
  if (!['ü', 'v', 'u:'].includes(style)) throw new RangeError('umlaut must be "ü", "v" or "u:"');
  return style;
}

function applyCase(source, target) {
  return source === source.toUpperCase() && source !== source.toLowerCase() ? target.toUpperCase() : target;
}

// Where the tone mark goes: on a or e if there is one; in "ou" on o; otherwise on the last vowel.
function markIndex(letters) {
  const lower = letters.toLowerCase();
  let at = lower.indexOf('a');
  if (at < 0) at = lower.indexOf('e');
  if (at >= 0) return at;
  const ou = lower.indexOf('ou');
  if (ou >= 0) return ou;
  for (let i = lower.length - 1; i >= 0; i--) if (VOWELS.includes(lower[i])) return i;
  return -1;
}

/**
 * Tone numbers to tone marks: "ni3 hao3" -> "nǐ hǎo". Also accepts v and u: for ü
 * ("lv4", "nu:3") and tone 5 or 0 for the neutral tone (no mark).
 */
function toMarks(text) {
  return String(text == null ? '' : text).replace(/([A-Za-zü]+(?::)?)([0-5])(?![0-9])/g, (whole, letters, digit) => {
    const clean = letters.replace(/u:/gi, 'ü').replace(/v/gi, c => (c === 'V' ? 'Ü' : 'ü'));
    if (!SYLLABLE_SHAPE.test(letters.replace(/u:/gi, 'v'))) return whole;
    if (digit === '5' || digit === '0') return clean;
    const at = markIndex(clean);
    if (at < 0) return whole;
    const vowel = clean[at];
    const marked = MARKED[vowel.toLowerCase()][Number(digit) - 1];
    return clean.slice(0, at) + applyCase(vowel, marked) + clean.slice(at + 1);
  }).normalize('NFC');
}

/**
 * Tone marks to tone numbers: "nǐ hǎo" -> "ni3 hao3". A syllable without a mark is left
 * unchanged, or gets 5 with { neutral: '5' }. Run-together syllables such as "Zhōngguó" are
 * split after the final n, ng or r; separate syllables with a space or apostrophe to be exact.
 */
function toNumbers(text, options = {}) {
  const umlaut = umlautForm(options);
  const neutral = options.neutral === undefined ? '' : String(options.neutral);
  if (!['', '5', '0'].includes(neutral)) throw new RangeError('neutral must be "", "5" or "0"');
  const chars = Array.from(String(text == null ? '' : text).normalize('NFC'));
  const letter = ch => /[A-Za-zü]/.test(ch) || (BASE_OF[ch] !== undefined);
  const out = [];
  const write = (ch) => { out.push(ch === 'ü' || ch === 'Ü' ? (umlaut === 'ü' ? ch : umlaut === 'v' ? (ch === 'Ü' ? 'V' : 'v') : (ch === 'Ü' ? 'U:' : 'u:')) : ch); };
  for (let i = 0; i < chars.length;) {
    if (!letter(chars[i])) { out.push(chars[i]); i++; continue; }
    let j = i;
    while (j < chars.length && letter(chars[j])) j++;
    const run = chars.slice(i, j);
    if (!run.some(ch => BASE_OF[ch.toLowerCase()])) {
      // no tone mark in this run
      const word = run.join('');
      const plain = word.replace(/ü/gi, 'v');
      for (const ch of run) write(ch);
      if (neutral && SYLLABLE_SHAPE.test(plain) && !/^(n|m|ng)$/i.test(plain)) out.push(neutral);
      i = j; continue;
    }
    let k = 0;
    while (k < run.length) {
      let tone = 0;
      while (k < run.length) {
        const entry = BASE_OF[run[k].toLowerCase()];
        const ch = run[k];
        if (entry) {
          tone = entry.tone;
          write(applyCase(ch, entry.base));
        } else write(ch);
        k++;
        const next = run[k];
        if (tone && !isVowel(next && (BASE_OF[next.toLowerCase()] ? BASE_OF[next.toLowerCase()].base : next))) break;
      }
      if (tone) {
        const rest = run.slice(k).join('').toLowerCase();
        let take = 0;
        if (/^ng(?![aeiouü])/.test(rest) && !BASE_OF[run[k + 2] && run[k + 2].toLowerCase()]) take = 2;
        else if (/^(n|r)(?![aeiouü])/.test(rest) && !(run[k + 1] && BASE_OF[run[k + 1].toLowerCase()])) take = 1;
        for (let t = 0; t < take; t++) { write(run[k]); k++; }
        out.push(String(tone));
      }
    }
    i = j;
  }
  return out.join('');
}

/** Remove all tone information: "nǐ hǎo" and "ni3 hao3" both become "ni hao". */
function toPlain(text, options = {}) {
  const umlaut = umlautForm(options);
  const asUmlaut = ch => (umlaut === 'ü' ? 'u' : umlaut === 'v' ? 'v' : 'u:');
  const noDigits = String(text == null ? '' : text).replace(/([A-Za-zü:]+)[0-5](?![0-9])/g, (w, l) => (SYLLABLE_SHAPE.test(l.replace(/u:/gi, 'v')) ? l : w));
  return Array.from(noDigits.normalize('NFC')).map(ch => {
    const entry = BASE_OF[ch.toLowerCase()];
    if (entry) {
      const base = entry.base === 'ü' ? asUmlaut() : entry.base;
      return applyCase(ch, base);
    }
    if (ch === 'ü') return asUmlaut();
    if (ch === 'Ü') return asUmlaut().toUpperCase();
    return ch;
  }).join('');
}

/** Tone of one syllable: 1 to 4, or 5 for the neutral tone. */
function tone(syllable) {
  const text = String(syllable).normalize('NFC');
  for (const ch of Array.from(text)) {
    const entry = BASE_OF[ch.toLowerCase()];
    if (entry) return entry.tone;
  }
  const digit = text.match(/([0-5])$/);
  if (digit) return digit[1] === '0' ? 5 : Number(digit[1]);
  return 5;
}

module.exports = { toMarks, toNumbers, toPlain, tone };
