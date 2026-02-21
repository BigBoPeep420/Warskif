function stringToElement(string, elementType) {
  let type;
  switch (elementType) {
    case "html":
      type = "text/html";
      break;
    case "xml":
      type = "application/xml";
      break;
    case "xhtml":
      type = "application/xhtml+xml";
      break;
    case "svg":
      type = "image/svg+xml";
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
