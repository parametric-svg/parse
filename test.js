const test = require('ava');
const {safeLoad: yaml} = require('js-yaml');
const {readFileSync} = require('fs');
const {resolve} = require('path');

const specs = [
  {name: 'Syntax', file: 'syntax.yaml'},
].map(({name, file}) => ({
  name,
  spec: yaml(readFileSync(
    resolve(__dirname, `node_modules/parametric-svg-spec/specs/${file}`)
  )),
}));

specs.forEach(({name, spec}) => {
  spec.tests.forEach(({description}) => {
    test(`${name}: ${description}`, (a) => {
      a.fail();
      a.end();
    });
  });
});
