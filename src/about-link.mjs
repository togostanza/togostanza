export default class AboutLinkElement extends HTMLElement {
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

    const infoIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm6.5-.25A.75.75 0 017.25 7h1a.75.75 0 01.75.75v2.75h.25a.75.75 0 010 1.5h-2a.75.75 0 010-1.5h.25v-2h-.25a.75.75 0 01-.75-.75zM8 6a1 1 0 100-2 1 1 0 000 2z"></path></svg>`;

    this.anchor = document.createElement('a');

    this.anchor.innerHTML = infoIcon;
    this.anchor.title     = 'About this stanza';
    this.anchor.target    = '_blank';
    this.anchor.rel       = 'noopener noreferrer';

    this.shadowRoot.appendChild(this.anchor);
  }

  connectedCallback() {
    switch (this.getAttribute('placement') || 'bottom-right') {
      case 'top-left':
        this.style.top  = '0';
        this.style.left = '0';
        break;
      case 'top-right':
        this.style.top   = '0';
        this.style.right = '0';
        break;
      case 'bottom-right':
        this.style.bottom = '0';
        this.style.right  = '0';
        break;
      case 'bottom-left':
        this.style.bottom = '0';
        this.style.left   = '0';
        break;
      default:
        this.style.display = 'none';
    }

    this.anchor.href = this.getAttribute('href');
  }
}
