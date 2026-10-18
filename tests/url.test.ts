import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalizeServer, safePath } from '../src/lib/url.ts';

test('adres normalleştirilir ve yalnızca https kabul edilir', () => {
  assert.equal(normalizeServer('su.example.com'), 'https://su.example.com');
  assert.equal(normalizeServer(' https://su.example.com/admin?x=1 '), 'https://su.example.com');
  assert.equal(normalizeServer('http://su.example.com'), null);
  assert.equal(normalizeServer('https://user:pw@su.example.com'), null);
  assert.equal(normalizeServer('localhost'), null);
  assert.equal(normalizeServer(''), null);
});

test('panel yolu site içi mutlak yola indirgenir', () => {
  assert.equal(safePath('/admin/kurye'), '/admin/kurye');
  assert.equal(safePath('//evil.com'), '/');
  assert.equal(safePath('https://evil.com'), '/');
  assert.equal(safePath('/a?b=1'), '/');
});
