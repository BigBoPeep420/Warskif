import { Player } from "../../modules/warskif/game.js";
import { emmet } from "emmet-elem";
import { stringToElement } from "@/modules/utils/domParse.js";
import "./warskif.css";
import iconSettings from "@/assets/icons/cog.svg";
import iconcarrier from "@/assets/skifs/carrier.svg";
import icondestroyer from "@/assets/skifs/destroyer.svg";
import iconfrigate from "@/assets/skifs/frigate.svg";
import iconskif from "@/assets/skifs/skif.svg";
import iconsubmarine from "@/assets/skifs/submarine.svg";

class Warskif {
  #boardSize = 10;
  #player1;
  #player2;
  #gameBoard;
  #container;
  #divider;
  #skifDock;
  #msgBarP;
  #settingsDrwr;
  #lastHoveredCell = null;
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
    this.#container = emmet(`div#warskif`);
    this.#divider = emmet(`div#divider`);

    // Add Msg Bar and Settings Btn
    const msgBar = emmet(`div#msgBar`);
    this.#msgBarP = emmet(`p#msgBarP`);
    const settingsBtn = emmet(`button#settingsBtn[type="button"]`);
    settingsBtn.appendChild(stringToElement(iconSettings, "svg"));
    msgBar.append(this.#msgBarP, settingsBtn);

    // Add Settings Drawer
    this.#settingsDrwr = emmet(`div#settingsDrwr`);

    // Add Skif Dock
    this.#skifDock = emmet(`div#skifDock`);
    this.#skifDock.appendChild(
      emmet(`p.instruction{Drag Skif to Board}>p.hint{Click Skif to Rotate}`),
    );
    this.#skifDock.addEventListener("dragover", (e) => {
      const el = this.#container.querySelector(".dragged");
      if (el) {
        e.preventDefault();
      }
    });
    this.#skifDock.addEventListener("drop", (e) => {
      const el = this.#container.querySelector(".dragged");
      if (el) this.#skifDock.appendChild(el);
    });

    //Add Skif Icons
    for (let skif in this.#skifIcons) {
      const iconCont = emmet(
        `div.skifIcon[data-type="${skif}" data-length="${this.#skifIcons[skif].length}" data-orient="0" draggable="true"]`,
      );
      const icon = stringToElement(this.#skifIcons[skif].icon, "svg");
      icon.setAttribute("draggable", "false");
      iconCont.appendChild(icon);
      this.#skifDock.appendChild(iconCont);

      iconCont.addEventListener("dragstart", (e) => {
        // Set Drag Image
        const origRect = iconCont.getBoundingClientRect();
        const dragIcon = iconCont.cloneNode(true);
        dragIcon.style.transform = `translateX(-100%)`;
        dragIcon.style.position = "absolute";
        dragIcon.style.width = `${origRect.width}px`;
        dragIcon.style.height = `${origRect.height}px`;
        this.#container.appendChild(dragIcon);
        e.dataTransfer.setDragImage(
          dragIcon,
          origRect.width / 2,
          origRect.height / 2,
        );
        setTimeout(() => {
          this.#container.removeChild(dragIcon);
        }, 0);

        iconCont.classList.add("dragged");
      });
      iconCont.addEventListener("dragend", (e) => {
        iconCont.classList.remove("dragged");
      });
    }

    // Add Game Board
    this.#gameBoard = emmet(`div#gameBoard`);
    this.#gameBoard.style.setProperty("--boardSize", this.#boardSize);
    for (let y = 0; y < this.#boardSize; y++) {
      for (let x = 0; x < this.#boardSize; x++) {
        this.#gameBoard.appendChild(
          emmet(`div.boardCell[data-x="${x}" data-y="${y}"]`),
        );
      }
    }
    this.#gameBoard.addEventListener("dragover", (e) => {
      const el = this.#container.querySelector(".dragged");
      const cell = e.target.closest(".boardCell");
      if (el && cell) {
        e.preventDefault();
      }
    });
    this.#gameBoard.addEventListener("drop", (e) => {
      const el = this.#container.querySelector(".dragged");
    });

    // Add everything to container
    this.#container.append(
      msgBar,
      this.#gameBoard,
      this.#divider,
      this.#skifDock,
      this.#settingsDrwr,
    );

    // Add Event Listeners
    this.#gameBoard.addEventListener("dragover", (e) => {});
    // const skifDrag = new Droppable([this.#gameBoard, this.#skifDock], {
    //   dropzone: `#gameBoard, #skifDock`,
    //   draggable: `.skifIcon`,
    // });
    // skifDrag.on("drag:over", (e) => {
    //   if (e.overContainer.classList.contains("boardCell")) {
    //     const cellX = parseInt(e.overContainer.dataset.x);
    //     const cellY = parseInt(e.overContainer.dataset.y);
    //     const skifLength = parseInt(e.source.dataset.length);
    //     const skifOrient = parseInt(e.source.dataset.orient);
    //     const tailX = skifOrient == 0 ? cellX + skifLength - 1 : cellX;
    //     const tailY = skifOrient == 0 ? cellY : cellY + skifLength - 1;
    //     if (
    //       tailX > this.#boardSize - 1 ||
    //       tailY > this.#boardSize - 1 ||
    //       tailX < 0 ||
    //       tailY < 0
    //     ) {
    //       console.log("outside");
    //       console.log(e);
    //       e.cancel();
    //     }
    //   }
    // });
    // skifDrag.on("mirror:move", (e) => {
    //   console.log(e);
    // });
    // skifDrag.on("drag:move", (e) => {
    //   if (
    //     e.sensorEvent.target &&
    //     e.sensorEvent.target.classList.contains("boardCell")
    //   ) {
    //     const cellX = parseInt(e.sensorEvent.target.dataset.x);
    //     const cellY = parseInt(e.sensorEvent.target.dataset.y);
    //     const skifLength = parseInt(e.source.dataset.length);
    //     const skifOrient = parseInt(e.source.dataset.orient);
    //     const tailX = skifOrient == 0 ? cellX + skifLength - 1 : cellX;
    //     const tailY = skifOrient == 0 ? cellY : cellY + skifLength - 1;
    //     if (
    //       tailX > this.#boardSize - 1 ||
    //       tailY > this.#boardSize - 1 ||
    //       tailX < 0 ||
    //       tailY < 0
    //     )
    //       e.cancel();
    //     else {
    //       e.source.style.setProperty("--colStart", cellX + 1);
    //       e.source.style.setProperty("--colEnd", tailX + 2);
    //       e.source.style.setProperty("--rowStart", cellY + 1);
    //       e.source.style.setProperty("--rowEnd", tailY + 2);
    //       e.source.toggleAttribute("placed");
    //       e.originalSource.style.setProperty("--colStart", cellX + 1);
    //       e.originalSource.style.setProperty("--colEnd", tailX + 2);
    //       e.originalSource.style.setProperty("--rowStart", cellY + 1);
    //       e.originalSource.style.setProperty("--rowEnd", tailY + 2);
    //       e.originalSource.toggleAttribute("placed");
    //       this.#lastHoveredCell = e.sensorEvent.target;
    //     }
    //   }
    // });
    // skifDrag.on("droppable:stop", (e) => {
    //   if (e.dropzone.id === "gameBoard") {
    //     const cellX = parseInt(this.#lastHoveredCell.dataset.x);
    //     const cellY = parseInt(this.#lastHoveredCell.dataset.y);
    //     const skifLength = parseInt(e.dragEvent.source.dataset.length);
    //     const skifOrient = parseInt(e.dragEvent.source.dataset.orient);
    //     const tailX = skifOrient == 0 ? cellX + skifLength - 1 : cellX;
    //     const tailY = skifOrient == 0 ? cellY : cellY + skifLength - 1;
    //     e.dragEvent.source.style.setProperty("--colStart", cellX + 1);
    //     e.dragEvent.source.style.setProperty("--colEnd", tailX + 2);
    //     e.dragEvent.source.style.setProperty("--rowStart", cellY + 1);
    //     e.dragEvent.source.style.setProperty("--rowEnd", tailY + 2);
    //     e.dragEvent.source.toggleAttribute("placed");
    //   }
    // });

    return this.#container;
  }
}

export { Warskif };
