import { info } from "@primer/octicons";
import { LitElement, css, html } from "lit-element";
import { unsafeSVG } from "lit-html/directives/unsafe-svg";
import Dropdown from "bootstrap/js/dist/dropdown";

export default class MenuElement extends LitElement {
  dropdown = null;
  dropdownOpen = false;

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

        bottom: 0;
        right: 0;
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
        left: 0;
      }

      :host([placement="top-right"]) {
        top: 0;
        right: 0;
      }

      :host([placement="bottom-left"]) {
        bottom: 0;
        left: 0;
      }

      :host([placement="none"]) {
        display: none;
      }
    `;
  }

  render() {
    function handleClick(e) {
      console.log(e);
      // this.dropdown?.hide();
    }

    function handleToggle(e) {
      console.log(e);
      if (this.dropdownOpen) {
        this.dropdown?.hide();
      } else {
        this.dropdown?.show();
      }
      this.dropdownOpen = !this.dropdownOpen;
    }

    return html`<link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css"
        rel="stylesheet"
        integrity="sha384-giJF6kkoqNQ00vy+HMDP7azOuL0xtbfIcaT9wjKHr8RbDVddVHyTfAAsrekwKmP1"
        crossorigin="anonymous"
      />

      <div class="dropdown">
        <button
          id="dLabel"
          type="button"
          aria-expanded="false"
          class="btn btn-default dropdown-toggle"
          @click=${handleToggle}
        >
          Dropdown trigger
        </button>
        <ul class="dropdown-menu" @click=${handleClick}>
          <li>
            <a class="dropdown-item">Another action</a>
          </li>
          <li><a class="dropdown-item" href="#">Something else here</a></li>
          <li><hr class="dropdown-divider" /></li>
          <li>
            <a class="dropdown-item" href=${this.href}>About this stanza</a>
          </li>
        </ul>
      </div>`;
  }

  firstUpdated() {
    // console.log(this.shadowRoot.querySelector(".dropdown-menu"));
    this.dropdown = new Dropdown(
      this.shadowRoot.querySelector(".dropdown-toggle")
    );

    const d = this.shadowRoot.querySelector(".dropdown");
    d.addEventListener("show.bs.dropdown", () => {
      console.log("show");
    });
    d.addEventListener("shown.bs.dropdown", () => {
      console.log("shown");
    });
    d.addEventListener("hide.bs.dropdown", () => {
      console.log("hide");
    });
    d.addEventListener("hidden.bs.dropdown", () => {
      console.log("hidden");
    });
  }
}

MenuElement.customElementName = "togostanza--menu";
