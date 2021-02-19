import { info } from '@primer/octicons';

export default class AboutLinkElement extends HTMLElement {
  constructor() {
    super(...arguments);

    this.attachShadow({ mode: 'open' });

    const style = document.createElement('style');

    style.textContent = `
      :host {
        position: absolute;
        background-color: white;
        opacity: 0.5;
        transition: opacity 0.2s ease-in-out;
      }

      :host(:hover) {
        opacity: 0.8;
      }

      a {
        display: block;
        padding: 4px;
      }

      a svg {
        display: block;
      }
    `;

    this.shadowRoot.appendChild(style);

    this.anchor = document.createElement('a');

    this.anchor.innerHTML = info.toSVG({ width: 16 });
    this.anchor.title = 'About this stanza';
    this.anchor.target = '_blank';
    this.anchor.rel = 'noopener noreferrer';

    this.shadowRoot.appendChild(this.anchor);
  }

  connectedCallback() {
    switch (this.getAttribute('placement') || 'bottom-right') {
      case 'top-left':
        this.style.top = '0';
        this.style.left = '0';
        break;
      case 'top-right':
        this.style.top = '0';
        this.style.right = '0';
        break;
      case 'bottom-right':
        this.style.bottom = '0';
        this.style.right = '0';
        break;
      case 'bottom-left':
        this.style.bottom = '0';
        this.style.left = '0';
        break;
      default:
        this.style.display = 'none';
    }

    this.anchor.href = this.getAttribute('href');
  }
}

AboutLinkElement.customElementName = 'togostanza-about-link';
