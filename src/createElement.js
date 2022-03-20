export function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child =>
        typeof child === "object" ? child : createTextElement(child)
      ),
    }
  }
}

export const TEXT_TYPE = "TEXT_ELEMENT";

function createTextElement(text) {
  return {
    type: TEXT_TYPE,
    props: {
      nodeValue: text,
      children: [],
    }
  }
}