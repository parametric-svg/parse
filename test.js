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

const specDirectory = resolve(process.cwd(),
  'node_modules/parametric-svg-spec/specs'
);

// const specs = readdirSync(specDirectory)
const specs = ['usage-html5.yaml']
  .map((filename) => yaml(readFileSync(
    resolve(specDirectory, filename)
  )));

specs.forEach(({name, tests}) => tests.forEach((
  {description, ast, document}
) => {
  test(`${name}: ${description}`, (is) => {
    const window = jsdom(document).defaultView;
    const result = parse(window.document.body.parentNode);

    ast.forEach((expected, index) => {
      const nth = ord(index + 1);
      const actual = arrayFrom(result.attributes)[index];

      is.deepEqual(
        expected.address,
        actual.address,
        `The \`address\` matches in the ${nth} parametric element`
      );

      is.equal(
        expected.name,
        actual.name,
        `The \`name\` matches in the ${nth} parametric element`
      );

      is.deepEqual(
        expected.dependencies,
        actual.dependencies,
        `The \`dependencies\` match in the ${nth} parametric element`
      );

      expected.relation.forEach(({input, output: expectedOutput}) => {
        const inputArguments = input.map(tosource).join(', ');

        is.deepEqual(
          actual.relation(...input),
          expectedOutput,
          'The relation function gives the expected result given the ' +
          `arguments \`(${inputArguments})\`.`
        );
      });
    });

    is.end();
  });
}));
