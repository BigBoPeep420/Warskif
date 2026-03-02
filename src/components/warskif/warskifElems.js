import { emmet } from "emmet-elem";
import "./styles/divider.css";

class WSDivider extends HTMLElement {
  #text;
  #subtext;
  #shadow;

  constructor() {
    super();
    this.#text = emmet(`p.text{Player 1}`);
    this.#subtext = emmet(`p.subtext{Click to continue}`);
    this.#shadow = this.attachShadow({ mode: "open" });
    this.#shadow.append(this.#text, this.#subtext);
    this._internals = this.attachInternals();

    this.addEventListener("click", (e) => {
      e.preventDefault();
      this._internals.states.delete("open");
    });
  }

  set text(string) {
    this.#text.textContent = string;
  }

  set subtext(string) {
    this.#subtext.textContent = string;
  }

  show(playerNum) {
    if (playerNum === 1)
      this.style.setProperty("background-color", "var(--clrPlayer1)");
    else this.style.setProperty("background-color", "var(--clrPlayer2)");
    this._internals.states.add("open");
  }
}
customElements.define("ws-divider", WSDivider);

export { WSDivider };
