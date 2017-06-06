'use babel';

import 'atom';

export default class AtomPhpunitView {

  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('atom-phpunit');

    const header = document.createElement('header');
    header.textContent = 'PHPUnit Output';
    header.classList.add('header');
    this.element.appendChild(header);

    // Create message element
    const message = document.createElement('div');
    message.classList.add('message');

    const output = document.createElement('pre');
    output.textContent = 'No Output';
    output.classList.add('output');
    output.style.fontSize = atom.config.get('atom-phpunit.outputViewFontSize');

    atom.config.observe('atom-phpunit.outputViewFontSize', (newValue) => {
      output.style.fontSize = newValue;
    })

    message.appendChild(output);
    this.element.appendChild(message);
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

  update(data, success) {
    success
      ? this.element.classList.remove('error')
      : this.element.classList.add('error');

    this.element.children[1].children[0].textContent = data;
  }

}
