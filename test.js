import parse from './module';

const test = require('tape-catch');
const {safeLoad: yaml} = require('js-yaml');
const ord = require('ord');
const tosource = require('tosource');
const {jsdom} = require('jsdom');
const arrayFrom = require('array-from');
const {DOMParser: XmldomParser} = require('xmldom');

const wrap = (element) => (
`<svg
  version="1.1"
  xmlns="http://www.w3.org/2000/svg"
  xmlns:parametric="//parametric-svg.js.org/v1"
  >
  ${element}
</svg>
`
);

if (typeof require.ensure !== 'function') require.ensure =
  require('isomorphic-ensure')({
    loaders: {
      raw: require('raw-loader'),
    },
    dirname: __dirname,
  });

require.ensure([
  'raw!./node_modules/parametric-svg-spec/specs/usage-html5.yaml',
  'raw!./node_modules/parametric-svg-spec/specs/usage-xml.yaml',
    // NOTE: These paths to be hard-coded in stone – otherwise webpack
    // gets confused. Remember to keep them in sync with the `require`
    // calls below.
], (require) => {
  const specs = [
    require('raw!./node_modules/parametric-svg-spec/specs/usage-html5.yaml'),
    require('raw!./node_modules/parametric-svg-spec/specs/usage-xml.yaml'),
      // NOTE: See above.
  ].map(yaml);

  specs.forEach((
    {name, tests, mode}
  ) => tests.forEach((
    {description, ast, original}
  ) => {
    test(`${name}: ${description}`, (is) => {
      const inBrowser = typeof window !== 'undefined' && window.DOMParser;
      const htmlMode = mode === 'HTML5 document';
      const [document, xmlMode] = (
        (mode === 'XML document' &&
          [original, true]
        ) ||
        (mode === 'Element' &&
          [wrap(original), true]
        ) ||
        (
          [original, false]
        )
      );

      const rootElement = (
        (inBrowser && htmlMode &&
          (new window.DOMParser()).parseFromString(document, 'text/html')
            .documentElement
        ) ||
        (inBrowser && xmlMode &&
          (new window.DOMParser()).parseFromString(document, 'application/xml')
            .documentElement
        ) ||
        (!inBrowser && htmlMode &&
          jsdom(document).defaultView.document.body.parentNode
        ) ||
        (!inBrowser && xmlMode &&
          (new XmldomParser()).parseFromString(document, 'application/xml')
            .documentElement
        ) ||
        (
          null
        )
      );

      if (rootElement === null) throw new Error('Unknown test mode');

      const {attributes} = parse(rootElement);

      is.equal(
        attributes.size,
        ast.length,
        'the AST has the right number of attributes'
      );

      ast.forEach((expected, index) => {
        const n = index + 1;
        const nth = `${n}-${ord(n)}`;
        const actual = arrayFrom(attributes)[index];

        is.deepEqual(
          actual.address,
          expected.address,
          `the \`address\` matches in the ${nth} parametric attribute`
        );

        is.equal(
          actual.name,
          expected.name,
          `the \`name\` matches in the ${nth} parametric attribute`
        );

        is.deepEqual(
          actual.dependencies,
          expected.dependencies,
          `the \`dependencies\` match in the ${nth} parametric attribute`
        );

        expected.relation.forEach(({input, output: expectedOutput}) => {
          const inputArguments = input.map(tosource).join(', ');

          is.deepEqual(
            actual.relation(...input),
            expectedOutput,
            `the \`relation\` in the ${nth} parametric attribute returns ` +
            'the expected value when called with the arguments ' +
            `\`(${inputArguments})\`.`
          );
        });
      });

      is.end();
    });
  }));
});
