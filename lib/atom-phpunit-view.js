'use babel';

export default class AtomPhpunitView {

  panel: null
  title: ''
  output: ''

  constructor() {
    this.element = document.createElement('div');
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

  update() {
    this.element = document.createElement('div');
    this.element.classList.add('atom-phpunit');

    let title = document.createElement('header');
    title.textContent = `Test: ${this.title}`;
    title.classList.add('title');
    this.element.appendChild(title);

    // Create message element
    const output = document.createElement('pre');
    output.textContent = this.output;
    output.classList.add('output');
    this.element.appendChild(output);
  }

  set(title, output) {
    this.title = title;
    this.output = output;
    this.update();
  }

  show() {
    this.panel.show();
  }

  hide() {
    this.panel.hide();
  }

}
