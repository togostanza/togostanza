export default class DataSourceElement extends HTMLElement {
  attributeChangedCallback(key, oldVal, newVal) {
    if (key !== 'url') { return; }

    const receiver        = this.getAttribute('receiver');
    const targetAttribute = this.getAttribute('target-attribute');

    this.containerElement?.dataSourceUrlChanged(oldVal, newVal, receiver, targetAttribute);
  }
}

DataSourceElement.observedAttributes = ['url'];
DataSourceElement.customElementName = 'togostanza-data-source';
