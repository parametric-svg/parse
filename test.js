import parse from './module';

const test = require('ava');
const {safeLoad: yaml} = require('js-yaml');
// const {readFileSync, readdirSync} = require('fs');
const {readFileSync} = require('fs');
const {resolve} = require('path');
const ord = require('ord');
const tosource = require('tosource');
const jsdom = require('jsdom');
const arrayFrom = require('array-from');

const specDirectory = resolve(__dirname,
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
  test(`${name}: ${description}`, (a) => {
    jsdom.env(document, (error, window) => {
      if (error) throw error;

      const result = parse(window.document.body.parentNode);

      ast.forEach((expected, index) => {
        const nth = ord(index + 1);
        const actual = arrayFrom(result.attributes)[index];

        a.same(
          expected.address,
          actual.address,
          `The \`address\` matches in the ${nth} parametric element`
        );

        a.is(
          expected.name,
          actual.name,
          `The \`name\` matches in the ${nth} parametric element`
        );

        a.same(
          expected.dependencies,
          actual.dependencies,
          `The \`dependencies\` match in the ${nth} parametric element`
        );

        expected.relation.forEach(({input, expectedOutput}) => {
          const inputArguments = input.map(tosource).join(', ');

          a.same(
            actual.relation(...input),
            expectedOutput,
            'The relation function gives the expected result given the ' +
            `arguments \`(${inputArguments})\`.`
          );
        });
      });

      a.end();
    });
  });
}));
