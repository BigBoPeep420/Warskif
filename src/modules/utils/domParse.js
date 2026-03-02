/**
 * Takes a raw string of element tags/data such as '&lt;p class="hi"&gt;Hi&lt;/p&gt;' along with a string
 * to indicate what kind of element it is and returns a DOM-ready element.
 * @param {string} string String to parse into DOM element
 * @param {string} elementType String indicating element type. Possible values 'html', 'xml', 'xhtml', 'svg'.
 * @returns {HTMLElement} DOM-ready element
 */
function stringToElement(string, elementType) {
  let type;
  switch (elementType) {
    case "xml":
      type = "application/xml";
      break;
    case "xhtml":
      type = "application/xhtml+xml";
      break;
    case "svg":
      type = "image/svg+xml";
      break;
    default:
      type = "text/html";
      break;
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(string, type);
  const element = doc.documentElement;

  if (elementType == "svg") {
    element.removeAttribute("width");
    element.removeAttribute("height");
    element.removeAttribute("fill");
  }

  return element;
}

export { stringToElement };
