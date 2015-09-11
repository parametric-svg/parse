import {NAMESPACE, PREFIX} from './constants';

const ast = require('parametric-svg-ast');
const arrayFrom = require('array-from');
const startsWith = require('starts-with');

const ELEMENT_NODE = 1;

const getChildren = ({children, childNodes}) => (children ?
  arrayFrom(children) :
  arrayFrom(childNodes).filter(({nodeType}) => nodeType === ELEMENT_NODE)
);

const nodeBelongsToNamespace = ({htmlMode, namespace, prefix = null}, node) => (
  (htmlMode ?
    node.namespaceURI === namespace :
    (prefix !== null && startsWith(node.name, `${prefix}:`))
  )
);

const getLocalName = ({htmlMode}, node) => (htmlMode ?
  node.localName :
  node.name.replace(new RegExp(`^.*?:`), '')
);

const crawl = ({htmlMode, parentAddress}) => (
  attributes, element, indexInParent
) => {
  const address = parentAddress.concat(indexInParent);

  const currentAttributes = arrayFrom(element.attributes)
    .filter((node) => nodeBelongsToNamespace({
      namespace: NAMESPACE,
      prefix: PREFIX,
      htmlMode,
    }, node))

    .map((attribute) => ({
      address,
      name: getLocalName({htmlMode}, attribute),
      dependencies: [],  // Proof of concept
      relation: () => Number(attribute.value),  // Proof of concept
    }));

  return getChildren(element).reduce(
    crawl({htmlMode, parentAddress: address}),
    attributes.concat(currentAttributes)
  );
};

export default ({htmlMode = false}, root) => {
  const attributes = getChildren(root).reduce(
    crawl({htmlMode, parentAddress: []}),
    []
  );

  return ast({attributes, defaults: []});
};
