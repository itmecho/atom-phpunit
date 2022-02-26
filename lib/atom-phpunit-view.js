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

    output.addEventListener("click", function(e) {
      if(e.target && e.target.nodeName == "A") {
        atom.open({pathsToOpen: [e.target.dataset.path]});
      }
    });

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

  update(data, cmd, success, pending = false) {
    this.setElementClass(pending ? 'pending' : (success ? 'success' : 'error'));

    this.element.children[0].innerHTML = this.getUpdatedHeader(data, cmd);
    this.element.children[1].children[0].innerHTML = this.getCleanOutput(data);
  }

  getUpdatedHeader(data, cmd) {
    let info = [], matches, header = 'PHPUnit Output';

    this.getRegexPatterns().forEach(pattern => {
      if (matches = data.match(pattern)) {
        info.push(`<span>${matches[1]}</span>`);
      }
    });

    if (info.length) {
      header = '';
      info[0] = `<strong>${info[0]}</strong>`;

      if (cmd = this.getParsedCommand(cmd)) {
        header += `<div>${cmd}</div>`;
      }

      header += info.join('<span class="divider"> | </span>');
    }

    return header;
  }

  getParsedCommand(cmd) {
    let info = [], matches;
    [/phpunit [\/\w- _=]+\/(\w+)(?:.php)?$/i, /--filter=([\w_]+)/i].forEach(pattern => {
      if (matches = cmd.match(pattern)) {
        info.push(matches[1]);
      }
    });

    return info.join('::');
  }

  getCleanOutput(input) {
    this.getRegexPatterns().forEach(pattern => {
      input = input.replace(pattern, '');
    });

    input = input.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
      return '&#'+i.charCodeAt(0)+';';
    });

    // turn file names & line numbers into links
    input = input
        .replace(/((([A-Z]\\:)?([\\/]+(\w|-|_|\.)+)+(\.(\w|-|_)+)+((:| on line )\d+)?))/g, '<a data-path="$1">$1</a>')
        .replace(/<a data-path="(.+) on line (\d+)">/g, '<a data-path="$1:$2">');

    return input.trim();
  }

  getRegexPatterns() {
    return [
      /\n+(?:Failures!\n)?(OK \([\d,\w ]+\)|Tests: \d+, Assertions: \d+, (?:Failures|Risky): \d+)\.?\n*/i,
      /(Time: [\d\. \w]+, Memory: [\d\. \w]+)\n*/i,
      /(PHPUnit [\d\. \w]+)\n+/i,
    ];
  }

  setElementClass(className) {
    this.element.classList.remove('pending', 'success', 'error');
    this.element.classList.add(className);
  }

}
