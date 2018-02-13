'use babel';

import fs from 'fs';
import AtomPhpunitView from '../lib/atom-phpunit-view';

const fixtures = {
    pass: fs.readFileSync(require.resolve('./fixtures/phpunit_output_passing.txt')).toString(),
    fail: fs.readFileSync(require.resolve('./fixtures/phpunit_output_failing.txt')).toString(),
};

describe('atom-phpunit-view', () => {

    let view = new AtomPhpunitView;

    describe('cleans the phpunit output', () => {

        it('from passing tests', () => {

            expect(view.getCleanOutput(fixtures.pass)).not.toMatch(/PHPUnit/)
            expect(view.getCleanOutput(fixtures.pass)).not.toMatch(/OK/)

        })

        it('from failing tests', () => {

            expect(view.getCleanOutput(fixtures.fail)).not.toMatch(/PHPUnit/)
            expect(view.getCleanOutput(fixtures.fail)).not.toMatch(/Failures/)

        })

    })

    describe('creates an updated header', () => {

        let command = 'vendor/bin/phpunit'

        it('for passing tests', () => {

            expect(view.getUpdatedHeader(fixtures.pass,command)).toMatch(/OK/)

        })

        it('for failing tests', () => {

            expect(view.getUpdatedHeader(fixtures.fail,command)).toMatch(/Failures: 1/)

        })

        it('for unrecognized output', () => {

            expect(view.getUpdatedHeader('this is unrecognized output',command)).toMatch(/PHPUnit Output/)

        })

    })


});
