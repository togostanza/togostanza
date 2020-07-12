export default class MemoryStorage {
  constructor(data) {
    this.data = data;
  }

  getPath(k) {
    return this.data[k];
  }

  setPath(k, v) {
    this.data[k] = v;
    return v;
  }
}
