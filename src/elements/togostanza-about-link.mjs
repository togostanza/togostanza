import { info } from '@primer/octicons';

export default class AboutLinkElement extends HTMLElement {
  static observedAttributes = ['placement'];

  constructor() {
    super(...arguments);

    this.attachShadow({mode: 'open'});

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

    this.anchor.innerHTML = info.toSVG({width: 16});
    this.anchor.title     = 'About this stanza';
    this.anchor.target    = '_blank';
    this.anchor.rel       = 'noopener noreferrer';

    this.shadowRoot.appendChild(this.anchor);
  }

  connectedCallback() {
    this.anchor.href = this.getAttribute('href');

    this.setPlacement(this.getAttribute('placement'));
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'placement') {
      this.setPlacement(newValue);
    }
  }

  setPlacement(placement) {
    switch (placement || 'bottom-right') {
      case 'top-left':
        Object.assign(this.style, {
          display: 'initial',
          top:     '0',
          right:   null,
          bottom:  null,
          left:    '0',
        });

        break;
      case 'top-right':
        Object.assign(this.style, {
          display: 'initial',
          top:     '0',
          right:   '0',
          bottom:  null,
          left:    null,
        });

        break;
      case 'bottom-right':
        Object.assign(this.style, {
          display: 'initial',
          top:     null,
          right:   '0',
          bottom:  '0',
          left:    null,
        });

        break;
      case 'bottom-left':
        Object.assign(this.style, {
          display: 'initial',
          top:     null,
          right:   null,
          bottom:  '0',
          left:    '0',
        });

        break;
      case 'none':
        Object.assign(this.style, {
          display: 'none',
          top:     null,
          right:   null,
          bottom:  null,
          left:    null,
        });

        break;
      default:
        throw new Error(`illegal placement: ${placement}`);
    }
  }
}

AboutLinkElement.customElementName = 'togostanza-about-link';
