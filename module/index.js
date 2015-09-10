const ast = require('parametric-svg-ast');
const arrayFrom = require('array-from');

const crawl = (parentAddress) => (attributes, element, indexInParent) => {
  const address = parentAddress.concat(indexInParent);

  const currentAttributes = arrayFrom(element.attributes)
    .filter(({localName}) => localName.match(/^parametric:/))  // POC
    .map(({localName, value}) => ({
      address,
      name: localName.replace(/^parametric:/, ''),  // POC
      dependencies: [],
      relation: new Function(`return ${value}`),  // Proof of concept
    }));

  return arrayFrom(element.children).reduce(
    crawl(address),
    attributes.concat(currentAttributes)
  );
};

export default (root) => {
  const attributes = arrayFrom(root.children).reduce(crawl([]), []);

  return ast({attributes, defaults: []});
};
