import { Player } from "../../modules/warskif/game.js";
import { emmet } from "emmet-elem";
import { stringToElement } from "../../modules/utils/domParse.js";
import { WSDivider } from "./warskifElems.js";
import "./styles/warskif.css";
import iconSettings from "@/assets/icons/cog.svg";
import iconcarrier from "@/assets/skifs/carrier.svg";
import icondestroyer from "@/assets/skifs/destroyer.svg";
import iconfrigate from "@/assets/skifs/frigate.svg";
import iconskif from "@/assets/skifs/skif.svg";
import iconsubmarine from "@/assets/skifs/submarine.svg";
import iconCollapse from "@/assets/icons/arrow-collapse-horizontal.svg";
import iconClose from "@/assets/icons/close-octagon.svg";
import iconPlay from "@/assets/icons/play-circle.svg";
import imgShotHit from "@/assets/images/shotHit.webp";
import imgShotMiss from "@/assets/images/shotMiss.webp";
import imgWave from "@/assets/images/wave1.webp";

class Warskif {
  #boardSize = 10;
  #player1;
  #player2;
  #currentTurn;
  #gameBoard;
  #container;
  #divider;
  #skifDock;
  #msgBarP;
  #settingsDrwr;
  #rounds = 0;
  #skifIcons = {
    submarine: {
      icon: iconsubmarine,
      length: 2,
    },
    skif: {
      icon: iconskif,
      length: 3,
    },
    frigate: {
      icon: iconfrigate,
      length: 4,
    },
    carrier: {
      icon: iconcarrier,
      length: 5,
    },
    destroyer: {
      icon: icondestroyer,
      length: 6,
    },
  };

  constructor() {
    this.#player1 = new Player(1, this.#boardSize);
    this.#player2 = new Player(0, this.#boardSize);
    this.#currentTurn = this.#player1;
    this.#container = emmet(`div#warskif`);

    this.#container.append(
      this.#createMsgBar(),
      this.#createGameBoard(),
      this.#createSettingsDrwr(),
      this.#createSkifDock(),
    );

    this.#container.addEventListener("dragstart", (e) => {
      if (e.target instanceof HTMLElement) {
        let targ = e.target.closest(".skifIcon");
        if (targ) {
          const boardRect = this.#gameBoard.getBoundingClientRect();
          const height = boardRect.height / this.#boardSize;
          const width =
            (boardRect.width / this.#boardSize) * parseInt(targ.dataset.length);
          e.dataTransfer.setDragImage(new Image(), 0, 0);
          const placeholder = emmet(
            `div#skifPlaceholder[dragged="${targ.id}"]`,
          );
          placeholder.append(
            stringToElement(this.#skifIcons[targ.dataset.type].icon, "svg"),
          );
          placeholder.style.position = "fixed";
          placeholder.style.pointerEvents = "none";
          placeholder.style.height = `${height}px`;
          placeholder.style.width = `${width}px`;
          placeholder.style.left = `${e.clientX - width / 2}px`;
          placeholder.style.top = `${e.clientY - height / 2}px`;
          this.#container.appendChild(placeholder);
          e.dataTransfer.setData("text/plain", e.target.id);
          setTimeout(() => {
            e.target.style.setProperty("display", "none");
          }, 0);
        }
      }
    });

    this.#container.addEventListener("dragover", (e) => {
      const placeholder = document.getElementById("skifPlaceholder");
      if (placeholder) {
        const phRect = placeholder.getBoundingClientRect();
        let targ = e.target.closest(".boardCell");
        if (targ) {
          const dragged = document.getElementById(
            placeholder.getAttribute("dragged"),
          );
          const placeable = this.#verifyPlacement(targ, dragged);
          if (placeable) {
            placeholder.style.setProperty("--colStart", placeable[0] + 1);
            placeholder.style.setProperty("--colEnd", placeable[2] + 2);
            placeholder.style.setProperty("--rowStart", placeable[1] + 1);
            placeholder.style.setProperty("--rowEnd", placeable[3] + 2);
            placeholder.style.setProperty("top", 0);
            placeholder.style.setProperty("left", 0);
            placeholder.style.setProperty("position", "absolute");
            this.#gameBoard.appendChild(placeholder);
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            return;
          }
        }

        targ = e.target.closest("#dockToggle");
        if (targ) {
          this.#skifDock.classList.add("open");
        }

        placeholder.style.setProperty("position", "fixed");
        placeholder.style.setProperty(
          "left",
          `${e.clientX - phRect.width / 2}px`,
        );
        placeholder.style.setProperty(
          "top",
          `${e.clientY - phRect.height / 2}px`,
        );
        this.#container.appendChild(placeholder);
      }
    });

    this.#container.addEventListener("drop", (e) => {
      e.preventDefault();
      const dragged = document.getElementById(e.dataTransfer.getData("text"));
      const placeable = this.#verifyPlacement(e.target, dragged);
      if (placeable) {
        if (
          this.#currentTurn.board.placeSkif(
            [placeable[0], placeable[1]],
            parseInt(dragged.dataset.orient),
            {
              type: dragged.dataset.type,
              length: dragged.dataset.length,
            },
          )
        ) {
          dragged.style.setProperty("display", "block");
          dragged.style.setProperty("--colStart", placeable[0] + 1);
          dragged.style.setProperty("--colEnd", placeable[2] + 2);
          dragged.style.setProperty("--rowStart", placeable[1] + 1);
          dragged.style.setProperty("--rowEnd", placeable[3] + 2);
          this.#gameBoard.appendChild(dragged);
        } else {
          dragged.style.setProperty("display", "block");
        }
      }
    });

    this.#container.addEventListener("dragend", (e) => {
      const ph = document.getElementById("skifPlaceholder");
      if (ph) {
        if (e.dataTransfer.dropEffect !== "move") {
          document
            .getElementById(ph.getAttribute("dragged"))
            .style.setProperty("display", "block");
        }
        ph.remove();
      }
    });

    this.#container.addEventListener("click", (e) => {
      let targ = e.target.closest("#dockToggle");
      if (targ) {
        this.#skifDock.classList.toggle("open");
        e.preventDefault();
        return;
      }

      targ = e.target.closest(".skifIcon");
      if (targ) {
        targ.dataset.orient = targ.dataset.orient == 0 ? 1 : 0;
      }
    });

    return this.#container;
  }

  #createMsgBar() {
    const elem = emmet("div#msgBar");
    this.#msgBarP = emmet("p#msgBarP");
    const settingsBtn = emmet('button#settingsBtn[type="button"]');
    settingsBtn.addEventListener("click", (e) => {
      this.#settingsDrwr.classList.add("open");
      e.preventDefault();
    });
    settingsBtn.appendChild(stringToElement(iconSettings, "svg"));
    elem.append(this.#msgBarP, settingsBtn);
    return elem;
  }

  #createSettingsDrwr() {
    this.#settingsDrwr = emmet(`div#settingsDrwr>p.title{New Game}`);

    const closeBtn = emmet(`button.close[type="button"]`);
    closeBtn.appendChild(stringToElement(iconClose, "svg"));

    const form = emmet("form");
    const brdSize = emmet(
      `section.boardSizeSect>label[for="boardSize" tooltip-text="Change the difficulty. Must be 6-20. Default is 10."]{Board Size}`,
    );
    const brdSizeInp = emmet(
      `input#boardSize[type="text" placeholder="#" value="10" pattern="^([6-9]|1[0-9]|20)$" maxlength="2" size="2" required]`,
    );
    brdSize.appendChild(brdSizeInp);

    const plyr1 = emmet(
      `fieldset>legend{Player 1}+label[for="p1AI"]{AI}>input#p1AI[type="radio" name="player1" value="ai"]` +
        `+span.customRadio^label[for="p1Hum"]{Human}>input#p1Hum[type="radio" name="player1" value="human" checked]` +
        `+span.customRadio`,
    );
    const plyr2 = emmet(
      `fieldset>legend{Player 2}+label[for="p2AI"]{AI}>input#p2AI[type="radio" name="player2" value="ai" checked]` +
        `+span.customRadio^label[for="p2Hum"]{Human}>input#p2Hum[type="radio" name="player2" value="human"]` +
        `+span.customRadio`,
    );

    const play = emmet(`button.play[type="button"]`);
    play.appendChild(stringToElement(iconPlay, "svg"));

    form.append(brdSize, plyr1, plyr2, play);

    this.#settingsDrwr.append(closeBtn, form);

    //Listeners
    closeBtn.addEventListener("click", (e) => {
      this.#settingsDrwr.classList.remove("open");
      form.reset();
      e.preventDefault();
    });
    play.addEventListener("click", (e) => {
      e.preventDefault();
      if (checkInputs()) {
        this.#rounds = 0;
        this.#currentTurn = this.#player1;
        this.#settingsDrwr.classList.remove("open");
        // Start Game
        this.#divider.show(1);
      }
    });
    brdSizeInp.addEventListener("input", (e) => {
      e.preventDefault();
      checkInputs();
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      checkInputs();
    });

    return this.#settingsDrwr;

    function checkInputs() {
      if (brdSizeInp.validity.patternMismatch) {
        brdSizeInp.setCustomValidity("Must be a number from 6 to 20.");
        return false;
      } else brdSizeInp.setCustomValidity("");
      if (!form.checkValidity()) {
        brdSizeInp.setCustomValidity("Please check all input values.");
        return false;
      } else brdSizeInp.setCustomValidity("");
      return true;
    }
  }

  #createSkifDock() {
    this.#skifDock = emmet(`div#skifDock`);
    this.#skifDock.appendChild(
      emmet(`p.instruction{Drag Skif to Board}>p.hint{Click Skif to Rotate}`),
    );
    const dockToggleBtn = emmet(`button#dockToggle[type="button"]`);
    dockToggleBtn.appendChild(stringToElement(iconCollapse, "svg"));
    this.#skifDock.appendChild(dockToggleBtn);

    //Add Skif Icons
    for (let skif in this.#skifIcons) {
      const iconCont = emmet(
        `div#skif${skif}.skifIcon[data-type="${skif}" data-length="${this.#skifIcons[skif].length}" data-orient="0" draggable="true"]`,
      );
      const icon = stringToElement(this.#skifIcons[skif].icon, "svg");
      icon.setAttribute("draggable", "false");
      iconCont.appendChild(icon);
      this.#skifDock.appendChild(iconCont);
    }

    return this.#skifDock;
  }

  #createGameBoard() {
    this.#gameBoard = emmet(`div#gameBoard`);
    this.#gameBoard.style.setProperty("--boardSize", this.#boardSize);
    this.#divider = new WSDivider();
    this.#gameBoard.append(emmet("div#waves"), this.#divider);

    for (let y = 0; y < this.#boardSize; y++) {
      for (let x = 0; x < this.#boardSize; x++) {
        this.#gameBoard.appendChild(
          emmet(`div#cell-${x}-${y}.boardCell[data-x="${x}" data-y="${y}"]`),
        );
      }
    }

    this.#gameBoard.addEventListener("dragenter", (e) => {
      this.#skifDock.classList.remove("open");
      e.preventDefault();
    });

    return this.#gameBoard;
  }

  #verifyPlacement(cell, skif) {
    const coords = [parseInt(cell.dataset.x), parseInt(cell.dataset.y)];
    const length = parseInt(skif.dataset.length);
    const orient = parseInt(skif.dataset.orient);
    const tail = [
      orient === 0 ? coords[0] + length - 1 : coords[0],
      orient === 0 ? coords[1] : coords[1] + length - 1,
    ];
    if (
      tail[0] < this.#boardSize &&
      tail[1] < this.#boardSize &&
      tail[0] >= 0 &&
      tail[1] >= 0
    )
      return [...coords, ...tail];
    else return false;
  }

  #switchBoard(player) {
    const board = player.board.data;
    board.forEach((col, x) => {
      col.forEach((cell, y) => {
        const domCell = document.getElementById(`cell-${x}-${y}`);
        if (cell === 1) {
          domCell.replaceChildren(
            emmet(`img.shotResult[src="${imgShotMiss}"]`),
          );
        } else if (cell === 2) {
          domCell.replaceChildren(emmet(`img.shotResult[src="${imgShotHit}"]`));
        }
      });
    });
  }
}

export { Warskif };
