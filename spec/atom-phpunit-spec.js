'use babel';

import AtomPhpunit from '../lib/atom-phpunit';

const fixture = require.resolve('./fixtures/FixtureTest.php');

describe('atom-phpunit', () => {

    // activate the package and open the fixture file
    beforeEach(() => {
      waitsForPromise(() => atom.workspace.open(fixture, {initialLine: 7}))

      runs(() => {
        atom.packages.activatePackage('atom-phpunit')
      })
    })


    it('can get the current file path', () => {
        expect(AtomPhpunit.getFilepath()).toBe(fixture);
    })

    it('can get the current function name', () => {
        expect(AtomPhpunit.getFunctionName()).toBe('test_method');
    })


    describe('when executing commands', () => {

        // helper function to wait for async commands to run, then run a callback of expectations
        const runCommandThen = (expectations) => {
            let done = false;
            runs(() => AtomPhpunit.execute().on('exit', () => done = true ))
            waitsFor(() => done, "The command should be complete", 250 )
            runs(expectations)
        }

        // spoof the command to just print a string
        beforeEach(() => {
            atom.config.set('atom-phpunit.useVendor',false)
            atom.config.set('atom-phpunit.phpunitPath','php -r "echo \\\"the command has run\\\";"')
        })

        afterEach(() => {
            atom.config.unset('atom-phpunit.useVendor')
            atom.config.unset('atom-phpunit.phpunitPath')
        });


        it('succeeds and updates the output panel', () => {

            runCommandThen(() => expect(AtomPhpunit.errorView.getElement().innerText).toMatch(/the command has run/))

        })


        describe('when notifications are being used', () => {

            it('adds a notification', () => {

                runCommandThen(() => {
                    expect(atom.notifications.getNotifications().length).not.toBe(0)
                    expect(AtomPhpunit.errorView.element.classList.contains('error')).toBe(false)
                    expect(AtomPhpunit.outputPanel.isVisible()).toBe(false)
                })

            })
        })


        describe('when notifications are NOT being used', () => {

            beforeEach(() => atom.config.set('atom-phpunit.successAsNotifications',false))
            afterEach(() => atom.config.unset('atom-phpunit.successAsNotifications'))

            it('displays the output panel', () => {

                expect(AtomPhpunit.outputPanel.isVisible()).toBe(false)

                runCommandThen(() => expect(AtomPhpunit.outputPanel.isVisible()).toBe(true))

            })
        })
    })
})
