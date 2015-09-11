import parse from './module';

const test = require('tape-catch');
const {safeLoad: yaml} = require('js-yaml');
// const {readFileSync, readdirSync} = require('fs');
const {readFileSync} = require('fs');
const {resolve} = require('path');
const ord = require('ord');
const tosource = require('tosource');
const {jsdom} = require('jsdom');
const arrayFrom = require('array-from');
const {DOMParser} = require('xmldom');

const specDirectory = resolve(__dirname,
  'node_modules/parametric-svg-spec/specs'
);

// const specs = readdirSync(specDirectory)
const specs = ['usage-html5.yaml', 'usage-xml.yaml']
  .map((filename) => yaml(readFileSync(
    resolve(specDirectory, filename)
  )));

specs.forEach(({name, tests}) => tests.forEach((
  {description, ast, document, mode}
) => {
  test(`${name}: ${description}`, (is) => {
    const rootElement = mode === 'html' ?
      jsdom(document).defaultView.document.body.parentNode :
      new DOMParser().parseFromString(document).documentElement;

    const {attributes} = parse(rootElement);

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
