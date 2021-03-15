import * as octicons from "@primer/octicons";
import { LitElement, css, html } from "lit-element";
import { unsafeSVG } from "lit-html/directives/unsafe-svg";
import Dropdown from "bootstrap/js/dist/dropdown";

export default class MenuElement extends LitElement {
  constructor() {
    super();
    this.dropdownOpen = false;
    this.dropdown = null;
    this.menuItems = [];
  }

  static get properties() {
    return {
      placement: { type: String },
      href: { type: String },
      dropdownOpen: { type: Boolean, attribute: false },
      menuItems: { type: Array, attribute: false },
    };
  }

  static get styles() {
    return css`
      :host {
        position: absolute;
        background-color: white;
        opacity: 0.5;
        transition: opacity 0.2s ease-in-out;

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
      }

      :host([placement="top-left"]) {
        top: 0;
        right: initial;
        bottom: initial;
        left: 0;
      }

      :host([placement="top-right"]) {
        top: 0;
        right: 0;
        bottom: initial;
        left: initial;
      }

      :host([placement="bottom-left"]) {
        top: initial;
        right: initial;
        bottom: 0;
        left: 0;
      }

      :host([placement="none"]) {
        display: none;
      }
    `;
  }

  item(label, handler) {
    this.menuItems.push({ type: "item", label, handler });
  }

  render() {
    function handleClick() {
      if (this.dropdownOpen) {
        this.dropdown?.hide();
      }
    }

    // TODO stop using CDN
    return html`<link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/css/bootstrap.min.css"
        rel="stylesheet"
        integrity="sha384-BmbxuPwQa2lc/FVzBcNJ7UAyJxM6wuqIj61tLrc4wSX0szH/Ev+nYRRuWlolflfl"
        crossorigin="anonymous"
      />

      <div class="dropdown" @click=${handleClick}>
        <a aria-expanded="false" class="kebab-icon">
          ${unsafeSVG(octicons["kebab-horizontal"].toSVG({ width: 16 }))}
        </a>
        <ul class="dropdown-menu">
          ${this.menuItems.map((item) => {
            switch (item.type) {
              case "item":
                return html`<li>
                  <a class="dropdown-item" @click=${item.handler}
                    >${item.label}</a
                  >
                </li>`;
              case "divider":
                return html`<li><hr class="dropdown-divider" /></li>`;
            }
          })}
          ${this.menuItems.length > 0
            ? html`<li>
                <hr class="dropdown-divider" />
              </li>`
            : ""}
          <li>
            <a
              class="dropdown-item"
              href=${this.href}
              target="_blank"
              rel="noopener noreferrer"
              >About this stanza</a
            >
          </li>
        </ul>
      </div>`;
  }

  firstUpdated() {
    this.dropdown = new Dropdown(this.shadowRoot.querySelector(".kebab-icon"));
    const dd = this.shadowRoot.querySelector(".dropdown");
    dd.addEventListener("shown.bs.dropdown", (e) => {
      this.dropdownOpen = true;
    });
    dd.addEventListener("hidden.bs.dropdown", (e) => {
      this.dropdownOpen = false;
    });
  }
}

MenuElement.customElementName = "togostanza--menu";
