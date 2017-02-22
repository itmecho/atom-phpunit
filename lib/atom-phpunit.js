'use babel';

import 'atom';
import child_process from 'child_process';
import AtomPhpunitView from './atom-phpunit-view.js';

export default {

  config: {
    persistSuccess: {
      order: 1,
      description: 'Keep success notifications on screen until dismissed',
      type: 'boolean',
      default: false
    },
    persistFailure: {
      order: 2,
      description: 'Keep failure notifications on screen until dismissed',
      type: 'boolean',
      default: true
    },
    useVendor: {
      order: 3,
      description: 'Uses the project\'s phpunit binary (./vendor/bin/phpunit)',
      type: 'boolean',
      default: true
    },
    phpunitPath: {
      order: 4,
      title: 'PHPUnit Binary Path',
      description: 'Used only if \'Use Vendor\' is not ticked.',
      type: 'string',
      default: '/usr/local/bin/phpunit'
    }
  },

  exec: null,

  activate(state) {
    this.exec = child_process.exec;
    this.errorView = new AtomPhpunitView(state.atomPhpunitViewState);
    this.outputPanel = atom.workspace.addBottomPanel({
      item: this.errorView.getElement(),
      visible: false
    });

    atom.commands.add('atom-workspace', {
      'atom-phpunit:run-test': () => this.runTest(),
      'atom-phpunit:run-class': () => this.runClass(),
      'atom-phpunit:run-suite': () => this.runSuite(),
      'atom-phpunit:toggle-output': () => this.toggleOutput()
    });
  },

  serialize() {
    return {
      atomPhpunitViewState: this.errorView.serialize()
    };
  },

  deactivate() {
    this.outputPanel.destroy();
    this.errorView.destroy();
  },

  runTest() {
    if (this.outputPanel.isVisible()) {
      this.errorView.update('No Output');
      this.outputPanel.hide();
    }
    func = this.getFunctionName();
    if (!func) {
      atom.notifications.addError('Function name not found! Make sure your cursor is inside the test you want to run.');
      return;
    }

    this.execute(func);
  },

  runClass() {
    if (this.outputPanel.isVisible()) {
      this.errorView.update('No Output');
      this.outputPanel.hide();
    }
    filename = this.getClass();
    if (!filename) {
      atom.notifications.addError('Failed to get filename! Make sure you are in the test file you want run.');
      return;
    }

    this.execute(filename);
  },

  runSuite() {
    if (this.outputPanel.isVisible()) {
      this.errorView.update('No Output');
      this.outputPanel.hide();
    }
    this.execute();
  },

  toggleOutput() {
    this.outputPanel.isVisible()
      ? this.outputPanel.hide()
      : this.outputPanel.show();
  },

  execute(filter) {
    if (atom.config.get('atom-phpunit.useVendor'))
      cmd = './vendor/bin/phpunit';
    else
      cmd = atom.config.get('atom-phpunit.phpunitPath');

    if (typeof filter !== 'undefined')
      cmd += ` --filter=${filter}`;

    console.log(`atom-phpunit: ${cmd}`);

    this.exec(cmd, {cwd: atom.project.getPaths()[0]}, (error, stdout, stderr) => {
      if (error && stderr) {
        this.errorView.update(stderr, false);
        this.outputPanel.show();
      } else if (error) {
        this.errorView.update(stdout, false);
        this.outputPanel.show();
        // atom.notifications.addError('Test Failed!', {description: cmd, detail: stdout, dismissable: atom.config.get('atom-phpunit.persistFailure')});
      } else {
        this.errorView.update(stdout, true);
        this.outputPanel.show();
        // atom.notifications.addSuccess('Test Passed!', {description: cmd, detail: stdout, dismissable: atom.config.get('atom-phpunit.persistSuccess')});
      }
    });
  },

  getFunctionName() {
    let editor = atom.workspace.getActiveTextEditor();
    if (!editor)
      return false;

    let pos = editor.getCursorBufferPosition();
    let buffer = editor.getBuffer();

    for (var row = pos.row; row--; row > 0) {
      let line = buffer.lineForRow(row);
      if (line.includes('function '))
        return line.match('function ([^\\(]+)\\(')[1];
    }

    return false
  },

  getClass() {
    let editor = atom.workspace.getActivePaneItem();
    if (!editor)
      return false;

    let buffer = editor.buffer;
    if (!buffer)
      return false;

    let file = buffer.file;
    let filename = file.getBaseName();
    return filename.match('(.+)\.php$')[1];
  }

};
