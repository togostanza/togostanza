import { info } from '@primer/octicons';
import { LitElement, css, html } from 'lit-element';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';

export default class MenuElement extends LitElement {
  constructor() {
    super();
    this.placement = '';
  }

  static get properties() {
    return {
      placement: { type: String },
      href: { type: String },
    };
  }

  static get styles() {
    return css`
      :host {
        position: absolute;
        background-color: white;
        opacity: 0.5;
        transition: opacity 0.2s ease-in-out;

        width: 24px;
        height: 24px;
        border-radius: 12px;

        top: initial;
        right: 0;
        bottom: 0;
        left: initial;
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
        transform: translateY(0.5px);
      }

      :host([placement='top-left']) {
        top: 0;
        right: initial;
        bottom: initial;
        left: 0;
      }

      :host([placement='top-right']) {
        top: 0;
        right: 0;
        bottom: initial;
        left: initial;
      }

      :host([placement='bottom-left']) {
        top: initial;
        right: initial;
        bottom: 0;
        left: 0;
      }

      :host([placement='none']) {
        display: none;
      }
    `;
  }

  render() {
    return html`<a
      class="dropdown-item"
      href=${this.href}
      target="_blank"
      rel="noopener noreferrer"
    >
      ${unsafeSVG(info.toSVG({ width: 16 }))}
    </a>`;
  }
}

MenuElement.customElementName = 'togostanza--menu';
