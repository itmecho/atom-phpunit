'use babel';

import 'atom';
import child_process from 'child_process';
import AtomPhpunitView from './atom-phpunit-view.js';

export default {

  config: {
    successAsNotifications: {
      order: 1,
      description: 'Show successful output as a notification instead of using the output panel',
      type: 'boolean',
      default: true
    },
    errorsAsNotifications: {
      order: 2,
      description: 'Show error output as a notification instead of using the output panel',
      type: 'boolean',
      default: false
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

    filepath = this.getFilepath();
    if (!filepath) {
      atom.notifications.addError('Failed to get filename! Make sure you are in the test file you want run.');
      return;
    }

    func = this.getFunctionName();
    if (!func) {
      atom.notifications.addError('Function name not found! Make sure your cursor is inside the test you want to run.');
      return;
    }

    this.execute(filepath, func);
  },

  runClass() {
    if (this.outputPanel.isVisible()) {
      this.errorView.update('No Output');
      this.outputPanel.hide();
    }
    filepath = this.getFilepath();
    if (!filepath) {
      atom.notifications.addError('Failed to get filename! Make sure you are in the test file you want run.');
      return;
    }

    this.execute(filepath);
  },

  runSuite() {
    if (this.outputPanel.isVisible()) {
      this.errorView.update('No Output');
      this.outputPanel.hide();
    }

    filepath = this.getFilepath();
    if (!filepath) {
      atom.notifications.addError('Failed to find phpunit! Make sure you are in the test file from the suit you want run.');
      return;
    }

    this.execute();
  },

  toggleOutput() {
    this.outputPanel.isVisible()
      ? this.outputPanel.hide()
      : this.outputPanel.show();
  },

  execute(filepath, functionName) {
    if (atom.config.get('atom-phpunit.useVendor'))
      cmd = './vendor/bin/phpunit';
    else
      cmd = atom.config.get('atom-phpunit.phpunitPath');

    if (typeof functionName !== 'undefined')
      cmd += ` --filter=${functionName}`;

    if (typeof filepath !== 'undefined')
      cmd += ` ${filepath}`;

    console.log(`atom-phpunit: ${cmd}`);

    this.exec(cmd, {cwd: this.getProjectFolderPath()}, (error, stdout, stderr) => {
      if (error && stderr) {
        this.errorView.update(stderr, false);
        this.outputPanel.show();
      } else if (error) {
        this.errorView.update(stdout, false);
        if (atom.config.get('atom-phpunit.errorsAsNotifications')) {
          atom.notifications.addError('Test Failed!', {description: cmd, detail: stdout});
        } else {
          this.outputPanel.show();
        }
      } else {
        this.errorView.update(stdout, true);
        if (atom.config.get('atom-phpunit.successAsNotifications')) {
          atom.notifications.addSuccess('Test Passed!', {description: cmd, detail: stdout});
        } else {
          this.outputPanel.show();
        }
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
      if (line.includes('function ')) {
        let parts = line.match(/function\s+([^\s(]+)\s*\(/);
        if (parts && parts.length > 1)
          return parts[1];
      }
    }

    return false
  },

  getFilepath() {
    let editor = atom.workspace.getActivePaneItem();
    if (!editor)
      return false;

    let buffer = editor.buffer;
    if (!buffer)
      return false;

    let file = buffer.file;

    if (!file.path) {
      return false;
    }

    return file.path;
  },

  getProjectFolderPath() {
    return atom.project.relativizePath(this.getFilepath())[0];
  }
  
};
