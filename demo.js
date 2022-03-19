import { createElement } from './src/createElement';

const Beact = {
  createElement
}

const element = Beact.createElement(
  'div',
  { id: 'foo' },
  Beact.createElement("a", null, "bar"),
  Beact.createElement("b", null, "baz")
);
