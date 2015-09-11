import {NAMESPACE, PREFIX} from './constants';

const ast = require('parametric-svg-ast');
const arrayFrom = require('array-from');
const startsWith = require('starts-with');

const ELEMENT_NODE = 1;

const getChildren = ({children, childNodes}) => (children ?
  arrayFrom(children) :
  arrayFrom(childNodes).filter(({nodeType}) => nodeType === ELEMENT_NODE)
);

const nodeBelongsToNamespace = ({mode, namespace, prefix = null}, node) => (
  (mode === 'html' ?
    node.namespaceURI === namespace :
    (prefix !== null && startsWith(node.name, `${prefix}:`))
  )
);

const getLocalName = ({mode}, node) => (mode === 'html' ?
  node.localName :
  node.name.replace(new RegExp(`^.*?:`), '')
);

const crawl = ({mode, parentAddress}) => (
  attributes, element, indexInParent
) => {
  const address = parentAddress.concat(indexInParent);

  const currentAttributes = arrayFrom(element.attributes)
    .filter((node) => nodeBelongsToNamespace({
      namespace: NAMESPACE,
      prefix: PREFIX,
      mode,
    }, node))

    .map((attribute) => ({
      address,
      name: getLocalName({mode}, attribute),
      dependencies: [],  // Proof of concept
      relation: () => Number(attribute.value),  // Proof of concept
    }));

  return getChildren(element).reduce(
    crawl({mode, parentAddress: address}),
    attributes.concat(currentAttributes)
  );
};

export default ({mode = 'xml'}, root) => {
  const attributes = getChildren(root).reduce(
    crawl({mode, parentAddress: []}),
    []
  );

  return ast({attributes, defaults: []});
};
