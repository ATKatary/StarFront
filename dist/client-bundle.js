(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){(function (){
'use strict';

var objectAssign = require('object-assign');

// compare and isBuffer taken from https://github.com/feross/buffer/blob/680e9e5e488f22aac27599a57dc844a6315928dd/index.js
// original notice:

/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
function compare(a, b) {
  if (a === b) {
    return 0;
  }

  var x = a.length;
  var y = b.length;

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break;
    }
  }

  if (x < y) {
    return -1;
  }
  if (y < x) {
    return 1;
  }
  return 0;
}
function isBuffer(b) {
  if (global.Buffer && typeof global.Buffer.isBuffer === 'function') {
    return global.Buffer.isBuffer(b);
  }
  return !!(b != null && b._isBuffer);
}

// based on node assert, original notice:
// NB: The URL to the CommonJS spec is kept just for tradition.
//     node-assert has evolved a lot since then, both in API and behavior.

// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var util = require('util/');
var hasOwn = Object.prototype.hasOwnProperty;
var pSlice = Array.prototype.slice;
var functionsHaveNames = (function () {
  return function foo() {}.name === 'foo';
}());
function pToString (obj) {
  return Object.prototype.toString.call(obj);
}
function isView(arrbuf) {
  if (isBuffer(arrbuf)) {
    return false;
  }
  if (typeof global.ArrayBuffer !== 'function') {
    return false;
  }
  if (typeof ArrayBuffer.isView === 'function') {
    return ArrayBuffer.isView(arrbuf);
  }
  if (!arrbuf) {
    return false;
  }
  if (arrbuf instanceof DataView) {
    return true;
  }
  if (arrbuf.buffer && arrbuf.buffer instanceof ArrayBuffer) {
    return true;
  }
  return false;
}
// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

var regex = /\s*function\s+([^\(\s]*)\s*/;
// based on https://github.com/ljharb/function.prototype.name/blob/adeeeec8bfcc6068b187d7d9fb3d5bb1d3a30899/implementation.js
function getName(func) {
  if (!util.isFunction(func)) {
    return;
  }
  if (functionsHaveNames) {
    return func.name;
  }
  var str = func.toString();
  var match = str.match(regex);
  return match && match[1];
}
assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  } else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = getName(stackStartFunction);
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function truncate(s, n) {
  if (typeof s === 'string') {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}
function inspect(something) {
  if (functionsHaveNames || !util.isFunction(something)) {
    return util.inspect(something);
  }
  var rawname = getName(something);
  var name = rawname ? ': ' + rawname : '';
  return '[Function' +  name + ']';
}
function getMessage(self) {
  return truncate(inspect(self.actual), 128) + ' ' +
         self.operator + ' ' +
         truncate(inspect(self.expected), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

assert.deepStrictEqual = function deepStrictEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'deepStrictEqual', assert.deepStrictEqual);
  }
};

function _deepEqual(actual, expected, strict, memos) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;
  } else if (isBuffer(actual) && isBuffer(expected)) {
    return compare(actual, expected) === 0;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if ((actual === null || typeof actual !== 'object') &&
             (expected === null || typeof expected !== 'object')) {
    return strict ? actual === expected : actual == expected;

  // If both values are instances of typed arrays, wrap their underlying
  // ArrayBuffers in a Buffer each to increase performance
  // This optimization requires the arrays to have the same type as checked by
  // Object.prototype.toString (aka pToString). Never perform binary
  // comparisons for Float*Arrays, though, since e.g. +0 === -0 but their
  // bit patterns are not identical.
  } else if (isView(actual) && isView(expected) &&
             pToString(actual) === pToString(expected) &&
             !(actual instanceof Float32Array ||
               actual instanceof Float64Array)) {
    return compare(new Uint8Array(actual.buffer),
                   new Uint8Array(expected.buffer)) === 0;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else if (isBuffer(actual) !== isBuffer(expected)) {
    return false;
  } else {
    memos = memos || {actual: [], expected: []};

    var actualIndex = memos.actual.indexOf(actual);
    if (actualIndex !== -1) {
      if (actualIndex === memos.expected.indexOf(expected)) {
        return true;
      }
    }

    memos.actual.push(actual);
    memos.expected.push(expected);

    return objEquiv(actual, expected, strict, memos);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b, strict, actualVisitedObjects) {
  if (a === null || a === undefined || b === null || b === undefined)
    return false;
  // if one is a primitive, the other must be same
  if (util.isPrimitive(a) || util.isPrimitive(b))
    return a === b;
  if (strict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b))
    return false;
  var aIsArgs = isArguments(a);
  var bIsArgs = isArguments(b);
  if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
    return false;
  if (aIsArgs) {
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b, strict);
  }
  var ka = objectKeys(a);
  var kb = objectKeys(b);
  var key, i;
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length !== kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] !== kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key], strict, actualVisitedObjects))
      return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

assert.notDeepStrictEqual = notDeepStrictEqual;
function notDeepStrictEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'notDeepStrictEqual', notDeepStrictEqual);
  }
}


// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  }

  try {
    if (actual instanceof expected) {
      return true;
    }
  } catch (e) {
    // Ignore.  The instanceof check doesn't work for arrow functions.
  }

  if (Error.isPrototypeOf(expected)) {
    return false;
  }

  return expected.call({}, actual) === true;
}

function _tryBlock(block) {
  var error;
  try {
    block();
  } catch (e) {
    error = e;
  }
  return error;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (typeof block !== 'function') {
    throw new TypeError('"block" argument must be a function');
  }

  if (typeof expected === 'string') {
    message = expected;
    expected = null;
  }

  actual = _tryBlock(block);

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  var userProvidedMessage = typeof message === 'string';
  var isUnwantedException = !shouldThrow && util.isError(actual);
  var isUnexpectedException = !shouldThrow && actual && !expected;

  if ((isUnwantedException &&
      userProvidedMessage &&
      expectedException(actual, expected)) ||
      isUnexpectedException) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws(true, block, error, message);
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/error, /*optional*/message) {
  _throws(false, block, error, message);
};

assert.ifError = function(err) { if (err) throw err; };

// Expose a strict only variant of assert
function strict(value, message) {
  if (!value) fail(value, true, message, '==', strict);
}
assert.strict = objectAssign(strict, assert, {
  equal: assert.strictEqual,
  deepEqual: assert.deepStrictEqual,
  notEqual: assert.notStrictEqual,
  notDeepEqual: assert.notDeepStrictEqual
});
assert.strict.strict = assert.strict;

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"object-assign":6,"util/":4}],2:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],3:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],4:[function(require,module,exports){
(function (process,global){(function (){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this)}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./support/isBuffer":3,"_process":15,"inherits":2}],5:[function(require,module,exports){

},{}],6:[function(require,module,exports){
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/

'use strict';
/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

},{}],7:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compile = exports.makeNonterminalConverters = void 0;
const types_1 = require("./types");
const assert_1 = __importDefault(require("assert"));
const parser_1 = require("./parser");
/**
 * Converts string to nonterminal.
 * @param <NT> nonterminal enumeration
 * @param nonterminals required to be the runtime object for the <NT> type parameter
 * @return a pair of converters { nonterminalToString, stringToNonterminal }
 *              one takes a string (any alphabetic case) and returns the nonterminal it names
 *              the other takes a nonterminal and returns its string name, using the Typescript source capitalization.
 *         Both converters throw GrammarError if the conversion can't be done.
 * @throws GrammarError if NT has a name collision (two nonterminal names that differ only in capitalization,
 *       e.g. ROOT and root).
 */
function makeNonterminalConverters(nonterminals) {
    // "canonical name" is a case-independent name (canonicalized to lowercase)
    // "source name" is the name capitalized as in the Typescript source definition of NT
    const nonterminalForCanonicalName = new Map();
    const sourceNameForNonterminal = new Map();
    for (const key of Object.keys(nonterminals)) {
        // in Typescript, the nonterminals object combines both a NT->name mapping and name->NT mapping.
        // https://www.typescriptlang.org/docs/handbook/enums.html#enums-at-runtime
        // So filter just to keys that are valid Parserlib nonterminal names
        if (/^[a-zA-Z_][a-zA-Z_0-9]*$/.test(key)) {
            const sourceName = key;
            const canonicalName = key.toLowerCase();
            const nt = nonterminals[sourceName];
            if (nonterminalForCanonicalName.has(canonicalName)) {
                throw new types_1.GrammarError('name collision in nonterminal enumeration: '
                    + sourceNameForNonterminal.get(nonterminalForCanonicalName.get(canonicalName))
                    + ' and ' + sourceName
                    + ' are the same when compared case-insensitively');
            }
            nonterminalForCanonicalName.set(canonicalName, nt);
            sourceNameForNonterminal.set(nt, sourceName);
        }
    }
    //console.error(sourceNameForNonterminal);
    function stringToNonterminal(name) {
        const canonicalName = name.toLowerCase();
        if (!nonterminalForCanonicalName.has(canonicalName)) {
            throw new types_1.GrammarError('grammar uses nonterminal ' + name + ', which is not found in the nonterminal enumeration passed to compile()');
        }
        return nonterminalForCanonicalName.get(canonicalName);
    }
    function nonterminalToString(nt) {
        if (!sourceNameForNonterminal.has(nt)) {
            throw new types_1.GrammarError('nonterminal ' + nt + ' is not found in the nonterminal enumeration passed to compile()');
        }
        return sourceNameForNonterminal.get(nt);
    }
    return { stringToNonterminal, nonterminalToString };
}
exports.makeNonterminalConverters = makeNonterminalConverters;
var GrammarNT;
(function (GrammarNT) {
    GrammarNT[GrammarNT["GRAMMAR"] = 0] = "GRAMMAR";
    GrammarNT[GrammarNT["PRODUCTION"] = 1] = "PRODUCTION";
    GrammarNT[GrammarNT["SKIPBLOCK"] = 2] = "SKIPBLOCK";
    GrammarNT[GrammarNT["UNION"] = 3] = "UNION";
    GrammarNT[GrammarNT["CONCATENATION"] = 4] = "CONCATENATION";
    GrammarNT[GrammarNT["REPETITION"] = 5] = "REPETITION";
    GrammarNT[GrammarNT["REPEATOPERATOR"] = 6] = "REPEATOPERATOR";
    GrammarNT[GrammarNT["UNIT"] = 7] = "UNIT";
    GrammarNT[GrammarNT["NONTERMINAL"] = 8] = "NONTERMINAL";
    GrammarNT[GrammarNT["TERMINAL"] = 9] = "TERMINAL";
    GrammarNT[GrammarNT["QUOTEDSTRING"] = 10] = "QUOTEDSTRING";
    GrammarNT[GrammarNT["NUMBER"] = 11] = "NUMBER";
    GrammarNT[GrammarNT["RANGE"] = 12] = "RANGE";
    GrammarNT[GrammarNT["UPPERBOUND"] = 13] = "UPPERBOUND";
    GrammarNT[GrammarNT["LOWERBOUND"] = 14] = "LOWERBOUND";
    GrammarNT[GrammarNT["CHARACTERSET"] = 15] = "CHARACTERSET";
    GrammarNT[GrammarNT["ANYCHAR"] = 16] = "ANYCHAR";
    GrammarNT[GrammarNT["CHARACTERCLASS"] = 17] = "CHARACTERCLASS";
    GrammarNT[GrammarNT["WHITESPACE"] = 18] = "WHITESPACE";
    GrammarNT[GrammarNT["ONELINECOMMENT"] = 19] = "ONELINECOMMENT";
    GrammarNT[GrammarNT["BLOCKCOMMENT"] = 20] = "BLOCKCOMMENT";
    GrammarNT[GrammarNT["SKIP"] = 21] = "SKIP";
})(GrammarNT || (GrammarNT = {}));
;
function ntt(nonterminal) {
    return (0, parser_1.nt)(nonterminal, GrammarNT[nonterminal]);
}
const grammarGrammar = new Map();
// grammar ::= ( production | skipBlock )+
grammarGrammar.set(GrammarNT.GRAMMAR, (0, parser_1.cat)(ntt(GrammarNT.SKIP), (0, parser_1.star)((0, parser_1.cat)((0, parser_1.or)(ntt(GrammarNT.PRODUCTION), ntt(GrammarNT.SKIPBLOCK)), ntt(GrammarNT.SKIP)))));
// skipBlock ::= '@skip' nonterminal '{' production* '}'
grammarGrammar.set(GrammarNT.SKIPBLOCK, (0, parser_1.cat)((0, parser_1.str)("@skip"), ntt(GrammarNT.SKIP), (0, parser_1.failfast)(ntt(GrammarNT.NONTERMINAL)), ntt(GrammarNT.SKIP), (0, parser_1.str)('{'), (0, parser_1.failfast)((0, parser_1.cat)(ntt(GrammarNT.SKIP), (0, parser_1.star)((0, parser_1.cat)(ntt(GrammarNT.PRODUCTION), ntt(GrammarNT.SKIP))), (0, parser_1.str)('}')))));
// production ::= nonterminal '::=' union ';'
grammarGrammar.set(GrammarNT.PRODUCTION, (0, parser_1.cat)(ntt(GrammarNT.NONTERMINAL), ntt(GrammarNT.SKIP), (0, parser_1.str)("::="), (0, parser_1.failfast)((0, parser_1.cat)(ntt(GrammarNT.SKIP), ntt(GrammarNT.UNION), ntt(GrammarNT.SKIP), (0, parser_1.str)(';')))));
// union :: = concatenation ('|' concatenation)*
grammarGrammar.set(GrammarNT.UNION, (0, parser_1.cat)(ntt(GrammarNT.CONCATENATION), (0, parser_1.star)((0, parser_1.cat)(ntt(GrammarNT.SKIP), (0, parser_1.str)('|'), ntt(GrammarNT.SKIP), ntt(GrammarNT.CONCATENATION)))));
// concatenation :: = repetition* 
grammarGrammar.set(GrammarNT.CONCATENATION, (0, parser_1.star)((0, parser_1.cat)(ntt(GrammarNT.REPETITION), ntt(GrammarNT.SKIP))));
// repetition ::= unit repeatOperator?
grammarGrammar.set(GrammarNT.REPETITION, (0, parser_1.cat)(ntt(GrammarNT.UNIT), ntt(GrammarNT.SKIP), (0, parser_1.option)(ntt(GrammarNT.REPEATOPERATOR))));
// repeatOperator ::= [*+?] | '{' ( number | range | upperBound | lowerBound ) '}'
grammarGrammar.set(GrammarNT.REPEATOPERATOR, (0, parser_1.or)((0, parser_1.regex)("[*+?]"), (0, parser_1.cat)((0, parser_1.str)("{"), (0, parser_1.or)(ntt(GrammarNT.NUMBER), ntt(GrammarNT.RANGE), ntt(GrammarNT.UPPERBOUND), ntt(GrammarNT.LOWERBOUND)), (0, parser_1.str)("}"))));
// number ::= [0-9]+
grammarGrammar.set(GrammarNT.NUMBER, (0, parser_1.plus)((0, parser_1.regex)("[0-9]")));
// range ::= number ',' number
grammarGrammar.set(GrammarNT.RANGE, (0, parser_1.cat)(ntt(GrammarNT.NUMBER), (0, parser_1.str)(","), ntt(GrammarNT.NUMBER)));
// upperBound ::= ',' number
grammarGrammar.set(GrammarNT.UPPERBOUND, (0, parser_1.cat)((0, parser_1.str)(","), ntt(GrammarNT.NUMBER)));
// lowerBound ::= number ','
grammarGrammar.set(GrammarNT.LOWERBOUND, (0, parser_1.cat)(ntt(GrammarNT.NUMBER), (0, parser_1.str)(",")));
// unit ::= nonterminal | terminal | '(' union ')'
grammarGrammar.set(GrammarNT.UNIT, (0, parser_1.or)(ntt(GrammarNT.NONTERMINAL), ntt(GrammarNT.TERMINAL), (0, parser_1.cat)((0, parser_1.str)('('), ntt(GrammarNT.SKIP), ntt(GrammarNT.UNION), ntt(GrammarNT.SKIP), (0, parser_1.str)(')'))));
// nonterminal ::= [a-zA-Z_][a-zA-Z_0-9]*
grammarGrammar.set(GrammarNT.NONTERMINAL, (0, parser_1.cat)((0, parser_1.regex)("[a-zA-Z_]"), (0, parser_1.star)((0, parser_1.regex)("[a-zA-Z_0-9]"))));
// terminal ::= quotedString | characterSet | anyChar | characterClass
grammarGrammar.set(GrammarNT.TERMINAL, (0, parser_1.or)(ntt(GrammarNT.QUOTEDSTRING), ntt(GrammarNT.CHARACTERSET), ntt(GrammarNT.ANYCHAR), ntt(GrammarNT.CHARACTERCLASS)));
// quotedString ::= "'" ([^'\r\n\\] | '\\' . )* "'" | '"' ([^"\r\n\\] | '\\' . )* '"'
grammarGrammar.set(GrammarNT.QUOTEDSTRING, (0, parser_1.or)((0, parser_1.cat)((0, parser_1.str)("'"), (0, parser_1.failfast)((0, parser_1.star)((0, parser_1.or)((0, parser_1.regex)("[^'\r\n\\\\]"), (0, parser_1.cat)((0, parser_1.str)('\\'), (0, parser_1.regex)("."))))), (0, parser_1.str)("'")), (0, parser_1.cat)((0, parser_1.str)('"'), (0, parser_1.failfast)((0, parser_1.star)((0, parser_1.or)((0, parser_1.regex)('[^"\r\n\\\\]'), (0, parser_1.cat)((0, parser_1.str)('\\'), (0, parser_1.regex)("."))))), (0, parser_1.str)('"'))));
// characterSet ::= '[' ([^\]\r\n\\] | '\\' . )+ ']'
grammarGrammar.set(GrammarNT.CHARACTERSET, (0, parser_1.cat)((0, parser_1.str)('['), (0, parser_1.failfast)((0, parser_1.cat)((0, parser_1.plus)((0, parser_1.or)((0, parser_1.regex)("[^\\]\r\n\\\\]"), (0, parser_1.cat)((0, parser_1.str)('\\'), (0, parser_1.regex)(".")))))), (0, parser_1.str)(']')));
// anyChar ::= '.'
grammarGrammar.set(GrammarNT.ANYCHAR, (0, parser_1.str)('.'));
// characterClass ::= '\\' [dsw]
grammarGrammar.set(GrammarNT.CHARACTERCLASS, (0, parser_1.cat)((0, parser_1.str)('\\'), (0, parser_1.failfast)((0, parser_1.regex)("[dsw]"))));
// whitespace ::= [ \t\r\n]
grammarGrammar.set(GrammarNT.WHITESPACE, (0, parser_1.regex)("[ \t\r\n]"));
grammarGrammar.set(GrammarNT.ONELINECOMMENT, (0, parser_1.cat)((0, parser_1.str)("//"), (0, parser_1.star)((0, parser_1.regex)("[^\r\n]")), (0, parser_1.or)((0, parser_1.str)("\r\n"), (0, parser_1.str)('\n'), (0, parser_1.str)('\r'))));
grammarGrammar.set(GrammarNT.BLOCKCOMMENT, (0, parser_1.cat)((0, parser_1.str)("/*"), (0, parser_1.cat)((0, parser_1.star)((0, parser_1.regex)("[^*]")), (0, parser_1.str)('*')), (0, parser_1.star)((0, parser_1.cat)((0, parser_1.regex)("[^/]"), (0, parser_1.star)((0, parser_1.regex)("[^*]")), (0, parser_1.str)('*'))), (0, parser_1.str)('/')));
grammarGrammar.set(GrammarNT.SKIP, (0, parser_1.star)((0, parser_1.or)(ntt(GrammarNT.WHITESPACE), ntt(GrammarNT.ONELINECOMMENT), ntt(GrammarNT.BLOCKCOMMENT))));
const grammarParser = new parser_1.InternalParser(grammarGrammar, ntt(GrammarNT.GRAMMAR), (nt) => GrammarNT[nt]);
/**
 * Compile a Parser from a grammar represented as a string.
 * @param <NT> a Typescript Enum with one symbol for each nonterminal used in the grammar,
 *        matching the nonterminals when compared case-insensitively (so ROOT and Root and root are the same).
 * @param grammar the grammar to use
 * @param nonterminals the runtime object of the nonterminals enum. For example, if
 *             enum Nonterminals { root, a, b, c };
 *        then Nonterminals must be explicitly passed as this runtime parameter
 *              compile(grammar, Nonterminals, Nonterminals.root);
 *        (in addition to being implicitly used for the type parameter NT)
 * @param rootNonterminal the desired root nonterminal in the grammar
 * @return a parser for the given grammar that will start parsing at rootNonterminal.
 * @throws ParseError if the grammar has a syntax error
 */
function compile(grammar, nonterminals, rootNonterminal) {
    const { stringToNonterminal, nonterminalToString } = makeNonterminalConverters(nonterminals);
    const grammarTree = (() => {
        try {
            return grammarParser.parse(grammar);
        }
        catch (e) {
            throw (e instanceof types_1.InternalParseError) ? new types_1.GrammarError("grammar doesn't compile", e) : e;
        }
    })();
    const definitions = new Map();
    const nonterminalsDefined = new Set(); // on lefthand-side of some production
    const nonterminalsUsed = new Set(); // on righthand-side of some production
    // productions outside @skip blocks
    makeProductions(grammarTree.childrenByName(GrammarNT.PRODUCTION), null);
    // productions inside @skip blocks
    for (const skipBlock of grammarTree.childrenByName(GrammarNT.SKIPBLOCK)) {
        makeSkipBlock(skipBlock);
    }
    for (const nt of nonterminalsUsed) {
        if (!nonterminalsDefined.has(nt)) {
            throw new types_1.GrammarError("grammar is missing a definition for " + nonterminalToString(nt));
        }
    }
    if (!nonterminalsDefined.has(rootNonterminal)) {
        throw new types_1.GrammarError("grammar is missing a definition for the root nonterminal " + nonterminalToString(rootNonterminal));
    }
    return new parser_1.InternalParser(definitions, (0, parser_1.nt)(rootNonterminal, nonterminalToString(rootNonterminal)), nonterminalToString);
    function makeProductions(productions, skip) {
        for (const production of productions) {
            const nonterminalName = production.childrenByName(GrammarNT.NONTERMINAL)[0].text;
            const nonterminal = stringToNonterminal(nonterminalName);
            nonterminalsDefined.add(nonterminal);
            let expression = makeGrammarTerm(production.childrenByName(GrammarNT.UNION)[0], skip);
            if (skip)
                expression = (0, parser_1.cat)(skip, expression, skip);
            if (definitions.has(nonterminal)) {
                // grammar already has a production for this nonterminal; or expression onto it
                definitions.set(nonterminal, (0, parser_1.or)(definitions.get(nonterminal), expression));
            }
            else {
                definitions.set(nonterminal, expression);
            }
        }
    }
    function makeSkipBlock(skipBlock) {
        const nonterminalName = skipBlock.childrenByName(GrammarNT.NONTERMINAL)[0].text;
        const nonterminal = stringToNonterminal(nonterminalName);
        nonterminalsUsed.add(nonterminal);
        const skipTerm = (0, parser_1.skip)((0, parser_1.nt)(nonterminal, nonterminalName));
        makeProductions(skipBlock.childrenByName(GrammarNT.PRODUCTION), skipTerm);
    }
    function makeGrammarTerm(tree, skip) {
        switch (tree.name) {
            case GrammarNT.UNION: {
                const childexprs = tree.childrenByName(GrammarNT.CONCATENATION).map(child => makeGrammarTerm(child, skip));
                return childexprs.length == 1 ? childexprs[0] : (0, parser_1.or)(...childexprs);
            }
            case GrammarNT.CONCATENATION: {
                let childexprs = tree.childrenByName(GrammarNT.REPETITION).map(child => makeGrammarTerm(child, skip));
                if (skip) {
                    // insert skip between each pair of children
                    let childrenWithSkips = [];
                    for (const child of childexprs) {
                        if (childrenWithSkips.length > 0)
                            childrenWithSkips.push(skip);
                        childrenWithSkips.push(child);
                    }
                    childexprs = childrenWithSkips;
                }
                return (childexprs.length == 1) ? childexprs[0] : (0, parser_1.cat)(...childexprs);
            }
            case GrammarNT.REPETITION: {
                const unit = makeGrammarTerm(tree.childrenByName(GrammarNT.UNIT)[0], skip);
                const op = tree.childrenByName(GrammarNT.REPEATOPERATOR)[0];
                if (!op) {
                    return unit;
                }
                else {
                    const unitWithSkip = skip ? (0, parser_1.cat)(unit, skip) : unit;
                    //console.log('op is', op);
                    switch (op.text) {
                        case '*': return (0, parser_1.star)(unitWithSkip);
                        case '+': return (0, parser_1.plus)(unitWithSkip);
                        case '?': return (0, parser_1.option)(unitWithSkip);
                        default: {
                            // op is {n,m} or one of its variants
                            const range = op.children[0];
                            switch (range.name) {
                                case GrammarNT.NUMBER: {
                                    const n = parseInt(range.text);
                                    return (0, parser_1.repeat)(unitWithSkip, new parser_1.Between(n, n));
                                    break;
                                }
                                case GrammarNT.RANGE: {
                                    const n = parseInt(range.children[0].text);
                                    const m = parseInt(range.children[1].text);
                                    return (0, parser_1.repeat)(unitWithSkip, new parser_1.Between(n, m));
                                    break;
                                }
                                case GrammarNT.UPPERBOUND: {
                                    const m = parseInt(range.children[0].text);
                                    return (0, parser_1.repeat)(unitWithSkip, new parser_1.Between(0, m));
                                    break;
                                }
                                case GrammarNT.LOWERBOUND: {
                                    const n = parseInt(range.children[0].text);
                                    return (0, parser_1.repeat)(unitWithSkip, new parser_1.AtLeast(n));
                                    break;
                                }
                                default:
                                    throw new Error('internal error: unknown range: ' + range.name);
                            }
                        }
                    }
                }
            }
            case GrammarNT.UNIT:
                return makeGrammarTerm(tree.childrenByName(GrammarNT.NONTERMINAL)[0]
                    || tree.childrenByName(GrammarNT.TERMINAL)[0]
                    || tree.childrenByName(GrammarNT.UNION)[0], skip);
            case GrammarNT.NONTERMINAL: {
                const nonterminal = stringToNonterminal(tree.text);
                nonterminalsUsed.add(nonterminal);
                return (0, parser_1.nt)(nonterminal, tree.text);
            }
            case GrammarNT.TERMINAL:
                switch (tree.children[0].name) {
                    case GrammarNT.QUOTEDSTRING:
                        return (0, parser_1.str)(stripQuotesAndReplaceEscapeSequences(tree.text));
                    case GrammarNT.CHARACTERSET: // e.g. [abc]
                    case GrammarNT.ANYCHAR: // e.g.  .
                    case GrammarNT.CHARACTERCLASS: // e.g.  \d  \s  \w
                        return (0, parser_1.regex)(tree.text);
                    default:
                        throw new Error('internal error: unknown literal: ' + tree.children[0]);
                }
            default:
                throw new Error('internal error: unknown grammar rule: ' + tree.name);
        }
    }
    /**
     * Strip starting and ending quotes.
     * Replace \t, \r, \n with their character codes.
     * Replaces all other \x with literal x.
     */
    function stripQuotesAndReplaceEscapeSequences(s) {
        (0, assert_1.default)(s[0] == '"' || s[0] == "'");
        s = s.substring(1, s.length - 1);
        s = s.replace(/\\(.)/g, (match, escapedChar) => {
            switch (escapedChar) {
                case 't': return '\t';
                case 'r': return '\r';
                case 'n': return '\n';
                default: return escapedChar;
            }
        });
        return s;
    }
}
exports.compile = compile;

},{"./parser":9,"./types":11,"assert":1}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indent = exports.snippet = exports.escapeForReading = exports.toColumn = exports.toLine = exports.describeLocation = exports.makeErrorMessage = void 0;
/**
 * Make a human-readable error message explaining a parse error and where it was found in the input.
 * @param message brief message stating what error occurred
 * @param nonterminalName name of deepest nonterminal that parser was trying to match when parse failed
 * @param expectedText human-readable description of what string literals the parser was expecting there;
 *            e.g. ";", "[ \r\n\t]", "1|2|3"
 * @param stringBeingParsed original input to parse()
 * @param pos offset in stringBeingParsed where error occurred
 * @param nameOfStringBeingParsed human-readable description of where stringBeingParsed came from;
 *             e.g. "grammar" if stringBeingParsed was the input to Parser.compile(),
 *             or "string being parsed" if stringBeingParsed was the input to Parser.parse()
 * @return a multiline human-readable message that states the error, its location in the input,
 *         what text was expected and what text was actually found.
 */
function makeErrorMessage(message, nonterminalName, expectedText, stringBeingParsed, pos, nameOfStringBeingParsed) {
    let result = message;
    if (result.length > 0)
        result += "\n";
    result +=
        "Error at " + describeLocation(stringBeingParsed, pos) + " of " + nameOfStringBeingParsed + "\n"
            + "  trying to match " + nonterminalName.toUpperCase() + "\n"
            + "  expected " + escapeForReading(expectedText, "")
            + ((stringBeingParsed.length > 0)
                ? "\n   but saw " + snippet(stringBeingParsed, pos)
                : "");
    return result;
}
exports.makeErrorMessage = makeErrorMessage;
/**
 * @param string to describe
 * @param pos offset in string, 0<=pos<string.length()
 * @return a human-readable description of the location of the character at offset pos in string
 * (using offset and/or line/column if appropriate)
 */
function describeLocation(s, pos) {
    let result = "offset " + pos;
    if (s.indexOf('\n') != -1) {
        result += " (line " + toLine(s, pos) + " column " + toColumn(s, pos) + ")";
    }
    return result;
}
exports.describeLocation = describeLocation;
/**
 * Translates a string offset into a line number.
 * @param string in which offset occurs
 * @param pos offset in string, 0<=pos<string.length()
 * @return the 1-based line number of the character at offset pos in string,
 * as if string were being viewed in a text editor
 */
function toLine(s, pos) {
    let lineCount = 1;
    for (let newline = s.indexOf('\n'); newline != -1 && newline < pos; newline = s.indexOf('\n', newline + 1)) {
        ++lineCount;
    }
    return lineCount;
}
exports.toLine = toLine;
/**
 * Translates a string offset into a column number.
 * @param string in which offset occurs
 * @param pos offset in string, 0<=pos<string.length()
 * @return the 1-based column number of the character at offset pos in string,
 * as if string were being viewed in a text editor with tab size 1 (i.e. a tab is treated like a space)
 */
function toColumn(s, pos) {
    const lastNewlineBeforePos = s.lastIndexOf('\n', pos - 1);
    const totalSizeOfPrecedingLines = (lastNewlineBeforePos != -1) ? lastNewlineBeforePos + 1 : 0;
    return pos - totalSizeOfPrecedingLines + 1;
}
exports.toColumn = toColumn;
/**
* Replace common unprintable characters by their escape codes, for human reading.
* Should be idempotent, i.e. if x = escapeForReading(y), then x.equals(escapeForReading(x)).
* @param string to escape
* @param quote quotes to put around string, or "" if no quotes required
* @return string with escape codes replaced, preceded and followed by quote, with a human-readable legend appended to the end
*         explaining what the replacement characters mean.
*/
function escapeForReading(s, quote) {
    let result = s;
    const legend = [];
    for (const { unprintableChar, humanReadableVersion, description } of ESCAPES) {
        if (result.includes(unprintableChar)) {
            result = result.replace(unprintableChar, humanReadableVersion);
            legend.push(humanReadableVersion + " means " + description);
        }
    }
    result = quote + result + quote;
    if (legend.length > 0) {
        result += " (where " + legend.join(", ") + ")";
    }
    return result;
}
exports.escapeForReading = escapeForReading;
const ESCAPES = [
    {
        unprintableChar: "\n",
        humanReadableVersion: "\u2424",
        description: "newline"
    },
    {
        unprintableChar: "\r",
        humanReadableVersion: "\u240D",
        description: "carriage return"
    },
    {
        unprintableChar: "\t",
        humanReadableVersion: "\u21E5",
        description: "tab"
    },
];
/**
 * @param string to shorten
 * @param pos offset in string, 0<=pos<string.length()
 * @return a short snippet of the part of string starting at offset pos,
 * in human-readable form
 */
function snippet(s, pos) {
    const maxCharsToShow = 10;
    const end = Math.min(pos + maxCharsToShow, s.length);
    let result = s.substring(pos, end) + (end < s.length ? "..." : "");
    if (result.length == 0)
        result = "end of string";
    return escapeForReading(result, "");
}
exports.snippet = snippet;
/**
 * Indent a multi-line string by preceding each line with prefix.
 * @param string string to indent
 * @param prefix prefix to use for indenting
 * @return string with prefix inserted at the start of each line
 */
function indent(s, prefix) {
    let result = "";
    let charsCopied = 0;
    do {
        const newline = s.indexOf('\n', charsCopied);
        const endOfLine = newline != -1 ? newline + 1 : s.length;
        result += prefix + s.substring(charsCopied, endOfLine);
        charsCopied = endOfLine;
    } while (charsCopied < s.length);
    return result;
}
exports.indent = indent;

},{}],9:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParserState = exports.FailedParse = exports.SuccessfulParse = exports.InternalParser = exports.failfast = exports.skip = exports.option = exports.plus = exports.star = exports.repeat = exports.ZERO_OR_ONE = exports.ONE_OR_MORE = exports.ZERO_OR_MORE = exports.Between = exports.AtLeast = exports.or = exports.cat = exports.str = exports.regex = exports.nt = void 0;
const assert_1 = __importDefault(require("assert"));
const types_1 = require("./types");
const parsetree_1 = require("./parsetree");
function nt(nonterminal, nonterminalName) {
    return {
        parse(s, pos, definitions, state) {
            const gt = definitions.get(nonterminal);
            if (gt === undefined)
                throw new types_1.GrammarError("nonterminal has no definition: " + nonterminalName);
            // console.error("entering", nonterminalName);
            state.enter(pos, nonterminal);
            let pr = gt.parse(s, pos, definitions, state);
            state.leave(nonterminal);
            // console.error("leaving", nonterminalName, "with result", pr);
            if (!pr.failed && !state.isEmpty()) {
                const tree = pr.tree;
                const newTree = state.makeParseTree(tree.start, tree.text, [tree]);
                pr = pr.replaceTree(newTree);
            }
            return pr;
        },
        toString() {
            return nonterminalName;
        }
    };
}
exports.nt = nt;
function regex(regexSource) {
    let regex = new RegExp('^' + regexSource + '$', 's');
    return {
        parse(s, pos, definitions, state) {
            if (pos >= s.length) {
                return state.makeFailedParse(pos, regexSource);
            }
            const l = s.substring(pos, pos + 1);
            if (regex.test(l)) {
                return state.makeSuccessfulParse(pos, pos + 1, l);
            }
            return state.makeFailedParse(pos, regexSource);
        },
        toString() {
            return regexSource;
        }
    };
}
exports.regex = regex;
function str(str) {
    return {
        parse(s, pos, definitions, state) {
            const newpos = pos + str.length;
            if (newpos > s.length) {
                return state.makeFailedParse(pos, str);
            }
            const l = s.substring(pos, newpos);
            if (l === str) {
                return state.makeSuccessfulParse(pos, newpos, l);
            }
            return state.makeFailedParse(pos, str);
        },
        toString() {
            return "'" + str.replace(/'\r\n\t\\/, "\\$&") + "'";
        }
    };
}
exports.str = str;
function cat(...terms) {
    return {
        parse(s, pos, definitions, state) {
            let prout = state.makeSuccessfulParse(pos, pos);
            for (const gt of terms) {
                const pr = gt.parse(s, pos, definitions, state);
                if (pr.failed)
                    return pr;
                pos = pr.pos;
                prout = prout.mergeResult(pr);
            }
            return prout;
        },
        toString() {
            return "(" + terms.map(term => term.toString()).join(" ") + ")";
        }
    };
}
exports.cat = cat;
/**
 * @param choices must be nonempty
 */
function or(...choices) {
    (0, assert_1.default)(choices.length > 0);
    return {
        parse(s, pos, definitions, state) {
            const successes = [];
            const failures = [];
            choices.forEach((choice) => {
                const result = choice.parse(s, pos, definitions, state);
                if (result.failed) {
                    failures.push(result);
                }
                else {
                    successes.push(result);
                }
            });
            if (successes.length > 0) {
                const longestSuccesses = longestResults(successes);
                (0, assert_1.default)(longestSuccesses.length > 0);
                return longestSuccesses[0];
            }
            const longestFailures = longestResults(failures);
            (0, assert_1.default)(longestFailures.length > 0);
            return state.makeFailedParse(longestFailures[0].pos, longestFailures.map((result) => result.expectedText).join("|"));
        },
        toString() {
            return "(" + choices.map(choice => choice.toString()).join("|") + ")";
        }
    };
}
exports.or = or;
class AtLeast {
    constructor(min) {
        this.min = min;
    }
    tooLow(n) { return n < this.min; }
    tooHigh(n) { return false; }
    toString() {
        switch (this.min) {
            case 0: return "*";
            case 1: return "+";
            default: return "{" + this.min + ",}";
        }
    }
}
exports.AtLeast = AtLeast;
class Between {
    constructor(min, max) {
        this.min = min;
        this.max = max;
    }
    tooLow(n) { return n < this.min; }
    tooHigh(n) { return n > this.max; }
    toString() {
        if (this.min == 0) {
            return (this.max == 1) ? "?" : "{," + this.max + "}";
        }
        else {
            return "{" + this.min + "," + this.max + "}";
        }
    }
}
exports.Between = Between;
exports.ZERO_OR_MORE = new AtLeast(0);
exports.ONE_OR_MORE = new AtLeast(1);
exports.ZERO_OR_ONE = new Between(0, 1);
function repeat(gt, howmany) {
    return {
        parse(s, pos, definitions, state) {
            let prout = state.makeSuccessfulParse(pos, pos);
            for (let timesMatched = 0; howmany.tooLow(timesMatched) || !howmany.tooHigh(timesMatched + 1); ++timesMatched) {
                const pr = gt.parse(s, pos, definitions, state);
                if (pr.failed) {
                    // no match
                    if (howmany.tooLow(timesMatched)) {
                        return pr;
                    }
                    return prout.addLastFailure(pr);
                }
                else {
                    if (pr.pos == pos) {
                        // matched the empty string, and we already have enough.
                        // we may get into an infinite loop if howmany.tooHigh() never returns false,
                        // so return successful match at this point
                        return prout;
                    }
                    // otherwise advance the position and merge pr into prout
                    pos = pr.pos;
                    prout = prout.mergeResult(pr);
                }
            }
            return prout;
        },
        toString() {
            return gt.toString() + howmany.toString();
        }
    };
}
exports.repeat = repeat;
function star(gt) {
    return repeat(gt, exports.ZERO_OR_MORE);
}
exports.star = star;
function plus(gt) {
    return repeat(gt, exports.ONE_OR_MORE);
}
exports.plus = plus;
function option(gt) {
    return repeat(gt, exports.ZERO_OR_ONE);
}
exports.option = option;
function skip(nonterminal) {
    const repetition = star(nonterminal);
    return {
        parse(s, pos, definitions, state) {
            state.enterSkip();
            let pr = repetition.parse(s, pos, definitions, state);
            state.leaveSkip();
            if (pr.failed) {
                // succeed anyway
                pr = state.makeSuccessfulParse(pos, pos);
            }
            return pr;
        },
        toString() {
            return "(?<skip>" + repetition + ")";
        }
    };
}
exports.skip = skip;
function failfast(gt) {
    return {
        parse(s, pos, definitions, state) {
            let pr = gt.parse(s, pos, definitions, state);
            if (pr.failed)
                throw new types_1.InternalParseError("", pr.nonterminalName, pr.expectedText, "", pr.pos);
            return pr;
        },
        toString() {
            return 'failfast(' + gt + ')';
        }
    };
}
exports.failfast = failfast;
class InternalParser {
    constructor(definitions, start, nonterminalToString) {
        this.definitions = definitions;
        this.start = start;
        this.nonterminalToString = nonterminalToString;
        this.checkRep();
    }
    checkRep() {
    }
    parse(textToParse) {
        let pr = (() => {
            try {
                return this.start.parse(textToParse, 0, this.definitions, new ParserState(this.nonterminalToString));
            }
            catch (e) {
                if (e instanceof types_1.InternalParseError) {
                    // rethrow the exception, augmented by the original text, so that the error message is better
                    throw new types_1.InternalParseError("string does not match grammar", e.nonterminalName, e.expectedText, textToParse, e.pos);
                }
                else {
                    throw e;
                }
            }
        })();
        if (pr.failed) {
            throw new types_1.InternalParseError("string does not match grammar", pr.nonterminalName, pr.expectedText, textToParse, pr.pos);
        }
        if (pr.pos < textToParse.length) {
            const message = "only part of the string matches the grammar; the rest did not parse";
            throw (pr.lastFailure
                ? new types_1.InternalParseError(message, pr.lastFailure.nonterminalName, pr.lastFailure.expectedText, textToParse, pr.lastFailure.pos)
                : new types_1.InternalParseError(message, this.start.toString(), "end of string", textToParse, pr.pos));
        }
        return pr.tree;
    }
    ;
    toString() {
        return Array.from(this.definitions, ([nonterminal, rule]) => this.nonterminalToString(nonterminal) + '::=' + rule + ';').join("\n");
    }
}
exports.InternalParser = InternalParser;
class SuccessfulParse {
    constructor(pos, tree, lastFailure) {
        this.pos = pos;
        this.tree = tree;
        this.lastFailure = lastFailure;
        this.failed = false;
    }
    replaceTree(tree) {
        return new SuccessfulParse(this.pos, tree, this.lastFailure);
    }
    mergeResult(that) {
        (0, assert_1.default)(!that.failed);
        //console.log('merging', this, 'with', that);
        return new SuccessfulParse(that.pos, this.tree.concat(that.tree), laterResult(this.lastFailure, that.lastFailure));
    }
    /**
     * Keep track of a failing parse result that prevented this tree from matching more of the input string.
     * This deeper failure is usually more informative to the user, so we'll display it in the error message.
     * @param newLastFailure a failing ParseResult<NT> that stopped this tree's parse (but didn't prevent this from succeeding)
     * @return a new ParseResult<NT> identical to this one but with lastFailure added to it
     */
    addLastFailure(newLastFailure) {
        (0, assert_1.default)(newLastFailure.failed);
        return new SuccessfulParse(this.pos, this.tree, laterResult(this.lastFailure, newLastFailure));
    }
}
exports.SuccessfulParse = SuccessfulParse;
class FailedParse {
    constructor(pos, nonterminalName, expectedText) {
        this.pos = pos;
        this.nonterminalName = nonterminalName;
        this.expectedText = expectedText;
        this.failed = true;
    }
}
exports.FailedParse = FailedParse;
/**
 * @param result1
 * @param result2
 * @return whichever of result1 or result2 has the mximum position, or undefined if both are undefined
 */
function laterResult(result1, result2) {
    if (result1 && result2)
        return result1.pos >= result2.pos ? result1 : result2;
    else
        return result1 || result2;
}
/**
 * @param results
 * @return the results in the list with maximum pos.  Empty if list is empty.
 */
function longestResults(results) {
    return results.reduce((longestResultsSoFar, result) => {
        if (longestResultsSoFar.length == 0 || result.pos > longestResultsSoFar[0].pos) {
            // result wins
            return [result];
        }
        else if (result.pos == longestResultsSoFar[0].pos) {
            // result is tied
            longestResultsSoFar.push(result);
            return longestResultsSoFar;
        }
        else {
            // result loses
            return longestResultsSoFar;
        }
    }, []);
}
class ParserState {
    constructor(nonterminalToString) {
        this.nonterminalToString = nonterminalToString;
        this.stack = [];
        this.first = new Map();
        this.skipDepth = 0;
    }
    enter(pos, nonterminal) {
        if (!this.first.has(nonterminal)) {
            this.first.set(nonterminal, []);
        }
        const s = this.first.get(nonterminal);
        if (s.length > 0 && s[s.length - 1] == pos) {
            throw new types_1.GrammarError("detected left recursion in rule for " + this.nonterminalToString(nonterminal));
        }
        s.push(pos);
        this.stack.push(nonterminal);
    }
    leave(nonterminal) {
        (0, assert_1.default)(this.first.has(nonterminal) && this.first.get(nonterminal).length > 0);
        this.first.get(nonterminal).pop();
        const last = this.stack.pop();
        (0, assert_1.default)(last === nonterminal);
    }
    enterSkip() {
        //console.error('entering skip');
        ++this.skipDepth;
    }
    leaveSkip() {
        //console.error('leaving skip');
        --this.skipDepth;
        (0, assert_1.default)(this.skipDepth >= 0);
    }
    isEmpty() {
        return this.stack.length == 0;
    }
    get currentNonterminal() {
        return this.stack[this.stack.length - 1];
    }
    get currentNonterminalName() {
        return this.currentNonterminal !== undefined ? this.nonterminalToString(this.currentNonterminal) : undefined;
    }
    // requires: !isEmpty()
    makeParseTree(pos, text = '', children = []) {
        (0, assert_1.default)(!this.isEmpty());
        return new parsetree_1.InternalParseTree(this.currentNonterminal, this.currentNonterminalName, pos, text, children, this.skipDepth > 0);
    }
    // requires !isEmpty()
    makeSuccessfulParse(fromPos, toPos, text = '', children = []) {
        (0, assert_1.default)(!this.isEmpty());
        return new SuccessfulParse(toPos, this.makeParseTree(fromPos, text, children));
    }
    // requires !isEmpty()
    makeFailedParse(atPos, expectedText) {
        (0, assert_1.default)(!this.isEmpty());
        return new FailedParse(atPos, this.currentNonterminalName, expectedText);
    }
}
exports.ParserState = ParserState;

},{"./parsetree":10,"./types":11,"assert":1}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalParseTree = void 0;
const display_1 = require("./display");
class InternalParseTree {
    constructor(name, nonterminalName, start, text, allChildren, isSkipped) {
        this.name = name;
        this.nonterminalName = nonterminalName;
        this.start = start;
        this.text = text;
        this.allChildren = allChildren;
        this.isSkipped = isSkipped;
        this.checkRep();
        Object.freeze(this.allChildren);
        // can't freeze(this) because of beneficent mutation delayed computation-with-caching for children() and childrenByName()
    }
    checkRep() {
        // FIXME
    }
    get end() {
        return this.start + this.text.length;
    }
    childrenByName(name) {
        if (!this._childrenByName) {
            this._childrenByName = new Map();
            for (const child of this.allChildren) {
                if (!this._childrenByName.has(child.name)) {
                    this._childrenByName.set(child.name, []);
                }
                this._childrenByName.get(child.name).push(child);
            }
            for (const childList of this._childrenByName.values()) {
                Object.freeze(childList);
            }
        }
        this.checkRep();
        return this._childrenByName.get(name) || [];
    }
    get children() {
        if (!this._children) {
            this._children = this.allChildren.filter(child => !child.isSkipped);
            Object.freeze(this._children);
        }
        this.checkRep();
        return this._children;
    }
    concat(that) {
        return new InternalParseTree(this.name, this.nonterminalName, this.start, this.text + that.text, this.allChildren.concat(that.allChildren), this.isSkipped && that.isSkipped);
    }
    toString() {
        let s = (this.isSkipped ? "@skip " : "") + this.nonterminalName;
        if (this.children.length == 0) {
            s += ":" + (0, display_1.escapeForReading)(this.text, "\"");
        }
        else {
            let t = "";
            let offsetReachedSoFar = this.start;
            for (const pt of this.allChildren) {
                if (offsetReachedSoFar < pt.start) {
                    // previous child and current child have a gap between them that must have been matched as a terminal
                    // in the rule for this node.  Insert it as a quoted string.
                    const terminal = this.text.substring(offsetReachedSoFar - this.start, pt.start - this.start);
                    t += "\n" + (0, display_1.escapeForReading)(terminal, "\"");
                }
                t += "\n" + pt;
                offsetReachedSoFar = pt.end;
            }
            if (offsetReachedSoFar < this.end) {
                // final child and end of this node have a gap -- treat it the same as above.
                const terminal = this.text.substring(offsetReachedSoFar - this.start);
                t += "\n" + (0, display_1.escapeForReading)(terminal, "\"");
            }
            const smallEnoughForOneLine = 50;
            if (t.length <= smallEnoughForOneLine) {
                s += " { " + t.substring(1) // remove initial newline
                    .replace("\n", ", ")
                    + " }";
            }
            else {
                s += " {" + (0, display_1.indent)(t, "  ") + "\n}";
            }
        }
        return s;
    }
}
exports.InternalParseTree = InternalParseTree;

},{"./display":8}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GrammarError = exports.InternalParseError = exports.ParseError = void 0;
const display_1 = require("./display");
/**
 * Exception thrown when a sequence of characters doesn't match a grammar
 */
class ParseError extends Error {
    constructor(message) {
        super(message);
    }
}
exports.ParseError = ParseError;
class InternalParseError extends ParseError {
    constructor(message, nonterminalName, expectedText, textBeingParsed, pos) {
        super((0, display_1.makeErrorMessage)(message, nonterminalName, expectedText, textBeingParsed, pos, "string being parsed"));
        this.nonterminalName = nonterminalName;
        this.expectedText = expectedText;
        this.textBeingParsed = textBeingParsed;
        this.pos = pos;
    }
}
exports.InternalParseError = InternalParseError;
class GrammarError extends ParseError {
    constructor(message, e) {
        super(e ? (0, display_1.makeErrorMessage)(message, e.nonterminalName, e.expectedText, e.textBeingParsed, e.pos, "grammar")
            : message);
    }
}
exports.GrammarError = GrammarError;

},{"./display":8}],12:[function(require,module,exports){
(function (__dirname){(function (){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.visualizeAsHtml = exports.visualizeAsUrl = void 0;
const compiler_1 = require("./compiler");
const parserlib_1 = require("../parserlib");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function emptyIterator() {
    return {
        next() { return { done: true }; }
    };
}
function getIterator(list) {
    return list[Symbol.iterator]();
}
const MAX_URL_LENGTH_FOR_DESKTOP_BROWSE = 2020;
/**
 * Visualizes a parse tree using a URL that can be pasted into your web browser.
 * @param parseTree tree to visualize
 * @param <NT> the enumeration of symbols in the parse tree's grammar
 * @return url that shows a visualization of the parse tree
 */
function visualizeAsUrl(parseTree, nonterminals) {
    const base = "http://web.mit.edu/6.031/www/parserlib/" + parserlib_1.VERSION + "/visualizer.html";
    const code = expressionForDisplay(parseTree, nonterminals);
    const url = base + '?code=' + fixedEncodeURIComponent(code);
    if (url.length > MAX_URL_LENGTH_FOR_DESKTOP_BROWSE) {
        // display alternate instructions to the console
        console.error('Visualization URL is too long for web browser and/or web server.\n'
            + 'Instead, go to ' + base + '\n'
            + 'and copy and paste this code into the textbox:\n'
            + code);
    }
    return url;
}
exports.visualizeAsUrl = visualizeAsUrl;
const visualizerHtmlFile = path_1.default.resolve(__dirname, '../../src/visualizer.html');
/**
 * Visualizes a parse tree as a string of HTML that can be displayed in a web browser.
 * @param parseTree tree to visualize
 * @param <NT> the enumeration of symbols in the parse tree's grammar
 * @return string of HTML that shows a visualization of the parse tree
 */
function visualizeAsHtml(parseTree, nonterminals) {
    const html = fs_1.default.readFileSync(visualizerHtmlFile, 'utf8');
    const code = expressionForDisplay(parseTree, nonterminals);
    const result = html.replace(/\/\/CODEHERE/, "return '" + fixedEncodeURIComponent(code) + "';");
    return result;
}
exports.visualizeAsHtml = visualizeAsHtml;
function expressionForDisplay(parseTree, nonterminals) {
    const { nonterminalToString } = (0, compiler_1.makeNonterminalConverters)(nonterminals);
    return forDisplay(parseTree, [], parseTree);
    function forDisplay(node, siblings, parent) {
        const name = nonterminalToString(node.name).toLowerCase();
        let s = "nd(";
        if (node.children.length == 0) {
            s += "\"" + name + "\",nd(\"'" + cleanString(node.text) + "'\"),";
        }
        else {
            s += "\"" + name + "\",";
            const children = node.allChildren.slice(); // make a copy for shifting
            const firstChild = children.shift();
            let childrenExpression = forDisplay(firstChild, children, node);
            if (node.start < firstChild.start) {
                // node and its first child have a gap between them that must have been matched as a terminal
                // in the rule for node.  Insert it as a quoted string.
                childrenExpression = precedeByTerminal(node.text.substring(0, firstChild.start - node.start), childrenExpression);
            }
            s += childrenExpression + ",";
        }
        if (siblings.length > 0) {
            const sibling = siblings.shift();
            let siblingExpression = forDisplay(sibling, siblings, parent);
            if (node.end < sibling.start) {
                // node and its sibling have a gap between them that must have been matched as a terminal
                // in the rule for parent.  Insert it as a quoted string.
                siblingExpression = precedeByTerminal(parent.text.substring(node.end - parent.start, sibling.start - parent.start), siblingExpression);
            }
            s += siblingExpression;
        }
        else {
            let siblingExpression = "uu";
            if (node.end < parent.end) {
                // There's a gap between the end of node and the end of its parent, which must be a terminal matched by parent.
                // Insert it as a quoted string.
                siblingExpression = precedeByTerminal(parent.text.substring(node.end - parent.start), siblingExpression);
            }
            s += siblingExpression;
        }
        if (node.isSkipped) {
            s += ",true";
        }
        s += ")";
        return s;
    }
    function precedeByTerminal(terminal, expression) {
        return "nd(\"'" + cleanString(terminal) + "'\", uu, " + expression + ")";
    }
    function cleanString(s) {
        let rvalue = s.replace(/\\/g, "\\\\");
        rvalue = rvalue.replace(/"/g, "\\\"");
        rvalue = rvalue.replace(/\n/g, "\\n");
        rvalue = rvalue.replace(/\r/g, "\\r");
        return rvalue;
    }
}
// from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
function fixedEncodeURIComponent(s) {
    return encodeURIComponent(s).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16));
}

}).call(this)}).call(this,"/node_modules/parserlib/internal")

},{"../parserlib":13,"./compiler":7,"fs":5,"path":14}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visualizeAsHtml = exports.visualizeAsUrl = exports.compile = exports.ParseError = exports.VERSION = void 0;
exports.VERSION = "3.2.3";
var types_1 = require("./internal/types");
Object.defineProperty(exports, "ParseError", { enumerable: true, get: function () { return types_1.ParseError; } });
;
var compiler_1 = require("./internal/compiler");
Object.defineProperty(exports, "compile", { enumerable: true, get: function () { return compiler_1.compile; } });
var visualizer_1 = require("./internal/visualizer");
Object.defineProperty(exports, "visualizeAsUrl", { enumerable: true, get: function () { return visualizer_1.visualizeAsUrl; } });
Object.defineProperty(exports, "visualizeAsHtml", { enumerable: true, get: function () { return visualizer_1.visualizeAsHtml; } });

},{"./internal/compiler":7,"./internal/types":11,"./internal/visualizer":12}],14:[function(require,module,exports){
(function (process){(function (){
// 'path' module extracted from Node.js v8.11.1 (only the posix part)
// transplited with Babel

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

function assertPath(path) {
  if (typeof path !== 'string') {
    throw new TypeError('Path must be a string. Received ' + JSON.stringify(path));
  }
}

// Resolves . and .. elements in a path with directory names
function normalizeStringPosix(path, allowAboveRoot) {
  var res = '';
  var lastSegmentLength = 0;
  var lastSlash = -1;
  var dots = 0;
  var code;
  for (var i = 0; i <= path.length; ++i) {
    if (i < path.length)
      code = path.charCodeAt(i);
    else if (code === 47 /*/*/)
      break;
    else
      code = 47 /*/*/;
    if (code === 47 /*/*/) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 /*.*/ || res.charCodeAt(res.length - 2) !== 46 /*.*/) {
          if (res.length > 2) {
            var lastSlashIndex = res.lastIndexOf('/');
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1) {
                res = '';
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
              }
              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = '';
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0)
            res += '/..';
          else
            res = '..';
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0)
          res += '/' + path.slice(lastSlash + 1, i);
        else
          res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === 46 /*.*/ && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

function _format(sep, pathObject) {
  var dir = pathObject.dir || pathObject.root;
  var base = pathObject.base || (pathObject.name || '') + (pathObject.ext || '');
  if (!dir) {
    return base;
  }
  if (dir === pathObject.root) {
    return dir + base;
  }
  return dir + sep + base;
}

var posix = {
  // path.resolve([from ...], to)
  resolve: function resolve() {
    var resolvedPath = '';
    var resolvedAbsolute = false;
    var cwd;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path;
      if (i >= 0)
        path = arguments[i];
      else {
        if (cwd === undefined)
          cwd = process.cwd();
        path = cwd;
      }

      assertPath(path);

      // Skip empty entries
      if (path.length === 0) {
        continue;
      }

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charCodeAt(0) === 47 /*/*/;
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);

    if (resolvedAbsolute) {
      if (resolvedPath.length > 0)
        return '/' + resolvedPath;
      else
        return '/';
    } else if (resolvedPath.length > 0) {
      return resolvedPath;
    } else {
      return '.';
    }
  },

  normalize: function normalize(path) {
    assertPath(path);

    if (path.length === 0) return '.';

    var isAbsolute = path.charCodeAt(0) === 47 /*/*/;
    var trailingSeparator = path.charCodeAt(path.length - 1) === 47 /*/*/;

    // Normalize the path
    path = normalizeStringPosix(path, !isAbsolute);

    if (path.length === 0 && !isAbsolute) path = '.';
    if (path.length > 0 && trailingSeparator) path += '/';

    if (isAbsolute) return '/' + path;
    return path;
  },

  isAbsolute: function isAbsolute(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47 /*/*/;
  },

  join: function join() {
    if (arguments.length === 0)
      return '.';
    var joined;
    for (var i = 0; i < arguments.length; ++i) {
      var arg = arguments[i];
      assertPath(arg);
      if (arg.length > 0) {
        if (joined === undefined)
          joined = arg;
        else
          joined += '/' + arg;
      }
    }
    if (joined === undefined)
      return '.';
    return posix.normalize(joined);
  },

  relative: function relative(from, to) {
    assertPath(from);
    assertPath(to);

    if (from === to) return '';

    from = posix.resolve(from);
    to = posix.resolve(to);

    if (from === to) return '';

    // Trim any leading backslashes
    var fromStart = 1;
    for (; fromStart < from.length; ++fromStart) {
      if (from.charCodeAt(fromStart) !== 47 /*/*/)
        break;
    }
    var fromEnd = from.length;
    var fromLen = fromEnd - fromStart;

    // Trim any leading backslashes
    var toStart = 1;
    for (; toStart < to.length; ++toStart) {
      if (to.charCodeAt(toStart) !== 47 /*/*/)
        break;
    }
    var toEnd = to.length;
    var toLen = toEnd - toStart;

    // Compare paths to find the longest common path from root
    var length = fromLen < toLen ? fromLen : toLen;
    var lastCommonSep = -1;
    var i = 0;
    for (; i <= length; ++i) {
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === 47 /*/*/) {
            // We get here if `from` is the exact base path for `to`.
            // For example: from='/foo/bar'; to='/foo/bar/baz'
            return to.slice(toStart + i + 1);
          } else if (i === 0) {
            // We get here if `from` is the root
            // For example: from='/'; to='/foo'
            return to.slice(toStart + i);
          }
        } else if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === 47 /*/*/) {
            // We get here if `to` is the exact base path for `from`.
            // For example: from='/foo/bar/baz'; to='/foo/bar'
            lastCommonSep = i;
          } else if (i === 0) {
            // We get here if `to` is the root.
            // For example: from='/foo'; to='/'
            lastCommonSep = 0;
          }
        }
        break;
      }
      var fromCode = from.charCodeAt(fromStart + i);
      var toCode = to.charCodeAt(toStart + i);
      if (fromCode !== toCode)
        break;
      else if (fromCode === 47 /*/*/)
        lastCommonSep = i;
    }

    var out = '';
    // Generate the relative path based on the path difference between `to`
    // and `from`
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd || from.charCodeAt(i) === 47 /*/*/) {
        if (out.length === 0)
          out += '..';
        else
          out += '/..';
      }
    }

    // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts
    if (out.length > 0)
      return out + to.slice(toStart + lastCommonSep);
    else {
      toStart += lastCommonSep;
      if (to.charCodeAt(toStart) === 47 /*/*/)
        ++toStart;
      return to.slice(toStart);
    }
  },

  _makeLong: function _makeLong(path) {
    return path;
  },

  dirname: function dirname(path) {
    assertPath(path);
    if (path.length === 0) return '.';
    var code = path.charCodeAt(0);
    var hasRoot = code === 47 /*/*/;
    var end = -1;
    var matchedSlash = true;
    for (var i = path.length - 1; i >= 1; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          if (!matchedSlash) {
            end = i;
            break;
          }
        } else {
        // We saw the first non-path separator
        matchedSlash = false;
      }
    }

    if (end === -1) return hasRoot ? '/' : '.';
    if (hasRoot && end === 1) return '//';
    return path.slice(0, end);
  },

  basename: function basename(path, ext) {
    if (ext !== undefined && typeof ext !== 'string') throw new TypeError('"ext" argument must be a string');
    assertPath(path);

    var start = 0;
    var end = -1;
    var matchedSlash = true;
    var i;

    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
      if (ext.length === path.length && ext === path) return '';
      var extIdx = ext.length - 1;
      var firstNonSlashEnd = -1;
      for (i = path.length - 1; i >= 0; --i) {
        var code = path.charCodeAt(i);
        if (code === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else {
          if (firstNonSlashEnd === -1) {
            // We saw the first non-path separator, remember this index in case
            // we need it if the extension ends up not matching
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0) {
            // Try to match the explicit extension
            if (code === ext.charCodeAt(extIdx)) {
              if (--extIdx === -1) {
                // We matched the extension, so mark this as the end of our path
                // component
                end = i;
              }
            } else {
              // Extension does not match, so our result is the entire path
              // component
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }

      if (start === end) end = firstNonSlashEnd;else if (end === -1) end = path.length;
      return path.slice(start, end);
    } else {
      for (i = path.length - 1; i >= 0; --i) {
        if (path.charCodeAt(i) === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else if (end === -1) {
          // We saw the first non-path separator, mark this as the end of our
          // path component
          matchedSlash = false;
          end = i + 1;
        }
      }

      if (end === -1) return '';
      return path.slice(start, end);
    }
  },

  extname: function extname(path) {
    assertPath(path);
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;
    for (var i = path.length - 1; i >= 0; --i) {
      var code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1)
            startDot = i;
          else if (preDotState !== 1)
            preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      return '';
    }
    return path.slice(startDot, end);
  },

  format: function format(pathObject) {
    if (pathObject === null || typeof pathObject !== 'object') {
      throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
    }
    return _format('/', pathObject);
  },

  parse: function parse(path) {
    assertPath(path);

    var ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (path.length === 0) return ret;
    var code = path.charCodeAt(0);
    var isAbsolute = code === 47 /*/*/;
    var start;
    if (isAbsolute) {
      ret.root = '/';
      start = 1;
    } else {
      start = 0;
    }
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    var i = path.length - 1;

    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;

    // Get non-dir info
    for (; i >= start; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1) startDot = i;else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
    // We saw a non-dot character immediately before the dot
    preDotState === 0 ||
    // The (right-most) trimmed path component is exactly '..'
    preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      if (end !== -1) {
        if (startPart === 0 && isAbsolute) ret.base = ret.name = path.slice(1, end);else ret.base = ret.name = path.slice(startPart, end);
      }
    } else {
      if (startPart === 0 && isAbsolute) {
        ret.name = path.slice(1, startDot);
        ret.base = path.slice(1, end);
      } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
      }
      ret.ext = path.slice(startDot, end);
    }

    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);else if (isAbsolute) ret.dir = '/';

    return ret;
  },

  sep: '/',
  delimiter: ':',
  win32: null,
  posix: null
};

posix.posix = posix;

module.exports = posix;

}).call(this)}).call(this,require('_process'))

},{"_process":15}],15:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientFromPuzzle = exports.Client = void 0;
const Parser_1 = require("./Parser");
class Client {
    /**
     * AF(puzzle) = The current Puzzle puzzle the client is playing on
     *
     * Representation invariant:
     *  - True
     *
     * Safety from rep exposure:
     *  - The field puzzle is private, immutable, but isn't readonly so it can be reassigned using functions in the class to update the game state
     */
    constructor(puzzle) {
        this.puzzle = puzzle;
    }
    /**
     * Updates the game state of the client by changing the status
     * of the space at index to newStatus. If the move is invalid,
     * then the error message thrown by puzzle will be shown
     * in the console (may want to change this later since we want to show
     * the user the error, not sure if this does this correctly)
     *
     * @param index The index of the space we want to change the status of
     * @param newStatus The status we want to give to this space
     * @returns nothing or a string status method
     */
    makeMove(index, newStatus) {
        try {
            this.puzzle = this.puzzle.changeStatus(index, newStatus);
        }
        catch (error) {
            return "This move is not valid";
        }
    }
    /**
     * Checks if the puzzle is solved, and returns a Boolean
     * to indicate whether it is solved or not
     *
     * @returns True if the puzzle is solved, false otherwise
     */
    isSolved() { return this.puzzle.isSolved; }
    /**
     * Returns the region associated with the index
     *
     * @param index The index we want to get the column of
     * @returns the region associated with the index
     */
    getRegion(index) { return this.puzzle.getRegion(index); }
    /**
     * @returns the toString of the Client's current puzzle
     */
    toString() { return this.puzzle.toString(); }
}
exports.Client = Client;
/**
 * Returns an instance of Client with a blank puzzle
 * corresponding to the file filename
 *
 * @param puzzleString the toString of the puzzle we want
 * @returns new instance of client based on the filename
 */
function clientFromPuzzle(puzzleString) { return new Client((0, Parser_1.parsePuzzle)(puzzleString)); }
exports.clientFromPuzzle = clientFromPuzzle;

},{"./Parser":17}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePuzzle = void 0;
const Puzzle_1 = require("./Puzzle");
const parserlib_1 = require("parserlib");
// the grammar
const grammar = `
@skip whitespace {
    puzzle ::= size region+;
    size ::= number 'x' number '\\n';
    region ::= cell* '|' cell+ '\\n';
}
number ::= [1-9][0-9]*;
cell ::= number ',' number;
whitespace ::= [ \\t\\r\\.]+;
`;
// the nonterminals of the grammar
var PuzzleGrammar;
(function (PuzzleGrammar) {
    PuzzleGrammar[PuzzleGrammar["Size"] = 0] = "Size";
    PuzzleGrammar[PuzzleGrammar["Puzzle"] = 1] = "Puzzle";
    PuzzleGrammar[PuzzleGrammar["Cell"] = 2] = "Cell";
    PuzzleGrammar[PuzzleGrammar["Text"] = 3] = "Text";
    PuzzleGrammar[PuzzleGrammar["Number"] = 4] = "Number";
    PuzzleGrammar[PuzzleGrammar["Whitespace"] = 5] = "Whitespace";
    PuzzleGrammar[PuzzleGrammar["Region"] = 6] = "Region";
})(PuzzleGrammar || (PuzzleGrammar = {}));
// compile the grammar into a parser
const parser = (0, parserlib_1.compile)(grammar, PuzzleGrammar, PuzzleGrammar.Puzzle);
/**
 * Parse a string into a Puzzle.
 *
 * @param puzzleString string to parse
 * @returns Puzzle parsed from the string
 * @throws UnableToParseException if the string doesn't match the Puzzle grammar
 */
function parsePuzzle(puzzleString) {
    // parse the example into a parse tree
    let cleanedPuzzleString = '';
    for (const line of puzzleString.split('\n')) {
        if (line && line[0] !== '#')
            cleanedPuzzleString = cleanedPuzzleString.concat(line, '\n');
    }
    const parseTree = parser.parse(cleanedPuzzleString);
    return makeAbstractSyntaxTree(parseTree);
}
exports.parsePuzzle = parsePuzzle;
/**
 * Convert a parse tree into an abstract syntax tree.
 *
 * @param parseTree constructed according to the grammar in Puzzle.g
 * @returns abstract syntax tree corresponding to the parseTree
 */
function makeAbstractSyntaxTree(parseTree) {
    switch (parseTree.name) {
        case PuzzleGrammar.Puzzle: // puzzle ::= size regions+;
            {
                const size = parseTree.children[0];
                if (!size)
                    throw new Error("Corrupt puzzle file");
                const [puzzleW, puzzleH] = [size.children[0], size.children[1]];
                if (!puzzleW || !puzzleH)
                    throw new Error("Corrupt puzzle file");
                const w = Number.parseInt(puzzleW.text);
                const h = Number.parseInt(puzzleH.text);
                const regions = parseTree.children.slice(1);
                const cellToRegion = new Map();
                const cellToSpaceStatus = new Map();
                for (let i = 0; i < regions.length; i++) {
                    const region = regions[i];
                    if (!region)
                        throw new Error("Corrupt puzzle file");
                    const cells = region.children;
                    for (const cell of cells) {
                        const [row, col] = cell.children;
                        if (!row || !col)
                            throw new Error("Corrupt puzzle file");
                        const index = (Number.parseInt(row.text) - 1) * h + (Number.parseInt(col.text) - 1);
                        cellToRegion.set(index, i);
                        cellToSpaceStatus.set(index, Puzzle_1.SpaceStatus.Empty);
                    }
                }
                return new Puzzle_1.Puzzle(cellToRegion, cellToSpaceStatus, h);
            }
        default:
            throw new Error("should never get here");
    }
}

},{"./Puzzle":18,"parserlib":13}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Puzzle = exports.ModifyValue = exports.SpaceStatus = void 0;
/*** Global Constants ***/
const REQUIRED_STARS = 2;
/*** Enums ***/
var SpaceStatus;
(function (SpaceStatus) {
    SpaceStatus[SpaceStatus["Empty"] = 0] = "Empty";
    SpaceStatus[SpaceStatus["Dot"] = 1] = "Dot";
    SpaceStatus[SpaceStatus["Star"] = 2] = "Star";
})(SpaceStatus = exports.SpaceStatus || (exports.SpaceStatus = {}));
var ModifyValue;
(function (ModifyValue) {
    ModifyValue[ModifyValue["Increment"] = 0] = "Increment";
    ModifyValue[ModifyValue["Decrement"] = 1] = "Decrement";
    ModifyValue[ModifyValue["Constant"] = 2] = "Constant";
})(ModifyValue = exports.ModifyValue || (exports.ModifyValue = {}));
class Puzzle {
    /**
     * AF(rowToStars, columnToStars, regionToStars,
     *    regionToCells, isSolved, cellToRegion,
     *    cellToSpaceStatus) =  The puzzle, where rowToStars maps each row to the number of stars in that row, columnToStars maps each column to the number
     *                          of stars in that column, regionToStars maps each region to the number of stars in that region, regionToIndeces maps each region to the
     *                          indeces that region encloses, isSolved is true if the puzzle is solved, false otherwise, indexToRegion maps each index to the region it belongs to,
     *                          and indexToSpaceStatus maps each index to that space's status (empty, has a dot, has a star).
     *
     * Representation invariant:
     *  - Every value in rowToStars, colToStars, and regionToStars is <= 2 and > 0
     *
     * Safety from rep exposure:
     *  - All fields are private, readonly, and no reference to any of the mutable fields is given by any of the functions
     */
    constructor(cellToRegion, cellToSpaceStatus, puzzleSize) {
        this.cellToRegion = cellToRegion;
        this.cellToSpaceStatus = cellToSpaceStatus;
        this.puzzleSize = puzzleSize;
        this.rowToStars = new Map();
        this.columnToStars = new Map();
        this.regionToStars = new Map();
        this.regionToCells = new Map();
        this.isSolved = true;
        for (let i = 0; i < 2; i++) {
            for (const [cell, status] of cellToSpaceStatus) {
                const region = cellToRegion.get(cell);
                const [row, col] = this._coordinates(cell);
                if (region === undefined)
                    throw new Error("region does not exist");
                let numRowStars = this.rowToStars.get(row);
                let numColStars = this.columnToStars.get(col);
                let numRegionStars = this.regionToStars.get(region);
                if (numRowStars === undefined)
                    numRowStars = 0;
                if (numColStars === undefined)
                    numColStars = 0;
                if (numRegionStars === undefined)
                    numRegionStars = 0;
                if (status === SpaceStatus.Star) {
                    numRowStars += 1;
                    numColStars += 1;
                    numRegionStars += 1;
                }
                if (i === 0) {
                    this.rowToStars.set(row, numRowStars);
                    this.columnToStars.set(col, numColStars);
                    this.regionToStars.set(region, numRegionStars);
                }
                else {
                    if (numRowStars < REQUIRED_STARS || numColStars < REQUIRED_STARS || numRegionStars < REQUIRED_STARS) {
                        this.isSolved = false;
                        break;
                    }
                }
            }
        }
        for (const [cell, region] of this.cellToRegion) {
            const cellsEnclosedByRegion = this.regionToCells.get(region);
            if (!cellsEnclosedByRegion)
                this.regionToCells.set(region, [cell]);
            else {
                const cellSpaceStatus = cellToSpaceStatus.get(cell);
                if (cellSpaceStatus === SpaceStatus.Star)
                    cellsEnclosedByRegion.unshift(cell);
                else
                    cellsEnclosedByRegion.push(cell);
            }
        }
        this.checkRep();
    }
    /**
     * Checks to ensure the RI hasn't been violated
     *
     * @throws Error if the RI has been violated
     */
    checkRep() {
        for (const [region, regionStars] of this.regionToStars) {
            const rowStars = this.rowToStars.get(region);
            const colStars = this.columnToStars.get(region);
            if (rowStars === undefined || regionStars === undefined || colStars === undefined)
                throw new Error("Something here is wrong");
            if (rowStars > REQUIRED_STARS || rowStars < 0)
                throw Error("The RI has been violated: expected rowStars <= 2");
            if (colStars > REQUIRED_STARS || colStars < 0)
                throw Error("The RI has been violated: expected colStars <= 2");
            if (regionStars > REQUIRED_STARS || regionStars < 0)
                throw Error("The RI has been violated: expected regionStars <= 2");
        }
    }
    /**
     * Modify's the star maps that this index belongs to
     *
     * @param cell The 1D cell index of the board space we want to use to modify the stars map
     * @param increment true if we are incrementing each map, false otherwise
     */
    modifyStarsMaps(cell, increment) {
        let valueChange = 0;
        if (increment === ModifyValue.Increment)
            valueChange = 1;
        else if (increment === ModifyValue.Decrement)
            valueChange = -1;
        const region = this.cellToRegion.get(cell);
        const [row, col] = this._coordinates(cell);
        if (region === undefined)
            throw new Error("region does not exist");
        const numRowStars = this.rowToStars.get(row);
        const numColStars = this.columnToStars.get(col);
        const numRegionStars = this.regionToStars.get(region);
        if (numRowStars === undefined || numColStars === undefined || numRegionStars === undefined)
            throw new Error("something went wrong with star count");
        this.rowToStars.set(row, numRowStars + valueChange);
        this.columnToStars.set(col, numColStars + valueChange);
        this.regionToStars.set(region, numRegionStars + valueChange);
    }
    /**
     * Returns the region associated with the index
     *
     * @param cell The 1D cell index we want to get the column of
     * @returns the region associated with the index
     */
    getRegion(cell) {
        const region = this.cellToRegion.get(cell);
        if (region === undefined)
            throw new Error("region does not exist");
        return region;
    }
    /**
     * Changes the SpaceStatus of the space corresponding to
     * cell to status by returning a new puzzle with this change
     *
     * @param cell The 1D cell index at which we want to modify's status
     * @param newStatus The newStatus we want to assign to this board space
     * @returns A new puzzle based on this puzzle, with the only
     *          change being a the board space's SpaceStatus
     *          corresponding to index changing to status
     * @throws Error if changing this board space's SpaceStatus to star, and
     *         doing this would conflict with the rule of only having two
     *         stars in each column, row, or region
     */
    changeStatus(cell, newStatus) {
        let modifyValue;
        let revertValue;
        const currStatus = this.cellToSpaceStatus.get(cell);
        switch (currStatus) {
            case SpaceStatus.Dot || SpaceStatus.Empty: {
                if (newStatus === SpaceStatus.Star)
                    [modifyValue, revertValue] = [ModifyValue.Increment, ModifyValue.Decrement];
                break;
            }
            case SpaceStatus.Star: {
                if (newStatus === SpaceStatus.Dot || newStatus === SpaceStatus.Empty)
                    [modifyValue, revertValue] = [ModifyValue.Decrement, ModifyValue.Increment];
                break;
            }
            default: break;
        }
        if (modifyValue !== undefined && revertValue !== undefined) {
            this.modifyStarsMaps(cell, modifyValue);
            try {
                this.checkRep();
            }
            catch (error) {
                this.modifyStarsMaps(cell, revertValue);
                throw Error("Making this modification would lead to an invalid board");
            }
            this.modifyStarsMaps(cell, revertValue);
        }
        const newCellToRegion = new Map(this.cellToRegion);
        const newCellToSpaceStatus = new Map(this.cellToSpaceStatus);
        newCellToSpaceStatus.set(cell, newStatus);
        return new Puzzle(newCellToRegion, newCellToSpaceStatus, this.puzzleSize);
    }
    /**
     * Gives the string representation of the puzzle,
     * the string representation described in the returns section
     *
     * @returns a string representation of the puzzle,
     *          with the same format as the kd-1-1-1.starb file
     *          and the kd-6-31-6.starb file
     */
    toString() {
        let returnString = `${this.puzzleSize}x${this.puzzleSize}\n`;
        for (let region = 0; region < this.puzzleSize; region++) {
            let pipeInserted = false;
            const cellsEnclosedByRegion = this.regionToCells.get(region);
            if (!cellsEnclosedByRegion)
                continue;
            for (const cell of cellsEnclosedByRegion) {
                const cellSpaceStatus = this.cellToSpaceStatus.get(cell);
                let [row, col] = this._coordinates(cell);
                row += 1;
                col += 1;
                if (cellSpaceStatus !== SpaceStatus.Star && !pipeInserted) {
                    returnString += `| `;
                    pipeInserted = true;
                }
                returnString += `${row},${col} `;
            }
            returnString += '\n';
        }
        return returnString;
    }
    /*** Helper Methods ***/
    /**
     * Retrives the 2D coordinates of a cell given the 1D index coordinate
     *
     * @param cell the 1D index number of the cell
     * @returns row, col of the 2D coordinates of a cell
     */
    _coordinates(cell) {
        const row = Math.floor(cell / this.puzzleSize);
        const col = cell % this.puzzleSize;
        return [row, col];
    }
}
exports.Puzzle = Puzzle;

},{}],19:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const Puzzle_1 = require("./Puzzle");
const Client_1 = require("./Client");
/*** Global Constants ***/
const PUZZLE_SIZE = 10;
let STATES = new Array(PUZZLE_SIZE ** 2).fill(Puzzle_1.SpaceStatus.Empty);
const CANVAS = document.getElementById('canvas') ?? assert_1.default.fail('missing drawing canvas');
const PUZZLE_NAME = document.getElementById('puzzleName') ?? assert_1.default.fail('missing drawing canvas');
const MESSAGE = document.getElementById('message-section') ?? assert_1.default.fail('missing message canvas');
const RULES = document.getElementById('rules') ?? assert_1.default.fail('missing message canvas');
const RULES_BUTTON = document.getElementById('button-new-puzzle') ?? assert_1.default.fail('missing button canvas');
const CHECK_CANVAS_BUTTON = document.getElementById('button-check-puzzle') ?? assert_1.default.fail('missing button canvas');
const COLORS = ['#47DE9A', '#50BBFA', '#FAD258', '#FFFFFF', '#FF8652', '#E0DF80', '#A780E0', '#F69BFA', '#E5E5E5', '#5BF5DB'];
const CONTEXT = CANVAS.getContext('2d');
let CLIENT = undefined;
(0, assert_1.default)(CONTEXT, 'unable to get canvas drawing context');
const WIDTH = CONTEXT.canvas.clientHeight;
const HEIGHT = CONTEXT.canvas.clientHeight;
PUZZLE_NAME.addEventListener('change', async () => { await _updatePuzzleName(); newPuzzle(); });
RULES.addEventListener("click", () => { RULES.style.display = "none"; });
// when the user clicks on the drawing canvas...
CANVAS.addEventListener('click', (event) => { makeMove(event.offsetX, event.offsetY); });
// when the user clicks on the request new puzzle button...
RULES_BUTTON.addEventListener('click', () => {
    RULES.style.display = "flex";
    RULES.style.left = "auto";
    RULES.style.bottom = "auto";
    RULES.style.height = "300px";
    RULES.style.width = "700px";
    RULES.style.background = "#fff";
    RULES.style.color = "#222021";
    setTimeout(function () { MESSAGE.style.display = "none"; }, 5000);
});
// checking puzzle button
CHECK_CANVAS_BUTTON.addEventListener('click', () => {
    (0, assert_1.default)(CLIENT, 'no puzzle selected');
    if (CLIENT.isSolved()) {
        MESSAGE.innerHTML = "You won!";
    }
    else
        MESSAGE.innerHTML = '<p class="margin-0">Your puzzle is not fully solved yet ...</p><p class="margin-0">Chug Away!</p>';
    MESSAGE.style.display = "flex";
    MESSAGE.style.left = "auto";
    MESSAGE.style.bottom = "auto";
    MESSAGE.style.height = "100px";
    MESSAGE.style.width = "400px";
    setTimeout(function () { MESSAGE.style.display = "none"; }, 5000);
});
/**
 * Makes a move by drawing nothing a dot or a star based on the current state of the clicked cell
 *
 * @param x position of the cell in the canvas
 * @param y position of the cell in the canvas
 */
function makeMove(x, y) {
    let text;
    let newStatus;
    const cell = _cell(x, y);
    const [i, j] = [(cell % PUZZLE_SIZE) * (WIDTH / PUZZLE_SIZE), Math.floor(cell / PUZZLE_SIZE) * (HEIGHT / PUZZLE_SIZE)];
    const [w, h] = [WIDTH / PUZZLE_SIZE, HEIGHT / PUZZLE_SIZE];
    (0, assert_1.default)(CLIENT);
    (0, assert_1.default)(CONTEXT, 'unable to get canvas drawing context');
    switch (STATES[cell]) {
        case Puzzle_1.SpaceStatus.Empty: {
            newStatus = Puzzle_1.SpaceStatus.Dot;
            text = '⚫';
            break;
        }
        case Puzzle_1.SpaceStatus.Dot: {
            newStatus = Puzzle_1.SpaceStatus.Star;
            text = '🌟';
            break;
        }
        case Puzzle_1.SpaceStatus.Star:
            newStatus = Puzzle_1.SpaceStatus.Empty;
            break;
        default: break;
    }
    const region = CLIENT.getRegion(cell);
    const color = COLORS[region];
    if (newStatus !== undefined) {
        const message = CLIENT.makeMove(cell, newStatus);
        if (message !== undefined) {
            MESSAGE.innerHTML = message;
            MESSAGE.style.display = "flex";
            MESSAGE.style.left = "10px";
            MESSAGE.style.bottom = "10px";
            MESSAGE.style.height = "60px";
            MESSAGE.style.width = "300px";
            setTimeout(function () { MESSAGE.style.display = "none"; }, 5000);
            return;
        }
        STATES[cell] = newStatus;
    }
    CONTEXT.clearRect(i, j, w, h);
    if (color !== undefined)
        CONTEXT.fillStyle = color;
    CONTEXT.fillRect(i, j, w, h);
    CONTEXT.font = CONTEXT.font.replace(/\d+px/, "30px");
    if (text !== undefined)
        CONTEXT.fillText(text, i + WIDTH / PUZZLE_SIZE / 5, j + HEIGHT / PUZZLE_SIZE / 1.5, w);
    // IDK if this should be here, gotta keep it in mind. 
    CONTEXT.strokeStyle = "#081A33";
    CONTEXT.lineWidth = 0.3;
    CONTEXT.strokeRect(i, j, WIDTH / PUZZLE_SIZE, HEIGHT / PUZZLE_SIZE);
}
/**
 * Construct a new Puzzle
 */
function newPuzzle() {
    STATES = new Array(PUZZLE_SIZE ** 2).fill(Puzzle_1.SpaceStatus.Empty);
    (0, assert_1.default)(CONTEXT, 'unable to get canvas drawing context');
    for (let i = 0; i < WIDTH; i += WIDTH / PUZZLE_SIZE) {
        for (let j = 0; j < HEIGHT; j += HEIGHT / PUZZLE_SIZE) {
            const cell = _cell(i, j);
            (0, assert_1.default)(CLIENT, "client is bad");
            const region = CLIENT.getRegion(cell);
            const color = COLORS[region];
            (0, assert_1.default)(color, "color is bad");
            CONTEXT.fillStyle = color;
            CONTEXT.fillRect(i, j, WIDTH / PUZZLE_SIZE, HEIGHT / PUZZLE_SIZE);
            CONTEXT.strokeStyle = "#081A33";
            CONTEXT.lineWidth = 0.3;
            CONTEXT.strokeRect(i, j, WIDTH / PUZZLE_SIZE, HEIGHT / PUZZLE_SIZE);
        }
    }
}
/*** Helper Functions ***/
/**
 * Retrieve the 1D cell puzzle index of a cell from the 2D canvas coordinates of the cell
 *
 * @param x position of the cell in the canvas
 * @param y position of the cell in the canvas
 * @returns 1D cell index of the cell in the puzzle
 */
function _cell(x, y) { return Math.floor(x / (WIDTH / PUZZLE_SIZE)) + PUZZLE_SIZE * Math.floor(y / (HEIGHT / PUZZLE_SIZE)); }
/**
 * Updates the puzzle name
 *
 * @param puzzleName the name of the selected puzzle
 */
async function _updatePuzzleName(puzzleName = undefined) {
    if (puzzleName === undefined)
        puzzleName = PUZZLE_NAME.options[PUZZLE_NAME.options.selectedIndex]?.value;
    const response = await fetch(`http://localhost:8789/get/${puzzleName}.starb`);
    const puzzleString = await response.text();
    CLIENT = (0, Client_1.clientFromPuzzle)(puzzleString);
}
/**
 * Set up the page.
 */
async function main() {
    await _updatePuzzleName(PUZZLE_NAME.options[0]?.value);
    newPuzzle();
    RULES_BUTTON.click();
}
void main();

},{"./Client":16,"./Puzzle":18,"assert":1}]},{},[19])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYXNzZXJ0L2Fzc2VydC5qcyIsIm5vZGVfbW9kdWxlcy9hc3NlcnQvbm9kZV9tb2R1bGVzL2luaGVyaXRzL2luaGVyaXRzX2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvYXNzZXJ0L25vZGVfbW9kdWxlcy91dGlsL3N1cHBvcnQvaXNCdWZmZXJCcm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2Fzc2VydC9ub2RlX21vZHVsZXMvdXRpbC91dGlsLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbGliL19lbXB0eS5qcyIsIm5vZGVfbW9kdWxlcy9vYmplY3QtYXNzaWduL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3BhcnNlcmxpYi9pbnRlcm5hbC9jb21waWxlci5qcyIsIm5vZGVfbW9kdWxlcy9wYXJzZXJsaWIvaW50ZXJuYWwvZGlzcGxheS5qcyIsIm5vZGVfbW9kdWxlcy9wYXJzZXJsaWIvaW50ZXJuYWwvcGFyc2VyLmpzIiwibm9kZV9tb2R1bGVzL3BhcnNlcmxpYi9pbnRlcm5hbC9wYXJzZXRyZWUuanMiLCJub2RlX21vZHVsZXMvcGFyc2VybGliL2ludGVybmFsL3R5cGVzLmpzIiwibm9kZV9tb2R1bGVzL3BhcnNlcmxpYi9pbnRlcm5hbC92aXN1YWxpemVyLmpzIiwibm9kZV9tb2R1bGVzL3BhcnNlcmxpYi9wYXJzZXJsaWIuanMiLCJub2RlX21vZHVsZXMvcGF0aC1icm93c2VyaWZ5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsInNyYy9DbGllbnQudHMiLCJzcmMvUGFyc2VyLnRzIiwic3JjL1B1enpsZS50cyIsInNyYy9TdGFyYkNsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMxZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMxa0JBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25UQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNsSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNqaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDeExBLHFDQUFxQztBQUdyQyxNQUFhLE1BQU07SUFDZjs7Ozs7Ozs7T0FRRztJQUVILFlBQTJCLE1BQWM7UUFBZCxXQUFNLEdBQU4sTUFBTSxDQUFRO0lBQUcsQ0FBQztJQUU3Qzs7Ozs7Ozs7OztPQVVHO0lBQ0ksUUFBUSxDQUFD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QUFZLEdBQUcsTUFBTSxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDM0MsTUFBTSxHQUFHLElBQUEseUJBQWdCLEVBQUMsWUFBWSxDQUFDLENBQUM7QUFDNUMsQ0FBQztBQUVEOztHQUVHO0FBQ0gsS0FBSyxVQUFVLElBQUk7SUFDZixNQUFNLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDdkQsU0FBUyxFQUFFLENBQUM7SUFDWixZQUFZLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDekIsQ0FBQztBQUVELEtBQUssSUFBSSxFQUFFLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIndXNlIHN0cmljdCc7XG5cbnZhciBvYmplY3RBc3NpZ24gPSByZXF1aXJlKCdvYmplY3QtYXNzaWduJyk7XG5cbi8vIGNvbXBhcmUgYW5kIGlzQnVmZmVyIHRha2VuIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXIvYmxvYi82ODBlOWU1ZTQ4OGYyMmFhYzI3NTk5YTU3ZGM4NDRhNjMxNTkyOGRkL2luZGV4LmpzXG4vLyBvcmlnaW5hbCBub3RpY2U6XG5cbi8qIVxuICogVGhlIGJ1ZmZlciBtb2R1bGUgZnJvbSBub2RlLmpzLCBmb3IgdGhlIGJyb3dzZXIuXG4gKlxuICogQGF1dGhvciAgIEZlcm9zcyBBYm91a2hhZGlqZWggPGZlcm9zc0BmZXJvc3Mub3JnPiA8aHR0cDovL2Zlcm9zcy5vcmc+XG4gKiBAbGljZW5zZSAgTUlUXG4gKi9cbmZ1bmN0aW9uIGNvbXBhcmUoYSwgYikge1xuICBpZiAoYSA9PT0gYikge1xuICAgIHJldHVybiAwO1xuICB9XG5cbiAgdmFyIHggPSBhLmxlbmd0aDtcbiAgdmFyIHkgPSBiLmxlbmd0aDtcblxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gTWF0aC5taW4oeCwgeSk7IGkgPCBsZW47ICsraSkge1xuICAgIGlmIChhW2ldICE9PSBiW2ldKSB7XG4gICAgICB4ID0gYVtpXTtcbiAgICAgIHkgPSBiW2ldO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgaWYgKHggPCB5KSB7XG4gICAgcmV0dXJuIC0xO1xuICB9XG4gIGlmICh5IDwgeCkge1xuICAgIHJldHVybiAxO1xuICB9XG4gIHJldHVybiAwO1xufVxuZnVuY3Rpb24gaXNCdWZmZXIoYikge1xuICBpZiAoZ2xvYmFsLkJ1ZmZlciAmJiB0eXBlb2YgZ2xvYmFsLkJ1ZmZlci5pc0J1ZmZlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBnbG9iYWwuQnVmZmVyLmlzQnVmZmVyKGIpO1xuICB9XG4gIHJldHVybiAhIShiICE9IG51bGwgJiYgYi5faXNCdWZmZXIpO1xufVxuXG4vLyBiYXNlZCBvbiBub2RlIGFzc2VydCwgb3JpZ2luYWwgbm90aWNlOlxuLy8gTkI6IFRoZSBVUkwgdG8gdGhlIENvbW1vbkpTIHNwZWMgaXMga2VwdCBqdXN0IGZvciB0cmFkaXRpb24uXG4vLyAgICAgbm9kZS1hc3NlcnQgaGFzIGV2b2x2ZWQgYSBsb3Qgc2luY2UgdGhlbiwgYm90aCBpbiBBUEkgYW5kIGJlaGF2aW9yLlxuXG4vLyBodHRwOi8vd2lraS5jb21tb25qcy5vcmcvd2lraS9Vbml0X1Rlc3RpbmcvMS4wXG4vL1xuLy8gVEhJUyBJUyBOT1QgVEVTVEVEIE5PUiBMSUtFTFkgVE8gV09SSyBPVVRTSURFIFY4IVxuLy9cbi8vIE9yaWdpbmFsbHkgZnJvbSBuYXJ3aGFsLmpzIChodHRwOi8vbmFyd2hhbGpzLm9yZylcbi8vIENvcHlyaWdodCAoYykgMjAwOSBUaG9tYXMgUm9iaW5zb24gPDI4MG5vcnRoLmNvbT5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSAnU29mdHdhcmUnKSwgdG9cbi8vIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlXG4vLyByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Jcbi8vIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgJ0FTIElTJywgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOXG4vLyBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OXG4vLyBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxudmFyIHV0aWwgPSByZXF1aXJlKCd1dGlsLycpO1xudmFyIGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG52YXIgcFNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xudmFyIGZ1bmN0aW9uc0hhdmVOYW1lcyA9IChmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBmdW5jdGlvbiBmb28oKSB7fS5uYW1lID09PSAnZm9vJztcbn0oKSk7XG5mdW5jdGlvbiBwVG9TdHJpbmcgKG9iaikge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaik7XG59XG5mdW5jdGlvbiBpc1ZpZXcoYXJyYnVmKSB7XG4gIGlmIChpc0J1ZmZlcihhcnJidWYpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmICh0eXBlb2YgZ2xvYmFsLkFycmF5QnVmZmVyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmICh0eXBlb2YgQXJyYXlCdWZmZXIuaXNWaWV3ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIEFycmF5QnVmZmVyLmlzVmlldyhhcnJidWYpO1xuICB9XG4gIGlmICghYXJyYnVmKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmIChhcnJidWYgaW5zdGFuY2VvZiBEYXRhVmlldykge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGlmIChhcnJidWYuYnVmZmVyICYmIGFycmJ1Zi5idWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cbi8vIDEuIFRoZSBhc3NlcnQgbW9kdWxlIHByb3ZpZGVzIGZ1bmN0aW9ucyB0aGF0IHRocm93XG4vLyBBc3NlcnRpb25FcnJvcidzIHdoZW4gcGFydGljdWxhciBjb25kaXRpb25zIGFyZSBub3QgbWV0LiBUaGVcbi8vIGFzc2VydCBtb2R1bGUgbXVzdCBjb25mb3JtIHRvIHRoZSBmb2xsb3dpbmcgaW50ZXJmYWNlLlxuXG52YXIgYXNzZXJ0ID0gbW9kdWxlLmV4cG9ydHMgPSBvaztcblxuLy8gMi4gVGhlIEFzc2VydGlvbkVycm9yIGlzIGRlZmluZWQgaW4gYXNzZXJ0LlxuLy8gbmV3IGFzc2VydC5Bc3NlcnRpb25FcnJvcih7IG1lc3NhZ2U6IG1lc3NhZ2UsXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0dWFsOiBhY3R1YWwsXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IGV4cGVjdGVkIH0pXG5cbnZhciByZWdleCA9IC9cXHMqZnVuY3Rpb25cXHMrKFteXFwoXFxzXSopXFxzKi87XG4vLyBiYXNlZCBvbiBodHRwczovL2dpdGh1Yi5jb20vbGpoYXJiL2Z1bmN0aW9uLnByb3RvdHlwZS5uYW1lL2Jsb2IvYWRlZWVlYzhiZmNjNjA2OGIxODdkN2Q5ZmIzZDViYjFkM2EzMDg5OS9pbXBsZW1lbnRhdGlvbi5qc1xuZnVuY3Rpb24gZ2V0TmFtZShmdW5jKSB7XG4gIGlmICghdXRpbC5pc0Z1bmN0aW9uKGZ1bmMpKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChmdW5jdGlvbnNIYXZlTmFtZXMpIHtcbiAgICByZXR1cm4gZnVuYy5uYW1lO1xuICB9XG4gIHZhciBzdHIgPSBmdW5jLnRvU3RyaW5nKCk7XG4gIHZhciBtYXRjaCA9IHN0ci5tYXRjaChyZWdleCk7XG4gIHJldHVybiBtYXRjaCAmJiBtYXRjaFsxXTtcbn1cbmFzc2VydC5Bc3NlcnRpb25FcnJvciA9IGZ1bmN0aW9uIEFzc2VydGlvbkVycm9yKG9wdGlvbnMpIHtcbiAgdGhpcy5uYW1lID0gJ0Fzc2VydGlvbkVycm9yJztcbiAgdGhpcy5hY3R1YWwgPSBvcHRpb25zLmFjdHVhbDtcbiAgdGhpcy5leHBlY3RlZCA9IG9wdGlvbnMuZXhwZWN0ZWQ7XG4gIHRoaXMub3BlcmF0b3IgPSBvcHRpb25zLm9wZXJhdG9yO1xuICBpZiAob3B0aW9ucy5tZXNzYWdlKSB7XG4gICAgdGhpcy5tZXNzYWdlID0gb3B0aW9ucy5tZXNzYWdlO1xuICAgIHRoaXMuZ2VuZXJhdGVkTWVzc2FnZSA9IGZhbHNlO1xuICB9IGVsc2Uge1xuICAgIHRoaXMubWVzc2FnZSA9IGdldE1lc3NhZ2UodGhpcyk7XG4gICAgdGhpcy5nZW5lcmF0ZWRNZXNzYWdlID0gdHJ1ZTtcbiAgfVxuICB2YXIgc3RhY2tTdGFydEZ1bmN0aW9uID0gb3B0aW9ucy5zdGFja1N0YXJ0RnVuY3Rpb24gfHwgZmFpbDtcbiAgaWYgKEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKSB7XG4gICAgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGhpcywgc3RhY2tTdGFydEZ1bmN0aW9uKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBub24gdjggYnJvd3NlcnMgc28gd2UgY2FuIGhhdmUgYSBzdGFja3RyYWNlXG4gICAgdmFyIGVyciA9IG5ldyBFcnJvcigpO1xuICAgIGlmIChlcnIuc3RhY2spIHtcbiAgICAgIHZhciBvdXQgPSBlcnIuc3RhY2s7XG5cbiAgICAgIC8vIHRyeSB0byBzdHJpcCB1c2VsZXNzIGZyYW1lc1xuICAgICAgdmFyIGZuX25hbWUgPSBnZXROYW1lKHN0YWNrU3RhcnRGdW5jdGlvbik7XG4gICAgICB2YXIgaWR4ID0gb3V0LmluZGV4T2YoJ1xcbicgKyBmbl9uYW1lKTtcbiAgICAgIGlmIChpZHggPj0gMCkge1xuICAgICAgICAvLyBvbmNlIHdlIGhhdmUgbG9jYXRlZCB0aGUgZnVuY3Rpb24gZnJhbWVcbiAgICAgICAgLy8gd2UgbmVlZCB0byBzdHJpcCBvdXQgZXZlcnl0aGluZyBiZWZvcmUgaXQgKGFuZCBpdHMgbGluZSlcbiAgICAgICAgdmFyIG5leHRfbGluZSA9IG91dC5pbmRleE9mKCdcXG4nLCBpZHggKyAxKTtcbiAgICAgICAgb3V0ID0gb3V0LnN1YnN0cmluZyhuZXh0X2xpbmUgKyAxKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zdGFjayA9IG91dDtcbiAgICB9XG4gIH1cbn07XG5cbi8vIGFzc2VydC5Bc3NlcnRpb25FcnJvciBpbnN0YW5jZW9mIEVycm9yXG51dGlsLmluaGVyaXRzKGFzc2VydC5Bc3NlcnRpb25FcnJvciwgRXJyb3IpO1xuXG5mdW5jdGlvbiB0cnVuY2F0ZShzLCBuKSB7XG4gIGlmICh0eXBlb2YgcyA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gcy5sZW5ndGggPCBuID8gcyA6IHMuc2xpY2UoMCwgbik7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHM7XG4gIH1cbn1cbmZ1bmN0aW9uIGluc3BlY3Qoc29tZXRoaW5nKSB7XG4gIGlmIChmdW5jdGlvbnNIYXZlTmFtZXMgfHwgIXV0aWwuaXNGdW5jdGlvbihzb21ldGhpbmcpKSB7XG4gICAgcmV0dXJuIHV0aWwuaW5zcGVjdChzb21ldGhpbmcpO1xuICB9XG4gIHZhciByYXduYW1lID0gZ2V0TmFtZShzb21ldGhpbmcpO1xuICB2YXIgbmFtZSA9IHJhd25hbWUgPyAnOiAnICsgcmF3bmFtZSA6ICcnO1xuICByZXR1cm4gJ1tGdW5jdGlvbicgKyAgbmFtZSArICddJztcbn1cbmZ1bmN0aW9uIGdldE1lc3NhZ2Uoc2VsZikge1xuICByZXR1cm4gdHJ1bmNhdGUoaW5zcGVjdChzZWxmLmFjdHVhbCksIDEyOCkgKyAnICcgK1xuICAgICAgICAgc2VsZi5vcGVyYXRvciArICcgJyArXG4gICAgICAgICB0cnVuY2F0ZShpbnNwZWN0KHNlbGYuZXhwZWN0ZWQpLCAxMjgpO1xufVxuXG4vLyBBdCBwcmVzZW50IG9ubHkgdGhlIHRocmVlIGtleXMgbWVudGlvbmVkIGFib3ZlIGFyZSB1c2VkIGFuZFxuLy8gdW5kZXJzdG9vZCBieSB0aGUgc3BlYy4gSW1wbGVtZW50YXRpb25zIG9yIHN1YiBtb2R1bGVzIGNhbiBwYXNzXG4vLyBvdGhlciBrZXlzIHRvIHRoZSBBc3NlcnRpb25FcnJvcidzIGNvbnN0cnVjdG9yIC0gdGhleSB3aWxsIGJlXG4vLyBpZ25vcmVkLlxuXG4vLyAzLiBBbGwgb2YgdGhlIGZvbGxvd2luZyBmdW5jdGlvbnMgbXVzdCB0aHJvdyBhbiBBc3NlcnRpb25FcnJvclxuLy8gd2hlbiBhIGNvcnJlc3BvbmRpbmcgY29uZGl0aW9uIGlzIG5vdCBtZXQsIHdpdGggYSBtZXNzYWdlIHRoYXRcbi8vIG1heSBiZSB1bmRlZmluZWQgaWYgbm90IHByb3ZpZGVkLiAgQWxsIGFzc2VydGlvbiBtZXRob2RzIHByb3ZpZGVcbi8vIGJvdGggdGhlIGFjdHVhbCBhbmQgZXhwZWN0ZWQgdmFsdWVzIHRvIHRoZSBhc3NlcnRpb24gZXJyb3IgZm9yXG4vLyBkaXNwbGF5IHB1cnBvc2VzLlxuXG5mdW5jdGlvbiBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsIG9wZXJhdG9yLCBzdGFja1N0YXJ0RnVuY3Rpb24pIHtcbiAgdGhyb3cgbmV3IGFzc2VydC5Bc3NlcnRpb25FcnJvcih7XG4gICAgbWVzc2FnZTogbWVzc2FnZSxcbiAgICBhY3R1YWw6IGFjdHVhbCxcbiAgICBleHBlY3RlZDogZXhwZWN0ZWQsXG4gICAgb3BlcmF0b3I6IG9wZXJhdG9yLFxuICAgIHN0YWNrU3RhcnRGdW5jdGlvbjogc3RhY2tTdGFydEZ1bmN0aW9uXG4gIH0pO1xufVxuXG4vLyBFWFRFTlNJT04hIGFsbG93cyBmb3Igd2VsbCBiZWhhdmVkIGVycm9ycyBkZWZpbmVkIGVsc2V3aGVyZS5cbmFzc2VydC5mYWlsID0gZmFpbDtcblxuLy8gNC4gUHVyZSBhc3NlcnRpb24gdGVzdHMgd2hldGhlciBhIHZhbHVlIGlzIHRydXRoeSwgYXMgZGV0ZXJtaW5lZFxuLy8gYnkgISFndWFyZC5cbi8vIGFzc2VydC5vayhndWFyZCwgbWVzc2FnZV9vcHQpO1xuLy8gVGhpcyBzdGF0ZW1lbnQgaXMgZXF1aXZhbGVudCB0byBhc3NlcnQuZXF1YWwodHJ1ZSwgISFndWFyZCxcbi8vIG1lc3NhZ2Vfb3B0KTsuIFRvIHRlc3Qgc3RyaWN0bHkgZm9yIHRoZSB2YWx1ZSB0cnVlLCB1c2Vcbi8vIGFzc2VydC5zdHJpY3RFcXVhbCh0cnVlLCBndWFyZCwgbWVzc2FnZV9vcHQpOy5cblxuZnVuY3Rpb24gb2sodmFsdWUsIG1lc3NhZ2UpIHtcbiAgaWYgKCF2YWx1ZSkgZmFpbCh2YWx1ZSwgdHJ1ZSwgbWVzc2FnZSwgJz09JywgYXNzZXJ0Lm9rKTtcbn1cbmFzc2VydC5vayA9IG9rO1xuXG4vLyA1LiBUaGUgZXF1YWxpdHkgYXNzZXJ0aW9uIHRlc3RzIHNoYWxsb3csIGNvZXJjaXZlIGVxdWFsaXR5IHdpdGhcbi8vID09LlxuLy8gYXNzZXJ0LmVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2Vfb3B0KTtcblxuYXNzZXJ0LmVxdWFsID0gZnVuY3Rpb24gZXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoYWN0dWFsICE9IGV4cGVjdGVkKSBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsICc9PScsIGFzc2VydC5lcXVhbCk7XG59O1xuXG4vLyA2LiBUaGUgbm9uLWVxdWFsaXR5IGFzc2VydGlvbiB0ZXN0cyBmb3Igd2hldGhlciB0d28gb2JqZWN0cyBhcmUgbm90IGVxdWFsXG4vLyB3aXRoICE9IGFzc2VydC5ub3RFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC5ub3RFcXVhbCA9IGZ1bmN0aW9uIG5vdEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgaWYgKGFjdHVhbCA9PSBleHBlY3RlZCkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgJyE9JywgYXNzZXJ0Lm5vdEVxdWFsKTtcbiAgfVxufTtcblxuLy8gNy4gVGhlIGVxdWl2YWxlbmNlIGFzc2VydGlvbiB0ZXN0cyBhIGRlZXAgZXF1YWxpdHkgcmVsYXRpb24uXG4vLyBhc3NlcnQuZGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2Vfb3B0KTtcblxuYXNzZXJ0LmRlZXBFcXVhbCA9IGZ1bmN0aW9uIGRlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIGlmICghX2RlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBmYWxzZSkpIHtcbiAgICBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsICdkZWVwRXF1YWwnLCBhc3NlcnQuZGVlcEVxdWFsKTtcbiAgfVxufTtcblxuYXNzZXJ0LmRlZXBTdHJpY3RFcXVhbCA9IGZ1bmN0aW9uIGRlZXBTdHJpY3RFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIGlmICghX2RlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCB0cnVlKSkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgJ2RlZXBTdHJpY3RFcXVhbCcsIGFzc2VydC5kZWVwU3RyaWN0RXF1YWwpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBfZGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIHN0cmljdCwgbWVtb3MpIHtcbiAgLy8gNy4xLiBBbGwgaWRlbnRpY2FsIHZhbHVlcyBhcmUgZXF1aXZhbGVudCwgYXMgZGV0ZXJtaW5lZCBieSA9PT0uXG4gIGlmIChhY3R1YWwgPT09IGV4cGVjdGVkKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSBpZiAoaXNCdWZmZXIoYWN0dWFsKSAmJiBpc0J1ZmZlcihleHBlY3RlZCkpIHtcbiAgICByZXR1cm4gY29tcGFyZShhY3R1YWwsIGV4cGVjdGVkKSA9PT0gMDtcblxuICAvLyA3LjIuIElmIHRoZSBleHBlY3RlZCB2YWx1ZSBpcyBhIERhdGUgb2JqZWN0LCB0aGUgYWN0dWFsIHZhbHVlIGlzXG4gIC8vIGVxdWl2YWxlbnQgaWYgaXQgaXMgYWxzbyBhIERhdGUgb2JqZWN0IHRoYXQgcmVmZXJzIHRvIHRoZSBzYW1lIHRpbWUuXG4gIH0gZWxzZSBpZiAodXRpbC5pc0RhdGUoYWN0dWFsKSAmJiB1dGlsLmlzRGF0ZShleHBlY3RlZCkpIHtcbiAgICByZXR1cm4gYWN0dWFsLmdldFRpbWUoKSA9PT0gZXhwZWN0ZWQuZ2V0VGltZSgpO1xuXG4gIC8vIDcuMyBJZiB0aGUgZXhwZWN0ZWQgdmFsdWUgaXMgYSBSZWdFeHAgb2JqZWN0LCB0aGUgYWN0dWFsIHZhbHVlIGlzXG4gIC8vIGVxdWl2YWxlbnQgaWYgaXQgaXMgYWxzbyBhIFJlZ0V4cCBvYmplY3Qgd2l0aCB0aGUgc2FtZSBzb3VyY2UgYW5kXG4gIC8vIHByb3BlcnRpZXMgKGBnbG9iYWxgLCBgbXVsdGlsaW5lYCwgYGxhc3RJbmRleGAsIGBpZ25vcmVDYXNlYCkuXG4gIH0gZWxzZSBpZiAodXRpbC5pc1JlZ0V4cChhY3R1YWwpICYmIHV0aWwuaXNSZWdFeHAoZXhwZWN0ZWQpKSB7XG4gICAgcmV0dXJuIGFjdHVhbC5zb3VyY2UgPT09IGV4cGVjdGVkLnNvdXJjZSAmJlxuICAgICAgICAgICBhY3R1YWwuZ2xvYmFsID09PSBleHBlY3RlZC5nbG9iYWwgJiZcbiAgICAgICAgICAgYWN0dWFsLm11bHRpbGluZSA9PT0gZXhwZWN0ZWQubXVsdGlsaW5lICYmXG4gICAgICAgICAgIGFjdHVhbC5sYXN0SW5kZXggPT09IGV4cGVjdGVkLmxhc3RJbmRleCAmJlxuICAgICAgICAgICBhY3R1YWwuaWdub3JlQ2FzZSA9PT0gZXhwZWN0ZWQuaWdub3JlQ2FzZTtcblxuICAvLyA3LjQuIE90aGVyIHBhaXJzIHRoYXQgZG8gbm90IGJvdGggcGFzcyB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcsXG4gIC8vIGVxdWl2YWxlbmNlIGlzIGRldGVybWluZWQgYnkgPT0uXG4gIH0gZWxzZSBpZiAoKGFjdHVhbCA9PT0gbnVsbCB8fCB0eXBlb2YgYWN0dWFsICE9PSAnb2JqZWN0JykgJiZcbiAgICAgICAgICAgICAoZXhwZWN0ZWQgPT09IG51bGwgfHwgdHlwZW9mIGV4cGVjdGVkICE9PSAnb2JqZWN0JykpIHtcbiAgICByZXR1cm4gc3RyaWN0ID8gYWN0dWFsID09PSBleHBlY3RlZCA6IGFjdHVhbCA9PSBleHBlY3RlZDtcblxuICAvLyBJZiBib3RoIHZhbHVlcyBhcmUgaW5zdGFuY2VzIG9mIHR5cGVkIGFycmF5cywgd3JhcCB0aGVpciB1bmRlcmx5aW5nXG4gIC8vIEFycmF5QnVmZmVycyBpbiBhIEJ1ZmZlciBlYWNoIHRvIGluY3JlYXNlIHBlcmZvcm1hbmNlXG4gIC8vIFRoaXMgb3B0aW1pemF0aW9uIHJlcXVpcmVzIHRoZSBhcnJheXMgdG8gaGF2ZSB0aGUgc2FtZSB0eXBlIGFzIGNoZWNrZWQgYnlcbiAgLy8gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZyAoYWthIHBUb1N0cmluZykuIE5ldmVyIHBlcmZvcm0gYmluYXJ5XG4gIC8vIGNvbXBhcmlzb25zIGZvciBGbG9hdCpBcnJheXMsIHRob3VnaCwgc2luY2UgZS5nLiArMCA9PT0gLTAgYnV0IHRoZWlyXG4gIC8vIGJpdCBwYXR0ZXJucyBhcmUgbm90IGlkZW50aWNhbC5cbiAgfSBlbHNlIGlmIChpc1ZpZXcoYWN0dWFsKSAmJiBpc1ZpZXcoZXhwZWN0ZWQpICYmXG4gICAgICAgICAgICAgcFRvU3RyaW5nKGFjdHVhbCkgPT09IHBUb1N0cmluZyhleHBlY3RlZCkgJiZcbiAgICAgICAgICAgICAhKGFjdHVhbCBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheSB8fFxuICAgICAgICAgICAgICAgYWN0dWFsIGluc3RhbmNlb2YgRmxvYXQ2NEFycmF5KSkge1xuICAgIHJldHVybiBjb21wYXJlKG5ldyBVaW50OEFycmF5KGFjdHVhbC5idWZmZXIpLFxuICAgICAgICAgICAgICAgICAgIG5ldyBVaW50OEFycmF5KGV4cGVjdGVkLmJ1ZmZlcikpID09PSAwO1xuXG4gIC8vIDcuNSBGb3IgYWxsIG90aGVyIE9iamVjdCBwYWlycywgaW5jbHVkaW5nIEFycmF5IG9iamVjdHMsIGVxdWl2YWxlbmNlIGlzXG4gIC8vIGRldGVybWluZWQgYnkgaGF2aW5nIHRoZSBzYW1lIG51bWJlciBvZiBvd25lZCBwcm9wZXJ0aWVzIChhcyB2ZXJpZmllZFxuICAvLyB3aXRoIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCksIHRoZSBzYW1lIHNldCBvZiBrZXlzXG4gIC8vIChhbHRob3VnaCBub3QgbmVjZXNzYXJpbHkgdGhlIHNhbWUgb3JkZXIpLCBlcXVpdmFsZW50IHZhbHVlcyBmb3IgZXZlcnlcbiAgLy8gY29ycmVzcG9uZGluZyBrZXksIGFuZCBhbiBpZGVudGljYWwgJ3Byb3RvdHlwZScgcHJvcGVydHkuIE5vdGU6IHRoaXNcbiAgLy8gYWNjb3VudHMgZm9yIGJvdGggbmFtZWQgYW5kIGluZGV4ZWQgcHJvcGVydGllcyBvbiBBcnJheXMuXG4gIH0gZWxzZSBpZiAoaXNCdWZmZXIoYWN0dWFsKSAhPT0gaXNCdWZmZXIoZXhwZWN0ZWQpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9IGVsc2Uge1xuICAgIG1lbW9zID0gbWVtb3MgfHwge2FjdHVhbDogW10sIGV4cGVjdGVkOiBbXX07XG5cbiAgICB2YXIgYWN0dWFsSW5kZXggPSBtZW1vcy5hY3R1YWwuaW5kZXhPZihhY3R1YWwpO1xuICAgIGlmIChhY3R1YWxJbmRleCAhPT0gLTEpIHtcbiAgICAgIGlmIChhY3R1YWxJbmRleCA9PT0gbWVtb3MuZXhwZWN0ZWQuaW5kZXhPZihleHBlY3RlZCkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbWVtb3MuYWN0dWFsLnB1c2goYWN0dWFsKTtcbiAgICBtZW1vcy5leHBlY3RlZC5wdXNoKGV4cGVjdGVkKTtcblxuICAgIHJldHVybiBvYmpFcXVpdihhY3R1YWwsIGV4cGVjdGVkLCBzdHJpY3QsIG1lbW9zKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc0FyZ3VtZW50cyhvYmplY3QpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmplY3QpID09ICdbb2JqZWN0IEFyZ3VtZW50c10nO1xufVxuXG5mdW5jdGlvbiBvYmpFcXVpdihhLCBiLCBzdHJpY3QsIGFjdHVhbFZpc2l0ZWRPYmplY3RzKSB7XG4gIGlmIChhID09PSBudWxsIHx8IGEgPT09IHVuZGVmaW5lZCB8fCBiID09PSBudWxsIHx8IGIgPT09IHVuZGVmaW5lZClcbiAgICByZXR1cm4gZmFsc2U7XG4gIC8vIGlmIG9uZSBpcyBhIHByaW1pdGl2ZSwgdGhlIG90aGVyIG11c3QgYmUgc2FtZVxuICBpZiAodXRpbC5pc1ByaW1pdGl2ZShhKSB8fCB1dGlsLmlzUHJpbWl0aXZlKGIpKVxuICAgIHJldHVybiBhID09PSBiO1xuICBpZiAoc3RyaWN0ICYmIE9iamVjdC5nZXRQcm90b3R5cGVPZihhKSAhPT0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGIpKVxuICAgIHJldHVybiBmYWxzZTtcbiAgdmFyIGFJc0FyZ3MgPSBpc0FyZ3VtZW50cyhhKTtcbiAgdmFyIGJJc0FyZ3MgPSBpc0FyZ3VtZW50cyhiKTtcbiAgaWYgKChhSXNBcmdzICYmICFiSXNBcmdzKSB8fCAoIWFJc0FyZ3MgJiYgYklzQXJncykpXG4gICAgcmV0dXJuIGZhbHNlO1xuICBpZiAoYUlzQXJncykge1xuICAgIGEgPSBwU2xpY2UuY2FsbChhKTtcbiAgICBiID0gcFNsaWNlLmNhbGwoYik7XG4gICAgcmV0dXJuIF9kZWVwRXF1YWwoYSwgYiwgc3RyaWN0KTtcbiAgfVxuICB2YXIga2EgPSBvYmplY3RLZXlzKGEpO1xuICB2YXIga2IgPSBvYmplY3RLZXlzKGIpO1xuICB2YXIga2V5LCBpO1xuICAvLyBoYXZpbmcgdGhlIHNhbWUgbnVtYmVyIG9mIG93bmVkIHByb3BlcnRpZXMgKGtleXMgaW5jb3Jwb3JhdGVzXG4gIC8vIGhhc093blByb3BlcnR5KVxuICBpZiAoa2EubGVuZ3RoICE9PSBrYi5sZW5ndGgpXG4gICAgcmV0dXJuIGZhbHNlO1xuICAvL3RoZSBzYW1lIHNldCBvZiBrZXlzIChhbHRob3VnaCBub3QgbmVjZXNzYXJpbHkgdGhlIHNhbWUgb3JkZXIpLFxuICBrYS5zb3J0KCk7XG4gIGtiLnNvcnQoKTtcbiAgLy9+fn5jaGVhcCBrZXkgdGVzdFxuICBmb3IgKGkgPSBrYS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGlmIChrYVtpXSAhPT0ga2JbaV0pXG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLy9lcXVpdmFsZW50IHZhbHVlcyBmb3IgZXZlcnkgY29ycmVzcG9uZGluZyBrZXksIGFuZFxuICAvL35+fnBvc3NpYmx5IGV4cGVuc2l2ZSBkZWVwIHRlc3RcbiAgZm9yIChpID0ga2EubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBrZXkgPSBrYVtpXTtcbiAgICBpZiAoIV9kZWVwRXF1YWwoYVtrZXldLCBiW2tleV0sIHN0cmljdCwgYWN0dWFsVmlzaXRlZE9iamVjdHMpKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG4vLyA4LiBUaGUgbm9uLWVxdWl2YWxlbmNlIGFzc2VydGlvbiB0ZXN0cyBmb3IgYW55IGRlZXAgaW5lcXVhbGl0eS5cbi8vIGFzc2VydC5ub3REZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZV9vcHQpO1xuXG5hc3NlcnQubm90RGVlcEVxdWFsID0gZnVuY3Rpb24gbm90RGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgaWYgKF9kZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgZmFsc2UpKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCAnbm90RGVlcEVxdWFsJywgYXNzZXJ0Lm5vdERlZXBFcXVhbCk7XG4gIH1cbn07XG5cbmFzc2VydC5ub3REZWVwU3RyaWN0RXF1YWwgPSBub3REZWVwU3RyaWN0RXF1YWw7XG5mdW5jdGlvbiBub3REZWVwU3RyaWN0RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoX2RlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCB0cnVlKSkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgJ25vdERlZXBTdHJpY3RFcXVhbCcsIG5vdERlZXBTdHJpY3RFcXVhbCk7XG4gIH1cbn1cblxuXG4vLyA5LiBUaGUgc3RyaWN0IGVxdWFsaXR5IGFzc2VydGlvbiB0ZXN0cyBzdHJpY3QgZXF1YWxpdHksIGFzIGRldGVybWluZWQgYnkgPT09LlxuLy8gYXNzZXJ0LnN0cmljdEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2Vfb3B0KTtcblxuYXNzZXJ0LnN0cmljdEVxdWFsID0gZnVuY3Rpb24gc3RyaWN0RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoYWN0dWFsICE9PSBleHBlY3RlZCkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgJz09PScsIGFzc2VydC5zdHJpY3RFcXVhbCk7XG4gIH1cbn07XG5cbi8vIDEwLiBUaGUgc3RyaWN0IG5vbi1lcXVhbGl0eSBhc3NlcnRpb24gdGVzdHMgZm9yIHN0cmljdCBpbmVxdWFsaXR5LCBhc1xuLy8gZGV0ZXJtaW5lZCBieSAhPT0uICBhc3NlcnQubm90U3RyaWN0RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZV9vcHQpO1xuXG5hc3NlcnQubm90U3RyaWN0RXF1YWwgPSBmdW5jdGlvbiBub3RTdHJpY3RFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIGlmIChhY3R1YWwgPT09IGV4cGVjdGVkKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCAnIT09JywgYXNzZXJ0Lm5vdFN0cmljdEVxdWFsKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gZXhwZWN0ZWRFeGNlcHRpb24oYWN0dWFsLCBleHBlY3RlZCkge1xuICBpZiAoIWFjdHVhbCB8fCAhZXhwZWN0ZWQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGV4cGVjdGVkKSA9PSAnW29iamVjdCBSZWdFeHBdJykge1xuICAgIHJldHVybiBleHBlY3RlZC50ZXN0KGFjdHVhbCk7XG4gIH1cblxuICB0cnkge1xuICAgIGlmIChhY3R1YWwgaW5zdGFuY2VvZiBleHBlY3RlZCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gSWdub3JlLiAgVGhlIGluc3RhbmNlb2YgY2hlY2sgZG9lc24ndCB3b3JrIGZvciBhcnJvdyBmdW5jdGlvbnMuXG4gIH1cblxuICBpZiAoRXJyb3IuaXNQcm90b3R5cGVPZihleHBlY3RlZCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gZXhwZWN0ZWQuY2FsbCh7fSwgYWN0dWFsKSA9PT0gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gX3RyeUJsb2NrKGJsb2NrKSB7XG4gIHZhciBlcnJvcjtcbiAgdHJ5IHtcbiAgICBibG9jaygpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgZXJyb3IgPSBlO1xuICB9XG4gIHJldHVybiBlcnJvcjtcbn1cblxuZnVuY3Rpb24gX3Rocm93cyhzaG91bGRUaHJvdywgYmxvY2ssIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIHZhciBhY3R1YWw7XG5cbiAgaWYgKHR5cGVvZiBibG9jayAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wiYmxvY2tcIiBhcmd1bWVudCBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgZXhwZWN0ZWQgPT09ICdzdHJpbmcnKSB7XG4gICAgbWVzc2FnZSA9IGV4cGVjdGVkO1xuICAgIGV4cGVjdGVkID0gbnVsbDtcbiAgfVxuXG4gIGFjdHVhbCA9IF90cnlCbG9jayhibG9jayk7XG5cbiAgbWVzc2FnZSA9IChleHBlY3RlZCAmJiBleHBlY3RlZC5uYW1lID8gJyAoJyArIGV4cGVjdGVkLm5hbWUgKyAnKS4nIDogJy4nKSArXG4gICAgICAgICAgICAobWVzc2FnZSA/ICcgJyArIG1lc3NhZ2UgOiAnLicpO1xuXG4gIGlmIChzaG91bGRUaHJvdyAmJiAhYWN0dWFsKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCAnTWlzc2luZyBleHBlY3RlZCBleGNlcHRpb24nICsgbWVzc2FnZSk7XG4gIH1cblxuICB2YXIgdXNlclByb3ZpZGVkTWVzc2FnZSA9IHR5cGVvZiBtZXNzYWdlID09PSAnc3RyaW5nJztcbiAgdmFyIGlzVW53YW50ZWRFeGNlcHRpb24gPSAhc2hvdWxkVGhyb3cgJiYgdXRpbC5pc0Vycm9yKGFjdHVhbCk7XG4gIHZhciBpc1VuZXhwZWN0ZWRFeGNlcHRpb24gPSAhc2hvdWxkVGhyb3cgJiYgYWN0dWFsICYmICFleHBlY3RlZDtcblxuICBpZiAoKGlzVW53YW50ZWRFeGNlcHRpb24gJiZcbiAgICAgIHVzZXJQcm92aWRlZE1lc3NhZ2UgJiZcbiAgICAgIGV4cGVjdGVkRXhjZXB0aW9uKGFjdHVhbCwgZXhwZWN0ZWQpKSB8fFxuICAgICAgaXNVbmV4cGVjdGVkRXhjZXB0aW9uKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCAnR290IHVud2FudGVkIGV4Y2VwdGlvbicgKyBtZXNzYWdlKTtcbiAgfVxuXG4gIGlmICgoc2hvdWxkVGhyb3cgJiYgYWN0dWFsICYmIGV4cGVjdGVkICYmXG4gICAgICAhZXhwZWN0ZWRFeGNlcHRpb24oYWN0dWFsLCBleHBlY3RlZCkpIHx8ICghc2hvdWxkVGhyb3cgJiYgYWN0dWFsKSkge1xuICAgIHRocm93IGFjdHVhbDtcbiAgfVxufVxuXG4vLyAxMS4gRXhwZWN0ZWQgdG8gdGhyb3cgYW4gZXJyb3I6XG4vLyBhc3NlcnQudGhyb3dzKGJsb2NrLCBFcnJvcl9vcHQsIG1lc3NhZ2Vfb3B0KTtcblxuYXNzZXJ0LnRocm93cyA9IGZ1bmN0aW9uKGJsb2NrLCAvKm9wdGlvbmFsKi9lcnJvciwgLypvcHRpb25hbCovbWVzc2FnZSkge1xuICBfdGhyb3dzKHRydWUsIGJsb2NrLCBlcnJvciwgbWVzc2FnZSk7XG59O1xuXG4vLyBFWFRFTlNJT04hIFRoaXMgaXMgYW5ub3lpbmcgdG8gd3JpdGUgb3V0c2lkZSB0aGlzIG1vZHVsZS5cbmFzc2VydC5kb2VzTm90VGhyb3cgPSBmdW5jdGlvbihibG9jaywgLypvcHRpb25hbCovZXJyb3IsIC8qb3B0aW9uYWwqL21lc3NhZ2UpIHtcbiAgX3Rocm93cyhmYWxzZSwgYmxvY2ssIGVycm9yLCBtZXNzYWdlKTtcbn07XG5cbmFzc2VydC5pZkVycm9yID0gZnVuY3Rpb24oZXJyKSB7IGlmIChlcnIpIHRocm93IGVycjsgfTtcblxuLy8gRXhwb3NlIGEgc3RyaWN0IG9ubHkgdmFyaWFudCBvZiBhc3NlcnRcbmZ1bmN0aW9uIHN0cmljdCh2YWx1ZSwgbWVzc2FnZSkge1xuICBpZiAoIXZhbHVlKSBmYWlsKHZhbHVlLCB0cnVlLCBtZXNzYWdlLCAnPT0nLCBzdHJpY3QpO1xufVxuYXNzZXJ0LnN0cmljdCA9IG9iamVjdEFzc2lnbihzdHJpY3QsIGFzc2VydCwge1xuICBlcXVhbDogYXNzZXJ0LnN0cmljdEVxdWFsLFxuICBkZWVwRXF1YWw6IGFzc2VydC5kZWVwU3RyaWN0RXF1YWwsXG4gIG5vdEVxdWFsOiBhc3NlcnQubm90U3RyaWN0RXF1YWwsXG4gIG5vdERlZXBFcXVhbDogYXNzZXJ0Lm5vdERlZXBTdHJpY3RFcXVhbFxufSk7XG5hc3NlcnQuc3RyaWN0LnN0cmljdCA9IGFzc2VydC5zdHJpY3Q7XG5cbnZhciBvYmplY3RLZXlzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24gKG9iaikge1xuICB2YXIga2V5cyA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgaWYgKGhhc093bi5jYWxsKG9iaiwga2V5KSkga2V5cy5wdXNoKGtleSk7XG4gIH1cbiAgcmV0dXJuIGtleXM7XG59O1xuIiwiaWYgKHR5cGVvZiBPYmplY3QuY3JlYXRlID09PSAnZnVuY3Rpb24nKSB7XG4gIC8vIGltcGxlbWVudGF0aW9uIGZyb20gc3RhbmRhcmQgbm9kZS5qcyAndXRpbCcgbW9kdWxlXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICBjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDdG9yLnByb3RvdHlwZSwge1xuICAgICAgY29uc3RydWN0b3I6IHtcbiAgICAgICAgdmFsdWU6IGN0b3IsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICB9XG4gICAgfSk7XG4gIH07XG59IGVsc2Uge1xuICAvLyBvbGQgc2Nob29sIHNoaW0gZm9yIG9sZCBicm93c2Vyc1xuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgdmFyIFRlbXBDdG9yID0gZnVuY3Rpb24gKCkge31cbiAgICBUZW1wQ3Rvci5wcm90b3R5cGUgPSBzdXBlckN0b3IucHJvdG90eXBlXG4gICAgY3Rvci5wcm90b3R5cGUgPSBuZXcgVGVtcEN0b3IoKVxuICAgIGN0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gY3RvclxuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQnVmZmVyKGFyZykge1xuICByZXR1cm4gYXJnICYmIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnXG4gICAgJiYgdHlwZW9mIGFyZy5jb3B5ID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5maWxsID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5yZWFkVUludDggPT09ICdmdW5jdGlvbic7XG59IiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbnZhciBmb3JtYXRSZWdFeHAgPSAvJVtzZGolXS9nO1xuZXhwb3J0cy5mb3JtYXQgPSBmdW5jdGlvbihmKSB7XG4gIGlmICghaXNTdHJpbmcoZikpIHtcbiAgICB2YXIgb2JqZWN0cyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBvYmplY3RzLnB1c2goaW5zcGVjdChhcmd1bWVudHNbaV0pKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdHMuam9pbignICcpO1xuICB9XG5cbiAgdmFyIGkgPSAxO1xuICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgdmFyIGxlbiA9IGFyZ3MubGVuZ3RoO1xuICB2YXIgc3RyID0gU3RyaW5nKGYpLnJlcGxhY2UoZm9ybWF0UmVnRXhwLCBmdW5jdGlvbih4KSB7XG4gICAgaWYgKHggPT09ICclJScpIHJldHVybiAnJSc7XG4gICAgaWYgKGkgPj0gbGVuKSByZXR1cm4geDtcbiAgICBzd2l0Y2ggKHgpIHtcbiAgICAgIGNhc2UgJyVzJzogcmV0dXJuIFN0cmluZyhhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWQnOiByZXR1cm4gTnVtYmVyKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclaic6XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGFyZ3NbaSsrXSk7XG4gICAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgICByZXR1cm4gJ1tDaXJjdWxhcl0nO1xuICAgICAgICB9XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4geDtcbiAgICB9XG4gIH0pO1xuICBmb3IgKHZhciB4ID0gYXJnc1tpXTsgaSA8IGxlbjsgeCA9IGFyZ3NbKytpXSkge1xuICAgIGlmIChpc051bGwoeCkgfHwgIWlzT2JqZWN0KHgpKSB7XG4gICAgICBzdHIgKz0gJyAnICsgeDtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyICs9ICcgJyArIGluc3BlY3QoeCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBzdHI7XG59O1xuXG5cbi8vIE1hcmsgdGhhdCBhIG1ldGhvZCBzaG91bGQgbm90IGJlIHVzZWQuXG4vLyBSZXR1cm5zIGEgbW9kaWZpZWQgZnVuY3Rpb24gd2hpY2ggd2FybnMgb25jZSBieSBkZWZhdWx0LlxuLy8gSWYgLS1uby1kZXByZWNhdGlvbiBpcyBzZXQsIHRoZW4gaXQgaXMgYSBuby1vcC5cbmV4cG9ydHMuZGVwcmVjYXRlID0gZnVuY3Rpb24oZm4sIG1zZykge1xuICAvLyBBbGxvdyBmb3IgZGVwcmVjYXRpbmcgdGhpbmdzIGluIHRoZSBwcm9jZXNzIG9mIHN0YXJ0aW5nIHVwLlxuICBpZiAoaXNVbmRlZmluZWQoZ2xvYmFsLnByb2Nlc3MpKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGV4cG9ydHMuZGVwcmVjYXRlKGZuLCBtc2cpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfVxuXG4gIGlmIChwcm9jZXNzLm5vRGVwcmVjYXRpb24gPT09IHRydWUpIHtcbiAgICByZXR1cm4gZm47XG4gIH1cblxuICB2YXIgd2FybmVkID0gZmFsc2U7XG4gIGZ1bmN0aW9uIGRlcHJlY2F0ZWQoKSB7XG4gICAgaWYgKCF3YXJuZWQpIHtcbiAgICAgIGlmIChwcm9jZXNzLnRocm93RGVwcmVjYXRpb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XG4gICAgICB9IGVsc2UgaWYgKHByb2Nlc3MudHJhY2VEZXByZWNhdGlvbikge1xuICAgICAgICBjb25zb2xlLnRyYWNlKG1zZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKG1zZyk7XG4gICAgICB9XG4gICAgICB3YXJuZWQgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIHJldHVybiBkZXByZWNhdGVkO1xufTtcblxuXG52YXIgZGVidWdzID0ge307XG52YXIgZGVidWdFbnZpcm9uO1xuZXhwb3J0cy5kZWJ1Z2xvZyA9IGZ1bmN0aW9uKHNldCkge1xuICBpZiAoaXNVbmRlZmluZWQoZGVidWdFbnZpcm9uKSlcbiAgICBkZWJ1Z0Vudmlyb24gPSBwcm9jZXNzLmVudi5OT0RFX0RFQlVHIHx8ICcnO1xuICBzZXQgPSBzZXQudG9VcHBlckNhc2UoKTtcbiAgaWYgKCFkZWJ1Z3Nbc2V0XSkge1xuICAgIGlmIChuZXcgUmVnRXhwKCdcXFxcYicgKyBzZXQgKyAnXFxcXGInLCAnaScpLnRlc3QoZGVidWdFbnZpcm9uKSkge1xuICAgICAgdmFyIHBpZCA9IHByb2Nlc3MucGlkO1xuICAgICAgZGVidWdzW3NldF0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG1zZyA9IGV4cG9ydHMuZm9ybWF0LmFwcGx5KGV4cG9ydHMsIGFyZ3VtZW50cyk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJyVzICVkOiAlcycsIHNldCwgcGlkLCBtc2cpO1xuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVidWdzW3NldF0gPSBmdW5jdGlvbigpIHt9O1xuICAgIH1cbiAgfVxuICByZXR1cm4gZGVidWdzW3NldF07XG59O1xuXG5cbi8qKlxuICogRWNob3MgdGhlIHZhbHVlIG9mIGEgdmFsdWUuIFRyeXMgdG8gcHJpbnQgdGhlIHZhbHVlIG91dFxuICogaW4gdGhlIGJlc3Qgd2F5IHBvc3NpYmxlIGdpdmVuIHRoZSBkaWZmZXJlbnQgdHlwZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBUaGUgb2JqZWN0IHRvIHByaW50IG91dC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzIE9wdGlvbmFsIG9wdGlvbnMgb2JqZWN0IHRoYXQgYWx0ZXJzIHRoZSBvdXRwdXQuXG4gKi9cbi8qIGxlZ2FjeTogb2JqLCBzaG93SGlkZGVuLCBkZXB0aCwgY29sb3JzKi9cbmZ1bmN0aW9uIGluc3BlY3Qob2JqLCBvcHRzKSB7XG4gIC8vIGRlZmF1bHQgb3B0aW9uc1xuICB2YXIgY3R4ID0ge1xuICAgIHNlZW46IFtdLFxuICAgIHN0eWxpemU6IHN0eWxpemVOb0NvbG9yXG4gIH07XG4gIC8vIGxlZ2FjeS4uLlxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAzKSBjdHguZGVwdGggPSBhcmd1bWVudHNbMl07XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDQpIGN0eC5jb2xvcnMgPSBhcmd1bWVudHNbM107XG4gIGlmIChpc0Jvb2xlYW4ob3B0cykpIHtcbiAgICAvLyBsZWdhY3kuLi5cbiAgICBjdHguc2hvd0hpZGRlbiA9IG9wdHM7XG4gIH0gZWxzZSBpZiAob3B0cykge1xuICAgIC8vIGdvdCBhbiBcIm9wdGlvbnNcIiBvYmplY3RcbiAgICBleHBvcnRzLl9leHRlbmQoY3R4LCBvcHRzKTtcbiAgfVxuICAvLyBzZXQgZGVmYXVsdCBvcHRpb25zXG4gIGlmIChpc1VuZGVmaW5lZChjdHguc2hvd0hpZGRlbikpIGN0eC5zaG93SGlkZGVuID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguZGVwdGgpKSBjdHguZGVwdGggPSAyO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmNvbG9ycykpIGN0eC5jb2xvcnMgPSBmYWxzZTtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jdXN0b21JbnNwZWN0KSkgY3R4LmN1c3RvbUluc3BlY3QgPSB0cnVlO1xuICBpZiAoY3R4LmNvbG9ycykgY3R4LnN0eWxpemUgPSBzdHlsaXplV2l0aENvbG9yO1xuICByZXR1cm4gZm9ybWF0VmFsdWUoY3R4LCBvYmosIGN0eC5kZXB0aCk7XG59XG5leHBvcnRzLmluc3BlY3QgPSBpbnNwZWN0O1xuXG5cbi8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQU5TSV9lc2NhcGVfY29kZSNncmFwaGljc1xuaW5zcGVjdC5jb2xvcnMgPSB7XG4gICdib2xkJyA6IFsxLCAyMl0sXG4gICdpdGFsaWMnIDogWzMsIDIzXSxcbiAgJ3VuZGVybGluZScgOiBbNCwgMjRdLFxuICAnaW52ZXJzZScgOiBbNywgMjddLFxuICAnd2hpdGUnIDogWzM3LCAzOV0sXG4gICdncmV5JyA6IFs5MCwgMzldLFxuICAnYmxhY2snIDogWzMwLCAzOV0sXG4gICdibHVlJyA6IFszNCwgMzldLFxuICAnY3lhbicgOiBbMzYsIDM5XSxcbiAgJ2dyZWVuJyA6IFszMiwgMzldLFxuICAnbWFnZW50YScgOiBbMzUsIDM5XSxcbiAgJ3JlZCcgOiBbMzEsIDM5XSxcbiAgJ3llbGxvdycgOiBbMzMsIDM5XVxufTtcblxuLy8gRG9uJ3QgdXNlICdibHVlJyBub3QgdmlzaWJsZSBvbiBjbWQuZXhlXG5pbnNwZWN0LnN0eWxlcyA9IHtcbiAgJ3NwZWNpYWwnOiAnY3lhbicsXG4gICdudW1iZXInOiAneWVsbG93JyxcbiAgJ2Jvb2xlYW4nOiAneWVsbG93JyxcbiAgJ3VuZGVmaW5lZCc6ICdncmV5JyxcbiAgJ251bGwnOiAnYm9sZCcsXG4gICdzdHJpbmcnOiAnZ3JlZW4nLFxuICAnZGF0ZSc6ICdtYWdlbnRhJyxcbiAgLy8gXCJuYW1lXCI6IGludGVudGlvbmFsbHkgbm90IHN0eWxpbmdcbiAgJ3JlZ2V4cCc6ICdyZWQnXG59O1xuXG5cbmZ1bmN0aW9uIHN0eWxpemVXaXRoQ29sb3Ioc3RyLCBzdHlsZVR5cGUpIHtcbiAgdmFyIHN0eWxlID0gaW5zcGVjdC5zdHlsZXNbc3R5bGVUeXBlXTtcblxuICBpZiAoc3R5bGUpIHtcbiAgICByZXR1cm4gJ1xcdTAwMWJbJyArIGluc3BlY3QuY29sb3JzW3N0eWxlXVswXSArICdtJyArIHN0ciArXG4gICAgICAgICAgICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMV0gKyAnbSc7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHN0cjtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIHN0eWxpemVOb0NvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHJldHVybiBzdHI7XG59XG5cblxuZnVuY3Rpb24gYXJyYXlUb0hhc2goYXJyYXkpIHtcbiAgdmFyIGhhc2ggPSB7fTtcblxuICBhcnJheS5mb3JFYWNoKGZ1bmN0aW9uKHZhbCwgaWR4KSB7XG4gICAgaGFzaFt2YWxdID0gdHJ1ZTtcbiAgfSk7XG5cbiAgcmV0dXJuIGhhc2g7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0VmFsdWUoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzKSB7XG4gIC8vIFByb3ZpZGUgYSBob29rIGZvciB1c2VyLXNwZWNpZmllZCBpbnNwZWN0IGZ1bmN0aW9ucy5cbiAgLy8gQ2hlY2sgdGhhdCB2YWx1ZSBpcyBhbiBvYmplY3Qgd2l0aCBhbiBpbnNwZWN0IGZ1bmN0aW9uIG9uIGl0XG4gIGlmIChjdHguY3VzdG9tSW5zcGVjdCAmJlxuICAgICAgdmFsdWUgJiZcbiAgICAgIGlzRnVuY3Rpb24odmFsdWUuaW5zcGVjdCkgJiZcbiAgICAgIC8vIEZpbHRlciBvdXQgdGhlIHV0aWwgbW9kdWxlLCBpdCdzIGluc3BlY3QgZnVuY3Rpb24gaXMgc3BlY2lhbFxuICAgICAgdmFsdWUuaW5zcGVjdCAhPT0gZXhwb3J0cy5pbnNwZWN0ICYmXG4gICAgICAvLyBBbHNvIGZpbHRlciBvdXQgYW55IHByb3RvdHlwZSBvYmplY3RzIHVzaW5nIHRoZSBjaXJjdWxhciBjaGVjay5cbiAgICAgICEodmFsdWUuY29uc3RydWN0b3IgJiYgdmFsdWUuY29uc3RydWN0b3IucHJvdG90eXBlID09PSB2YWx1ZSkpIHtcbiAgICB2YXIgcmV0ID0gdmFsdWUuaW5zcGVjdChyZWN1cnNlVGltZXMsIGN0eCk7XG4gICAgaWYgKCFpc1N0cmluZyhyZXQpKSB7XG4gICAgICByZXQgPSBmb3JtYXRWYWx1ZShjdHgsIHJldCwgcmVjdXJzZVRpbWVzKTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIC8vIFByaW1pdGl2ZSB0eXBlcyBjYW5ub3QgaGF2ZSBwcm9wZXJ0aWVzXG4gIHZhciBwcmltaXRpdmUgPSBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSk7XG4gIGlmIChwcmltaXRpdmUpIHtcbiAgICByZXR1cm4gcHJpbWl0aXZlO1xuICB9XG5cbiAgLy8gTG9vayB1cCB0aGUga2V5cyBvZiB0aGUgb2JqZWN0LlxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHZhbHVlKTtcbiAgdmFyIHZpc2libGVLZXlzID0gYXJyYXlUb0hhc2goa2V5cyk7XG5cbiAgaWYgKGN0eC5zaG93SGlkZGVuKSB7XG4gICAga2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHZhbHVlKTtcbiAgfVxuXG4gIC8vIElFIGRvZXNuJ3QgbWFrZSBlcnJvciBmaWVsZHMgbm9uLWVudW1lcmFibGVcbiAgLy8gaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L2llL2R3dzUyc2J0KHY9dnMuOTQpLmFzcHhcbiAgaWYgKGlzRXJyb3IodmFsdWUpXG4gICAgICAmJiAoa2V5cy5pbmRleE9mKCdtZXNzYWdlJykgPj0gMCB8fCBrZXlzLmluZGV4T2YoJ2Rlc2NyaXB0aW9uJykgPj0gMCkpIHtcbiAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgLy8gU29tZSB0eXBlIG9mIG9iamVjdCB3aXRob3V0IHByb3BlcnRpZXMgY2FuIGJlIHNob3J0Y3V0dGVkLlxuICBpZiAoa2V5cy5sZW5ndGggPT09IDApIHtcbiAgICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICAgIHZhciBuYW1lID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoJ1tGdW5jdGlvbicgKyBuYW1lICsgJ10nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ3JlZ2V4cCcpO1xuICAgIH1cbiAgICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKERhdGUucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAnZGF0ZScpO1xuICAgIH1cbiAgICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIGJhc2UgPSAnJywgYXJyYXkgPSBmYWxzZSwgYnJhY2VzID0gWyd7JywgJ30nXTtcblxuICAvLyBNYWtlIEFycmF5IHNheSB0aGF0IHRoZXkgYXJlIEFycmF5XG4gIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgIGFycmF5ID0gdHJ1ZTtcbiAgICBicmFjZXMgPSBbJ1snLCAnXSddO1xuICB9XG5cbiAgLy8gTWFrZSBmdW5jdGlvbnMgc2F5IHRoYXQgdGhleSBhcmUgZnVuY3Rpb25zXG4gIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgIHZhciBuID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgYmFzZSA9ICcgW0Z1bmN0aW9uJyArIG4gKyAnXSc7XG4gIH1cblxuICAvLyBNYWtlIFJlZ0V4cHMgc2F5IHRoYXQgdGhleSBhcmUgUmVnRXhwc1xuICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGRhdGVzIHdpdGggcHJvcGVydGllcyBmaXJzdCBzYXkgdGhlIGRhdGVcbiAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgRGF0ZS5wcm90b3R5cGUudG9VVENTdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGVycm9yIHdpdGggbWVzc2FnZSBmaXJzdCBzYXkgdGhlIGVycm9yXG4gIGlmIChpc0Vycm9yKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gIH1cblxuICBpZiAoa2V5cy5sZW5ndGggPT09IDAgJiYgKCFhcnJheSB8fCB2YWx1ZS5sZW5ndGggPT0gMCkpIHtcbiAgICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArIGJyYWNlc1sxXTtcbiAgfVxuXG4gIGlmIChyZWN1cnNlVGltZXMgPCAwKSB7XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbT2JqZWN0XScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG5cbiAgY3R4LnNlZW4ucHVzaCh2YWx1ZSk7XG5cbiAgdmFyIG91dHB1dDtcbiAgaWYgKGFycmF5KSB7XG4gICAgb3V0cHV0ID0gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cyk7XG4gIH0gZWxzZSB7XG4gICAgb3V0cHV0ID0ga2V5cy5tYXAoZnVuY3Rpb24oa2V5KSB7XG4gICAgICByZXR1cm4gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSk7XG4gICAgfSk7XG4gIH1cblxuICBjdHguc2Vlbi5wb3AoKTtcblxuICByZXR1cm4gcmVkdWNlVG9TaW5nbGVTdHJpbmcob3V0cHV0LCBiYXNlLCBicmFjZXMpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFByaW1pdGl2ZShjdHgsIHZhbHVlKSB7XG4gIGlmIChpc1VuZGVmaW5lZCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCd1bmRlZmluZWQnLCAndW5kZWZpbmVkJyk7XG4gIGlmIChpc1N0cmluZyh2YWx1ZSkpIHtcbiAgICB2YXIgc2ltcGxlID0gJ1xcJycgKyBKU09OLnN0cmluZ2lmeSh2YWx1ZSkucmVwbGFjZSgvXlwifFwiJC9nLCAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJykgKyAnXFwnJztcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoc2ltcGxlLCAnc3RyaW5nJyk7XG4gIH1cbiAgaWYgKGlzTnVtYmVyKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ251bWJlcicpO1xuICBpZiAoaXNCb29sZWFuKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ2Jvb2xlYW4nKTtcbiAgLy8gRm9yIHNvbWUgcmVhc29uIHR5cGVvZiBudWxsIGlzIFwib2JqZWN0XCIsIHNvIHNwZWNpYWwgY2FzZSBoZXJlLlxuICBpZiAoaXNOdWxsKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJ251bGwnLCAnbnVsbCcpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEVycm9yKHZhbHVlKSB7XG4gIHJldHVybiAnWycgKyBFcnJvci5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkgKyAnXSc7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cykge1xuICB2YXIgb3V0cHV0ID0gW107XG4gIGZvciAodmFyIGkgPSAwLCBsID0gdmFsdWUubGVuZ3RoOyBpIDwgbDsgKytpKSB7XG4gICAgaWYgKGhhc093blByb3BlcnR5KHZhbHVlLCBTdHJpbmcoaSkpKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIFN0cmluZyhpKSwgdHJ1ZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXRwdXQucHVzaCgnJyk7XG4gICAgfVxuICB9XG4gIGtleXMuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAoIWtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIG91dHB1dC5wdXNoKGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsXG4gICAgICAgICAga2V5LCB0cnVlKSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIG91dHB1dDtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXksIGFycmF5KSB7XG4gIHZhciBuYW1lLCBzdHIsIGRlc2M7XG4gIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHZhbHVlLCBrZXkpIHx8IHsgdmFsdWU6IHZhbHVlW2tleV0gfTtcbiAgaWYgKGRlc2MuZ2V0KSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0dldHRlci9TZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuICBpZiAoIWhhc093blByb3BlcnR5KHZpc2libGVLZXlzLCBrZXkpKSB7XG4gICAgbmFtZSA9ICdbJyArIGtleSArICddJztcbiAgfVxuICBpZiAoIXN0cikge1xuICAgIGlmIChjdHguc2Vlbi5pbmRleE9mKGRlc2MudmFsdWUpIDwgMCkge1xuICAgICAgaWYgKGlzTnVsbChyZWN1cnNlVGltZXMpKSB7XG4gICAgICAgIHN0ciA9IGZvcm1hdFZhbHVlKGN0eCwgZGVzYy52YWx1ZSwgbnVsbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIHJlY3Vyc2VUaW1lcyAtIDEpO1xuICAgICAgfVxuICAgICAgaWYgKHN0ci5pbmRleE9mKCdcXG4nKSA+IC0xKSB7XG4gICAgICAgIGlmIChhcnJheSkge1xuICAgICAgICAgIHN0ciA9IHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiAnICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKS5zdWJzdHIoMik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RyID0gJ1xcbicgKyBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgICcgKyBsaW5lO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbQ2lyY3VsYXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKGlzVW5kZWZpbmVkKG5hbWUpKSB7XG4gICAgaWYgKGFycmF5ICYmIGtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuICAgIG5hbWUgPSBKU09OLnN0cmluZ2lmeSgnJyArIGtleSk7XG4gICAgaWYgKG5hbWUubWF0Y2goL15cIihbYS16QS1aX11bYS16QS1aXzAtOV0qKVwiJC8pKSB7XG4gICAgICBuYW1lID0gbmFtZS5zdWJzdHIoMSwgbmFtZS5sZW5ndGggLSAyKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnbmFtZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuYW1lID0gbmFtZS5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvKF5cInxcIiQpL2csIFwiJ1wiKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnc3RyaW5nJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5hbWUgKyAnOiAnICsgc3RyO1xufVxuXG5cbmZ1bmN0aW9uIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKSB7XG4gIHZhciBudW1MaW5lc0VzdCA9IDA7XG4gIHZhciBsZW5ndGggPSBvdXRwdXQucmVkdWNlKGZ1bmN0aW9uKHByZXYsIGN1cikge1xuICAgIG51bUxpbmVzRXN0Kys7XG4gICAgaWYgKGN1ci5pbmRleE9mKCdcXG4nKSA+PSAwKSBudW1MaW5lc0VzdCsrO1xuICAgIHJldHVybiBwcmV2ICsgY3VyLnJlcGxhY2UoL1xcdTAwMWJcXFtcXGRcXGQ/bS9nLCAnJykubGVuZ3RoICsgMTtcbiAgfSwgMCk7XG5cbiAgaWYgKGxlbmd0aCA+IDYwKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArXG4gICAgICAgICAgIChiYXNlID09PSAnJyA/ICcnIDogYmFzZSArICdcXG4gJykgK1xuICAgICAgICAgICAnICcgK1xuICAgICAgICAgICBvdXRwdXQuam9pbignLFxcbiAgJykgK1xuICAgICAgICAgICAnICcgK1xuICAgICAgICAgICBicmFjZXNbMV07XG4gIH1cblxuICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArICcgJyArIG91dHB1dC5qb2luKCcsICcpICsgJyAnICsgYnJhY2VzWzFdO1xufVxuXG5cbi8vIE5PVEU6IFRoZXNlIHR5cGUgY2hlY2tpbmcgZnVuY3Rpb25zIGludGVudGlvbmFsbHkgZG9uJ3QgdXNlIGBpbnN0YW5jZW9mYFxuLy8gYmVjYXVzZSBpdCBpcyBmcmFnaWxlIGFuZCBjYW4gYmUgZWFzaWx5IGZha2VkIHdpdGggYE9iamVjdC5jcmVhdGUoKWAuXG5mdW5jdGlvbiBpc0FycmF5KGFyKSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KGFyKTtcbn1cbmV4cG9ydHMuaXNBcnJheSA9IGlzQXJyYXk7XG5cbmZ1bmN0aW9uIGlzQm9vbGVhbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdib29sZWFuJztcbn1cbmV4cG9ydHMuaXNCb29sZWFuID0gaXNCb29sZWFuO1xuXG5mdW5jdGlvbiBpc051bGwoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbCA9IGlzTnVsbDtcblxuZnVuY3Rpb24gaXNOdWxsT3JVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsT3JVbmRlZmluZWQgPSBpc051bGxPclVuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cbmV4cG9ydHMuaXNOdW1iZXIgPSBpc051bWJlcjtcblxuZnVuY3Rpb24gaXNTdHJpbmcoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3RyaW5nJztcbn1cbmV4cG9ydHMuaXNTdHJpbmcgPSBpc1N0cmluZztcblxuZnVuY3Rpb24gaXNTeW1ib2woYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3ltYm9sJztcbn1cbmV4cG9ydHMuaXNTeW1ib2wgPSBpc1N5bWJvbDtcblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbmV4cG9ydHMuaXNVbmRlZmluZWQgPSBpc1VuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNSZWdFeHAocmUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHJlKSAmJiBvYmplY3RUb1N0cmluZyhyZSkgPT09ICdbb2JqZWN0IFJlZ0V4cF0nO1xufVxuZXhwb3J0cy5pc1JlZ0V4cCA9IGlzUmVnRXhwO1xuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNPYmplY3QgPSBpc09iamVjdDtcblxuZnVuY3Rpb24gaXNEYXRlKGQpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGQpICYmIG9iamVjdFRvU3RyaW5nKGQpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5leHBvcnRzLmlzRGF0ZSA9IGlzRGF0ZTtcblxuZnVuY3Rpb24gaXNFcnJvcihlKSB7XG4gIHJldHVybiBpc09iamVjdChlKSAmJlxuICAgICAgKG9iamVjdFRvU3RyaW5nKGUpID09PSAnW29iamVjdCBFcnJvcl0nIHx8IGUgaW5zdGFuY2VvZiBFcnJvcik7XG59XG5leHBvcnRzLmlzRXJyb3IgPSBpc0Vycm9yO1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cbmV4cG9ydHMuaXNGdW5jdGlvbiA9IGlzRnVuY3Rpb247XG5cbmZ1bmN0aW9uIGlzUHJpbWl0aXZlKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnYm9vbGVhbicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdudW1iZXInIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3RyaW5nJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCcgfHwgIC8vIEVTNiBzeW1ib2xcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICd1bmRlZmluZWQnO1xufVxuZXhwb3J0cy5pc1ByaW1pdGl2ZSA9IGlzUHJpbWl0aXZlO1xuXG5leHBvcnRzLmlzQnVmZmVyID0gcmVxdWlyZSgnLi9zdXBwb3J0L2lzQnVmZmVyJyk7XG5cbmZ1bmN0aW9uIG9iamVjdFRvU3RyaW5nKG8pIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKTtcbn1cblxuXG5mdW5jdGlvbiBwYWQobikge1xuICByZXR1cm4gbiA8IDEwID8gJzAnICsgbi50b1N0cmluZygxMCkgOiBuLnRvU3RyaW5nKDEwKTtcbn1cblxuXG52YXIgbW9udGhzID0gWydKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsXG4gICAgICAgICAgICAgICdPY3QnLCAnTm92JywgJ0RlYyddO1xuXG4vLyAyNiBGZWIgMTY6MTk6MzRcbmZ1bmN0aW9uIHRpbWVzdGFtcCgpIHtcbiAgdmFyIGQgPSBuZXcgRGF0ZSgpO1xuICB2YXIgdGltZSA9IFtwYWQoZC5nZXRIb3VycygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0TWludXRlcygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0U2Vjb25kcygpKV0uam9pbignOicpO1xuICByZXR1cm4gW2QuZ2V0RGF0ZSgpLCBtb250aHNbZC5nZXRNb250aCgpXSwgdGltZV0uam9pbignICcpO1xufVxuXG5cbi8vIGxvZyBpcyBqdXN0IGEgdGhpbiB3cmFwcGVyIHRvIGNvbnNvbGUubG9nIHRoYXQgcHJlcGVuZHMgYSB0aW1lc3RhbXBcbmV4cG9ydHMubG9nID0gZnVuY3Rpb24oKSB7XG4gIGNvbnNvbGUubG9nKCclcyAtICVzJywgdGltZXN0YW1wKCksIGV4cG9ydHMuZm9ybWF0LmFwcGx5KGV4cG9ydHMsIGFyZ3VtZW50cykpO1xufTtcblxuXG4vKipcbiAqIEluaGVyaXQgdGhlIHByb3RvdHlwZSBtZXRob2RzIGZyb20gb25lIGNvbnN0cnVjdG9yIGludG8gYW5vdGhlci5cbiAqXG4gKiBUaGUgRnVuY3Rpb24ucHJvdG90eXBlLmluaGVyaXRzIGZyb20gbGFuZy5qcyByZXdyaXR0ZW4gYXMgYSBzdGFuZGFsb25lXG4gKiBmdW5jdGlvbiAobm90IG9uIEZ1bmN0aW9uLnByb3RvdHlwZSkuIE5PVEU6IElmIHRoaXMgZmlsZSBpcyB0byBiZSBsb2FkZWRcbiAqIGR1cmluZyBib290c3RyYXBwaW5nIHRoaXMgZnVuY3Rpb24gbmVlZHMgdG8gYmUgcmV3cml0dGVuIHVzaW5nIHNvbWUgbmF0aXZlXG4gKiBmdW5jdGlvbnMgYXMgcHJvdG90eXBlIHNldHVwIHVzaW5nIG5vcm1hbCBKYXZhU2NyaXB0IGRvZXMgbm90IHdvcmsgYXNcbiAqIGV4cGVjdGVkIGR1cmluZyBib290c3RyYXBwaW5nIChzZWUgbWlycm9yLmpzIGluIHIxMTQ5MDMpLlxuICpcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gd2hpY2ggbmVlZHMgdG8gaW5oZXJpdCB0aGVcbiAqICAgICBwcm90b3R5cGUuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBzdXBlckN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gdG8gaW5oZXJpdCBwcm90b3R5cGUgZnJvbS5cbiAqL1xuZXhwb3J0cy5pbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG5cbmV4cG9ydHMuX2V4dGVuZCA9IGZ1bmN0aW9uKG9yaWdpbiwgYWRkKSB7XG4gIC8vIERvbid0IGRvIGFueXRoaW5nIGlmIGFkZCBpc24ndCBhbiBvYmplY3RcbiAgaWYgKCFhZGQgfHwgIWlzT2JqZWN0KGFkZCkpIHJldHVybiBvcmlnaW47XG5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhhZGQpO1xuICB2YXIgaSA9IGtleXMubGVuZ3RoO1xuICB3aGlsZSAoaS0tKSB7XG4gICAgb3JpZ2luW2tleXNbaV1dID0gYWRkW2tleXNbaV1dO1xuICB9XG4gIHJldHVybiBvcmlnaW47XG59O1xuXG5mdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eShvYmosIHByb3ApIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApO1xufVxuIiwiIiwiLypcbm9iamVjdC1hc3NpZ25cbihjKSBTaW5kcmUgU29yaHVzXG5AbGljZW5zZSBNSVRcbiovXG5cbid1c2Ugc3RyaWN0Jztcbi8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXG52YXIgZ2V0T3duUHJvcGVydHlTeW1ib2xzID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scztcbnZhciBoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG52YXIgcHJvcElzRW51bWVyYWJsZSA9IE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGU7XG5cbmZ1bmN0aW9uIHRvT2JqZWN0KHZhbCkge1xuXHRpZiAodmFsID09PSBudWxsIHx8IHZhbCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignT2JqZWN0LmFzc2lnbiBjYW5ub3QgYmUgY2FsbGVkIHdpdGggbnVsbCBvciB1bmRlZmluZWQnKTtcblx0fVxuXG5cdHJldHVybiBPYmplY3QodmFsKTtcbn1cblxuZnVuY3Rpb24gc2hvdWxkVXNlTmF0aXZlKCkge1xuXHR0cnkge1xuXHRcdGlmICghT2JqZWN0LmFzc2lnbikge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdC8vIERldGVjdCBidWdneSBwcm9wZXJ0eSBlbnVtZXJhdGlvbiBvcmRlciBpbiBvbGRlciBWOCB2ZXJzaW9ucy5cblxuXHRcdC8vIGh0dHBzOi8vYnVncy5jaHJvbWl1bS5vcmcvcC92OC9pc3N1ZXMvZGV0YWlsP2lkPTQxMThcblx0XHR2YXIgdGVzdDEgPSBuZXcgU3RyaW5nKCdhYmMnKTsgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tbmV3LXdyYXBwZXJzXG5cdFx0dGVzdDFbNV0gPSAnZGUnO1xuXHRcdGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh0ZXN0MSlbMF0gPT09ICc1Jykge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdC8vIGh0dHBzOi8vYnVncy5jaHJvbWl1bS5vcmcvcC92OC9pc3N1ZXMvZGV0YWlsP2lkPTMwNTZcblx0XHR2YXIgdGVzdDIgPSB7fTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IDEwOyBpKyspIHtcblx0XHRcdHRlc3QyWydfJyArIFN0cmluZy5mcm9tQ2hhckNvZGUoaSldID0gaTtcblx0XHR9XG5cdFx0dmFyIG9yZGVyMiA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRlc3QyKS5tYXAoZnVuY3Rpb24gKG4pIHtcblx0XHRcdHJldHVybiB0ZXN0MltuXTtcblx0XHR9KTtcblx0XHRpZiAob3JkZXIyLmpvaW4oJycpICE9PSAnMDEyMzQ1Njc4OScpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHQvLyBodHRwczovL2J1Z3MuY2hyb21pdW0ub3JnL3AvdjgvaXNzdWVzL2RldGFpbD9pZD0zMDU2XG5cdFx0dmFyIHRlc3QzID0ge307XG5cdFx0J2FiY2RlZmdoaWprbG1ub3BxcnN0Jy5zcGxpdCgnJykuZm9yRWFjaChmdW5jdGlvbiAobGV0dGVyKSB7XG5cdFx0XHR0ZXN0M1tsZXR0ZXJdID0gbGV0dGVyO1xuXHRcdH0pO1xuXHRcdGlmIChPYmplY3Qua2V5cyhPYmplY3QuYXNzaWduKHt9LCB0ZXN0MykpLmpvaW4oJycpICE9PVxuXHRcdFx0XHQnYWJjZGVmZ2hpamtsbW5vcHFyc3QnKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRydWU7XG5cdH0gY2F0Y2ggKGVycikge1xuXHRcdC8vIFdlIGRvbid0IGV4cGVjdCBhbnkgb2YgdGhlIGFib3ZlIHRvIHRocm93LCBidXQgYmV0dGVyIHRvIGJlIHNhZmUuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2hvdWxkVXNlTmF0aXZlKCkgPyBPYmplY3QuYXNzaWduIDogZnVuY3Rpb24gKHRhcmdldCwgc291cmNlKSB7XG5cdHZhciBmcm9tO1xuXHR2YXIgdG8gPSB0b09iamVjdCh0YXJnZXQpO1xuXHR2YXIgc3ltYm9scztcblxuXHRmb3IgKHZhciBzID0gMTsgcyA8IGFyZ3VtZW50cy5sZW5ndGg7IHMrKykge1xuXHRcdGZyb20gPSBPYmplY3QoYXJndW1lbnRzW3NdKTtcblxuXHRcdGZvciAodmFyIGtleSBpbiBmcm9tKSB7XG5cdFx0XHRpZiAoaGFzT3duUHJvcGVydHkuY2FsbChmcm9tLCBrZXkpKSB7XG5cdFx0XHRcdHRvW2tleV0gPSBmcm9tW2tleV07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKGdldE93blByb3BlcnR5U3ltYm9scykge1xuXHRcdFx0c3ltYm9scyA9IGdldE93blByb3BlcnR5U3ltYm9scyhmcm9tKTtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc3ltYm9scy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZiAocHJvcElzRW51bWVyYWJsZS5jYWxsKGZyb20sIHN5bWJvbHNbaV0pKSB7XG5cdFx0XHRcdFx0dG9bc3ltYm9sc1tpXV0gPSBmcm9tW3N5bWJvbHNbaV1dO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHRvO1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5jb21waWxlID0gZXhwb3J0cy5tYWtlTm9udGVybWluYWxDb252ZXJ0ZXJzID0gdm9pZCAwO1xuY29uc3QgdHlwZXNfMSA9IHJlcXVpcmUoXCIuL3R5cGVzXCIpO1xuY29uc3QgYXNzZXJ0XzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcImFzc2VydFwiKSk7XG5jb25zdCBwYXJzZXJfMSA9IHJlcXVpcmUoXCIuL3BhcnNlclwiKTtcbi8qKlxuICogQ29udmVydHMgc3RyaW5nIHRvIG5vbnRlcm1pbmFsLlxuICogQHBhcmFtIDxOVD4gbm9udGVybWluYWwgZW51bWVyYXRpb25cbiAqIEBwYXJhbSBub250ZXJtaW5hbHMgcmVxdWlyZWQgdG8gYmUgdGhlIHJ1bnRpbWUgb2JqZWN0IGZvciB0aGUgPE5UPiB0eXBlIHBhcmFtZXRlclxuICogQHJldHVybiBhIHBhaXIgb2YgY29udmVydGVycyB7IG5vbnRlcm1pbmFsVG9TdHJpbmcsIHN0cmluZ1RvTm9udGVybWluYWwgfVxuICogICAgICAgICAgICAgIG9uZSB0YWtlcyBhIHN0cmluZyAoYW55IGFscGhhYmV0aWMgY2FzZSkgYW5kIHJldHVybnMgdGhlIG5vbnRlcm1pbmFsIGl0IG5hbWVzXG4gKiAgICAgICAgICAgICAgdGhlIG90aGVyIHRha2VzIGEgbm9udGVybWluYWwgYW5kIHJldHVybnMgaXRzIHN0cmluZyBuYW1lLCB1c2luZyB0aGUgVHlwZXNjcmlwdCBzb3VyY2UgY2FwaXRhbGl6YXRpb24uXG4gKiAgICAgICAgIEJvdGggY29udmVydGVycyB0aHJvdyBHcmFtbWFyRXJyb3IgaWYgdGhlIGNvbnZlcnNpb24gY2FuJ3QgYmUgZG9uZS5cbiAqIEB0aHJvd3MgR3JhbW1hckVycm9yIGlmIE5UIGhhcyBhIG5hbWUgY29sbGlzaW9uICh0d28gbm9udGVybWluYWwgbmFtZXMgdGhhdCBkaWZmZXIgb25seSBpbiBjYXBpdGFsaXphdGlvbixcbiAqICAgICAgIGUuZy4gUk9PVCBhbmQgcm9vdCkuXG4gKi9cbmZ1bmN0aW9uIG1ha2VOb250ZXJtaW5hbENvbnZlcnRlcnMobm9udGVybWluYWxzKSB7XG4gICAgLy8gXCJjYW5vbmljYWwgbmFtZVwiIGlzIGEgY2FzZS1pbmRlcGVuZGVudCBuYW1lIChjYW5vbmljYWxpemVkIHRvIGxvd2VyY2FzZSlcbiAgICAvLyBcInNvdXJjZSBuYW1lXCIgaXMgdGhlIG5hbWUgY2FwaXRhbGl6ZWQgYXMgaW4gdGhlIFR5cGVzY3JpcHQgc291cmNlIGRlZmluaXRpb24gb2YgTlRcbiAgICBjb25zdCBub250ZXJtaW5hbEZvckNhbm9uaWNhbE5hbWUgPSBuZXcgTWFwKCk7XG4gICAgY29uc3Qgc291cmNlTmFtZUZvck5vbnRlcm1pbmFsID0gbmV3IE1hcCgpO1xuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKG5vbnRlcm1pbmFscykpIHtcbiAgICAgICAgLy8gaW4gVHlwZXNjcmlwdCwgdGhlIG5vbnRlcm1pbmFscyBvYmplY3QgY29tYmluZXMgYm90aCBhIE5ULT5uYW1lIG1hcHBpbmcgYW5kIG5hbWUtPk5UIG1hcHBpbmcuXG4gICAgICAgIC8vIGh0dHBzOi8vd3d3LnR5cGVzY3JpcHRsYW5nLm9yZy9kb2NzL2hhbmRib29rL2VudW1zLmh0bWwjZW51bXMtYXQtcnVudGltZVxuICAgICAgICAvLyBTbyBmaWx0ZXIganVzdCB0byBrZXlzIHRoYXQgYXJlIHZhbGlkIFBhcnNlcmxpYiBub250ZXJtaW5hbCBuYW1lc1xuICAgICAgICBpZiAoL15bYS16QS1aX11bYS16QS1aXzAtOV0qJC8udGVzdChrZXkpKSB7XG4gICAgICAgICAgICBjb25zdCBzb3VyY2VOYW1lID0ga2V5O1xuICAgICAgICAgICAgY29uc3QgY2Fub25pY2FsTmFtZSA9IGtleS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgY29uc3QgbnQgPSBub250ZXJtaW5hbHNbc291cmNlTmFtZV07XG4gICAgICAgICAgICBpZiAobm9udGVybWluYWxGb3JDYW5vbmljYWxOYW1lLmhhcyhjYW5vbmljYWxOYW1lKSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyB0eXBlc18xLkdyYW1tYXJFcnJvcignbmFtZSBjb2xsaXNpb24gaW4gbm9udGVybWluYWwgZW51bWVyYXRpb246ICdcbiAgICAgICAgICAgICAgICAgICAgKyBzb3VyY2VOYW1lRm9yTm9udGVybWluYWwuZ2V0KG5vbnRlcm1pbmFsRm9yQ2Fub25pY2FsTmFtZS5nZXQoY2Fub25pY2FsTmFtZSkpXG4gICAgICAgICAgICAgICAgICAgICsgJyBhbmQgJyArIHNvdXJjZU5hbWVcbiAgICAgICAgICAgICAgICAgICAgKyAnIGFyZSB0aGUgc2FtZSB3aGVuIGNvbXBhcmVkIGNhc2UtaW5zZW5zaXRpdmVseScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbm9udGVybWluYWxGb3JDYW5vbmljYWxOYW1lLnNldChjYW5vbmljYWxOYW1lLCBudCk7XG4gICAgICAgICAgICBzb3VyY2VOYW1lRm9yTm9udGVybWluYWwuc2V0KG50LCBzb3VyY2VOYW1lKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvL2NvbnNvbGUuZXJyb3Ioc291cmNlTmFtZUZvck5vbnRlcm1pbmFsKTtcbiAgICBmdW5jdGlvbiBzdHJpbmdUb05vbnRlcm1pbmFsKG5hbWUpIHtcbiAgICAgICAgY29uc3QgY2Fub25pY2FsTmFtZSA9IG5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgaWYgKCFub250ZXJtaW5hbEZvckNhbm9uaWNhbE5hbWUuaGFzKGNhbm9uaWNhbE5hbWUpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgdHlwZXNfMS5HcmFtbWFyRXJyb3IoJ2dyYW1tYXIgdXNlcyBub250ZXJtaW5hbCAnICsgbmFtZSArICcsIHdoaWNoIGlzIG5vdCBmb3VuZCBpbiB0aGUgbm9udGVybWluYWwgZW51bWVyYXRpb24gcGFzc2VkIHRvIGNvbXBpbGUoKScpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBub250ZXJtaW5hbEZvckNhbm9uaWNhbE5hbWUuZ2V0KGNhbm9uaWNhbE5hbWUpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBub250ZXJtaW5hbFRvU3RyaW5nKG50KSB7XG4gICAgICAgIGlmICghc291cmNlTmFtZUZvck5vbnRlcm1pbmFsLmhhcyhudCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyB0eXBlc18xLkdyYW1tYXJFcnJvcignbm9udGVybWluYWwgJyArIG50ICsgJyBpcyBub3QgZm91bmQgaW4gdGhlIG5vbnRlcm1pbmFsIGVudW1lcmF0aW9uIHBhc3NlZCB0byBjb21waWxlKCknKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc291cmNlTmFtZUZvck5vbnRlcm1pbmFsLmdldChudCk7XG4gICAgfVxuICAgIHJldHVybiB7IHN0cmluZ1RvTm9udGVybWluYWwsIG5vbnRlcm1pbmFsVG9TdHJpbmcgfTtcbn1cbmV4cG9ydHMubWFrZU5vbnRlcm1pbmFsQ29udmVydGVycyA9IG1ha2VOb250ZXJtaW5hbENvbnZlcnRlcnM7XG52YXIgR3JhbW1hck5UO1xuKGZ1bmN0aW9uIChHcmFtbWFyTlQpIHtcbiAgICBHcmFtbWFyTlRbR3JhbW1hck5UW1wiR1JBTU1BUlwiXSA9IDBdID0gXCJHUkFNTUFSXCI7XG4gICAgR3JhbW1hck5UW0dyYW1tYXJOVFtcIlBST0RVQ1RJT05cIl0gPSAxXSA9IFwiUFJPRFVDVElPTlwiO1xuICAgIEdyYW1tYXJOVFtHcmFtbWFyTlRbXCJTS0lQQkxPQ0tcIl0gPSAyXSA9IFwiU0tJUEJMT0NLXCI7XG4gICAgR3JhbW1hck5UW0dyYW1tYXJOVFtcIlVOSU9OXCJdID0gM10gPSBcIlVOSU9OXCI7XG4gICAgR3JhbW1hck5UW0dyYW1tYXJOVFtcIkNPTkNBVEVOQVRJT05cIl0gPSA0XSA9IFwiQ09OQ0FURU5BVElPTlwiO1xuICAgIEdyYW1tYXJOVFtHcmFtbWFyTlRbXCJSRVBFVElUSU9OXCJdID0gNV0gPSBcIlJFUEVUSVRJT05cIjtcbiAgICBHcmFtbWFyTlRbR3JhbW1hck5UW1wiUkVQRUFUT1BFUkFUT1JcIl0gPSA2XSA9IFwiUkVQRUFUT1BFUkFUT1JcIjtcbiAgICBHcmFtbWFyTlRbR3JhbW1hck5UW1wiVU5JVFwiXSA9IDddID0gXCJVTklUXCI7XG4gICAgR3JhbW1hck5UW0dyYW1tYXJOVFtcIk5PTlRFUk1JTkFMXCJdID0gOF0gPSBcIk5PTlRFUk1JTkFMXCI7XG4gICAgR3JhbW1hck5UW0dyYW1tYXJOVFtcIlRFUk1JTkFMXCJdID0gOV0gPSBcIlRFUk1JTkFMXCI7XG4gICAgR3JhbW1hck5UW0dyYW1tYXJOVFtcIlFVT1RFRFNUUklOR1wiXSA9IDEwXSA9IFwiUVVPVEVEU1RSSU5HXCI7XG4gICAgR3JhbW1hck5UW0dyYW1tYXJOVFtcIk5VTUJFUlwiXSA9IDExXSA9IFwiTlVNQkVSXCI7XG4gICAgR3JhbW1hck5UW0dyYW1tYXJOVFtcIlJBTkdFXCJdID0gMTJdID0gXCJSQU5HRVwiO1xuICAgIEdyYW1tYXJOVFtHcmFtbWFyTlRbXCJVUFBFUkJPVU5EXCJdID0gMTNdID0gXCJVUFBFUkJPVU5EXCI7XG4gICAgR3JhbW1hck5UW0dyYW1tYXJOVFtcIkxPV0VSQk9VTkRcIl0gPSAxNF0gPSBcIkxPV0VSQk9VTkRcIjtcbiAgICBHcmFtbWFyTlRbR3JhbW1hck5UW1wiQ0hBUkFDVEVSU0VUXCJdID0gMTVdID0gXCJDSEFSQUNURVJTRVRcIjtcbiAgICBHcmFtbWFyTlRbR3JhbW1hck5UW1wiQU5ZQ0hBUlwiXSA9IDE2XSA9IFwiQU5ZQ0hBUlwiO1xuICAgIEdyYW1tYXJOVFtHcmFtbWFyTlRbXCJDSEFSQUNURVJDTEFTU1wiXSA9IDE3XSA9IFwiQ0hBUkFDVEVSQ0xBU1NcIjtcbiAgICBHcmFtbWFyTlRbR3JhbW1hck5UW1wiV0hJVEVTUEFDRVwiXSA9IDE4XSA9IFwiV0hJVEVTUEFDRVwiO1xuICAgIEdyYW1tYXJOVFtHcmFtbWFyTlRbXCJPTkVMSU5FQ09NTUVOVFwiXSA9IDE5XSA9IFwiT05FTElORUNPTU1FTlRcIjtcbiAgICBHcmFtbWFyTlRbR3JhbW1hck5UW1wiQkxPQ0tDT01NRU5UXCJdID0gMjBdID0gXCJCTE9DS0NPTU1FTlRcIjtcbiAgICBHcmFtbWFyTlRbR3JhbW1hck5UW1wiU0tJUFwiXSA9IDIxXSA9IFwiU0tJUFwiO1xufSkoR3JhbW1hck5UIHx8IChHcmFtbWFyTlQgPSB7fSkpO1xuO1xuZnVuY3Rpb24gbnR0KG5vbnRlcm1pbmFsKSB7XG4gICAgcmV0dXJuICgwLCBwYXJzZXJfMS5udCkobm9udGVybWluYWwsIEdyYW1tYXJOVFtub250ZXJtaW5hbF0pO1xufVxuY29uc3QgZ3JhbW1hckdyYW1tYXIgPSBuZXcgTWFwKCk7XG4vLyBncmFtbWFyIDo6PSAoIHByb2R1Y3Rpb24gfCBza2lwQmxvY2sgKStcbmdyYW1tYXJHcmFtbWFyLnNldChHcmFtbWFyTlQuR1JBTU1BUiwgKDAsIHBhcnNlcl8xLmNhdCkobnR0KEdyYW1tYXJOVC5TS0lQKSwgKDAsIHBhcnNlcl8xLnN0YXIpKCgwLCBwYXJzZXJfMS5jYXQpKCgwLCBwYXJzZXJfMS5vcikobnR0KEdyYW1tYXJOVC5QUk9EVUNUSU9OKSwgbnR0KEdyYW1tYXJOVC5TS0lQQkxPQ0spKSwgbnR0KEdyYW1tYXJOVC5TS0lQKSkpKSk7XG4vLyBza2lwQmxvY2sgOjo9ICdAc2tpcCcgbm9udGVybWluYWwgJ3snIHByb2R1Y3Rpb24qICd9J1xuZ3JhbW1hckdyYW1tYXIuc2V0KEdyYW1tYXJOVC5TS0lQQkxPQ0ssICgwLCBwYXJzZXJfMS5jYXQpKCgwLCBwYXJzZXJfMS5zdHIpKFwiQHNraXBcIiksIG50dChHcmFtbWFyTlQuU0tJUCksICgwLCBwYXJzZXJfMS5mYWlsZmFzdCkobnR0KEdyYW1tYXJOVC5OT05URVJNSU5BTCkpLCBudHQoR3JhbW1hck5ULlNLSVApLCAoMCwgcGFyc2VyXzEuc3RyKSgneycpLCAoMCwgcGFyc2VyXzEuZmFpbGZhc3QpKCgwLCBwYXJzZXJfMS5jYXQpKG50dChHcmFtbWFyTlQuU0tJUCksICgwLCBwYXJzZXJfMS5zdGFyKSgoMCwgcGFyc2VyXzEuY2F0KShudHQoR3JhbW1hck5ULlBST0RVQ1RJT04pLCBudHQoR3JhbW1hck5ULlNLSVApKSksICgwLCBwYXJzZXJfMS5zdHIpKCd9JykpKSkpO1xuLy8gcHJvZHVjdGlvbiA6Oj0gbm9udGVybWluYWwgJzo6PScgdW5pb24gJzsnXG5ncmFtbWFyR3JhbW1hci5zZXQoR3JhbW1hck5ULlBST0RVQ1RJT04sICgwLCBwYXJzZXJfMS5jYXQpKG50dChHcmFtbWFyTlQuTk9OVEVSTUlOQUwpLCBudHQoR3JhbW1hck5ULlNLSVApLCAoMCwgcGFyc2VyXzEuc3RyKShcIjo6PVwiKSwgKDAsIHBhcnNlcl8xLmZhaWxmYXN0KSgoMCwgcGFyc2VyXzEuY2F0KShudHQoR3JhbW1hck5ULlNLSVApLCBudHQoR3JhbW1hck5ULlVOSU9OKSwgbnR0KEdyYW1tYXJOVC5TS0lQKSwgKDAsIHBhcnNlcl8xLnN0cikoJzsnKSkpKSk7XG4vLyB1bmlvbiA6OiA9IGNvbmNhdGVuYXRpb24gKCd8JyBjb25jYXRlbmF0aW9uKSpcbmdyYW1tYXJHcmFtbWFyLnNldChHcmFtbWFyTlQuVU5JT04sICgwLCBwYXJzZXJfMS5jYXQpKG50dChHcmFtbWFyTlQuQ09OQ0FURU5BVElPTiksICgwLCBwYXJzZXJfMS5zdGFyKSgoMCwgcGFyc2VyXzEuY2F0KShudHQoR3JhbW1hck5ULlNLSVApLCAoMCwgcGFyc2VyXzEuc3RyKSgnfCcpLCBudHQoR3JhbW1hck5ULlNLSVApLCBudHQoR3JhbW1hck5ULkNPTkNBVEVOQVRJT04pKSkpKTtcbi8vIGNvbmNhdGVuYXRpb24gOjogPSByZXBldGl0aW9uKiBcbmdyYW1tYXJHcmFtbWFyLnNldChHcmFtbWFyTlQuQ09OQ0FURU5BVElPTiwgKDAsIHBhcnNlcl8xLnN0YXIpKCgwLCBwYXJzZXJfMS5jYXQpKG50dChHcmFtbWFyTlQuUkVQRVRJVElPTiksIG50dChHcmFtbWFyTlQuU0tJUCkpKSk7XG4vLyByZXBldGl0aW9uIDo6PSB1bml0IHJlcGVhdE9wZXJhdG9yP1xuZ3JhbW1hckdyYW1tYXIuc2V0KEdyYW1tYXJOVC5SRVBFVElUSU9OLCAoMCwgcGFyc2VyXzEuY2F0KShudHQoR3JhbW1hck5ULlVOSVQpLCBudHQoR3JhbW1hck5ULlNLSVApLCAoMCwgcGFyc2VyXzEub3B0aW9uKShudHQoR3JhbW1hck5ULlJFUEVBVE9QRVJBVE9SKSkpKTtcbi8vIHJlcGVhdE9wZXJhdG9yIDo6PSBbKis/XSB8ICd7JyAoIG51bWJlciB8IHJhbmdlIHwgdXBwZXJCb3VuZCB8IGxvd2VyQm91bmQgKSAnfSdcbmdyYW1tYXJHcmFtbWFyLnNldChHcmFtbWFyTlQuUkVQRUFUT1BFUkFUT1IsICgwLCBwYXJzZXJfMS5vcikoKDAsIHBhcnNlcl8xLnJlZ2V4KShcIlsqKz9dXCIpLCAoMCwgcGFyc2VyXzEuY2F0KSgoMCwgcGFyc2VyXzEuc3RyKShcIntcIiksICgwLCBwYXJzZXJfMS5vcikobnR0KEdyYW1tYXJOVC5OVU1CRVIpLCBudHQoR3JhbW1hck5ULlJBTkdFKSwgbnR0KEdyYW1tYXJOVC5VUFBFUkJPVU5EKSwgbnR0KEdyYW1tYXJOVC5MT1dFUkJPVU5EKSksICgwLCBwYXJzZXJfMS5zdHIpKFwifVwiKSkpKTtcbi8vIG51bWJlciA6Oj0gWzAtOV0rXG5ncmFtbWFyR3JhbW1hci5zZXQoR3JhbW1hck5ULk5VTUJFUiwgKDAsIHBhcnNlcl8xLnBsdXMpKCgwLCBwYXJzZXJfMS5yZWdleCkoXCJbMC05XVwiKSkpO1xuLy8gcmFuZ2UgOjo9IG51bWJlciAnLCcgbnVtYmVyXG5ncmFtbWFyR3JhbW1hci5zZXQoR3JhbW1hck5ULlJBTkdFLCAoMCwgcGFyc2VyXzEuY2F0KShudHQoR3JhbW1hck5ULk5VTUJFUiksICgwLCBwYXJzZXJfMS5zdHIpKFwiLFwiKSwgbnR0KEdyYW1tYXJOVC5OVU1CRVIpKSk7XG4vLyB1cHBlckJvdW5kIDo6PSAnLCcgbnVtYmVyXG5ncmFtbWFyR3JhbW1hci5zZXQoR3JhbW1hck5ULlVQUEVSQk9VTkQsICgwLCBwYXJzZXJfMS5jYXQpKCgwLCBwYXJzZXJfMS5zdHIpKFwiLFwiKSwgbnR0KEdyYW1tYXJOVC5OVU1CRVIpKSk7XG4vLyBsb3dlckJvdW5kIDo6PSBudW1iZXIgJywnXG5ncmFtbWFyR3JhbW1hci5zZXQoR3JhbW1hck5ULkxPV0VSQk9VTkQsICgwLCBwYXJzZXJfMS5jYXQpKG50dChHcmFtbWFyTlQuTlVNQkVSKSwgKDAsIHBhcnNlcl8xLnN0cikoXCIsXCIpKSk7XG4vLyB1bml0IDo6PSBub250ZXJtaW5hbCB8IHRlcm1pbmFsIHwgJygnIHVuaW9uICcpJ1xuZ3JhbW1hckdyYW1tYXIuc2V0KEdyYW1tYXJOVC5VTklULCAoMCwgcGFyc2VyXzEub3IpKG50dChHcmFtbWFyTlQuTk9OVEVSTUlOQUwpLCBudHQoR3JhbW1hck5ULlRFUk1JTkFMKSwgKDAsIHBhcnNlcl8xLmNhdCkoKDAsIHBhcnNlcl8xLnN0cikoJygnKSwgbnR0KEdyYW1tYXJOVC5TS0lQKSwgbnR0KEdyYW1tYXJOVC5VTklPTiksIG50dChHcmFtbWFyTlQuU0tJUCksICgwLCBwYXJzZXJfMS5zdHIpKCcpJykpKSk7XG4vLyBub250ZXJtaW5hbCA6Oj0gW2EtekEtWl9dW2EtekEtWl8wLTldKlxuZ3JhbW1hckdyYW1tYXIuc2V0KEdyYW1tYXJOVC5OT05URVJNSU5BTCwgKDAsIHBhcnNlcl8xLmNhdCkoKDAsIHBhcnNlcl8xLnJlZ2V4KShcIlthLXpBLVpfXVwiKSwgKDAsIHBhcnNlcl8xLnN0YXIpKCgwLCBwYXJzZXJfMS5yZWdleCkoXCJbYS16QS1aXzAtOV1cIikpKSk7XG4vLyB0ZXJtaW5hbCA6Oj0gcXVvdGVkU3RyaW5nIHwgY2hhcmFjdGVyU2V0IHwgYW55Q2hhciB8IGNoYXJhY3RlckNsYXNzXG5ncmFtbWFyR3JhbW1hci5zZXQoR3JhbW1hck5ULlRFUk1JTkFMLCAoMCwgcGFyc2VyXzEub3IpKG50dChHcmFtbWFyTlQuUVVPVEVEU1RSSU5HKSwgbnR0KEdyYW1tYXJOVC5DSEFSQUNURVJTRVQpLCBudHQoR3JhbW1hck5ULkFOWUNIQVIpLCBudHQoR3JhbW1hck5ULkNIQVJBQ1RFUkNMQVNTKSkpO1xuLy8gcXVvdGVkU3RyaW5nIDo6PSBcIidcIiAoW14nXFxyXFxuXFxcXF0gfCAnXFxcXCcgLiApKiBcIidcIiB8ICdcIicgKFteXCJcXHJcXG5cXFxcXSB8ICdcXFxcJyAuICkqICdcIidcbmdyYW1tYXJHcmFtbWFyLnNldChHcmFtbWFyTlQuUVVPVEVEU1RSSU5HLCAoMCwgcGFyc2VyXzEub3IpKCgwLCBwYXJzZXJfMS5jYXQpKCgwLCBwYXJzZXJfMS5zdHIpKFwiJ1wiKSwgKDAsIHBhcnNlcl8xLmZhaWxmYXN0KSgoMCwgcGFyc2VyXzEuc3RhcikoKDAsIHBhcnNlcl8xLm9yKSgoMCwgcGFyc2VyXzEucmVnZXgpKFwiW14nXFxyXFxuXFxcXFxcXFxdXCIpLCAoMCwgcGFyc2VyXzEuY2F0KSgoMCwgcGFyc2VyXzEuc3RyKSgnXFxcXCcpLCAoMCwgcGFyc2VyXzEucmVnZXgpKFwiLlwiKSkpKSksICgwLCBwYXJzZXJfMS5zdHIpKFwiJ1wiKSksICgwLCBwYXJzZXJfMS5jYXQpKCgwLCBwYXJzZXJfMS5zdHIpKCdcIicpLCAoMCwgcGFyc2VyXzEuZmFpbGZhc3QpKCgwLCBwYXJzZXJfMS5zdGFyKSgoMCwgcGFyc2VyXzEub3IpKCgwLCBwYXJzZXJfMS5yZWdleCkoJ1teXCJcXHJcXG5cXFxcXFxcXF0nKSwgKDAsIHBhcnNlcl8xLmNhdCkoKDAsIHBhcnNlcl8xLnN0cikoJ1xcXFwnKSwgKDAsIHBhcnNlcl8xLnJlZ2V4KShcIi5cIikpKSkpLCAoMCwgcGFyc2VyXzEuc3RyKSgnXCInKSkpKTtcbi8vIGNoYXJhY3RlclNldCA6Oj0gJ1snIChbXlxcXVxcclxcblxcXFxdIHwgJ1xcXFwnIC4gKSsgJ10nXG5ncmFtbWFyR3JhbW1hci5zZXQoR3JhbW1hck5ULkNIQVJBQ1RFUlNFVCwgKDAsIHBhcnNlcl8xLmNhdCkoKDAsIHBhcnNlcl8xLnN0cikoJ1snKSwgKDAsIHBhcnNlcl8xLmZhaWxmYXN0KSgoMCwgcGFyc2VyXzEuY2F0KSgoMCwgcGFyc2VyXzEucGx1cykoKDAsIHBhcnNlcl8xLm9yKSgoMCwgcGFyc2VyXzEucmVnZXgpKFwiW15cXFxcXVxcclxcblxcXFxcXFxcXVwiKSwgKDAsIHBhcnNlcl8xLmNhdCkoKDAsIHBhcnNlcl8xLnN0cikoJ1xcXFwnKSwgKDAsIHBhcnNlcl8xLnJlZ2V4KShcIi5cIikpKSkpKSwgKDAsIHBhcnNlcl8xLnN0cikoJ10nKSkpO1xuLy8gYW55Q2hhciA6Oj0gJy4nXG5ncmFtbWFyR3JhbW1hci5zZXQoR3JhbW1hck5ULkFOWUNIQVIsICgwLCBwYXJzZXJfMS5zdHIpKCcuJykpO1xuLy8gY2hhcmFjdGVyQ2xhc3MgOjo9ICdcXFxcJyBbZHN3XVxuZ3JhbW1hckdyYW1tYXIuc2V0KEdyYW1tYXJOVC5DSEFSQUNURVJDTEFTUywgKDAsIHBhcnNlcl8xLmNhdCkoKDAsIHBhcnNlcl8xLnN0cikoJ1xcXFwnKSwgKDAsIHBhcnNlcl8xLmZhaWxmYXN0KSgoMCwgcGFyc2VyXzEucmVnZXgpKFwiW2Rzd11cIikpKSk7XG4vLyB3aGl0ZXNwYWNlIDo6PSBbIFxcdFxcclxcbl1cbmdyYW1tYXJHcmFtbWFyLnNldChHcmFtbWFyTlQuV0hJVEVTUEFDRSwgKDAsIHBhcnNlcl8xLnJlZ2V4KShcIlsgXFx0XFxyXFxuXVwiKSk7XG5ncmFtbWFyR3JhbW1hci5zZXQoR3JhbW1hck5ULk9ORUxJTkVDT01NRU5ULCAoMCwgcGFyc2VyXzEuY2F0KSgoMCwgcGFyc2VyXzEuc3RyKShcIi8vXCIpLCAoMCwgcGFyc2VyXzEuc3RhcikoKDAsIHBhcnNlcl8xLnJlZ2V4KShcIlteXFxyXFxuXVwiKSksICgwLCBwYXJzZXJfMS5vcikoKDAsIHBhcnNlcl8xLnN0cikoXCJcXHJcXG5cIiksICgwLCBwYXJzZXJfMS5zdHIpKCdcXG4nKSwgKDAsIHBhcnNlcl8xLnN0cikoJ1xccicpKSkpO1xuZ3JhbW1hckdyYW1tYXIuc2V0KEdyYW1tYXJOVC5CTE9DS0NPTU1FTlQsICgwLCBwYXJzZXJfMS5jYXQpKCgwLCBwYXJzZXJfMS5zdHIpKFwiLypcIiksICgwLCBwYXJzZXJfMS5jYXQpKCgwLCBwYXJzZXJfMS5zdGFyKSgoMCwgcGFyc2VyXzEucmVnZXgpKFwiW14qXVwiKSksICgwLCBwYXJzZXJfMS5zdHIpKCcqJykpLCAoMCwgcGFyc2VyXzEuc3RhcikoKDAsIHBhcnNlcl8xLmNhdCkoKDAsIHBhcnNlcl8xLnJlZ2V4KShcIlteL11cIiksICgwLCBwYXJzZXJfMS5zdGFyKSgoMCwgcGFyc2VyXzEucmVnZXgpKFwiW14qXVwiKSksICgwLCBwYXJzZXJfMS5zdHIpKCcqJykpKSwgKDAsIHBhcnNlcl8xLnN0cikoJy8nKSkpO1xuZ3JhbW1hckdyYW1tYXIuc2V0KEdyYW1tYXJOVC5TS0lQLCAoMCwgcGFyc2VyXzEuc3RhcikoKDAsIHBhcnNlcl8xLm9yKShudHQoR3JhbW1hck5ULldISVRFU1BBQ0UpLCBudHQoR3JhbW1hck5ULk9ORUxJTkVDT01NRU5UKSwgbnR0KEdyYW1tYXJOVC5CTE9DS0NPTU1FTlQpKSkpO1xuY29uc3QgZ3JhbW1hclBhcnNlciA9IG5ldyBwYXJzZXJfMS5JbnRlcm5hbFBhcnNlcihncmFtbWFyR3JhbW1hciwgbnR0KEdyYW1tYXJOVC5HUkFNTUFSKSwgKG50KSA9PiBHcmFtbWFyTlRbbnRdKTtcbi8qKlxuICogQ29tcGlsZSBhIFBhcnNlciBmcm9tIGEgZ3JhbW1hciByZXByZXNlbnRlZCBhcyBhIHN0cmluZy5cbiAqIEBwYXJhbSA8TlQ+IGEgVHlwZXNjcmlwdCBFbnVtIHdpdGggb25lIHN5bWJvbCBmb3IgZWFjaCBub250ZXJtaW5hbCB1c2VkIGluIHRoZSBncmFtbWFyLFxuICogICAgICAgIG1hdGNoaW5nIHRoZSBub250ZXJtaW5hbHMgd2hlbiBjb21wYXJlZCBjYXNlLWluc2Vuc2l0aXZlbHkgKHNvIFJPT1QgYW5kIFJvb3QgYW5kIHJvb3QgYXJlIHRoZSBzYW1lKS5cbiAqIEBwYXJhbSBncmFtbWFyIHRoZSBncmFtbWFyIHRvIHVzZVxuICogQHBhcmFtIG5vbnRlcm1pbmFscyB0aGUgcnVudGltZSBvYmplY3Qgb2YgdGhlIG5vbnRlcm1pbmFscyBlbnVtLiBGb3IgZXhhbXBsZSwgaWZcbiAqICAgICAgICAgICAgIGVudW0gTm9udGVybWluYWxzIHsgcm9vdCwgYSwgYiwgYyB9O1xuICogICAgICAgIHRoZW4gTm9udGVybWluYWxzIG11c3QgYmUgZXhwbGljaXRseSBwYXNzZWQgYXMgdGhpcyBydW50aW1lIHBhcmFtZXRlclxuICogICAgICAgICAgICAgIGNvbXBpbGUoZ3JhbW1hciwgTm9udGVybWluYWxzLCBOb250ZXJtaW5hbHMucm9vdCk7XG4gKiAgICAgICAgKGluIGFkZGl0aW9uIHRvIGJlaW5nIGltcGxpY2l0bHkgdXNlZCBmb3IgdGhlIHR5cGUgcGFyYW1ldGVyIE5UKVxuICogQHBhcmFtIHJvb3ROb250ZXJtaW5hbCB0aGUgZGVzaXJlZCByb290IG5vbnRlcm1pbmFsIGluIHRoZSBncmFtbWFyXG4gKiBAcmV0dXJuIGEgcGFyc2VyIGZvciB0aGUgZ2l2ZW4gZ3JhbW1hciB0aGF0IHdpbGwgc3RhcnQgcGFyc2luZyBhdCByb290Tm9udGVybWluYWwuXG4gKiBAdGhyb3dzIFBhcnNlRXJyb3IgaWYgdGhlIGdyYW1tYXIgaGFzIGEgc3ludGF4IGVycm9yXG4gKi9cbmZ1bmN0aW9uIGNvbXBpbGUoZ3JhbW1hciwgbm9udGVybWluYWxzLCByb290Tm9udGVybWluYWwpIHtcbiAgICBjb25zdCB7IHN0cmluZ1RvTm9udGVybWluYWwsIG5vbnRlcm1pbmFsVG9TdHJpbmcgfSA9IG1ha2VOb250ZXJtaW5hbENvbnZlcnRlcnMobm9udGVybWluYWxzKTtcbiAgICBjb25zdCBncmFtbWFyVHJlZSA9ICgoKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gZ3JhbW1hclBhcnNlci5wYXJzZShncmFtbWFyKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhyb3cgKGUgaW5zdGFuY2VvZiB0eXBlc18xLkludGVybmFsUGFyc2VFcnJvcikgPyBuZXcgdHlwZXNfMS5HcmFtbWFyRXJyb3IoXCJncmFtbWFyIGRvZXNuJ3QgY29tcGlsZVwiLCBlKSA6IGU7XG4gICAgICAgIH1cbiAgICB9KSgpO1xuICAgIGNvbnN0IGRlZmluaXRpb25zID0gbmV3IE1hcCgpO1xuICAgIGNvbnN0IG5vbnRlcm1pbmFsc0RlZmluZWQgPSBuZXcgU2V0KCk7IC8vIG9uIGxlZnRoYW5kLXNpZGUgb2Ygc29tZSBwcm9kdWN0aW9uXG4gICAgY29uc3Qgbm9udGVybWluYWxzVXNlZCA9IG5ldyBTZXQoKTsgLy8gb24gcmlnaHRoYW5kLXNpZGUgb2Ygc29tZSBwcm9kdWN0aW9uXG4gICAgLy8gcHJvZHVjdGlvbnMgb3V0c2lkZSBAc2tpcCBibG9ja3NcbiAgICBtYWtlUHJvZHVjdGlvbnMoZ3JhbW1hclRyZWUuY2hpbGRyZW5CeU5hbWUoR3JhbW1hck5ULlBST0RVQ1RJT04pLCBudWxsKTtcbiAgICAvLyBwcm9kdWN0aW9ucyBpbnNpZGUgQHNraXAgYmxvY2tzXG4gICAgZm9yIChjb25zdCBza2lwQmxvY2sgb2YgZ3JhbW1hclRyZWUuY2hpbGRyZW5CeU5hbWUoR3JhbW1hck5ULlNLSVBCTE9DSykpIHtcbiAgICAgICAgbWFrZVNraXBCbG9jayhza2lwQmxvY2spO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IG50IG9mIG5vbnRlcm1pbmFsc1VzZWQpIHtcbiAgICAgICAgaWYgKCFub250ZXJtaW5hbHNEZWZpbmVkLmhhcyhudCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyB0eXBlc18xLkdyYW1tYXJFcnJvcihcImdyYW1tYXIgaXMgbWlzc2luZyBhIGRlZmluaXRpb24gZm9yIFwiICsgbm9udGVybWluYWxUb1N0cmluZyhudCkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmICghbm9udGVybWluYWxzRGVmaW5lZC5oYXMocm9vdE5vbnRlcm1pbmFsKSkge1xuICAgICAgICB0aHJvdyBuZXcgdHlwZXNfMS5HcmFtbWFyRXJyb3IoXCJncmFtbWFyIGlzIG1pc3NpbmcgYSBkZWZpbml0aW9uIGZvciB0aGUgcm9vdCBub250ZXJtaW5hbCBcIiArIG5vbnRlcm1pbmFsVG9TdHJpbmcocm9vdE5vbnRlcm1pbmFsKSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgcGFyc2VyXzEuSW50ZXJuYWxQYXJzZXIoZGVmaW5pdGlvbnMsICgwLCBwYXJzZXJfMS5udCkocm9vdE5vbnRlcm1pbmFsLCBub250ZXJtaW5hbFRvU3RyaW5nKHJvb3ROb250ZXJtaW5hbCkpLCBub250ZXJtaW5hbFRvU3RyaW5nKTtcbiAgICBmdW5jdGlvbiBtYWtlUHJvZHVjdGlvbnMocHJvZHVjdGlvbnMsIHNraXApIHtcbiAgICAgICAgZm9yIChjb25zdCBwcm9kdWN0aW9uIG9mIHByb2R1Y3Rpb25zKSB7XG4gICAgICAgICAgICBjb25zdCBub250ZXJtaW5hbE5hbWUgPSBwcm9kdWN0aW9uLmNoaWxkcmVuQnlOYW1lKEdyYW1tYXJOVC5OT05URVJNSU5BTClbMF0udGV4dDtcbiAgICAgICAgICAgIGNvbnN0IG5vbnRlcm1pbmFsID0gc3RyaW5nVG9Ob250ZXJtaW5hbChub250ZXJtaW5hbE5hbWUpO1xuICAgICAgICAgICAgbm9udGVybWluYWxzRGVmaW5lZC5hZGQobm9udGVybWluYWwpO1xuICAgICAgICAgICAgbGV0IGV4cHJlc3Npb24gPSBtYWtlR3JhbW1hclRlcm0ocHJvZHVjdGlvbi5jaGlsZHJlbkJ5TmFtZShHcmFtbWFyTlQuVU5JT04pWzBdLCBza2lwKTtcbiAgICAgICAgICAgIGlmIChza2lwKVxuICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSAoMCwgcGFyc2VyXzEuY2F0KShza2lwLCBleHByZXNzaW9uLCBza2lwKTtcbiAgICAgICAgICAgIGlmIChkZWZpbml0aW9ucy5oYXMobm9udGVybWluYWwpKSB7XG4gICAgICAgICAgICAgICAgLy8gZ3JhbW1hciBhbHJlYWR5IGhhcyBhIHByb2R1Y3Rpb24gZm9yIHRoaXMgbm9udGVybWluYWw7IG9yIGV4cHJlc3Npb24gb250byBpdFxuICAgICAgICAgICAgICAgIGRlZmluaXRpb25zLnNldChub250ZXJtaW5hbCwgKDAsIHBhcnNlcl8xLm9yKShkZWZpbml0aW9ucy5nZXQobm9udGVybWluYWwpLCBleHByZXNzaW9uKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBkZWZpbml0aW9ucy5zZXQobm9udGVybWluYWwsIGV4cHJlc3Npb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIG1ha2VTa2lwQmxvY2soc2tpcEJsb2NrKSB7XG4gICAgICAgIGNvbnN0IG5vbnRlcm1pbmFsTmFtZSA9IHNraXBCbG9jay5jaGlsZHJlbkJ5TmFtZShHcmFtbWFyTlQuTk9OVEVSTUlOQUwpWzBdLnRleHQ7XG4gICAgICAgIGNvbnN0IG5vbnRlcm1pbmFsID0gc3RyaW5nVG9Ob250ZXJtaW5hbChub250ZXJtaW5hbE5hbWUpO1xuICAgICAgICBub250ZXJtaW5hbHNVc2VkLmFkZChub250ZXJtaW5hbCk7XG4gICAgICAgIGNvbnN0IHNraXBUZXJtID0gKDAsIHBhcnNlcl8xLnNraXApKCgwLCBwYXJzZXJfMS5udCkobm9udGVybWluYWwsIG5vbnRlcm1pbmFsTmFtZSkpO1xuICAgICAgICBtYWtlUHJvZHVjdGlvbnMoc2tpcEJsb2NrLmNoaWxkcmVuQnlOYW1lKEdyYW1tYXJOVC5QUk9EVUNUSU9OKSwgc2tpcFRlcm0pO1xuICAgIH1cbiAgICBmdW5jdGlvbiBtYWtlR3JhbW1hclRlcm0odHJlZSwgc2tpcCkge1xuICAgICAgICBzd2l0Y2ggKHRyZWUubmFtZSkge1xuICAgICAgICAgICAgY2FzZSBHcmFtbWFyTlQuVU5JT046IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjaGlsZGV4cHJzID0gdHJlZS5jaGlsZHJlbkJ5TmFtZShHcmFtbWFyTlQuQ09OQ0FURU5BVElPTikubWFwKGNoaWxkID0+IG1ha2VHcmFtbWFyVGVybShjaGlsZCwgc2tpcCkpO1xuICAgICAgICAgICAgICAgIHJldHVybiBjaGlsZGV4cHJzLmxlbmd0aCA9PSAxID8gY2hpbGRleHByc1swXSA6ICgwLCBwYXJzZXJfMS5vcikoLi4uY2hpbGRleHBycyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIEdyYW1tYXJOVC5DT05DQVRFTkFUSU9OOiB7XG4gICAgICAgICAgICAgICAgbGV0IGNoaWxkZXhwcnMgPSB0cmVlLmNoaWxkcmVuQnlOYW1lKEdyYW1tYXJOVC5SRVBFVElUSU9OKS5tYXAoY2hpbGQgPT4gbWFrZUdyYW1tYXJUZXJtKGNoaWxkLCBza2lwKSk7XG4gICAgICAgICAgICAgICAgaWYgKHNraXApIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaW5zZXJ0IHNraXAgYmV0d2VlbiBlYWNoIHBhaXIgb2YgY2hpbGRyZW5cbiAgICAgICAgICAgICAgICAgICAgbGV0IGNoaWxkcmVuV2l0aFNraXBzID0gW107XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgY2hpbGQgb2YgY2hpbGRleHBycykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkcmVuV2l0aFNraXBzLmxlbmd0aCA+IDApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW5XaXRoU2tpcHMucHVzaChza2lwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuV2l0aFNraXBzLnB1c2goY2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNoaWxkZXhwcnMgPSBjaGlsZHJlbldpdGhTa2lwcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIChjaGlsZGV4cHJzLmxlbmd0aCA9PSAxKSA/IGNoaWxkZXhwcnNbMF0gOiAoMCwgcGFyc2VyXzEuY2F0KSguLi5jaGlsZGV4cHJzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgR3JhbW1hck5ULlJFUEVUSVRJT046IHtcbiAgICAgICAgICAgICAgICBjb25zdCB1bml0ID0gbWFrZUdyYW1tYXJUZXJtKHRyZWUuY2hpbGRyZW5CeU5hbWUoR3JhbW1hck5ULlVOSVQpWzBdLCBza2lwKTtcbiAgICAgICAgICAgICAgICBjb25zdCBvcCA9IHRyZWUuY2hpbGRyZW5CeU5hbWUoR3JhbW1hck5ULlJFUEVBVE9QRVJBVE9SKVswXTtcbiAgICAgICAgICAgICAgICBpZiAoIW9wKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB1bml0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdW5pdFdpdGhTa2lwID0gc2tpcCA/ICgwLCBwYXJzZXJfMS5jYXQpKHVuaXQsIHNraXApIDogdW5pdDtcbiAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnb3AgaXMnLCBvcCk7XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAob3AudGV4dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnKic6IHJldHVybiAoMCwgcGFyc2VyXzEuc3RhcikodW5pdFdpdGhTa2lwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJysnOiByZXR1cm4gKDAsIHBhcnNlcl8xLnBsdXMpKHVuaXRXaXRoU2tpcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICc/JzogcmV0dXJuICgwLCBwYXJzZXJfMS5vcHRpb24pKHVuaXRXaXRoU2tpcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3AgaXMge24sbX0gb3Igb25lIG9mIGl0cyB2YXJpYW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJhbmdlID0gb3AuY2hpbGRyZW5bMF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChyYW5nZS5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgR3JhbW1hck5ULk5VTUJFUjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbiA9IHBhcnNlSW50KHJhbmdlLnRleHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgwLCBwYXJzZXJfMS5yZXBlYXQpKHVuaXRXaXRoU2tpcCwgbmV3IHBhcnNlcl8xLkJldHdlZW4obiwgbikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBHcmFtbWFyTlQuUkFOR0U6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG4gPSBwYXJzZUludChyYW5nZS5jaGlsZHJlblswXS50ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG0gPSBwYXJzZUludChyYW5nZS5jaGlsZHJlblsxXS50ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoMCwgcGFyc2VyXzEucmVwZWF0KSh1bml0V2l0aFNraXAsIG5ldyBwYXJzZXJfMS5CZXR3ZWVuKG4sIG0pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgR3JhbW1hck5ULlVQUEVSQk9VTkQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG0gPSBwYXJzZUludChyYW5nZS5jaGlsZHJlblswXS50ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoMCwgcGFyc2VyXzEucmVwZWF0KSh1bml0V2l0aFNraXAsIG5ldyBwYXJzZXJfMS5CZXR3ZWVuKDAsIG0pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgR3JhbW1hck5ULkxPV0VSQk9VTkQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG4gPSBwYXJzZUludChyYW5nZS5jaGlsZHJlblswXS50ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoMCwgcGFyc2VyXzEucmVwZWF0KSh1bml0V2l0aFNraXAsIG5ldyBwYXJzZXJfMS5BdExlYXN0KG4pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludGVybmFsIGVycm9yOiB1bmtub3duIHJhbmdlOiAnICsgcmFuZ2UubmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBHcmFtbWFyTlQuVU5JVDpcbiAgICAgICAgICAgICAgICByZXR1cm4gbWFrZUdyYW1tYXJUZXJtKHRyZWUuY2hpbGRyZW5CeU5hbWUoR3JhbW1hck5ULk5PTlRFUk1JTkFMKVswXVxuICAgICAgICAgICAgICAgICAgICB8fCB0cmVlLmNoaWxkcmVuQnlOYW1lKEdyYW1tYXJOVC5URVJNSU5BTClbMF1cbiAgICAgICAgICAgICAgICAgICAgfHwgdHJlZS5jaGlsZHJlbkJ5TmFtZShHcmFtbWFyTlQuVU5JT04pWzBdLCBza2lwKTtcbiAgICAgICAgICAgIGNhc2UgR3JhbW1hck5ULk5PTlRFUk1JTkFMOiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgbm9udGVybWluYWwgPSBzdHJpbmdUb05vbnRlcm1pbmFsKHRyZWUudGV4dCk7XG4gICAgICAgICAgICAgICAgbm9udGVybWluYWxzVXNlZC5hZGQobm9udGVybWluYWwpO1xuICAgICAgICAgICAgICAgIHJldHVybiAoMCwgcGFyc2VyXzEubnQpKG5vbnRlcm1pbmFsLCB0cmVlLnRleHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBHcmFtbWFyTlQuVEVSTUlOQUw6XG4gICAgICAgICAgICAgICAgc3dpdGNoICh0cmVlLmNoaWxkcmVuWzBdLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBHcmFtbWFyTlQuUVVPVEVEU1RSSU5HOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgwLCBwYXJzZXJfMS5zdHIpKHN0cmlwUXVvdGVzQW5kUmVwbGFjZUVzY2FwZVNlcXVlbmNlcyh0cmVlLnRleHQpKTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBHcmFtbWFyTlQuQ0hBUkFDVEVSU0VUOiAvLyBlLmcuIFthYmNdXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgR3JhbW1hck5ULkFOWUNIQVI6IC8vIGUuZy4gIC5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSBHcmFtbWFyTlQuQ0hBUkFDVEVSQ0xBU1M6IC8vIGUuZy4gIFxcZCAgXFxzICBcXHdcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoMCwgcGFyc2VyXzEucmVnZXgpKHRyZWUudGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludGVybmFsIGVycm9yOiB1bmtub3duIGxpdGVyYWw6ICcgKyB0cmVlLmNoaWxkcmVuWzBdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaW50ZXJuYWwgZXJyb3I6IHVua25vd24gZ3JhbW1hciBydWxlOiAnICsgdHJlZS5uYW1lKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBTdHJpcCBzdGFydGluZyBhbmQgZW5kaW5nIHF1b3Rlcy5cbiAgICAgKiBSZXBsYWNlIFxcdCwgXFxyLCBcXG4gd2l0aCB0aGVpciBjaGFyYWN0ZXIgY29kZXMuXG4gICAgICogUmVwbGFjZXMgYWxsIG90aGVyIFxceCB3aXRoIGxpdGVyYWwgeC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBzdHJpcFF1b3Rlc0FuZFJlcGxhY2VFc2NhcGVTZXF1ZW5jZXMocykge1xuICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoc1swXSA9PSAnXCInIHx8IHNbMF0gPT0gXCInXCIpO1xuICAgICAgICBzID0gcy5zdWJzdHJpbmcoMSwgcy5sZW5ndGggLSAxKTtcbiAgICAgICAgcyA9IHMucmVwbGFjZSgvXFxcXCguKS9nLCAobWF0Y2gsIGVzY2FwZWRDaGFyKSA9PiB7XG4gICAgICAgICAgICBzd2l0Y2ggKGVzY2FwZWRDaGFyKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAndCc6IHJldHVybiAnXFx0JztcbiAgICAgICAgICAgICAgICBjYXNlICdyJzogcmV0dXJuICdcXHInO1xuICAgICAgICAgICAgICAgIGNhc2UgJ24nOiByZXR1cm4gJ1xcbic7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDogcmV0dXJuIGVzY2FwZWRDaGFyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHM7XG4gICAgfVxufVxuZXhwb3J0cy5jb21waWxlID0gY29tcGlsZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNvbXBpbGVyLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5pbmRlbnQgPSBleHBvcnRzLnNuaXBwZXQgPSBleHBvcnRzLmVzY2FwZUZvclJlYWRpbmcgPSBleHBvcnRzLnRvQ29sdW1uID0gZXhwb3J0cy50b0xpbmUgPSBleHBvcnRzLmRlc2NyaWJlTG9jYXRpb24gPSBleHBvcnRzLm1ha2VFcnJvck1lc3NhZ2UgPSB2b2lkIDA7XG4vKipcbiAqIE1ha2UgYSBodW1hbi1yZWFkYWJsZSBlcnJvciBtZXNzYWdlIGV4cGxhaW5pbmcgYSBwYXJzZSBlcnJvciBhbmQgd2hlcmUgaXQgd2FzIGZvdW5kIGluIHRoZSBpbnB1dC5cbiAqIEBwYXJhbSBtZXNzYWdlIGJyaWVmIG1lc3NhZ2Ugc3RhdGluZyB3aGF0IGVycm9yIG9jY3VycmVkXG4gKiBAcGFyYW0gbm9udGVybWluYWxOYW1lIG5hbWUgb2YgZGVlcGVzdCBub250ZXJtaW5hbCB0aGF0IHBhcnNlciB3YXMgdHJ5aW5nIHRvIG1hdGNoIHdoZW4gcGFyc2UgZmFpbGVkXG4gKiBAcGFyYW0gZXhwZWN0ZWRUZXh0IGh1bWFuLXJlYWRhYmxlIGRlc2NyaXB0aW9uIG9mIHdoYXQgc3RyaW5nIGxpdGVyYWxzIHRoZSBwYXJzZXIgd2FzIGV4cGVjdGluZyB0aGVyZTtcbiAqICAgICAgICAgICAgZS5nLiBcIjtcIiwgXCJbIFxcclxcblxcdF1cIiwgXCIxfDJ8M1wiXG4gKiBAcGFyYW0gc3RyaW5nQmVpbmdQYXJzZWQgb3JpZ2luYWwgaW5wdXQgdG8gcGFyc2UoKVxuICogQHBhcmFtIHBvcyBvZmZzZXQgaW4gc3RyaW5nQmVpbmdQYXJzZWQgd2hlcmUgZXJyb3Igb2NjdXJyZWRcbiAqIEBwYXJhbSBuYW1lT2ZTdHJpbmdCZWluZ1BhcnNlZCBodW1hbi1yZWFkYWJsZSBkZXNjcmlwdGlvbiBvZiB3aGVyZSBzdHJpbmdCZWluZ1BhcnNlZCBjYW1lIGZyb207XG4gKiAgICAgICAgICAgICBlLmcuIFwiZ3JhbW1hclwiIGlmIHN0cmluZ0JlaW5nUGFyc2VkIHdhcyB0aGUgaW5wdXQgdG8gUGFyc2VyLmNvbXBpbGUoKSxcbiAqICAgICAgICAgICAgIG9yIFwic3RyaW5nIGJlaW5nIHBhcnNlZFwiIGlmIHN0cmluZ0JlaW5nUGFyc2VkIHdhcyB0aGUgaW5wdXQgdG8gUGFyc2VyLnBhcnNlKClcbiAqIEByZXR1cm4gYSBtdWx0aWxpbmUgaHVtYW4tcmVhZGFibGUgbWVzc2FnZSB0aGF0IHN0YXRlcyB0aGUgZXJyb3IsIGl0cyBsb2NhdGlvbiBpbiB0aGUgaW5wdXQsXG4gKiAgICAgICAgIHdoYXQgdGV4dCB3YXMgZXhwZWN0ZWQgYW5kIHdoYXQgdGV4dCB3YXMgYWN0dWFsbHkgZm91bmQuXG4gKi9cbmZ1bmN0aW9uIG1ha2VFcnJvck1lc3NhZ2UobWVzc2FnZSwgbm9udGVybWluYWxOYW1lLCBleHBlY3RlZFRleHQsIHN0cmluZ0JlaW5nUGFyc2VkLCBwb3MsIG5hbWVPZlN0cmluZ0JlaW5nUGFyc2VkKSB7XG4gICAgbGV0IHJlc3VsdCA9IG1lc3NhZ2U7XG4gICAgaWYgKHJlc3VsdC5sZW5ndGggPiAwKVxuICAgICAgICByZXN1bHQgKz0gXCJcXG5cIjtcbiAgICByZXN1bHQgKz1cbiAgICAgICAgXCJFcnJvciBhdCBcIiArIGRlc2NyaWJlTG9jYXRpb24oc3RyaW5nQmVpbmdQYXJzZWQsIHBvcykgKyBcIiBvZiBcIiArIG5hbWVPZlN0cmluZ0JlaW5nUGFyc2VkICsgXCJcXG5cIlxuICAgICAgICAgICAgKyBcIiAgdHJ5aW5nIHRvIG1hdGNoIFwiICsgbm9udGVybWluYWxOYW1lLnRvVXBwZXJDYXNlKCkgKyBcIlxcblwiXG4gICAgICAgICAgICArIFwiICBleHBlY3RlZCBcIiArIGVzY2FwZUZvclJlYWRpbmcoZXhwZWN0ZWRUZXh0LCBcIlwiKVxuICAgICAgICAgICAgKyAoKHN0cmluZ0JlaW5nUGFyc2VkLmxlbmd0aCA+IDApXG4gICAgICAgICAgICAgICAgPyBcIlxcbiAgIGJ1dCBzYXcgXCIgKyBzbmlwcGV0KHN0cmluZ0JlaW5nUGFyc2VkLCBwb3MpXG4gICAgICAgICAgICAgICAgOiBcIlwiKTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZXhwb3J0cy5tYWtlRXJyb3JNZXNzYWdlID0gbWFrZUVycm9yTWVzc2FnZTtcbi8qKlxuICogQHBhcmFtIHN0cmluZyB0byBkZXNjcmliZVxuICogQHBhcmFtIHBvcyBvZmZzZXQgaW4gc3RyaW5nLCAwPD1wb3M8c3RyaW5nLmxlbmd0aCgpXG4gKiBAcmV0dXJuIGEgaHVtYW4tcmVhZGFibGUgZGVzY3JpcHRpb24gb2YgdGhlIGxvY2F0aW9uIG9mIHRoZSBjaGFyYWN0ZXIgYXQgb2Zmc2V0IHBvcyBpbiBzdHJpbmdcbiAqICh1c2luZyBvZmZzZXQgYW5kL29yIGxpbmUvY29sdW1uIGlmIGFwcHJvcHJpYXRlKVxuICovXG5mdW5jdGlvbiBkZXNjcmliZUxvY2F0aW9uKHMsIHBvcykge1xuICAgIGxldCByZXN1bHQgPSBcIm9mZnNldCBcIiArIHBvcztcbiAgICBpZiAocy5pbmRleE9mKCdcXG4nKSAhPSAtMSkge1xuICAgICAgICByZXN1bHQgKz0gXCIgKGxpbmUgXCIgKyB0b0xpbmUocywgcG9zKSArIFwiIGNvbHVtbiBcIiArIHRvQ29sdW1uKHMsIHBvcykgKyBcIilcIjtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbmV4cG9ydHMuZGVzY3JpYmVMb2NhdGlvbiA9IGRlc2NyaWJlTG9jYXRpb247XG4vKipcbiAqIFRyYW5zbGF0ZXMgYSBzdHJpbmcgb2Zmc2V0IGludG8gYSBsaW5lIG51bWJlci5cbiAqIEBwYXJhbSBzdHJpbmcgaW4gd2hpY2ggb2Zmc2V0IG9jY3Vyc1xuICogQHBhcmFtIHBvcyBvZmZzZXQgaW4gc3RyaW5nLCAwPD1wb3M8c3RyaW5nLmxlbmd0aCgpXG4gKiBAcmV0dXJuIHRoZSAxLWJhc2VkIGxpbmUgbnVtYmVyIG9mIHRoZSBjaGFyYWN0ZXIgYXQgb2Zmc2V0IHBvcyBpbiBzdHJpbmcsXG4gKiBhcyBpZiBzdHJpbmcgd2VyZSBiZWluZyB2aWV3ZWQgaW4gYSB0ZXh0IGVkaXRvclxuICovXG5mdW5jdGlvbiB0b0xpbmUocywgcG9zKSB7XG4gICAgbGV0IGxpbmVDb3VudCA9IDE7XG4gICAgZm9yIChsZXQgbmV3bGluZSA9IHMuaW5kZXhPZignXFxuJyk7IG5ld2xpbmUgIT0gLTEgJiYgbmV3bGluZSA8IHBvczsgbmV3bGluZSA9IHMuaW5kZXhPZignXFxuJywgbmV3bGluZSArIDEpKSB7XG4gICAgICAgICsrbGluZUNvdW50O1xuICAgIH1cbiAgICByZXR1cm4gbGluZUNvdW50O1xufVxuZXhwb3J0cy50b0xpbmUgPSB0b0xpbmU7XG4vKipcbiAqIFRyYW5zbGF0ZXMgYSBzdHJpbmcgb2Zmc2V0IGludG8gYSBjb2x1bW4gbnVtYmVyLlxuICogQHBhcmFtIHN0cmluZyBpbiB3aGljaCBvZmZzZXQgb2NjdXJzXG4gKiBAcGFyYW0gcG9zIG9mZnNldCBpbiBzdHJpbmcsIDA8PXBvczxzdHJpbmcubGVuZ3RoKClcbiAqIEByZXR1cm4gdGhlIDEtYmFzZWQgY29sdW1uIG51bWJlciBvZiB0aGUgY2hhcmFjdGVyIGF0IG9mZnNldCBwb3MgaW4gc3RyaW5nLFxuICogYXMgaWYgc3RyaW5nIHdlcmUgYmVpbmcgdmlld2VkIGluIGEgdGV4dCBlZGl0b3Igd2l0aCB0YWIgc2l6ZSAxIChpLmUuIGEgdGFiIGlzIHRyZWF0ZWQgbGlrZSBhIHNwYWNlKVxuICovXG5mdW5jdGlvbiB0b0NvbHVtbihzLCBwb3MpIHtcbiAgICBjb25zdCBsYXN0TmV3bGluZUJlZm9yZVBvcyA9IHMubGFzdEluZGV4T2YoJ1xcbicsIHBvcyAtIDEpO1xuICAgIGNvbnN0IHRvdGFsU2l6ZU9mUHJlY2VkaW5nTGluZXMgPSAobGFzdE5ld2xpbmVCZWZvcmVQb3MgIT0gLTEpID8gbGFzdE5ld2xpbmVCZWZvcmVQb3MgKyAxIDogMDtcbiAgICByZXR1cm4gcG9zIC0gdG90YWxTaXplT2ZQcmVjZWRpbmdMaW5lcyArIDE7XG59XG5leHBvcnRzLnRvQ29sdW1uID0gdG9Db2x1bW47XG4vKipcbiogUmVwbGFjZSBjb21tb24gdW5wcmludGFibGUgY2hhcmFjdGVycyBieSB0aGVpciBlc2NhcGUgY29kZXMsIGZvciBodW1hbiByZWFkaW5nLlxuKiBTaG91bGQgYmUgaWRlbXBvdGVudCwgaS5lLiBpZiB4ID0gZXNjYXBlRm9yUmVhZGluZyh5KSwgdGhlbiB4LmVxdWFscyhlc2NhcGVGb3JSZWFkaW5nKHgpKS5cbiogQHBhcmFtIHN0cmluZyB0byBlc2NhcGVcbiogQHBhcmFtIHF1b3RlIHF1b3RlcyB0byBwdXQgYXJvdW5kIHN0cmluZywgb3IgXCJcIiBpZiBubyBxdW90ZXMgcmVxdWlyZWRcbiogQHJldHVybiBzdHJpbmcgd2l0aCBlc2NhcGUgY29kZXMgcmVwbGFjZWQsIHByZWNlZGVkIGFuZCBmb2xsb3dlZCBieSBxdW90ZSwgd2l0aCBhIGh1bWFuLXJlYWRhYmxlIGxlZ2VuZCBhcHBlbmRlZCB0byB0aGUgZW5kXG4qICAgICAgICAgZXhwbGFpbmluZyB3aGF0IHRoZSByZXBsYWNlbWVudCBjaGFyYWN0ZXJzIG1lYW4uXG4qL1xuZnVuY3Rpb24gZXNjYXBlRm9yUmVhZGluZyhzLCBxdW90ZSkge1xuICAgIGxldCByZXN1bHQgPSBzO1xuICAgIGNvbnN0IGxlZ2VuZCA9IFtdO1xuICAgIGZvciAoY29uc3QgeyB1bnByaW50YWJsZUNoYXIsIGh1bWFuUmVhZGFibGVWZXJzaW9uLCBkZXNjcmlwdGlvbiB9IG9mIEVTQ0FQRVMpIHtcbiAgICAgICAgaWYgKHJlc3VsdC5pbmNsdWRlcyh1bnByaW50YWJsZUNoYXIpKSB7XG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZSh1bnByaW50YWJsZUNoYXIsIGh1bWFuUmVhZGFibGVWZXJzaW9uKTtcbiAgICAgICAgICAgIGxlZ2VuZC5wdXNoKGh1bWFuUmVhZGFibGVWZXJzaW9uICsgXCIgbWVhbnMgXCIgKyBkZXNjcmlwdGlvbik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmVzdWx0ID0gcXVvdGUgKyByZXN1bHQgKyBxdW90ZTtcbiAgICBpZiAobGVnZW5kLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmVzdWx0ICs9IFwiICh3aGVyZSBcIiArIGxlZ2VuZC5qb2luKFwiLCBcIikgKyBcIilcIjtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbmV4cG9ydHMuZXNjYXBlRm9yUmVhZGluZyA9IGVzY2FwZUZvclJlYWRpbmc7XG5jb25zdCBFU0NBUEVTID0gW1xuICAgIHtcbiAgICAgICAgdW5wcmludGFibGVDaGFyOiBcIlxcblwiLFxuICAgICAgICBodW1hblJlYWRhYmxlVmVyc2lvbjogXCJcXHUyNDI0XCIsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIm5ld2xpbmVcIlxuICAgIH0sXG4gICAge1xuICAgICAgICB1bnByaW50YWJsZUNoYXI6IFwiXFxyXCIsXG4gICAgICAgIGh1bWFuUmVhZGFibGVWZXJzaW9uOiBcIlxcdTI0MERcIixcbiAgICAgICAgZGVzY3JpcHRpb246IFwiY2FycmlhZ2UgcmV0dXJuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgdW5wcmludGFibGVDaGFyOiBcIlxcdFwiLFxuICAgICAgICBodW1hblJlYWRhYmxlVmVyc2lvbjogXCJcXHUyMUU1XCIsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcInRhYlwiXG4gICAgfSxcbl07XG4vKipcbiAqIEBwYXJhbSBzdHJpbmcgdG8gc2hvcnRlblxuICogQHBhcmFtIHBvcyBvZmZzZXQgaW4gc3RyaW5nLCAwPD1wb3M8c3RyaW5nLmxlbmd0aCgpXG4gKiBAcmV0dXJuIGEgc2hvcnQgc25pcHBldCBvZiB0aGUgcGFydCBvZiBzdHJpbmcgc3RhcnRpbmcgYXQgb2Zmc2V0IHBvcyxcbiAqIGluIGh1bWFuLXJlYWRhYmxlIGZvcm1cbiAqL1xuZnVuY3Rpb24gc25pcHBldChzLCBwb3MpIHtcbiAgICBjb25zdCBtYXhDaGFyc1RvU2hvdyA9IDEwO1xuICAgIGNvbnN0IGVuZCA9IE1hdGgubWluKHBvcyArIG1heENoYXJzVG9TaG93LCBzLmxlbmd0aCk7XG4gICAgbGV0IHJlc3VsdCA9IHMuc3Vic3RyaW5nKHBvcywgZW5kKSArIChlbmQgPCBzLmxlbmd0aCA/IFwiLi4uXCIgOiBcIlwiKTtcbiAgICBpZiAocmVzdWx0Lmxlbmd0aCA9PSAwKVxuICAgICAgICByZXN1bHQgPSBcImVuZCBvZiBzdHJpbmdcIjtcbiAgICByZXR1cm4gZXNjYXBlRm9yUmVhZGluZyhyZXN1bHQsIFwiXCIpO1xufVxuZXhwb3J0cy5zbmlwcGV0ID0gc25pcHBldDtcbi8qKlxuICogSW5kZW50IGEgbXVsdGktbGluZSBzdHJpbmcgYnkgcHJlY2VkaW5nIGVhY2ggbGluZSB3aXRoIHByZWZpeC5cbiAqIEBwYXJhbSBzdHJpbmcgc3RyaW5nIHRvIGluZGVudFxuICogQHBhcmFtIHByZWZpeCBwcmVmaXggdG8gdXNlIGZvciBpbmRlbnRpbmdcbiAqIEByZXR1cm4gc3RyaW5nIHdpdGggcHJlZml4IGluc2VydGVkIGF0IHRoZSBzdGFydCBvZiBlYWNoIGxpbmVcbiAqL1xuZnVuY3Rpb24gaW5kZW50KHMsIHByZWZpeCkge1xuICAgIGxldCByZXN1bHQgPSBcIlwiO1xuICAgIGxldCBjaGFyc0NvcGllZCA9IDA7XG4gICAgZG8ge1xuICAgICAgICBjb25zdCBuZXdsaW5lID0gcy5pbmRleE9mKCdcXG4nLCBjaGFyc0NvcGllZCk7XG4gICAgICAgIGNvbnN0IGVuZE9mTGluZSA9IG5ld2xpbmUgIT0gLTEgPyBuZXdsaW5lICsgMSA6IHMubGVuZ3RoO1xuICAgICAgICByZXN1bHQgKz0gcHJlZml4ICsgcy5zdWJzdHJpbmcoY2hhcnNDb3BpZWQsIGVuZE9mTGluZSk7XG4gICAgICAgIGNoYXJzQ29waWVkID0gZW5kT2ZMaW5lO1xuICAgIH0gd2hpbGUgKGNoYXJzQ29waWVkIDwgcy5sZW5ndGgpO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5leHBvcnRzLmluZGVudCA9IGluZGVudDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRpc3BsYXkuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLlBhcnNlclN0YXRlID0gZXhwb3J0cy5GYWlsZWRQYXJzZSA9IGV4cG9ydHMuU3VjY2Vzc2Z1bFBhcnNlID0gZXhwb3J0cy5JbnRlcm5hbFBhcnNlciA9IGV4cG9ydHMuZmFpbGZhc3QgPSBleHBvcnRzLnNraXAgPSBleHBvcnRzLm9wdGlvbiA9IGV4cG9ydHMucGx1cyA9IGV4cG9ydHMuc3RhciA9IGV4cG9ydHMucmVwZWF0ID0gZXhwb3J0cy5aRVJPX09SX09ORSA9IGV4cG9ydHMuT05FX09SX01PUkUgPSBleHBvcnRzLlpFUk9fT1JfTU9SRSA9IGV4cG9ydHMuQmV0d2VlbiA9IGV4cG9ydHMuQXRMZWFzdCA9IGV4cG9ydHMub3IgPSBleHBvcnRzLmNhdCA9IGV4cG9ydHMuc3RyID0gZXhwb3J0cy5yZWdleCA9IGV4cG9ydHMubnQgPSB2b2lkIDA7XG5jb25zdCBhc3NlcnRfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiYXNzZXJ0XCIpKTtcbmNvbnN0IHR5cGVzXzEgPSByZXF1aXJlKFwiLi90eXBlc1wiKTtcbmNvbnN0IHBhcnNldHJlZV8xID0gcmVxdWlyZShcIi4vcGFyc2V0cmVlXCIpO1xuZnVuY3Rpb24gbnQobm9udGVybWluYWwsIG5vbnRlcm1pbmFsTmFtZSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHBhcnNlKHMsIHBvcywgZGVmaW5pdGlvbnMsIHN0YXRlKSB7XG4gICAgICAgICAgICBjb25zdCBndCA9IGRlZmluaXRpb25zLmdldChub250ZXJtaW5hbCk7XG4gICAgICAgICAgICBpZiAoZ3QgPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgdHlwZXNfMS5HcmFtbWFyRXJyb3IoXCJub250ZXJtaW5hbCBoYXMgbm8gZGVmaW5pdGlvbjogXCIgKyBub250ZXJtaW5hbE5hbWUpO1xuICAgICAgICAgICAgLy8gY29uc29sZS5lcnJvcihcImVudGVyaW5nXCIsIG5vbnRlcm1pbmFsTmFtZSk7XG4gICAgICAgICAgICBzdGF0ZS5lbnRlcihwb3MsIG5vbnRlcm1pbmFsKTtcbiAgICAgICAgICAgIGxldCBwciA9IGd0LnBhcnNlKHMsIHBvcywgZGVmaW5pdGlvbnMsIHN0YXRlKTtcbiAgICAgICAgICAgIHN0YXRlLmxlYXZlKG5vbnRlcm1pbmFsKTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUuZXJyb3IoXCJsZWF2aW5nXCIsIG5vbnRlcm1pbmFsTmFtZSwgXCJ3aXRoIHJlc3VsdFwiLCBwcik7XG4gICAgICAgICAgICBpZiAoIXByLmZhaWxlZCAmJiAhc3RhdGUuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdHJlZSA9IHByLnRyZWU7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3VHJlZSA9IHN0YXRlLm1ha2VQYXJzZVRyZWUodHJlZS5zdGFydCwgdHJlZS50ZXh0LCBbdHJlZV0pO1xuICAgICAgICAgICAgICAgIHByID0gcHIucmVwbGFjZVRyZWUobmV3VHJlZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHI7XG4gICAgICAgIH0sXG4gICAgICAgIHRvU3RyaW5nKCkge1xuICAgICAgICAgICAgcmV0dXJuIG5vbnRlcm1pbmFsTmFtZTtcbiAgICAgICAgfVxuICAgIH07XG59XG5leHBvcnRzLm50ID0gbnQ7XG5mdW5jdGlvbiByZWdleChyZWdleFNvdXJjZSkge1xuICAgIGxldCByZWdleCA9IG5ldyBSZWdFeHAoJ14nICsgcmVnZXhTb3VyY2UgKyAnJCcsICdzJyk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcGFyc2UocywgcG9zLCBkZWZpbml0aW9ucywgc3RhdGUpIHtcbiAgICAgICAgICAgIGlmIChwb3MgPj0gcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhdGUubWFrZUZhaWxlZFBhcnNlKHBvcywgcmVnZXhTb3VyY2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgbCA9IHMuc3Vic3RyaW5nKHBvcywgcG9zICsgMSk7XG4gICAgICAgICAgICBpZiAocmVnZXgudGVzdChsKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzdGF0ZS5tYWtlU3VjY2Vzc2Z1bFBhcnNlKHBvcywgcG9zICsgMSwgbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gc3RhdGUubWFrZUZhaWxlZFBhcnNlKHBvcywgcmVnZXhTb3VyY2UpO1xuICAgICAgICB9LFxuICAgICAgICB0b1N0cmluZygpIHtcbiAgICAgICAgICAgIHJldHVybiByZWdleFNvdXJjZTtcbiAgICAgICAgfVxuICAgIH07XG59XG5leHBvcnRzLnJlZ2V4ID0gcmVnZXg7XG5mdW5jdGlvbiBzdHIoc3RyKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcGFyc2UocywgcG9zLCBkZWZpbml0aW9ucywgc3RhdGUpIHtcbiAgICAgICAgICAgIGNvbnN0IG5ld3BvcyA9IHBvcyArIHN0ci5sZW5ndGg7XG4gICAgICAgICAgICBpZiAobmV3cG9zID4gcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhdGUubWFrZUZhaWxlZFBhcnNlKHBvcywgc3RyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGwgPSBzLnN1YnN0cmluZyhwb3MsIG5ld3Bvcyk7XG4gICAgICAgICAgICBpZiAobCA9PT0gc3RyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YXRlLm1ha2VTdWNjZXNzZnVsUGFyc2UocG9zLCBuZXdwb3MsIGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlLm1ha2VGYWlsZWRQYXJzZShwb3MsIHN0cik7XG4gICAgICAgIH0sXG4gICAgICAgIHRvU3RyaW5nKCkge1xuICAgICAgICAgICAgcmV0dXJuIFwiJ1wiICsgc3RyLnJlcGxhY2UoLydcXHJcXG5cXHRcXFxcLywgXCJcXFxcJCZcIikgKyBcIidcIjtcbiAgICAgICAgfVxuICAgIH07XG59XG5leHBvcnRzLnN0ciA9IHN0cjtcbmZ1bmN0aW9uIGNhdCguLi50ZXJtcykge1xuICAgIHJldHVybiB7XG4gICAgICAgIHBhcnNlKHMsIHBvcywgZGVmaW5pdGlvbnMsIHN0YXRlKSB7XG4gICAgICAgICAgICBsZXQgcHJvdXQgPSBzdGF0ZS5tYWtlU3VjY2Vzc2Z1bFBhcnNlKHBvcywgcG9zKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgZ3Qgb2YgdGVybXMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwciA9IGd0LnBhcnNlKHMsIHBvcywgZGVmaW5pdGlvbnMsIHN0YXRlKTtcbiAgICAgICAgICAgICAgICBpZiAocHIuZmFpbGVkKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHI7XG4gICAgICAgICAgICAgICAgcG9zID0gcHIucG9zO1xuICAgICAgICAgICAgICAgIHByb3V0ID0gcHJvdXQubWVyZ2VSZXN1bHQocHIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb3V0O1xuICAgICAgICB9LFxuICAgICAgICB0b1N0cmluZygpIHtcbiAgICAgICAgICAgIHJldHVybiBcIihcIiArIHRlcm1zLm1hcCh0ZXJtID0+IHRlcm0udG9TdHJpbmcoKSkuam9pbihcIiBcIikgKyBcIilcIjtcbiAgICAgICAgfVxuICAgIH07XG59XG5leHBvcnRzLmNhdCA9IGNhdDtcbi8qKlxuICogQHBhcmFtIGNob2ljZXMgbXVzdCBiZSBub25lbXB0eVxuICovXG5mdW5jdGlvbiBvciguLi5jaG9pY2VzKSB7XG4gICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKGNob2ljZXMubGVuZ3RoID4gMCk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcGFyc2UocywgcG9zLCBkZWZpbml0aW9ucywgc3RhdGUpIHtcbiAgICAgICAgICAgIGNvbnN0IHN1Y2Nlc3NlcyA9IFtdO1xuICAgICAgICAgICAgY29uc3QgZmFpbHVyZXMgPSBbXTtcbiAgICAgICAgICAgIGNob2ljZXMuZm9yRWFjaCgoY2hvaWNlKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gY2hvaWNlLnBhcnNlKHMsIHBvcywgZGVmaW5pdGlvbnMsIHN0YXRlKTtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0LmZhaWxlZCkge1xuICAgICAgICAgICAgICAgICAgICBmYWlsdXJlcy5wdXNoKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzZXMucHVzaChyZXN1bHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHN1Y2Nlc3Nlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9uZ2VzdFN1Y2Nlc3NlcyA9IGxvbmdlc3RSZXN1bHRzKHN1Y2Nlc3Nlcyk7XG4gICAgICAgICAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKGxvbmdlc3RTdWNjZXNzZXMubGVuZ3RoID4gMCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxvbmdlc3RTdWNjZXNzZXNbMF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBsb25nZXN0RmFpbHVyZXMgPSBsb25nZXN0UmVzdWx0cyhmYWlsdXJlcyk7XG4gICAgICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkobG9uZ2VzdEZhaWx1cmVzLmxlbmd0aCA+IDApO1xuICAgICAgICAgICAgcmV0dXJuIHN0YXRlLm1ha2VGYWlsZWRQYXJzZShsb25nZXN0RmFpbHVyZXNbMF0ucG9zLCBsb25nZXN0RmFpbHVyZXMubWFwKChyZXN1bHQpID0+IHJlc3VsdC5leHBlY3RlZFRleHQpLmpvaW4oXCJ8XCIpKTtcbiAgICAgICAgfSxcbiAgICAgICAgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gXCIoXCIgKyBjaG9pY2VzLm1hcChjaG9pY2UgPT4gY2hvaWNlLnRvU3RyaW5nKCkpLmpvaW4oXCJ8XCIpICsgXCIpXCI7XG4gICAgICAgIH1cbiAgICB9O1xufVxuZXhwb3J0cy5vciA9IG9yO1xuY2xhc3MgQXRMZWFzdCB7XG4gICAgY29uc3RydWN0b3IobWluKSB7XG4gICAgICAgIHRoaXMubWluID0gbWluO1xuICAgIH1cbiAgICB0b29Mb3cobikgeyByZXR1cm4gbiA8IHRoaXMubWluOyB9XG4gICAgdG9vSGlnaChuKSB7IHJldHVybiBmYWxzZTsgfVxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICBzd2l0Y2ggKHRoaXMubWluKSB7XG4gICAgICAgICAgICBjYXNlIDA6IHJldHVybiBcIipcIjtcbiAgICAgICAgICAgIGNhc2UgMTogcmV0dXJuIFwiK1wiO1xuICAgICAgICAgICAgZGVmYXVsdDogcmV0dXJuIFwie1wiICsgdGhpcy5taW4gKyBcIix9XCI7XG4gICAgICAgIH1cbiAgICB9XG59XG5leHBvcnRzLkF0TGVhc3QgPSBBdExlYXN0O1xuY2xhc3MgQmV0d2VlbiB7XG4gICAgY29uc3RydWN0b3IobWluLCBtYXgpIHtcbiAgICAgICAgdGhpcy5taW4gPSBtaW47XG4gICAgICAgIHRoaXMubWF4ID0gbWF4O1xuICAgIH1cbiAgICB0b29Mb3cobikgeyByZXR1cm4gbiA8IHRoaXMubWluOyB9XG4gICAgdG9vSGlnaChuKSB7IHJldHVybiBuID4gdGhpcy5tYXg7IH1cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgaWYgKHRoaXMubWluID09IDApIHtcbiAgICAgICAgICAgIHJldHVybiAodGhpcy5tYXggPT0gMSkgPyBcIj9cIiA6IFwieyxcIiArIHRoaXMubWF4ICsgXCJ9XCI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gXCJ7XCIgKyB0aGlzLm1pbiArIFwiLFwiICsgdGhpcy5tYXggKyBcIn1cIjtcbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydHMuQmV0d2VlbiA9IEJldHdlZW47XG5leHBvcnRzLlpFUk9fT1JfTU9SRSA9IG5ldyBBdExlYXN0KDApO1xuZXhwb3J0cy5PTkVfT1JfTU9SRSA9IG5ldyBBdExlYXN0KDEpO1xuZXhwb3J0cy5aRVJPX09SX09ORSA9IG5ldyBCZXR3ZWVuKDAsIDEpO1xuZnVuY3Rpb24gcmVwZWF0KGd0LCBob3dtYW55KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcGFyc2UocywgcG9zLCBkZWZpbml0aW9ucywgc3RhdGUpIHtcbiAgICAgICAgICAgIGxldCBwcm91dCA9IHN0YXRlLm1ha2VTdWNjZXNzZnVsUGFyc2UocG9zLCBwb3MpO1xuICAgICAgICAgICAgZm9yIChsZXQgdGltZXNNYXRjaGVkID0gMDsgaG93bWFueS50b29Mb3codGltZXNNYXRjaGVkKSB8fCAhaG93bWFueS50b29IaWdoKHRpbWVzTWF0Y2hlZCArIDEpOyArK3RpbWVzTWF0Y2hlZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHByID0gZ3QucGFyc2UocywgcG9zLCBkZWZpbml0aW9ucywgc3RhdGUpO1xuICAgICAgICAgICAgICAgIGlmIChwci5mYWlsZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gbm8gbWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhvd21hbnkudG9vTG93KHRpbWVzTWF0Y2hlZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJvdXQuYWRkTGFzdEZhaWx1cmUocHIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByLnBvcyA9PSBwb3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG1hdGNoZWQgdGhlIGVtcHR5IHN0cmluZywgYW5kIHdlIGFscmVhZHkgaGF2ZSBlbm91Z2guXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB3ZSBtYXkgZ2V0IGludG8gYW4gaW5maW5pdGUgbG9vcCBpZiBob3dtYW55LnRvb0hpZ2goKSBuZXZlciByZXR1cm5zIGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc28gcmV0dXJuIHN1Y2Nlc3NmdWwgbWF0Y2ggYXQgdGhpcyBwb2ludFxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByb3V0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIG90aGVyd2lzZSBhZHZhbmNlIHRoZSBwb3NpdGlvbiBhbmQgbWVyZ2UgcHIgaW50byBwcm91dFxuICAgICAgICAgICAgICAgICAgICBwb3MgPSBwci5wb3M7XG4gICAgICAgICAgICAgICAgICAgIHByb3V0ID0gcHJvdXQubWVyZ2VSZXN1bHQocHIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm91dDtcbiAgICAgICAgfSxcbiAgICAgICAgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gZ3QudG9TdHJpbmcoKSArIGhvd21hbnkudG9TdHJpbmcoKTtcbiAgICAgICAgfVxuICAgIH07XG59XG5leHBvcnRzLnJlcGVhdCA9IHJlcGVhdDtcbmZ1bmN0aW9uIHN0YXIoZ3QpIHtcbiAgICByZXR1cm4gcmVwZWF0KGd0LCBleHBvcnRzLlpFUk9fT1JfTU9SRSk7XG59XG5leHBvcnRzLnN0YXIgPSBzdGFyO1xuZnVuY3Rpb24gcGx1cyhndCkge1xuICAgIHJldHVybiByZXBlYXQoZ3QsIGV4cG9ydHMuT05FX09SX01PUkUpO1xufVxuZXhwb3J0cy5wbHVzID0gcGx1cztcbmZ1bmN0aW9uIG9wdGlvbihndCkge1xuICAgIHJldHVybiByZXBlYXQoZ3QsIGV4cG9ydHMuWkVST19PUl9PTkUpO1xufVxuZXhwb3J0cy5vcHRpb24gPSBvcHRpb247XG5mdW5jdGlvbiBza2lwKG5vbnRlcm1pbmFsKSB7XG4gICAgY29uc3QgcmVwZXRpdGlvbiA9IHN0YXIobm9udGVybWluYWwpO1xuICAgIHJldHVybiB7XG4gICAgICAgIHBhcnNlKHMsIHBvcywgZGVmaW5pdGlvbnMsIHN0YXRlKSB7XG4gICAgICAgICAgICBzdGF0ZS5lbnRlclNraXAoKTtcbiAgICAgICAgICAgIGxldCBwciA9IHJlcGV0aXRpb24ucGFyc2UocywgcG9zLCBkZWZpbml0aW9ucywgc3RhdGUpO1xuICAgICAgICAgICAgc3RhdGUubGVhdmVTa2lwKCk7XG4gICAgICAgICAgICBpZiAocHIuZmFpbGVkKSB7XG4gICAgICAgICAgICAgICAgLy8gc3VjY2VlZCBhbnl3YXlcbiAgICAgICAgICAgICAgICBwciA9IHN0YXRlLm1ha2VTdWNjZXNzZnVsUGFyc2UocG9zLCBwb3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByO1xuICAgICAgICB9LFxuICAgICAgICB0b1N0cmluZygpIHtcbiAgICAgICAgICAgIHJldHVybiBcIig/PHNraXA+XCIgKyByZXBldGl0aW9uICsgXCIpXCI7XG4gICAgICAgIH1cbiAgICB9O1xufVxuZXhwb3J0cy5za2lwID0gc2tpcDtcbmZ1bmN0aW9uIGZhaWxmYXN0KGd0KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcGFyc2UocywgcG9zLCBkZWZpbml0aW9ucywgc3RhdGUpIHtcbiAgICAgICAgICAgIGxldCBwciA9IGd0LnBhcnNlKHMsIHBvcywgZGVmaW5pdGlvbnMsIHN0YXRlKTtcbiAgICAgICAgICAgIGlmIChwci5mYWlsZWQpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IHR5cGVzXzEuSW50ZXJuYWxQYXJzZUVycm9yKFwiXCIsIHByLm5vbnRlcm1pbmFsTmFtZSwgcHIuZXhwZWN0ZWRUZXh0LCBcIlwiLCBwci5wb3MpO1xuICAgICAgICAgICAgcmV0dXJuIHByO1xuICAgICAgICB9LFxuICAgICAgICB0b1N0cmluZygpIHtcbiAgICAgICAgICAgIHJldHVybiAnZmFpbGZhc3QoJyArIGd0ICsgJyknO1xuICAgICAgICB9XG4gICAgfTtcbn1cbmV4cG9ydHMuZmFpbGZhc3QgPSBmYWlsZmFzdDtcbmNsYXNzIEludGVybmFsUGFyc2VyIHtcbiAgICBjb25zdHJ1Y3RvcihkZWZpbml0aW9ucywgc3RhcnQsIG5vbnRlcm1pbmFsVG9TdHJpbmcpIHtcbiAgICAgICAgdGhpcy5kZWZpbml0aW9ucyA9IGRlZmluaXRpb25zO1xuICAgICAgICB0aGlzLnN0YXJ0ID0gc3RhcnQ7XG4gICAgICAgIHRoaXMubm9udGVybWluYWxUb1N0cmluZyA9IG5vbnRlcm1pbmFsVG9TdHJpbmc7XG4gICAgICAgIHRoaXMuY2hlY2tSZXAoKTtcbiAgICB9XG4gICAgY2hlY2tSZXAoKSB7XG4gICAgfVxuICAgIHBhcnNlKHRleHRUb1BhcnNlKSB7XG4gICAgICAgIGxldCBwciA9ICgoKSA9PiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnN0YXJ0LnBhcnNlKHRleHRUb1BhcnNlLCAwLCB0aGlzLmRlZmluaXRpb25zLCBuZXcgUGFyc2VyU3RhdGUodGhpcy5ub250ZXJtaW5hbFRvU3RyaW5nKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGlmIChlIGluc3RhbmNlb2YgdHlwZXNfMS5JbnRlcm5hbFBhcnNlRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0aHJvdyB0aGUgZXhjZXB0aW9uLCBhdWdtZW50ZWQgYnkgdGhlIG9yaWdpbmFsIHRleHQsIHNvIHRoYXQgdGhlIGVycm9yIG1lc3NhZ2UgaXMgYmV0dGVyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyB0eXBlc18xLkludGVybmFsUGFyc2VFcnJvcihcInN0cmluZyBkb2VzIG5vdCBtYXRjaCBncmFtbWFyXCIsIGUubm9udGVybWluYWxOYW1lLCBlLmV4cGVjdGVkVGV4dCwgdGV4dFRvUGFyc2UsIGUucG9zKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KSgpO1xuICAgICAgICBpZiAocHIuZmFpbGVkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgdHlwZXNfMS5JbnRlcm5hbFBhcnNlRXJyb3IoXCJzdHJpbmcgZG9lcyBub3QgbWF0Y2ggZ3JhbW1hclwiLCBwci5ub250ZXJtaW5hbE5hbWUsIHByLmV4cGVjdGVkVGV4dCwgdGV4dFRvUGFyc2UsIHByLnBvcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHByLnBvcyA8IHRleHRUb1BhcnNlLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9IFwib25seSBwYXJ0IG9mIHRoZSBzdHJpbmcgbWF0Y2hlcyB0aGUgZ3JhbW1hcjsgdGhlIHJlc3QgZGlkIG5vdCBwYXJzZVwiO1xuICAgICAgICAgICAgdGhyb3cgKHByLmxhc3RGYWlsdXJlXG4gICAgICAgICAgICAgICAgPyBuZXcgdHlwZXNfMS5JbnRlcm5hbFBhcnNlRXJyb3IobWVzc2FnZSwgcHIubGFzdEZhaWx1cmUubm9udGVybWluYWxOYW1lLCBwci5sYXN0RmFpbHVyZS5leHBlY3RlZFRleHQsIHRleHRUb1BhcnNlLCBwci5sYXN0RmFpbHVyZS5wb3MpXG4gICAgICAgICAgICAgICAgOiBuZXcgdHlwZXNfMS5JbnRlcm5hbFBhcnNlRXJyb3IobWVzc2FnZSwgdGhpcy5zdGFydC50b1N0cmluZygpLCBcImVuZCBvZiBzdHJpbmdcIiwgdGV4dFRvUGFyc2UsIHByLnBvcykpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwci50cmVlO1xuICAgIH1cbiAgICA7XG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuZGVmaW5pdGlvbnMsIChbbm9udGVybWluYWwsIHJ1bGVdKSA9PiB0aGlzLm5vbnRlcm1pbmFsVG9TdHJpbmcobm9udGVybWluYWwpICsgJzo6PScgKyBydWxlICsgJzsnKS5qb2luKFwiXFxuXCIpO1xuICAgIH1cbn1cbmV4cG9ydHMuSW50ZXJuYWxQYXJzZXIgPSBJbnRlcm5hbFBhcnNlcjtcbmNsYXNzIFN1Y2Nlc3NmdWxQYXJzZSB7XG4gICAgY29uc3RydWN0b3IocG9zLCB0cmVlLCBsYXN0RmFpbHVyZSkge1xuICAgICAgICB0aGlzLnBvcyA9IHBvcztcbiAgICAgICAgdGhpcy50cmVlID0gdHJlZTtcbiAgICAgICAgdGhpcy5sYXN0RmFpbHVyZSA9IGxhc3RGYWlsdXJlO1xuICAgICAgICB0aGlzLmZhaWxlZCA9IGZhbHNlO1xuICAgIH1cbiAgICByZXBsYWNlVHJlZSh0cmVlKSB7XG4gICAgICAgIHJldHVybiBuZXcgU3VjY2Vzc2Z1bFBhcnNlKHRoaXMucG9zLCB0cmVlLCB0aGlzLmxhc3RGYWlsdXJlKTtcbiAgICB9XG4gICAgbWVyZ2VSZXN1bHQodGhhdCkge1xuICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoIXRoYXQuZmFpbGVkKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnbWVyZ2luZycsIHRoaXMsICd3aXRoJywgdGhhdCk7XG4gICAgICAgIHJldHVybiBuZXcgU3VjY2Vzc2Z1bFBhcnNlKHRoYXQucG9zLCB0aGlzLnRyZWUuY29uY2F0KHRoYXQudHJlZSksIGxhdGVyUmVzdWx0KHRoaXMubGFzdEZhaWx1cmUsIHRoYXQubGFzdEZhaWx1cmUpKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogS2VlcCB0cmFjayBvZiBhIGZhaWxpbmcgcGFyc2UgcmVzdWx0IHRoYXQgcHJldmVudGVkIHRoaXMgdHJlZSBmcm9tIG1hdGNoaW5nIG1vcmUgb2YgdGhlIGlucHV0IHN0cmluZy5cbiAgICAgKiBUaGlzIGRlZXBlciBmYWlsdXJlIGlzIHVzdWFsbHkgbW9yZSBpbmZvcm1hdGl2ZSB0byB0aGUgdXNlciwgc28gd2UnbGwgZGlzcGxheSBpdCBpbiB0aGUgZXJyb3IgbWVzc2FnZS5cbiAgICAgKiBAcGFyYW0gbmV3TGFzdEZhaWx1cmUgYSBmYWlsaW5nIFBhcnNlUmVzdWx0PE5UPiB0aGF0IHN0b3BwZWQgdGhpcyB0cmVlJ3MgcGFyc2UgKGJ1dCBkaWRuJ3QgcHJldmVudCB0aGlzIGZyb20gc3VjY2VlZGluZylcbiAgICAgKiBAcmV0dXJuIGEgbmV3IFBhcnNlUmVzdWx0PE5UPiBpZGVudGljYWwgdG8gdGhpcyBvbmUgYnV0IHdpdGggbGFzdEZhaWx1cmUgYWRkZWQgdG8gaXRcbiAgICAgKi9cbiAgICBhZGRMYXN0RmFpbHVyZShuZXdMYXN0RmFpbHVyZSkge1xuICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkobmV3TGFzdEZhaWx1cmUuZmFpbGVkKTtcbiAgICAgICAgcmV0dXJuIG5ldyBTdWNjZXNzZnVsUGFyc2UodGhpcy5wb3MsIHRoaXMudHJlZSwgbGF0ZXJSZXN1bHQodGhpcy5sYXN0RmFpbHVyZSwgbmV3TGFzdEZhaWx1cmUpKTtcbiAgICB9XG59XG5leHBvcnRzLlN1Y2Nlc3NmdWxQYXJzZSA9IFN1Y2Nlc3NmdWxQYXJzZTtcbmNsYXNzIEZhaWxlZFBhcnNlIHtcbiAgICBjb25zdHJ1Y3Rvcihwb3MsIG5vbnRlcm1pbmFsTmFtZSwgZXhwZWN0ZWRUZXh0KSB7XG4gICAgICAgIHRoaXMucG9zID0gcG9zO1xuICAgICAgICB0aGlzLm5vbnRlcm1pbmFsTmFtZSA9IG5vbnRlcm1pbmFsTmFtZTtcbiAgICAgICAgdGhpcy5leHBlY3RlZFRleHQgPSBleHBlY3RlZFRleHQ7XG4gICAgICAgIHRoaXMuZmFpbGVkID0gdHJ1ZTtcbiAgICB9XG59XG5leHBvcnRzLkZhaWxlZFBhcnNlID0gRmFpbGVkUGFyc2U7XG4vKipcbiAqIEBwYXJhbSByZXN1bHQxXG4gKiBAcGFyYW0gcmVzdWx0MlxuICogQHJldHVybiB3aGljaGV2ZXIgb2YgcmVzdWx0MSBvciByZXN1bHQyIGhhcyB0aGUgbXhpbXVtIHBvc2l0aW9uLCBvciB1bmRlZmluZWQgaWYgYm90aCBhcmUgdW5kZWZpbmVkXG4gKi9cbmZ1bmN0aW9uIGxhdGVyUmVzdWx0KHJlc3VsdDEsIHJlc3VsdDIpIHtcbiAgICBpZiAocmVzdWx0MSAmJiByZXN1bHQyKVxuICAgICAgICByZXR1cm4gcmVzdWx0MS5wb3MgPj0gcmVzdWx0Mi5wb3MgPyByZXN1bHQxIDogcmVzdWx0MjtcbiAgICBlbHNlXG4gICAgICAgIHJldHVybiByZXN1bHQxIHx8IHJlc3VsdDI7XG59XG4vKipcbiAqIEBwYXJhbSByZXN1bHRzXG4gKiBAcmV0dXJuIHRoZSByZXN1bHRzIGluIHRoZSBsaXN0IHdpdGggbWF4aW11bSBwb3MuICBFbXB0eSBpZiBsaXN0IGlzIGVtcHR5LlxuICovXG5mdW5jdGlvbiBsb25nZXN0UmVzdWx0cyhyZXN1bHRzKSB7XG4gICAgcmV0dXJuIHJlc3VsdHMucmVkdWNlKChsb25nZXN0UmVzdWx0c1NvRmFyLCByZXN1bHQpID0+IHtcbiAgICAgICAgaWYgKGxvbmdlc3RSZXN1bHRzU29GYXIubGVuZ3RoID09IDAgfHwgcmVzdWx0LnBvcyA+IGxvbmdlc3RSZXN1bHRzU29GYXJbMF0ucG9zKSB7XG4gICAgICAgICAgICAvLyByZXN1bHQgd2luc1xuICAgICAgICAgICAgcmV0dXJuIFtyZXN1bHRdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHJlc3VsdC5wb3MgPT0gbG9uZ2VzdFJlc3VsdHNTb0ZhclswXS5wb3MpIHtcbiAgICAgICAgICAgIC8vIHJlc3VsdCBpcyB0aWVkXG4gICAgICAgICAgICBsb25nZXN0UmVzdWx0c1NvRmFyLnB1c2gocmVzdWx0KTtcbiAgICAgICAgICAgIHJldHVybiBsb25nZXN0UmVzdWx0c1NvRmFyO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gcmVzdWx0IGxvc2VzXG4gICAgICAgICAgICByZXR1cm4gbG9uZ2VzdFJlc3VsdHNTb0ZhcjtcbiAgICAgICAgfVxuICAgIH0sIFtdKTtcbn1cbmNsYXNzIFBhcnNlclN0YXRlIHtcbiAgICBjb25zdHJ1Y3Rvcihub250ZXJtaW5hbFRvU3RyaW5nKSB7XG4gICAgICAgIHRoaXMubm9udGVybWluYWxUb1N0cmluZyA9IG5vbnRlcm1pbmFsVG9TdHJpbmc7XG4gICAgICAgIHRoaXMuc3RhY2sgPSBbXTtcbiAgICAgICAgdGhpcy5maXJzdCA9IG5ldyBNYXAoKTtcbiAgICAgICAgdGhpcy5za2lwRGVwdGggPSAwO1xuICAgIH1cbiAgICBlbnRlcihwb3MsIG5vbnRlcm1pbmFsKSB7XG4gICAgICAgIGlmICghdGhpcy5maXJzdC5oYXMobm9udGVybWluYWwpKSB7XG4gICAgICAgICAgICB0aGlzLmZpcnN0LnNldChub250ZXJtaW5hbCwgW10pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHMgPSB0aGlzLmZpcnN0LmdldChub250ZXJtaW5hbCk7XG4gICAgICAgIGlmIChzLmxlbmd0aCA+IDAgJiYgc1tzLmxlbmd0aCAtIDFdID09IHBvcykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IHR5cGVzXzEuR3JhbW1hckVycm9yKFwiZGV0ZWN0ZWQgbGVmdCByZWN1cnNpb24gaW4gcnVsZSBmb3IgXCIgKyB0aGlzLm5vbnRlcm1pbmFsVG9TdHJpbmcobm9udGVybWluYWwpKTtcbiAgICAgICAgfVxuICAgICAgICBzLnB1c2gocG9zKTtcbiAgICAgICAgdGhpcy5zdGFjay5wdXNoKG5vbnRlcm1pbmFsKTtcbiAgICB9XG4gICAgbGVhdmUobm9udGVybWluYWwpIHtcbiAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKHRoaXMuZmlyc3QuaGFzKG5vbnRlcm1pbmFsKSAmJiB0aGlzLmZpcnN0LmdldChub250ZXJtaW5hbCkubGVuZ3RoID4gMCk7XG4gICAgICAgIHRoaXMuZmlyc3QuZ2V0KG5vbnRlcm1pbmFsKS5wb3AoKTtcbiAgICAgICAgY29uc3QgbGFzdCA9IHRoaXMuc3RhY2sucG9wKCk7XG4gICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShsYXN0ID09PSBub250ZXJtaW5hbCk7XG4gICAgfVxuICAgIGVudGVyU2tpcCgpIHtcbiAgICAgICAgLy9jb25zb2xlLmVycm9yKCdlbnRlcmluZyBza2lwJyk7XG4gICAgICAgICsrdGhpcy5za2lwRGVwdGg7XG4gICAgfVxuICAgIGxlYXZlU2tpcCgpIHtcbiAgICAgICAgLy9jb25zb2xlLmVycm9yKCdsZWF2aW5nIHNraXAnKTtcbiAgICAgICAgLS10aGlzLnNraXBEZXB0aDtcbiAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKHRoaXMuc2tpcERlcHRoID49IDApO1xuICAgIH1cbiAgICBpc0VtcHR5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGFjay5sZW5ndGggPT0gMDtcbiAgICB9XG4gICAgZ2V0IGN1cnJlbnROb250ZXJtaW5hbCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhY2tbdGhpcy5zdGFjay5sZW5ndGggLSAxXTtcbiAgICB9XG4gICAgZ2V0IGN1cnJlbnROb250ZXJtaW5hbE5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnROb250ZXJtaW5hbCAhPT0gdW5kZWZpbmVkID8gdGhpcy5ub250ZXJtaW5hbFRvU3RyaW5nKHRoaXMuY3VycmVudE5vbnRlcm1pbmFsKSA6IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgLy8gcmVxdWlyZXM6ICFpc0VtcHR5KClcbiAgICBtYWtlUGFyc2VUcmVlKHBvcywgdGV4dCA9ICcnLCBjaGlsZHJlbiA9IFtdKSB7XG4gICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KSghdGhpcy5pc0VtcHR5KCkpO1xuICAgICAgICByZXR1cm4gbmV3IHBhcnNldHJlZV8xLkludGVybmFsUGFyc2VUcmVlKHRoaXMuY3VycmVudE5vbnRlcm1pbmFsLCB0aGlzLmN1cnJlbnROb250ZXJtaW5hbE5hbWUsIHBvcywgdGV4dCwgY2hpbGRyZW4sIHRoaXMuc2tpcERlcHRoID4gMCk7XG4gICAgfVxuICAgIC8vIHJlcXVpcmVzICFpc0VtcHR5KClcbiAgICBtYWtlU3VjY2Vzc2Z1bFBhcnNlKGZyb21Qb3MsIHRvUG9zLCB0ZXh0ID0gJycsIGNoaWxkcmVuID0gW10pIHtcbiAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKCF0aGlzLmlzRW1wdHkoKSk7XG4gICAgICAgIHJldHVybiBuZXcgU3VjY2Vzc2Z1bFBhcnNlKHRvUG9zLCB0aGlzLm1ha2VQYXJzZVRyZWUoZnJvbVBvcywgdGV4dCwgY2hpbGRyZW4pKTtcbiAgICB9XG4gICAgLy8gcmVxdWlyZXMgIWlzRW1wdHkoKVxuICAgIG1ha2VGYWlsZWRQYXJzZShhdFBvcywgZXhwZWN0ZWRUZXh0KSB7XG4gICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KSghdGhpcy5pc0VtcHR5KCkpO1xuICAgICAgICByZXR1cm4gbmV3IEZhaWxlZFBhcnNlKGF0UG9zLCB0aGlzLmN1cnJlbnROb250ZXJtaW5hbE5hbWUsIGV4cGVjdGVkVGV4dCk7XG4gICAgfVxufVxuZXhwb3J0cy5QYXJzZXJTdGF0ZSA9IFBhcnNlclN0YXRlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGFyc2VyLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5JbnRlcm5hbFBhcnNlVHJlZSA9IHZvaWQgMDtcbmNvbnN0IGRpc3BsYXlfMSA9IHJlcXVpcmUoXCIuL2Rpc3BsYXlcIik7XG5jbGFzcyBJbnRlcm5hbFBhcnNlVHJlZSB7XG4gICAgY29uc3RydWN0b3IobmFtZSwgbm9udGVybWluYWxOYW1lLCBzdGFydCwgdGV4dCwgYWxsQ2hpbGRyZW4sIGlzU2tpcHBlZCkge1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgICB0aGlzLm5vbnRlcm1pbmFsTmFtZSA9IG5vbnRlcm1pbmFsTmFtZTtcbiAgICAgICAgdGhpcy5zdGFydCA9IHN0YXJ0O1xuICAgICAgICB0aGlzLnRleHQgPSB0ZXh0O1xuICAgICAgICB0aGlzLmFsbENoaWxkcmVuID0gYWxsQ2hpbGRyZW47XG4gICAgICAgIHRoaXMuaXNTa2lwcGVkID0gaXNTa2lwcGVkO1xuICAgICAgICB0aGlzLmNoZWNrUmVwKCk7XG4gICAgICAgIE9iamVjdC5mcmVlemUodGhpcy5hbGxDaGlsZHJlbik7XG4gICAgICAgIC8vIGNhbid0IGZyZWV6ZSh0aGlzKSBiZWNhdXNlIG9mIGJlbmVmaWNlbnQgbXV0YXRpb24gZGVsYXllZCBjb21wdXRhdGlvbi13aXRoLWNhY2hpbmcgZm9yIGNoaWxkcmVuKCkgYW5kIGNoaWxkcmVuQnlOYW1lKClcbiAgICB9XG4gICAgY2hlY2tSZXAoKSB7XG4gICAgICAgIC8vIEZJWE1FXG4gICAgfVxuICAgIGdldCBlbmQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXJ0ICsgdGhpcy50ZXh0Lmxlbmd0aDtcbiAgICB9XG4gICAgY2hpbGRyZW5CeU5hbWUobmFtZSkge1xuICAgICAgICBpZiAoIXRoaXMuX2NoaWxkcmVuQnlOYW1lKSB7XG4gICAgICAgICAgICB0aGlzLl9jaGlsZHJlbkJ5TmFtZSA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgY2hpbGQgb2YgdGhpcy5hbGxDaGlsZHJlbikge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5fY2hpbGRyZW5CeU5hbWUuaGFzKGNoaWxkLm5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2NoaWxkcmVuQnlOYW1lLnNldChjaGlsZC5uYW1lLCBbXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuX2NoaWxkcmVuQnlOYW1lLmdldChjaGlsZC5uYW1lKS5wdXNoKGNoaWxkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAoY29uc3QgY2hpbGRMaXN0IG9mIHRoaXMuX2NoaWxkcmVuQnlOYW1lLnZhbHVlcygpKSB7XG4gICAgICAgICAgICAgICAgT2JqZWN0LmZyZWV6ZShjaGlsZExpc3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2hlY2tSZXAoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NoaWxkcmVuQnlOYW1lLmdldChuYW1lKSB8fCBbXTtcbiAgICB9XG4gICAgZ2V0IGNoaWxkcmVuKCkge1xuICAgICAgICBpZiAoIXRoaXMuX2NoaWxkcmVuKSB7XG4gICAgICAgICAgICB0aGlzLl9jaGlsZHJlbiA9IHRoaXMuYWxsQ2hpbGRyZW4uZmlsdGVyKGNoaWxkID0+ICFjaGlsZC5pc1NraXBwZWQpO1xuICAgICAgICAgICAgT2JqZWN0LmZyZWV6ZSh0aGlzLl9jaGlsZHJlbik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jaGVja1JlcCgpO1xuICAgICAgICByZXR1cm4gdGhpcy5fY2hpbGRyZW47XG4gICAgfVxuICAgIGNvbmNhdCh0aGF0KSB7XG4gICAgICAgIHJldHVybiBuZXcgSW50ZXJuYWxQYXJzZVRyZWUodGhpcy5uYW1lLCB0aGlzLm5vbnRlcm1pbmFsTmFtZSwgdGhpcy5zdGFydCwgdGhpcy50ZXh0ICsgdGhhdC50ZXh0LCB0aGlzLmFsbENoaWxkcmVuLmNvbmNhdCh0aGF0LmFsbENoaWxkcmVuKSwgdGhpcy5pc1NraXBwZWQgJiYgdGhhdC5pc1NraXBwZWQpO1xuICAgIH1cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgbGV0IHMgPSAodGhpcy5pc1NraXBwZWQgPyBcIkBza2lwIFwiIDogXCJcIikgKyB0aGlzLm5vbnRlcm1pbmFsTmFtZTtcbiAgICAgICAgaWYgKHRoaXMuY2hpbGRyZW4ubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgIHMgKz0gXCI6XCIgKyAoMCwgZGlzcGxheV8xLmVzY2FwZUZvclJlYWRpbmcpKHRoaXMudGV4dCwgXCJcXFwiXCIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbGV0IHQgPSBcIlwiO1xuICAgICAgICAgICAgbGV0IG9mZnNldFJlYWNoZWRTb0ZhciA9IHRoaXMuc3RhcnQ7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHB0IG9mIHRoaXMuYWxsQ2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICBpZiAob2Zmc2V0UmVhY2hlZFNvRmFyIDwgcHQuc3RhcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcHJldmlvdXMgY2hpbGQgYW5kIGN1cnJlbnQgY2hpbGQgaGF2ZSBhIGdhcCBiZXR3ZWVuIHRoZW0gdGhhdCBtdXN0IGhhdmUgYmVlbiBtYXRjaGVkIGFzIGEgdGVybWluYWxcbiAgICAgICAgICAgICAgICAgICAgLy8gaW4gdGhlIHJ1bGUgZm9yIHRoaXMgbm9kZS4gIEluc2VydCBpdCBhcyBhIHF1b3RlZCBzdHJpbmcuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRlcm1pbmFsID0gdGhpcy50ZXh0LnN1YnN0cmluZyhvZmZzZXRSZWFjaGVkU29GYXIgLSB0aGlzLnN0YXJ0LCBwdC5zdGFydCAtIHRoaXMuc3RhcnQpO1xuICAgICAgICAgICAgICAgICAgICB0ICs9IFwiXFxuXCIgKyAoMCwgZGlzcGxheV8xLmVzY2FwZUZvclJlYWRpbmcpKHRlcm1pbmFsLCBcIlxcXCJcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHQgKz0gXCJcXG5cIiArIHB0O1xuICAgICAgICAgICAgICAgIG9mZnNldFJlYWNoZWRTb0ZhciA9IHB0LmVuZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChvZmZzZXRSZWFjaGVkU29GYXIgPCB0aGlzLmVuZCkge1xuICAgICAgICAgICAgICAgIC8vIGZpbmFsIGNoaWxkIGFuZCBlbmQgb2YgdGhpcyBub2RlIGhhdmUgYSBnYXAgLS0gdHJlYXQgaXQgdGhlIHNhbWUgYXMgYWJvdmUuXG4gICAgICAgICAgICAgICAgY29uc3QgdGVybWluYWwgPSB0aGlzLnRleHQuc3Vic3RyaW5nKG9mZnNldFJlYWNoZWRTb0ZhciAtIHRoaXMuc3RhcnQpO1xuICAgICAgICAgICAgICAgIHQgKz0gXCJcXG5cIiArICgwLCBkaXNwbGF5XzEuZXNjYXBlRm9yUmVhZGluZykodGVybWluYWwsIFwiXFxcIlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHNtYWxsRW5vdWdoRm9yT25lTGluZSA9IDUwO1xuICAgICAgICAgICAgaWYgKHQubGVuZ3RoIDw9IHNtYWxsRW5vdWdoRm9yT25lTGluZSkge1xuICAgICAgICAgICAgICAgIHMgKz0gXCIgeyBcIiArIHQuc3Vic3RyaW5nKDEpIC8vIHJlbW92ZSBpbml0aWFsIG5ld2xpbmVcbiAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoXCJcXG5cIiwgXCIsIFwiKVxuICAgICAgICAgICAgICAgICAgICArIFwiIH1cIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHMgKz0gXCIge1wiICsgKDAsIGRpc3BsYXlfMS5pbmRlbnQpKHQsIFwiICBcIikgKyBcIlxcbn1cIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcztcbiAgICB9XG59XG5leHBvcnRzLkludGVybmFsUGFyc2VUcmVlID0gSW50ZXJuYWxQYXJzZVRyZWU7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wYXJzZXRyZWUuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkdyYW1tYXJFcnJvciA9IGV4cG9ydHMuSW50ZXJuYWxQYXJzZUVycm9yID0gZXhwb3J0cy5QYXJzZUVycm9yID0gdm9pZCAwO1xuY29uc3QgZGlzcGxheV8xID0gcmVxdWlyZShcIi4vZGlzcGxheVwiKTtcbi8qKlxuICogRXhjZXB0aW9uIHRocm93biB3aGVuIGEgc2VxdWVuY2Ugb2YgY2hhcmFjdGVycyBkb2Vzbid0IG1hdGNoIGEgZ3JhbW1hclxuICovXG5jbGFzcyBQYXJzZUVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICAgIGNvbnN0cnVjdG9yKG1lc3NhZ2UpIHtcbiAgICAgICAgc3VwZXIobWVzc2FnZSk7XG4gICAgfVxufVxuZXhwb3J0cy5QYXJzZUVycm9yID0gUGFyc2VFcnJvcjtcbmNsYXNzIEludGVybmFsUGFyc2VFcnJvciBleHRlbmRzIFBhcnNlRXJyb3Ige1xuICAgIGNvbnN0cnVjdG9yKG1lc3NhZ2UsIG5vbnRlcm1pbmFsTmFtZSwgZXhwZWN0ZWRUZXh0LCB0ZXh0QmVpbmdQYXJzZWQsIHBvcykge1xuICAgICAgICBzdXBlcigoMCwgZGlzcGxheV8xLm1ha2VFcnJvck1lc3NhZ2UpKG1lc3NhZ2UsIG5vbnRlcm1pbmFsTmFtZSwgZXhwZWN0ZWRUZXh0LCB0ZXh0QmVpbmdQYXJzZWQsIHBvcywgXCJzdHJpbmcgYmVpbmcgcGFyc2VkXCIpKTtcbiAgICAgICAgdGhpcy5ub250ZXJtaW5hbE5hbWUgPSBub250ZXJtaW5hbE5hbWU7XG4gICAgICAgIHRoaXMuZXhwZWN0ZWRUZXh0ID0gZXhwZWN0ZWRUZXh0O1xuICAgICAgICB0aGlzLnRleHRCZWluZ1BhcnNlZCA9IHRleHRCZWluZ1BhcnNlZDtcbiAgICAgICAgdGhpcy5wb3MgPSBwb3M7XG4gICAgfVxufVxuZXhwb3J0cy5JbnRlcm5hbFBhcnNlRXJyb3IgPSBJbnRlcm5hbFBhcnNlRXJyb3I7XG5jbGFzcyBHcmFtbWFyRXJyb3IgZXh0ZW5kcyBQYXJzZUVycm9yIHtcbiAgICBjb25zdHJ1Y3RvcihtZXNzYWdlLCBlKSB7XG4gICAgICAgIHN1cGVyKGUgPyAoMCwgZGlzcGxheV8xLm1ha2VFcnJvck1lc3NhZ2UpKG1lc3NhZ2UsIGUubm9udGVybWluYWxOYW1lLCBlLmV4cGVjdGVkVGV4dCwgZS50ZXh0QmVpbmdQYXJzZWQsIGUucG9zLCBcImdyYW1tYXJcIilcbiAgICAgICAgICAgIDogbWVzc2FnZSk7XG4gICAgfVxufVxuZXhwb3J0cy5HcmFtbWFyRXJyb3IgPSBHcmFtbWFyRXJyb3I7XG4vLyMgc291cmNlTWFwcGluZ1VSTD10eXBlcy5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMudmlzdWFsaXplQXNIdG1sID0gZXhwb3J0cy52aXN1YWxpemVBc1VybCA9IHZvaWQgMDtcbmNvbnN0IGNvbXBpbGVyXzEgPSByZXF1aXJlKFwiLi9jb21waWxlclwiKTtcbmNvbnN0IHBhcnNlcmxpYl8xID0gcmVxdWlyZShcIi4uL3BhcnNlcmxpYlwiKTtcbmNvbnN0IGZzXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcImZzXCIpKTtcbmNvbnN0IHBhdGhfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwicGF0aFwiKSk7XG5mdW5jdGlvbiBlbXB0eUl0ZXJhdG9yKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIG5leHQoKSB7IHJldHVybiB7IGRvbmU6IHRydWUgfTsgfVxuICAgIH07XG59XG5mdW5jdGlvbiBnZXRJdGVyYXRvcihsaXN0KSB7XG4gICAgcmV0dXJuIGxpc3RbU3ltYm9sLml0ZXJhdG9yXSgpO1xufVxuY29uc3QgTUFYX1VSTF9MRU5HVEhfRk9SX0RFU0tUT1BfQlJPV1NFID0gMjAyMDtcbi8qKlxuICogVmlzdWFsaXplcyBhIHBhcnNlIHRyZWUgdXNpbmcgYSBVUkwgdGhhdCBjYW4gYmUgcGFzdGVkIGludG8geW91ciB3ZWIgYnJvd3Nlci5cbiAqIEBwYXJhbSBwYXJzZVRyZWUgdHJlZSB0byB2aXN1YWxpemVcbiAqIEBwYXJhbSA8TlQ+IHRoZSBlbnVtZXJhdGlvbiBvZiBzeW1ib2xzIGluIHRoZSBwYXJzZSB0cmVlJ3MgZ3JhbW1hclxuICogQHJldHVybiB1cmwgdGhhdCBzaG93cyBhIHZpc3VhbGl6YXRpb24gb2YgdGhlIHBhcnNlIHRyZWVcbiAqL1xuZnVuY3Rpb24gdmlzdWFsaXplQXNVcmwocGFyc2VUcmVlLCBub250ZXJtaW5hbHMpIHtcbiAgICBjb25zdCBiYXNlID0gXCJodHRwOi8vd2ViLm1pdC5lZHUvNi4wMzEvd3d3L3BhcnNlcmxpYi9cIiArIHBhcnNlcmxpYl8xLlZFUlNJT04gKyBcIi92aXN1YWxpemVyLmh0bWxcIjtcbiAgICBjb25zdCBjb2RlID0gZXhwcmVzc2lvbkZvckRpc3BsYXkocGFyc2VUcmVlLCBub250ZXJtaW5hbHMpO1xuICAgIGNvbnN0IHVybCA9IGJhc2UgKyAnP2NvZGU9JyArIGZpeGVkRW5jb2RlVVJJQ29tcG9uZW50KGNvZGUpO1xuICAgIGlmICh1cmwubGVuZ3RoID4gTUFYX1VSTF9MRU5HVEhfRk9SX0RFU0tUT1BfQlJPV1NFKSB7XG4gICAgICAgIC8vIGRpc3BsYXkgYWx0ZXJuYXRlIGluc3RydWN0aW9ucyB0byB0aGUgY29uc29sZVxuICAgICAgICBjb25zb2xlLmVycm9yKCdWaXN1YWxpemF0aW9uIFVSTCBpcyB0b28gbG9uZyBmb3Igd2ViIGJyb3dzZXIgYW5kL29yIHdlYiBzZXJ2ZXIuXFxuJ1xuICAgICAgICAgICAgKyAnSW5zdGVhZCwgZ28gdG8gJyArIGJhc2UgKyAnXFxuJ1xuICAgICAgICAgICAgKyAnYW5kIGNvcHkgYW5kIHBhc3RlIHRoaXMgY29kZSBpbnRvIHRoZSB0ZXh0Ym94OlxcbidcbiAgICAgICAgICAgICsgY29kZSk7XG4gICAgfVxuICAgIHJldHVybiB1cmw7XG59XG5leHBvcnRzLnZpc3VhbGl6ZUFzVXJsID0gdmlzdWFsaXplQXNVcmw7XG5jb25zdCB2aXN1YWxpemVySHRtbEZpbGUgPSBwYXRoXzEuZGVmYXVsdC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3NyYy92aXN1YWxpemVyLmh0bWwnKTtcbi8qKlxuICogVmlzdWFsaXplcyBhIHBhcnNlIHRyZWUgYXMgYSBzdHJpbmcgb2YgSFRNTCB0aGF0IGNhbiBiZSBkaXNwbGF5ZWQgaW4gYSB3ZWIgYnJvd3Nlci5cbiAqIEBwYXJhbSBwYXJzZVRyZWUgdHJlZSB0byB2aXN1YWxpemVcbiAqIEBwYXJhbSA8TlQ+IHRoZSBlbnVtZXJhdGlvbiBvZiBzeW1ib2xzIGluIHRoZSBwYXJzZSB0cmVlJ3MgZ3JhbW1hclxuICogQHJldHVybiBzdHJpbmcgb2YgSFRNTCB0aGF0IHNob3dzIGEgdmlzdWFsaXphdGlvbiBvZiB0aGUgcGFyc2UgdHJlZVxuICovXG5mdW5jdGlvbiB2aXN1YWxpemVBc0h0bWwocGFyc2VUcmVlLCBub250ZXJtaW5hbHMpIHtcbiAgICBjb25zdCBodG1sID0gZnNfMS5kZWZhdWx0LnJlYWRGaWxlU3luYyh2aXN1YWxpemVySHRtbEZpbGUsICd1dGY4Jyk7XG4gICAgY29uc3QgY29kZSA9IGV4cHJlc3Npb25Gb3JEaXNwbGF5KHBhcnNlVHJlZSwgbm9udGVybWluYWxzKTtcbiAgICBjb25zdCByZXN1bHQgPSBodG1sLnJlcGxhY2UoL1xcL1xcL0NPREVIRVJFLywgXCJyZXR1cm4gJ1wiICsgZml4ZWRFbmNvZGVVUklDb21wb25lbnQoY29kZSkgKyBcIic7XCIpO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5leHBvcnRzLnZpc3VhbGl6ZUFzSHRtbCA9IHZpc3VhbGl6ZUFzSHRtbDtcbmZ1bmN0aW9uIGV4cHJlc3Npb25Gb3JEaXNwbGF5KHBhcnNlVHJlZSwgbm9udGVybWluYWxzKSB7XG4gICAgY29uc3QgeyBub250ZXJtaW5hbFRvU3RyaW5nIH0gPSAoMCwgY29tcGlsZXJfMS5tYWtlTm9udGVybWluYWxDb252ZXJ0ZXJzKShub250ZXJtaW5hbHMpO1xuICAgIHJldHVybiBmb3JEaXNwbGF5KHBhcnNlVHJlZSwgW10sIHBhcnNlVHJlZSk7XG4gICAgZnVuY3Rpb24gZm9yRGlzcGxheShub2RlLCBzaWJsaW5ncywgcGFyZW50KSB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBub250ZXJtaW5hbFRvU3RyaW5nKG5vZGUubmFtZSkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgbGV0IHMgPSBcIm5kKFwiO1xuICAgICAgICBpZiAobm9kZS5jaGlsZHJlbi5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgcyArPSBcIlxcXCJcIiArIG5hbWUgKyBcIlxcXCIsbmQoXFxcIidcIiArIGNsZWFuU3RyaW5nKG5vZGUudGV4dCkgKyBcIidcXFwiKSxcIjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHMgKz0gXCJcXFwiXCIgKyBuYW1lICsgXCJcXFwiLFwiO1xuICAgICAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBub2RlLmFsbENoaWxkcmVuLnNsaWNlKCk7IC8vIG1ha2UgYSBjb3B5IGZvciBzaGlmdGluZ1xuICAgICAgICAgICAgY29uc3QgZmlyc3RDaGlsZCA9IGNoaWxkcmVuLnNoaWZ0KCk7XG4gICAgICAgICAgICBsZXQgY2hpbGRyZW5FeHByZXNzaW9uID0gZm9yRGlzcGxheShmaXJzdENoaWxkLCBjaGlsZHJlbiwgbm9kZSk7XG4gICAgICAgICAgICBpZiAobm9kZS5zdGFydCA8IGZpcnN0Q2hpbGQuc3RhcnQpIHtcbiAgICAgICAgICAgICAgICAvLyBub2RlIGFuZCBpdHMgZmlyc3QgY2hpbGQgaGF2ZSBhIGdhcCBiZXR3ZWVuIHRoZW0gdGhhdCBtdXN0IGhhdmUgYmVlbiBtYXRjaGVkIGFzIGEgdGVybWluYWxcbiAgICAgICAgICAgICAgICAvLyBpbiB0aGUgcnVsZSBmb3Igbm9kZS4gIEluc2VydCBpdCBhcyBhIHF1b3RlZCBzdHJpbmcuXG4gICAgICAgICAgICAgICAgY2hpbGRyZW5FeHByZXNzaW9uID0gcHJlY2VkZUJ5VGVybWluYWwobm9kZS50ZXh0LnN1YnN0cmluZygwLCBmaXJzdENoaWxkLnN0YXJ0IC0gbm9kZS5zdGFydCksIGNoaWxkcmVuRXhwcmVzc2lvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzICs9IGNoaWxkcmVuRXhwcmVzc2lvbiArIFwiLFwiO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzaWJsaW5ncy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBzaWJsaW5nID0gc2libGluZ3Muc2hpZnQoKTtcbiAgICAgICAgICAgIGxldCBzaWJsaW5nRXhwcmVzc2lvbiA9IGZvckRpc3BsYXkoc2libGluZywgc2libGluZ3MsIHBhcmVudCk7XG4gICAgICAgICAgICBpZiAobm9kZS5lbmQgPCBzaWJsaW5nLnN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgLy8gbm9kZSBhbmQgaXRzIHNpYmxpbmcgaGF2ZSBhIGdhcCBiZXR3ZWVuIHRoZW0gdGhhdCBtdXN0IGhhdmUgYmVlbiBtYXRjaGVkIGFzIGEgdGVybWluYWxcbiAgICAgICAgICAgICAgICAvLyBpbiB0aGUgcnVsZSBmb3IgcGFyZW50LiAgSW5zZXJ0IGl0IGFzIGEgcXVvdGVkIHN0cmluZy5cbiAgICAgICAgICAgICAgICBzaWJsaW5nRXhwcmVzc2lvbiA9IHByZWNlZGVCeVRlcm1pbmFsKHBhcmVudC50ZXh0LnN1YnN0cmluZyhub2RlLmVuZCAtIHBhcmVudC5zdGFydCwgc2libGluZy5zdGFydCAtIHBhcmVudC5zdGFydCksIHNpYmxpbmdFeHByZXNzaW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHMgKz0gc2libGluZ0V4cHJlc3Npb247XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsZXQgc2libGluZ0V4cHJlc3Npb24gPSBcInV1XCI7XG4gICAgICAgICAgICBpZiAobm9kZS5lbmQgPCBwYXJlbnQuZW5kKSB7XG4gICAgICAgICAgICAgICAgLy8gVGhlcmUncyBhIGdhcCBiZXR3ZWVuIHRoZSBlbmQgb2Ygbm9kZSBhbmQgdGhlIGVuZCBvZiBpdHMgcGFyZW50LCB3aGljaCBtdXN0IGJlIGEgdGVybWluYWwgbWF0Y2hlZCBieSBwYXJlbnQuXG4gICAgICAgICAgICAgICAgLy8gSW5zZXJ0IGl0IGFzIGEgcXVvdGVkIHN0cmluZy5cbiAgICAgICAgICAgICAgICBzaWJsaW5nRXhwcmVzc2lvbiA9IHByZWNlZGVCeVRlcm1pbmFsKHBhcmVudC50ZXh0LnN1YnN0cmluZyhub2RlLmVuZCAtIHBhcmVudC5zdGFydCksIHNpYmxpbmdFeHByZXNzaW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHMgKz0gc2libGluZ0V4cHJlc3Npb247XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5vZGUuaXNTa2lwcGVkKSB7XG4gICAgICAgICAgICBzICs9IFwiLHRydWVcIjtcbiAgICAgICAgfVxuICAgICAgICBzICs9IFwiKVwiO1xuICAgICAgICByZXR1cm4gcztcbiAgICB9XG4gICAgZnVuY3Rpb24gcHJlY2VkZUJ5VGVybWluYWwodGVybWluYWwsIGV4cHJlc3Npb24pIHtcbiAgICAgICAgcmV0dXJuIFwibmQoXFxcIidcIiArIGNsZWFuU3RyaW5nKHRlcm1pbmFsKSArIFwiJ1xcXCIsIHV1LCBcIiArIGV4cHJlc3Npb24gKyBcIilcIjtcbiAgICB9XG4gICAgZnVuY3Rpb24gY2xlYW5TdHJpbmcocykge1xuICAgICAgICBsZXQgcnZhbHVlID0gcy5yZXBsYWNlKC9cXFxcL2csIFwiXFxcXFxcXFxcIik7XG4gICAgICAgIHJ2YWx1ZSA9IHJ2YWx1ZS5yZXBsYWNlKC9cIi9nLCBcIlxcXFxcXFwiXCIpO1xuICAgICAgICBydmFsdWUgPSBydmFsdWUucmVwbGFjZSgvXFxuL2csIFwiXFxcXG5cIik7XG4gICAgICAgIHJ2YWx1ZSA9IHJ2YWx1ZS5yZXBsYWNlKC9cXHIvZywgXCJcXFxcclwiKTtcbiAgICAgICAgcmV0dXJuIHJ2YWx1ZTtcbiAgICB9XG59XG4vLyBmcm9tIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL2VuY29kZVVSSUNvbXBvbmVudFxuZnVuY3Rpb24gZml4ZWRFbmNvZGVVUklDb21wb25lbnQocykge1xuICAgIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQocykucmVwbGFjZSgvWyEnKCkqXS9nLCBjID0+ICclJyArIGMuY2hhckNvZGVBdCgwKS50b1N0cmluZygxNikpO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dmlzdWFsaXplci5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMudmlzdWFsaXplQXNIdG1sID0gZXhwb3J0cy52aXN1YWxpemVBc1VybCA9IGV4cG9ydHMuY29tcGlsZSA9IGV4cG9ydHMuUGFyc2VFcnJvciA9IGV4cG9ydHMuVkVSU0lPTiA9IHZvaWQgMDtcbmV4cG9ydHMuVkVSU0lPTiA9IFwiMy4yLjNcIjtcbnZhciB0eXBlc18xID0gcmVxdWlyZShcIi4vaW50ZXJuYWwvdHlwZXNcIik7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJQYXJzZUVycm9yXCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0eXBlc18xLlBhcnNlRXJyb3I7IH0gfSk7XG47XG52YXIgY29tcGlsZXJfMSA9IHJlcXVpcmUoXCIuL2ludGVybmFsL2NvbXBpbGVyXCIpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiY29tcGlsZVwiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gY29tcGlsZXJfMS5jb21waWxlOyB9IH0pO1xudmFyIHZpc3VhbGl6ZXJfMSA9IHJlcXVpcmUoXCIuL2ludGVybmFsL3Zpc3VhbGl6ZXJcIik7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJ2aXN1YWxpemVBc1VybFwiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdmlzdWFsaXplcl8xLnZpc3VhbGl6ZUFzVXJsOyB9IH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwidmlzdWFsaXplQXNIdG1sXCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB2aXN1YWxpemVyXzEudmlzdWFsaXplQXNIdG1sOyB9IH0pO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGFyc2VybGliLmpzLm1hcCIsIi8vICdwYXRoJyBtb2R1bGUgZXh0cmFjdGVkIGZyb20gTm9kZS5qcyB2OC4xMS4xIChvbmx5IHRoZSBwb3NpeCBwYXJ0KVxuLy8gdHJhbnNwbGl0ZWQgd2l0aCBCYWJlbFxuXG4vLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBhc3NlcnRQYXRoKHBhdGgpIHtcbiAgaWYgKHR5cGVvZiBwYXRoICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1BhdGggbXVzdCBiZSBhIHN0cmluZy4gUmVjZWl2ZWQgJyArIEpTT04uc3RyaW5naWZ5KHBhdGgpKTtcbiAgfVxufVxuXG4vLyBSZXNvbHZlcyAuIGFuZCAuLiBlbGVtZW50cyBpbiBhIHBhdGggd2l0aCBkaXJlY3RvcnkgbmFtZXNcbmZ1bmN0aW9uIG5vcm1hbGl6ZVN0cmluZ1Bvc2l4KHBhdGgsIGFsbG93QWJvdmVSb290KSB7XG4gIHZhciByZXMgPSAnJztcbiAgdmFyIGxhc3RTZWdtZW50TGVuZ3RoID0gMDtcbiAgdmFyIGxhc3RTbGFzaCA9IC0xO1xuICB2YXIgZG90cyA9IDA7XG4gIHZhciBjb2RlO1xuICBmb3IgKHZhciBpID0gMDsgaSA8PSBwYXRoLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKGkgPCBwYXRoLmxlbmd0aClcbiAgICAgIGNvZGUgPSBwYXRoLmNoYXJDb2RlQXQoaSk7XG4gICAgZWxzZSBpZiAoY29kZSA9PT0gNDcgLyovKi8pXG4gICAgICBicmVhaztcbiAgICBlbHNlXG4gICAgICBjb2RlID0gNDcgLyovKi87XG4gICAgaWYgKGNvZGUgPT09IDQ3IC8qLyovKSB7XG4gICAgICBpZiAobGFzdFNsYXNoID09PSBpIC0gMSB8fCBkb3RzID09PSAxKSB7XG4gICAgICAgIC8vIE5PT1BcbiAgICAgIH0gZWxzZSBpZiAobGFzdFNsYXNoICE9PSBpIC0gMSAmJiBkb3RzID09PSAyKSB7XG4gICAgICAgIGlmIChyZXMubGVuZ3RoIDwgMiB8fCBsYXN0U2VnbWVudExlbmd0aCAhPT0gMiB8fCByZXMuY2hhckNvZGVBdChyZXMubGVuZ3RoIC0gMSkgIT09IDQ2IC8qLiovIHx8IHJlcy5jaGFyQ29kZUF0KHJlcy5sZW5ndGggLSAyKSAhPT0gNDYgLyouKi8pIHtcbiAgICAgICAgICBpZiAocmVzLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICAgIHZhciBsYXN0U2xhc2hJbmRleCA9IHJlcy5sYXN0SW5kZXhPZignLycpO1xuICAgICAgICAgICAgaWYgKGxhc3RTbGFzaEluZGV4ICE9PSByZXMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICBpZiAobGFzdFNsYXNoSW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgcmVzID0gJyc7XG4gICAgICAgICAgICAgICAgbGFzdFNlZ21lbnRMZW5ndGggPSAwO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlcyA9IHJlcy5zbGljZSgwLCBsYXN0U2xhc2hJbmRleCk7XG4gICAgICAgICAgICAgICAgbGFzdFNlZ21lbnRMZW5ndGggPSByZXMubGVuZ3RoIC0gMSAtIHJlcy5sYXN0SW5kZXhPZignLycpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGxhc3RTbGFzaCA9IGk7XG4gICAgICAgICAgICAgIGRvdHMgPSAwO1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKHJlcy5sZW5ndGggPT09IDIgfHwgcmVzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgcmVzID0gJyc7XG4gICAgICAgICAgICBsYXN0U2VnbWVudExlbmd0aCA9IDA7XG4gICAgICAgICAgICBsYXN0U2xhc2ggPSBpO1xuICAgICAgICAgICAgZG90cyA9IDA7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFsbG93QWJvdmVSb290KSB7XG4gICAgICAgICAgaWYgKHJlcy5sZW5ndGggPiAwKVxuICAgICAgICAgICAgcmVzICs9ICcvLi4nO1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJlcyA9ICcuLic7XG4gICAgICAgICAgbGFzdFNlZ21lbnRMZW5ndGggPSAyO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAocmVzLmxlbmd0aCA+IDApXG4gICAgICAgICAgcmVzICs9ICcvJyArIHBhdGguc2xpY2UobGFzdFNsYXNoICsgMSwgaSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXMgPSBwYXRoLnNsaWNlKGxhc3RTbGFzaCArIDEsIGkpO1xuICAgICAgICBsYXN0U2VnbWVudExlbmd0aCA9IGkgLSBsYXN0U2xhc2ggLSAxO1xuICAgICAgfVxuICAgICAgbGFzdFNsYXNoID0gaTtcbiAgICAgIGRvdHMgPSAwO1xuICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gNDYgLyouKi8gJiYgZG90cyAhPT0gLTEpIHtcbiAgICAgICsrZG90cztcbiAgICB9IGVsc2Uge1xuICAgICAgZG90cyA9IC0xO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzO1xufVxuXG5mdW5jdGlvbiBfZm9ybWF0KHNlcCwgcGF0aE9iamVjdCkge1xuICB2YXIgZGlyID0gcGF0aE9iamVjdC5kaXIgfHwgcGF0aE9iamVjdC5yb290O1xuICB2YXIgYmFzZSA9IHBhdGhPYmplY3QuYmFzZSB8fCAocGF0aE9iamVjdC5uYW1lIHx8ICcnKSArIChwYXRoT2JqZWN0LmV4dCB8fCAnJyk7XG4gIGlmICghZGlyKSB7XG4gICAgcmV0dXJuIGJhc2U7XG4gIH1cbiAgaWYgKGRpciA9PT0gcGF0aE9iamVjdC5yb290KSB7XG4gICAgcmV0dXJuIGRpciArIGJhc2U7XG4gIH1cbiAgcmV0dXJuIGRpciArIHNlcCArIGJhc2U7XG59XG5cbnZhciBwb3NpeCA9IHtcbiAgLy8gcGF0aC5yZXNvbHZlKFtmcm9tIC4uLl0sIHRvKVxuICByZXNvbHZlOiBmdW5jdGlvbiByZXNvbHZlKCkge1xuICAgIHZhciByZXNvbHZlZFBhdGggPSAnJztcbiAgICB2YXIgcmVzb2x2ZWRBYnNvbHV0ZSA9IGZhbHNlO1xuICAgIHZhciBjd2Q7XG5cbiAgICBmb3IgKHZhciBpID0gYXJndW1lbnRzLmxlbmd0aCAtIDE7IGkgPj0gLTEgJiYgIXJlc29sdmVkQWJzb2x1dGU7IGktLSkge1xuICAgICAgdmFyIHBhdGg7XG4gICAgICBpZiAoaSA+PSAwKVxuICAgICAgICBwYXRoID0gYXJndW1lbnRzW2ldO1xuICAgICAgZWxzZSB7XG4gICAgICAgIGlmIChjd2QgPT09IHVuZGVmaW5lZClcbiAgICAgICAgICBjd2QgPSBwcm9jZXNzLmN3ZCgpO1xuICAgICAgICBwYXRoID0gY3dkO1xuICAgICAgfVxuXG4gICAgICBhc3NlcnRQYXRoKHBhdGgpO1xuXG4gICAgICAvLyBTa2lwIGVtcHR5IGVudHJpZXNcbiAgICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgcmVzb2x2ZWRQYXRoID0gcGF0aCArICcvJyArIHJlc29sdmVkUGF0aDtcbiAgICAgIHJlc29sdmVkQWJzb2x1dGUgPSBwYXRoLmNoYXJDb2RlQXQoMCkgPT09IDQ3IC8qLyovO1xuICAgIH1cblxuICAgIC8vIEF0IHRoaXMgcG9pbnQgdGhlIHBhdGggc2hvdWxkIGJlIHJlc29sdmVkIHRvIGEgZnVsbCBhYnNvbHV0ZSBwYXRoLCBidXRcbiAgICAvLyBoYW5kbGUgcmVsYXRpdmUgcGF0aHMgdG8gYmUgc2FmZSAobWlnaHQgaGFwcGVuIHdoZW4gcHJvY2Vzcy5jd2QoKSBmYWlscylcblxuICAgIC8vIE5vcm1hbGl6ZSB0aGUgcGF0aFxuICAgIHJlc29sdmVkUGF0aCA9IG5vcm1hbGl6ZVN0cmluZ1Bvc2l4KHJlc29sdmVkUGF0aCwgIXJlc29sdmVkQWJzb2x1dGUpO1xuXG4gICAgaWYgKHJlc29sdmVkQWJzb2x1dGUpIHtcbiAgICAgIGlmIChyZXNvbHZlZFBhdGgubGVuZ3RoID4gMClcbiAgICAgICAgcmV0dXJuICcvJyArIHJlc29sdmVkUGF0aDtcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuICcvJztcbiAgICB9IGVsc2UgaWYgKHJlc29sdmVkUGF0aC5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gcmVzb2x2ZWRQYXRoO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJy4nO1xuICAgIH1cbiAgfSxcblxuICBub3JtYWxpemU6IGZ1bmN0aW9uIG5vcm1hbGl6ZShwYXRoKSB7XG4gICAgYXNzZXJ0UGF0aChwYXRoKTtcblxuICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMCkgcmV0dXJuICcuJztcblxuICAgIHZhciBpc0Fic29sdXRlID0gcGF0aC5jaGFyQ29kZUF0KDApID09PSA0NyAvKi8qLztcbiAgICB2YXIgdHJhaWxpbmdTZXBhcmF0b3IgPSBwYXRoLmNoYXJDb2RlQXQocGF0aC5sZW5ndGggLSAxKSA9PT0gNDcgLyovKi87XG5cbiAgICAvLyBOb3JtYWxpemUgdGhlIHBhdGhcbiAgICBwYXRoID0gbm9ybWFsaXplU3RyaW5nUG9zaXgocGF0aCwgIWlzQWJzb2x1dGUpO1xuXG4gICAgaWYgKHBhdGgubGVuZ3RoID09PSAwICYmICFpc0Fic29sdXRlKSBwYXRoID0gJy4nO1xuICAgIGlmIChwYXRoLmxlbmd0aCA+IDAgJiYgdHJhaWxpbmdTZXBhcmF0b3IpIHBhdGggKz0gJy8nO1xuXG4gICAgaWYgKGlzQWJzb2x1dGUpIHJldHVybiAnLycgKyBwYXRoO1xuICAgIHJldHVybiBwYXRoO1xuICB9LFxuXG4gIGlzQWJzb2x1dGU6IGZ1bmN0aW9uIGlzQWJzb2x1dGUocGF0aCkge1xuICAgIGFzc2VydFBhdGgocGF0aCk7XG4gICAgcmV0dXJuIHBhdGgubGVuZ3RoID4gMCAmJiBwYXRoLmNoYXJDb2RlQXQoMCkgPT09IDQ3IC8qLyovO1xuICB9LFxuXG4gIGpvaW46IGZ1bmN0aW9uIGpvaW4oKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICByZXR1cm4gJy4nO1xuICAgIHZhciBqb2luZWQ7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBhcmcgPSBhcmd1bWVudHNbaV07XG4gICAgICBhc3NlcnRQYXRoKGFyZyk7XG4gICAgICBpZiAoYXJnLmxlbmd0aCA+IDApIHtcbiAgICAgICAgaWYgKGpvaW5lZCA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgIGpvaW5lZCA9IGFyZztcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGpvaW5lZCArPSAnLycgKyBhcmc7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChqb2luZWQgPT09IHVuZGVmaW5lZClcbiAgICAgIHJldHVybiAnLic7XG4gICAgcmV0dXJuIHBvc2l4Lm5vcm1hbGl6ZShqb2luZWQpO1xuICB9LFxuXG4gIHJlbGF0aXZlOiBmdW5jdGlvbiByZWxhdGl2ZShmcm9tLCB0bykge1xuICAgIGFzc2VydFBhdGgoZnJvbSk7XG4gICAgYXNzZXJ0UGF0aCh0byk7XG5cbiAgICBpZiAoZnJvbSA9PT0gdG8pIHJldHVybiAnJztcblxuICAgIGZyb20gPSBwb3NpeC5yZXNvbHZlKGZyb20pO1xuICAgIHRvID0gcG9zaXgucmVzb2x2ZSh0byk7XG5cbiAgICBpZiAoZnJvbSA9PT0gdG8pIHJldHVybiAnJztcblxuICAgIC8vIFRyaW0gYW55IGxlYWRpbmcgYmFja3NsYXNoZXNcbiAgICB2YXIgZnJvbVN0YXJ0ID0gMTtcbiAgICBmb3IgKDsgZnJvbVN0YXJ0IDwgZnJvbS5sZW5ndGg7ICsrZnJvbVN0YXJ0KSB7XG4gICAgICBpZiAoZnJvbS5jaGFyQ29kZUF0KGZyb21TdGFydCkgIT09IDQ3IC8qLyovKVxuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgdmFyIGZyb21FbmQgPSBmcm9tLmxlbmd0aDtcbiAgICB2YXIgZnJvbUxlbiA9IGZyb21FbmQgLSBmcm9tU3RhcnQ7XG5cbiAgICAvLyBUcmltIGFueSBsZWFkaW5nIGJhY2tzbGFzaGVzXG4gICAgdmFyIHRvU3RhcnQgPSAxO1xuICAgIGZvciAoOyB0b1N0YXJ0IDwgdG8ubGVuZ3RoOyArK3RvU3RhcnQpIHtcbiAgICAgIGlmICh0by5jaGFyQ29kZUF0KHRvU3RhcnQpICE9PSA0NyAvKi8qLylcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHZhciB0b0VuZCA9IHRvLmxlbmd0aDtcbiAgICB2YXIgdG9MZW4gPSB0b0VuZCAtIHRvU3RhcnQ7XG5cbiAgICAvLyBDb21wYXJlIHBhdGhzIHRvIGZpbmQgdGhlIGxvbmdlc3QgY29tbW9uIHBhdGggZnJvbSByb290XG4gICAgdmFyIGxlbmd0aCA9IGZyb21MZW4gPCB0b0xlbiA/IGZyb21MZW4gOiB0b0xlbjtcbiAgICB2YXIgbGFzdENvbW1vblNlcCA9IC0xO1xuICAgIHZhciBpID0gMDtcbiAgICBmb3IgKDsgaSA8PSBsZW5ndGg7ICsraSkge1xuICAgICAgaWYgKGkgPT09IGxlbmd0aCkge1xuICAgICAgICBpZiAodG9MZW4gPiBsZW5ndGgpIHtcbiAgICAgICAgICBpZiAodG8uY2hhckNvZGVBdCh0b1N0YXJ0ICsgaSkgPT09IDQ3IC8qLyovKSB7XG4gICAgICAgICAgICAvLyBXZSBnZXQgaGVyZSBpZiBgZnJvbWAgaXMgdGhlIGV4YWN0IGJhc2UgcGF0aCBmb3IgYHRvYC5cbiAgICAgICAgICAgIC8vIEZvciBleGFtcGxlOiBmcm9tPScvZm9vL2Jhcic7IHRvPScvZm9vL2Jhci9iYXonXG4gICAgICAgICAgICByZXR1cm4gdG8uc2xpY2UodG9TdGFydCArIGkgKyAxKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGkgPT09IDApIHtcbiAgICAgICAgICAgIC8vIFdlIGdldCBoZXJlIGlmIGBmcm9tYCBpcyB0aGUgcm9vdFxuICAgICAgICAgICAgLy8gRm9yIGV4YW1wbGU6IGZyb209Jy8nOyB0bz0nL2ZvbydcbiAgICAgICAgICAgIHJldHVybiB0by5zbGljZSh0b1N0YXJ0ICsgaSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGZyb21MZW4gPiBsZW5ndGgpIHtcbiAgICAgICAgICBpZiAoZnJvbS5jaGFyQ29kZUF0KGZyb21TdGFydCArIGkpID09PSA0NyAvKi8qLykge1xuICAgICAgICAgICAgLy8gV2UgZ2V0IGhlcmUgaWYgYHRvYCBpcyB0aGUgZXhhY3QgYmFzZSBwYXRoIGZvciBgZnJvbWAuXG4gICAgICAgICAgICAvLyBGb3IgZXhhbXBsZTogZnJvbT0nL2Zvby9iYXIvYmF6JzsgdG89Jy9mb28vYmFyJ1xuICAgICAgICAgICAgbGFzdENvbW1vblNlcCA9IGk7XG4gICAgICAgICAgfSBlbHNlIGlmIChpID09PSAwKSB7XG4gICAgICAgICAgICAvLyBXZSBnZXQgaGVyZSBpZiBgdG9gIGlzIHRoZSByb290LlxuICAgICAgICAgICAgLy8gRm9yIGV4YW1wbGU6IGZyb209Jy9mb28nOyB0bz0nLydcbiAgICAgICAgICAgIGxhc3RDb21tb25TZXAgPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIHZhciBmcm9tQ29kZSA9IGZyb20uY2hhckNvZGVBdChmcm9tU3RhcnQgKyBpKTtcbiAgICAgIHZhciB0b0NvZGUgPSB0by5jaGFyQ29kZUF0KHRvU3RhcnQgKyBpKTtcbiAgICAgIGlmIChmcm9tQ29kZSAhPT0gdG9Db2RlKVxuICAgICAgICBicmVhaztcbiAgICAgIGVsc2UgaWYgKGZyb21Db2RlID09PSA0NyAvKi8qLylcbiAgICAgICAgbGFzdENvbW1vblNlcCA9IGk7XG4gICAgfVxuXG4gICAgdmFyIG91dCA9ICcnO1xuICAgIC8vIEdlbmVyYXRlIHRoZSByZWxhdGl2ZSBwYXRoIGJhc2VkIG9uIHRoZSBwYXRoIGRpZmZlcmVuY2UgYmV0d2VlbiBgdG9gXG4gICAgLy8gYW5kIGBmcm9tYFxuICAgIGZvciAoaSA9IGZyb21TdGFydCArIGxhc3RDb21tb25TZXAgKyAxOyBpIDw9IGZyb21FbmQ7ICsraSkge1xuICAgICAgaWYgKGkgPT09IGZyb21FbmQgfHwgZnJvbS5jaGFyQ29kZUF0KGkpID09PSA0NyAvKi8qLykge1xuICAgICAgICBpZiAob3V0Lmxlbmd0aCA9PT0gMClcbiAgICAgICAgICBvdXQgKz0gJy4uJztcbiAgICAgICAgZWxzZVxuICAgICAgICAgIG91dCArPSAnLy4uJztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBMYXN0bHksIGFwcGVuZCB0aGUgcmVzdCBvZiB0aGUgZGVzdGluYXRpb24gKGB0b2ApIHBhdGggdGhhdCBjb21lcyBhZnRlclxuICAgIC8vIHRoZSBjb21tb24gcGF0aCBwYXJ0c1xuICAgIGlmIChvdXQubGVuZ3RoID4gMClcbiAgICAgIHJldHVybiBvdXQgKyB0by5zbGljZSh0b1N0YXJ0ICsgbGFzdENvbW1vblNlcCk7XG4gICAgZWxzZSB7XG4gICAgICB0b1N0YXJ0ICs9IGxhc3RDb21tb25TZXA7XG4gICAgICBpZiAodG8uY2hhckNvZGVBdCh0b1N0YXJ0KSA9PT0gNDcgLyovKi8pXG4gICAgICAgICsrdG9TdGFydDtcbiAgICAgIHJldHVybiB0by5zbGljZSh0b1N0YXJ0KTtcbiAgICB9XG4gIH0sXG5cbiAgX21ha2VMb25nOiBmdW5jdGlvbiBfbWFrZUxvbmcocGF0aCkge1xuICAgIHJldHVybiBwYXRoO1xuICB9LFxuXG4gIGRpcm5hbWU6IGZ1bmN0aW9uIGRpcm5hbWUocGF0aCkge1xuICAgIGFzc2VydFBhdGgocGF0aCk7XG4gICAgaWYgKHBhdGgubGVuZ3RoID09PSAwKSByZXR1cm4gJy4nO1xuICAgIHZhciBjb2RlID0gcGF0aC5jaGFyQ29kZUF0KDApO1xuICAgIHZhciBoYXNSb290ID0gY29kZSA9PT0gNDcgLyovKi87XG4gICAgdmFyIGVuZCA9IC0xO1xuICAgIHZhciBtYXRjaGVkU2xhc2ggPSB0cnVlO1xuICAgIGZvciAodmFyIGkgPSBwYXRoLmxlbmd0aCAtIDE7IGkgPj0gMTsgLS1pKSB7XG4gICAgICBjb2RlID0gcGF0aC5jaGFyQ29kZUF0KGkpO1xuICAgICAgaWYgKGNvZGUgPT09IDQ3IC8qLyovKSB7XG4gICAgICAgICAgaWYgKCFtYXRjaGVkU2xhc2gpIHtcbiAgICAgICAgICAgIGVuZCA9IGk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFdlIHNhdyB0aGUgZmlyc3Qgbm9uLXBhdGggc2VwYXJhdG9yXG4gICAgICAgIG1hdGNoZWRTbGFzaCA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChlbmQgPT09IC0xKSByZXR1cm4gaGFzUm9vdCA/ICcvJyA6ICcuJztcbiAgICBpZiAoaGFzUm9vdCAmJiBlbmQgPT09IDEpIHJldHVybiAnLy8nO1xuICAgIHJldHVybiBwYXRoLnNsaWNlKDAsIGVuZCk7XG4gIH0sXG5cbiAgYmFzZW5hbWU6IGZ1bmN0aW9uIGJhc2VuYW1lKHBhdGgsIGV4dCkge1xuICAgIGlmIChleHQgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgZXh0ICE9PSAnc3RyaW5nJykgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJleHRcIiBhcmd1bWVudCBtdXN0IGJlIGEgc3RyaW5nJyk7XG4gICAgYXNzZXJ0UGF0aChwYXRoKTtcblxuICAgIHZhciBzdGFydCA9IDA7XG4gICAgdmFyIGVuZCA9IC0xO1xuICAgIHZhciBtYXRjaGVkU2xhc2ggPSB0cnVlO1xuICAgIHZhciBpO1xuXG4gICAgaWYgKGV4dCAhPT0gdW5kZWZpbmVkICYmIGV4dC5sZW5ndGggPiAwICYmIGV4dC5sZW5ndGggPD0gcGF0aC5sZW5ndGgpIHtcbiAgICAgIGlmIChleHQubGVuZ3RoID09PSBwYXRoLmxlbmd0aCAmJiBleHQgPT09IHBhdGgpIHJldHVybiAnJztcbiAgICAgIHZhciBleHRJZHggPSBleHQubGVuZ3RoIC0gMTtcbiAgICAgIHZhciBmaXJzdE5vblNsYXNoRW5kID0gLTE7XG4gICAgICBmb3IgKGkgPSBwYXRoLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBjb2RlID0gcGF0aC5jaGFyQ29kZUF0KGkpO1xuICAgICAgICBpZiAoY29kZSA9PT0gNDcgLyovKi8pIHtcbiAgICAgICAgICAgIC8vIElmIHdlIHJlYWNoZWQgYSBwYXRoIHNlcGFyYXRvciB0aGF0IHdhcyBub3QgcGFydCBvZiBhIHNldCBvZiBwYXRoXG4gICAgICAgICAgICAvLyBzZXBhcmF0b3JzIGF0IHRoZSBlbmQgb2YgdGhlIHN0cmluZywgc3RvcCBub3dcbiAgICAgICAgICAgIGlmICghbWF0Y2hlZFNsYXNoKSB7XG4gICAgICAgICAgICAgIHN0YXJ0ID0gaSArIDE7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGZpcnN0Tm9uU2xhc2hFbmQgPT09IC0xKSB7XG4gICAgICAgICAgICAvLyBXZSBzYXcgdGhlIGZpcnN0IG5vbi1wYXRoIHNlcGFyYXRvciwgcmVtZW1iZXIgdGhpcyBpbmRleCBpbiBjYXNlXG4gICAgICAgICAgICAvLyB3ZSBuZWVkIGl0IGlmIHRoZSBleHRlbnNpb24gZW5kcyB1cCBub3QgbWF0Y2hpbmdcbiAgICAgICAgICAgIG1hdGNoZWRTbGFzaCA9IGZhbHNlO1xuICAgICAgICAgICAgZmlyc3ROb25TbGFzaEVuZCA9IGkgKyAxO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoZXh0SWR4ID49IDApIHtcbiAgICAgICAgICAgIC8vIFRyeSB0byBtYXRjaCB0aGUgZXhwbGljaXQgZXh0ZW5zaW9uXG4gICAgICAgICAgICBpZiAoY29kZSA9PT0gZXh0LmNoYXJDb2RlQXQoZXh0SWR4KSkge1xuICAgICAgICAgICAgICBpZiAoLS1leHRJZHggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgLy8gV2UgbWF0Y2hlZCB0aGUgZXh0ZW5zaW9uLCBzbyBtYXJrIHRoaXMgYXMgdGhlIGVuZCBvZiBvdXIgcGF0aFxuICAgICAgICAgICAgICAgIC8vIGNvbXBvbmVudFxuICAgICAgICAgICAgICAgIGVuZCA9IGk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIEV4dGVuc2lvbiBkb2VzIG5vdCBtYXRjaCwgc28gb3VyIHJlc3VsdCBpcyB0aGUgZW50aXJlIHBhdGhcbiAgICAgICAgICAgICAgLy8gY29tcG9uZW50XG4gICAgICAgICAgICAgIGV4dElkeCA9IC0xO1xuICAgICAgICAgICAgICBlbmQgPSBmaXJzdE5vblNsYXNoRW5kO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoc3RhcnQgPT09IGVuZCkgZW5kID0gZmlyc3ROb25TbGFzaEVuZDtlbHNlIGlmIChlbmQgPT09IC0xKSBlbmQgPSBwYXRoLmxlbmd0aDtcbiAgICAgIHJldHVybiBwYXRoLnNsaWNlKHN0YXJ0LCBlbmQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGkgPSBwYXRoLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIGlmIChwYXRoLmNoYXJDb2RlQXQoaSkgPT09IDQ3IC8qLyovKSB7XG4gICAgICAgICAgICAvLyBJZiB3ZSByZWFjaGVkIGEgcGF0aCBzZXBhcmF0b3IgdGhhdCB3YXMgbm90IHBhcnQgb2YgYSBzZXQgb2YgcGF0aFxuICAgICAgICAgICAgLy8gc2VwYXJhdG9ycyBhdCB0aGUgZW5kIG9mIHRoZSBzdHJpbmcsIHN0b3Agbm93XG4gICAgICAgICAgICBpZiAoIW1hdGNoZWRTbGFzaCkge1xuICAgICAgICAgICAgICBzdGFydCA9IGkgKyAxO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKGVuZCA9PT0gLTEpIHtcbiAgICAgICAgICAvLyBXZSBzYXcgdGhlIGZpcnN0IG5vbi1wYXRoIHNlcGFyYXRvciwgbWFyayB0aGlzIGFzIHRoZSBlbmQgb2Ygb3VyXG4gICAgICAgICAgLy8gcGF0aCBjb21wb25lbnRcbiAgICAgICAgICBtYXRjaGVkU2xhc2ggPSBmYWxzZTtcbiAgICAgICAgICBlbmQgPSBpICsgMTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZW5kID09PSAtMSkgcmV0dXJuICcnO1xuICAgICAgcmV0dXJuIHBhdGguc2xpY2Uoc3RhcnQsIGVuZCk7XG4gICAgfVxuICB9LFxuXG4gIGV4dG5hbWU6IGZ1bmN0aW9uIGV4dG5hbWUocGF0aCkge1xuICAgIGFzc2VydFBhdGgocGF0aCk7XG4gICAgdmFyIHN0YXJ0RG90ID0gLTE7XG4gICAgdmFyIHN0YXJ0UGFydCA9IDA7XG4gICAgdmFyIGVuZCA9IC0xO1xuICAgIHZhciBtYXRjaGVkU2xhc2ggPSB0cnVlO1xuICAgIC8vIFRyYWNrIHRoZSBzdGF0ZSBvZiBjaGFyYWN0ZXJzIChpZiBhbnkpIHdlIHNlZSBiZWZvcmUgb3VyIGZpcnN0IGRvdCBhbmRcbiAgICAvLyBhZnRlciBhbnkgcGF0aCBzZXBhcmF0b3Igd2UgZmluZFxuICAgIHZhciBwcmVEb3RTdGF0ZSA9IDA7XG4gICAgZm9yICh2YXIgaSA9IHBhdGgubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgIHZhciBjb2RlID0gcGF0aC5jaGFyQ29kZUF0KGkpO1xuICAgICAgaWYgKGNvZGUgPT09IDQ3IC8qLyovKSB7XG4gICAgICAgICAgLy8gSWYgd2UgcmVhY2hlZCBhIHBhdGggc2VwYXJhdG9yIHRoYXQgd2FzIG5vdCBwYXJ0IG9mIGEgc2V0IG9mIHBhdGhcbiAgICAgICAgICAvLyBzZXBhcmF0b3JzIGF0IHRoZSBlbmQgb2YgdGhlIHN0cmluZywgc3RvcCBub3dcbiAgICAgICAgICBpZiAoIW1hdGNoZWRTbGFzaCkge1xuICAgICAgICAgICAgc3RhcnRQYXJ0ID0gaSArIDE7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgIGlmIChlbmQgPT09IC0xKSB7XG4gICAgICAgIC8vIFdlIHNhdyB0aGUgZmlyc3Qgbm9uLXBhdGggc2VwYXJhdG9yLCBtYXJrIHRoaXMgYXMgdGhlIGVuZCBvZiBvdXJcbiAgICAgICAgLy8gZXh0ZW5zaW9uXG4gICAgICAgIG1hdGNoZWRTbGFzaCA9IGZhbHNlO1xuICAgICAgICBlbmQgPSBpICsgMTtcbiAgICAgIH1cbiAgICAgIGlmIChjb2RlID09PSA0NiAvKi4qLykge1xuICAgICAgICAgIC8vIElmIHRoaXMgaXMgb3VyIGZpcnN0IGRvdCwgbWFyayBpdCBhcyB0aGUgc3RhcnQgb2Ygb3VyIGV4dGVuc2lvblxuICAgICAgICAgIGlmIChzdGFydERvdCA9PT0gLTEpXG4gICAgICAgICAgICBzdGFydERvdCA9IGk7XG4gICAgICAgICAgZWxzZSBpZiAocHJlRG90U3RhdGUgIT09IDEpXG4gICAgICAgICAgICBwcmVEb3RTdGF0ZSA9IDE7XG4gICAgICB9IGVsc2UgaWYgKHN0YXJ0RG90ICE9PSAtMSkge1xuICAgICAgICAvLyBXZSBzYXcgYSBub24tZG90IGFuZCBub24tcGF0aCBzZXBhcmF0b3IgYmVmb3JlIG91ciBkb3QsIHNvIHdlIHNob3VsZFxuICAgICAgICAvLyBoYXZlIGEgZ29vZCBjaGFuY2UgYXQgaGF2aW5nIGEgbm9uLWVtcHR5IGV4dGVuc2lvblxuICAgICAgICBwcmVEb3RTdGF0ZSA9IC0xO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdGFydERvdCA9PT0gLTEgfHwgZW5kID09PSAtMSB8fFxuICAgICAgICAvLyBXZSBzYXcgYSBub24tZG90IGNoYXJhY3RlciBpbW1lZGlhdGVseSBiZWZvcmUgdGhlIGRvdFxuICAgICAgICBwcmVEb3RTdGF0ZSA9PT0gMCB8fFxuICAgICAgICAvLyBUaGUgKHJpZ2h0LW1vc3QpIHRyaW1tZWQgcGF0aCBjb21wb25lbnQgaXMgZXhhY3RseSAnLi4nXG4gICAgICAgIHByZURvdFN0YXRlID09PSAxICYmIHN0YXJ0RG90ID09PSBlbmQgLSAxICYmIHN0YXJ0RG90ID09PSBzdGFydFBhcnQgKyAxKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIHJldHVybiBwYXRoLnNsaWNlKHN0YXJ0RG90LCBlbmQpO1xuICB9LFxuXG4gIGZvcm1hdDogZnVuY3Rpb24gZm9ybWF0KHBhdGhPYmplY3QpIHtcbiAgICBpZiAocGF0aE9iamVjdCA9PT0gbnVsbCB8fCB0eXBlb2YgcGF0aE9iamVjdCAhPT0gJ29iamVjdCcpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1RoZSBcInBhdGhPYmplY3RcIiBhcmd1bWVudCBtdXN0IGJlIG9mIHR5cGUgT2JqZWN0LiBSZWNlaXZlZCB0eXBlICcgKyB0eXBlb2YgcGF0aE9iamVjdCk7XG4gICAgfVxuICAgIHJldHVybiBfZm9ybWF0KCcvJywgcGF0aE9iamVjdCk7XG4gIH0sXG5cbiAgcGFyc2U6IGZ1bmN0aW9uIHBhcnNlKHBhdGgpIHtcbiAgICBhc3NlcnRQYXRoKHBhdGgpO1xuXG4gICAgdmFyIHJldCA9IHsgcm9vdDogJycsIGRpcjogJycsIGJhc2U6ICcnLCBleHQ6ICcnLCBuYW1lOiAnJyB9O1xuICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHJldDtcbiAgICB2YXIgY29kZSA9IHBhdGguY2hhckNvZGVBdCgwKTtcbiAgICB2YXIgaXNBYnNvbHV0ZSA9IGNvZGUgPT09IDQ3IC8qLyovO1xuICAgIHZhciBzdGFydDtcbiAgICBpZiAoaXNBYnNvbHV0ZSkge1xuICAgICAgcmV0LnJvb3QgPSAnLyc7XG4gICAgICBzdGFydCA9IDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0YXJ0ID0gMDtcbiAgICB9XG4gICAgdmFyIHN0YXJ0RG90ID0gLTE7XG4gICAgdmFyIHN0YXJ0UGFydCA9IDA7XG4gICAgdmFyIGVuZCA9IC0xO1xuICAgIHZhciBtYXRjaGVkU2xhc2ggPSB0cnVlO1xuICAgIHZhciBpID0gcGF0aC5sZW5ndGggLSAxO1xuXG4gICAgLy8gVHJhY2sgdGhlIHN0YXRlIG9mIGNoYXJhY3RlcnMgKGlmIGFueSkgd2Ugc2VlIGJlZm9yZSBvdXIgZmlyc3QgZG90IGFuZFxuICAgIC8vIGFmdGVyIGFueSBwYXRoIHNlcGFyYXRvciB3ZSBmaW5kXG4gICAgdmFyIHByZURvdFN0YXRlID0gMDtcblxuICAgIC8vIEdldCBub24tZGlyIGluZm9cbiAgICBmb3IgKDsgaSA+PSBzdGFydDsgLS1pKSB7XG4gICAgICBjb2RlID0gcGF0aC5jaGFyQ29kZUF0KGkpO1xuICAgICAgaWYgKGNvZGUgPT09IDQ3IC8qLyovKSB7XG4gICAgICAgICAgLy8gSWYgd2UgcmVhY2hlZCBhIHBhdGggc2VwYXJhdG9yIHRoYXQgd2FzIG5vdCBwYXJ0IG9mIGEgc2V0IG9mIHBhdGhcbiAgICAgICAgICAvLyBzZXBhcmF0b3JzIGF0IHRoZSBlbmQgb2YgdGhlIHN0cmluZywgc3RvcCBub3dcbiAgICAgICAgICBpZiAoIW1hdGNoZWRTbGFzaCkge1xuICAgICAgICAgICAgc3RhcnRQYXJ0ID0gaSArIDE7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgIGlmIChlbmQgPT09IC0xKSB7XG4gICAgICAgIC8vIFdlIHNhdyB0aGUgZmlyc3Qgbm9uLXBhdGggc2VwYXJhdG9yLCBtYXJrIHRoaXMgYXMgdGhlIGVuZCBvZiBvdXJcbiAgICAgICAgLy8gZXh0ZW5zaW9uXG4gICAgICAgIG1hdGNoZWRTbGFzaCA9IGZhbHNlO1xuICAgICAgICBlbmQgPSBpICsgMTtcbiAgICAgIH1cbiAgICAgIGlmIChjb2RlID09PSA0NiAvKi4qLykge1xuICAgICAgICAgIC8vIElmIHRoaXMgaXMgb3VyIGZpcnN0IGRvdCwgbWFyayBpdCBhcyB0aGUgc3RhcnQgb2Ygb3VyIGV4dGVuc2lvblxuICAgICAgICAgIGlmIChzdGFydERvdCA9PT0gLTEpIHN0YXJ0RG90ID0gaTtlbHNlIGlmIChwcmVEb3RTdGF0ZSAhPT0gMSkgcHJlRG90U3RhdGUgPSAxO1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXJ0RG90ICE9PSAtMSkge1xuICAgICAgICAvLyBXZSBzYXcgYSBub24tZG90IGFuZCBub24tcGF0aCBzZXBhcmF0b3IgYmVmb3JlIG91ciBkb3QsIHNvIHdlIHNob3VsZFxuICAgICAgICAvLyBoYXZlIGEgZ29vZCBjaGFuY2UgYXQgaGF2aW5nIGEgbm9uLWVtcHR5IGV4dGVuc2lvblxuICAgICAgICBwcmVEb3RTdGF0ZSA9IC0xO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdGFydERvdCA9PT0gLTEgfHwgZW5kID09PSAtMSB8fFxuICAgIC8vIFdlIHNhdyBhIG5vbi1kb3QgY2hhcmFjdGVyIGltbWVkaWF0ZWx5IGJlZm9yZSB0aGUgZG90XG4gICAgcHJlRG90U3RhdGUgPT09IDAgfHxcbiAgICAvLyBUaGUgKHJpZ2h0LW1vc3QpIHRyaW1tZWQgcGF0aCBjb21wb25lbnQgaXMgZXhhY3RseSAnLi4nXG4gICAgcHJlRG90U3RhdGUgPT09IDEgJiYgc3RhcnREb3QgPT09IGVuZCAtIDEgJiYgc3RhcnREb3QgPT09IHN0YXJ0UGFydCArIDEpIHtcbiAgICAgIGlmIChlbmQgIT09IC0xKSB7XG4gICAgICAgIGlmIChzdGFydFBhcnQgPT09IDAgJiYgaXNBYnNvbHV0ZSkgcmV0LmJhc2UgPSByZXQubmFtZSA9IHBhdGguc2xpY2UoMSwgZW5kKTtlbHNlIHJldC5iYXNlID0gcmV0Lm5hbWUgPSBwYXRoLnNsaWNlKHN0YXJ0UGFydCwgZW5kKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHN0YXJ0UGFydCA9PT0gMCAmJiBpc0Fic29sdXRlKSB7XG4gICAgICAgIHJldC5uYW1lID0gcGF0aC5zbGljZSgxLCBzdGFydERvdCk7XG4gICAgICAgIHJldC5iYXNlID0gcGF0aC5zbGljZSgxLCBlbmQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0Lm5hbWUgPSBwYXRoLnNsaWNlKHN0YXJ0UGFydCwgc3RhcnREb3QpO1xuICAgICAgICByZXQuYmFzZSA9IHBhdGguc2xpY2Uoc3RhcnRQYXJ0LCBlbmQpO1xuICAgICAgfVxuICAgICAgcmV0LmV4dCA9IHBhdGguc2xpY2Uoc3RhcnREb3QsIGVuZCk7XG4gICAgfVxuXG4gICAgaWYgKHN0YXJ0UGFydCA+IDApIHJldC5kaXIgPSBwYXRoLnNsaWNlKDAsIHN0YXJ0UGFydCAtIDEpO2Vsc2UgaWYgKGlzQWJzb2x1dGUpIHJldC5kaXIgPSAnLyc7XG5cbiAgICByZXR1cm4gcmV0O1xuICB9LFxuXG4gIHNlcDogJy8nLFxuICBkZWxpbWl0ZXI6ICc6JyxcbiAgd2luMzI6IG51bGwsXG4gIHBvc2l4OiBudWxsXG59O1xuXG5wb3NpeC5wb3NpeCA9IHBvc2l4O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHBvc2l4O1xuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kT25jZUxpc3RlbmVyID0gbm9vcDtcblxucHJvY2Vzcy5saXN0ZW5lcnMgPSBmdW5jdGlvbiAobmFtZSkgeyByZXR1cm4gW10gfVxuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsImltcG9ydCB7cGFyc2VQdXp6bGV9IGZyb20gJy4vUGFyc2VyJztcbmltcG9ydCB7UHV6emxlLCBTcGFjZVN0YXR1c30gZnJvbSAnLi9QdXp6bGUnO1xuXG5leHBvcnQgY2xhc3MgQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBBRihwdXp6bGUpID0gVGhlIGN1cnJlbnQgUHV6emxlIHB1enpsZSB0aGUgY2xpZW50IGlzIHBsYXlpbmcgb25cbiAgICAgKiBcbiAgICAgKiBSZXByZXNlbnRhdGlvbiBpbnZhcmlhbnQ6XG4gICAgICogIC0gVHJ1ZVxuICAgICAqIFxuICAgICAqIFNhZmV0eSBmcm9tIHJlcCBleHBvc3VyZTpcbiAgICAgKiAgLSBUaGUgZmllbGQgcHV6emxlIGlzIHByaXZhdGUsIGltbXV0YWJsZSwgYnV0IGlzbid0IHJlYWRvbmx5IHNvIGl0IGNhbiBiZSByZWFzc2lnbmVkIHVzaW5nIGZ1bmN0aW9ucyBpbiB0aGUgY2xhc3MgdG8gdXBkYXRlIHRoZSBnYW1lIHN0YXRlXG4gICAgICovXG5cbiAgICBwdWJsaWMgY29uc3RydWN0b3IocHJpdmF0ZSBwdXp6bGU6IFB1enpsZSkge31cbiAgICBcbiAgICAvKipcbiAgICAgKiBVcGRhdGVzIHRoZSBnYW1lIHN0YXRlIG9mIHRoZSBjbGllbnQgYnkgY2hhbmdpbmcgdGhlIHN0YXR1c1xuICAgICAqIG9mIHRoZSBzcGFjZSBhdCBpbmRleCB0byBuZXdTdGF0dXMuIElmIHRoZSBtb3ZlIGlzIGludmFsaWQsXG4gICAgICogdGhlbiB0aGUgZXJyb3IgbWVzc2FnZSB0aHJvd24gYnkgcHV6emxlIHdpbGwgYmUgc2hvd25cbiAgICAgKiBpbiB0aGUgY29uc29sZSAobWF5IHdhbnQgdG8gY2hhbmdlIHRoaXMgbGF0ZXIgc2luY2Ugd2Ugd2FudCB0byBzaG93XG4gICAgICogdGhlIHVzZXIgdGhlIGVycm9yLCBub3Qgc3VyZSBpZiB0aGlzIGRvZXMgdGhpcyBjb3JyZWN0bHkpXG4gICAgICogXG4gICAgICogQHBhcmFtIGluZGV4IFRoZSBpbmRleCBvZiB0aGUgc3BhY2Ugd2Ugd2FudCB0byBjaGFuZ2UgdGhlIHN0YXR1cyBvZlxuICAgICAqIEBwYXJhbSBuZXdTdGF0dXMgVGhlIHN0YXR1cyB3ZSB3YW50IHRvIGdpdmUgdG8gdGhpcyBzcGFjZVxuICAgICAqIEByZXR1cm5zIG5vdGhpbmcgb3IgYSBzdHJpbmcgc3RhdHVzIG1ldGhvZFxuICAgICAqL1xuICAgIHB1YmxpYyBtYWtlTW92ZShpbmRleDogbnVtYmVyLCBuZXdTdGF0dXM6IFNwYWNlU3RhdHVzKTogdm9pZCB8IHN0cmluZyB7XG4gICAgICAgIHRyeSB7dGhpcy5wdXp6bGUgPSB0aGlzLnB1enpsZS5jaGFuZ2VTdGF0dXMoaW5kZXgsIG5ld1N0YXR1cyk7fSBcbiAgICAgICAgY2F0Y2goZXJyb3IpIHtyZXR1cm4gXCJUaGlzIG1vdmUgaXMgbm90IHZhbGlkXCI7fVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiB0aGUgcHV6emxlIGlzIHNvbHZlZCwgYW5kIHJldHVybnMgYSBCb29sZWFuXG4gICAgICogdG8gaW5kaWNhdGUgd2hldGhlciBpdCBpcyBzb2x2ZWQgb3Igbm90XG4gICAgICogXG4gICAgICogQHJldHVybnMgVHJ1ZSBpZiB0aGUgcHV6emxlIGlzIHNvbHZlZCwgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgICovXG4gICAgcHVibGljIGlzU29sdmVkKCk6IGJvb2xlYW4ge3JldHVybiB0aGlzLnB1enpsZS5pc1NvbHZlZDt9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSByZWdpb24gYXNzb2NpYXRlZCB3aXRoIHRoZSBpbmRleFxuICAgICAqIFxuICAgICAqIEBwYXJhbSBpbmRleCBUaGUgaW5kZXggd2Ugd2FudCB0byBnZXQgdGhlIGNvbHVtbiBvZlxuICAgICAqIEByZXR1cm5zIHRoZSByZWdpb24gYXNzb2NpYXRlZCB3aXRoIHRoZSBpbmRleFxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRSZWdpb24oaW5kZXg6IG51bWJlcik6IG51bWJlciB7cmV0dXJuIHRoaXMucHV6emxlLmdldFJlZ2lvbihpbmRleCk7fVxuXG4gICAgLyoqXG4gICAgICogQHJldHVybnMgdGhlIHRvU3RyaW5nIG9mIHRoZSBDbGllbnQncyBjdXJyZW50IHB1enpsZVxuICAgICAqL1xuICAgIHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge3JldHVybiB0aGlzLnB1enpsZS50b1N0cmluZygpO31cbn1cblxuLyoqXG4gKiBSZXR1cm5zIGFuIGluc3RhbmNlIG9mIENsaWVudCB3aXRoIGEgYmxhbmsgcHV6emxlXG4gKiBjb3JyZXNwb25kaW5nIHRvIHRoZSBmaWxlIGZpbGVuYW1lXG4gKiBcbiAqIEBwYXJhbSBwdXp6bGVTdHJpbmcgdGhlIHRvU3RyaW5nIG9mIHRoZSBwdXp6bGUgd2Ugd2FudFxuICogQHJldHVybnMgbmV3IGluc3RhbmNlIG9mIGNsaWVudCBiYXNlZCBvbiB0aGUgZmlsZW5hbWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsaWVudEZyb21QdXp6bGUocHV6emxlU3RyaW5nOiBzdHJpbmcpOiBDbGllbnQge3JldHVybiBuZXcgQ2xpZW50KHBhcnNlUHV6emxlKHB1enpsZVN0cmluZykpO31cbiIsImltcG9ydCB7UHV6emxlLCBTcGFjZVN0YXR1c30gZnJvbSAnLi9QdXp6bGUnO1xuaW1wb3J0IHtQYXJzZXIsIFBhcnNlVHJlZSwgY29tcGlsZX0gZnJvbSAncGFyc2VybGliJztcblxuLy8gdGhlIGdyYW1tYXJcbmNvbnN0IGdyYW1tYXIgPSBgXG5Ac2tpcCB3aGl0ZXNwYWNlIHtcbiAgICBwdXp6bGUgOjo9IHNpemUgcmVnaW9uKztcbiAgICBzaXplIDo6PSBudW1iZXIgJ3gnIG51bWJlciAnXFxcXG4nO1xuICAgIHJlZ2lvbiA6Oj0gY2VsbCogJ3wnIGNlbGwrICdcXFxcbic7XG59XG5udW1iZXIgOjo9IFsxLTldWzAtOV0qO1xuY2VsbCA6Oj0gbnVtYmVyICcsJyBudW1iZXI7XG53aGl0ZXNwYWNlIDo6PSBbIFxcXFx0XFxcXHJcXFxcLl0rO1xuYDtcblxuLy8gdGhlIG5vbnRlcm1pbmFscyBvZiB0aGUgZ3JhbW1hclxuZW51bSBQdXp6bGVHcmFtbWFyIHtTaXplLCBQdXp6bGUsIENlbGwsIFRleHQsIE51bWJlciwgV2hpdGVzcGFjZSwgUmVnaW9ufVxuLy8gY29tcGlsZSB0aGUgZ3JhbW1hciBpbnRvIGEgcGFyc2VyXG5jb25zdCBwYXJzZXI6IFBhcnNlcjxQdXp6bGVHcmFtbWFyPiA9IGNvbXBpbGUoZ3JhbW1hciwgUHV6emxlR3JhbW1hciwgUHV6emxlR3JhbW1hci5QdXp6bGUpO1xuXG4vKipcbiAqIFBhcnNlIGEgc3RyaW5nIGludG8gYSBQdXp6bGUuXG4gKiBcbiAqIEBwYXJhbSBwdXp6bGVTdHJpbmcgc3RyaW5nIHRvIHBhcnNlXG4gKiBAcmV0dXJucyBQdXp6bGUgcGFyc2VkIGZyb20gdGhlIHN0cmluZ1xuICogQHRocm93cyBVbmFibGVUb1BhcnNlRXhjZXB0aW9uIGlmIHRoZSBzdHJpbmcgZG9lc24ndCBtYXRjaCB0aGUgUHV6emxlIGdyYW1tYXJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlUHV6emxlKHB1enpsZVN0cmluZzogc3RyaW5nKTogUHV6emxlIHtcbiAgICAvLyBwYXJzZSB0aGUgZXhhbXBsZSBpbnRvIGEgcGFyc2UgdHJlZVxuICAgIGxldCBjbGVhbmVkUHV6emxlU3RyaW5nID0gJyc7XG4gIFxuICAgIGZvciAoY29uc3QgbGluZSBvZiBwdXp6bGVTdHJpbmcuc3BsaXQoJ1xcbicpKSB7XG4gICAgICAgIGlmIChsaW5lICYmIGxpbmVbMF0gIT09ICcjJykgY2xlYW5lZFB1enpsZVN0cmluZyA9IGNsZWFuZWRQdXp6bGVTdHJpbmcuY29uY2F0KGxpbmUsICdcXG4nKTtcbiAgICB9XG4gICAgY29uc3QgcGFyc2VUcmVlOiBQYXJzZVRyZWU8UHV6emxlR3JhbW1hcj4gPSBwYXJzZXIucGFyc2UoY2xlYW5lZFB1enpsZVN0cmluZyk7XG4gICAgcmV0dXJuIG1ha2VBYnN0cmFjdFN5bnRheFRyZWUocGFyc2VUcmVlKTtcbn1cbiAgICBcbi8qKlxuICogQ29udmVydCBhIHBhcnNlIHRyZWUgaW50byBhbiBhYnN0cmFjdCBzeW50YXggdHJlZS5cbiAqIFxuICogQHBhcmFtIHBhcnNlVHJlZSBjb25zdHJ1Y3RlZCBhY2NvcmRpbmcgdG8gdGhlIGdyYW1tYXIgaW4gUHV6emxlLmdcbiAqIEByZXR1cm5zIGFic3RyYWN0IHN5bnRheCB0cmVlIGNvcnJlc3BvbmRpbmcgdG8gdGhlIHBhcnNlVHJlZVxuICovXG5mdW5jdGlvbiBtYWtlQWJzdHJhY3RTeW50YXhUcmVlKHBhcnNlVHJlZTogUGFyc2VUcmVlPFB1enpsZUdyYW1tYXI+KTogUHV6emxlIHtcbiAgICBzd2l0Y2ggKHBhcnNlVHJlZS5uYW1lKSB7XG4gICAgY2FzZSBQdXp6bGVHcmFtbWFyLlB1enpsZTogLy8gcHV6emxlIDo6PSBzaXplIHJlZ2lvbnMrO1xuICAgICAgICB7ICAgXG4gICAgICAgICAgICBjb25zdCBzaXplID0gcGFyc2VUcmVlLmNoaWxkcmVuWzBdO1xuICAgICAgICAgICAgaWYgKCFzaXplKSB0aHJvdyBuZXcgRXJyb3IoXCJDb3JydXB0IHB1enpsZSBmaWxlXCIpO1xuICAgICAgICAgICAgY29uc3QgW3B1enpsZVcsIHB1enpsZUhdID0gW3NpemUuY2hpbGRyZW5bMF0sIHNpemUuY2hpbGRyZW5bMV1dO1xuICAgICAgICAgICAgaWYgKCFwdXp6bGVXIHx8ICFwdXp6bGVIKSB0aHJvdyBuZXcgRXJyb3IoXCJDb3JydXB0IHB1enpsZSBmaWxlXCIpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb25zdCB3ID0gTnVtYmVyLnBhcnNlSW50KHB1enpsZVcudGV4dCk7XG4gICAgICAgICAgICBjb25zdCBoID0gTnVtYmVyLnBhcnNlSW50KHB1enpsZUgudGV4dCk7XG5cbiAgICAgICAgICAgIGNvbnN0IHJlZ2lvbnM6IEFycmF5PFBhcnNlVHJlZTxQdXp6bGVHcmFtbWFyPj4gPSBwYXJzZVRyZWUuY2hpbGRyZW4uc2xpY2UoMSk7XG4gICAgICAgICAgICBjb25zdCBjZWxsVG9SZWdpb246IE1hcDxudW1iZXIsIG51bWJlcj4gPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICBjb25zdCBjZWxsVG9TcGFjZVN0YXR1czogTWFwPG51bWJlciwgU3BhY2VTdGF0dXM+ID0gbmV3IE1hcCgpO1xuXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlZ2lvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZWdpb24gPSByZWdpb25zW2ldO1xuICAgICAgICAgICAgICAgIGlmICghcmVnaW9uKSB0aHJvdyBuZXcgRXJyb3IoXCJDb3JydXB0IHB1enpsZSBmaWxlXCIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNlbGxzID0gcmVnaW9uLmNoaWxkcmVuO1xuXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBjZWxsIG9mIGNlbGxzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IFtyb3csIGNvbF0gPSBjZWxsLmNoaWxkcmVuO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXJvdyB8fCAhY29sKSB0aHJvdyBuZXcgRXJyb3IoXCJDb3JydXB0IHB1enpsZSBmaWxlXCIpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpbmRleCA9IChOdW1iZXIucGFyc2VJbnQocm93LnRleHQpIC0gMSkgKiBoICsgKE51bWJlci5wYXJzZUludChjb2wudGV4dCkgLSAxKTtcblxuICAgICAgICAgICAgICAgICAgICBjZWxsVG9SZWdpb24uc2V0KGluZGV4LCBpKTtcbiAgICAgICAgICAgICAgICAgICAgY2VsbFRvU3BhY2VTdGF0dXMuc2V0KGluZGV4LCBTcGFjZVN0YXR1cy5FbXB0eSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQdXp6bGUoY2VsbFRvUmVnaW9uLCBjZWxsVG9TcGFjZVN0YXR1cywgaCk7XG4gICAgICAgIH1cblxuICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcInNob3VsZCBuZXZlciBnZXQgaGVyZVwiKTtcbiAgICB9XG59XG4iLCIvKioqIEdsb2JhbCBDb25zdGFudHMgKioqL1xuY29uc3QgUkVRVUlSRURfU1RBUlMgPSAyO1xuXG4vKioqIEVudW1zICoqKi9cbmV4cG9ydCBlbnVtIFNwYWNlU3RhdHVzIHtFbXB0eSwgRG90LCBTdGFyfVxuZXhwb3J0IGVudW0gTW9kaWZ5VmFsdWUge0luY3JlbWVudCwgRGVjcmVtZW50LCBDb25zdGFudH1cblxuZXhwb3J0IGNsYXNzIFB1enpsZSB7XG4gICAgLyoqKiBSZXByZXNlbnRhdGlvbiAqKiovXG4gICAgcHVibGljICByZWFkb25seSBpc1NvbHZlZDogYm9vbGVhbjtcbiAgICBwcml2YXRlIHJlYWRvbmx5IHJvd1RvU3RhcnM6IE1hcDxudW1iZXIsIG51bWJlcj4gPSBuZXcgTWFwPG51bWJlciwgbnVtYmVyPigpO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgY29sdW1uVG9TdGFyczogTWFwPG51bWJlciwgbnVtYmVyPiA9IG5ldyBNYXA8bnVtYmVyLCBudW1iZXI+KCk7XG4gICAgcHJpdmF0ZSByZWFkb25seSByZWdpb25Ub1N0YXJzOiBNYXA8bnVtYmVyLCBudW1iZXI+ID0gbmV3IE1hcDxudW1iZXIsIG51bWJlcj4oKTtcbiAgICBwcml2YXRlIHJlYWRvbmx5IHJlZ2lvblRvQ2VsbHM6IE1hcDxudW1iZXIsIEFycmF5PG51bWJlcj4+ID0gbmV3IE1hcDxudW1iZXIsIEFycmF5PG51bWJlcj4+KCk7XG5cbiAgICAvKipcbiAgICAgKiBBRihyb3dUb1N0YXJzLCBjb2x1bW5Ub1N0YXJzLCByZWdpb25Ub1N0YXJzLCBcbiAgICAgKiAgICByZWdpb25Ub0NlbGxzLCBpc1NvbHZlZCwgY2VsbFRvUmVnaW9uLCBcbiAgICAgKiAgICBjZWxsVG9TcGFjZVN0YXR1cykgPSAgVGhlIHB1enpsZSwgd2hlcmUgcm93VG9TdGFycyBtYXBzIGVhY2ggcm93IHRvIHRoZSBudW1iZXIgb2Ygc3RhcnMgaW4gdGhhdCByb3csIGNvbHVtblRvU3RhcnMgbWFwcyBlYWNoIGNvbHVtbiB0byB0aGUgbnVtYmVyXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgIG9mIHN0YXJzIGluIHRoYXQgY29sdW1uLCByZWdpb25Ub1N0YXJzIG1hcHMgZWFjaCByZWdpb24gdG8gdGhlIG51bWJlciBvZiBzdGFycyBpbiB0aGF0IHJlZ2lvbiwgcmVnaW9uVG9JbmRlY2VzIG1hcHMgZWFjaCByZWdpb24gdG8gdGhlIFxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRlY2VzIHRoYXQgcmVnaW9uIGVuY2xvc2VzLCBpc1NvbHZlZCBpcyB0cnVlIGlmIHRoZSBwdXp6bGUgaXMgc29sdmVkLCBmYWxzZSBvdGhlcndpc2UsIGluZGV4VG9SZWdpb24gbWFwcyBlYWNoIGluZGV4IHRvIHRoZSByZWdpb24gaXQgYmVsb25ncyB0byxcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgYW5kIGluZGV4VG9TcGFjZVN0YXR1cyBtYXBzIGVhY2ggaW5kZXggdG8gdGhhdCBzcGFjZSdzIHN0YXR1cyAoZW1wdHksIGhhcyBhIGRvdCwgaGFzIGEgc3RhcikuXG4gICAgICogXG4gICAgICogUmVwcmVzZW50YXRpb24gaW52YXJpYW50OlxuICAgICAqICAtIEV2ZXJ5IHZhbHVlIGluIHJvd1RvU3RhcnMsIGNvbFRvU3RhcnMsIGFuZCByZWdpb25Ub1N0YXJzIGlzIDw9IDIgYW5kID4gMFxuICAgICAqIFxuICAgICAqIFNhZmV0eSBmcm9tIHJlcCBleHBvc3VyZTpcbiAgICAgKiAgLSBBbGwgZmllbGRzIGFyZSBwcml2YXRlLCByZWFkb25seSwgYW5kIG5vIHJlZmVyZW5jZSB0byBhbnkgb2YgdGhlIG11dGFibGUgZmllbGRzIGlzIGdpdmVuIGJ5IGFueSBvZiB0aGUgZnVuY3Rpb25zXG4gICAgICovXG5cbiAgICBwdWJsaWMgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBjZWxsVG9SZWdpb246IE1hcDxudW1iZXIsIG51bWJlcj4sIHByaXZhdGUgcmVhZG9ubHkgY2VsbFRvU3BhY2VTdGF0dXM6IE1hcDxudW1iZXIsIFNwYWNlU3RhdHVzPiwgcHJpdmF0ZSByZWFkb25seSBwdXp6bGVTaXplOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5pc1NvbHZlZCA9IHRydWU7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMjsgaSsrKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IFtjZWxsLCBzdGF0dXNdIG9mIGNlbGxUb1NwYWNlU3RhdHVzKXtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjb25zdCByZWdpb24gPSBjZWxsVG9SZWdpb24uZ2V0KGNlbGwpO1xuICAgICAgICAgICAgICAgIGNvbnN0IFtyb3csIGNvbF0gPSB0aGlzLl9jb29yZGluYXRlcyhjZWxsKTtcblxuICAgICAgICAgICAgICAgIGlmIChyZWdpb24gPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKFwicmVnaW9uIGRvZXMgbm90IGV4aXN0XCIpO1xuICAgICAgICAgICAgICAgIGxldCBudW1Sb3dTdGFycyA9IHRoaXMucm93VG9TdGFycy5nZXQocm93KTtcbiAgICAgICAgICAgICAgICBsZXQgbnVtQ29sU3RhcnMgPSB0aGlzLmNvbHVtblRvU3RhcnMuZ2V0KGNvbCk7XG4gICAgICAgICAgICAgICAgbGV0IG51bVJlZ2lvblN0YXJzID0gdGhpcy5yZWdpb25Ub1N0YXJzLmdldChyZWdpb24pO1xuXG4gICAgICAgICAgICAgICAgaWYgKG51bVJvd1N0YXJzID09PSB1bmRlZmluZWQpIG51bVJvd1N0YXJzID0gMDtcbiAgICAgICAgICAgICAgICBpZiAobnVtQ29sU3RhcnMgPT09IHVuZGVmaW5lZCkgbnVtQ29sU3RhcnMgPSAwO1xuICAgICAgICAgICAgICAgIGlmIChudW1SZWdpb25TdGFycyA9PT0gdW5kZWZpbmVkKSBudW1SZWdpb25TdGFycyA9IDA7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXR1cyA9PT0gU3BhY2VTdGF0dXMuU3Rhcikge1xuICAgICAgICAgICAgICAgICAgICBudW1Sb3dTdGFycyArPSAxO1xuICAgICAgICAgICAgICAgICAgICBudW1Db2xTdGFycyArPSAxO1xuICAgICAgICAgICAgICAgICAgICBudW1SZWdpb25TdGFycyArPSAxO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucm93VG9TdGFycy5zZXQocm93LCBudW1Sb3dTdGFycyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29sdW1uVG9TdGFycy5zZXQoY29sLCBudW1Db2xTdGFycyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVnaW9uVG9TdGFycy5zZXQocmVnaW9uLCBudW1SZWdpb25TdGFycyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge2lmIChudW1Sb3dTdGFycyA8IFJFUVVJUkVEX1NUQVJTIHx8IG51bUNvbFN0YXJzIDwgUkVRVUlSRURfU1RBUlMgfHwgbnVtUmVnaW9uU3RhcnMgPCBSRVFVSVJFRF9TVEFSUykge3RoaXMuaXNTb2x2ZWQgPSBmYWxzZTsgYnJlYWs7fX1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcblxuICAgICAgICBmb3IgKGNvbnN0IFtjZWxsLCByZWdpb25dIG9mIHRoaXMuY2VsbFRvUmVnaW9uKXtcbiAgICAgICAgICAgIGNvbnN0IGNlbGxzRW5jbG9zZWRCeVJlZ2lvbiA9IHRoaXMucmVnaW9uVG9DZWxscy5nZXQocmVnaW9uKTtcbiAgICAgICAgICAgIGlmICghY2VsbHNFbmNsb3NlZEJ5UmVnaW9uKSB0aGlzLnJlZ2lvblRvQ2VsbHMuc2V0KHJlZ2lvbiwgW2NlbGxdKTtcbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNlbGxTcGFjZVN0YXR1cyA9IGNlbGxUb1NwYWNlU3RhdHVzLmdldChjZWxsKTtcbiAgICAgICAgICAgICAgICBpZiAoY2VsbFNwYWNlU3RhdHVzID09PSBTcGFjZVN0YXR1cy5TdGFyKSBjZWxsc0VuY2xvc2VkQnlSZWdpb24udW5zaGlmdChjZWxsKTtcbiAgICAgICAgICAgICAgICBlbHNlIGNlbGxzRW5jbG9zZWRCeVJlZ2lvbi5wdXNoKGNlbGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2hlY2tSZXAoKTtcbiAgICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrcyB0byBlbnN1cmUgdGhlIFJJIGhhc24ndCBiZWVuIHZpb2xhdGVkXG4gICAgICogXG4gICAgICogQHRocm93cyBFcnJvciBpZiB0aGUgUkkgaGFzIGJlZW4gdmlvbGF0ZWRcbiAgICAgKi9cbiAgICBwcml2YXRlIGNoZWNrUmVwKCk6IHZvaWR7XG4gICAgICAgIGZvciAoY29uc3QgW3JlZ2lvbiwgcmVnaW9uU3RhcnNdIG9mIHRoaXMucmVnaW9uVG9TdGFycyl7XG4gICAgICAgICAgICBjb25zdCByb3dTdGFycyA9IHRoaXMucm93VG9TdGFycy5nZXQocmVnaW9uKTtcbiAgICAgICAgICAgIGNvbnN0IGNvbFN0YXJzID0gdGhpcy5jb2x1bW5Ub1N0YXJzLmdldChyZWdpb24pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAocm93U3RhcnMgPT09IHVuZGVmaW5lZCB8fCByZWdpb25TdGFycyA9PT0gdW5kZWZpbmVkIHx8IGNvbFN0YXJzID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcihcIlNvbWV0aGluZyBoZXJlIGlzIHdyb25nXCIpO1xuICAgICAgICAgICAgaWYgKHJvd1N0YXJzID4gUkVRVUlSRURfU1RBUlMgfHwgcm93U3RhcnMgPCAwKSB0aHJvdyBFcnJvcihcIlRoZSBSSSBoYXMgYmVlbiB2aW9sYXRlZDogZXhwZWN0ZWQgcm93U3RhcnMgPD0gMlwiKTtcbiAgICAgICAgICAgIGlmIChjb2xTdGFycyA+IFJFUVVJUkVEX1NUQVJTIHx8IGNvbFN0YXJzIDwgMCkgdGhyb3cgRXJyb3IoXCJUaGUgUkkgaGFzIGJlZW4gdmlvbGF0ZWQ6IGV4cGVjdGVkIGNvbFN0YXJzIDw9IDJcIik7XG4gICAgICAgICAgICBpZiAocmVnaW9uU3RhcnMgPiBSRVFVSVJFRF9TVEFSUyB8fCByZWdpb25TdGFycyA8IDApIHRocm93IEVycm9yKFwiVGhlIFJJIGhhcyBiZWVuIHZpb2xhdGVkOiBleHBlY3RlZCByZWdpb25TdGFycyA8PSAyXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTW9kaWZ5J3MgdGhlIHN0YXIgbWFwcyB0aGF0IHRoaXMgaW5kZXggYmVsb25ncyB0b1xuICAgICAqIFxuICAgICAqIEBwYXJhbSBjZWxsIFRoZSAxRCBjZWxsIGluZGV4IG9mIHRoZSBib2FyZCBzcGFjZSB3ZSB3YW50IHRvIHVzZSB0byBtb2RpZnkgdGhlIHN0YXJzIG1hcFxuICAgICAqIEBwYXJhbSBpbmNyZW1lbnQgdHJ1ZSBpZiB3ZSBhcmUgaW5jcmVtZW50aW5nIGVhY2ggbWFwLCBmYWxzZSBvdGhlcndpc2VcbiAgICAgKi9cbiAgICBwcml2YXRlIG1vZGlmeVN0YXJzTWFwcyhjZWxsOiBudW1iZXIsIGluY3JlbWVudDogTW9kaWZ5VmFsdWUpOiB2b2lke1xuICAgICAgICBsZXQgdmFsdWVDaGFuZ2UgPSAwO1xuICAgICAgICBpZiAoaW5jcmVtZW50ID09PSBNb2RpZnlWYWx1ZS5JbmNyZW1lbnQpIHZhbHVlQ2hhbmdlID0gMTtcbiAgICAgICAgZWxzZSBpZiAoaW5jcmVtZW50ID09PSBNb2RpZnlWYWx1ZS5EZWNyZW1lbnQpIHZhbHVlQ2hhbmdlID0gLTE7XG5cbiAgICAgICAgY29uc3QgcmVnaW9uID0gdGhpcy5jZWxsVG9SZWdpb24uZ2V0KGNlbGwpO1xuICAgICAgICBjb25zdCBbcm93LCBjb2xdID0gdGhpcy5fY29vcmRpbmF0ZXMoY2VsbCk7XG5cbiAgICAgICAgaWYgKHJlZ2lvbiA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoXCJyZWdpb24gZG9lcyBub3QgZXhpc3RcIik7XG4gICAgICAgIGNvbnN0IG51bVJvd1N0YXJzID0gdGhpcy5yb3dUb1N0YXJzLmdldChyb3cpO1xuICAgICAgICBjb25zdCBudW1Db2xTdGFycyA9IHRoaXMuY29sdW1uVG9TdGFycy5nZXQoY29sKTtcbiAgICAgICAgY29uc3QgbnVtUmVnaW9uU3RhcnMgPSB0aGlzLnJlZ2lvblRvU3RhcnMuZ2V0KHJlZ2lvbik7XG5cbiAgICAgICAgaWYgKG51bVJvd1N0YXJzICA9PT0gdW5kZWZpbmVkIHx8IG51bUNvbFN0YXJzID09PSB1bmRlZmluZWQgfHwgbnVtUmVnaW9uU3RhcnMgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKFwic29tZXRoaW5nIHdlbnQgd3Jvbmcgd2l0aCBzdGFyIGNvdW50XCIpO1xuICAgICAgICB0aGlzLnJvd1RvU3RhcnMuc2V0KHJvdywgbnVtUm93U3RhcnMgKyB2YWx1ZUNoYW5nZSk7XG4gICAgICAgIHRoaXMuY29sdW1uVG9TdGFycy5zZXQoY29sLCBudW1Db2xTdGFycyArIHZhbHVlQ2hhbmdlKTtcbiAgICAgICAgdGhpcy5yZWdpb25Ub1N0YXJzLnNldChyZWdpb24sIG51bVJlZ2lvblN0YXJzICsgdmFsdWVDaGFuZ2UpOyBcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSByZWdpb24gYXNzb2NpYXRlZCB3aXRoIHRoZSBpbmRleFxuICAgICAqIFxuICAgICAqIEBwYXJhbSBjZWxsIFRoZSAxRCBjZWxsIGluZGV4IHdlIHdhbnQgdG8gZ2V0IHRoZSBjb2x1bW4gb2ZcbiAgICAgKiBAcmV0dXJucyB0aGUgcmVnaW9uIGFzc29jaWF0ZWQgd2l0aCB0aGUgaW5kZXhcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0UmVnaW9uKGNlbGw6IG51bWJlcik6IG51bWJlcntcbiAgICAgICAgY29uc3QgcmVnaW9uID0gdGhpcy5jZWxsVG9SZWdpb24uZ2V0KGNlbGwpO1xuXG4gICAgICAgIGlmIChyZWdpb24gPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKFwicmVnaW9uIGRvZXMgbm90IGV4aXN0XCIpO1xuICAgICAgICByZXR1cm4gcmVnaW9uO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoYW5nZXMgdGhlIFNwYWNlU3RhdHVzIG9mIHRoZSBzcGFjZSBjb3JyZXNwb25kaW5nIHRvIFxuICAgICAqIGNlbGwgdG8gc3RhdHVzIGJ5IHJldHVybmluZyBhIG5ldyBwdXp6bGUgd2l0aCB0aGlzIGNoYW5nZVxuICAgICAqIFxuICAgICAqIEBwYXJhbSBjZWxsIFRoZSAxRCBjZWxsIGluZGV4IGF0IHdoaWNoIHdlIHdhbnQgdG8gbW9kaWZ5J3Mgc3RhdHVzXG4gICAgICogQHBhcmFtIG5ld1N0YXR1cyBUaGUgbmV3U3RhdHVzIHdlIHdhbnQgdG8gYXNzaWduIHRvIHRoaXMgYm9hcmQgc3BhY2VcbiAgICAgKiBAcmV0dXJucyBBIG5ldyBwdXp6bGUgYmFzZWQgb24gdGhpcyBwdXp6bGUsIHdpdGggdGhlIG9ubHlcbiAgICAgKiAgICAgICAgICBjaGFuZ2UgYmVpbmcgYSB0aGUgYm9hcmQgc3BhY2UncyBTcGFjZVN0YXR1c1xuICAgICAqICAgICAgICAgIGNvcnJlc3BvbmRpbmcgdG8gaW5kZXggY2hhbmdpbmcgdG8gc3RhdHVzXG4gICAgICogQHRocm93cyBFcnJvciBpZiBjaGFuZ2luZyB0aGlzIGJvYXJkIHNwYWNlJ3MgU3BhY2VTdGF0dXMgdG8gc3RhciwgYW5kIFxuICAgICAqICAgICAgICAgZG9pbmcgdGhpcyB3b3VsZCBjb25mbGljdCB3aXRoIHRoZSBydWxlIG9mIG9ubHkgaGF2aW5nIHR3byBcbiAgICAgKiAgICAgICAgIHN0YXJzIGluIGVhY2ggY29sdW1uLCByb3csIG9yIHJlZ2lvblxuICAgICAqL1xuICAgIHB1YmxpYyBjaGFuZ2VTdGF0dXMoY2VsbDogbnVtYmVyLCBuZXdTdGF0dXM6IFNwYWNlU3RhdHVzKTogUHV6emxle1xuICAgICAgICBsZXQgbW9kaWZ5VmFsdWU7IGxldCByZXZlcnRWYWx1ZTtcbiAgICAgICAgY29uc3QgY3VyclN0YXR1cyA9IHRoaXMuY2VsbFRvU3BhY2VTdGF0dXMuZ2V0KGNlbGwpO1xuICAgICAgICBzd2l0Y2ggKGN1cnJTdGF0dXMpIHtcbiAgICAgICAgICAgIGNhc2UgU3BhY2VTdGF0dXMuRG90IHx8IFNwYWNlU3RhdHVzLkVtcHR5OiB7XG4gICAgICAgICAgICAgICAgaWYgKG5ld1N0YXR1cyA9PT0gU3BhY2VTdGF0dXMuU3RhcikgW21vZGlmeVZhbHVlLCByZXZlcnRWYWx1ZV0gPSBbTW9kaWZ5VmFsdWUuSW5jcmVtZW50LCBNb2RpZnlWYWx1ZS5EZWNyZW1lbnRdOyBcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgU3BhY2VTdGF0dXMuU3Rhcjoge1xuICAgICAgICAgICAgICAgIGlmIChuZXdTdGF0dXMgPT09IFNwYWNlU3RhdHVzLkRvdCB8fCBuZXdTdGF0dXMgPT09IFNwYWNlU3RhdHVzLkVtcHR5KSBbbW9kaWZ5VmFsdWUsIHJldmVydFZhbHVlXSA9IFtNb2RpZnlWYWx1ZS5EZWNyZW1lbnQsIE1vZGlmeVZhbHVlLkluY3JlbWVudF07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWZhdWx0OiBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKG1vZGlmeVZhbHVlICE9PSB1bmRlZmluZWQgJiYgcmV2ZXJ0VmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5tb2RpZnlTdGFyc01hcHMoY2VsbCwgbW9kaWZ5VmFsdWUpO1xuXG4gICAgICAgICAgICB0cnkge3RoaXMuY2hlY2tSZXAoKTt9XG4gICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGlmeVN0YXJzTWFwcyhjZWxsLCByZXZlcnRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgdGhyb3cgRXJyb3IoXCJNYWtpbmcgdGhpcyBtb2RpZmljYXRpb24gd291bGQgbGVhZCB0byBhbiBpbnZhbGlkIGJvYXJkXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5tb2RpZnlTdGFyc01hcHMoY2VsbCwgcmV2ZXJ0VmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbmV3Q2VsbFRvUmVnaW9uID0gbmV3IE1hcCh0aGlzLmNlbGxUb1JlZ2lvbik7XG4gICAgICAgIGNvbnN0IG5ld0NlbGxUb1NwYWNlU3RhdHVzID0gbmV3IE1hcCh0aGlzLmNlbGxUb1NwYWNlU3RhdHVzKTtcblxuICAgICAgICBuZXdDZWxsVG9TcGFjZVN0YXR1cy5zZXQoY2VsbCwgbmV3U3RhdHVzKTtcbiAgICAgICAgcmV0dXJuIG5ldyBQdXp6bGUobmV3Q2VsbFRvUmVnaW9uLCBuZXdDZWxsVG9TcGFjZVN0YXR1cywgdGhpcy5wdXp6bGVTaXplKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHaXZlcyB0aGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBwdXp6bGUsXG4gICAgICogdGhlIHN0cmluZyByZXByZXNlbnRhdGlvbiBkZXNjcmliZWQgaW4gdGhlIHJldHVybnMgc2VjdGlvblxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBwdXp6bGUsXG4gICAgICogICAgICAgICAgd2l0aCB0aGUgc2FtZSBmb3JtYXQgYXMgdGhlIGtkLTEtMS0xLnN0YXJiIGZpbGVcbiAgICAgKiAgICAgICAgICBhbmQgdGhlIGtkLTYtMzEtNi5zdGFyYiBmaWxlXG4gICAgICovXG4gICAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgICAgIGxldCByZXR1cm5TdHJpbmcgPSBgJHt0aGlzLnB1enpsZVNpemV9eCR7dGhpcy5wdXp6bGVTaXplfVxcbmA7XG4gICAgICAgIGZvciAobGV0IHJlZ2lvbiA9IDA7IHJlZ2lvbiA8IHRoaXMucHV6emxlU2l6ZTsgcmVnaW9uKyspe1xuICAgICAgICAgICAgbGV0IHBpcGVJbnNlcnRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgY29uc3QgY2VsbHNFbmNsb3NlZEJ5UmVnaW9uID0gdGhpcy5yZWdpb25Ub0NlbGxzLmdldChyZWdpb24pO1xuXG4gICAgICAgICAgICBpZiAoIWNlbGxzRW5jbG9zZWRCeVJlZ2lvbikgY29udGludWU7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNlbGwgb2YgY2VsbHNFbmNsb3NlZEJ5UmVnaW9uKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2VsbFNwYWNlU3RhdHVzID0gdGhpcy5jZWxsVG9TcGFjZVN0YXR1cy5nZXQoY2VsbCk7XG4gICAgICAgICAgICAgICAgbGV0IFtyb3csIGNvbF0gPSB0aGlzLl9jb29yZGluYXRlcyhjZWxsKTtcbiAgICAgICAgICAgICAgICByb3cgKz0gMTsgY29sICs9IDE7XG5cbiAgICAgICAgICAgICAgICBpZiAoY2VsbFNwYWNlU3RhdHVzICE9PSBTcGFjZVN0YXR1cy5TdGFyICYmICFwaXBlSW5zZXJ0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuU3RyaW5nICs9IGB8IGA7XG4gICAgICAgICAgICAgICAgICAgIHBpcGVJbnNlcnRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVyblN0cmluZyArPSBgJHtyb3d9LCR7Y29sfSBgO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuU3RyaW5nICs9ICdcXG4nO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXR1cm5TdHJpbmc7XG4gICAgfVxuXG4gICAgLyoqKiBIZWxwZXIgTWV0aG9kcyAqKiovXG4gICAgLyoqXG4gICAgICogUmV0cml2ZXMgdGhlIDJEIGNvb3JkaW5hdGVzIG9mIGEgY2VsbCBnaXZlbiB0aGUgMUQgaW5kZXggY29vcmRpbmF0ZSBcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gY2VsbCB0aGUgMUQgaW5kZXggbnVtYmVyIG9mIHRoZSBjZWxsXG4gICAgICogQHJldHVybnMgcm93LCBjb2wgb2YgdGhlIDJEIGNvb3JkaW5hdGVzIG9mIGEgY2VsbFxuICAgICAqL1xuICAgIHByaXZhdGUgX2Nvb3JkaW5hdGVzKGNlbGw6IG51bWJlcik6IFtyb3c6IG51bWJlciwgY29sOiBudW1iZXJdIHtcbiAgICAgICAgY29uc3Qgcm93ID0gTWF0aC5mbG9vcihjZWxsIC8gdGhpcy5wdXp6bGVTaXplKTtcbiAgICAgICAgY29uc3QgY29sID0gY2VsbCAlIHRoaXMucHV6emxlU2l6ZTtcblxuICAgICAgICByZXR1cm4gW3JvdywgY29sXTtcbiAgICB9XG59IiwiaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHsgU3BhY2VTdGF0dXMgfSBmcm9tICcuL1B1enpsZSc7XG5pbXBvcnQgeyBjbGllbnRGcm9tUHV6emxlLCBDbGllbnQgfSBmcm9tICcuL0NsaWVudCc7XG5cbi8qKiogR2xvYmFsIENvbnN0YW50cyAqKiovXG5jb25zdCBQVVpaTEVfU0laRSA9IDEwO1xubGV0IFNUQVRFUyA9IG5ldyBBcnJheShQVVpaTEVfU0laRSAqKiAyKS5maWxsKFNwYWNlU3RhdHVzLkVtcHR5KTtcbmNvbnN0IENBTlZBUzogSFRNTENhbnZhc0VsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzJykgYXMgSFRNTENhbnZhc0VsZW1lbnQgPz8gYXNzZXJ0LmZhaWwoJ21pc3NpbmcgZHJhd2luZyBjYW52YXMnKTtcbmNvbnN0IFBVWlpMRV9OQU1FOiBIVE1MU2VsZWN0RWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwdXp6bGVOYW1lJykgYXMgSFRNTFNlbGVjdEVsZW1lbnQgPz8gYXNzZXJ0LmZhaWwoJ21pc3NpbmcgZHJhd2luZyBjYW52YXMnKTtcbmNvbnN0IE1FU1NBR0U6IEhUTUxEaXZFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21lc3NhZ2Utc2VjdGlvbicpIGFzIEhUTUxEaXZFbGVtZW50ID8/IGFzc2VydC5mYWlsKCdtaXNzaW5nIG1lc3NhZ2UgY2FudmFzJyk7XG5jb25zdCBSVUxFUzogSFRNTERpdkVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncnVsZXMnKSBhcyBIVE1MRGl2RWxlbWVudCA/PyBhc3NlcnQuZmFpbCgnbWlzc2luZyBtZXNzYWdlIGNhbnZhcycpO1xuY29uc3QgUlVMRVNfQlVUVE9OOiBIVE1MQ2FudmFzRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidXR0b24tbmV3LXB1enpsZScpIGFzIEhUTUxDYW52YXNFbGVtZW50ID8/IGFzc2VydC5mYWlsKCdtaXNzaW5nIGJ1dHRvbiBjYW52YXMnKTtcbmNvbnN0IENIRUNLX0NBTlZBU19CVVRUT046IEhUTUxDYW52YXNFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J1dHRvbi1jaGVjay1wdXp6bGUnKSBhcyBIVE1MQ2FudmFzRWxlbWVudCA/PyBhc3NlcnQuZmFpbCgnbWlzc2luZyBidXR0b24gY2FudmFzJyk7XG5cbmNvbnN0IENPTE9SUyA9IFsnIzQ3REU5QScsICcjNTBCQkZBJywgJyNGQUQyNTgnLCAnI0ZGRkZGRicsICcjRkY4NjUyJywgJyNFMERGODAnLCAnI0E3ODBFMCcsICcjRjY5QkZBJywgJyNFNUU1RTUnLCAnIzVCRjVEQiddO1xuXG5jb25zdCBDT05URVhUID0gQ0FOVkFTLmdldENvbnRleHQoJzJkJyk7XG5sZXQgQ0xJRU5UOiBDbGllbnQgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5hc3NlcnQoQ09OVEVYVCwgJ3VuYWJsZSB0byBnZXQgY2FudmFzIGRyYXdpbmcgY29udGV4dCcpO1xuXG5jb25zdCBXSURUSCA9IENPTlRFWFQuY2FudmFzLmNsaWVudEhlaWdodDtcbmNvbnN0IEhFSUdIVCA9IENPTlRFWFQuY2FudmFzLmNsaWVudEhlaWdodDtcblxuUFVaWkxFX05BTUUuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgYXN5bmMgKCkgPT4ge2F3YWl0IF91cGRhdGVQdXp6bGVOYW1lKCk7IG5ld1B1enpsZSgpO30pO1xuUlVMRVMuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtSVUxFUy5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7fSk7XG5cbi8vIHdoZW4gdGhlIHVzZXIgY2xpY2tzIG9uIHRoZSBkcmF3aW5nIGNhbnZhcy4uLlxuQ0FOVkFTLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiB7bWFrZU1vdmUoZXZlbnQub2Zmc2V0WCwgZXZlbnQub2Zmc2V0WSk7fSk7XG5cbi8vIHdoZW4gdGhlIHVzZXIgY2xpY2tzIG9uIHRoZSByZXF1ZXN0IG5ldyBwdXp6bGUgYnV0dG9uLi4uXG5SVUxFU19CVVRUT04uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgUlVMRVMuc3R5bGUuZGlzcGxheSA9IFwiZmxleFwiO1xuICAgIFJVTEVTLnN0eWxlLmxlZnQgPSBcImF1dG9cIjtcbiAgICBSVUxFUy5zdHlsZS5ib3R0b20gPSBcImF1dG9cIjtcbiAgICBSVUxFUy5zdHlsZS5oZWlnaHQgPSBcIjMwMHB4XCI7XG4gICAgUlVMRVMuc3R5bGUud2lkdGggPSBcIjcwMHB4XCI7XG4gICAgUlVMRVMuc3R5bGUuYmFja2dyb3VuZCA9IFwiI2ZmZlwiO1xuICAgIFJVTEVTLnN0eWxlLmNvbG9yID0gXCIjMjIyMDIxXCI7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtNRVNTQUdFLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjt9LCA1MDAwKTtcbn0pO1xuXG4vLyBjaGVja2luZyBwdXp6bGUgYnV0dG9uXG5DSEVDS19DQU5WQVNfQlVUVE9OLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgIGFzc2VydChDTElFTlQsICdubyBwdXp6bGUgc2VsZWN0ZWQnKTtcbiAgICBpZiAoQ0xJRU5ULmlzU29sdmVkKCkpIHtcbiAgICAgICAgTUVTU0FHRS5pbm5lckhUTUwgPSBcIllvdSB3b24hXCI7XG4gICAgfVxuICAgIGVsc2UgTUVTU0FHRS5pbm5lckhUTUwgPSAnPHAgY2xhc3M9XCJtYXJnaW4tMFwiPllvdXIgcHV6emxlIGlzIG5vdCBmdWxseSBzb2x2ZWQgeWV0IC4uLjwvcD48cCBjbGFzcz1cIm1hcmdpbi0wXCI+Q2h1ZyBBd2F5ITwvcD4nO1xuICAgIE1FU1NBR0Uuc3R5bGUuZGlzcGxheSA9IFwiZmxleFwiOyBcbiAgICBNRVNTQUdFLnN0eWxlLmxlZnQgPSBcImF1dG9cIjtcbiAgICBNRVNTQUdFLnN0eWxlLmJvdHRvbSA9IFwiYXV0b1wiO1xuICAgIE1FU1NBR0Uuc3R5bGUuaGVpZ2h0ID0gXCIxMDBweFwiO1xuICAgIE1FU1NBR0Uuc3R5bGUud2lkdGggPSBcIjQwMHB4XCI7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtNRVNTQUdFLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjt9LCA1MDAwKTtcbn0pO1xuXG4vKipcbiAqIE1ha2VzIGEgbW92ZSBieSBkcmF3aW5nIG5vdGhpbmcgYSBkb3Qgb3IgYSBzdGFyIGJhc2VkIG9uIHRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSBjbGlja2VkIGNlbGxcbiAqICBcbiAqIEBwYXJhbSB4IHBvc2l0aW9uIG9mIHRoZSBjZWxsIGluIHRoZSBjYW52YXNcbiAqIEBwYXJhbSB5IHBvc2l0aW9uIG9mIHRoZSBjZWxsIGluIHRoZSBjYW52YXNcbiAqL1xuZnVuY3Rpb24gbWFrZU1vdmUoeDogbnVtYmVyLCB5OiBudW1iZXIpOiB2b2lkIHtcbiAgICBsZXQgdGV4dDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIGxldCBuZXdTdGF0dXM6IFNwYWNlU3RhdHVzIHwgdW5kZWZpbmVkOyBcblxuICAgIGNvbnN0IGNlbGw6IG51bWJlciA9IF9jZWxsKHgsIHkpO1xuICAgIGNvbnN0IFtpLCBqXSA9IFsoY2VsbCAlIFBVWlpMRV9TSVpFKSAqIChXSURUSCAvIFBVWlpMRV9TSVpFKSwgTWF0aC5mbG9vcihjZWxsIC8gUFVaWkxFX1NJWkUpICogKEhFSUdIVCAvIFBVWlpMRV9TSVpFKV07IFxuICAgIGNvbnN0IFt3LCBoXSA9IFtXSURUSCAvIFBVWlpMRV9TSVpFLCBIRUlHSFQgLyBQVVpaTEVfU0laRV07XG5cbiAgICBhc3NlcnQoQ0xJRU5UKTtcbiAgICBhc3NlcnQoQ09OVEVYVCwgJ3VuYWJsZSB0byBnZXQgY2FudmFzIGRyYXdpbmcgY29udGV4dCcpO1xuXG4gICAgc3dpdGNoIChTVEFURVNbY2VsbF0pIHtcbiAgICAgICAgY2FzZSBTcGFjZVN0YXR1cy5FbXB0eToge1xuICAgICAgICAgICAgbmV3U3RhdHVzID0gU3BhY2VTdGF0dXMuRG90OyBcbiAgICAgICAgICAgIHRleHQgPSAn4pqrJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgU3BhY2VTdGF0dXMuRG90OiB7XG4gICAgICAgICAgICBuZXdTdGF0dXMgPSBTcGFjZVN0YXR1cy5TdGFyOyBcbiAgICAgICAgICAgIHRleHQgPSAn8J+Mnyc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlIFNwYWNlU3RhdHVzLlN0YXI6IG5ld1N0YXR1cyA9IFNwYWNlU3RhdHVzLkVtcHR5OyBicmVhaztcbiAgICAgICAgZGVmYXVsdDogYnJlYWs7XG4gICAgfVxuXG4gICAgY29uc3QgcmVnaW9uID0gQ0xJRU5ULmdldFJlZ2lvbihjZWxsKTtcbiAgICBjb25zdCBjb2xvciA9IENPTE9SU1tyZWdpb25dO1xuXG4gICAgaWYgKG5ld1N0YXR1cyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBDTElFTlQubWFrZU1vdmUoY2VsbCwgbmV3U3RhdHVzKTtcbiAgICAgICAgaWYgKG1lc3NhZ2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgTUVTU0FHRS5pbm5lckhUTUwgPSBtZXNzYWdlOyBcbiAgICAgICAgICAgIE1FU1NBR0Uuc3R5bGUuZGlzcGxheSA9IFwiZmxleFwiOyBcbiAgICAgICAgICAgIE1FU1NBR0Uuc3R5bGUubGVmdCA9IFwiMTBweFwiO1xuICAgICAgICAgICAgTUVTU0FHRS5zdHlsZS5ib3R0b20gPSBcIjEwcHhcIjtcbiAgICAgICAgICAgIE1FU1NBR0Uuc3R5bGUuaGVpZ2h0ID0gXCI2MHB4XCI7XG4gICAgICAgICAgICBNRVNTQUdFLnN0eWxlLndpZHRoID0gXCIzMDBweFwiO1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtNRVNTQUdFLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjt9LCA1MDAwKTsgXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgU1RBVEVTW2NlbGxdID0gbmV3U3RhdHVzO1xuICAgIH1cblxuICAgIENPTlRFWFQuY2xlYXJSZWN0KGksIGosIHcsIGgpO1xuICAgIGlmIChjb2xvciAhPT0gdW5kZWZpbmVkKSBDT05URVhULmZpbGxTdHlsZSA9IGNvbG9yO1xuICAgIENPTlRFWFQuZmlsbFJlY3QoaSwgaiwgdywgaCk7XG4gICAgQ09OVEVYVC5mb250ID0gQ09OVEVYVC5mb250LnJlcGxhY2UoL1xcZCtweC8sIFwiMzBweFwiKTtcbiAgICBpZiAodGV4dCAhPT0gdW5kZWZpbmVkKSBDT05URVhULmZpbGxUZXh0KHRleHQsIGkgKyBXSURUSCAvIFBVWlpMRV9TSVpFIC8gNSwgaiArIEhFSUdIVCAvIFBVWlpMRV9TSVpFIC8gMS41LCB3KTtcbiAgICBcblxuICAgIFxuICAgIC8vIElESyBpZiB0aGlzIHNob3VsZCBiZSBoZXJlLCBnb3R0YSBrZWVwIGl0IGluIG1pbmQuIFxuICAgIENPTlRFWFQuc3Ryb2tlU3R5bGUgPSBcIiMwODFBMzNcIjtcbiAgICBDT05URVhULmxpbmVXaWR0aCA9IDAuMztcbiAgICBDT05URVhULnN0cm9rZVJlY3QoaSwgaiwgV0lEVEggLyBQVVpaTEVfU0laRSwgSEVJR0hUIC8gUFVaWkxFX1NJWkUpO1xufVxuXG4vKipcbiAqIENvbnN0cnVjdCBhIG5ldyBQdXp6bGVcbiAqL1xuZnVuY3Rpb24gbmV3UHV6emxlKCk6IHZvaWQge1xuICAgIFNUQVRFUyA9IG5ldyBBcnJheShQVVpaTEVfU0laRSAqKiAyKS5maWxsKFNwYWNlU3RhdHVzLkVtcHR5KTtcbiAgICBhc3NlcnQoQ09OVEVYVCwgJ3VuYWJsZSB0byBnZXQgY2FudmFzIGRyYXdpbmcgY29udGV4dCcpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBXSURUSDsgaSArPSBXSURUSCAvIFBVWlpMRV9TSVpFKSB7XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgSEVJR0hUOyBqKz0gSEVJR0hUIC8gUFVaWkxFX1NJWkUpe1xuICAgICAgICAgICAgY29uc3QgY2VsbDogbnVtYmVyID0gX2NlbGwoaSwgaik7XG5cbiAgICAgICAgICAgIGFzc2VydChDTElFTlQsIFwiY2xpZW50IGlzIGJhZFwiKTtcbiAgICAgICAgICAgIGNvbnN0IHJlZ2lvbjogbnVtYmVyID0gQ0xJRU5ULmdldFJlZ2lvbihjZWxsKTtcbiAgICAgICAgICAgIGNvbnN0IGNvbG9yID0gQ09MT1JTW3JlZ2lvbl07XG5cbiAgICAgICAgICAgIGFzc2VydChjb2xvciwgXCJjb2xvciBpcyBiYWRcIik7XG4gICAgICAgICAgICBDT05URVhULmZpbGxTdHlsZSA9IGNvbG9yO1xuICAgICAgICAgICAgQ09OVEVYVC5maWxsUmVjdChpLCBqLCBXSURUSCAvIFBVWlpMRV9TSVpFLCBIRUlHSFQgLyBQVVpaTEVfU0laRSk7XG5cbiAgICAgICAgICAgIENPTlRFWFQuc3Ryb2tlU3R5bGUgPSBcIiMwODFBMzNcIjtcbiAgICAgICAgICAgIENPTlRFWFQubGluZVdpZHRoID0gMC4zO1xuICAgICAgICAgICAgQ09OVEVYVC5zdHJva2VSZWN0KGksIGosIFdJRFRIIC8gUFVaWkxFX1NJWkUsIEhFSUdIVCAvIFBVWlpMRV9TSVpFKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqKiBIZWxwZXIgRnVuY3Rpb25zICoqKi9cbi8qKlxuICogUmV0cmlldmUgdGhlIDFEIGNlbGwgcHV6emxlIGluZGV4IG9mIGEgY2VsbCBmcm9tIHRoZSAyRCBjYW52YXMgY29vcmRpbmF0ZXMgb2YgdGhlIGNlbGxcbiAqIFxuICogQHBhcmFtIHggcG9zaXRpb24gb2YgdGhlIGNlbGwgaW4gdGhlIGNhbnZhc1xuICogQHBhcmFtIHkgcG9zaXRpb24gb2YgdGhlIGNlbGwgaW4gdGhlIGNhbnZhc1xuICogQHJldHVybnMgMUQgY2VsbCBpbmRleCBvZiB0aGUgY2VsbCBpbiB0aGUgcHV6emxlXG4gKi9cbmZ1bmN0aW9uIF9jZWxsKHg6IG51bWJlciwgeTogbnVtYmVyKTogbnVtYmVyIHtyZXR1cm4gTWF0aC5mbG9vcih4IC8gKFdJRFRIIC8gUFVaWkxFX1NJWkUpKSArIFBVWlpMRV9TSVpFICogTWF0aC5mbG9vcih5IC8gKEhFSUdIVCAvIFBVWlpMRV9TSVpFKSk7fVxuXG4vKipcbiAqIFVwZGF0ZXMgdGhlIHB1enpsZSBuYW1lXG4gKiBcbiAqIEBwYXJhbSBwdXp6bGVOYW1lIHRoZSBuYW1lIG9mIHRoZSBzZWxlY3RlZCBwdXp6bGVcbiAqL1xuYXN5bmMgZnVuY3Rpb24gX3VwZGF0ZVB1enpsZU5hbWUocHV6emxlTmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHB1enpsZU5hbWUgPT09IHVuZGVmaW5lZCkgcHV6emxlTmFtZSA9IFBVWlpMRV9OQU1FLm9wdGlvbnNbUFVaWkxFX05BTUUub3B0aW9ucy5zZWxlY3RlZEluZGV4XT8udmFsdWU7XG4gICAgXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgaHR0cDovL2xvY2FsaG9zdDo4Nzg5L2dldC8ke3B1enpsZU5hbWV9LnN0YXJiYCk7XG4gICAgY29uc3QgcHV6emxlU3RyaW5nID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAgIENMSUVOVCA9IGNsaWVudEZyb21QdXp6bGUocHV6emxlU3RyaW5nKTtcbn1cblxuLyoqXG4gKiBTZXQgdXAgdGhlIHBhZ2UuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIG1haW4oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgX3VwZGF0ZVB1enpsZU5hbWUoUFVaWkxFX05BTUUub3B0aW9uc1swXT8udmFsdWUpO1xuICAgIG5ld1B1enpsZSgpO1xuICAgIFJVTEVTX0JVVFRPTi5jbGljaygpO1xufVxuXG52b2lkIG1haW4oKTsiXX0=
