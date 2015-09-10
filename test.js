const test = require('ava');
const {safeLoad: yaml} = require('js-yaml');
const {readFileSync, readdirSync} = require('fs');
const {resolve} = require('path');

const specDirectory = resolve(__dirname,
  'node_modules/parametric-svg-spec/specs'
);

const specs = readdirSync(specDirectory)
  .map((filename) => yaml(readFileSync(
    resolve(specDirectory, filename)
  )));

specs.forEach(({name, tests}) => {
  tests.forEach(({description}) => {
    test(`${name}: ${description}`, (a) => {
      a.fail();
      a.end();
    });
  });
});
