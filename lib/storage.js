'use babel';

export default class Storage {
  constructor() {
    this.internal = window.localStorage
  }

  get(key) {
    return JSON.parse(this.internal.getItem(this.key(key)))
  }

  put(key, value) {
    this.internal.setItem(this.key(key), JSON.stringify(value))
  }

  key(key) {
    return `atom-phpunit:${key}`
  }
}
