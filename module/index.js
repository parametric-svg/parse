const ast = require('parametric-svg-ast');
const arrayFrom = require('array-from');
const startsWith = require('starts-with');

const ELEMENT_NODE = 1;

const getChildren = ({children, childNodes}) => (children ?
  arrayFrom(children) :
  arrayFrom(childNodes).filter(({nodeType}) => nodeType === ELEMENT_NODE)
);

const nodeBelongsToNamespace = ({namespace, prefix = null}, node) => (
  node.namespaceURI === namespace ||
  (prefix !== null && startsWith(node.localName, `${prefix}:`))
);

const crawl = (parentAddress) => (attributes, element, indexInParent) => {
  const address = parentAddress.concat(indexInParent);

  const currentAttributes = arrayFrom(element.attributes)
    .filter(({localName}) => localName.match(/^parametric:/))  // POC
    .map(({localName, value}) => ({
      address,
      name: localName.replace(/^parametric:/, ''),  // POC
      dependencies: [],
      relation: () => Number(value),  // Proof of concept
    }));

  return getChildren(element).reduce(
    crawl(address),
    attributes.concat(currentAttributes)
  );
};

export default (root) => {
  const attributes = getChildren(root).reduce(crawl([]), []);

  return ast({attributes, defaults: []});
};
