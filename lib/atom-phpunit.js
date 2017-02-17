'use babel';

import 'atom';
import child_process from 'child_process';

export default {

  config: {
    useVendor: {
      order: 1,
      description: 'Uses the project\'s phpunit binary (./vendor/bin/phpunit)',
      type: 'boolean',
      default: true
    },
    phpunitPath: {
      order: 2,
      title: 'PHPUnit Binary Path',
      description: 'Used only if \'Use Vendor\' is not ticked.',
      type: 'string',
      default: '/usr/local/bin/phpunit'
    }
  },

  exec: null,

  activate(state) {
    this.exec = child_process.exec;

    atom.commands.add('atom-workspace', {
      'atom-phpunit:run-test': () => this.runTest(),
      'atom-phpunit:run-class': () => this.runClass(),
      'atom-phpunit:run-suite': () => this.runSuite()
    });
  },

  deactivate() {},

  runTest() {
    func = this.getFunctionName()
    if (!func) {
      atom.notifications.addError('Function name not found! Make sure your cursor is inside the test you want to run.')
      return;
    }

    this.execute(func);
  },

  runClass() {
    filename = this.getClass()
    if (!filename) {
      atom.notifications.addError('Failed to get filename! Make sure you are in the test file you want run.')
      return;
    }

    this.execute(filename)
  },

  runSuite() {
    this.execute()
  },

  execute(filter) {
    if (atom.config.get('atom-phpunit.useVendor'))
      cmd = './vendor/bin/phpunit'
    else
      cmd = atom.config.get('atom-phpunit.phpunitPath')

    if (typeof filter !== 'undefined')
      cmd += ` --filter=${filter}`;

    console.log(`atom-phpunit: ${cmd}`)

    this.exec(cmd, {cwd: atom.project.getPaths()[0]}, (error, stdout, stderr) => {
      if (error && stderr) {
        atom.notifications.addError('Error!', {description: cmd, detail: `${error}. ${stderr}`});
      } else if (error) {
        atom.notifications.addError('Test Failed!', {description: cmd, detail: stdout, dismissable: true});
      } else {
        atom.notifications.addSuccess('Test Passed!', {description: cmd, detail: stdout, dismissable: true});
      }
    });
  },

  getFunctionName() {
    let editor = atom.workspace.getActiveTextEditor()
    let pos = editor.getCursorBufferPosition()
    let buffer = editor.getBuffer()

    for (var row = pos.row; row--; row > 0) {
      line = buffer.lineForRow(row)
      if (line.includes('function '))
        return line.match('function ([^\\(]+)\\(')[1]
    }

    return false
  },

  getClass() {
    editor = atom.workspace.getActivePaneItem()
    file = editor.buffer.file
    filename = file.getBaseName()
    return filename.match('(.+)\.php$')[1]
  }

};
