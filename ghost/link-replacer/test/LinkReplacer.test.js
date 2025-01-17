const assert = require('assert');
const linkReplacer = require('../lib/LinkReplacer');
const cheerio = require('cheerio');
const sinon = require('sinon');

describe('LinkReplacementService', function () {
    afterEach(function () {
        sinon.restore();
    });

    it('exported', function () {
        assert.equal(require('../index'), linkReplacer);
    });

    describe('replace', function () {
        it('Can replace to URL', async function () {
            const html = '<a href="http://localhost:2368/dir/path">link</a>';
            const expected = '<a href="https://google.com/test-dir?test-query">link</a>';

            const replaced = await linkReplacer.replace(html, () => new URL('https://google.com/test-dir?test-query'));
            assert.equal(replaced, expected);
        });

        it('Doesn\'t break weird &map', async function () {
            // Refs https://github.com/TryGhost/Team/issues/2666: somehow this gets replaced with https://example.com/test.jpg?test=true↦id=de76 if decoding entities is enabled
            const html = '<img src="https://example.com/test.jpg?test=true&map_id=test">';
            const expected = '<img src="https://example.com/test.jpg?test=true&map_id=test">';

            const replaced = await linkReplacer.replace(html, () => new URL('https://google.com/test-dir?test-query'));
            assert.equal(replaced, expected);
        });

        it('Does not escape HTML characters', async function () {
            const html = 'This is a test & this \'should\' not "be" escaped';
            const replaced = await linkReplacer.replace(html, () => new URL('https://google.com/test-dir?test-query'));
            assert.equal(replaced, html);
        });

        it('Can replace to string', async function () {
            const html = '<a href="http://localhost:2368/dir/path">link</a>';
            const expected = '<a href="#valid-string">link</a>';

            const replaced = await linkReplacer.replace(html, () => '#valid-string');
            assert.equal(replaced, expected);
        });

        it('Ignores invalid links', async function () {
            const html = '<a href="invalid">link</a>';
            const expected = '<a href="invalid">link</a>';

            const replaced = await linkReplacer.replace(html, () => 'valid');
            assert.equal(replaced, expected);
        });

        it('Ignores cheerio errors', async function () {
            sinon.stub(cheerio, 'load').throws(new Error('test'));
            const html = '<a href="http://localhost:2368/dir/path">link</a>';

            const replaced = await linkReplacer.replace(html, () => 'valid');
            assert.equal(replaced, html);
        });
    });
});
