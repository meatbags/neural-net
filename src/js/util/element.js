/** Element */

const Element = prop => {
  if (prop instanceof HTMLElement) {
    return prop;
  }

  const e = document.createElement(prop.type || 'div');

  for (const key in prop) {
    const value = prop[key];
    switch (key) {
      case 'class':
        value.split(' ').forEach(c => e.classList.add(c));
        break;
      case 'eventListener':
      case 'addEventListener':
        for (const k in value)
          e.addEventListener(k, value[k]);
        break;
      case 'children':
      case 'childNodes':
        if (Array.isArray(value))
          value.forEach(child => e.appendChild(Element(child)));
        else
          e.appendChild(Element(value));
        break;
      case 'attribute':
        for (const k in value)
          e.setAttribute(k, value[k]);
        break;
      case 'dataset':
        for (const k in value)
          e.dataset[k] = value[k];
        break;
      case 'style':
        for (const k in value)
          e.style[k] = value[k];
      case 'type':
        break;
      default:
        e[key] = value;
    }
  }

  return e;
};

export default Element;
