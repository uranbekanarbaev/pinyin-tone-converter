'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { toMarks, toNumbers, toPlain, tone } = require('../src/index');

test('tone numbers to tone marks', () => {
  assert.equal(toMarks('ni3 hao3'), 'nǐ hǎo');
  assert.equal(toMarks('zhong1guo2'), 'zhōngguó');
  assert.equal(toMarks('Zhong1 wen2'), 'Zhōng wén');
});

test('mark placement rules', () => {
  assert.equal(toMarks('liu2'), 'liú');   // iu: mark on the second vowel
  assert.equal(toMarks('hui4'), 'huì');   // ui: mark on the second vowel
  assert.equal(toMarks('gou3'), 'gǒu');   // ou: mark on o
  assert.equal(toMarks('xie4'), 'xiè');   // ie: mark on e
  assert.equal(toMarks('yue4'), 'yuè');
  assert.equal(toMarks('hao3'), 'hǎo');   // a before o
});

test('ü typed as v or u:', () => {
  assert.equal(toMarks('lv4'), 'lǜ');
  assert.equal(toMarks('nu:3'), 'nǚ');
  assert.equal(toMarks('lü4'), 'lǜ');
});

test('neutral tone', () => {
  assert.equal(toMarks('ma5'), 'ma');
  assert.equal(toMarks('ma0'), 'ma');
});

test('leaves non-pinyin text alone', () => {
  assert.equal(toMarks('iPhone5 and Windows10'), 'iPhone5 and Windows10');
  assert.equal(toMarks('2024 3.5'), '2024 3.5');
});

test('tone marks to tone numbers', () => {
  assert.equal(toNumbers('nǐ hǎo'), 'ni3 hao3');
  assert.equal(toNumbers('Zhōngguó rén'), 'Zhong1guo2 ren2');
  assert.equal(toNumbers('lǜ'), 'lü4');
  assert.equal(toNumbers('lǜ', { umlaut: 'v' }), 'lv4');
  assert.equal(toNumbers('nǚ', { umlaut: 'u:' }), 'nu:3');
});

test('neutral tone numbers are opt-in', () => {
  assert.equal(toNumbers('mǎ ma'), 'ma3 ma');
  assert.equal(toNumbers('mǎ ma', { neutral: '5' }), 'ma3 ma5');
});

test('no tones', () => {
  assert.equal(toPlain('nǐ hǎo'), 'ni hao');
  assert.equal(toPlain('ni3 hao3'), 'ni hao');
  assert.equal(toPlain('lǜ'), 'lu');
  assert.equal(toPlain('lǜ', { umlaut: 'v' }), 'lv');
});

test('tone of one syllable', () => {
  assert.equal(tone('mā'), 1);
  assert.equal(tone('ma2'), 2);
  assert.equal(tone('mǎ'), 3);
  assert.equal(tone('mà'), 4);
  assert.equal(tone('ma'), 5);
  assert.equal(tone('ma0'), 5);
});

test('round trip', () => {
  for (const s of ['nǐ hǎo', 'zhōng wén', 'xué xí', 'lǜ sè', 'ài']) {
    assert.equal(toMarks(toNumbers(s, { umlaut: 'v' })), s);
  }
});
