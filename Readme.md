[![Coveralls – test coverage
](https://img.shields.io/coveralls/tomekwi/parametric-svg-parser.svg?style=flat-square)
](https://coveralls.io/r/tomekwi/parametric-svg-parser)
 [![Travis – build status
](https://img.shields.io/travis/tomekwi/parametric-svg-parser/master.svg?style=flat-square)
](https://travis-ci.org/tomekwi/parametric-svg-parser)
 [![David – status of dependencies
](https://img.shields.io/david/tomekwi/parametric-svg-parser.svg?style=flat-square)
](https://david-dm.org/tomekwi/parametric-svg-parser)
 [![Stability: experimental
](https://img.shields.io/badge/stability-experimental-yellow.svg?style=flat-square)
](https://nodejs.org/api/documentation.html#documentation_stability_index)
 [![Code style: airbnb
](https://img.shields.io/badge/code%20style-airbnb-777777.svg?style=flat-square)
](https://github.com/airbnb/javascript)




parametric-svg-parser
=====================

**A JS-based parser for parametric.svg graphics**

Works in node and in browsers.




<div                                                  id="/install">&nbsp;</div>

Install
-------

```sh
$ npm install parametric-svg-parser
```




<div                                                      id="/use">&nbsp;</div>

Use
---

```js
const parse = require('parametric-svg-parser');

const svg = domify('<svg><rect parametric:width="a + 5" /></svg>')
const ast = parse(svg);
ast;
//» { type: 'ParametricSvgAst',
//    version: 1,
//    parameters: [object Set],
//    defaults: [object Set] }
```

You can now pass the `ast` to **[parametric-svg-patch](https://www.npmjs.com/package/parametric-svg-patch)**.




<div                                                  id="/license">&nbsp;</div>

License
-------

[MIT][] © [Tomek Wiszniewski][]

[MIT]: ./License.md
[Tomek Wiszniewski]: https://github.com/tomekwi
