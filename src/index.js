import { emmet } from "emmet-elem";
import "@/styles/main.css";
import "@/styles/layout.css";

const content = emmet(`div#content`);
const header = emmet(`header>h1#siteTitle{Warskif}`);
const footer = emmet(`footer>p#siteCopyright{Copyright © 2026 Lane Robey}`);

document.body.append(header, content, footer);
navigate("home");

function navigate(url) {
  if (url.match(/[.]/)) {
    window.open(url, "_blank", "noreferrer");
  } else {
    try {
      import(`@/views/${url}.js`).then((res) => {
        content.replaceChildren(res.default(navigate));
      });
    } catch (error) {
      console.error(error);
      try {
        import(`@/views/home.js`).then((res) => {
          content.replaceChildren(res.default(navigate));
        });
      } catch (error) {
        console.log(error);
        content.replaceChildren(
          emmet(
            `div.navError>h1{Uh oh. We call that a 'super error'. Looks like a big one. Better run.}`,
          ),
        );
      }
    }
  }
}
