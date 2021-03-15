import { info } from "@primer/octicons";
import { LitElement, css, html } from "lit-element";
import { unsafeSVG } from "lit-html/directives/unsafe-svg";

export default class MenuElement extends LitElement {
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
    return html`<a
      href="${this.href}"
      title="About this stanza"
      target="_blank"
      rel="noopener noreferrer"
      >${unsafeSVG(info.toSVG({ width: 16 }))}</a
    >`;
  }
}

MenuElement.customElementName = "togostanza--menu";
