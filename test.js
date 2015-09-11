import parse from './module';

const test = require('tape-catch');
const {safeLoad: yaml} = require('js-yaml');
const ord = require('ord');
const tosource = require('tosource');
const {jsdom} = require('jsdom');
const arrayFrom = require('array-from');
const {DOMParser: XmldomParser} = require('xmldom');

if (typeof require.ensure !== 'function') require.ensure =
  require('isomorphic-ensure')({
    loaders: {
      raw: require('raw-loader'),
    },
    dirname: __dirname,
  });

const specPaths = [
  'usage-html5',
  'usage-xml',
].map((spec) => `raw!./node_modules/parametric-svg-spec/specs/${spec}.yaml`);

require.ensure(specPaths, (require) => {
  const specs = specPaths.map((path) => yaml(require(path)));

  specs.forEach((
    {name, tests}
  ) => tests.forEach((
    {description, ast, document, mode}
  ) => {
    test(`${name}: ${description}`, (is) => {
      const inBrowser = typeof window !== 'undefined' && window.DOMParser;
      const htmlMode = mode === 'html';
      const rootElement = (
        (inBrowser && htmlMode &&
          (new window.DOMParser()).parseFromString(document, 'text/html')
            .documentElement
        ) ||
        (inBrowser && !htmlMode &&
          (new window.DOMParser()).parseFromString(document, 'application/xml')
            .documentElement
        ) ||
        (!inBrowser && htmlMode &&
          jsdom(document).defaultView.document.body.parentNode
        ) ||
        (!inBrowser && !htmlMode &&
          (new XmldomParser()).parseFromString(document, 'application/xml')
            .documentElement
        )
      );

      const {attributes} = parse({htmlMode: (mode === 'html')}, rootElement);

      is.equal(
        attributes.size,
        ast.length,
        'the AST has the right number of attributes'
      );

      ast.forEach((expected, index) => {
        const n = index + 1;
        const nth = `${n}${ord(n)}`;
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
