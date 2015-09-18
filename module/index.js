import {NAMESPACE, PREFIX} from './constants';

const ast = require('parametric-svg-ast');
const arrayFrom = require('array-from');
const startsWith = require('starts-with');
const {eval: evaluate, parse} = require('mathjs');

const ELEMENT_NODE = 1;

const getChildren = ({children, childNodes}) => (children ?
  arrayFrom(children) :
  arrayFrom(childNodes).filter(({nodeType}) => nodeType === ELEMENT_NODE)
);

const nodeBelongsToNamespace = ({namespace, prefix = null}, node) => (
  (node.namespaceURI ?
    node.namespaceURI === namespace :
    (prefix !== null && startsWith(node.name, `${prefix}:`))
  )
);

const getLocalName = (node) => (node.namespaceURI ?
  node.localName :
  node.name.replace(new RegExp(`^.*?:`), '')
);

const crawl = (parentAddress) => (allAttributes, element, indexInParent) => {
  const address = (indexInParent === null ?
    parentAddress :
    parentAddress.concat(indexInParent)
  );

  const currentAttributes = arrayFrom(element.attributes)
    .filter((node) => nodeBelongsToNamespace({
      namespace: NAMESPACE,
      prefix: PREFIX,
    }, node))

    .map((attribute) => {
      const expressionTree = parse(attribute.value);

      const dependencies = [];
      expressionTree.traverse((node) => {
        if (node.isSymbolNode) dependencies.push(node.name);
      });

      return {
        address,
        name: getLocalName(attribute),
        dependencies,
        relation: () => evaluate(attribute.value),  // Proof of concept
      };
    });

  return getChildren(element).reduce(
    crawl(address),
    allAttributes.concat(currentAttributes)
  );
};

export default (root) => {
  const attributes = crawl([])([], root, null);

  return ast({attributes, defaults: []});
};
