import { info } from '@primer/octicons';
import { LitElement, css, html } from 'lit-element';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg.js';
import { createPopper } from '@popperjs/core';

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
        opacity: 0.8;

        width: 24px;
        height: 24px;
        border-radius: 12px;

        top: initial;
        right: 0;
        bottom: 0;
        left: initial;
      }

      #info-button {
        display: block;
        padding: 4px;
      }

      #info-button svg {
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

      .menu {
        min-width: 6rem;
        padding: 0.5rem 0;
        color: #212529;
        background-color: #fff;
        background-clip: padding-box;
        list-style: none;
        border: 1px solid rgba(0, 0, 0, 0.15);
        border-radius: 0.25rem;
        display: none;
      }

      .menu[data-show] {
        display: block;
      }

      .menu-item {
        display: block;
        padding: 0.25rem 1rem;
        font-size: 12px;
        font-weight: 400;
        color: #212529;
        text-decoration: none;
        white-space: nowrap;
        background-color: transparent;
        border: 0;
      }

      .menu-item:focus,
      .menu-item:hover {
        color: #1e2125;
        background-color: #e9ecef;
      }

      .menu .divider {
        height: 1px;
        margin: 4px 1px;
        background-color: #e5e5e5;
        border-bottom: 1px solid #ffffff;
      }
    `;
  }

  _hideMenu() {
    const menu = this.shadowRoot.querySelector('.menu');
    menu.removeAttribute('data-show');
  }

  firstUpdated() {
    const infoButton = this.shadowRoot.querySelector('#info-button');
    const menu = this.shadowRoot.querySelector('.menu');

    const popperInstance = createPopper(infoButton, menu, {
      placement: this._menuPlacement(),
    });

    infoButton.addEventListener('click', () => {
      if (menu.getAttribute('data-show') === null) {
        this.requestUpdate(); // update menu contents
        menu.setAttribute('data-show', '');
        popperInstance.update();
      } else {
        menu.removeAttribute('data-show');
      }
    });
  }

  _menuPlacement() {
    switch (this.placement) {
      case 'top-left':
        return 'bottom-start';
      case 'top-right':
        return 'bottom-end';
      case 'bottom-left':
        return 'top-start';
      case 'bottom-right':
        return 'top-end';
      case 'none':
      default:
        return 'top-end';
    }
  }

  _handlerForMenuItem(menuItem) {
    return () => {
      this._hideMenu();
      menuItem.handler();
    };
  }

  async _copyHTMLSnippetToClipboard() {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = this.stanzaInstance.url;
    script.async = true;
    const html = [script.outerHTML, this.stanzaInstance.element.outerHTML].join(
      ' '
    );

    await navigator.clipboard.writeText(html);

    this._hideMenu();
  }

  _renderMenuItem(item) {
    switch (item.type) {
      case 'item':
        return html`<li>
          <a
            class="menu-item"
            href="#"
            @click="${this._handlerForMenuItem(item)}"
            >${item.label}</a
          >
        </li>`;

      case 'divider':
        return html`<li class="divider"></li>`;

      default:
        throw new Error(`unknown menu item type specified: ${item.type}`);
    }
  }

  render() {
    const menuDefinition = this.menuDefinition();
    return html`<div id="info-button">
        ${unsafeSVG(info.toSVG({ width: 16 }))}
      </div>
      <ul class="menu">
        ${menuDefinition.map((item) => this._renderMenuItem(item))}
        ${menuDefinition.length > 0 ? html`<li class="divider"></li>` : ''}
        <li>
          <a
            class="menu-item"
            href="#"
            @click="${this._copyHTMLSnippetToClipboard}"
            >Copy HTML snippet to clipboard</a
          >
        </li>
        <li>
          <a
            class="menu-item"
            href=${this.href}
            @click="${this._hideMenu}"
            target="_blank"
            rel="noopener noreferrer"
          >
            About this stanza</a
          >
        </li>
      </ul>`;
  }
}

MenuElement.customElementName = 'togostanza--menu';
