// Note: Some Emscripten settings will significantly limit the speed of the generated code.
// Note: Some Emscripten settings may limit the speed of the generated code.
// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');
// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}
// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  Module['print'] = function(x) {
    process['stdout'].write(x + '\n');
  };
  Module['printErr'] = function(x) {
    process['stderr'].write(x + '\n');
  };
  var nodeFS = require('fs');
  var nodePath = require('path');
  Module['read'] = function(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };
  Module['readBinary'] = function(filename) { return Module['read'](filename, true) };
  Module['load'] = function(f) {
    globalEval(read(f));
  };
  Module['arguments'] = process['argv'].slice(2);
  module.exports = Module;
}
else if (ENVIRONMENT_IS_SHELL) {
  Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm
  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function() { throw 'no read() available (jsc?)' };
  }
  Module['readBinary'] = function(f) {
    return read(f, 'binary');
  };
  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }
  this['Module'] = Module;
}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };
  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }
  if (ENVIRONMENT_IS_WEB) {
    Module['print'] = function(x) {
      console.log(x);
    };
    Module['printErr'] = function(x) {
      console.log(x);
    };
    this['Module'] = Module;
  } else if (ENVIRONMENT_IS_WORKER) {
    // We can do very little here...
    var TRY_USE_DUMP = false;
    Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
    Module['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}
function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***
// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];
// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];
// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}
// === Auto-generated preamble library stuff ===
//========================================
// Runtime code shared with compiler
//========================================
var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      var logg = log2(quantum);
      return '((((' +target + ')+' + (quantum-1) + ')>>' + logg + ')<<' + logg + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type, quantumSize) {
    if (Runtime.QUANTUM_SIZE == 1) return 1;
    var size = {
      '%i1': 1,
      '%i8': 1,
      '%i16': 2,
      '%i32': 4,
      '%i64': 8,
      "%float": 4,
      "%double": 8
    }['%'+type]; // add '%' since float and double confuse Closure compiler as keys, and also spidermonkey as a compiler will remove 's from '_i8' etc
    if (!size) {
      if (type.charAt(type.length-1) == '*') {
        size = Runtime.QUANTUM_SIZE; // A pointer
      } else if (type[0] == 'i') {
        var bits = parseInt(type.substr(1));
        assert(bits % 8 == 0);
        size = bits/8;
      }
    }
    return size;
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (type == 'i64' || type == 'double' || vararg) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          if (Types.types[field]) {
            alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
          } else {
            alignSize = type.alignSize || QUANTUM_SIZE;
          }
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else {
        throw 'Unclear type in struct: ' + field + ', in ' + type.name_ + ' :: ' + dump(Types.types[type.name_]);
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      assert(args.length == sig.length-1);
      return FUNCTION_TABLE[ptr].apply(null, args);
    } else {
      assert(sig.length == 1);
      return FUNCTION_TABLE[ptr]();
    }
  },
  addFunction: function (func) {
    var table = FUNCTION_TABLE;
    var ret = table.length;
    table.push(func);
    table.push(0);
    return ret;
  },
  removeFunction: function (index) {
    var table = FUNCTION_TABLE;
    table[index] = null;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xFF;
      if (buffer.length == 0) {
        if ((code & 0x80) == 0x00) {        // 0xxxxxxx
          return String.fromCharCode(code);
        }
        buffer.push(code);
        if ((code & 0xE0) == 0xC0) {        // 110xxxxx
          needed = 1;
        } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
          needed = 2;
        } else {                            // 11110xxx
          needed = 3;
        }
        return '';
      }
      if (needed) {
        buffer.push(code);
        needed--;
        if (needed > 0) return '';
      }
      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var c4 = buffer[3];
      var ret;
      if (buffer.length == 2) {
        ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
      } else if (buffer.length == 3) {
        ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
      } else {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                        ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
        ret = String.fromCharCode(
          Math.floor((codePoint - 0x10000) / 0x400) + 0xD800,
          (codePoint - 0x10000) % 0x400 + 0xDC00);
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = ((((STACKTOP)+7)>>3)<<3);(assert((STACKTOP|0) < (STACK_MAX|0))|0); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + (assert(!staticSealed),size))|0;STATICTOP = ((((STATICTOP)+7)>>3)<<3); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + (assert(DYNAMICTOP > 0),size))|0;DYNAMICTOP = ((((DYNAMICTOP)+7)>>3)<<3); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? (((low)>>>(0))+(((high)>>>(0))*4294967296)) : (((low)>>>(0))+(((high)|(0))*4294967296))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}
//========================================
// Runtime essentials
//========================================
var __THREW__ = 0; // Used in checking for thrown exceptions.
var setjmpId = 1; // Used in setjmp/longjmp
var setjmpLabels = {};
var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;
var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}
var globalScope = this;
// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;
// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = Module['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}
// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length+1);
      writeStringToMemory(value, ret);
      return ret;
    } else if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}
// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;
// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,Math.abs(tempDouble) >= 1 ? (tempDouble > 0 ? Math.min(Math.floor((tempDouble)/4294967296), 4294967295)>>>0 : (~~(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296)))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;
// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;
var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;
// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }
  var singleType = typeof types === 'string' ? types : null;
  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }
  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }
  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }
  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];
    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }
    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    assert(type, 'Must know what type to store in allocate!');
    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later
    setValue(ret+i, curr, type);
    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }
  return ret;
}
Module['allocate'] = allocate;
function Pointer_stringify(ptr, /* optional */ length) {
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    assert(ptr + i < TOTAL_MEMORY);
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;
  var ret = '';
  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }
  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    assert(ptr + i < TOTAL_MEMORY);
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;
// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF16ToString(ptr) {
  var i = 0;
  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module['UTF16ToString'] = UTF16ToString;
// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr', 
// null-terminated and encoded in UTF16LE form. The copy will require at most (str.length*2+1)*2 bytes of space in the HEAP.
function stringToUTF16(str, outPtr) {
  for(var i = 0; i < str.length; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[(((outPtr)+(i*2))>>1)]=codeUnit
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[(((outPtr)+(str.length*2))>>1)]=0
}
Module['stringToUTF16'] = stringToUTF16;
// Given a pointer 'ptr' to a null-terminated UTF32LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF32ToString(ptr) {
  var i = 0;
  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module['UTF32ToString'] = UTF32ToString;
// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr', 
// null-terminated and encoded in UTF32LE form. The copy will require at most (str.length+1)*4 bytes of space in the HEAP,
// but can use less, since str.length does not return the number of characters in the string, but the number of UTF-16 code units in the string.
function stringToUTF32(str, outPtr) {
  var iChar = 0;
  for(var iCodeUnit = 0; iCodeUnit < str.length; ++iCodeUnit) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    var codeUnit = str.charCodeAt(iCodeUnit); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++iCodeUnit);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[(((outPtr)+(iChar*4))>>2)]=codeUnit
    ++iChar;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[(((outPtr)+(iChar*4))>>2)]=0
}
Module['stringToUTF32'] = stringToUTF32;
// Memory management
var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return ((x+4095)>>12)<<12;
}
var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk
function enlargeMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
}
var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;
// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(!!Int32Array && !!Float64Array && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'Cannot fallback to non-typed array case: Code is too specialized');
var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);
// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');
Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;
function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}
var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited
var runtimeInitialized = false;
function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}
function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}
function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}
function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;
function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;
function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;
function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;
function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;
// Tools
// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;
function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
        assert(false, 'Character code ' + chr + ' (' + String.fromCharCode(chr) + ')  at offset ' + i + ' not in 0x00-0xFF.');
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;
// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;
function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;
function unSign(value, bits, ignore, sig) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore, sig) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}
if (!Math['imul']) Math['imul'] = function(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyTracking = {};
var calledInit = false, calledRun = false;
var runDependencyWatcher = null;
function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval !== 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(function() {
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            Module.printErr('still waiting on run dependencies:');
          }
          Module.printErr('dependency: ' + dep);
        }
        if (shown) {
          Module.printErr('(end of list)');
        }
      }, 10000);
    }
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    } 
    // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
    if (!calledRun && shouldRunNow) run();
  }
}
Module['removeRunDependency'] = removeRunDependency;
Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data
function loadMemoryInitializer(filename) {
  function applyData(data) {
    HEAPU8.set(data, STATIC_BASE);
  }
  // always do this asynchronously, to keep shell and web as similar as possible
  addOnPreRun(function() {
    if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
      applyData(Module['readBinary'](filename));
    } else {
      Browser.asyncLoad(filename, function(data) {
        applyData(data);
      }, function(data) {
        throw 'could not load memory initializer ' + filename;
      });
    }
  });
}
// === Body ===
STATIC_BASE = 8;
STATICTOP = STATIC_BASE + 3728;
/* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } });
/* memory initializer */ allocate([0,0,0,0,76,0,0,0,34,0,0,0,58,0,0,0,24,0,0,0,84,0,0,0,46,0,0,0,32,0,0,0,68,0,0,0,64,0,0,0,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,5,3,2,0,0,0,0,1,6,0,0,7,0,7,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,8,0,0,32,7,0,0,80,6,0,0,144,5,0,0,104,5,0,0,176,4,0,0,128,4,0,0,96,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,90,0,0,0,12,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,78,0,0,0,0,0,0,0,2,0,0,0,88,0,0,0,52,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,0,0,0,54,0,0,0,42,0,0,0,50,0,0,0,94,0,0,0,10,0,0,0,48,0,0,0,14,0,0,0,66,0,0,0,92,0,0,0,60,0,0,0,6,0,0,0,28,0,0,0,90,0,0,0,12,0,0,0,16,0,0,0,30,0,0,0,80,0,0,0,44,0,0,0,20,0,0,0,2,0,0,0,88,0,0,0,52,0,0,0,0,0,0,0,74,0,0,0,0,0,0,0,0,0,0,0,239,187,191,0,0,0,0,0,0,0,0,0,36,0,0,0,38,0,0,0,86,0,0,0,8,0,0,0,26,0,0,0,70,0,0,0,4,0,0,0,18,0,0,0,56,0,0,0,82,0,0,0,62,0,0,0,48,49,50,51,52,53,54,55,56,57,65,66,67,68,69,70,0,0,0,0,0,0,0,0,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,8,30,25,20,15,10,38,38,38,38,38,38,38,38,38,38,0,38,0,38,5,5,5,15,0,38,38,0,15,10,0,38,38,15,0,5,38,38,38,38,38,38,38,38,38,38,38,38,0,38,0,38,5,5,5,15,0,38,38,0,15,10,0,38,38,15,0,5,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,0,0,0,0,0,0,0,184,12,0,0,248,9,0,0,112,8,0,0,16,7,0,0,72,6,0,0,136,5,0,0,184,12,0,0,232,4,0,0,136,4,0,0,104,4,0,0,72,4,0,0,240,9,0,0,208,9,0,0,152,9,0,0,184,12,0,0,112,9,0,0,184,12,0,0,64,9,0,0,32,9,0,0,184,12,0,0,184,12,0,0,248,8,0,0,208,8,0,0,168,8,0,0,184,12,0,0,144,8,0,0,104,8,0,0,80,8,0,0,56,8,0,0,184,12,0,0,184,12,0,0,184,12,0,0,40,8,0,0,184,12,0,0,184,12,0,0,184,12,0,0,184,12,0,0,16,8,0,0,60,105,109,103,32,115,114,99,61,34,0,0,0,0,0,0,38,37,99,37,99,113,117,111,59,0,0,0,0,0,0,0,38,102,114,97,99,49,50,59,0,0,0,0,0,0,0,0,98,108,111,99,107,113,117,111,116,101,0,0,0,0,0,0,60,98,114,62,10,0,0,0,115,116,121,108,101,0,0,0,102,111,114,109,0,0,0,0,60,98,114,47,62,10,0,0,63,33,46,44,0,0,0,0,115,99,114,105,112,116,0,0,100,101,108,0,0,0,0,0,60,47,97,62,0,0,0,0,46,43,45,95,0,0,0,0,60,47,97,62,10,0,0,0,38,103,116,59,0,0,0,0,109,97,116,104,0,0,0,0,60,97,32,104,114,101,102,61,34,35,116,111,99,95,37,100,34,62,0,0,0,0,0,0,60,47,108,105,62,10,60,108,105,62,10,0,0,0,0,0,115,116,121,108,101,0,0,0,117,108,0,0,0,0,0,0,60,108,105,62,10,0,0,0,60,47,117,108,62,10,60,47,108,105,62,10,0,0,0,0,60,117,108,62,10,60,108,105,62,10,0,0,0,0,0,0,34,62,0,0,0,0,0,0,60,47,99,111,100,101,62,0,119,119,119,46,0,0,0,0,60,99,111,100,101,62,0,0,60,47,115,116,114,111,110,103,62,0,0,0,0,0,0,0,60,115,116,114,111,110,103,62,0,0,0,0,0,0,0,0,60,47,101,109,62,0,0,0,38,108,116,59,0,0,0,0,107,98,100,0,0,0,0,0,60,101,109,62,0,0,0,0,60,47,101,109,62,60,47,115,116,114,111,110,103,62,0,0,116,97,98,108,101,0,0,0,115,97,109,112,0,0,0,0,60,115,116,114,111,110,103,62,60,101,109,62,0,0,0,0,60,47,100,101,108,62,0,0,60,100,101,108,62,0,0,0,60,47,115,117,112,62,0,0,34,32,116,105,116,108,101,61,34,0,0,0,0,0,0,0,47,0,0,0,0,0,0,0,109,97,105,108,116,111,58,0,60,115,117,112,62,0,0,0,60,47,108,105,62,10,60,47,117,108,62,10,0,0,0,0,60,47,99,111,100,101,62,60,47,112,114,101,62,10,0,0,60,112,114,101,62,60,99,111,100,101,62,0,0,0,0,0,38,35,52,55,59,0,0,0,60,112,114,101,62,60,99,111,100,101,32,99,108,97,115,115,61,34,0,0,0,0,0,0,60,47,98,108,111,99,107,113,117,111,116,101,62,10,0,0,109,97,116,104,0,0,0,0,118,97,114,0,0,0,0,0,60,98,108,111,99,107,113,117,111,116,101,62,10,0,0,0,60,47,104,37,100,62,10,0,60,104,37,100,62,0,0,0,60,97,32,104,114,101,102,61,34,0,0,0,0,0,0,0,60,104,37,100,32,105,100,61,34,116,111,99,95,37,100,34,62,0,0,0,0,0,0,0,60,104,114,62,10,0,0,0,102,116,112,58,47,47,0,0,60,104,114,47,62,10,0,0,60,47,117,108,62,10,0,0,60,47,111,108,62,10,0,0,115,114,99,47,98,117,102,102,101,114,46,99,0,0,0,0,60,117,108,62,10,0,0,0,38,35,51,57,59,0,0,0,92,96,42,95,123,125,91,93,40,41,35,43,45,46,33,58,124,38,60,62,94,126,0,0,60,111,108,62,10,0,0,0,104,116,116,112,58,47,47,0,100,105,118,0,0,0,0,0,60,47,108,105,62,10,0,0,99,111,100,101,0,0,0,0,109,100,45,62,119,111,114,107,95,98,117,102,115,91,66,85,70,70,69,82,95,66,76,79,67,75,93,46,115,105,122,101,32,61,61,32,48,0,0,0,60,108,105,62,0,0,0,0,109,100,45,62,119,111,114,107,95,98,117,102,115,91,66,85,70,70,69,82,95,83,80,65,78,93,46,115,105,122,101,32,61,61,32,48,0,0,0,0,60,47,112,62,10,0,0,0,37,115,0,0,0,0,0,0,60,112,62,0,0,0,0,0,105,109,103,0,0,0,0,0,109,97,120,95,110,101,115,116,105,110,103,32,62,32,48,32,38,38,32,99,97,108,108,98,97,99,107,115,0,0,0,0,60,47,116,98,111,100,121,62,60,47,116,97,98,108,101,62,10,0,0,0,0,0,0,0,115,114,99,47,109,97,114,107,100,111,119,110,46,99,0,0,60,47,116,104,101,97,100,62,60,116,98,111,100,121,62,10,0,0,0,0,0,0,0,0,104,116,116,112,115,58,47,47,0,0,0,0,0,0,0,0,104,50,0,0,0,0,0,0,60,116,97,98,108,101,62,60,116,104,101,97,100,62,10,0,104,51,0,0,0,0,0,0,60,47,116,114,62,10,0,0,105,110,115,0,0,0,0,0,60,116,114,62,10,0,0,0,38,97,109,112,59,0,0,0,104,52,0,0,0,0,0,0,60,47,116,100,62,10,0,0,38,110,100,97,115,104,59,0,105,102,114,97,109,101,0,0,100,108,0,0,0,0,0,0,60,47,116,104,62,10,0,0,112,114,101,0,0,0,0,0,38,109,100,97,115,104,59,0,115,116,121,108,101,0,0,0,62,0,0,0,0,0,0,0,38,116,114,97,100,101,59,0,110,111,115,99,114,105,112,116,0,0,0,0,0,0,0,0,32,97,108,105,103,110,61,34,114,105,103,104,116,34,62,0,38,114,101,103,59,0,0,0,104,53,0,0,0,0,0,0,32,97,108,105,103,110,61,34,108,101,102,116,34,62,0,0,38,99,111,112,121,59,0,0,97,0,0,0,0,0,0,0,115,99,114,105,112,116,0,0,32,97,108,105,103,110,61,34,99,101,110,116,101,114,34,62,0,0,0,0,0,0,0,0,38,114,115,113,117,111,59,0,112,114,101,0,0,0,0,0,60,116,100,0,0,0,0,0,104,116,116,112,58,47,47,0,38,35,48,59,0,0,0,0,104,54,0,0,0,0,0,0,60,116,104,0,0,0,0,0,98,117,102,32,38,38,32,98,117,102,45,62,117,110,105,116,0,0,0,0,0,0,0,0,38,113,117,111,116,59,0,0,104,49,0,0,0,0,0,0,109,97,105,108,116,111,58,0,38,97,109,112,59,0,0,0,38,104,101,108,108,105,112,59,0,0,0,0,0,0,0,0,102,105,101,108,100,115,101,116,0,0,0,0,0,0,0,0,34,47,62,0,0,0,0,0,38,35,120,50,55,59,0,0,38,113,117,111,116,59,0,0,38,102,114,97,99,51,52,59,0,0,0,0,0,0,0,0,111,108,0,0,0,0,0,0,34,32,97,108,116,61,34,0,38,102,114,97,99,49,52,59,0,0,0,0,0,0,0,0,102,105,103,117,114,101,0,0,112,0,0,0,0,0,0,0,115,100,95,109,97,114,107,100,111,119,110,95,114,101,110,100,101,114,0,0,0,0,0,0,115,100,95,109,97,114,107,100,111,119,110,95,110,101,119,0,98,117,102,115,108,117,114,112,0,0,0,0,0,0,0,0,98,117,102,112,117,116,99,0,98,117,102,112,117,116,0,0,98,117,102,112,114,105,110,116,102,0,0,0,0,0,0,0,98,117,102,112,114,101,102,105,120,0,0,0,0,0,0,0,98,117,102,103,114,111,119,0,98,117,102,99,115,116,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,3,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,5,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,12,0,0,184,9,0,0,72,8,0,0,224,6,0,0,24,6,0,0,96,5,0,0,168,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
function runPostSets() {
}
var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);
assert(tempDoublePtr % 8 == 0);
function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
}
function copyTempDouble(ptr) {
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];
  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];
  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];
  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];
}
  var _llvm_dbg_declare=undefined;
  function _tolower(chr) {
      chr = chr|0;
      if ((chr|0) < 65) return chr|0;
      if ((chr|0) > 90) return chr|0;
      return (chr - 65 + 97)|0;
    }function _strncasecmp(px, py, n) {
      px = px|0; py = py|0; n = n|0;
      var i = 0, x = 0, y = 0;
      while ((i>>>0) < (n>>>0)) {
        x = _tolower(HEAP8[(((px)+(i))|0)])|0;
        y = _tolower(HEAP8[(((py)+(i))|0)])|0;
        if (((x|0) == (y|0)) & ((x|0) == 0)) return 0;
        if ((x|0) == 0) return -1;
        if ((y|0) == 0) return 1;
        if ((x|0) == (y|0)) {
          i = (i + 1)|0;
          continue;
        } else {
          return ((x>>>0) > (y>>>0) ? 1 : -1)|0;
        }
      }
      return 0;
    }
  function ___assert_func(filename, line, func, condition) {
      throw 'Assertion failed: ' + (condition ? Pointer_stringify(condition) : 'unknown condition') + ', at: ' + [filename ? Pointer_stringify(filename) : 'unknown filename', line, func ? Pointer_stringify(func) : 'unknown function'] + ' at ' + new Error().stack;
    }
  function _memcpy(dest, src, num) {
      dest = dest|0; src = src|0; num = num|0;
      var ret = 0;
      ret = dest|0;
      if ((dest&3) == (src&3)) {
        while (dest & 3) {
          if ((num|0) == 0) return ret|0;
          HEAP8[(dest)]=HEAP8[(src)];
          dest = (dest+1)|0;
          src = (src+1)|0;
          num = (num-1)|0;
        }
        while ((num|0) >= 4) {
          HEAP32[((dest)>>2)]=HEAP32[((src)>>2)];
          dest = (dest+4)|0;
          src = (src+4)|0;
          num = (num-4)|0;
        }
      }
      while ((num|0) > 0) {
        HEAP8[(dest)]=HEAP8[(src)];
        dest = (dest+1)|0;
        src = (src+1)|0;
        num = (num-1)|0;
      }
      return ret|0;
    }var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
  function _memset(ptr, value, num) {
      ptr = ptr|0; value = value|0; num = num|0;
      var stop = 0, value4 = 0, stop4 = 0, unaligned = 0;
      stop = (ptr + num)|0;
      if ((num|0) >= 20) {
        // This is unaligned, but quite large, so work hard to get to aligned settings
        value = value & 0xff;
        unaligned = ptr & 3;
        value4 = value | (value << 8) | (value << 16) | (value << 24);
        stop4 = stop & ~3;
        if (unaligned) {
          unaligned = (ptr + 4 - unaligned)|0;
          while ((ptr|0) < (unaligned|0)) { // no need to check for stop, since we have large num
            HEAP8[(ptr)]=value;
            ptr = (ptr+1)|0;
          }
        }
        while ((ptr|0) < (stop4|0)) {
          HEAP32[((ptr)>>2)]=value4;
          ptr = (ptr+4)|0;
        }
      }
      while ((ptr|0) < (stop|0)) {
        HEAP8[(ptr)]=value;
        ptr = (ptr+1)|0;
      }
    }var _llvm_memset_p0i8_i32=_memset;
  function _memcmp(p1, p2, num) {
      p1 = p1|0; p2 = p2|0; num = num|0;
      var i = 0, v1 = 0, v2 = 0;
      while ((i|0) < (num|0)) {
        var v1 = HEAPU8[(((p1)+(i))|0)];
        var v2 = HEAPU8[(((p2)+(i))|0)];
        if ((v1|0) != (v2|0)) return ((v1|0) > (v2|0) ? 1 : -1)|0;
        i = (i+1)|0;
      }
      return 0;
    }
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:35,EIDRM:36,ECHRNG:37,EL2NSYNC:38,EL3HLT:39,EL3RST:40,ELNRNG:41,EUNATCH:42,ENOCSI:43,EL2HLT:44,EDEADLK:45,ENOLCK:46,EBADE:50,EBADR:51,EXFULL:52,ENOANO:53,EBADRQC:54,EBADSLT:55,EDEADLOCK:56,EBFONT:57,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:74,EDOTDOT:76,EBADMSG:77,ENOTUNIQ:80,EBADFD:81,EREMCHG:82,ELIBACC:83,ELIBBAD:84,ELIBSCN:85,ELIBMAX:86,ELIBEXEC:87,ENOSYS:88,ENOTEMPTY:90,ENAMETOOLONG:91,ELOOP:92,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:106,EPROTOTYPE:107,ENOTSOCK:108,ENOPROTOOPT:109,ESHUTDOWN:110,ECONNREFUSED:111,EADDRINUSE:112,ECONNABORTED:113,ENETUNREACH:114,ENETDOWN:115,ETIMEDOUT:116,EHOSTDOWN:117,EHOSTUNREACH:118,EINPROGRESS:119,EALREADY:120,EDESTADDRREQ:121,EMSGSIZE:122,EPROTONOSUPPORT:123,ESOCKTNOSUPPORT:124,EADDRNOTAVAIL:125,ENETRESET:126,EISCONN:127,ENOTCONN:128,ETOOMANYREFS:129,EUSERS:131,EDQUOT:132,ESTALE:133,ENOTSUP:134,ENOMEDIUM:135,EILSEQ:138,EOVERFLOW:139,ECANCELED:140,ENOTRECOVERABLE:141,EOWNERDEAD:142,ESTRPIPE:143};
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"No message of desired type",36:"Identifier removed",37:"Channel number out of range",38:"Level 2 not synchronized",39:"Level 3 halted",40:"Level 3 reset",41:"Link number out of range",42:"Protocol driver not attached",43:"No CSI structure available",44:"Level 2 halted",45:"Deadlock condition",46:"No record locks available",50:"Invalid exchange",51:"Invalid request descriptor",52:"Exchange full",53:"No anode",54:"Invalid request code",55:"Invalid slot",56:"File locking deadlock error",57:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",74:"Multihop attempted",76:"Cross mount point (not really error)",77:"Trying to read unreadable message",80:"Given log. name not unique",81:"f.d. invalid for this operation",82:"Remote address changed",83:"Can   access a needed shared lib",84:"Accessing a corrupted shared lib",85:".lib section in a.out corrupted",86:"Attempting to link in too many libs",87:"Attempting to exec a shared library",88:"Function not implemented",90:"Directory not empty",91:"File or path name too long",92:"Too many symbolic links",95:"Operation not supported on transport endpoint",96:"Protocol family not supported",104:"Connection reset by peer",105:"No buffer space available",106:"Address family not supported by protocol family",107:"Protocol wrong type for socket",108:"Socket operation on non-socket",109:"Protocol not available",110:"Can't send after socket shutdown",111:"Connection refused",112:"Address already in use",113:"Connection aborted",114:"Network is unreachable",115:"Network interface is not configured",116:"Connection timed out",117:"Host is down",118:"Host is unreachable",119:"Connection already in progress",120:"Socket already connected",121:"Destination address required",122:"Message too long",123:"Unknown protocol",124:"Socket type not supported",125:"Address not available",126:"Connection reset by network",127:"Socket is already connected",128:"Socket is not connected",129:"Too many references",131:"Too many users",132:"Quota exceeded",133:"Stale file handle",134:"Not supported",135:"No medium (in tape drive)",138:"Illegal byte sequence",139:"Value too large for defined data type",140:"Operation canceled",141:"State not recoverable",142:"Previous owner died",143:"Streams pipe error"};
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value
      return value;
    }
  var VFS=undefined;
  var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path, ext) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var f = PATH.splitPath(path)[2];
        if (ext && f.substr(-1 * ext.length) === ext) {
          f = f.substr(0, f.length - ext.length);
        }
        return f;
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.filter(function(p, index) {
          if (typeof p !== 'string') {
            throw new TypeError('Arguments to path.join must be strings');
          }
          return p;
        }).join('/'));
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            continue;
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};
  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              result = process['stdin']['read']();
              if (!result) {
                if (process['stdin']['_readableState'] && process['stdin']['_readableState']['ended']) {
                  return null;  // EOF
                }
                return undefined;  // no data available
              }
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  var MEMFS={CONTENT_OWNING:1,CONTENT_FLEXIBLE:2,CONTENT_FIXED:3,ensureFlexible:function (node) {
        if (node.contentMode !== MEMFS.CONTENT_FLEXIBLE) {
          var contents = node.contents;
          node.contents = Array.prototype.slice.call(contents);
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        }
      },mount:function (mount) {
        return MEMFS.create_node(null, '/', 0040000 | 0777, 0);
      },create_node:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr,
            lookup: MEMFS.node_ops.lookup,
            mknod: MEMFS.node_ops.mknod,
            mknod: MEMFS.node_ops.mknod,
            rename: MEMFS.node_ops.rename,
            unlink: MEMFS.node_ops.unlink,
            rmdir: MEMFS.node_ops.rmdir,
            readdir: MEMFS.node_ops.readdir,
            symlink: MEMFS.node_ops.symlink
          };
          node.stream_ops = {
            llseek: MEMFS.stream_ops.llseek
          };
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr
          };
          node.stream_ops = {
            llseek: MEMFS.stream_ops.llseek,
            read: MEMFS.stream_ops.read,
            write: MEMFS.stream_ops.write,
            allocate: MEMFS.stream_ops.allocate,
            mmap: MEMFS.stream_ops.mmap
          };
          node.contents = [];
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        } else if (FS.isLink(node.mode)) {
          node.node_ops = {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr,
            readlink: MEMFS.node_ops.readlink
          };
          node.stream_ops = {};
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr
          };
          node.stream_ops = FS.chrdev_stream_ops;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.contents.length;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.ensureFlexible(node);
            var contents = node.contents;
            if (attr.size < contents.length) contents.length = attr.size;
            else while (attr.size > contents.length) contents.push(0);
          }
        },lookup:function (parent, name) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.create_node(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.create_node(parent, newname, 0777 | 0120000, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          var size = Math.min(contents.length - position, length);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          var node = stream.node;
          node.timestamp = Date.now();
          var contents = node.contents;
          if (length && contents.length === 0 && position === 0 && buffer.subarray) {
            // just replace it with the new data
            assert(buffer.length);
            if (canOwn && buffer.buffer === HEAP8.buffer && offset === 0) {
              node.contents = buffer; // this is a subarray of the heap, and we can own it
              node.contentMode = MEMFS.CONTENT_OWNING;
            } else {
              node.contents = new Uint8Array(buffer.subarray(offset, offset+length));
              node.contentMode = MEMFS.CONTENT_FIXED;
            }
            return length;
          }
          MEMFS.ensureFlexible(node);
          var contents = node.contents;
          while (contents.length < position) contents.push(0);
          for (var i = 0; i < length; i++) {
            contents[position + i] = buffer[offset + i];
          }
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.contents.length;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.ensureFlexible(stream.node);
          var contents = stream.node.contents;
          var limit = offset + length;
          while (limit > contents.length) contents.push(0);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 0x02) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,devices:[null],streams:[null],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:function ErrnoError(errno) {
          this.errno = errno;
          for (var key in ERRNO_CODES) {
            if (ERRNO_CODES[key] === errno) {
              this.code = key;
              break;
            }
          }
          this.message = ERRNO_MESSAGES[errno];
        },handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + new Error().stack;
        return ___setErrNo(e.errno);
      },cwd:function () {
        return FS.currentPath;
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.currentPath, path);
        opts = opts || { recurse_count: 0 };
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
        // start at the root
        var current = FS.root;
        var current_path = '/';
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join(current_path, parts[i]);
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            current = current.mount.root;
          }
          // follow symlinks
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            return path ? PATH.join(node.mount.mountpoint, path) : node.mount.mountpoint;
          }
          path = path ? PATH.join(node.name, path) : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          if (node.parent.id === parent.id && node.name === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        var node = {
          id: FS.nextInode++,
          name: name,
          mode: mode,
          node_ops: {},
          stream_ops: {},
          rdev: rdev,
          parent: null,
          mount: null
        };
        if (!parent) {
          parent = node;  // root node sets parent to itself
        }
        node.parent = parent;
        node.mount = parent.mount;
        // compatibility
        var readMode = 292 | 73;
        var writeMode = 146;
        // NOTE we must use Object.defineProperties instead of individual calls to
        // Object.defineProperty in order to make closure compiler happy
        Object.defineProperties(node, {
          read: {
            get: function() { return (node.mode & readMode) === readMode; },
            set: function(val) { val ? node.mode |= readMode : node.mode &= ~readMode; }
          },
          write: {
            get: function() { return (node.mode & writeMode) === writeMode; },
            set: function(val) { val ? node.mode |= writeMode : node.mode &= ~writeMode; }
          },
          isFolder: {
            get: function() { return FS.isDir(node.mode); },
          },
          isDevice: {
            get: function() { return FS.isChrdev(node.mode); },
          },
        });
        FS.hashAddNode(node);
        return node;
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return node.mounted;
      },isFile:function (mode) {
        return (mode & 0170000) === 0100000;
      },isDir:function (mode) {
        return (mode & 0170000) === 0040000;
      },isLink:function (mode) {
        return (mode & 0170000) === 0120000;
      },isChrdev:function (mode) {
        return (mode & 0170000) === 0020000;
      },isBlkdev:function (mode) {
        return (mode & 0170000) === 0060000;
      },isFIFO:function (mode) {
        return (mode & 0170000) === 0010000;
      },isSocket:function (mode) {
        return (mode & 0140000) === 0140000;
      },flagModes:{"r":0,"rs":8192,"r+":2,"w":1537,"wx":3585,"xw":3585,"w+":1538,"wx+":3586,"xw+":3586,"a":521,"ax":2569,"xa":2569,"a+":522,"ax+":2570,"xa+":2570},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 3;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 1024)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        return FS.nodePermissions(dir, 'x');
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.currentPath) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 3) !== 0 ||  // opening for write
              (flags & 1024)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 1;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        // compatibility
        Object.defineProperties(stream, {
          object: {
            get: function() { return stream.node; },
            set: function(val) { stream.node = val; }
          },
          isRead: {
            get: function() { return (stream.flags & 3) !== 1; }
          },
          isWrite: {
            get: function() { return (stream.flags & 3) !== 0; }
          },
          isAppend: {
            get: function() { return (stream.flags & 8); }
          }
        });
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },mount:function (type, opts, mountpoint) {
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          root: null
        };
        var lookup;
        if (mountpoint) {
          lookup = FS.lookupPath(mountpoint, { follow: false });
        }
        // create a root node for the fs
        var root = type.mount(mount);
        root.mount = mount;
        mount.root = root;
        // assign the mount info to the mountpoint's node
        if (lookup) {
          lookup.node.mount = mount;
          lookup.node.mounted = true;
          // compatibility update FS.root if we mount to /
          if (mountpoint === '/') {
            FS.root = mount.root;
          }
        }
        return root;
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 0666;
        mode &= 4095;
        mode |= 0100000;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 0777;
        mode &= 511 | 0001000;
        mode |= 0040000;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 0666;
        }
        mode |= 0020000;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },readlink:function (path) {
        var lookup = FS.lookupPath(path, { follow: false });
        var link = lookup.node;
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 3) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        path = PATH.normalize(path);
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 0666 : mode;
        if ((flags & 512)) {
          mode = (mode & 4095) | 0100000;
        } else {
          mode = 0;
        }
        var node;
        try {
          var lookup = FS.lookupPath(path, {
            follow: !(flags & 0200000)
          });
          node = lookup.node;
          path = lookup.path;
        } catch (e) {
          // ignore
        }
        // perhaps we need to create the node
        if ((flags & 512)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 2048)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~1024;
        }
        // check permissions
        var err = FS.mayOpen(node, flags);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // do truncation if necessary
        if ((flags & 1024)) {
          FS.truncate(node, 0);
        }
        // register the stream with the filesystem
        var stream = FS.createStream({
          path: path,
          node: node,
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 3) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 3) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        if (stream.flags & 8) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 3) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 3) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.errnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = '';
          var utf8 = new Runtime.UTF8Processor();
          for (var i = 0; i < length; i++) {
            ret += utf8.processCChar(buf[i]);
          }
        } else if (opts.encoding === 'binary') {
          ret = buf;
        } else {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0);
        } else {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        FS.close(stream);
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=stdin.fd;
        assert(stdin.fd === 1, 'invalid handle for stdin (' + stdin.fd + ')');
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=stdout.fd;
        assert(stdout.fd === 2, 'invalid handle for stdout (' + stdout.fd + ')');
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=stderr.fd;
        assert(stderr.fd === 3, 'invalid handle for stderr (' + stderr.fd + ')');
      },staticInit:function () {
        FS.nameTable = new Array(4096);
        FS.root = FS.createNode(null, '/', 0040000 | 0777, 0);
        FS.mount(MEMFS, {}, '/');
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(path, mode | 146);
          var stream = FS.open(path, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(path, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          var LazyUint8Array = function() {
            this.lengthKnown = false;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = Math.floor(idx / this.chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function(getter) {
            this.getter = getter;
          }
          LazyUint8Array.prototype.cacheLength = function() {
              // Find length
              var xhr = new XMLHttpRequest();
              xhr.open('HEAD', url, false);
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              var datalength = Number(xhr.getResponseHeader("Content-length"));
              var header;
              var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
              var chunkSize = 1024*1024; // Chunk size in bytes
              if (!hasByteServing) chunkSize = datalength;
              // Function to get a range from the remote URL.
              var doXHR = (function(from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
                // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
                // Some hints to the browser that we want binary data.
                if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
                if (xhr.overrideMimeType) {
                  xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                  return new Uint8Array(xhr.response || []);
                } else {
                  return intArrayFromString(xhr.responseText || '', true);
                }
              });
              var lazyArray = this;
              lazyArray.setDataGetter(function(chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum+1) * chunkSize - 1; // including this byte
                end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                  lazyArray.chunks[chunkNum] = doXHR(start, end);
                }
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum];
              });
              this._length = datalength;
              this._chunkSize = chunkSize;
              this.lengthKnown = true;
          }
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          var size = Math.min(contents.length - position, length);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join(parent, name)) : parent;
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};
  var SOCKFS={mount:function (mount) {
        return FS.createNode(null, '/', 0040000 | 0777, 0);
      },nextname:function () {
        if (!SOCKFS.nextname.current) {
          SOCKFS.nextname.current = 0;
        }
        return 'socket[' + (SOCKFS.nextname.current++) + ']';
      },createSocket:function (family, type, protocol) {
        var streaming = type == 1;
        if (protocol) {
          assert(streaming == (protocol == 6)); // if SOCK_STREAM, must be tcp
        }
        // create our internal socket structure
        var sock = {
          family: family,
          type: type,
          protocol: protocol,
          server: null,
          peers: {},
          pending: [],
          recv_queue: [],
          sock_ops: SOCKFS.websocket_sock_ops
        };
        // create the filesystem node to store the socket structure
        var name = SOCKFS.nextname();
        var node = FS.createNode(SOCKFS.root, name, 0140000, 0);
        node.sock = sock;
        // and the wrapping stream that enables library functions such
        // as read and write to indirectly interact with the socket
        var stream = FS.createStream({
          path: name,
          node: node,
          flags: FS.modeStringToFlags('r+'),
          seekable: false,
          stream_ops: SOCKFS.stream_ops
        });
        // map the new stream to the socket structure (sockets have a 1:1
        // relationship with a stream)
        sock.stream = stream;
        return sock;
      },getSocket:function (fd) {
        var stream = FS.getStream(fd);
        if (!stream || !FS.isSocket(stream.node.mode)) {
          return null;
        }
        return stream.node.sock;
      },stream_ops:{poll:function (stream) {
          var sock = stream.node.sock;
          return sock.sock_ops.poll(sock);
        },ioctl:function (stream, request, varargs) {
          var sock = stream.node.sock;
          return sock.sock_ops.ioctl(sock, request, varargs);
        },read:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          var msg = sock.sock_ops.recvmsg(sock, length);
          if (!msg) {
            // socket is closed
            return 0;
          }
          buffer.set(msg.buffer, offset);
          return msg.buffer.length;
        },write:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          return sock.sock_ops.sendmsg(sock, buffer, offset, length);
        },close:function (stream) {
          var sock = stream.node.sock;
          sock.sock_ops.close(sock);
        }},websocket_sock_ops:{createPeer:function (sock, addr, port) {
          var ws;
          if (typeof addr === 'object') {
            ws = addr;
            addr = null;
            port = null;
          }
          if (ws) {
            // for sockets that've already connected (e.g. we're the server)
            // we can inspect the _socket property for the address
            if (ws._socket) {
              addr = ws._socket.remoteAddress;
              port = ws._socket.remotePort;
            }
            // if we're just now initializing a connection to the remote,
            // inspect the url property
            else {
              var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
              if (!result) {
                throw new Error('WebSocket URL must be in the format ws(s)://address:port');
              }
              addr = result[1];
              port = parseInt(result[2], 10);
            }
          } else {
            // create the actual websocket object and connect
            try {
              var url = 'ws://' + addr + ':' + port;
              // the node ws library API is slightly different than the browser's
              var opts = ENVIRONMENT_IS_NODE ? {} : ['binary'];
              ws = new WebSocket(url, opts);
              ws.binaryType = 'arraybuffer';
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EHOSTUNREACH);
            }
          }
          var peer = {
            addr: addr,
            port: port,
            socket: ws,
            dgram_send_queue: []
          };
          SOCKFS.websocket_sock_ops.addPeer(sock, peer);
          SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
          // if this is a bound dgram socket, send the port number first to allow
          // us to override the ephemeral port reported to us by remotePort on the
          // remote end.
          if (sock.type === 2 && typeof sock.sport !== 'undefined') {
            peer.dgram_send_queue.push(new Uint8Array([
                255, 255, 255, 255,
                'p'.charCodeAt(0), 'o'.charCodeAt(0), 'r'.charCodeAt(0), 't'.charCodeAt(0),
                ((sock.sport & 0xff00) >> 8) , (sock.sport & 0xff)
            ]));
          }
          return peer;
        },getPeer:function (sock, addr, port) {
          return sock.peers[addr + ':' + port];
        },addPeer:function (sock, peer) {
          sock.peers[peer.addr + ':' + peer.port] = peer;
        },removePeer:function (sock, peer) {
          delete sock.peers[peer.addr + ':' + peer.port];
        },handlePeerEvents:function (sock, peer) {
          var first = true;
          var handleOpen = function () {
            try {
              var queued = peer.dgram_send_queue.shift();
              while (queued) {
                peer.socket.send(queued);
                queued = peer.dgram_send_queue.shift();
              }
            } catch (e) {
              // not much we can do here in the way of proper error handling as we've already
              // lied and said this data was sent. shut it down.
              peer.socket.close();
            }
          };
          var handleMessage = function(data) {
            assert(typeof data !== 'string' && data.byteLength !== undefined);  // must receive an ArrayBuffer
            data = new Uint8Array(data);  // make a typed array view on the array buffer
            // if this is the port message, override the peer's port with it
            var wasfirst = first;
            first = false;
            if (wasfirst &&
                data.length === 10 &&
                data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 &&
                data[4] === 'p'.charCodeAt(0) && data[5] === 'o'.charCodeAt(0) && data[6] === 'r'.charCodeAt(0) && data[7] === 't'.charCodeAt(0)) {
              // update the peer's port and it's key in the peer map
              var newport = ((data[8] << 8) | data[9]);
              SOCKFS.websocket_sock_ops.removePeer(sock, peer);
              peer.port = newport;
              SOCKFS.websocket_sock_ops.addPeer(sock, peer);
              return;
            }
            sock.recv_queue.push({ addr: peer.addr, port: peer.port, data: data });
          };
          if (ENVIRONMENT_IS_NODE) {
            peer.socket.on('open', handleOpen);
            peer.socket.on('message', function(data, flags) {
              if (!flags.binary) {
                return;
              }
              handleMessage((new Uint8Array(data)).buffer);  // copy from node Buffer -> ArrayBuffer
            });
            peer.socket.on('error', function() {
              // don't throw
            });
          } else {
            peer.socket.onopen = handleOpen;
            peer.socket.onmessage = function(event) {
              handleMessage(event.data);
            };
          }
        },poll:function (sock) {
          if (sock.type === 1 && sock.server) {
            // listen sockets should only say they're available for reading
            // if there are pending clients.
            return sock.pending.length ? (0 /* XXX missing C define POLLRDNORM */ | 1) : 0;
          }
          var mask = 0;
          var dest = sock.type === 1 ?  // we only care about the socket state for connection-based sockets
            SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) :
            null;
          if (sock.recv_queue.length ||
              !dest ||  // connection-less sockets are always ready to read
              (dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {  // let recv return 0 once closed
            mask |= (0 /* XXX missing C define POLLRDNORM */ | 1);
          }
          if (!dest ||  // connection-less sockets are always ready to write
              (dest && dest.socket.readyState === dest.socket.OPEN)) {
            mask |= 2;
          }
          if ((dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {
            mask |= 16;
          }
          return mask;
        },ioctl:function (sock, request, arg) {
          switch (request) {
            case 1:
              var bytes = 0;
              if (sock.recv_queue.length) {
                bytes = sock.recv_queue[0].data.length;
              }
              HEAP32[((arg)>>2)]=bytes;
              return 0;
            default:
              return ERRNO_CODES.EINVAL;
          }
        },close:function (sock) {
          // if we've spawned a listen server, close it
          if (sock.server) {
            try {
              sock.server.close();
            } catch (e) {
            }
            sock.server = null;
          }
          // close any peer connections
          var peers = Object.keys(sock.peers);
          for (var i = 0; i < peers.length; i++) {
            var peer = sock.peers[peers[i]];
            try {
              peer.socket.close();
            } catch (e) {
            }
            SOCKFS.websocket_sock_ops.removePeer(sock, peer);
          }
          return 0;
        },bind:function (sock, addr, port) {
          if (typeof sock.saddr !== 'undefined' || typeof sock.sport !== 'undefined') {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already bound
          }
          sock.saddr = addr;
          sock.sport = port || _mkport();
          // in order to emulate dgram sockets, we need to launch a listen server when
          // binding on a connection-less socket
          // note: this is only required on the server side
          if (sock.type === 2) {
            // close the existing server if it exists
            if (sock.server) {
              sock.server.close();
              sock.server = null;
            }
            // swallow error operation not supported error that occurs when binding in the
            // browser where this isn't supported
            try {
              sock.sock_ops.listen(sock, 0);
            } catch (e) {
              if (!(e instanceof FS.ErrnoError)) throw e;
              if (e.errno !== ERRNO_CODES.EOPNOTSUPP) throw e;
            }
          }
        },connect:function (sock, addr, port) {
          if (sock.server) {
            throw new FS.ErrnoError(ERRNO_CODS.EOPNOTSUPP);
          }
          // TODO autobind
          // if (!sock.addr && sock.type == 2) {
          // }
          // early out if we're already connected / in the middle of connecting
          if (typeof sock.daddr !== 'undefined' && typeof sock.dport !== 'undefined') {
            var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
            if (dest) {
              if (dest.socket.readyState === dest.socket.CONNECTING) {
                throw new FS.ErrnoError(ERRNO_CODES.EALREADY);
              } else {
                throw new FS.ErrnoError(ERRNO_CODES.EISCONN);
              }
            }
          }
          // add the socket to our peer list and set our
          // destination address / port to match
          var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
          sock.daddr = peer.addr;
          sock.dport = peer.port;
          // always "fail" in non-blocking mode
          throw new FS.ErrnoError(ERRNO_CODES.EINPROGRESS);
        },listen:function (sock, backlog) {
          if (!ENVIRONMENT_IS_NODE) {
            throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
          }
          if (sock.server) {
             throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already listening
          }
          var WebSocketServer = require('ws').Server;
          var host = sock.saddr;
          sock.server = new WebSocketServer({
            host: host,
            port: sock.sport
            // TODO support backlog
          });
          sock.server.on('connection', function(ws) {
            if (sock.type === 1) {
              var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
              // create a peer on the new socket
              var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
              newsock.daddr = peer.addr;
              newsock.dport = peer.port;
              // push to queue for accept to pick up
              sock.pending.push(newsock);
            } else {
              // create a peer on the listen socket so calling sendto
              // with the listen socket and an address will resolve
              // to the correct client
              SOCKFS.websocket_sock_ops.createPeer(sock, ws);
            }
          });
          sock.server.on('closed', function() {
            sock.server = null;
          });
          sock.server.on('error', function() {
            // don't throw
          });
        },accept:function (listensock) {
          if (!listensock.server) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          var newsock = listensock.pending.shift();
          newsock.stream.flags = listensock.stream.flags;
          return newsock;
        },getname:function (sock, peer) {
          var addr, port;
          if (peer) {
            if (sock.daddr === undefined || sock.dport === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            }
            addr = sock.daddr;
            port = sock.dport;
          } else {
            // TODO saddr and sport will be set for bind()'d UDP sockets, but what
            // should we be returning for TCP sockets that've been connect()'d?
            addr = sock.saddr || 0;
            port = sock.sport || 0;
          }
          return { addr: addr, port: port };
        },sendmsg:function (sock, buffer, offset, length, addr, port) {
          if (sock.type === 2) {
            // connection-less sockets will honor the message address,
            // and otherwise fall back to the bound destination address
            if (addr === undefined || port === undefined) {
              addr = sock.daddr;
              port = sock.dport;
            }
            // if there was no address to fall back to, error out
            if (addr === undefined || port === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.EDESTADDRREQ);
            }
          } else {
            // connection-based sockets will only use the bound
            addr = sock.daddr;
            port = sock.dport;
          }
          // find the peer for the destination address
          var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
          // early out if not connected with a connection-based socket
          if (sock.type === 1) {
            if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            } else if (dest.socket.readyState === dest.socket.CONNECTING) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
          // create a copy of the incoming data to send, as the WebSocket API
          // doesn't work entirely with an ArrayBufferView, it'll just send
          // the entire underlying buffer
          var data;
          if (buffer instanceof Array || buffer instanceof ArrayBuffer) {
            data = buffer.slice(offset, offset + length);
          } else {  // ArrayBufferView
            data = buffer.buffer.slice(buffer.byteOffset + offset, buffer.byteOffset + offset + length);
          }
          // if we're emulating a connection-less dgram socket and don't have
          // a cached connection, queue the buffer to send upon connect and
          // lie, saying the data was sent now.
          if (sock.type === 2) {
            if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
              // if we're not connected, open a new connection
              if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
              }
              dest.dgram_send_queue.push(data);
              return length;
            }
          }
          try {
            // send the actual data
            dest.socket.send(data);
            return length;
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
        },recvmsg:function (sock, length) {
          // http://pubs.opengroup.org/onlinepubs/7908799/xns/recvmsg.html
          if (sock.type === 1 && sock.server) {
            // tcp servers should not be recv()'ing on the listen socket
            throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
          }
          var queued = sock.recv_queue.shift();
          if (!queued) {
            if (sock.type === 1) {
              var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
              if (!dest) {
                // if we have a destination address but are not connected, error out
                throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
              }
              else if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                // return null if the socket has closed
                return null;
              }
              else {
                // else, our socket is in a valid state but truly has nothing available
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
            } else {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
          // queued.data will be an ArrayBuffer if it's unadulterated, but if it's
          // requeued TCP data it'll be an ArrayBufferView
          var queuedLength = queued.data.byteLength || queued.data.length;
          var queuedOffset = queued.data.byteOffset || 0;
          var queuedBuffer = queued.data.buffer || queued.data;
          var bytesRead = Math.min(length, queuedLength);
          var res = {
            buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
            addr: queued.addr,
            port: queued.port
          };
          // push back any unread data for TCP connections
          if (sock.type === 1 && bytesRead < queuedLength) {
            var bytesRemaining = queuedLength - bytesRead;
            queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
            sock.recv_queue.unshift(queued);
          }
          return res;
        }}};function _send(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _write(fd, buf, len);
    }
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var bytesWritten = _write(stream, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        var streamObj = FS.getStream(stream);
        if (streamObj) streamObj.error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }
  function _strlen(ptr) {
      ptr = ptr|0;
      var curr = 0;
      curr = ptr;
      while (HEAP8[(curr)]) {
        curr = (curr + 1)|0;
      }
      return (curr - ptr)|0;
    }
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = HEAPF64[(((varargs)+(argIndex))>>3)];
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+8))>>2)]];
          argIndex += 8; // each 32-bit chunk is in a 64-bit block
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Math.max(Runtime.getNativeFieldSize(type), Runtime.getAlignSize(type, null, true));
        return ret;
      }
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
          // Handle precision.
          var precisionSet = false;
          if (next == 46) {
            var precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          } else {
            var precision = 6; // Standard default.
          }
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
              // Add sign if needed
              if (flagAlwaysSigned) {
                if (currArg < 0) {
                  prefix = '-' + prefix;
                } else {
                  prefix = '+' + prefix;
                }
              }
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
                // Add sign.
                if (flagAlwaysSigned && currArg >= 0) {
                  argText = '+' + argText;
                }
              }
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }function _printf(format, varargs) {
      // int printf(const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var stdout = HEAP32[((_stdout)>>2)];
      return _fprintf(stdout, format, varargs);
    }
  function _isalnum(chr) {
      return (chr >= 48 && chr <= 57) ||
             (chr >= 97 && chr <= 122) ||
             (chr >= 65 && chr <= 90);
    }
  function _memmove(dest, src, num) {
      dest = dest|0; src = src|0; num = num|0;
      if (((src|0) < (dest|0)) & ((dest|0) < ((src + num)|0))) {
        // Unlikely case: Copy backwards in a safe manner
        src = (src + num)|0;
        dest = (dest + num)|0;
        while ((num|0) > 0) {
          dest = (dest - 1)|0;
          src = (src - 1)|0;
          num = (num - 1)|0;
          HEAP8[(dest)]=HEAP8[(src)];
        }
      } else {
        _memcpy(dest, src, num) | 0;
      }
    }var _llvm_memmove_p0i8_p0i8_i32=_memmove;
  function _strncmp(px, py, n) {
      var i = 0;
      while (i < n) {
        var x = HEAPU8[(((px)+(i))|0)];
        var y = HEAPU8[(((py)+(i))|0)];
        if (x == y && x == 0) return 0;
        if (x == 0) return -1;
        if (y == 0) return 1;
        if (x == y) {
          i ++;
          continue;
        } else {
          return x > y ? 1 : -1;
        }
      }
      return 0;
    }function _strcmp(px, py) {
      return _strncmp(px, py, TOTAL_MEMORY);
    }
;
  function _memchr(ptr, chr, num) {
      chr = unSign(chr);
      for (var i = 0; i < num; i++) {
        if (HEAP8[(ptr)] == chr) return ptr;
        ptr++;
      }
      return 0;
    }
  function _llvm_lifetime_start() {}
  function _llvm_lifetime_end() {}
  var _llvm_va_start=undefined;
  function _snprintf(s, n, format, varargs) {
      // int snprintf(char *restrict s, size_t n, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var limit = (n === undefined) ? result.length
                                    : Math.min(result.length, Math.max(n - 1, 0));
      if (s < 0) {
        s = -s;
        var buf = _malloc(limit+1);
        HEAP32[((s)>>2)]=buf;
        s = buf;
      }
      for (var i = 0; i < limit; i++) {
        HEAP8[(((s)+(i))|0)]=result[i];
      }
      if (limit < n || (n === undefined)) HEAP8[(((s)+(i))|0)]=0;
      return result.length;
    }function _vsnprintf(s, n, format, va_arg) {
      return _snprintf(s, n, format, HEAP32[((va_arg)>>2)]);
    }
  function _llvm_va_end() {}
  function _ispunct(chr) {
      return (chr >= 33 && chr <= 47) ||
             (chr >= 58 && chr <= 64) ||
             (chr >= 91 && chr <= 96) ||
             (chr >= 123 && chr <= 126);
    }
  function _isspace(chr) {
      return (chr == 32) || (chr >= 9 && chr <= 13);
    }
  function _isalpha(chr) {
      return (chr >= 97 && chr <= 122) ||
             (chr >= 65 && chr <= 90);
    }
  function _abort() {
      Module['abort']();
    }
  function ___errno_location() {
      return ___errno_state;
    }var ___errno=___errno_location;
  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }
  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 8: return PAGE_SIZE;
        case 54:
        case 56:
        case 21:
        case 61:
        case 63:
        case 22:
        case 67:
        case 23:
        case 24:
        case 25:
        case 26:
        case 27:
        case 69:
        case 28:
        case 101:
        case 70:
        case 71:
        case 29:
        case 30:
        case 199:
        case 75:
        case 76:
        case 32:
        case 43:
        case 44:
        case 80:
        case 46:
        case 47:
        case 45:
        case 48:
        case 49:
        case 42:
        case 82:
        case 33:
        case 7:
        case 108:
        case 109:
        case 107:
        case 112:
        case 119:
        case 121:
          return 200809;
        case 13:
        case 104:
        case 94:
        case 95:
        case 34:
        case 35:
        case 77:
        case 81:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
        case 91:
        case 94:
        case 95:
        case 110:
        case 111:
        case 113:
        case 114:
        case 115:
        case 116:
        case 117:
        case 118:
        case 120:
        case 40:
        case 16:
        case 79:
        case 19:
          return -1;
        case 92:
        case 93:
        case 5:
        case 72:
        case 6:
        case 74:
        case 92:
        case 93:
        case 96:
        case 97:
        case 98:
        case 99:
        case 102:
        case 103:
        case 105:
          return 1;
        case 38:
        case 66:
        case 50:
        case 51:
        case 4:
          return 1024;
        case 15:
        case 64:
        case 41:
          return 32;
        case 55:
        case 37:
        case 17:
          return 2147483647;
        case 18:
        case 1:
          return 47839;
        case 59:
        case 57:
          return 99;
        case 68:
        case 58:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 14: return 32768;
        case 73: return 32767;
        case 39: return 16384;
        case 60: return 1000;
        case 106: return 700;
        case 52: return 256;
        case 62: return 255;
        case 2: return 100;
        case 65: return 64;
        case 36: return 20;
        case 100: return 16;
        case 20: return 6;
        case 53: return 4;
        case 10: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }
  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret
      }
      return ret;
    }
  var Browser={mainLoop:{scheduler:null,shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
        var imagePlugin = {};
        imagePlugin['canHandle'] = function(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          assert(typeof url == 'string', 'createObjectURL must return a url as a string');
          var img = new Image();
          img.onload = function() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
        var audioPlugin = {};
        audioPlugin['canHandle'] = function(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            assert(typeof url == 'string', 'createObjectURL must return a url as a string');
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
        // Canvas event setup
        var canvas = Module['canvas'];
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'];
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule) {
        var ctx;
        try {
          if (useWebGL) {
            ctx = canvas.getContext('experimental-webgl', {
              alpha: false
            });
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas - ' + e);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'];
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else if (Browser.resizeCanvas){
            Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
        }
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
        }
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen();
      },requestAnimationFrame:function (func) {
        if (!window.requestAnimationFrame) {
          window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                         window['mozRequestAnimationFrame'] ||
                                         window['webkitRequestAnimationFrame'] ||
                                         window['msRequestAnimationFrame'] ||
                                         window['oRequestAnimationFrame'] ||
                                         window['setTimeout'];
        }
        window.requestAnimationFrame(func);
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x, y;
          if (event.type == 'touchstart' ||
              event.type == 'touchend' ||
              event.type == 'touchmove') {
            var t = event.touches.item(0);
            if (t) {
              x = t.pageX - (window.scrollX + rect.left);
              y = t.pageY - (window.scrollY + rect.top);
            } else {
              return;
            }
          } else {
            x = event.pageX - (window.scrollX + rect.left);
            y = event.pageY - (window.scrollY + rect.top);
          }
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        var canvas = Module['canvas'];
        this.windowedWidth = canvas.width;
        this.windowedHeight = canvas.height;
        canvas.width = screen.width;
        canvas.height = screen.height;
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      }};
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
__ATINIT__.push({ func: function() { SOCKFS.root = FS.mount(SOCKFS, {}, null); } });
Module["requestFullScreen"] = function(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
staticSealed = true; // seal the static portion of memory
STACK_MAX = STACK_BASE + 5242880;
DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);
assert(DYNAMIC_BASE < TOTAL_MEMORY); // Stack must fit in TOTAL_MEMORY; allocations from here on may enlarge TOTAL_MEMORY
var FUNCTION_TABLE = [0,0,_rndr_triple_emphasis,0,_char_entity,0,_rndr_tablecell,0,_char_link,0,_rndr_hrule
,0,_rndr_double_emphasis,0,_rndr_listitem,0,_rndr_emphasis,0,_char_autolink_url,0,_rndr_raw_html
,0,_smartypants_cb__escape,0,_smartypants_cb__dquote,0,_char_langle_tag,0,_rndr_autolink,0,_rndr_image
,0,_smartypants_cb__number,0,_smartypants_cb__parens,0,_char_emphasis,0,_char_codespan,0,_toc_header
,0,_rndr_blockquote,0,_rndr_link,0,_smartypants_cb__period,0,_rndr_list,0,_rndr_raw_block
,0,_rndr_superscript,0,_rndr_blockcode,0,_char_autolink_email,0,_smartypants_cb__squote,0,_rndr_tablerow
,0,_char_superscript,0,_smartypants_cb__backtick,0,_rndr_paragraph,0,_smartypants_cb__ltag,0,_char_escape
,0,_toc_finalize,0,_rndr_normal_text,0,_smartypants_cb__dash,0,_toc_link,0,_rndr_linebreak
,0,_char_autolink_www,0,_smartypants_cb__amp,0,_char_linebreak,0,_rndr_strikethrough,0,_rndr_codespan,0,_rndr_table,0,_rndr_header];
// EMSCRIPTEN_START_FUNCS
function _sd_markdown_new($extensions, $max_nesting, $callbacks, $opaque) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($max_nesting)|(0))==0; //@line 2405 "src/markdown.c"
   var $2=(($callbacks)|(0))==0; //@line 2405 "src/markdown.c"
   var $or_cond=$1 | $2; //@line 2405 "src/markdown.c"
   if ($or_cond) { label = 2; break; } else { label = 3; break; } //@line 2405 "src/markdown.c"
  case 2: 
   ___assert_func(((2008)|0), 2405, ((2584)|0), ((1952)|0)); //@line 2405 "src/markdown.c"
   throw "Reached an unreachable!"; //@line 2405 "src/markdown.c"
  case 3: 
   var $5=_malloc(432); //@line 2407 "src/markdown.c"
   var $6=$5; //@line 2407 "src/markdown.c"
   var $7=(($5)|(0))==0; //@line 2408 "src/markdown.c"
   if ($7) { var $_0 = 0;label = 21; break; } else { label = 4; break; } //@line 2408 "src/markdown.c"
  case 4: 
   var $9=$callbacks; //@line 2411 "src/markdown.c"
   assert(104 % 1 === 0);(_memcpy($5, $9, 104)|0); //@line 2411 "src/markdown.c"
   var $10=(($5+396)|0); //@line 2413 "src/markdown.c"
   var $11=$10; //@line 2413 "src/markdown.c"
   var $12=_stack_init($11, 4); //@line 2413 "src/markdown.c"
   var $13=(($5+408)|0); //@line 2414 "src/markdown.c"
   var $14=$13; //@line 2414 "src/markdown.c"
   var $15=_stack_init($14, 8); //@line 2414 "src/markdown.c"
   var $16=(($5+140)|0); //@line 2416 "src/markdown.c"
   _memset($16, 0, 256); //@line 2416 "src/markdown.c"
   var $17=(($5+56)|0); //@line 2418 "src/markdown.c"
   var $18=$17; //@line 2418 "src/markdown.c"
   var $19=HEAP32[(($18)>>2)]; //@line 2418 "src/markdown.c"
   var $20=(($19)|(0))==0; //@line 2418 "src/markdown.c"
   if ($20) { label = 5; break; } else { label = 7; break; } //@line 2418 "src/markdown.c"
  case 5: 
   var $22=(($5+52)|0); //@line 2418 "src/markdown.c"
   var $23=$22; //@line 2418 "src/markdown.c"
   var $24=HEAP32[(($23)>>2)]; //@line 2418 "src/markdown.c"
   var $25=(($24)|(0))==0; //@line 2418 "src/markdown.c"
   if ($25) { label = 6; break; } else { label = 7; break; } //@line 2418 "src/markdown.c"
  case 6: 
   var $27=(($5+76)|0); //@line 2418 "src/markdown.c"
   var $28=$27; //@line 2418 "src/markdown.c"
   var $29=HEAP32[(($28)>>2)]; //@line 2418 "src/markdown.c"
   var $30=(($29)|(0))==0; //@line 2418 "src/markdown.c"
   if ($30) { label = 9; break; } else { label = 7; break; } //@line 2418 "src/markdown.c"
  case 7: 
   var $32=(($5+182)|0); //@line 2419 "src/markdown.c"
   HEAP8[($32)]=1; //@line 2419 "src/markdown.c"
   var $33=(($5+235)|0); //@line 2420 "src/markdown.c"
   HEAP8[($33)]=1; //@line 2420 "src/markdown.c"
   var $34=$extensions & 16; //@line 2421 "src/markdown.c"
   var $35=(($34)|(0))==0; //@line 2421 "src/markdown.c"
   if ($35) { label = 9; break; } else { label = 8; break; } //@line 2421 "src/markdown.c"
  case 8: 
   var $37=(($5+266)|0); //@line 2422 "src/markdown.c"
   HEAP8[($37)]=1; //@line 2422 "src/markdown.c"
   label = 9; break; //@line 2422 "src/markdown.c"
  case 9: 
   var $39=(($5+48)|0); //@line 2425 "src/markdown.c"
   var $40=$39; //@line 2425 "src/markdown.c"
   var $41=HEAP32[(($40)>>2)]; //@line 2425 "src/markdown.c"
   var $42=(($41)|(0))==0; //@line 2425 "src/markdown.c"
   if ($42) { label = 11; break; } else { label = 10; break; } //@line 2425 "src/markdown.c"
  case 10: 
   var $44=(($5+236)|0); //@line 2426 "src/markdown.c"
   HEAP8[($44)]=2; //@line 2426 "src/markdown.c"
   label = 11; break; //@line 2426 "src/markdown.c"
  case 11: 
   var $46=(($5+64)|0); //@line 2428 "src/markdown.c"
   var $47=$46; //@line 2428 "src/markdown.c"
   var $48=HEAP32[(($47)>>2)]; //@line 2428 "src/markdown.c"
   var $49=(($48)|(0))==0; //@line 2428 "src/markdown.c"
   if ($49) { label = 13; break; } else { label = 12; break; } //@line 2428 "src/markdown.c"
  case 12: 
   var $51=(($5+150)|0); //@line 2429 "src/markdown.c"
   HEAP8[($51)]=3; //@line 2429 "src/markdown.c"
   label = 13; break; //@line 2429 "src/markdown.c"
  case 13: 
   var $53=(($5+60)|0); //@line 2431 "src/markdown.c"
   var $54=$53; //@line 2431 "src/markdown.c"
   var $55=HEAP32[(($54)>>2)]; //@line 2431 "src/markdown.c"
   var $56=(($55)|(0))==0; //@line 2431 "src/markdown.c"
   if ($56) { label = 14; break; } else { label = 15; break; } //@line 2431 "src/markdown.c"
  case 14: 
   var $58=(($5+68)|0); //@line 2431 "src/markdown.c"
   var $59=$58; //@line 2431 "src/markdown.c"
   var $60=HEAP32[(($59)>>2)]; //@line 2431 "src/markdown.c"
   var $61=(($60)|(0))==0; //@line 2431 "src/markdown.c"
   if ($61) { label = 16; break; } else { label = 15; break; } //@line 2431 "src/markdown.c"
  case 15: 
   var $63=(($5+231)|0); //@line 2432 "src/markdown.c"
   HEAP8[($63)]=4; //@line 2432 "src/markdown.c"
   label = 16; break; //@line 2432 "src/markdown.c"
  case 16: 
   var $65=(($5+200)|0); //@line 2434 "src/markdown.c"
   HEAP8[($65)]=5; //@line 2434 "src/markdown.c"
   var $66=(($5+232)|0); //@line 2435 "src/markdown.c"
   HEAP8[($66)]=6; //@line 2435 "src/markdown.c"
   var $67=(($5+178)|0); //@line 2436 "src/markdown.c"
   HEAP8[($67)]=7; //@line 2436 "src/markdown.c"
   var $68=$extensions & 8; //@line 2438 "src/markdown.c"
   var $69=(($68)|(0))==0; //@line 2438 "src/markdown.c"
   if ($69) { label = 18; break; } else { label = 17; break; } //@line 2438 "src/markdown.c"
  case 17: 
   var $71=(($5+198)|0); //@line 2439 "src/markdown.c"
   HEAP8[($71)]=8; //@line 2439 "src/markdown.c"
   var $72=(($5+204)|0); //@line 2440 "src/markdown.c"
   HEAP8[($72)]=9; //@line 2440 "src/markdown.c"
   var $73=(($5+259)|0); //@line 2441 "src/markdown.c"
   HEAP8[($73)]=10; //@line 2441 "src/markdown.c"
   label = 18; break; //@line 2442 "src/markdown.c"
  case 18: 
   var $75=$extensions & 128; //@line 2444 "src/markdown.c"
   var $76=(($75)|(0))==0; //@line 2444 "src/markdown.c"
   if ($76) { label = 20; break; } else { label = 19; break; } //@line 2444 "src/markdown.c"
  case 19: 
   var $78=(($5+234)|0); //@line 2445 "src/markdown.c"
   HEAP8[($78)]=11; //@line 2445 "src/markdown.c"
   label = 20; break; //@line 2445 "src/markdown.c"
  case 20: 
   var $80=(($5+420)|0); //@line 2448 "src/markdown.c"
   var $81=$80; //@line 2448 "src/markdown.c"
   HEAP32[(($81)>>2)]=$extensions; //@line 2448 "src/markdown.c"
   var $82=(($5+104)|0); //@line 2449 "src/markdown.c"
   var $83=$82; //@line 2449 "src/markdown.c"
   HEAP32[(($83)>>2)]=$opaque; //@line 2449 "src/markdown.c"
   var $84=(($5+424)|0); //@line 2450 "src/markdown.c"
   var $85=$84; //@line 2450 "src/markdown.c"
   HEAP32[(($85)>>2)]=$max_nesting; //@line 2450 "src/markdown.c"
   var $86=(($5+428)|0); //@line 2451 "src/markdown.c"
   var $87=$86; //@line 2451 "src/markdown.c"
   HEAP32[(($87)>>2)]=0; //@line 2451 "src/markdown.c"
   var $_0 = $6;label = 21; break; //@line 2453 "src/markdown.c"
  case 21: 
   var $_0;
   return $_0; //@line 2454 "src/markdown.c"
  default: assert(0, "bad label: " + label);
 }
}
Module["_sd_markdown_new"] = _sd_markdown_new;
function _sd_markdown_render($ob, $document, $doc_size, $md) {
 var label = 0;
 var tempVarArgs = 0;
 var sp  = STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=_bufnew(64); //@line 2465 "src/markdown.c"
   var $2=(($1)|(0))==0; //@line 2466 "src/markdown.c"
   if ($2) { label = 95; break; } else { label = 2; break; } //@line 2466 "src/markdown.c"
  case 2: 
   var $4=_bufgrow($1, $doc_size); //@line 2470 "src/markdown.c"
   var $5=(($md+108)|0); //@line 2473 "src/markdown.c"
   var $6=$5; //@line 2473 "src/markdown.c"
   _memset($6, 0, 32); //@line 2473 "src/markdown.c"
   var $7=(($doc_size)>>>(0)) > 2; //@line 2480 "src/markdown.c"
   if ($7) { label = 3; break; } else { var $beg_0_ph = 0;label = 4; break; } //@line 2480 "src/markdown.c"
  case 3: 
   var $9=_memcmp($document, ((552)|0), 3); //@line 2480 "src/markdown.c"
   var $10=(($9)|(0))==0; //@line 2480 "src/markdown.c"
   var $_=$10 ? 3 : 0; //@line 2480 "src/markdown.c"
   var $beg_0_ph = $_;label = 4; break; //@line 2480 "src/markdown.c"
  case 4: 
   var $beg_0_ph;
   var $11=(($beg_0_ph)>>>(0)) < (($doc_size)>>>(0)); //@line 2483 "src/markdown.c"
   if ($11) { label = 5; break; } else { label = 79; break; } //@line 2483 "src/markdown.c"
  case 5: 
   var $12=(($5)|(0))==0; //@line 2348 "src/markdown.c"
   var $beg_091 = $beg_0_ph;label = 6; break; //@line 2483 "src/markdown.c"
  case 6: 
   var $beg_091;
   var $14=((($beg_091)+(3))|0); //@line 2265 "src/markdown.c"
   var $15=(($14)>>>(0)) < (($doc_size)>>>(0)); //@line 2265 "src/markdown.c"
   if ($15) { label = 7; break; } else { label = 59; break; } //@line 2265 "src/markdown.c"
  case 7: 
   var $17=(($document+$beg_091)|0); //@line 2266 "src/markdown.c"
   var $18=HEAP8[($17)]; //@line 2266 "src/markdown.c"
   var $19=(($18 << 24) >> 24)==32; //@line 2266 "src/markdown.c"
   if ($19) { label = 8; break; } else { var $i_0_i = 0;label = 11; break; } //@line 2266 "src/markdown.c"
  case 8: 
   var $21=((($beg_091)+(1))|0); //@line 2267 "src/markdown.c"
   var $22=(($document+$21)|0); //@line 2267 "src/markdown.c"
   var $23=HEAP8[($22)]; //@line 2267 "src/markdown.c"
   var $24=(($23 << 24) >> 24)==32; //@line 2267 "src/markdown.c"
   if ($24) { label = 9; break; } else { var $i_0_i = 1;label = 11; break; } //@line 2267 "src/markdown.c"
  case 9: 
   var $26=((($beg_091)+(2))|0); //@line 2268 "src/markdown.c"
   var $27=(($document+$26)|0); //@line 2268 "src/markdown.c"
   var $28=HEAP8[($27)]; //@line 2268 "src/markdown.c"
   var $29=(($28 << 24) >> 24)==32; //@line 2268 "src/markdown.c"
   if ($29) { label = 10; break; } else { var $i_0_i = 2;label = 11; break; } //@line 2268 "src/markdown.c"
  case 10: 
   var $31=(($document+$14)|0); //@line 2269 "src/markdown.c"
   var $32=HEAP8[($31)]; //@line 2269 "src/markdown.c"
   var $33=(($32 << 24) >> 24)==32; //@line 2269 "src/markdown.c"
   if ($33) { label = 59; break; } else { var $i_0_i = 3;label = 11; break; } //@line 2269 "src/markdown.c"
  case 11: 
   var $i_0_i;
   var $35=((($i_0_i)+($beg_091))|0); //@line 2270 "src/markdown.c"
   var $36=(($document+$35)|0); //@line 2273 "src/markdown.c"
   var $37=HEAP8[($36)]; //@line 2273 "src/markdown.c"
   var $38=(($37 << 24) >> 24)==91; //@line 2273 "src/markdown.c"
   if ($38) { label = 12; break; } else { label = 59; break; } //@line 2273 "src/markdown.c"
  case 12: 
   var $40=((($35)+(1))|0); //@line 2274 "src/markdown.c"
   var $41=(($40)>>>(0)) < (($doc_size)>>>(0)); //@line 2276 "src/markdown.c"
   if ($41) { var $i_1214_i = $40;label = 13; break; } else { label = 59; break; } //@line 2276 "src/markdown.c"
  case 13: 
   var $i_1214_i;
   var $42=(($document+$i_1214_i)|0); //@line 2276 "src/markdown.c"
   var $43=HEAP8[($42)]; //@line 2276 "src/markdown.c"
   if ((($43 << 24) >> 24)==93) {
    label = 15; break;
   }
   else if ((($43 << 24) >> 24)==10 | (($43 << 24) >> 24)==13) {
    label = 59; break;
   }
   else {
   label = 14; break;
   }
  case 14: 
   var $44=((($i_1214_i)+(1))|0); //@line 2277 "src/markdown.c"
   var $45=(($44)>>>(0)) < (($doc_size)>>>(0)); //@line 2276 "src/markdown.c"
   if ($45) { var $i_1214_i = $44;label = 13; break; } else { label = 59; break; } //@line 2276 "src/markdown.c"
  case 15: 
   var $47=((($i_1214_i)+(1))|0); //@line 2282 "src/markdown.c"
   var $48=(($47)>>>(0)) < (($doc_size)>>>(0)); //@line 2283 "src/markdown.c"
   if ($48) { label = 16; break; } else { label = 59; break; } //@line 2283 "src/markdown.c"
  case 16: 
   var $50=(($document+$47)|0); //@line 2283 "src/markdown.c"
   var $51=HEAP8[($50)]; //@line 2283 "src/markdown.c"
   var $52=(($51 << 24) >> 24)==58; //@line 2283 "src/markdown.c"
   if ($52) { label = 17; break; } else { label = 59; break; } //@line 2283 "src/markdown.c"
  case 17: 
   var $54=((($i_1214_i)+(2))|0); //@line 2284 "src/markdown.c"
   var $55=(($54)>>>(0)) < (($doc_size)>>>(0)); //@line 2285 "src/markdown.c"
   if ($55) { var $i_2209_i = $54;label = 18; break; } else { var $i_3_i = $54;label = 23; break; } //@line 2285 "src/markdown.c"
  case 18: 
   var $i_2209_i;
   var $56=(($document+$i_2209_i)|0); //@line 2285 "src/markdown.c"
   var $57=HEAP8[($56)]; //@line 2285 "src/markdown.c"
   if ((($57 << 24) >> 24)==32) {
    label = 19; break;
   }
   else if ((($57 << 24) >> 24)==10 | (($57 << 24) >> 24)==13) {
    label = 20; break;
   }
   else {
   var $i_3_i = $i_2209_i;label = 23; break;
   }
  case 19: 
   var $59=((($i_2209_i)+(1))|0); //@line 2285 "src/markdown.c"
   var $60=(($59)>>>(0)) < (($doc_size)>>>(0)); //@line 2285 "src/markdown.c"
   if ($60) { var $i_2209_i = $59;label = 18; break; } else { var $i_3_i = $59;label = 23; break; } //@line 2285 "src/markdown.c"
  case 20: 
   var $62=((($i_2209_i)+(1))|0); //@line 2287 "src/markdown.c"
   var $63=(($62)>>>(0)) < (($doc_size)>>>(0)); //@line 2288 "src/markdown.c"
   if ($63) { label = 21; break; } else { var $i_3_i = $62;label = 23; break; } //@line 2288 "src/markdown.c"
  case 21: 
   var $65=(($document+$62)|0); //@line 2288 "src/markdown.c"
   var $66=HEAP8[($65)]; //@line 2288 "src/markdown.c"
   var $67=(($66 << 24) >> 24)==13; //@line 2288 "src/markdown.c"
   if ($67) { label = 22; break; } else { var $i_3_i = $62;label = 23; break; } //@line 2288 "src/markdown.c"
  case 22: 
   var $69=(($57 << 24) >> 24)==10; //@line 2288 "src/markdown.c"
   var $70=((($i_2209_i)+(2))|0); //@line 2288 "src/markdown.c"
   var $__i=$69 ? $70 : $62; //@line 2288 "src/markdown.c"
   var $i_3_i = $__i;label = 23; break; //@line 2288 "src/markdown.c"
  case 23: 
   var $i_3_i;
   var $71=(($i_3_i)>>>(0)) < (($doc_size)>>>(0)); //@line 2289 "src/markdown.c"
   if ($71) { label = 24; break; } else { label = 59; break; } //@line 2289 "src/markdown.c"
  case 24: 
   var $73=(($document+$i_3_i)|0); //@line 2289 "src/markdown.c"
   var $74=HEAP8[($73)]; //@line 2289 "src/markdown.c"
   var $75=(($74 << 24) >> 24)==32; //@line 2289 "src/markdown.c"
   var $76=((($i_3_i)+(1))|0); //@line 2289 "src/markdown.c"
   if ($75) { var $i_3_i = $76;label = 23; break; } else { label = 25; break; }
  case 25: 
   var $78=(($74 << 24) >> 24)==60; //@line 2293 "src/markdown.c"
   var $79=(($78)&(1)); //@line 2293 "src/markdown.c"
   var $_i_3_i=((($79)+($i_3_i))|0); //@line 2293 "src/markdown.c"
   var $80=(($_i_3_i)>>>(0)) < (($doc_size)>>>(0)); //@line 2298 "src/markdown.c"
   if ($80) { var $i_5202_i = $_i_3_i;label = 26; break; } else { var $i_5_lcssa_i = $_i_3_i;label = 28; break; } //@line 2298 "src/markdown.c"
  case 26: 
   var $i_5202_i;
   var $81=(($document+$i_5202_i)|0); //@line 2298 "src/markdown.c"
   var $82=HEAP8[($81)]; //@line 2298 "src/markdown.c"
   if ((($82 << 24) >> 24)==32 | (($82 << 24) >> 24)==10 | (($82 << 24) >> 24)==13) {
    var $i_5_lcssa_i = $i_5202_i;label = 28; break;
   }
   else {
   label = 27; break;
   }
  case 27: 
   var $83=((($i_5202_i)+(1))|0); //@line 2299 "src/markdown.c"
   var $84=(($83)>>>(0)) < (($doc_size)>>>(0)); //@line 2298 "src/markdown.c"
   if ($84) { var $i_5202_i = $83;label = 26; break; } else { var $i_5_lcssa_i = $83;label = 28; break; } //@line 2298 "src/markdown.c"
  case 28: 
   var $i_5_lcssa_i;
   var $85=((($i_5_lcssa_i)-(1))|0); //@line 2301 "src/markdown.c"
   var $86=(($document+$85)|0); //@line 2301 "src/markdown.c"
   var $87=HEAP8[($86)]; //@line 2301 "src/markdown.c"
   var $88=(($87 << 24) >> 24)==62; //@line 2301 "src/markdown.c"
   var $_i_5_i=$88 ? $85 : $i_5_lcssa_i; //@line 2301 "src/markdown.c"
   var $89=(($i_5_lcssa_i)>>>(0)) < (($doc_size)>>>(0)); //@line 2305 "src/markdown.c"
   if ($89) { var $i_6201_i = $i_5_lcssa_i;label = 29; break; } else { var $line_end_0_i = $i_5_lcssa_i;var $i_6200_i = $i_5_lcssa_i;label = 32; break; } //@line 2305 "src/markdown.c"
  case 29: 
   var $i_6201_i;
   var $90=(($document+$i_6201_i)|0); //@line 2305 "src/markdown.c"
   var $91=HEAP8[($90)]; //@line 2305 "src/markdown.c"
   switch((($91 << 24) >> 24)) {
   case 32:{
    label = 30; break;
   }
   case 34: case 39: case 40:{
    label = 31; break;
   }
   case 13: case 10:{
    var $line_end_0_i = $i_6201_i;var $i_6200_i = $i_6201_i;label = 32; break;
   }
   default: {
   label = 59; break;
   }
   } break; 
  case 30: 
   var $93=((($i_6201_i)+(1))|0); //@line 2305 "src/markdown.c"
   var $94=(($93)>>>(0)) < (($doc_size)>>>(0)); //@line 2305 "src/markdown.c"
   if ($94) { var $i_6201_i = $93;label = 29; break; } else { var $line_end_0_i = $93;var $i_6200_i = $93;label = 32; break; } //@line 2305 "src/markdown.c"
  case 31: 
   var $line_end_0_i = 0;var $i_6200_i = $i_6201_i;label = 32; break;
  case 32: 
   var $i_6200_i;
   var $line_end_0_i;
   var $95=((($i_6200_i)+(1))|0); //@line 2312 "src/markdown.c"
   var $96=(($95)>>>(0)) < (($doc_size)>>>(0)); //@line 2312 "src/markdown.c"
   if ($96) { label = 33; break; } else { var $line_end_1_i = $line_end_0_i;label = 35; break; } //@line 2312 "src/markdown.c"
  case 33: 
   var $98=(($document+$i_6200_i)|0); //@line 2312 "src/markdown.c"
   var $99=HEAP8[($98)]; //@line 2312 "src/markdown.c"
   var $100=(($99 << 24) >> 24)==10; //@line 2312 "src/markdown.c"
   if ($100) { label = 34; break; } else { var $line_end_1_i = $line_end_0_i;label = 35; break; } //@line 2312 "src/markdown.c"
  case 34: 
   var $102=(($document+$95)|0); //@line 2312 "src/markdown.c"
   var $103=HEAP8[($102)]; //@line 2312 "src/markdown.c"
   var $104=(($103 << 24) >> 24)==13; //@line 2312 "src/markdown.c"
   var $_line_end_0_i=$104 ? $95 : $line_end_0_i; //@line 2312 "src/markdown.c"
   var $line_end_1_i = $_line_end_0_i;label = 35; break; //@line 2312 "src/markdown.c"
  case 35: 
   var $line_end_1_i;
   var $106=(($line_end_1_i)|(0))==0; //@line 2316 "src/markdown.c"
   if ($106) { var $i_8_i = $i_6200_i;label = 38; break; } else { var $i_7_in_i = $line_end_1_i;label = 36; break; } //@line 2316 "src/markdown.c"
  case 36: 
   var $i_7_in_i;
   var $i_7_i=((($i_7_in_i)+(1))|0); //@line 2317 "src/markdown.c"
   var $107=(($i_7_i)>>>(0)) < (($doc_size)>>>(0)); //@line 2318 "src/markdown.c"
   if ($107) { label = 37; break; } else { var $i_8_i = $i_7_i;label = 38; break; } //@line 2318 "src/markdown.c"
  case 37: 
   var $109=(($document+$i_7_i)|0); //@line 2318 "src/markdown.c"
   var $110=HEAP8[($109)]; //@line 2318 "src/markdown.c"
   var $111=(($110 << 24) >> 24)==32; //@line 2318 "src/markdown.c"
   if ($111) { var $i_7_in_i = $i_7_i;label = 36; break; } else { var $i_8_i = $i_7_i;label = 38; break; }
  case 38: 
   var $i_8_i;
   var $112=((($i_8_i)+(1))|0); //@line 2323 "src/markdown.c"
   var $113=(($112)>>>(0)) < (($doc_size)>>>(0)); //@line 2323 "src/markdown.c"
   if ($113) { label = 39; break; } else { var $line_end_2_i = $line_end_1_i;var $title_end_1_i = 0;var $title_offset_0_i = 0;label = 51; break; } //@line 2323 "src/markdown.c"
  case 39: 
   var $115=(($document+$i_8_i)|0); //@line 2323 "src/markdown.c"
   var $116=HEAP8[($115)]; //@line 2323 "src/markdown.c"
   if ((($116 << 24) >> 24)==39 | (($116 << 24) >> 24)==34 | (($116 << 24) >> 24)==40) {
    var $i_9_i = $112;label = 40; break;
   }
   else {
   var $line_end_2_i = $line_end_1_i;var $title_end_1_i = 0;var $title_offset_0_i = 0;label = 51; break;
   }
  case 40: 
   var $i_9_i;
   var $117=(($i_9_i)>>>(0)) < (($doc_size)>>>(0)); //@line 2328 "src/markdown.c"
   if ($117) { label = 42; break; } else { label = 41; break; } //@line 2328 "src/markdown.c"
  case 41: 
   var $118=((($i_9_i)+(1))|0); //@line 2328 "src/markdown.c"
   var $123 = $118;label = 43; break;
  case 42: 
   var $120=(($document+$i_9_i)|0); //@line 2328 "src/markdown.c"
   var $121=HEAP8[($120)]; //@line 2328 "src/markdown.c"
   var $122=((($i_9_i)+(1))|0); //@line 2328 "src/markdown.c"
   if ((($121 << 24) >> 24)==13 | (($121 << 24) >> 24)==10) {
    var $123 = $122;label = 43; break;
   }
   else {
   var $i_9_i = $122;label = 40; break;
   }
  case 43: 
   var $123;
   var $124=(($123)>>>(0)) < (($doc_size)>>>(0)); //@line 2329 "src/markdown.c"
   if ($124) { label = 44; break; } else { label = 46; break; } //@line 2329 "src/markdown.c"
  case 44: 
   var $126=(($document+$i_9_i)|0); //@line 2329 "src/markdown.c"
   var $127=HEAP8[($126)]; //@line 2329 "src/markdown.c"
   var $128=(($127 << 24) >> 24)==10; //@line 2329 "src/markdown.c"
   if ($128) { label = 45; break; } else { label = 46; break; } //@line 2329 "src/markdown.c"
  case 45: 
   var $130=(($document+$123)|0); //@line 2329 "src/markdown.c"
   var $131=HEAP8[($130)]; //@line 2329 "src/markdown.c"
   var $132=(($131 << 24) >> 24)==13; //@line 2329 "src/markdown.c"
   if ($132) { var $title_end_0_i = $123;label = 47; break; } else { label = 46; break; } //@line 2329 "src/markdown.c"
  case 46: 
   var $title_end_0_i = $i_9_i;label = 47; break;
  case 47: 
   var $title_end_0_i;
   var $i_10_in_i = $i_9_i;label = 48; break; //@line 2334 "src/markdown.c"
  case 48: 
   var $i_10_in_i;
   var $i_10_i=((($i_10_in_i)-(1))|0); //@line 2333 "src/markdown.c"
   var $136=(($i_10_i)>>>(0)) > (($112)>>>(0)); //@line 2334 "src/markdown.c"
   if ($136) { label = 49; break; } else { var $line_end_2_i = $line_end_1_i;var $title_end_1_i = $title_end_0_i;var $title_offset_0_i = $112;label = 51; break; } //@line 2334 "src/markdown.c"
  case 49: 
   var $138=(($document+$i_10_i)|0); //@line 2334 "src/markdown.c"
   var $139=HEAP8[($138)]; //@line 2334 "src/markdown.c"
   if ((($139 << 24) >> 24)==32) {
    var $i_10_in_i = $i_10_i;label = 48; break;
   }
   else if ((($139 << 24) >> 24)==39 | (($139 << 24) >> 24)==34 | (($139 << 24) >> 24)==41) {
    label = 50; break;
   }
   else {
   var $line_end_2_i = $line_end_1_i;var $title_end_1_i = $title_end_0_i;var $title_offset_0_i = $112;label = 51; break;
   }
  case 50: 
   var $line_end_2_i = $title_end_0_i;var $title_end_1_i = $i_10_i;var $title_offset_0_i = $112;label = 51; break;
  case 51: 
   var $title_offset_0_i;
   var $title_end_1_i;
   var $line_end_2_i;
   var $140=(($line_end_2_i)|(0))==0; //@line 2341 "src/markdown.c"
   var $141=(($_i_5_i)|(0))==(($_i_3_i)|(0)); //@line 2341 "src/markdown.c"
   var $or_cond_i=$140 | $141; //@line 2341 "src/markdown.c"
   if ($or_cond_i) { label = 59; break; } else { label = 52; break; } //@line 2341 "src/markdown.c"
  case 52: 
   if ($12) { var $beg_0_be = $line_end_2_i;label = 53; break; } else { label = 54; break; } //@line 2348 "src/markdown.c"
  case 53: 
   var $beg_0_be;
   var $143=(($beg_0_be)>>>(0)) < (($doc_size)>>>(0)); //@line 2483 "src/markdown.c"
   if ($143) { var $beg_091 = $beg_0_be;label = 6; break; } else { label = 79; break; } //@line 2483 "src/markdown.c"
  case 54: 
   var $145=((($i_1214_i)-($40))|0); //@line 2351 "src/markdown.c"
   var $146=_calloc(1, 16); //@line 187 "src/markdown.c"
   var $147=$146; //@line 187 "src/markdown.c"
   var $148=(($146)|(0))==0; //@line 189 "src/markdown.c"
   if ($148) { label = 59; break; } else { label = 55; break; } //@line 189 "src/markdown.c"
  case 55: 
   var $150=(($i_1214_i)|(0))==(($40)|(0)); //@line 176 "src/markdown.c"
   if ($150) { var $hash_0_lcssa_i_i_i = 0;label = 57; break; } else { var $i_08_i_i_i = 0;var $hash_09_i_i_i = 0;label = 56; break; } //@line 176 "src/markdown.c"
  case 56: 
   var $hash_09_i_i_i;
   var $i_08_i_i_i;
   var $_sum_i=((($i_08_i_i_i)+($40))|0); //@line 177 "src/markdown.c"
   var $151=(($document+$_sum_i)|0); //@line 177 "src/markdown.c"
   var $152=HEAP8[($151)]; //@line 177 "src/markdown.c"
   var $153=(($152)&(255)); //@line 177 "src/markdown.c"
   var $154=_tolower($153); //@line 177 "src/markdown.c"
   var $tmp7_i_i_i=((($hash_09_i_i_i)*(65600))&-1);
   var $155=((($154)-($hash_09_i_i_i))|0); //@line 177 "src/markdown.c"
   var $156=((($155)+($tmp7_i_i_i))|0); //@line 177 "src/markdown.c"
   var $157=((($i_08_i_i_i)+(1))|0); //@line 176 "src/markdown.c"
   var $158=(($157)>>>(0)) < (($145)>>>(0)); //@line 176 "src/markdown.c"
   if ($158) { var $i_08_i_i_i = $157;var $hash_09_i_i_i = $156;label = 56; break; } else { var $hash_0_lcssa_i_i_i = $156;label = 57; break; } //@line 176 "src/markdown.c"
  case 57: 
   var $hash_0_lcssa_i_i_i;
   var $159=$146; //@line 192 "src/markdown.c"
   HEAP32[(($159)>>2)]=$hash_0_lcssa_i_i_i; //@line 192 "src/markdown.c"
   var $160=$hash_0_lcssa_i_i_i & 7; //@line 193 "src/markdown.c"
   var $161=(($md+108+($160<<2))|0); //@line 193 "src/markdown.c"
   var $162=HEAP32[(($161)>>2)]; //@line 193 "src/markdown.c"
   var $163=(($146+12)|0); //@line 193 "src/markdown.c"
   var $164=$163; //@line 193 "src/markdown.c"
   HEAP32[(($164)>>2)]=$162; //@line 193 "src/markdown.c"
   HEAP32[(($161)>>2)]=$147; //@line 195 "src/markdown.c"
   var $165=((($_i_5_i)-($_i_3_i))|0); //@line 2355 "src/markdown.c"
   var $166=_bufnew($165); //@line 2355 "src/markdown.c"
   var $167=(($146+4)|0); //@line 2355 "src/markdown.c"
   var $168=$167; //@line 2355 "src/markdown.c"
   HEAP32[(($168)>>2)]=$166; //@line 2355 "src/markdown.c"
   var $169=(($document+$_i_3_i)|0); //@line 2356 "src/markdown.c"
   _bufput($166, $169, $165); //@line 2356 "src/markdown.c"
   var $170=(($title_end_1_i)>>>(0)) > (($title_offset_0_i)>>>(0)); //@line 2358 "src/markdown.c"
   if ($170) { label = 58; break; } else { var $beg_0_be = $line_end_2_i;label = 53; break; } //@line 2358 "src/markdown.c"
  case 58: 
   var $172=((($title_end_1_i)-($title_offset_0_i))|0); //@line 2359 "src/markdown.c"
   var $173=_bufnew($172); //@line 2359 "src/markdown.c"
   var $174=(($146+8)|0); //@line 2359 "src/markdown.c"
   var $175=$174; //@line 2359 "src/markdown.c"
   HEAP32[(($175)>>2)]=$173; //@line 2359 "src/markdown.c"
   var $176=(($document+$title_offset_0_i)|0); //@line 2360 "src/markdown.c"
   _bufput($173, $176, $172); //@line 2360 "src/markdown.c"
   var $beg_0_be = $line_end_2_i;label = 53; break; //@line 2361 "src/markdown.c"
  case 59: 
   var $177=(($beg_091)>>>(0)) < (($doc_size)>>>(0)); //@line 2488 "src/markdown.c"
   if ($177) { var $storemerge86 = $beg_091;label = 60; break; } else { var $storemerge_lcssa111 = $beg_091;label = 72; break; } //@line 2488 "src/markdown.c"
  case 60: 
   var $storemerge86;
   var $178=(($document+$storemerge86)|0); //@line 2488 "src/markdown.c"
   var $179=HEAP8[($178)]; //@line 2488 "src/markdown.c"
   if ((($179 << 24) >> 24)==13 | (($179 << 24) >> 24)==10) {
    var $storemerge_lcssa = $storemerge86;label = 62; break;
   }
   else {
   label = 61; break;
   }
  case 61: 
   var $180=((($storemerge86)+(1))|0); //@line 2489 "src/markdown.c"
   var $181=(($180)>>>(0)) < (($doc_size)>>>(0)); //@line 2488 "src/markdown.c"
   if ($181) { var $storemerge86 = $180;label = 60; break; } else { var $storemerge_lcssa = $180;label = 62; break; } //@line 2488 "src/markdown.c"
  case 62: 
   var $storemerge_lcssa;
   var $182=(($storemerge_lcssa)>>>(0)) > (($beg_091)>>>(0)); //@line 2492 "src/markdown.c"
   if ($182) { label = 63; break; } else { var $storemerge_lcssa111 = $storemerge_lcssa;label = 72; break; } //@line 2492 "src/markdown.c"
  case 63: 
   var $184=((($storemerge_lcssa)-($beg_091))|0); //@line 2493 "src/markdown.c"
   var $185=(($storemerge_lcssa)|(0))==(($beg_091)|(0)); //@line 2371 "src/markdown.c"
   if ($185) { var $storemerge_lcssa111 = $storemerge_lcssa;label = 72; break; } else { var $tab_024_i = 0;var $i_025_i = 0;label = 64; break; } //@line 2371 "src/markdown.c"
  case 64: 
   var $i_025_i;
   var $tab_024_i;
   var $186=(($i_025_i)>>>(0)) < (($184)>>>(0)); //@line 2374 "src/markdown.c"
   if ($186) { var $tab_118_i = $tab_024_i;var $i_119_i = $i_025_i;label = 65; break; } else { var $storemerge_lcssa111 = $storemerge_lcssa;label = 72; break; } //@line 2374 "src/markdown.c"
  case 65: 
   var $i_119_i;
   var $tab_118_i;
   var $_sum=((($i_119_i)+($beg_091))|0); //@line 2374 "src/markdown.c"
   var $187=(($document+$_sum)|0); //@line 2374 "src/markdown.c"
   var $188=HEAP8[($187)]; //@line 2374 "src/markdown.c"
   var $189=(($188 << 24) >> 24)==9; //@line 2374 "src/markdown.c"
   if ($189) { var $tab_1_lcssa_i = $tab_118_i;var $i_1_lcssa_i = $i_119_i;var $_lcssa_i = 1;label = 67; break; } else { label = 66; break; }
  case 66: 
   var $191=((($i_119_i)+(1))|0); //@line 2375 "src/markdown.c"
   var $192=((($tab_118_i)+(1))|0); //@line 2375 "src/markdown.c"
   var $193=(($191)>>>(0)) < (($184)>>>(0)); //@line 2374 "src/markdown.c"
   if ($193) { var $tab_118_i = $192;var $i_119_i = $191;label = 65; break; } else { var $tab_1_lcssa_i = $192;var $i_1_lcssa_i = $191;var $_lcssa_i = 0;label = 67; break; } //@line 2374 "src/markdown.c"
  case 67: 
   var $_lcssa_i;
   var $i_1_lcssa_i;
   var $tab_1_lcssa_i;
   var $194=(($i_1_lcssa_i)>>>(0)) > (($i_025_i)>>>(0)); //@line 2378 "src/markdown.c"
   if ($194) { label = 68; break; } else { label = 69; break; } //@line 2378 "src/markdown.c"
  case 68: 
   var $_sum70=((($i_025_i)+($beg_091))|0); //@line 2379 "src/markdown.c"
   var $196=(($document+$_sum70)|0); //@line 2379 "src/markdown.c"
   var $197=((($i_1_lcssa_i)-($i_025_i))|0); //@line 2379 "src/markdown.c"
   _bufput($1, $196, $197); //@line 2379 "src/markdown.c"
   if ($_lcssa_i) { var $tab_2_i = $tab_1_lcssa_i;label = 70; break; } else { var $storemerge_lcssa111 = $storemerge_lcssa;label = 72; break; } //@line 2381 "src/markdown.c"
  case 69: 
   if ($_lcssa_i) { var $tab_2_i = $tab_1_lcssa_i;label = 70; break; } else { var $storemerge_lcssa111 = $storemerge_lcssa;label = 72; break; } //@line 2381 "src/markdown.c"
  case 70: 
   var $tab_2_i;
   _bufputc($1, 32); //@line 2385 "src/markdown.c"
   var $199=((($tab_2_i)+(1))|0); //@line 2385 "src/markdown.c"
   var $200=$199 & 3; //@line 2386 "src/markdown.c"
   var $201=(($200)|(0))==0; //@line 2386 "src/markdown.c"
   if ($201) { label = 71; break; } else { var $tab_2_i = $199;label = 70; break; } //@line 2386 "src/markdown.c"
  case 71: 
   var $203=((($i_1_lcssa_i)+(1))|0); //@line 2388 "src/markdown.c"
   var $204=(($203)>>>(0)) < (($184)>>>(0)); //@line 2371 "src/markdown.c"
   if ($204) { var $tab_024_i = $199;var $i_025_i = $203;label = 64; break; } else { var $storemerge_lcssa111 = $storemerge_lcssa;label = 72; break; } //@line 2371 "src/markdown.c"
  case 72: 
   var $storemerge_lcssa111;
   var $205=(($storemerge_lcssa111)>>>(0)) < (($doc_size)>>>(0)); //@line 2495 "src/markdown.c"
   if ($205) { var $end_0_load626588 = $storemerge_lcssa111;label = 73; break; } else { var $beg_0_be = $storemerge_lcssa111;label = 53; break; } //@line 2495 "src/markdown.c"
  case 73: 
   var $end_0_load626588;
   var $206=(($document+$end_0_load626588)|0); //@line 2495 "src/markdown.c"
   var $207=HEAP8[($206)]; //@line 2495 "src/markdown.c"
   if ((($207 << 24) >> 24)==10) {
    label = 74; break;
   }
   else if ((($207 << 24) >> 24)==13) {
    label = 75; break;
   }
   else {
   var $beg_0_be = $end_0_load626588;label = 53; break;
   }
  case 74: 
   var $_pre110_pre=((($end_0_load626588)+(1))|0); //@line 2499 "src/markdown.c"
   var $_pre110_pre_phi = $_pre110_pre;label = 77; break; //@line 2497 "src/markdown.c"
  case 75: 
   var $209=((($end_0_load626588)+(1))|0); //@line 2497 "src/markdown.c"
   var $210=(($209)>>>(0)) < (($doc_size)>>>(0)); //@line 2497 "src/markdown.c"
   if ($210) { label = 76; break; } else { var $_pre_phi = $209;label = 78; break; } //@line 2497 "src/markdown.c"
  case 76: 
   var $212=(($document+$209)|0); //@line 2497 "src/markdown.c"
   var $213=HEAP8[($212)]; //@line 2497 "src/markdown.c"
   var $214=(($213 << 24) >> 24)==10; //@line 2497 "src/markdown.c"
   if ($214) { var $_pre_phi = $209;label = 78; break; } else { var $_pre110_pre_phi = $209;label = 77; break; } //@line 2497 "src/markdown.c"
  case 77: 
   var $_pre110_pre_phi; //@line 2499 "src/markdown.c"
   _bufputc($1, 10); //@line 2498 "src/markdown.c"
   var $_pre_phi = $_pre110_pre_phi;label = 78; break; //@line 2498 "src/markdown.c"
  case 78: 
   var $_pre_phi; //@line 2499 "src/markdown.c"
   var $216=(($_pre_phi)>>>(0)) < (($doc_size)>>>(0)); //@line 2495 "src/markdown.c"
   if ($216) { var $end_0_load626588 = $_pre_phi;label = 73; break; } else { var $beg_0_be = $_pre_phi;label = 53; break; } //@line 2495 "src/markdown.c"
  case 79: 
   var $217=(($1+4)|0); //@line 2506 "src/markdown.c"
   var $218=HEAP32[(($217)>>2)]; //@line 2506 "src/markdown.c"
   var $219=$218 >>> 1; //@line 2506 "src/markdown.c"
   var $220=((($219)+($218))|0); //@line 2506 "src/markdown.c"
   var $221=_bufgrow($ob, $220); //@line 2506 "src/markdown.c"
   var $222=(($md+96)|0); //@line 2509 "src/markdown.c"
   var $223=HEAP32[(($222)>>2)]; //@line 2509 "src/markdown.c"
   var $224=(($223)|(0))==0; //@line 2509 "src/markdown.c"
   if ($224) { label = 81; break; } else { label = 80; break; } //@line 2509 "src/markdown.c"
  case 80: 
   var $226=(($md+104)|0); //@line 2510 "src/markdown.c"
   var $227=HEAP32[(($226)>>2)]; //@line 2510 "src/markdown.c"
   FUNCTION_TABLE[$223]($ob, $227); //@line 2510 "src/markdown.c"
   label = 81; break; //@line 2510 "src/markdown.c"
  case 81: 
   var $229=HEAP32[(($217)>>2)]; //@line 2512 "src/markdown.c"
   var $230=(($229)|(0))==0; //@line 2512 "src/markdown.c"
   if ($230) { label = 85; break; } else { label = 82; break; } //@line 2512 "src/markdown.c"
  case 82: 
   var $232=((($229)-(1))|0); //@line 2514 "src/markdown.c"
   var $233=(($1)|0); //@line 2514 "src/markdown.c"
   var $234=HEAP32[(($233)>>2)]; //@line 2514 "src/markdown.c"
   var $235=(($234+$232)|0); //@line 2514 "src/markdown.c"
   var $236=HEAP8[($235)]; //@line 2514 "src/markdown.c"
   if ((($236 << 24) >> 24)==10 | (($236 << 24) >> 24)==13) {
    var $240 = $234;var $239 = $229;label = 84; break;
   }
   else {
   label = 83; break;
   }
  case 83: 
   _bufputc($1, 10); //@line 2515 "src/markdown.c"
   var $_pre=HEAP32[(($233)>>2)]; //@line 2517 "src/markdown.c"
   var $_pre109=HEAP32[(($217)>>2)]; //@line 2517 "src/markdown.c"
   var $240 = $_pre;var $239 = $_pre109;label = 84; break; //@line 2515 "src/markdown.c"
  case 84: 
   var $239;
   var $240;
   _parse_block($ob, $md, $240, $239); //@line 2517 "src/markdown.c"
   var $241=_bufcstr($1); //@line 2518 "src/markdown.c"
   var $242=_printf(((1928)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$241,tempVarArgs)); STACKTOP=tempVarArgs; //@line 2518 "src/markdown.c"
   label = 85; break; //@line 2519 "src/markdown.c"
  case 85: 
   var $244=(($md+100)|0); //@line 2521 "src/markdown.c"
   var $245=HEAP32[(($244)>>2)]; //@line 2521 "src/markdown.c"
   var $246=(($245)|(0))==0; //@line 2521 "src/markdown.c"
   if ($246) { label = 87; break; } else { label = 86; break; } //@line 2521 "src/markdown.c"
  case 86: 
   var $248=(($md+104)|0); //@line 2522 "src/markdown.c"
   var $249=HEAP32[(($248)>>2)]; //@line 2522 "src/markdown.c"
   FUNCTION_TABLE[$245]($ob, $249); //@line 2522 "src/markdown.c"
   label = 87; break; //@line 2522 "src/markdown.c"
  case 87: 
   _bufrelease($1); //@line 2525 "src/markdown.c"
   var $i_08_i = 0;label = 88; break; //@line 222 "src/markdown.c"
  case 88: 
   var $i_08_i;
   var $252=(($md+108+($i_08_i<<2))|0); //@line 223 "src/markdown.c"
   var $253=HEAP32[(($252)>>2)]; //@line 223 "src/markdown.c"
   var $254=(($253)|(0))==0; //@line 226 "src/markdown.c"
   if ($254) { label = 90; break; } else { var $r_07_i = $253;label = 89; break; } //@line 226 "src/markdown.c"
  case 89: 
   var $r_07_i;
   var $255=(($r_07_i+12)|0); //@line 227 "src/markdown.c"
   var $256=HEAP32[(($255)>>2)]; //@line 227 "src/markdown.c"
   var $257=(($r_07_i+4)|0); //@line 228 "src/markdown.c"
   var $258=HEAP32[(($257)>>2)]; //@line 228 "src/markdown.c"
   _bufrelease($258); //@line 228 "src/markdown.c"
   var $259=(($r_07_i+8)|0); //@line 229 "src/markdown.c"
   var $260=HEAP32[(($259)>>2)]; //@line 229 "src/markdown.c"
   _bufrelease($260); //@line 229 "src/markdown.c"
   var $261=$r_07_i; //@line 230 "src/markdown.c"
   _free($261); //@line 230 "src/markdown.c"
   var $262=(($256)|(0))==0; //@line 226 "src/markdown.c"
   if ($262) { label = 90; break; } else { var $r_07_i = $256;label = 89; break; } //@line 226 "src/markdown.c"
  case 90: 
   var $263=((($i_08_i)+(1))|0); //@line 222 "src/markdown.c"
   var $264=(($263)>>>(0)) < 8; //@line 222 "src/markdown.c"
   if ($264) { var $i_08_i = $263;label = 88; break; } else { label = 91; break; } //@line 222 "src/markdown.c"
  case 91: 
   var $265=(($md+412)|0); //@line 2528 "src/markdown.c"
   var $266=HEAP32[(($265)>>2)]; //@line 2528 "src/markdown.c"
   var $267=(($266)|(0))==0; //@line 2528 "src/markdown.c"
   if ($267) { label = 93; break; } else { label = 92; break; } //@line 2528 "src/markdown.c"
  case 92: 
   ___assert_func(((2008)|0), 2528, ((2560)|0), ((1880)|0)); //@line 2528 "src/markdown.c"
   throw "Reached an unreachable!"; //@line 2528 "src/markdown.c"
  case 93: 
   var $270=(($md+400)|0); //@line 2529 "src/markdown.c"
   var $271=HEAP32[(($270)>>2)]; //@line 2529 "src/markdown.c"
   var $272=(($271)|(0))==0; //@line 2529 "src/markdown.c"
   if ($272) { label = 95; break; } else { label = 94; break; } //@line 2529 "src/markdown.c"
  case 94: 
   ___assert_func(((2008)|0), 2529, ((2560)|0), ((1832)|0)); //@line 2529 "src/markdown.c"
   throw "Reached an unreachable!"; //@line 2529 "src/markdown.c"
  case 95: 
   STACKTOP = sp;
   return; //@line 2530 "src/markdown.c"
  default: assert(0, "bad label: " + label);
 }
}
Module["_sd_markdown_render"] = _sd_markdown_render;
function _parse_block($ob, $rndr, $data, $size) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 32)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $lang_i=sp;
   var $fence_trail_i=(sp)+(16);
   var $1=(($rndr+412)|0); //@line 2194 "src/markdown.c"
   var $2=HEAP32[(($1)>>2)]; //@line 2194 "src/markdown.c"
   var $3=(($rndr+400)|0); //@line 2194 "src/markdown.c"
   var $4=HEAP32[(($3)>>2)]; //@line 2194 "src/markdown.c"
   var $5=((($4)+($2))|0); //@line 2194 "src/markdown.c"
   var $6=(($rndr+424)|0); //@line 2194 "src/markdown.c"
   var $7=HEAP32[(($6)>>2)]; //@line 2194 "src/markdown.c"
   var $8=(($5)>>>(0)) > (($7)>>>(0)); //@line 2194 "src/markdown.c"
   var $9=(($size)|(0))==0; //@line 2198 "src/markdown.c"
   var $or_cond=$8 | $9; //@line 2194 "src/markdown.c"
   if ($or_cond) { label = 375; break; } else { label = 2; break; } //@line 2194 "src/markdown.c"
  case 2: 
   var $10=(($rndr+420)|0); //@line 1257 "src/markdown.c"
   var $11=(($rndr+408)|0); //@line 130 "src/markdown.c"
   var $12=(($rndr+416)|0); //@line 132 "src/markdown.c"
   var $13=(($11)|0); //@line 132 "src/markdown.c"
   var $14=(($rndr+12)|0); //@line 1813 "src/markdown.c"
   var $15=(($rndr+104)|0); //@line 1814 "src/markdown.c"
   var $16=(($rndr+8)|0); //@line 2205 "src/markdown.c"
   var $17=(($rndr+396)|0); //@line 130 "src/markdown.c"
   var $18=(($rndr+404)|0); //@line 132 "src/markdown.c"
   var $19=(($17)|0); //@line 132 "src/markdown.c"
   var $20=(($rndr+4)|0); //@line 1422 "src/markdown.c"
   var $21=(($rndr)|0); //@line 1619 "src/markdown.c"
   var $22=(($rndr+28)|0); //@line 1496 "src/markdown.c"
   var $23=(($rndr+32)|0); //@line 2176 "src/markdown.c"
   var $24=$lang_i; //@line 1542 "src/markdown.c"
   var $25=$fence_trail_i; //@line 1542 "src/markdown.c"
   var $26=(($fence_trail_i+4)|0); //@line 1558 "src/markdown.c"
   var $27=(($lang_i+4)|0); //@line 1579 "src/markdown.c"
   var $28=(($rndr+16)|0); //@line 2213 "src/markdown.c"
   var $beg_0359 = 0;label = 3; break; //@line 2198 "src/markdown.c"
  case 3: 
   var $beg_0359;
   var $30=(($data+$beg_0359)|0); //@line 2199 "src/markdown.c"
   var $31=((($size)-($beg_0359))|0); //@line 2200 "src/markdown.c"
   var $32=HEAP8[($30)]; //@line 1254 "src/markdown.c"
   if ((($32 << 24) >> 24)==35) {
    label = 4; break;
   }
   else if ((($32 << 24) >> 24)==60) {
    label = 30; break;
   }
   else {
   label = 34; break;
   }
  case 4: 
   var $34=HEAP32[(($10)>>2)]; //@line 1257 "src/markdown.c"
   var $35=$34 & 64; //@line 1257 "src/markdown.c"
   var $36=(($35)|(0))==0; //@line 1257 "src/markdown.c"
   if ($36) { var $level_0_i102 = 0;label = 10; break; } else { var $level_0_i = 0;label = 5; break; } //@line 1257 "src/markdown.c"
  case 5: 
   var $level_0_i;
   var $37=(($level_0_i)>>>(0)) < (($31)>>>(0)); //@line 1260 "src/markdown.c"
   var $38=(($level_0_i)>>>(0)) < 6; //@line 1260 "src/markdown.c"
   var $or_cond_i=$37 & $38; //@line 1260 "src/markdown.c"
   if ($or_cond_i) { label = 6; break; } else { label = 7; break; } //@line 1260 "src/markdown.c"
  case 6: 
   var $_sum293=((($level_0_i)+($beg_0359))|0); //@line 1260 "src/markdown.c"
   var $40=(($data+$_sum293)|0); //@line 1260 "src/markdown.c"
   var $41=HEAP8[($40)]; //@line 1260 "src/markdown.c"
   var $42=(($41 << 24) >> 24)==35; //@line 1260 "src/markdown.c"
   var $43=((($level_0_i)+(1))|0); //@line 1261 "src/markdown.c"
   if ($42) { var $level_0_i = $43;label = 5; break; } else { var $_pre_phi = $40;label = 9; break; }
  case 7: 
   if ($37) { label = 8; break; } else { var $level_0_i102 = 0;label = 10; break; } //@line 1263 "src/markdown.c"
  case 8: 
   var $_sum292_pre=((($level_0_i)+($beg_0359))|0); //@line 1263 "src/markdown.c"
   var $_pre426=(($data+$_sum292_pre)|0); //@line 1263 "src/markdown.c"
   var $_pre_phi = $_pre426;label = 9; break; //@line 1263 "src/markdown.c"
  case 9: 
   var $_pre_phi; //@line 1263 "src/markdown.c"
   var $44=HEAP8[($_pre_phi)]; //@line 1263 "src/markdown.c"
   var $45=(($44 << 24) >> 24)==32; //@line 1263 "src/markdown.c"
   if ($45) { var $level_0_i102 = 0;label = 10; break; } else { label = 29; break; } //@line 1263 "src/markdown.c"
  case 10: 
   var $level_0_i102;
   var $46=(($level_0_i102)>>>(0)) < (($31)>>>(0)); //@line 1794 "src/markdown.c"
   var $47=(($level_0_i102)>>>(0)) < 6; //@line 1794 "src/markdown.c"
   var $or_cond_i103=$46 & $47; //@line 1794 "src/markdown.c"
   if ($or_cond_i103) { label = 11; break; } else { var $i_0_i104 = $level_0_i102;label = 12; break; } //@line 1794 "src/markdown.c"
  case 11: 
   var $_sum291=((($level_0_i102)+($beg_0359))|0); //@line 1794 "src/markdown.c"
   var $49=(($data+$_sum291)|0); //@line 1794 "src/markdown.c"
   var $50=HEAP8[($49)]; //@line 1794 "src/markdown.c"
   var $51=(($50 << 24) >> 24)==35; //@line 1794 "src/markdown.c"
   var $52=((($level_0_i102)+(1))|0); //@line 1795 "src/markdown.c"
   if ($51) { var $level_0_i102 = $52;label = 10; break; } else { var $i_0_i104 = $level_0_i102;label = 12; break; }
  case 12: 
   var $i_0_i104;
   var $53=(($i_0_i104)>>>(0)) < (($31)>>>(0)); //@line 1797 "src/markdown.c"
   if ($53) { label = 13; break; } else { var $end_0_i105 = $i_0_i104;label = 14; break; } //@line 1797 "src/markdown.c"
  case 13: 
   var $_sum290=((($i_0_i104)+($beg_0359))|0); //@line 1797 "src/markdown.c"
   var $55=(($data+$_sum290)|0); //@line 1797 "src/markdown.c"
   var $56=HEAP8[($55)]; //@line 1797 "src/markdown.c"
   var $57=(($56 << 24) >> 24)==32; //@line 1797 "src/markdown.c"
   var $58=((($i_0_i104)+(1))|0); //@line 1797 "src/markdown.c"
   if ($57) { var $i_0_i104 = $58;label = 12; break; } else { var $end_0_i105 = $i_0_i104;label = 14; break; }
  case 14: 
   var $end_0_i105;
   var $59=(($end_0_i105)>>>(0)) < (($31)>>>(0)); //@line 1799 "src/markdown.c"
   if ($59) { label = 15; break; } else { var $end_1_i107 = $end_0_i105;label = 16; break; } //@line 1799 "src/markdown.c"
  case 15: 
   var $_sum289=((($end_0_i105)+($beg_0359))|0); //@line 1799 "src/markdown.c"
   var $61=(($data+$_sum289)|0); //@line 1799 "src/markdown.c"
   var $62=HEAP8[($61)]; //@line 1799 "src/markdown.c"
   var $63=(($62 << 24) >> 24)==10; //@line 1799 "src/markdown.c"
   var $64=((($end_0_i105)+(1))|0); //@line 1799 "src/markdown.c"
   if ($63) { var $end_1_i107 = $end_0_i105;label = 16; break; } else { var $end_0_i105 = $64;label = 14; break; }
  case 16: 
   var $end_1_i107;
   var $65=(($end_1_i107)|(0))==0; //@line 1802 "src/markdown.c"
   if ($65) { var $end_2_i108 = 0;label = 18; break; } else { label = 17; break; } //@line 1802 "src/markdown.c"
  case 17: 
   var $67=((($end_1_i107)-(1))|0); //@line 1802 "src/markdown.c"
   var $_sum286=((($67)+($beg_0359))|0); //@line 1802 "src/markdown.c"
   var $68=(($data+$_sum286)|0); //@line 1802 "src/markdown.c"
   var $69=HEAP8[($68)]; //@line 1802 "src/markdown.c"
   var $70=(($69 << 24) >> 24)==35; //@line 1802 "src/markdown.c"
   if ($70) { var $end_1_i107 = $67;label = 16; break; } else { var $end_2_i108 = $end_1_i107;label = 18; break; }
  case 18: 
   var $end_2_i108;
   var $71=(($end_2_i108)|(0))==0; //@line 1805 "src/markdown.c"
   if ($71) { label = 28; break; } else { label = 19; break; } //@line 1805 "src/markdown.c"
  case 19: 
   var $73=((($end_2_i108)-(1))|0); //@line 1805 "src/markdown.c"
   var $_sum287=((($73)+($beg_0359))|0); //@line 1805 "src/markdown.c"
   var $74=(($data+$_sum287)|0); //@line 1805 "src/markdown.c"
   var $75=HEAP8[($74)]; //@line 1805 "src/markdown.c"
   var $76=(($75 << 24) >> 24)==32; //@line 1805 "src/markdown.c"
   if ($76) { var $end_2_i108 = $73;label = 18; break; } else { label = 20; break; }
  case 20: 
   var $77=(($end_2_i108)>>>(0)) > (($i_0_i104)>>>(0)); //@line 1808 "src/markdown.c"
   if ($77) { label = 21; break; } else { label = 28; break; } //@line 1808 "src/markdown.c"
  case 21: 
   var $79=HEAP32[(($1)>>2)]; //@line 132 "src/markdown.c"
   var $80=HEAP32[(($12)>>2)]; //@line 132 "src/markdown.c"
   var $81=(($79)>>>(0)) < (($80)>>>(0)); //@line 132 "src/markdown.c"
   if ($81) { label = 22; break; } else { label = 24; break; } //@line 132 "src/markdown.c"
  case 22: 
   var $83=HEAP32[(($13)>>2)]; //@line 132 "src/markdown.c"
   var $84=(($83+($79<<2))|0); //@line 132 "src/markdown.c"
   var $85=HEAP32[(($84)>>2)]; //@line 132 "src/markdown.c"
   var $86=(($85)|(0))==0; //@line 132 "src/markdown.c"
   if ($86) { label = 24; break; } else { label = 23; break; } //@line 132 "src/markdown.c"
  case 23: 
   var $88=((($79)+(1))|0); //@line 134 "src/markdown.c"
   HEAP32[(($1)>>2)]=$88; //@line 134 "src/markdown.c"
   var $89=HEAP32[(($84)>>2)]; //@line 134 "src/markdown.c"
   var $90=$89; //@line 134 "src/markdown.c"
   var $91=(($89+4)|0); //@line 135 "src/markdown.c"
   var $92=$91; //@line 135 "src/markdown.c"
   HEAP32[(($92)>>2)]=0; //@line 135 "src/markdown.c"
   var $work_0_i_i109 = $90;label = 25; break; //@line 136 "src/markdown.c"
  case 24: 
   var $94=_bufnew(64); //@line 137 "src/markdown.c"
   var $95=$94; //@line 138 "src/markdown.c"
   var $96=_stack_push($11, $95); //@line 138 "src/markdown.c"
   var $work_0_i_i109 = $94;label = 25; break;
  case 25: 
   var $work_0_i_i109;
   var $_sum288=((($i_0_i104)+($beg_0359))|0); //@line 1811 "src/markdown.c"
   var $97=(($data+$_sum288)|0); //@line 1811 "src/markdown.c"
   var $98=((($end_2_i108)-($i_0_i104))|0); //@line 1811 "src/markdown.c"
   _parse_inline($work_0_i_i109, $rndr, $97, $98); //@line 1811 "src/markdown.c"
   var $99=HEAP32[(($14)>>2)]; //@line 1813 "src/markdown.c"
   var $100=(($99)|(0))==0; //@line 1813 "src/markdown.c"
   if ($100) { label = 27; break; } else { label = 26; break; } //@line 1813 "src/markdown.c"
  case 26: 
   var $102=HEAP32[(($15)>>2)]; //@line 1814 "src/markdown.c"
   FUNCTION_TABLE[$99]($ob, $work_0_i_i109, $level_0_i102, $102); //@line 1814 "src/markdown.c"
   label = 27; break; //@line 1814 "src/markdown.c"
  case 27: 
   var $104=HEAP32[(($1)>>2)]; //@line 147 "src/markdown.c"
   var $105=((($104)-(1))|0); //@line 147 "src/markdown.c"
   HEAP32[(($1)>>2)]=$105; //@line 147 "src/markdown.c"
   label = 28; break; //@line 1817 "src/markdown.c"
  case 28: 
   var $106=((($end_0_i105)+($beg_0359))|0); //@line 2203 "src/markdown.c"
   var $beg_0_be = $106;label = 33; break; //@line 2203 "src/markdown.c"
  case 29: 
   var $107=(($32 << 24) >> 24)==60; //@line 2205 "src/markdown.c"
   if ($107) { label = 30; break; } else { label = 34; break; } //@line 2205 "src/markdown.c"
  case 30: 
   var $109=HEAP32[(($16)>>2)]; //@line 2205 "src/markdown.c"
   var $110=(($109)|(0))==0; //@line 2205 "src/markdown.c"
   if ($110) { label = 34; break; } else { label = 31; break; } //@line 2205 "src/markdown.c"
  case 31: 
   var $112=_parse_htmlblock($ob, $rndr, $30, $31, 1); //@line 2206 "src/markdown.c"
   var $113=(($112)|(0))==0; //@line 2206 "src/markdown.c"
   if ($113) { label = 34; break; } else { label = 32; break; } //@line 2206 "src/markdown.c"
  case 32: 
   var $115=((($112)+($beg_0359))|0); //@line 2207 "src/markdown.c"
   var $beg_0_be = $115;label = 33; break; //@line 2207 "src/markdown.c"
  case 33: 
   var $beg_0_be;
   var $116=(($beg_0_be)>>>(0)) < (($size)>>>(0)); //@line 2198 "src/markdown.c"
   if ($116) { var $beg_0359 = $beg_0_be;label = 3; break; } else { label = 375; break; } //@line 2198 "src/markdown.c"
  case 34: 
   var $118=(($beg_0359)|(0))==(($size)|(0)); //@line 1124 "src/markdown.c"
   if ($118) { var $126 = 1;label = 38; break; } else { var $i_08_i = 0;label = 35; break; } //@line 1124 "src/markdown.c"
  case 35: 
   var $i_08_i;
   var $_sum=((($i_08_i)+($beg_0359))|0); //@line 1124 "src/markdown.c"
   var $119=(($data+$_sum)|0); //@line 1124 "src/markdown.c"
   var $120=HEAP8[($119)]; //@line 1124 "src/markdown.c"
   if ((($120 << 24) >> 24)==32) {
    label = 36; break;
   }
   else if ((($120 << 24) >> 24)==10) {
    var $i_0_lcssa_i = $i_08_i;label = 37; break;
   }
   else {
   label = 39; break;
   }
  case 36: 
   var $122=((($i_08_i)+(1))|0); //@line 1124 "src/markdown.c"
   var $123=(($122)>>>(0)) < (($31)>>>(0)); //@line 1124 "src/markdown.c"
   if ($123) { var $i_08_i = $122;label = 35; break; } else { var $i_0_lcssa_i = $122;label = 37; break; } //@line 1124 "src/markdown.c"
  case 37: 
   var $i_0_lcssa_i;
   var $124=((($i_0_lcssa_i)+(1))|0); //@line 1128 "src/markdown.c"
   var $125=(($124)|(0))==0; //@line 2209 "src/markdown.c"
   if ($125) { label = 39; break; } else { var $126 = $124;label = 38; break; } //@line 2209 "src/markdown.c"
  case 38: 
   var $126;
   var $127=((($126)+($beg_0359))|0); //@line 2210 "src/markdown.c"
   var $beg_0_be = $127;label = 33; break; //@line 2210 "src/markdown.c"
  case 39: 
   var $128=(($31)>>>(0)) < 3; //@line 1139 "src/markdown.c"
   if ($128) { label = 57; break; } else { label = 40; break; } //@line 1139 "src/markdown.c"
  case 40: 
   var $130=HEAP8[($30)]; //@line 1140 "src/markdown.c"
   var $131=(($130 << 24) >> 24)==32; //@line 1140 "src/markdown.c"
   if ($131) { label = 41; break; } else { var $i_0_i116 = 0;label = 43; break; } //@line 1140 "src/markdown.c"
  case 41: 
   var $_sum284=((($beg_0359)+(1))|0); //@line 1141 "src/markdown.c"
   var $133=(($data+$_sum284)|0); //@line 1141 "src/markdown.c"
   var $134=HEAP8[($133)]; //@line 1141 "src/markdown.c"
   var $135=(($134 << 24) >> 24)==32; //@line 1141 "src/markdown.c"
   if ($135) { label = 42; break; } else { var $i_0_i116 = 1;label = 43; break; } //@line 1141 "src/markdown.c"
  case 42: 
   var $_sum285=((($beg_0359)+(2))|0); //@line 1142 "src/markdown.c"
   var $137=(($data+$_sum285)|0); //@line 1142 "src/markdown.c"
   var $138=HEAP8[($137)]; //@line 1142 "src/markdown.c"
   var $139=(($138 << 24) >> 24)==32; //@line 1142 "src/markdown.c"
   var $__i115=$139 ? 3 : 2; //@line 1142 "src/markdown.c"
   var $i_0_i116 = $__i115;label = 43; break; //@line 1142 "src/markdown.c"
  case 43: 
   var $i_0_i116;
   var $141=((($i_0_i116)+(2))|0); //@line 1145 "src/markdown.c"
   var $142=(($141)>>>(0)) < (($31)>>>(0)); //@line 1145 "src/markdown.c"
   if ($142) { label = 44; break; } else { label = 57; break; } //@line 1145 "src/markdown.c"
  case 44: 
   var $_sum282=((($i_0_i116)+($beg_0359))|0); //@line 1145 "src/markdown.c"
   var $144=(($data+$_sum282)|0); //@line 1145 "src/markdown.c"
   var $145=HEAP8[($144)]; //@line 1145 "src/markdown.c"
   if ((($145 << 24) >> 24)==42 | (($145 << 24) >> 24)==45 | (($145 << 24) >> 24)==95) {
    label = 45; break;
   }
   else {
   label = 57; break;
   }
  case 45: 
   var $147=(($i_0_i116)>>>(0)) < (($31)>>>(0)); //@line 1151 "src/markdown.c"
   if ($147) { var $148 = $145;var $n_029_i297 = 0;var $i_128_i298 = $i_0_i116;label = 46; break; } else { label = 57; break; } //@line 1151 "src/markdown.c"
  case 46: 
   var $i_128_i298;
   var $n_029_i297;
   var $148;
   var $149=(($148 << 24) >> 24)==(($145 << 24) >> 24); //@line 1152 "src/markdown.c"
   if ($149) { label = 47; break; } else { label = 48; break; } //@line 1152 "src/markdown.c"
  case 47: 
   var $151=((($n_029_i297)+(1))|0); //@line 1152 "src/markdown.c"
   var $n_1_i = $151;label = 49; break; //@line 1152 "src/markdown.c"
  case 48: 
   var $153=(($148 << 24) >> 24)==32; //@line 1153 "src/markdown.c"
   if ($153) { var $n_1_i = $n_029_i297;label = 49; break; } else { label = 57; break; } //@line 1153 "src/markdown.c"
  case 49: 
   var $n_1_i;
   var $155=((($i_128_i298)+(1))|0); //@line 1156 "src/markdown.c"
   var $156=(($155)>>>(0)) < (($31)>>>(0)); //@line 1151 "src/markdown.c"
   if ($156) { label = 50; break; } else { label = 51; break; } //@line 1151 "src/markdown.c"
  case 50: 
   var $_sum283=((($155)+($beg_0359))|0);
   var $_phi_trans_insert_i=(($data+$_sum283)|0);
   var $_pre_i118=HEAP8[($_phi_trans_insert_i)]; //@line 1151 "src/markdown.c"
   var $157=(($_pre_i118 << 24) >> 24)==10; //@line 1151 "src/markdown.c"
   if ($157) { label = 51; break; } else { var $148 = $_pre_i118;var $n_029_i297 = $n_1_i;var $i_128_i298 = $155;label = 46; break; }
  case 51: 
   var $158=(($n_1_i)>>>(0)) > 2; //@line 1159 "src/markdown.c"
   if ($158) { label = 52; break; } else { label = 57; break; } //@line 2212 "src/markdown.c"
  case 52: 
   var $160=HEAP32[(($28)>>2)]; //@line 2213 "src/markdown.c"
   var $161=(($160)|(0))==0; //@line 2213 "src/markdown.c"
   if ($161) { var $beg_1 = $beg_0359;label = 54; break; } else { label = 53; break; } //@line 2213 "src/markdown.c"
  case 53: 
   var $163=HEAP32[(($15)>>2)]; //@line 2214 "src/markdown.c"
   FUNCTION_TABLE[$160]($ob, $163); //@line 2214 "src/markdown.c"
   var $beg_1 = $beg_0359;label = 54; break; //@line 2214 "src/markdown.c"
  case 54: 
   var $beg_1;
   var $164=(($beg_1)>>>(0)) < (($size)>>>(0)); //@line 2216 "src/markdown.c"
   if ($164) { label = 55; break; } else { label = 56; break; } //@line 2216 "src/markdown.c"
  case 55: 
   var $166=(($data+$beg_1)|0); //@line 2216 "src/markdown.c"
   var $167=HEAP8[($166)]; //@line 2216 "src/markdown.c"
   var $168=(($167 << 24) >> 24)==10; //@line 2216 "src/markdown.c"
   var $169=((($beg_1)+(1))|0); //@line 2217 "src/markdown.c"
   if ($168) { var $beg_0_be = $169;label = 33; break; } else { var $beg_1 = $169;label = 54; break; }
  case 56: 
   var $170=((($beg_1)+(1))|0); //@line 2217 "src/markdown.c"
   var $beg_0_be = $170;label = 33; break;
  case 57: 
   var $171=HEAP32[(($10)>>2)]; //@line 2222 "src/markdown.c"
   var $172=$171 & 4; //@line 2222 "src/markdown.c"
   var $173=(($172)|(0))==0; //@line 2222 "src/markdown.c"
   if ($173) { label = 84; break; } else { label = 58; break; } //@line 2222 "src/markdown.c"
  case 58: 
   HEAP32[(($24)>>2)]=0; HEAP32[((($24)+(4))>>2)]=0; HEAP32[((($24)+(8))>>2)]=0; HEAP32[((($24)+(12))>>2)]=0; //@line 1546 "src/markdown.c"
   var $175=_is_codefence($30, $31, $lang_i); //@line 1548 "src/markdown.c"
   var $176=(($175)|(0))==0; //@line 1549 "src/markdown.c"
   if ($176) { label = 84; break; } else { label = 59; break; } //@line 1549 "src/markdown.c"
  case 59: 
   var $178=HEAP32[(($3)>>2)]; //@line 132 "src/markdown.c"
   var $179=HEAP32[(($18)>>2)]; //@line 132 "src/markdown.c"
   var $180=(($178)>>>(0)) < (($179)>>>(0)); //@line 132 "src/markdown.c"
   if ($180) { label = 60; break; } else { label = 62; break; } //@line 132 "src/markdown.c"
  case 60: 
   var $182=HEAP32[(($19)>>2)]; //@line 132 "src/markdown.c"
   var $183=(($182+($178<<2))|0); //@line 132 "src/markdown.c"
   var $184=HEAP32[(($183)>>2)]; //@line 132 "src/markdown.c"
   var $185=(($184)|(0))==0; //@line 132 "src/markdown.c"
   if ($185) { label = 62; break; } else { label = 61; break; } //@line 132 "src/markdown.c"
  case 61: 
   var $187=((($178)+(1))|0); //@line 134 "src/markdown.c"
   HEAP32[(($3)>>2)]=$187; //@line 134 "src/markdown.c"
   var $188=HEAP32[(($183)>>2)]; //@line 134 "src/markdown.c"
   var $189=$188; //@line 134 "src/markdown.c"
   var $190=(($188+4)|0); //@line 135 "src/markdown.c"
   var $191=$190; //@line 135 "src/markdown.c"
   HEAP32[(($191)>>2)]=0; //@line 135 "src/markdown.c"
   var $work_0_i_i122 = $189;label = 63; break; //@line 136 "src/markdown.c"
  case 62: 
   var $193=_bufnew(256); //@line 137 "src/markdown.c"
   var $194=$193; //@line 138 "src/markdown.c"
   var $195=_stack_push($17, $194); //@line 138 "src/markdown.c"
   var $work_0_i_i122 = $193;label = 63; break;
  case 63: 
   var $work_0_i_i122;
   var $196=(($175)>>>(0)) < (($31)>>>(0)); //@line 1553 "src/markdown.c"
   if ($196) { var $beg_042_i = $175;label = 64; break; } else { var $beg_1_i136 = $175;label = 77; break; } //@line 1553 "src/markdown.c"
  case 64: 
   var $beg_042_i;
   HEAP32[(($25)>>2)]=0; HEAP32[((($25)+(4))>>2)]=0; HEAP32[((($25)+(8))>>2)]=0; HEAP32[((($25)+(12))>>2)]=0; //@line 1555 "src/markdown.c"
   var $_sum279=((($beg_042_i)+($beg_0359))|0); //@line 1557 "src/markdown.c"
   var $197=(($data+$_sum279)|0); //@line 1557 "src/markdown.c"
   var $198=((($31)-($beg_042_i))|0); //@line 1557 "src/markdown.c"
   var $199=_is_codefence($197, $198, $fence_trail_i); //@line 1557 "src/markdown.c"
   var $200=(($199)|(0))==0; //@line 1558 "src/markdown.c"
   if ($200) { var $end_0_in_i125 = $beg_042_i;label = 67; break; } else { label = 65; break; } //@line 1558 "src/markdown.c"
  case 65: 
   var $202=HEAP32[(($26)>>2)]; //@line 1558 "src/markdown.c"
   var $203=(($202)|(0))==0; //@line 1558 "src/markdown.c"
   if ($203) { label = 66; break; } else { var $end_0_in_i125 = $beg_042_i;label = 67; break; } //@line 1558 "src/markdown.c"
  case 66: 
   var $205=((($199)+($beg_042_i))|0); //@line 1559 "src/markdown.c"
   var $beg_1_i136 = $205;label = 77; break; //@line 1560 "src/markdown.c"
  case 67: 
   var $end_0_in_i125;
   var $end_0_i126=((($end_0_in_i125)+(1))|0); //@line 1563 "src/markdown.c"
   var $206=(($end_0_i126)>>>(0)) < (($31)>>>(0)); //@line 1563 "src/markdown.c"
   if ($206) { label = 68; break; } else { var $_lcssa370 = 0;label = 69; break; } //@line 1563 "src/markdown.c"
  case 68: 
   var $_sum281=((($end_0_in_i125)+($beg_0359))|0); //@line 1563 "src/markdown.c"
   var $208=(($data+$_sum281)|0); //@line 1563 "src/markdown.c"
   var $209=HEAP8[($208)]; //@line 1563 "src/markdown.c"
   var $210=(($209 << 24) >> 24)==10; //@line 1563 "src/markdown.c"
   if ($210) { var $_lcssa370 = 1;label = 69; break; } else { var $end_0_in_i125 = $end_0_i126;label = 67; break; }
  case 69: 
   var $_lcssa370;
   var $211=(($beg_042_i)>>>(0)) < (($end_0_i126)>>>(0)); //@line 1565 "src/markdown.c"
   if ($211) { label = 70; break; } else { label = 75; break; } //@line 1565 "src/markdown.c"
  case 70: 
   var $213=((($end_0_i126)-($beg_042_i))|0); //@line 1568 "src/markdown.c"
   var $214=(($end_0_i126)|(0))==(($beg_042_i)|(0)); //@line 1124 "src/markdown.c"
   if ($214) { label = 74; break; } else { var $i_08_i_i129 = 0;label = 71; break; } //@line 1124 "src/markdown.c"
  case 71: 
   var $i_08_i_i129;
   var $_sum280=((($_sum279)+($i_08_i_i129))|0); //@line 1124 "src/markdown.c"
   var $215=(($data+$_sum280)|0); //@line 1124 "src/markdown.c"
   var $216=HEAP8[($215)]; //@line 1124 "src/markdown.c"
   if ((($216 << 24) >> 24)==32) {
    label = 72; break;
   }
   else if ((($216 << 24) >> 24)==10) {
    var $i_0_lcssa_i_i132 = $i_08_i_i129;label = 73; break;
   }
   else {
   label = 76; break;
   }
  case 72: 
   var $218=((($i_08_i_i129)+(1))|0); //@line 1124 "src/markdown.c"
   var $219=(($218)>>>(0)) < (($213)>>>(0)); //@line 1124 "src/markdown.c"
   if ($219) { var $i_08_i_i129 = $218;label = 71; break; } else { var $i_0_lcssa_i_i132 = $218;label = 73; break; } //@line 1124 "src/markdown.c"
  case 73: 
   var $i_0_lcssa_i_i132;
   var $220=(($i_0_lcssa_i_i132)|(0))==-1; //@line 1568 "src/markdown.c"
   if ($220) { label = 76; break; } else { label = 74; break; } //@line 1568 "src/markdown.c"
  case 74: 
   _bufputc($work_0_i_i122, 10); //@line 1569 "src/markdown.c"
   label = 75; break; //@line 1569 "src/markdown.c"
  case 75: 
   if ($_lcssa370) { var $beg_042_i = $end_0_i126;label = 64; break; } else { var $beg_1_i136 = $end_0_i126;label = 77; break; } //@line 1553 "src/markdown.c"
  case 76: 
   _bufput($work_0_i_i122, $197, $213); //@line 1570 "src/markdown.c"
   label = 75; break;
  case 77: 
   var $beg_1_i136;
   var $221=(($work_0_i_i122+4)|0); //@line 1575 "src/markdown.c"
   var $222=HEAP32[(($221)>>2)]; //@line 1575 "src/markdown.c"
   var $223=(($222)|(0))==0; //@line 1575 "src/markdown.c"
   if ($223) { label = 80; break; } else { label = 78; break; } //@line 1575 "src/markdown.c"
  case 78: 
   var $225=((($222)-(1))|0); //@line 1575 "src/markdown.c"
   var $226=(($work_0_i_i122)|0); //@line 1575 "src/markdown.c"
   var $227=HEAP32[(($226)>>2)]; //@line 1575 "src/markdown.c"
   var $228=(($227+$225)|0); //@line 1575 "src/markdown.c"
   var $229=HEAP8[($228)]; //@line 1575 "src/markdown.c"
   var $230=(($229 << 24) >> 24)==10; //@line 1575 "src/markdown.c"
   if ($230) { label = 80; break; } else { label = 79; break; } //@line 1575 "src/markdown.c"
  case 79: 
   _bufputc($work_0_i_i122, 10); //@line 1576 "src/markdown.c"
   label = 80; break; //@line 1576 "src/markdown.c"
  case 80: 
   var $233=HEAP32[(($21)>>2)]; //@line 1578 "src/markdown.c"
   var $234=(($233)|(0))==0; //@line 1578 "src/markdown.c"
   if ($234) { label = 82; break; } else { label = 81; break; } //@line 1578 "src/markdown.c"
  case 81: 
   var $236=HEAP32[(($27)>>2)]; //@line 1579 "src/markdown.c"
   var $237=(($236)|(0))!=0; //@line 1579 "src/markdown.c"
   var $lang__i=$237 ? $lang_i : 0; //@line 1579 "src/markdown.c"
   var $238=HEAP32[(($15)>>2)]; //@line 1579 "src/markdown.c"
   FUNCTION_TABLE[$233]($ob, $work_0_i_i122, $lang__i, $238); //@line 1579 "src/markdown.c"
   label = 82; break; //@line 1579 "src/markdown.c"
  case 82: 
   var $239=HEAP32[(($3)>>2)]; //@line 147 "src/markdown.c"
   var $240=((($239)-(1))|0); //@line 147 "src/markdown.c"
   HEAP32[(($3)>>2)]=$240; //@line 147 "src/markdown.c"
   var $241=(($beg_1_i136)|(0))==0; //@line 2223 "src/markdown.c"
   if ($241) { label = 84; break; } else { label = 83; break; } //@line 2223 "src/markdown.c"
  case 83: 
   var $243=((($beg_1_i136)+($beg_0359))|0); //@line 2224 "src/markdown.c"
   var $beg_0_be = $243;label = 33; break; //@line 2224 "src/markdown.c"
  case 84: 
   var $244=HEAP32[(($10)>>2)]; //@line 2226 "src/markdown.c"
   var $245=$244 & 2; //@line 2226 "src/markdown.c"
   var $246=(($245)|(0))==0; //@line 2226 "src/markdown.c"
   if ($246) { label = 137; break; } else { label = 85; break; } //@line 2226 "src/markdown.c"
  case 85: 
   var $248=HEAP32[(($1)>>2)]; //@line 132 "src/markdown.c"
   var $249=HEAP32[(($12)>>2)]; //@line 132 "src/markdown.c"
   var $250=(($248)>>>(0)) < (($249)>>>(0)); //@line 132 "src/markdown.c"
   if ($250) { label = 86; break; } else { label = 88; break; } //@line 132 "src/markdown.c"
  case 86: 
   var $252=HEAP32[(($13)>>2)]; //@line 132 "src/markdown.c"
   var $253=(($252+($248<<2))|0); //@line 132 "src/markdown.c"
   var $254=HEAP32[(($253)>>2)]; //@line 132 "src/markdown.c"
   var $255=(($254)|(0))==0; //@line 132 "src/markdown.c"
   if ($255) { label = 88; break; } else { label = 87; break; } //@line 132 "src/markdown.c"
  case 87: 
   var $257=((($248)+(1))|0); //@line 134 "src/markdown.c"
   HEAP32[(($1)>>2)]=$257; //@line 134 "src/markdown.c"
   var $258=HEAP32[(($253)>>2)]; //@line 134 "src/markdown.c"
   var $259=$258; //@line 134 "src/markdown.c"
   var $260=(($258+4)|0); //@line 135 "src/markdown.c"
   var $261=$260; //@line 135 "src/markdown.c"
   HEAP32[(($261)>>2)]=0; //@line 135 "src/markdown.c"
   var $work_0_i_i139 = $259;label = 89; break; //@line 136 "src/markdown.c"
  case 88: 
   var $263=_bufnew(64); //@line 137 "src/markdown.c"
   var $264=$263; //@line 138 "src/markdown.c"
   var $265=_stack_push($11, $264); //@line 138 "src/markdown.c"
   var $work_0_i_i139 = $263;label = 89; break;
  case 89: 
   var $work_0_i_i139;
   var $266=HEAP32[(($3)>>2)]; //@line 132 "src/markdown.c"
   var $267=HEAP32[(($18)>>2)]; //@line 132 "src/markdown.c"
   var $268=(($266)>>>(0)) < (($267)>>>(0)); //@line 132 "src/markdown.c"
   if ($268) { label = 90; break; } else { label = 92; break; } //@line 132 "src/markdown.c"
  case 90: 
   var $270=HEAP32[(($19)>>2)]; //@line 132 "src/markdown.c"
   var $271=(($270+($266<<2))|0); //@line 132 "src/markdown.c"
   var $272=HEAP32[(($271)>>2)]; //@line 132 "src/markdown.c"
   var $273=(($272)|(0))==0; //@line 132 "src/markdown.c"
   if ($273) { label = 92; break; } else { label = 91; break; } //@line 132 "src/markdown.c"
  case 91: 
   var $275=((($266)+(1))|0); //@line 134 "src/markdown.c"
   HEAP32[(($3)>>2)]=$275; //@line 134 "src/markdown.c"
   var $276=HEAP32[(($271)>>2)]; //@line 134 "src/markdown.c"
   var $277=$276; //@line 134 "src/markdown.c"
   var $278=(($276+4)|0); //@line 135 "src/markdown.c"
   var $279=$278; //@line 135 "src/markdown.c"
   HEAP32[(($279)>>2)]=0; //@line 135 "src/markdown.c"
   var $work_0_i32_i = $277;label = 93; break; //@line 136 "src/markdown.c"
  case 92: 
   var $281=_bufnew(256); //@line 137 "src/markdown.c"
   var $282=$281; //@line 138 "src/markdown.c"
   var $283=_stack_push($17, $282); //@line 138 "src/markdown.c"
   var $work_0_i32_i = $281;label = 93; break;
  case 93: 
   var $work_0_i32_i;
   var $pipes_0111_i_i = 0;var $i_0112_i_i = 0;label = 94; break; //@line 2052 "src/markdown.c"
  case 94: 
   var $i_0112_i_i;
   var $pipes_0111_i_i;
   var $_sum200=((($i_0112_i_i)+($beg_0359))|0); //@line 2052 "src/markdown.c"
   var $284=(($data+$_sum200)|0); //@line 2052 "src/markdown.c"
   var $285=HEAP8[($284)]; //@line 2052 "src/markdown.c"
   var $286=(($285 << 24) >> 24)==10; //@line 2052 "src/markdown.c"
   if ($286) { var $pipes_0_lcssa_i_i = $pipes_0111_i_i;var $i_0_lcssa_i_i141 = $i_0112_i_i;label = 96; break; } else { label = 95; break; }
  case 95: 
   var $288=((($i_0112_i_i)+(1))|0); //@line 2053 "src/markdown.c"
   var $289=(($285 << 24) >> 24)==124; //@line 2053 "src/markdown.c"
   var $290=(($289)&(1)); //@line 2053 "src/markdown.c"
   var $_pipes_0_i_i=((($290)+($pipes_0111_i_i))|0); //@line 2053 "src/markdown.c"
   var $291=(($288)>>>(0)) < (($31)>>>(0)); //@line 2052 "src/markdown.c"
   if ($291) { var $pipes_0111_i_i = $_pipes_0_i_i;var $i_0112_i_i = $288;label = 94; break; } else { var $pipes_0_lcssa_i_i = $_pipes_0_i_i;var $i_0_lcssa_i_i141 = $288;label = 96; break; } //@line 2052 "src/markdown.c"
  case 96: 
   var $i_0_lcssa_i_i141;
   var $pipes_0_lcssa_i_i;
   var $292=(($i_0_lcssa_i_i141)|(0))==(($31)|(0)); //@line 2056 "src/markdown.c"
   var $293=(($pipes_0_lcssa_i_i)|(0))==0; //@line 2056 "src/markdown.c"
   var $or_cond_i_i142=$292 | $293; //@line 2056 "src/markdown.c"
   if ($or_cond_i_i142) { var $i_3_i = 0;var $388 = 0;label = 135; break; } else { label = 97; break; } //@line 2056 "src/markdown.c"
  case 97: 
   var $294=(($i_0_lcssa_i_i141)|(0))==0; //@line 2061 "src/markdown.c"
   if ($294) { label = 98; break; } else { var $header_end_0107_i_i = $i_0_lcssa_i_i141;label = 99; break; } //@line 2061 "src/markdown.c"
  case 98: 
   var $295=HEAP8[($30)]; //@line 2064 "src/markdown.c"
   var $296=(($295 << 24) >> 24)==124; //@line 2064 "src/markdown.c"
   var $297=(($296 << 31) >> 31); //@line 2064 "src/markdown.c"
   var $_pipes_08189_i_i=((($297)+($pipes_0_lcssa_i_i))|0); //@line 2064 "src/markdown.c"
   var $pipes_2_i_i = $_pipes_08189_i_i;var $header_end_0104_i_i = 0;label = 102; break; //@line 2067 "src/markdown.c"
  case 99: 
   var $header_end_0107_i_i;
   var $298=((($header_end_0107_i_i)-(1))|0); //@line 2061 "src/markdown.c"
   var $_sum201=((($298)+($beg_0359))|0); //@line 2061 "src/markdown.c"
   var $299=(($data+$_sum201)|0); //@line 2061 "src/markdown.c"
   var $300=HEAP8[($299)]; //@line 2061 "src/markdown.c"
   if ((($300 << 24) >> 24)==32 | (($300 << 24) >> 24)==10) {
    label = 100; break;
   }
   else {
   label = 101; break;
   }
  case 100: 
   var $301=(($298)|(0))==0; //@line 2061 "src/markdown.c"
   if ($301) { label = 98; break; } else { var $header_end_0107_i_i = $298;label = 99; break; } //@line 2061 "src/markdown.c"
  case 101: 
   var $303=HEAP8[($30)]; //@line 2064 "src/markdown.c"
   var $304=(($303 << 24) >> 24)==124; //@line 2064 "src/markdown.c"
   var $305=(($304 << 31) >> 31); //@line 2064 "src/markdown.c"
   var $306=(($300 << 24) >> 24)==124; //@line 2067 "src/markdown.c"
   var $307=(($306 << 31) >> 31); //@line 2067 "src/markdown.c"
   var $_pipes_081_i_i=((($307)+($pipes_0_lcssa_i_i))|0); //@line 2064 "src/markdown.c"
   var $__pipes_081_i_i=((($_pipes_081_i_i)+($305))|0); //@line 2067 "src/markdown.c"
   var $pipes_2_i_i = $__pipes_081_i_i;var $header_end_0104_i_i = $header_end_0107_i_i;label = 102; break; //@line 2067 "src/markdown.c"
  case 102: 
   var $header_end_0104_i_i;
   var $pipes_2_i_i;
   var $309=((($pipes_2_i_i)+(1))|0); //@line 2070 "src/markdown.c"
   var $310=_calloc($309, 4); //@line 2071 "src/markdown.c"
   var $311=$310; //@line 2071 "src/markdown.c"
   var $312=((($i_0_lcssa_i_i141)+(1))|0); //@line 2074 "src/markdown.c"
   var $313=(($312)>>>(0)) < (($31)>>>(0)); //@line 2075 "src/markdown.c"
   if ($313) { label = 103; break; } else { var $i_1_i_i145 = $312;label = 104; break; } //@line 2075 "src/markdown.c"
  case 103: 
   var $_sum278=((($312)+($beg_0359))|0); //@line 2075 "src/markdown.c"
   var $315=(($data+$_sum278)|0); //@line 2075 "src/markdown.c"
   var $316=HEAP8[($315)]; //@line 2075 "src/markdown.c"
   var $317=(($316 << 24) >> 24)==124; //@line 2075 "src/markdown.c"
   var $318=((($i_0_lcssa_i_i141)+(2))|0); //@line 2076 "src/markdown.c"
   var $__i_i144=$317 ? $318 : $312; //@line 2075 "src/markdown.c"
   var $i_1_i_i145 = $__i_i144;label = 104; break; //@line 2075 "src/markdown.c"
  case 104: 
   var $i_1_i_i145;
   var $under_end_0_i_i = $i_1_i_i145;label = 105; break; //@line 2079 "src/markdown.c"
  case 105: 
   var $under_end_0_i_i;
   var $321=(($under_end_0_i_i)>>>(0)) < (($31)>>>(0)); //@line 2079 "src/markdown.c"
   if ($321) { label = 107; break; } else { label = 106; break; } //@line 2079 "src/markdown.c"
  case 106: 
   var $322=(($309)|(0))!=0; //@line 2082 "src/markdown.c"
   var $323=(($i_1_i_i145)>>>(0)) < (($under_end_0_i_i)>>>(0)); //@line 2082 "src/markdown.c"
   var $or_cond8298_i_i=$322 & $323; //@line 2082 "src/markdown.c"
   if ($or_cond8298_i_i) { var $i_299_i_i = $i_1_i_i145;var $col_0100_i_i = 0;label = 108; break; } else { var $col_0_lcssa_i_i = 0;label = 125; break; } //@line 2082 "src/markdown.c"
  case 107: 
   var $_sum277=((($under_end_0_i_i)+($beg_0359))|0); //@line 2079 "src/markdown.c"
   var $325=(($data+$_sum277)|0); //@line 2079 "src/markdown.c"
   var $326=HEAP8[($325)]; //@line 2079 "src/markdown.c"
   var $327=(($326 << 24) >> 24)==10; //@line 2079 "src/markdown.c"
   var $328=((($under_end_0_i_i)+(1))|0); //@line 2080 "src/markdown.c"
   if ($327) { label = 106; break; } else { var $under_end_0_i_i = $328;label = 105; break; }
  case 108: 
   var $col_0100_i_i;
   var $i_299_i_i;
   var $i_3_i_i147 = $i_299_i_i;label = 109; break; //@line 2085 "src/markdown.c"
  case 109: 
   var $i_3_i_i147;
   var $330=(($i_3_i_i147)>>>(0)) < (($under_end_0_i_i)>>>(0)); //@line 2085 "src/markdown.c"
   var $_sum274=((($i_3_i_i147)+($beg_0359))|0); //@line 2085 "src/markdown.c"
   var $331=(($data+$_sum274)|0); //@line 2085 "src/markdown.c"
   var $332=HEAP8[($331)]; //@line 2085 "src/markdown.c"
   if ($330) { label = 110; break; } else { label = 111; break; } //@line 2085 "src/markdown.c"
  case 110: 
   var $334=((($i_3_i_i147)+(1))|0); //@line 2086 "src/markdown.c"
   if ((($332 << 24) >> 24)==32) {
    var $i_3_i_i147 = $334;label = 109; break;
   }
   else if ((($332 << 24) >> 24)==58) {
    var $_pre_phi_i149 = $334;label = 113; break;
   }
   else {
   var $dashes_0_ph_i_i = 0;var $i_4_ph_i_i = $i_3_i_i147;label = 114; break;
   }
  case 111: 
   var $335=(($332 << 24) >> 24)==58; //@line 2088 "src/markdown.c"
   if ($335) { label = 112; break; } else { var $dashes_0_ph_i_i = 0;var $i_4_ph_i_i = $i_3_i_i147;label = 114; break; } //@line 2088 "src/markdown.c"
  case 112: 
   var $_pre_i148=((($i_3_i_i147)+(1))|0); //@line 2089 "src/markdown.c"
   var $_pre_phi_i149 = $_pre_i148;label = 113; break; //@line 2088 "src/markdown.c"
  case 113: 
   var $_pre_phi_i149; //@line 2089 "src/markdown.c"
   var $336=(($311+($col_0100_i_i<<2))|0); //@line 2089 "src/markdown.c"
   var $337=HEAP32[(($336)>>2)]; //@line 2089 "src/markdown.c"
   var $338=$337 | 1; //@line 2089 "src/markdown.c"
   HEAP32[(($336)>>2)]=$338; //@line 2089 "src/markdown.c"
   var $dashes_0_ph_i_i = 1;var $i_4_ph_i_i = $_pre_phi_i149;label = 114; break; //@line 2091 "src/markdown.c"
  case 114: 
   var $i_4_ph_i_i;
   var $dashes_0_ph_i_i;
   var $339=(($i_4_ph_i_i)>>>(0)) < (($under_end_0_i_i)>>>(0)); //@line 2093 "src/markdown.c"
   if ($339) { var $i_493_i_i = $i_4_ph_i_i;var $dashes_094_i_i = $dashes_0_ph_i_i;label = 115; break; } else { var $dashes_1_ph_i_i = $dashes_0_ph_i_i;var $i_5_ph_i_i = $i_4_ph_i_i;label = 118; break; } //@line 2093 "src/markdown.c"
  case 115: 
   var $dashes_094_i_i;
   var $i_493_i_i;
   var $_sum276=((($i_493_i_i)+($beg_0359))|0); //@line 2093 "src/markdown.c"
   var $340=(($data+$_sum276)|0); //@line 2093 "src/markdown.c"
   var $341=HEAP8[($340)]; //@line 2093 "src/markdown.c"
   if ((($341 << 24) >> 24)==45) {
    label = 116; break;
   }
   else if ((($341 << 24) >> 24)==58) {
    label = 117; break;
   }
   else {
   var $dashes_1_ph_i_i = $dashes_094_i_i;var $i_5_ph_i_i = $i_493_i_i;label = 118; break;
   }
  case 116: 
   var $343=((($i_493_i_i)+(1))|0); //@line 2094 "src/markdown.c"
   var $344=((($dashes_094_i_i)+(1))|0); //@line 2094 "src/markdown.c"
   var $345=(($343)>>>(0)) < (($under_end_0_i_i)>>>(0)); //@line 2093 "src/markdown.c"
   if ($345) { var $i_493_i_i = $343;var $dashes_094_i_i = $344;label = 115; break; } else { var $dashes_1_ph_i_i = $344;var $i_5_ph_i_i = $343;label = 118; break; } //@line 2093 "src/markdown.c"
  case 117: 
   var $347=((($i_493_i_i)+(1))|0); //@line 2098 "src/markdown.c"
   var $348=(($311+($col_0100_i_i<<2))|0); //@line 2098 "src/markdown.c"
   var $349=HEAP32[(($348)>>2)]; //@line 2098 "src/markdown.c"
   var $350=$349 | 2; //@line 2098 "src/markdown.c"
   HEAP32[(($348)>>2)]=$350; //@line 2098 "src/markdown.c"
   var $351=((($dashes_094_i_i)+(1))|0); //@line 2099 "src/markdown.c"
   var $dashes_1_ph_i_i = $351;var $i_5_ph_i_i = $347;label = 118; break; //@line 2100 "src/markdown.c"
  case 118: 
   var $i_5_ph_i_i;
   var $dashes_1_ph_i_i;
   var $i_5_i_i = $i_5_ph_i_i;label = 119; break; //@line 2102 "src/markdown.c"
  case 119: 
   var $i_5_i_i;
   var $352=(($i_5_i_i)>>>(0)) < (($under_end_0_i_i)>>>(0)); //@line 2102 "src/markdown.c"
   if ($352) { label = 120; break; } else { label = 122; break; } //@line 2102 "src/markdown.c"
  case 120: 
   var $_sum275=((($i_5_i_i)+($beg_0359))|0); //@line 2102 "src/markdown.c"
   var $354=(($data+$_sum275)|0); //@line 2102 "src/markdown.c"
   var $355=HEAP8[($354)]; //@line 2102 "src/markdown.c"
   var $356=(($355 << 24) >> 24)==32; //@line 2102 "src/markdown.c"
   var $357=((($i_5_i_i)+(1))|0); //@line 2103 "src/markdown.c"
   if ($356) { var $i_5_i_i = $357;label = 119; break; } else { label = 121; break; }
  case 121: 
   var $359=(($355 << 24) >> 24)!=124; //@line 2105 "src/markdown.c"
   var $360=(($dashes_1_ph_i_i)>>>(0)) < 3; //@line 2108 "src/markdown.c"
   var $or_cond88_i_i=$359 | $360; //@line 2105 "src/markdown.c"
   if ($or_cond88_i_i) { var $col_0_lcssa_i_i = $col_0100_i_i;label = 125; break; } else { var $_pre_phi_i_i = $357;label = 124; break; } //@line 2105 "src/markdown.c"
  case 122: 
   var $_old_i_i=(($dashes_1_ph_i_i)>>>(0)) < 3; //@line 2108 "src/markdown.c"
   if ($_old_i_i) { var $col_0_lcssa_i_i = $col_0100_i_i;label = 125; break; } else { label = 123; break; } //@line 2108 "src/markdown.c"
  case 123: 
   var $_pre135_i_i=((($i_5_i_i)+(1))|0); //@line 2111 "src/markdown.c"
   var $_pre_phi_i_i = $_pre135_i_i;label = 124; break; //@line 2108 "src/markdown.c"
  case 124: 
   var $_pre_phi_i_i; //@line 2111 "src/markdown.c"
   var $361=((($col_0100_i_i)+(1))|0); //@line 2082 "src/markdown.c"
   var $362=(($361)>>>(0)) < (($309)>>>(0)); //@line 2082 "src/markdown.c"
   var $363=(($_pre_phi_i_i)>>>(0)) < (($under_end_0_i_i)>>>(0)); //@line 2082 "src/markdown.c"
   var $or_cond82_i_i=$362 & $363; //@line 2082 "src/markdown.c"
   if ($or_cond82_i_i) { var $i_299_i_i = $_pre_phi_i_i;var $col_0100_i_i = $361;label = 108; break; } else { var $col_0_lcssa_i_i = $361;label = 125; break; } //@line 2082 "src/markdown.c"
  case 125: 
   var $col_0_lcssa_i_i;
   var $364=(($col_0_lcssa_i_i)>>>(0)) < (($309)>>>(0)); //@line 2114 "src/markdown.c"
   if ($364) { var $i_3_i = 0;var $388 = $311;label = 135; break; } else { label = 126; break; } //@line 2114 "src/markdown.c"
  case 126: 
   _parse_table_row($work_0_i_i139, $rndr, $30, $header_end_0104_i_i, $309, $311, 4); //@line 2117 "src/markdown.c"
   var $365=((($under_end_0_i_i)+(1))|0); //@line 2125 "src/markdown.c"
   var $366=(($365)|(0))==0; //@line 2147 "src/markdown.c"
   if ($366) { var $i_3_i = 0;var $388 = $311;label = 135; break; } else { label = 127; break; } //@line 2147 "src/markdown.c"
  case 127: 
   var $367=(($365)>>>(0)) < (($31)>>>(0)); //@line 2149 "src/markdown.c"
   if ($367) { var $i_046_i = $365;label = 128; break; } else { var $i_0_lcssa_i157 = $365;label = 133; break; } //@line 2149 "src/markdown.c"
  case 128: 
   var $i_046_i;
   var $368=(($i_046_i)>>>(0)) < (($31)>>>(0)); //@line 2155 "src/markdown.c"
   if ($368) { var $i_142_i = $i_046_i;var $pipes_043_i = 0;label = 129; break; } else { var $i_0_lcssa_i157 = $i_046_i;label = 133; break; } //@line 2155 "src/markdown.c"
  case 129: 
   var $pipes_043_i;
   var $i_142_i;
   var $_sum272=((($i_142_i)+($beg_0359))|0); //@line 2155 "src/markdown.c"
   var $369=(($data+$_sum272)|0); //@line 2155 "src/markdown.c"
   var $370=HEAP8[($369)]; //@line 2155 "src/markdown.c"
   var $371=(($370 << 24) >> 24)==10; //@line 2155 "src/markdown.c"
   if ($371) { var $i_1_lcssa_i = $i_142_i;var $pipes_0_lcssa_i = $pipes_043_i;label = 131; break; } else { label = 130; break; }
  case 130: 
   var $373=((($i_142_i)+(1))|0); //@line 2156 "src/markdown.c"
   var $374=(($370 << 24) >> 24)==124; //@line 2156 "src/markdown.c"
   var $375=(($374)&(1)); //@line 2156 "src/markdown.c"
   var $_pipes_0_i=((($375)+($pipes_043_i))|0); //@line 2156 "src/markdown.c"
   var $376=(($373)>>>(0)) < (($31)>>>(0)); //@line 2155 "src/markdown.c"
   if ($376) { var $i_142_i = $373;var $pipes_043_i = $_pipes_0_i;label = 129; break; } else { var $i_1_lcssa_i = $373;var $pipes_0_lcssa_i = $_pipes_0_i;label = 131; break; } //@line 2155 "src/markdown.c"
  case 131: 
   var $pipes_0_lcssa_i;
   var $i_1_lcssa_i;
   var $377=(($pipes_0_lcssa_i)|(0))==0; //@line 2159 "src/markdown.c"
   var $378=(($i_1_lcssa_i)|(0))==(($31)|(0)); //@line 2159 "src/markdown.c"
   var $or_cond_i155=$377 | $378; //@line 2159 "src/markdown.c"
   if ($or_cond_i155) { var $i_0_lcssa_i157 = $i_046_i;label = 133; break; } else { label = 132; break; } //@line 2159 "src/markdown.c"
  case 132: 
   var $_sum273=((($i_046_i)+($beg_0359))|0); //@line 2164 "src/markdown.c"
   var $380=(($data+$_sum273)|0); //@line 2164 "src/markdown.c"
   var $381=((($i_1_lcssa_i)-($i_046_i))|0); //@line 2164 "src/markdown.c"
   _parse_table_row($work_0_i32_i, $rndr, $380, $381, $309, $311, 0); //@line 2164 "src/markdown.c"
   var $382=((($i_1_lcssa_i)+(1))|0); //@line 2173 "src/markdown.c"
   var $383=(($382)>>>(0)) < (($31)>>>(0)); //@line 2149 "src/markdown.c"
   if ($383) { var $i_046_i = $382;label = 128; break; } else { var $i_0_lcssa_i157 = $382;label = 133; break; } //@line 2149 "src/markdown.c"
  case 133: 
   var $i_0_lcssa_i157;
   var $384=HEAP32[(($23)>>2)]; //@line 2176 "src/markdown.c"
   var $385=(($384)|(0))==0; //@line 2176 "src/markdown.c"
   if ($385) { var $i_3_i = $i_0_lcssa_i157;var $388 = $311;label = 135; break; } else { label = 134; break; } //@line 2176 "src/markdown.c"
  case 134: 
   var $387=HEAP32[(($15)>>2)]; //@line 2177 "src/markdown.c"
   FUNCTION_TABLE[$384]($ob, $work_0_i_i139, $work_0_i32_i, $387); //@line 2177 "src/markdown.c"
   var $i_3_i = $i_0_lcssa_i157;var $388 = $311;label = 135; break; //@line 2177 "src/markdown.c"
  case 135: 
   var $388;
   var $i_3_i;
   var $389=$388; //@line 2180 "src/markdown.c"
   _free($389); //@line 2180 "src/markdown.c"
   var $390=HEAP32[(($1)>>2)]; //@line 147 "src/markdown.c"
   var $391=((($390)-(1))|0); //@line 147 "src/markdown.c"
   HEAP32[(($1)>>2)]=$391; //@line 147 "src/markdown.c"
   var $392=HEAP32[(($3)>>2)]; //@line 147 "src/markdown.c"
   var $393=((($392)-(1))|0); //@line 147 "src/markdown.c"
   HEAP32[(($3)>>2)]=$393; //@line 147 "src/markdown.c"
   var $394=(($i_3_i)|(0))==0; //@line 2227 "src/markdown.c"
   if ($394) { label = 137; break; } else { label = 136; break; } //@line 2227 "src/markdown.c"
  case 136: 
   var $396=((($i_3_i)+($beg_0359))|0); //@line 2228 "src/markdown.c"
   var $beg_0_be = $396;label = 33; break; //@line 2228 "src/markdown.c"
  case 137: 
   var $398=HEAP8[($30)]; //@line 1310 "src/markdown.c"
   var $399=(($398 << 24) >> 24)==32; //@line 1310 "src/markdown.c"
   var $__i92=(($399)&(1)); //@line 1310 "src/markdown.c"
   var $400=(($__i92)>>>(0)) < (($31)>>>(0)); //@line 1311 "src/markdown.c"
   if ($400) { label = 138; break; } else { var $i_1_i95 = $__i92;label = 139; break; } //@line 1311 "src/markdown.c"
  case 138: 
   var $_sum271=((($__i92)+($beg_0359))|0); //@line 1311 "src/markdown.c"
   var $402=(($data+$_sum271)|0); //@line 1311 "src/markdown.c"
   var $403=HEAP8[($402)]; //@line 1311 "src/markdown.c"
   var $404=(($403 << 24) >> 24)==32; //@line 1311 "src/markdown.c"
   var $405=(($404)&(1)); //@line 1311 "src/markdown.c"
   var $_i_0_i94=((($405)+($__i92))|0); //@line 1311 "src/markdown.c"
   var $i_1_i95 = $_i_0_i94;label = 139; break; //@line 1311 "src/markdown.c"
  case 139: 
   var $i_1_i95;
   var $407=(($i_1_i95)>>>(0)) < (($31)>>>(0)); //@line 1312 "src/markdown.c"
   if ($407) { label = 140; break; } else { var $i_2_i97 = $i_1_i95;label = 141; break; } //@line 1312 "src/markdown.c"
  case 140: 
   var $_sum270=((($i_1_i95)+($beg_0359))|0); //@line 1312 "src/markdown.c"
   var $409=(($data+$_sum270)|0); //@line 1312 "src/markdown.c"
   var $410=HEAP8[($409)]; //@line 1312 "src/markdown.c"
   var $411=(($410 << 24) >> 24)==32; //@line 1312 "src/markdown.c"
   var $412=(($411)&(1)); //@line 1312 "src/markdown.c"
   var $_i_1_i96=((($412)+($i_1_i95))|0); //@line 1312 "src/markdown.c"
   var $i_2_i97 = $_i_1_i96;label = 141; break; //@line 1312 "src/markdown.c"
  case 141: 
   var $i_2_i97;
   var $414=(($i_2_i97)>>>(0)) < (($31)>>>(0)); //@line 1314 "src/markdown.c"
   if ($414) { label = 142; break; } else { label = 195; break; } //@line 1314 "src/markdown.c"
  case 142: 
   var $_sum254=((($i_2_i97)+($beg_0359))|0); //@line 1314 "src/markdown.c"
   var $416=(($data+$_sum254)|0); //@line 1314 "src/markdown.c"
   var $417=HEAP8[($416)]; //@line 1314 "src/markdown.c"
   var $418=(($417 << 24) >> 24)==62; //@line 1314 "src/markdown.c"
   if ($418) { label = 143; break; } else { label = 195; break; } //@line 1314 "src/markdown.c"
  case 143: 
   var $420=((($i_2_i97)+(1))|0); //@line 1315 "src/markdown.c"
   var $421=(($420)>>>(0)) < (($31)>>>(0)); //@line 1315 "src/markdown.c"
   if ($421) { label = 144; break; } else { var $427 = $420;label = 145; break; } //@line 1315 "src/markdown.c"
  case 144: 
   var $_sum269=((($420)+($beg_0359))|0); //@line 1315 "src/markdown.c"
   var $423=(($data+$_sum269)|0); //@line 1315 "src/markdown.c"
   var $424=HEAP8[($423)]; //@line 1315 "src/markdown.c"
   var $425=(($424 << 24) >> 24)==32; //@line 1315 "src/markdown.c"
   var $426=((($i_2_i97)+(2))|0); //@line 1316 "src/markdown.c"
   var $_25_i=$425 ? $426 : $420; //@line 1315 "src/markdown.c"
   var $427 = $_25_i;label = 145; break;
  case 145: 
   var $427;
   var $428=(($427)|(0))==0; //@line 2230 "src/markdown.c"
   if ($428) { label = 195; break; } else { label = 146; break; } //@line 2230 "src/markdown.c"
  case 146: 
   var $430=HEAP32[(($3)>>2)]; //@line 132 "src/markdown.c"
   var $431=HEAP32[(($18)>>2)]; //@line 132 "src/markdown.c"
   var $432=(($430)>>>(0)) < (($431)>>>(0)); //@line 132 "src/markdown.c"
   if ($432) { label = 147; break; } else { label = 149; break; } //@line 132 "src/markdown.c"
  case 147: 
   var $434=HEAP32[(($19)>>2)]; //@line 132 "src/markdown.c"
   var $435=(($434+($430<<2))|0); //@line 132 "src/markdown.c"
   var $436=HEAP32[(($435)>>2)]; //@line 132 "src/markdown.c"
   var $437=(($436)|(0))==0; //@line 132 "src/markdown.c"
   if ($437) { label = 149; break; } else { label = 148; break; } //@line 132 "src/markdown.c"
  case 148: 
   var $439=((($430)+(1))|0); //@line 134 "src/markdown.c"
   HEAP32[(($3)>>2)]=$439; //@line 134 "src/markdown.c"
   var $440=HEAP32[(($435)>>2)]; //@line 134 "src/markdown.c"
   var $441=$440; //@line 134 "src/markdown.c"
   var $442=(($440+4)|0); //@line 135 "src/markdown.c"
   var $443=$442; //@line 135 "src/markdown.c"
   HEAP32[(($443)>>2)]=0; //@line 135 "src/markdown.c"
   var $work_0_i_i158 = $441;label = 150; break; //@line 136 "src/markdown.c"
  case 149: 
   var $445=_bufnew(256); //@line 137 "src/markdown.c"
   var $446=$445; //@line 138 "src/markdown.c"
   var $447=_stack_push($17, $446); //@line 138 "src/markdown.c"
   var $work_0_i_i158 = $445;label = 150; break;
  case 150: 
   var $work_0_i_i158;
   var $work_data_0_i_ph = 0;var $work_size_0_i_ph = 0;var $end_0_i160_ph = 0;label = 151; break; //@line 1396 "src/markdown.c"
  case 151: 
   var $end_0_i160_ph;
   var $work_size_0_i_ph;
   var $work_data_0_i_ph;
   var $end_0_i160 = $end_0_i160_ph;label = 152; break;
  case 152: 
   var $end_0_i160;
   var $449=(($end_0_i160)>>>(0)) < (($31)>>>(0)); //@line 1396 "src/markdown.c"
   if ($449) { var $end_1_in_i161 = $end_0_i160;label = 153; break; } else { var $end_2_i177 = $end_0_i160;label = 192; break; } //@line 1396 "src/markdown.c"
  case 153: 
   var $end_1_in_i161;
   var $end_1_i162=((($end_1_in_i161)+(1))|0); //@line 1397 "src/markdown.c"
   var $450=(($end_1_i162)>>>(0)) < (($31)>>>(0)); //@line 1397 "src/markdown.c"
   if ($450) { label = 154; break; } else { var $_lcssa390 = 0;label = 155; break; } //@line 1397 "src/markdown.c"
  case 154: 
   var $_sum268=((($end_1_in_i161)+($beg_0359))|0); //@line 1397 "src/markdown.c"
   var $452=(($data+$_sum268)|0); //@line 1397 "src/markdown.c"
   var $453=HEAP8[($452)]; //@line 1397 "src/markdown.c"
   var $454=(($453 << 24) >> 24)==10; //@line 1397 "src/markdown.c"
   if ($454) { var $_lcssa390 = 1;label = 155; break; } else { var $end_1_in_i161 = $end_1_i162;label = 153; break; }
  case 155: 
   var $_lcssa390;
   var $_sum255=((($end_0_i160)+($beg_0359))|0); //@line 1399 "src/markdown.c"
   var $455=((($end_1_i162)-($end_0_i160))|0); //@line 1399 "src/markdown.c"
   var $456=(($end_1_i162)|(0))==(($end_0_i160)|(0)); //@line 1310 "src/markdown.c"
   if ($456) { var $i_0_i_i165 = 0;label = 157; break; } else { label = 156; break; } //@line 1310 "src/markdown.c"
  case 156: 
   var $458=(($data+$_sum255)|0); //@line 1399 "src/markdown.c"
   var $459=HEAP8[($458)]; //@line 1310 "src/markdown.c"
   var $460=(($459 << 24) >> 24)==32; //@line 1310 "src/markdown.c"
   var $__i_i164=(($460)&(1)); //@line 1310 "src/markdown.c"
   var $i_0_i_i165 = $__i_i164;label = 157; break; //@line 1310 "src/markdown.c"
  case 157: 
   var $i_0_i_i165;
   var $462=(($i_0_i_i165)>>>(0)) < (($455)>>>(0)); //@line 1311 "src/markdown.c"
   if ($462) { label = 158; break; } else { var $i_1_i_i167 = $i_0_i_i165;label = 159; break; } //@line 1311 "src/markdown.c"
  case 158: 
   var $_sum267=((($i_0_i_i165)+($_sum255))|0); //@line 1311 "src/markdown.c"
   var $464=(($data+$_sum267)|0); //@line 1311 "src/markdown.c"
   var $465=HEAP8[($464)]; //@line 1311 "src/markdown.c"
   var $466=(($465 << 24) >> 24)==32; //@line 1311 "src/markdown.c"
   var $467=(($466)&(1)); //@line 1311 "src/markdown.c"
   var $_i_0_i_i166=((($467)+($i_0_i_i165))|0); //@line 1311 "src/markdown.c"
   var $i_1_i_i167 = $_i_0_i_i166;label = 159; break; //@line 1311 "src/markdown.c"
  case 159: 
   var $i_1_i_i167;
   var $469=(($i_1_i_i167)>>>(0)) < (($455)>>>(0)); //@line 1312 "src/markdown.c"
   if ($469) { label = 160; break; } else { var $i_2_i_i169 = $i_1_i_i167;label = 161; break; } //@line 1312 "src/markdown.c"
  case 160: 
   var $_sum266=((($i_1_i_i167)+($_sum255))|0); //@line 1312 "src/markdown.c"
   var $471=(($data+$_sum266)|0); //@line 1312 "src/markdown.c"
   var $472=HEAP8[($471)]; //@line 1312 "src/markdown.c"
   var $473=(($472 << 24) >> 24)==32; //@line 1312 "src/markdown.c"
   var $474=(($473)&(1)); //@line 1312 "src/markdown.c"
   var $_i_1_i_i168=((($474)+($i_1_i_i167))|0); //@line 1312 "src/markdown.c"
   var $i_2_i_i169 = $_i_1_i_i168;label = 161; break; //@line 1312 "src/markdown.c"
  case 161: 
   var $i_2_i_i169;
   var $476=(($i_2_i_i169)>>>(0)) < (($455)>>>(0)); //@line 1314 "src/markdown.c"
   if ($476) { label = 162; break; } else { label = 167; break; } //@line 1314 "src/markdown.c"
  case 162: 
   var $_sum264=((($i_2_i_i169)+($_sum255))|0); //@line 1314 "src/markdown.c"
   var $478=(($data+$_sum264)|0); //@line 1314 "src/markdown.c"
   var $479=HEAP8[($478)]; //@line 1314 "src/markdown.c"
   var $480=(($479 << 24) >> 24)==62; //@line 1314 "src/markdown.c"
   if ($480) { label = 163; break; } else { label = 167; break; } //@line 1314 "src/markdown.c"
  case 163: 
   var $482=((($i_2_i_i169)+(1))|0); //@line 1315 "src/markdown.c"
   var $483=(($482)>>>(0)) < (($455)>>>(0)); //@line 1315 "src/markdown.c"
   if ($483) { label = 164; break; } else { var $489 = $482;label = 165; break; } //@line 1315 "src/markdown.c"
  case 164: 
   var $_sum265=((($482)+($_sum255))|0); //@line 1315 "src/markdown.c"
   var $485=(($data+$_sum265)|0); //@line 1315 "src/markdown.c"
   var $486=HEAP8[($485)]; //@line 1315 "src/markdown.c"
   var $487=(($486 << 24) >> 24)==32; //@line 1315 "src/markdown.c"
   var $488=((($i_2_i_i169)+(2))|0); //@line 1316 "src/markdown.c"
   var $_25_i_i170=$487 ? $488 : $482; //@line 1315 "src/markdown.c"
   var $489 = $_25_i_i170;label = 165; break;
  case 165: 
   var $489;
   var $490=(($489)|(0))==0; //@line 1401 "src/markdown.c"
   if ($490) { label = 167; break; } else { label = 166; break; } //@line 1401 "src/markdown.c"
  case 166: 
   var $492=((($489)+($end_0_i160))|0); //@line 1402 "src/markdown.c"
   var $beg_1_i176 = $492;var $end_1_i162389 = $end_1_i162;label = 187; break; //@line 1402 "src/markdown.c"
  case 167: 
   if ($456) { label = 171; break; } else { var $i_08_i_i172 = 0;label = 168; break; } //@line 1124 "src/markdown.c"
  case 168: 
   var $i_08_i_i172;
   var $_sum256=((($i_08_i_i172)+($_sum255))|0); //@line 1124 "src/markdown.c"
   var $493=(($data+$_sum256)|0); //@line 1124 "src/markdown.c"
   var $494=HEAP8[($493)]; //@line 1124 "src/markdown.c"
   if ((($494 << 24) >> 24)==32) {
    label = 169; break;
   }
   else if ((($494 << 24) >> 24)==10) {
    var $i_0_lcssa_i_i174 = $i_08_i_i172;label = 170; break;
   }
   else {
   var $beg_1_i176 = $end_0_i160;var $end_1_i162389 = $end_1_i162;label = 187; break;
   }
  case 169: 
   var $496=((($i_08_i_i172)+(1))|0); //@line 1124 "src/markdown.c"
   var $497=(($496)>>>(0)) < (($455)>>>(0)); //@line 1124 "src/markdown.c"
   if ($497) { var $i_08_i_i172 = $496;label = 168; break; } else { var $i_0_lcssa_i_i174 = $496;label = 170; break; } //@line 1124 "src/markdown.c"
  case 170: 
   var $i_0_lcssa_i_i174;
   var $498=(($i_0_lcssa_i_i174)|(0))==-1; //@line 1405 "src/markdown.c"
   if ($498) { var $beg_1_i176 = $end_0_i160;var $end_1_i162389 = $end_1_i162;label = 187; break; } else { label = 171; break; } //@line 1405 "src/markdown.c"
  case 171: 
   if ($_lcssa390) { label = 172; break; } else { var $end_2_i177 = $end_1_i162;label = 192; break; } //@line 1405 "src/markdown.c"
  case 172: 
   var $_sum257=((($end_1_i162)+($beg_0359))|0); //@line 1406 "src/markdown.c"
   var $500=((($31)-($end_1_i162))|0); //@line 1406 "src/markdown.c"
   var $501=(($31)|(0))==(($end_1_i162)|(0)); //@line 1310 "src/markdown.c"
   if ($501) { var $i_0_i54_i = 0;label = 174; break; } else { label = 173; break; } //@line 1310 "src/markdown.c"
  case 173: 
   var $503=(($data+$_sum257)|0); //@line 1406 "src/markdown.c"
   var $504=HEAP8[($503)]; //@line 1310 "src/markdown.c"
   var $505=(($504 << 24) >> 24)==32; //@line 1310 "src/markdown.c"
   var $__i53_i=(($505)&(1)); //@line 1310 "src/markdown.c"
   var $i_0_i54_i = $__i53_i;label = 174; break; //@line 1310 "src/markdown.c"
  case 174: 
   var $i_0_i54_i;
   var $507=(($i_0_i54_i)>>>(0)) < (($500)>>>(0)); //@line 1311 "src/markdown.c"
   if ($507) { label = 175; break; } else { var $i_1_i56_i = $i_0_i54_i;label = 176; break; } //@line 1311 "src/markdown.c"
  case 175: 
   var $_sum263=((($i_0_i54_i)+($_sum257))|0); //@line 1311 "src/markdown.c"
   var $509=(($data+$_sum263)|0); //@line 1311 "src/markdown.c"
   var $510=HEAP8[($509)]; //@line 1311 "src/markdown.c"
   var $511=(($510 << 24) >> 24)==32; //@line 1311 "src/markdown.c"
   var $512=(($511)&(1)); //@line 1311 "src/markdown.c"
   var $_i_0_i55_i=((($512)+($i_0_i54_i))|0); //@line 1311 "src/markdown.c"
   var $i_1_i56_i = $_i_0_i55_i;label = 176; break; //@line 1311 "src/markdown.c"
  case 176: 
   var $i_1_i56_i;
   var $514=(($i_1_i56_i)>>>(0)) < (($500)>>>(0)); //@line 1312 "src/markdown.c"
   if ($514) { label = 177; break; } else { var $i_2_i58_i = $i_1_i56_i;label = 178; break; } //@line 1312 "src/markdown.c"
  case 177: 
   var $_sum262=((($i_1_i56_i)+($_sum257))|0); //@line 1312 "src/markdown.c"
   var $516=(($data+$_sum262)|0); //@line 1312 "src/markdown.c"
   var $517=HEAP8[($516)]; //@line 1312 "src/markdown.c"
   var $518=(($517 << 24) >> 24)==32; //@line 1312 "src/markdown.c"
   var $519=(($518)&(1)); //@line 1312 "src/markdown.c"
   var $_i_1_i57_i=((($519)+($i_1_i56_i))|0); //@line 1312 "src/markdown.c"
   var $i_2_i58_i = $_i_1_i57_i;label = 178; break; //@line 1312 "src/markdown.c"
  case 178: 
   var $i_2_i58_i;
   var $521=(($i_2_i58_i)>>>(0)) < (($500)>>>(0)); //@line 1314 "src/markdown.c"
   if ($521) { label = 179; break; } else { label = 183; break; } //@line 1314 "src/markdown.c"
  case 179: 
   var $_sum260=((($i_2_i58_i)+($_sum257))|0); //@line 1314 "src/markdown.c"
   var $523=(($data+$_sum260)|0); //@line 1314 "src/markdown.c"
   var $524=HEAP8[($523)]; //@line 1314 "src/markdown.c"
   var $525=(($524 << 24) >> 24)==62; //@line 1314 "src/markdown.c"
   if ($525) { label = 180; break; } else { label = 183; break; } //@line 1314 "src/markdown.c"
  case 180: 
   var $527=((($i_2_i58_i)+(1))|0); //@line 1315 "src/markdown.c"
   var $528=(($527)>>>(0)) < (($500)>>>(0)); //@line 1315 "src/markdown.c"
   if ($528) { label = 181; break; } else { var $534 = $527;label = 182; break; } //@line 1315 "src/markdown.c"
  case 181: 
   var $_sum261=((($527)+($_sum257))|0); //@line 1315 "src/markdown.c"
   var $530=(($data+$_sum261)|0); //@line 1315 "src/markdown.c"
   var $531=HEAP8[($530)]; //@line 1315 "src/markdown.c"
   var $532=(($531 << 24) >> 24)==32; //@line 1315 "src/markdown.c"
   var $533=((($i_2_i58_i)+(2))|0); //@line 1316 "src/markdown.c"
   var $_25_i59_i=$532 ? $533 : $527; //@line 1315 "src/markdown.c"
   var $534 = $_25_i59_i;label = 182; break;
  case 182: 
   var $534;
   var $_not=(($534)|(0))!=0; //@line 1406 "src/markdown.c"
   var $brmerge=$_not | $501; //@line 1406 "src/markdown.c"
   if ($brmerge) { var $beg_1_i176 = $end_0_i160;var $end_1_i162389 = $end_1_i162;label = 187; break; } else { var $i_08_i62_i = 0;label = 184; break; } //@line 1406 "src/markdown.c"
  case 183: 
   if ($501) { var $beg_1_i176 = $end_0_i160;var $end_1_i162389 = $31;label = 187; break; } else { var $i_08_i62_i = 0;label = 184; break; } //@line 1124 "src/markdown.c"
  case 184: 
   var $i_08_i62_i;
   var $_sum258=((($i_08_i62_i)+($_sum257))|0); //@line 1124 "src/markdown.c"
   var $535=(($data+$_sum258)|0); //@line 1124 "src/markdown.c"
   var $536=HEAP8[($535)]; //@line 1124 "src/markdown.c"
   if ((($536 << 24) >> 24)==32) {
    label = 185; break;
   }
   else if ((($536 << 24) >> 24)==10) {
    var $i_0_lcssa_i64_i = $i_08_i62_i;label = 186; break;
   }
   else {
   var $end_2_i177 = $end_1_i162;label = 192; break;
   }
  case 185: 
   var $538=((($i_08_i62_i)+(1))|0); //@line 1124 "src/markdown.c"
   var $539=(($538)>>>(0)) < (($500)>>>(0)); //@line 1124 "src/markdown.c"
   if ($539) { var $i_08_i62_i = $538;label = 184; break; } else { var $i_0_lcssa_i64_i = $538;label = 186; break; } //@line 1124 "src/markdown.c"
  case 186: 
   var $i_0_lcssa_i64_i;
   var $540=(($i_0_lcssa_i64_i)|(0))==-1; //@line 1407 "src/markdown.c"
   if ($540) { var $end_2_i177 = $end_1_i162;label = 192; break; } else { var $beg_1_i176 = $end_0_i160;var $end_1_i162389 = $end_1_i162;label = 187; break; } //@line 1407 "src/markdown.c"
  case 187: 
   var $end_1_i162389;
   var $beg_1_i176;
   var $541=(($beg_1_i176)>>>(0)) < (($end_1_i162)>>>(0)); //@line 1410 "src/markdown.c"
   if ($541) { label = 188; break; } else { var $end_0_i160 = $end_1_i162389;label = 152; break; } //@line 1410 "src/markdown.c"
  case 188: 
   var $543=(($work_data_0_i_ph)|(0))==0; //@line 1412 "src/markdown.c"
   var $_sum259=((($beg_1_i176)+($beg_0359))|0); //@line 1414 "src/markdown.c"
   var $544=(($data+$_sum259)|0); //@line 1414 "src/markdown.c"
   if ($543) { var $work_data_1_i = $544;label = 191; break; } else { label = 189; break; } //@line 1412 "src/markdown.c"
  case 189: 
   var $546=(($work_data_0_i_ph+$work_size_0_i_ph)|0); //@line 1414 "src/markdown.c"
   var $547=(($544)|(0))==(($546)|(0)); //@line 1414 "src/markdown.c"
   if ($547) { var $work_data_1_i = $work_data_0_i_ph;label = 191; break; } else { label = 190; break; } //@line 1414 "src/markdown.c"
  case 190: 
   var $549=((($end_1_i162389)-($beg_1_i176))|0); //@line 1415 "src/markdown.c"
   _memmove($546, $544, $549, 1, 0); //@line 1415 "src/markdown.c"
   var $work_data_1_i = $work_data_0_i_ph;label = 191; break; //@line 1415 "src/markdown.c"
  case 191: 
   var $work_data_1_i;
   var $551=((($end_1_i162389)+($work_size_0_i_ph))|0); //@line 1416 "src/markdown.c"
   var $552=((($551)-($beg_1_i176))|0); //@line 1416 "src/markdown.c"
   var $work_data_0_i_ph = $work_data_1_i;var $work_size_0_i_ph = $552;var $end_0_i160_ph = $end_1_i162389;label = 151; break; //@line 1417 "src/markdown.c"
  case 192: 
   var $end_2_i177;
   _parse_block($work_0_i_i158, $rndr, $work_data_0_i_ph, $work_size_0_i_ph); //@line 1421 "src/markdown.c"
   var $553=HEAP32[(($20)>>2)]; //@line 1422 "src/markdown.c"
   var $554=(($553)|(0))==0; //@line 1422 "src/markdown.c"
   if ($554) { label = 194; break; } else { label = 193; break; } //@line 1422 "src/markdown.c"
  case 193: 
   var $556=HEAP32[(($15)>>2)]; //@line 1423 "src/markdown.c"
   FUNCTION_TABLE[$553]($ob, $work_0_i_i158, $556); //@line 1423 "src/markdown.c"
   label = 194; break; //@line 1423 "src/markdown.c"
  case 194: 
   var $557=HEAP32[(($3)>>2)]; //@line 147 "src/markdown.c"
   var $558=((($557)-(1))|0); //@line 147 "src/markdown.c"
   HEAP32[(($3)>>2)]=$558; //@line 147 "src/markdown.c"
   var $559=((($end_2_i177)+($beg_0359))|0); //@line 2231 "src/markdown.c"
   var $beg_0_be = $559;label = 33; break; //@line 2231 "src/markdown.c"
  case 195: 
   var $560=(($31)>>>(0)) > 3; //@line 1328 "src/markdown.c"
   if ($560) { label = 196; break; } else { label = 235; break; } //@line 1328 "src/markdown.c"
  case 196: 
   var $562=HEAP8[($30)]; //@line 1328 "src/markdown.c"
   var $563=(($562 << 24) >> 24)==32; //@line 1328 "src/markdown.c"
   if ($563) { label = 197; break; } else { label = 235; break; } //@line 1328 "src/markdown.c"
  case 197: 
   var $_sum243=((($beg_0359)+(1))|0); //@line 1328 "src/markdown.c"
   var $565=(($data+$_sum243)|0); //@line 1328 "src/markdown.c"
   var $566=HEAP8[($565)]; //@line 1328 "src/markdown.c"
   var $567=(($566 << 24) >> 24)==32; //@line 1328 "src/markdown.c"
   if ($567) { label = 198; break; } else { label = 235; break; } //@line 1328 "src/markdown.c"
  case 198: 
   var $_sum244=((($beg_0359)+(2))|0); //@line 1328 "src/markdown.c"
   var $569=(($data+$_sum244)|0); //@line 1328 "src/markdown.c"
   var $570=HEAP8[($569)]; //@line 1328 "src/markdown.c"
   var $571=(($570 << 24) >> 24)==32; //@line 1328 "src/markdown.c"
   if ($571) { label = 199; break; } else { label = 235; break; } //@line 1328 "src/markdown.c"
  case 199: 
   var $_sum245=((($beg_0359)+(3))|0); //@line 1328 "src/markdown.c"
   var $573=(($data+$_sum245)|0); //@line 1328 "src/markdown.c"
   var $574=HEAP8[($573)]; //@line 1328 "src/markdown.c"
   var $575=(($574 << 24) >> 24)==32; //@line 1328 "src/markdown.c"
   if ($575) { label = 200; break; } else { label = 235; break; } //@line 1328 "src/markdown.c"
  case 200: 
   var $577=HEAP32[(($3)>>2)]; //@line 132 "src/markdown.c"
   var $578=HEAP32[(($18)>>2)]; //@line 132 "src/markdown.c"
   var $579=(($577)>>>(0)) < (($578)>>>(0)); //@line 132 "src/markdown.c"
   if ($579) { label = 201; break; } else { label = 203; break; } //@line 132 "src/markdown.c"
  case 201: 
   var $581=HEAP32[(($19)>>2)]; //@line 132 "src/markdown.c"
   var $582=(($581+($577<<2))|0); //@line 132 "src/markdown.c"
   var $583=HEAP32[(($582)>>2)]; //@line 132 "src/markdown.c"
   var $584=(($583)|(0))==0; //@line 132 "src/markdown.c"
   if ($584) { label = 203; break; } else { label = 202; break; } //@line 132 "src/markdown.c"
  case 202: 
   var $586=((($577)+(1))|0); //@line 134 "src/markdown.c"
   HEAP32[(($3)>>2)]=$586; //@line 134 "src/markdown.c"
   var $587=HEAP32[(($582)>>2)]; //@line 134 "src/markdown.c"
   var $588=$587; //@line 134 "src/markdown.c"
   var $589=(($587+4)|0); //@line 135 "src/markdown.c"
   var $590=$589; //@line 135 "src/markdown.c"
   HEAP32[(($590)>>2)]=0; //@line 135 "src/markdown.c"
   var $work_0_i_i79 = $588;label = 204; break; //@line 136 "src/markdown.c"
  case 203: 
   var $592=_bufnew(256); //@line 137 "src/markdown.c"
   var $593=$592; //@line 138 "src/markdown.c"
   var $594=_stack_push($17, $593); //@line 138 "src/markdown.c"
   var $work_0_i_i79 = $592;label = 204; break;
  case 204: 
   var $work_0_i_i79;
   var $beg_059_i = 0;label = 205; break; //@line 1595 "src/markdown.c"
  case 205: 
   var $beg_059_i;
   var $end_0_in_i = $beg_059_i;label = 206; break; //@line 1595 "src/markdown.c"
  case 206: 
   var $end_0_in_i;
   var $end_0_i=((($end_0_in_i)+(1))|0); //@line 1595 "src/markdown.c"
   var $596=(($end_0_i)>>>(0)) < (($31)>>>(0)); //@line 1595 "src/markdown.c"
   if ($596) { label = 207; break; } else { var $_lcssa421 = 0;label = 208; break; } //@line 1595 "src/markdown.c"
  case 207: 
   var $_sum253=((($end_0_in_i)+($beg_0359))|0); //@line 1595 "src/markdown.c"
   var $598=(($data+$_sum253)|0); //@line 1595 "src/markdown.c"
   var $599=HEAP8[($598)]; //@line 1595 "src/markdown.c"
   var $600=(($599 << 24) >> 24)==10; //@line 1595 "src/markdown.c"
   if ($600) { var $_lcssa421 = 1;label = 208; break; } else { var $end_0_in_i = $end_0_i;label = 206; break; }
  case 208: 
   var $_lcssa421;
   var $601=((($end_0_i)-($beg_059_i))|0); //@line 1596 "src/markdown.c"
   var $602=(($601)>>>(0)) > 3; //@line 1328 "src/markdown.c"
   if ($602) { label = 209; break; } else { label = 214; break; } //@line 1328 "src/markdown.c"
  case 209: 
   var $_sum249=((($beg_059_i)+($beg_0359))|0); //@line 1596 "src/markdown.c"
   var $604=(($data+$_sum249)|0); //@line 1596 "src/markdown.c"
   var $605=HEAP8[($604)]; //@line 1328 "src/markdown.c"
   var $606=(($605 << 24) >> 24)==32; //@line 1328 "src/markdown.c"
   if ($606) { label = 210; break; } else { var $_sum_i84_pre_phi = $_sum249;label = 216; break; } //@line 1328 "src/markdown.c"
  case 210: 
   var $_sum250=((($_sum243)+($beg_059_i))|0); //@line 1328 "src/markdown.c"
   var $608=(($data+$_sum250)|0); //@line 1328 "src/markdown.c"
   var $609=HEAP8[($608)]; //@line 1328 "src/markdown.c"
   var $610=(($609 << 24) >> 24)==32; //@line 1328 "src/markdown.c"
   if ($610) { label = 211; break; } else { var $_sum_i84_pre_phi = $_sum249;label = 216; break; } //@line 1328 "src/markdown.c"
  case 211: 
   var $_sum251=((($_sum244)+($beg_059_i))|0); //@line 1328 "src/markdown.c"
   var $612=(($data+$_sum251)|0); //@line 1328 "src/markdown.c"
   var $613=HEAP8[($612)]; //@line 1328 "src/markdown.c"
   var $614=(($613 << 24) >> 24)==32; //@line 1328 "src/markdown.c"
   if ($614) { label = 212; break; } else { var $_sum_i84_pre_phi = $_sum249;label = 216; break; } //@line 1328 "src/markdown.c"
  case 212: 
   var $_sum252=((($_sum245)+($beg_059_i))|0); //@line 1328 "src/markdown.c"
   var $616=(($data+$_sum252)|0); //@line 1328 "src/markdown.c"
   var $617=HEAP8[($616)]; //@line 1328 "src/markdown.c"
   var $618=(($617 << 24) >> 24)==32; //@line 1328 "src/markdown.c"
   if ($618) { label = 213; break; } else { var $_sum_i84_pre_phi = $_sum249;label = 216; break; } //@line 1328 "src/markdown.c"
  case 213: 
   var $620=((($beg_059_i)+(4))|0); //@line 1599 "src/markdown.c"
   var $beg_1_i = $620;label = 222; break; //@line 1599 "src/markdown.c"
  case 214: 
   var $622=(($end_0_i)|(0))==(($beg_059_i)|(0)); //@line 1124 "src/markdown.c"
   if ($622) { var $beg_1_i = $beg_059_i;label = 222; break; } else { label = 215; break; } //@line 1124 "src/markdown.c"
  case 215: 
   var $_sum_i84_pre=((($beg_059_i)+($beg_0359))|0); //@line 1124 "src/markdown.c"
   var $_sum_i84_pre_phi = $_sum_i84_pre;label = 216; break; //@line 1124 "src/markdown.c"
  case 216: 
   var $_sum_i84_pre_phi; //@line 1124 "src/markdown.c"
   var $i_08_i_i83 = 0;label = 217; break; //@line 1124 "src/markdown.c"
  case 217: 
   var $i_08_i_i83;
   var $_sum246=((($_sum_i84_pre_phi)+($i_08_i_i83))|0); //@line 1124 "src/markdown.c"
   var $623=(($data+$_sum246)|0); //@line 1124 "src/markdown.c"
   var $624=HEAP8[($623)]; //@line 1124 "src/markdown.c"
   if ((($624 << 24) >> 24)==32) {
    label = 220; break;
   }
   else if ((($624 << 24) >> 24)==10) {
    var $i_0_lcssa_i_i88 = $i_08_i_i83;label = 221; break;
   }
   else {
   var $beg_058_i = $beg_059_i;label = 218; break;
   }
  case 218: 
   var $beg_058_i;
   var $625=(($work_0_i_i79+4)|0); //@line 1614 "src/markdown.c"
   var $626=HEAP32[(($625)>>2)]; //@line 1614 "src/markdown.c"
   var $627=(($626)|(0))==0; //@line 1614 "src/markdown.c"
   if ($627) { label = 232; break; } else { label = 219; break; } //@line 1614 "src/markdown.c"
  case 219: 
   var $628=(($work_0_i_i79)|0); //@line 1614 "src/markdown.c"
   var $_pre_i86=HEAP32[(($628)>>2)]; //@line 1614 "src/markdown.c"
   var $645 = $626;label = 230; break; //@line 1614 "src/markdown.c"
  case 220: 
   var $630=((($i_08_i_i83)+(1))|0); //@line 1124 "src/markdown.c"
   var $631=(($630)>>>(0)) < (($601)>>>(0)); //@line 1124 "src/markdown.c"
   if ($631) { var $i_08_i_i83 = $630;label = 217; break; } else { var $i_0_lcssa_i_i88 = $630;label = 221; break; } //@line 1124 "src/markdown.c"
  case 221: 
   var $i_0_lcssa_i_i88;
   var $632=(($i_0_lcssa_i_i88)|(0))==-1; //@line 1600 "src/markdown.c"
   if ($632) { var $beg_058_i = $beg_059_i;label = 218; break; } else { var $beg_1_i = $beg_059_i;label = 222; break; } //@line 1600 "src/markdown.c"
  case 222: 
   var $beg_1_i;
   var $633=(($beg_1_i)>>>(0)) < (($end_0_i)>>>(0)); //@line 1604 "src/markdown.c"
   if ($633) { label = 223; break; } else { label = 228; break; } //@line 1604 "src/markdown.c"
  case 223: 
   var $_sum247=((($beg_1_i)+($beg_0359))|0); //@line 1607 "src/markdown.c"
   var $635=(($data+$_sum247)|0); //@line 1607 "src/markdown.c"
   var $636=((($end_0_i)-($beg_1_i))|0); //@line 1607 "src/markdown.c"
   var $637=(($end_0_i)|(0))==(($beg_1_i)|(0)); //@line 1124 "src/markdown.c"
   if ($637) { label = 227; break; } else { var $i_08_i41_i = 0;label = 224; break; } //@line 1124 "src/markdown.c"
  case 224: 
   var $i_08_i41_i;
   var $_sum248=((($_sum247)+($i_08_i41_i))|0); //@line 1124 "src/markdown.c"
   var $638=(($data+$_sum248)|0); //@line 1124 "src/markdown.c"
   var $639=HEAP8[($638)]; //@line 1124 "src/markdown.c"
   if ((($639 << 24) >> 24)==32) {
    label = 225; break;
   }
   else if ((($639 << 24) >> 24)==10) {
    var $i_0_lcssa_i43_i = $i_08_i41_i;label = 226; break;
   }
   else {
   label = 229; break;
   }
  case 225: 
   var $641=((($i_08_i41_i)+(1))|0); //@line 1124 "src/markdown.c"
   var $642=(($641)>>>(0)) < (($636)>>>(0)); //@line 1124 "src/markdown.c"
   if ($642) { var $i_08_i41_i = $641;label = 224; break; } else { var $i_0_lcssa_i43_i = $641;label = 226; break; } //@line 1124 "src/markdown.c"
  case 226: 
   var $i_0_lcssa_i43_i;
   var $643=(($i_0_lcssa_i43_i)|(0))==-1; //@line 1607 "src/markdown.c"
   if ($643) { label = 229; break; } else { label = 227; break; } //@line 1607 "src/markdown.c"
  case 227: 
   _bufputc($work_0_i_i79, 10); //@line 1608 "src/markdown.c"
   label = 228; break; //@line 1608 "src/markdown.c"
  case 228: 
   if ($_lcssa421) { var $beg_059_i = $end_0_i;label = 205; break; } else { var $beg_058_i = $end_0_i;label = 218; break; } //@line 1594 "src/markdown.c"
  case 229: 
   _bufput($work_0_i_i79, $635, $636); //@line 1609 "src/markdown.c"
   label = 228; break;
  case 230: 
   var $645;
   var $646=((($645)-(1))|0); //@line 1614 "src/markdown.c"
   var $647=(($_pre_i86+$646)|0); //@line 1614 "src/markdown.c"
   var $648=HEAP8[($647)]; //@line 1614 "src/markdown.c"
   var $649=(($648 << 24) >> 24)==10; //@line 1614 "src/markdown.c"
   if ($649) { label = 231; break; } else { label = 232; break; }
  case 231: 
   HEAP32[(($625)>>2)]=$646; //@line 1615 "src/markdown.c"
   var $650=(($646)|(0))==0; //@line 1614 "src/markdown.c"
   if ($650) { label = 232; break; } else { var $645 = $646;label = 230; break; } //@line 1614 "src/markdown.c"
  case 232: 
   _bufputc($work_0_i_i79, 10); //@line 1617 "src/markdown.c"
   var $651=HEAP32[(($21)>>2)]; //@line 1619 "src/markdown.c"
   var $652=(($651)|(0))==0; //@line 1619 "src/markdown.c"
   if ($652) { label = 234; break; } else { label = 233; break; } //@line 1619 "src/markdown.c"
  case 233: 
   var $654=HEAP32[(($15)>>2)]; //@line 1620 "src/markdown.c"
   FUNCTION_TABLE[$651]($ob, $work_0_i_i79, 0, $654); //@line 1620 "src/markdown.c"
   label = 234; break; //@line 1620 "src/markdown.c"
  case 234: 
   var $655=HEAP32[(($3)>>2)]; //@line 147 "src/markdown.c"
   var $656=((($655)-(1))|0); //@line 147 "src/markdown.c"
   HEAP32[(($3)>>2)]=$656; //@line 147 "src/markdown.c"
   var $657=((($beg_058_i)+($beg_0359))|0); //@line 2234 "src/markdown.c"
   var $beg_0_be = $657;label = 33; break; //@line 2234 "src/markdown.c"
  case 235: 
   var $659=HEAP8[($30)]; //@line 1365 "src/markdown.c"
   var $660=(($659 << 24) >> 24)==32; //@line 1365 "src/markdown.c"
   var $__i=(($660)&(1)); //@line 1365 "src/markdown.c"
   var $661=(($__i)>>>(0)) < (($31)>>>(0)); //@line 1366 "src/markdown.c"
   if ($661) { label = 236; break; } else { var $i_1_i = $__i;label = 237; break; } //@line 1366 "src/markdown.c"
  case 236: 
   var $_sum242=((($__i)+($beg_0359))|0); //@line 1366 "src/markdown.c"
   var $663=(($data+$_sum242)|0); //@line 1366 "src/markdown.c"
   var $664=HEAP8[($663)]; //@line 1366 "src/markdown.c"
   var $665=(($664 << 24) >> 24)==32; //@line 1366 "src/markdown.c"
   var $666=(($665)&(1)); //@line 1366 "src/markdown.c"
   var $_i_0_i=((($666)+($__i))|0); //@line 1366 "src/markdown.c"
   var $i_1_i = $_i_0_i;label = 237; break; //@line 1366 "src/markdown.c"
  case 237: 
   var $i_1_i;
   var $668=(($i_1_i)>>>(0)) < (($31)>>>(0)); //@line 1367 "src/markdown.c"
   if ($668) { label = 238; break; } else { var $i_2_i = $i_1_i;label = 239; break; } //@line 1367 "src/markdown.c"
  case 238: 
   var $_sum241=((($i_1_i)+($beg_0359))|0); //@line 1367 "src/markdown.c"
   var $670=(($data+$_sum241)|0); //@line 1367 "src/markdown.c"
   var $671=HEAP8[($670)]; //@line 1367 "src/markdown.c"
   var $672=(($671 << 24) >> 24)==32; //@line 1367 "src/markdown.c"
   var $673=(($672)&(1)); //@line 1367 "src/markdown.c"
   var $_i_1_i=((($673)+($i_1_i))|0); //@line 1367 "src/markdown.c"
   var $i_2_i = $_i_1_i;label = 239; break; //@line 1367 "src/markdown.c"
  case 239: 
   var $i_2_i;
   var $675=((($i_2_i)+(1))|0); //@line 1369 "src/markdown.c"
   var $676=(($675)>>>(0)) < (($31)>>>(0)); //@line 1369 "src/markdown.c"
   if ($676) { label = 240; break; } else { label = 260; break; } //@line 1369 "src/markdown.c"
  case 240: 
   var $_sum233=((($i_2_i)+($beg_0359))|0); //@line 1369 "src/markdown.c"
   var $678=(($data+$_sum233)|0); //@line 1369 "src/markdown.c"
   var $679=HEAP8[($678)]; //@line 1369 "src/markdown.c"
   if ((($679 << 24) >> 24)==42 | (($679 << 24) >> 24)==43 | (($679 << 24) >> 24)==45) {
    label = 241; break;
   }
   else {
   label = 260; break;
   }
  case 241: 
   var $_sum234=((($675)+($beg_0359))|0); //@line 1369 "src/markdown.c"
   var $681=(($data+$_sum234)|0); //@line 1369 "src/markdown.c"
   var $682=HEAP8[($681)]; //@line 1369 "src/markdown.c"
   var $683=(($682 << 24) >> 24)==32; //@line 1369 "src/markdown.c"
   if ($683) { label = 242; break; } else { label = 260; break; } //@line 1369 "src/markdown.c"
  case 242: 
   var $685=((($31)-($i_2_i))|0); //@line 1374 "src/markdown.c"
   var $i_0_i178 = 0;label = 243; break; //@line 1296 "src/markdown.c"
  case 243: 
   var $i_0_i178;
   var $687=(($i_0_i178)>>>(0)) < (($685)>>>(0)); //@line 1296 "src/markdown.c"
   if ($687) { label = 245; break; } else { label = 244; break; } //@line 1296 "src/markdown.c"
  case 244: 
   var $688=((($i_0_i178)+(1))|0); //@line 1297 "src/markdown.c"
   var $694 = $688;label = 246; break;
  case 245: 
   var $_sum240=((($i_0_i178)+($_sum233))|0); //@line 1296 "src/markdown.c"
   var $690=(($data+$_sum240)|0); //@line 1296 "src/markdown.c"
   var $691=HEAP8[($690)]; //@line 1296 "src/markdown.c"
   var $692=(($691 << 24) >> 24)==10; //@line 1296 "src/markdown.c"
   var $693=((($i_0_i178)+(1))|0); //@line 1297 "src/markdown.c"
   if ($692) { var $694 = $693;label = 246; break; } else { var $i_0_i178 = $693;label = 243; break; }
  case 246: 
   var $694;
   var $695=(($694)>>>(0)) < (($685)>>>(0)); //@line 1299 "src/markdown.c"
   if ($695) { label = 247; break; } else { var $_0_i191 = 0;label = 258; break; } //@line 1299 "src/markdown.c"
  case 247: 
   var $_sum235=((($694)+($_sum233))|0); //@line 1302 "src/markdown.c"
   var $697=(($data+$_sum235)|0); //@line 1302 "src/markdown.c"
   var $698=((($685)-($694))|0); //@line 1302 "src/markdown.c"
   var $699=HEAP8[($697)]; //@line 1277 "src/markdown.c"
   if ((($699 << 24) >> 24)==61) {
    var $i_0_i_i180 = 1;label = 248; break;
   }
   else if ((($699 << 24) >> 24)==45) {
    var $i_2_i_i185 = 1;label = 253; break;
   }
   else {
   var $_0_i191 = 0;label = 258; break;
   }
  case 248: 
   var $i_0_i_i180;
   var $700=(($i_0_i_i180)>>>(0)) < (($698)>>>(0)); //@line 1278 "src/markdown.c"
   if ($700) { label = 249; break; } else { var $i_1_i_i182 = $i_0_i_i180;label = 250; break; } //@line 1278 "src/markdown.c"
  case 249: 
   var $_sum239=((($_sum235)+($i_0_i_i180))|0); //@line 1278 "src/markdown.c"
   var $702=(($data+$_sum239)|0); //@line 1278 "src/markdown.c"
   var $703=HEAP8[($702)]; //@line 1278 "src/markdown.c"
   var $704=(($703 << 24) >> 24)==61; //@line 1278 "src/markdown.c"
   var $705=((($i_0_i_i180)+(1))|0); //@line 1278 "src/markdown.c"
   if ($704) { var $i_0_i_i180 = $705;label = 248; break; } else { var $i_1_i_i182 = $i_0_i_i180;label = 250; break; }
  case 250: 
   var $i_1_i_i182;
   var $706=(($i_1_i_i182)>>>(0)) < (($698)>>>(0)); //@line 1279 "src/markdown.c"
   if ($706) { label = 251; break; } else { label = 260; break; } //@line 1279 "src/markdown.c"
  case 251: 
   var $_sum238=((($_sum235)+($i_1_i_i182))|0); //@line 1279 "src/markdown.c"
   var $708=(($data+$_sum238)|0); //@line 1279 "src/markdown.c"
   var $709=HEAP8[($708)]; //@line 1279 "src/markdown.c"
   var $710=(($709 << 24) >> 24)==32; //@line 1279 "src/markdown.c"
   var $711=((($i_1_i_i182)+(1))|0); //@line 1279 "src/markdown.c"
   if ($710) { var $i_1_i_i182 = $711;label = 250; break; } else { label = 252; break; }
  case 252: 
   var $713=(($709 << 24) >> 24)==10; //@line 1280 "src/markdown.c"
   var $phitmp31_i_i184=(($713)&(1)); //@line 1280 "src/markdown.c"
   var $_0_i191 = $phitmp31_i_i184;label = 258; break; //@line 1280 "src/markdown.c"
  case 253: 
   var $i_2_i_i185;
   var $714=(($i_2_i_i185)>>>(0)) < (($698)>>>(0)); //@line 1284 "src/markdown.c"
   if ($714) { label = 254; break; } else { var $i_3_i_i187 = $i_2_i_i185;label = 255; break; } //@line 1284 "src/markdown.c"
  case 254: 
   var $_sum237=((($_sum235)+($i_2_i_i185))|0); //@line 1284 "src/markdown.c"
   var $716=(($data+$_sum237)|0); //@line 1284 "src/markdown.c"
   var $717=HEAP8[($716)]; //@line 1284 "src/markdown.c"
   var $718=(($717 << 24) >> 24)==45; //@line 1284 "src/markdown.c"
   var $719=((($i_2_i_i185)+(1))|0); //@line 1284 "src/markdown.c"
   if ($718) { var $i_2_i_i185 = $719;label = 253; break; } else { var $i_3_i_i187 = $i_2_i_i185;label = 255; break; }
  case 255: 
   var $i_3_i_i187;
   var $720=(($i_3_i_i187)>>>(0)) < (($698)>>>(0)); //@line 1285 "src/markdown.c"
   if ($720) { label = 256; break; } else { label = 260; break; } //@line 1285 "src/markdown.c"
  case 256: 
   var $_sum236=((($_sum235)+($i_3_i_i187))|0); //@line 1285 "src/markdown.c"
   var $722=(($data+$_sum236)|0); //@line 1285 "src/markdown.c"
   var $723=HEAP8[($722)]; //@line 1285 "src/markdown.c"
   var $724=(($723 << 24) >> 24)==32; //@line 1285 "src/markdown.c"
   var $725=((($i_3_i_i187)+(1))|0); //@line 1285 "src/markdown.c"
   if ($724) { var $i_3_i_i187 = $725;label = 255; break; } else { label = 257; break; }
  case 257: 
   var $727=(($723 << 24) >> 24)==10; //@line 1286 "src/markdown.c"
   var $phitmp_i_i190=$727 ? 2 : 0; //@line 1286 "src/markdown.c"
   var $_0_i191 = $phitmp_i_i190;label = 258; break; //@line 1286 "src/markdown.c"
  case 258: 
   var $_0_i191;
   var $728=(($i_2_i)|(0))==-2; //@line 2236 "src/markdown.c"
   var $not_=(($_0_i191)|(0))!=0; //@line 2236 "src/markdown.c"
   var $729=$728 | $not_; //@line 2236 "src/markdown.c"
   if ($729) { label = 260; break; } else { label = 259; break; } //@line 2236 "src/markdown.c"
  case 259: 
   var $731=_parse_list($ob, $rndr, $30, $31, 0); //@line 2237 "src/markdown.c"
   var $732=((($731)+($beg_0359))|0); //@line 2237 "src/markdown.c"
   var $beg_0_be = $732;label = 33; break; //@line 2237 "src/markdown.c"
  case 260: 
   var $733=_prefix_oli($30, $31); //@line 2239 "src/markdown.c"
   var $734=(($733)|(0))==0; //@line 2239 "src/markdown.c"
   if ($734) { label = 262; break; } else { label = 261; break; } //@line 2239 "src/markdown.c"
  case 261: 
   var $736=_parse_list($ob, $rndr, $30, $31, 1); //@line 2240 "src/markdown.c"
   var $737=((($736)+($beg_0359))|0); //@line 2240 "src/markdown.c"
   var $beg_0_be = $737;label = 33; break; //@line 2240 "src/markdown.c"
  case 262: 
   var $_sum160_i=((($beg_0359)+(1))|0); //@line 1141 "src/markdown.c"
   var $_sum161_i=((($beg_0359)+(2))|0); //@line 1142 "src/markdown.c"
   var $end_0190_i = 0;label = 263; break; //@line 1439 "src/markdown.c"
  case 263: 
   var $end_0190_i;
   var $end_1_in_i = $end_0190_i;label = 264; break; //@line 1440 "src/markdown.c"
  case 264: 
   var $end_1_in_i;
   var $end_1_i=((($end_1_in_i)+(1))|0); //@line 1440 "src/markdown.c"
   var $739=(($end_1_i)>>>(0)) < (($31)>>>(0)); //@line 1440 "src/markdown.c"
   if ($739) { label = 265; break; } else { var $_lcssa405 = 0;label = 266; break; } //@line 1440 "src/markdown.c"
  case 265: 
   var $_sum232=((($end_1_in_i)+($beg_0359))|0); //@line 1440 "src/markdown.c"
   var $741=(($data+$_sum232)|0); //@line 1440 "src/markdown.c"
   var $742=HEAP8[($741)]; //@line 1440 "src/markdown.c"
   var $743=(($742 << 24) >> 24)==10; //@line 1440 "src/markdown.c"
   if ($743) { var $_lcssa405 = 1;label = 266; break; } else { var $end_1_in_i = $end_1_i;label = 264; break; }
  case 266: 
   var $_lcssa405;
   var $_sum202=((($end_0190_i)+($beg_0359))|0); //@line 1442 "src/markdown.c"
   var $744=(($data+$_sum202)|0); //@line 1442 "src/markdown.c"
   var $745=((($31)-($end_0190_i))|0); //@line 1442 "src/markdown.c"
   var $746=(($end_0190_i)|(0))==(($31)|(0)); //@line 1124 "src/markdown.c"
   if ($746) { var $end_2_i = $end_1_i;var $level_1_i = 0;var $end_0188_i = $31;label = 344; break; } else { var $i_08_i_i = 0;label = 267; break; } //@line 1124 "src/markdown.c"
  case 267: 
   var $i_08_i_i;
   var $_sum203=((($_sum202)+($i_08_i_i))|0); //@line 1124 "src/markdown.c"
   var $747=(($data+$_sum203)|0); //@line 1124 "src/markdown.c"
   var $748=HEAP8[($747)]; //@line 1124 "src/markdown.c"
   if ((($748 << 24) >> 24)==32) {
    label = 268; break;
   }
   else if ((($748 << 24) >> 24)==10) {
    var $i_0_lcssa_i_i = $i_08_i_i;label = 269; break;
   }
   else {
   label = 270; break;
   }
  case 268: 
   var $750=((($i_08_i_i)+(1))|0); //@line 1124 "src/markdown.c"
   var $751=(($750)>>>(0)) < (($745)>>>(0)); //@line 1124 "src/markdown.c"
   if ($751) { var $i_08_i_i = $750;label = 267; break; } else { var $i_0_lcssa_i_i = $750;label = 269; break; } //@line 1124 "src/markdown.c"
  case 269: 
   var $i_0_lcssa_i_i;
   var $752=(($i_0_lcssa_i_i)|(0))==-1; //@line 1442 "src/markdown.c"
   if ($752) { label = 270; break; } else { var $end_2_i = $end_1_i;var $level_1_i = 0;var $end_0188_i = $end_0190_i;label = 344; break; } //@line 1442 "src/markdown.c"
  case 270: 
   var $753=HEAP8[($744)]; //@line 1277 "src/markdown.c"
   if ((($753 << 24) >> 24)==61) {
    var $i_0_i_i = 1;label = 271; break;
   }
   else if ((($753 << 24) >> 24)==45) {
    var $i_2_i_i = 1;label = 276; break;
   }
   else if ((($753 << 24) >> 24)==35) {
    label = 283; break;
   }
   else {
   label = 289; break;
   }
  case 271: 
   var $i_0_i_i;
   var $754=(($i_0_i_i)>>>(0)) < (($745)>>>(0)); //@line 1278 "src/markdown.c"
   if ($754) { label = 272; break; } else { var $i_1_i_i = $i_0_i_i;label = 273; break; } //@line 1278 "src/markdown.c"
  case 272: 
   var $_sum231=((($_sum202)+($i_0_i_i))|0); //@line 1278 "src/markdown.c"
   var $756=(($data+$_sum231)|0); //@line 1278 "src/markdown.c"
   var $757=HEAP8[($756)]; //@line 1278 "src/markdown.c"
   var $758=(($757 << 24) >> 24)==61; //@line 1278 "src/markdown.c"
   var $759=((($i_0_i_i)+(1))|0); //@line 1278 "src/markdown.c"
   if ($758) { var $i_0_i_i = $759;label = 271; break; } else { var $i_1_i_i = $i_0_i_i;label = 273; break; }
  case 273: 
   var $i_1_i_i;
   var $760=(($i_1_i_i)>>>(0)) < (($745)>>>(0)); //@line 1279 "src/markdown.c"
   if ($760) { label = 274; break; } else { var $end_2_i = $end_1_i;var $level_1_i = 1;var $end_0188_i = $end_0190_i;label = 344; break; } //@line 1279 "src/markdown.c"
  case 274: 
   var $_sum230=((($_sum202)+($i_1_i_i))|0); //@line 1279 "src/markdown.c"
   var $762=(($data+$_sum230)|0); //@line 1279 "src/markdown.c"
   var $763=HEAP8[($762)]; //@line 1279 "src/markdown.c"
   var $764=(($763 << 24) >> 24)==32; //@line 1279 "src/markdown.c"
   var $765=((($i_1_i_i)+(1))|0); //@line 1279 "src/markdown.c"
   if ($764) { var $i_1_i_i = $765;label = 273; break; } else { label = 275; break; }
  case 275: 
   var $767=(($763 << 24) >> 24)==10; //@line 1280 "src/markdown.c"
   var $phitmp31_i_i=(($767)&(1)); //@line 1280 "src/markdown.c"
   var $_0_i112_i = $phitmp31_i_i;label = 281; break; //@line 1280 "src/markdown.c"
  case 276: 
   var $i_2_i_i;
   var $768=(($i_2_i_i)>>>(0)) < (($745)>>>(0)); //@line 1284 "src/markdown.c"
   if ($768) { label = 277; break; } else { var $i_3_i_i = $i_2_i_i;label = 278; break; } //@line 1284 "src/markdown.c"
  case 277: 
   var $_sum229=((($_sum202)+($i_2_i_i))|0); //@line 1284 "src/markdown.c"
   var $770=(($data+$_sum229)|0); //@line 1284 "src/markdown.c"
   var $771=HEAP8[($770)]; //@line 1284 "src/markdown.c"
   var $772=(($771 << 24) >> 24)==45; //@line 1284 "src/markdown.c"
   var $773=((($i_2_i_i)+(1))|0); //@line 1284 "src/markdown.c"
   if ($772) { var $i_2_i_i = $773;label = 276; break; } else { var $i_3_i_i = $i_2_i_i;label = 278; break; }
  case 278: 
   var $i_3_i_i;
   var $774=(($i_3_i_i)>>>(0)) < (($745)>>>(0)); //@line 1285 "src/markdown.c"
   if ($774) { label = 279; break; } else { var $end_2_i = $end_1_i;var $level_1_i = 2;var $end_0188_i = $end_0190_i;label = 344; break; } //@line 1285 "src/markdown.c"
  case 279: 
   var $_sum228=((($_sum202)+($i_3_i_i))|0); //@line 1285 "src/markdown.c"
   var $776=(($data+$_sum228)|0); //@line 1285 "src/markdown.c"
   var $777=HEAP8[($776)]; //@line 1285 "src/markdown.c"
   var $778=(($777 << 24) >> 24)==32; //@line 1285 "src/markdown.c"
   var $779=((($i_3_i_i)+(1))|0); //@line 1285 "src/markdown.c"
   if ($778) { var $i_3_i_i = $779;label = 278; break; } else { label = 280; break; }
  case 280: 
   var $781=(($777 << 24) >> 24)==10; //@line 1286 "src/markdown.c"
   var $phitmp_i_i=$781 ? 2 : 0; //@line 1286 "src/markdown.c"
   var $_0_i112_i = $phitmp_i_i;label = 281; break; //@line 1286 "src/markdown.c"
  case 281: 
   var $_0_i112_i;
   var $782=(($_0_i112_i)|(0))==0; //@line 1445 "src/markdown.c"
   if ($782) { label = 282; break; } else { var $end_2_i = $end_1_i;var $level_1_i = $_0_i112_i;var $end_0188_i = $end_0190_i;label = 344; break; } //@line 1445 "src/markdown.c"
  case 282: 
   var $783=(($753 << 24) >> 24)==35; //@line 1254 "src/markdown.c"
   if ($783) { label = 283; break; } else { label = 289; break; } //@line 1254 "src/markdown.c"
  case 283: 
   var $784=HEAP32[(($10)>>2)]; //@line 1257 "src/markdown.c"
   var $785=$784 & 64; //@line 1257 "src/markdown.c"
   var $786=(($785)|(0))==0; //@line 1257 "src/markdown.c"
   if ($786) { var $end_2_i = $end_0190_i;var $level_1_i = 0;var $end_0188_i = $end_0190_i;label = 344; break; } else { var $level_0_i_i = 0;label = 284; break; } //@line 1257 "src/markdown.c"
  case 284: 
   var $level_0_i_i;
   var $787=(($level_0_i_i)>>>(0)) < (($745)>>>(0)); //@line 1260 "src/markdown.c"
   var $788=(($level_0_i_i)>>>(0)) < 6; //@line 1260 "src/markdown.c"
   var $or_cond_i_i=$787 & $788; //@line 1260 "src/markdown.c"
   if ($or_cond_i_i) { label = 285; break; } else { label = 286; break; } //@line 1260 "src/markdown.c"
  case 285: 
   var $_sum227=((($_sum202)+($level_0_i_i))|0); //@line 1260 "src/markdown.c"
   var $790=(($data+$_sum227)|0); //@line 1260 "src/markdown.c"
   var $791=HEAP8[($790)]; //@line 1260 "src/markdown.c"
   var $792=(($791 << 24) >> 24)==35; //@line 1260 "src/markdown.c"
   var $793=((($level_0_i_i)+(1))|0); //@line 1261 "src/markdown.c"
   if ($792) { var $level_0_i_i = $793;label = 284; break; } else { var $794 = $791;label = 288; break; }
  case 286: 
   if ($787) { label = 287; break; } else { var $end_2_i = $end_0190_i;var $level_1_i = 0;var $end_0188_i = $end_0190_i;label = 344; break; } //@line 1263 "src/markdown.c"
  case 287: 
   var $_sum208=((($_sum202)+($level_0_i_i))|0); //@line 1263 "src/markdown.c"
   var $_pre_i=(($data+$_sum208)|0); //@line 1263 "src/markdown.c"
   var $_pre=HEAP8[($_pre_i)]; //@line 1263 "src/markdown.c"
   var $794 = $_pre;label = 288; break; //@line 1263 "src/markdown.c"
  case 288: 
   var $794;
   var $795=(($794 << 24) >> 24)==32; //@line 1263 "src/markdown.c"
   if ($795) { var $end_2_i = $end_0190_i;var $level_1_i = 0;var $end_0188_i = $end_0190_i;label = 344; break; } else { label = 289; break; } //@line 1263 "src/markdown.c"
  case 289: 
   var $797=(($745)>>>(0)) < 3; //@line 1139 "src/markdown.c"
   if ($797) { label = 302; break; } else { label = 290; break; } //@line 1139 "src/markdown.c"
  case 290: 
   var $799=(($753 << 24) >> 24)==32; //@line 1140 "src/markdown.c"
   if ($799) { label = 291; break; } else { var $i_0_i116_i = 0;label = 293; break; } //@line 1140 "src/markdown.c"
  case 291: 
   var $_sum225=((($_sum160_i)+($end_0190_i))|0); //@line 1141 "src/markdown.c"
   var $801=(($data+$_sum225)|0); //@line 1141 "src/markdown.c"
   var $802=HEAP8[($801)]; //@line 1141 "src/markdown.c"
   var $803=(($802 << 24) >> 24)==32; //@line 1141 "src/markdown.c"
   if ($803) { label = 292; break; } else { var $i_0_i116_i = 1;label = 293; break; } //@line 1141 "src/markdown.c"
  case 292: 
   var $_sum226=((($_sum161_i)+($end_0190_i))|0); //@line 1142 "src/markdown.c"
   var $805=(($data+$_sum226)|0); //@line 1142 "src/markdown.c"
   var $806=HEAP8[($805)]; //@line 1142 "src/markdown.c"
   var $807=(($806 << 24) >> 24)==32; //@line 1142 "src/markdown.c"
   var $__i_i=$807 ? 3 : 2; //@line 1142 "src/markdown.c"
   var $i_0_i116_i = $__i_i;label = 293; break; //@line 1142 "src/markdown.c"
  case 293: 
   var $i_0_i116_i;
   var $809=((($i_0_i116_i)+(2))|0); //@line 1145 "src/markdown.c"
   var $810=(($809)>>>(0)) < (($745)>>>(0)); //@line 1145 "src/markdown.c"
   if ($810) { label = 294; break; } else { label = 302; break; } //@line 1145 "src/markdown.c"
  case 294: 
   var $_sum223=((($_sum202)+($i_0_i116_i))|0); //@line 1145 "src/markdown.c"
   var $812=(($data+$_sum223)|0); //@line 1145 "src/markdown.c"
   var $813=HEAP8[($812)]; //@line 1145 "src/markdown.c"
   if ((($813 << 24) >> 24)==42 | (($813 << 24) >> 24)==45 | (($813 << 24) >> 24)==95) {
    label = 295; break;
   }
   else {
   label = 302; break;
   }
  case 295: 
   var $815=(($i_0_i116_i)>>>(0)) < (($745)>>>(0)); //@line 1151 "src/markdown.c"
   if ($815) { var $816 = $813;var $n_029_i178_i = 0;var $i_128_i179_i = $i_0_i116_i;label = 296; break; } else { label = 302; break; } //@line 1151 "src/markdown.c"
  case 296: 
   var $i_128_i179_i;
   var $n_029_i178_i;
   var $816;
   var $817=(($816 << 24) >> 24)==(($813 << 24) >> 24); //@line 1152 "src/markdown.c"
   if ($817) { label = 297; break; } else { label = 298; break; } //@line 1152 "src/markdown.c"
  case 297: 
   var $819=((($n_029_i178_i)+(1))|0); //@line 1152 "src/markdown.c"
   var $n_1_i_i = $819;label = 299; break; //@line 1152 "src/markdown.c"
  case 298: 
   var $821=(($816 << 24) >> 24)==32; //@line 1153 "src/markdown.c"
   if ($821) { var $n_1_i_i = $n_029_i178_i;label = 299; break; } else { label = 302; break; } //@line 1153 "src/markdown.c"
  case 299: 
   var $n_1_i_i;
   var $823=((($i_128_i179_i)+(1))|0); //@line 1156 "src/markdown.c"
   var $824=(($823)>>>(0)) < (($745)>>>(0)); //@line 1151 "src/markdown.c"
   if ($824) { label = 300; break; } else { label = 301; break; } //@line 1151 "src/markdown.c"
  case 300: 
   var $_sum224=((($_sum202)+($823))|0);
   var $_phi_trans_insert_i_i=(($data+$_sum224)|0);
   var $_pre_i_i=HEAP8[($_phi_trans_insert_i_i)]; //@line 1151 "src/markdown.c"
   var $825=(($_pre_i_i << 24) >> 24)==10; //@line 1151 "src/markdown.c"
   if ($825) { label = 301; break; } else { var $816 = $_pre_i_i;var $n_029_i178_i = $n_1_i_i;var $i_128_i179_i = $823;label = 296; break; }
  case 301: 
   var $826=(($n_1_i_i)>>>(0)) > 2; //@line 1159 "src/markdown.c"
   if ($826) { var $end_2_i = $end_0190_i;var $level_1_i = 0;var $end_0188_i = $end_0190_i;label = 344; break; } else { label = 302; break; } //@line 1449 "src/markdown.c"
  case 302: 
   var $827=(($753 << 24) >> 24)==32; //@line 1310 "src/markdown.c"
   var $__i120_i=(($827)&(1)); //@line 1310 "src/markdown.c"
   var $828=(($__i120_i)>>>(0)) < (($745)>>>(0)); //@line 1311 "src/markdown.c"
   if ($828) { label = 303; break; } else { var $i_1_i122_i = $__i120_i;label = 304; break; } //@line 1311 "src/markdown.c"
  case 303: 
   var $_sum222=((($_sum202)+($__i120_i))|0); //@line 1311 "src/markdown.c"
   var $830=(($data+$_sum222)|0); //@line 1311 "src/markdown.c"
   var $831=HEAP8[($830)]; //@line 1311 "src/markdown.c"
   var $832=(($831 << 24) >> 24)==32; //@line 1311 "src/markdown.c"
   var $833=(($832)&(1)); //@line 1311 "src/markdown.c"
   var $_i_0_i_i=((($833)+($__i120_i))|0); //@line 1311 "src/markdown.c"
   var $i_1_i122_i = $_i_0_i_i;label = 304; break; //@line 1311 "src/markdown.c"
  case 304: 
   var $i_1_i122_i;
   var $835=(($i_1_i122_i)>>>(0)) < (($745)>>>(0)); //@line 1312 "src/markdown.c"
   if ($835) { label = 305; break; } else { var $i_2_i123_i = $i_1_i122_i;label = 306; break; } //@line 1312 "src/markdown.c"
  case 305: 
   var $_sum221=((($_sum202)+($i_1_i122_i))|0); //@line 1312 "src/markdown.c"
   var $837=(($data+$_sum221)|0); //@line 1312 "src/markdown.c"
   var $838=HEAP8[($837)]; //@line 1312 "src/markdown.c"
   var $839=(($838 << 24) >> 24)==32; //@line 1312 "src/markdown.c"
   var $840=(($839)&(1)); //@line 1312 "src/markdown.c"
   var $_i_1_i_i=((($840)+($i_1_i122_i))|0); //@line 1312 "src/markdown.c"
   var $i_2_i123_i = $_i_1_i_i;label = 306; break; //@line 1312 "src/markdown.c"
  case 306: 
   var $i_2_i123_i;
   var $842=(($i_2_i123_i)>>>(0)) < (($745)>>>(0)); //@line 1314 "src/markdown.c"
   if ($842) { label = 307; break; } else { label = 311; break; } //@line 1314 "src/markdown.c"
  case 307: 
   var $_sum219=((($_sum202)+($i_2_i123_i))|0); //@line 1314 "src/markdown.c"
   var $844=(($data+$_sum219)|0); //@line 1314 "src/markdown.c"
   var $845=HEAP8[($844)]; //@line 1314 "src/markdown.c"
   var $846=(($845 << 24) >> 24)==62; //@line 1314 "src/markdown.c"
   if ($846) { label = 308; break; } else { label = 311; break; } //@line 1314 "src/markdown.c"
  case 308: 
   var $848=((($i_2_i123_i)+(1))|0); //@line 1315 "src/markdown.c"
   var $849=(($848)>>>(0)) < (($745)>>>(0)); //@line 1315 "src/markdown.c"
   if ($849) { label = 309; break; } else { var $855 = $848;label = 310; break; } //@line 1315 "src/markdown.c"
  case 309: 
   var $_sum220=((($_sum202)+($848))|0); //@line 1315 "src/markdown.c"
   var $851=(($data+$_sum220)|0); //@line 1315 "src/markdown.c"
   var $852=HEAP8[($851)]; //@line 1315 "src/markdown.c"
   var $853=(($852 << 24) >> 24)==32; //@line 1315 "src/markdown.c"
   var $854=((($i_2_i123_i)+(2))|0); //@line 1316 "src/markdown.c"
   var $_25_i_i=$853 ? $854 : $848; //@line 1315 "src/markdown.c"
   var $855 = $_25_i_i;label = 310; break;
  case 310: 
   var $855;
   var $856=(($855)|(0))==0; //@line 1450 "src/markdown.c"
   if ($856) { label = 311; break; } else { var $end_2_i = $end_0190_i;var $level_1_i = 0;var $end_0188_i = $end_0190_i;label = 344; break; } //@line 1450 "src/markdown.c"
  case 311: 
   var $857=HEAP32[(($10)>>2)]; //@line 1464 "src/markdown.c"
   var $858=$857 & 256; //@line 1464 "src/markdown.c"
   var $859=(($858)|(0))==0; //@line 1464 "src/markdown.c"
   if ($859) { label = 343; break; } else { label = 312; break; } //@line 1464 "src/markdown.c"
  case 312: 
   var $861=(($753)&(255)); //@line 1464 "src/markdown.c"
   var $862=_isalnum($861); //@line 1464 "src/markdown.c"
   var $863=(($862)|(0))==0; //@line 1464 "src/markdown.c"
   if ($863) { label = 313; break; } else { label = 343; break; } //@line 1464 "src/markdown.c"
  case 313: 
   var $865=_prefix_oli($744, $745); //@line 1465 "src/markdown.c"
   var $866=(($865)|(0))==0; //@line 1465 "src/markdown.c"
   if ($866) { label = 314; break; } else { var $end_2_i = $end_0190_i;var $level_1_i = 0;var $end_0188_i = $end_0190_i;label = 344; break; } //@line 1465 "src/markdown.c"
  case 314: 
   var $868=HEAP8[($744)]; //@line 1365 "src/markdown.c"
   var $869=(($868 << 24) >> 24)==32; //@line 1365 "src/markdown.c"
   var $__i125_i=(($869)&(1)); //@line 1365 "src/markdown.c"
   var $870=(($__i125_i)>>>(0)) < (($745)>>>(0)); //@line 1366 "src/markdown.c"
   if ($870) { label = 315; break; } else { var $i_1_i128_i = $__i125_i;label = 316; break; } //@line 1366 "src/markdown.c"
  case 315: 
   var $_sum218=((($_sum202)+($__i125_i))|0); //@line 1366 "src/markdown.c"
   var $872=(($data+$_sum218)|0); //@line 1366 "src/markdown.c"
   var $873=HEAP8[($872)]; //@line 1366 "src/markdown.c"
   var $874=(($873 << 24) >> 24)==32; //@line 1366 "src/markdown.c"
   var $875=(($874)&(1)); //@line 1366 "src/markdown.c"
   var $_i_0_i127_i=((($875)+($__i125_i))|0); //@line 1366 "src/markdown.c"
   var $i_1_i128_i = $_i_0_i127_i;label = 316; break; //@line 1366 "src/markdown.c"
  case 316: 
   var $i_1_i128_i;
   var $877=(($i_1_i128_i)>>>(0)) < (($745)>>>(0)); //@line 1367 "src/markdown.c"
   if ($877) { label = 317; break; } else { var $i_2_i130_i = $i_1_i128_i;label = 318; break; } //@line 1367 "src/markdown.c"
  case 317: 
   var $_sum217=((($_sum202)+($i_1_i128_i))|0); //@line 1367 "src/markdown.c"
   var $879=(($data+$_sum217)|0); //@line 1367 "src/markdown.c"
   var $880=HEAP8[($879)]; //@line 1367 "src/markdown.c"
   var $881=(($880 << 24) >> 24)==32; //@line 1367 "src/markdown.c"
   var $882=(($881)&(1)); //@line 1367 "src/markdown.c"
   var $_i_1_i129_i=((($882)+($i_1_i128_i))|0); //@line 1367 "src/markdown.c"
   var $i_2_i130_i = $_i_1_i129_i;label = 318; break; //@line 1367 "src/markdown.c"
  case 318: 
   var $i_2_i130_i;
   var $884=((($i_2_i130_i)+(1))|0); //@line 1369 "src/markdown.c"
   var $885=(($884)>>>(0)) < (($745)>>>(0)); //@line 1369 "src/markdown.c"
   if ($885) { label = 319; break; } else { label = 338; break; } //@line 1369 "src/markdown.c"
  case 319: 
   var $_sum144_i=((($i_2_i130_i)+($end_0190_i))|0); //@line 1369 "src/markdown.c"
   var $_sum209=((($_sum144_i)+($beg_0359))|0); //@line 1369 "src/markdown.c"
   var $887=(($data+$_sum209)|0); //@line 1369 "src/markdown.c"
   var $888=HEAP8[($887)]; //@line 1369 "src/markdown.c"
   if ((($888 << 24) >> 24)==42 | (($888 << 24) >> 24)==43 | (($888 << 24) >> 24)==45) {
    label = 320; break;
   }
   else {
   label = 338; break;
   }
  case 320: 
   var $_sum210=((($_sum202)+($884))|0); //@line 1369 "src/markdown.c"
   var $890=(($data+$_sum210)|0); //@line 1369 "src/markdown.c"
   var $891=HEAP8[($890)]; //@line 1369 "src/markdown.c"
   var $892=(($891 << 24) >> 24)==32; //@line 1369 "src/markdown.c"
   if ($892) { label = 321; break; } else { label = 338; break; } //@line 1369 "src/markdown.c"
  case 321: 
   var $894=((($745)-($i_2_i130_i))|0); //@line 1374 "src/markdown.c"
   var $i_0_i131_i = 0;label = 322; break; //@line 1296 "src/markdown.c"
  case 322: 
   var $i_0_i131_i;
   var $896=(($i_0_i131_i)>>>(0)) < (($894)>>>(0)); //@line 1296 "src/markdown.c"
   if ($896) { label = 324; break; } else { label = 323; break; } //@line 1296 "src/markdown.c"
  case 323: 
   var $897=((($i_0_i131_i)+(1))|0); //@line 1297 "src/markdown.c"
   var $903 = $897;label = 325; break;
  case 324: 
   var $_sum216=((($_sum209)+($i_0_i131_i))|0); //@line 1296 "src/markdown.c"
   var $899=(($data+$_sum216)|0); //@line 1296 "src/markdown.c"
   var $900=HEAP8[($899)]; //@line 1296 "src/markdown.c"
   var $901=(($900 << 24) >> 24)==10; //@line 1296 "src/markdown.c"
   var $902=((($i_0_i131_i)+(1))|0); //@line 1297 "src/markdown.c"
   if ($901) { var $903 = $902;label = 325; break; } else { var $i_0_i131_i = $902;label = 322; break; }
  case 325: 
   var $903;
   var $904=(($903)>>>(0)) < (($894)>>>(0)); //@line 1299 "src/markdown.c"
   if ($904) { label = 326; break; } else { var $_0_i132_i = 0;label = 337; break; } //@line 1299 "src/markdown.c"
  case 326: 
   var $_sum146_i=((($903)+($_sum144_i))|0); //@line 1302 "src/markdown.c"
   var $_sum211=((($_sum146_i)+($beg_0359))|0); //@line 1302 "src/markdown.c"
   var $906=(($data+$_sum211)|0); //@line 1302 "src/markdown.c"
   var $907=((($894)-($903))|0); //@line 1302 "src/markdown.c"
   var $908=HEAP8[($906)]; //@line 1277 "src/markdown.c"
   if ((($908 << 24) >> 24)==61) {
    var $i_0_i_i_i = 1;label = 327; break;
   }
   else if ((($908 << 24) >> 24)==45) {
    var $i_2_i_i_i = 1;label = 332; break;
   }
   else {
   var $_0_i132_i = 0;label = 337; break;
   }
  case 327: 
   var $i_0_i_i_i;
   var $909=(($i_0_i_i_i)>>>(0)) < (($907)>>>(0)); //@line 1278 "src/markdown.c"
   if ($909) { label = 328; break; } else { var $i_1_i_i_i = $i_0_i_i_i;label = 329; break; } //@line 1278 "src/markdown.c"
  case 328: 
   var $_sum215=((($_sum211)+($i_0_i_i_i))|0); //@line 1278 "src/markdown.c"
   var $911=(($data+$_sum215)|0); //@line 1278 "src/markdown.c"
   var $912=HEAP8[($911)]; //@line 1278 "src/markdown.c"
   var $913=(($912 << 24) >> 24)==61; //@line 1278 "src/markdown.c"
   var $914=((($i_0_i_i_i)+(1))|0); //@line 1278 "src/markdown.c"
   if ($913) { var $i_0_i_i_i = $914;label = 327; break; } else { var $i_1_i_i_i = $i_0_i_i_i;label = 329; break; }
  case 329: 
   var $i_1_i_i_i;
   var $915=(($i_1_i_i_i)>>>(0)) < (($907)>>>(0)); //@line 1279 "src/markdown.c"
   if ($915) { label = 330; break; } else { label = 338; break; } //@line 1279 "src/markdown.c"
  case 330: 
   var $_sum214=((($_sum211)+($i_1_i_i_i))|0); //@line 1279 "src/markdown.c"
   var $917=(($data+$_sum214)|0); //@line 1279 "src/markdown.c"
   var $918=HEAP8[($917)]; //@line 1279 "src/markdown.c"
   var $919=(($918 << 24) >> 24)==32; //@line 1279 "src/markdown.c"
   var $920=((($i_1_i_i_i)+(1))|0); //@line 1279 "src/markdown.c"
   if ($919) { var $i_1_i_i_i = $920;label = 329; break; } else { label = 331; break; }
  case 331: 
   var $922=(($918 << 24) >> 24)==10; //@line 1280 "src/markdown.c"
   var $phitmp31_i_i_i=(($922)&(1)); //@line 1280 "src/markdown.c"
   var $_0_i132_i = $phitmp31_i_i_i;label = 337; break; //@line 1280 "src/markdown.c"
  case 332: 
   var $i_2_i_i_i;
   var $923=(($i_2_i_i_i)>>>(0)) < (($907)>>>(0)); //@line 1284 "src/markdown.c"
   if ($923) { label = 333; break; } else { var $i_3_i_i_i = $i_2_i_i_i;label = 334; break; } //@line 1284 "src/markdown.c"
  case 333: 
   var $_sum213=((($_sum211)+($i_2_i_i_i))|0); //@line 1284 "src/markdown.c"
   var $925=(($data+$_sum213)|0); //@line 1284 "src/markdown.c"
   var $926=HEAP8[($925)]; //@line 1284 "src/markdown.c"
   var $927=(($926 << 24) >> 24)==45; //@line 1284 "src/markdown.c"
   var $928=((($i_2_i_i_i)+(1))|0); //@line 1284 "src/markdown.c"
   if ($927) { var $i_2_i_i_i = $928;label = 332; break; } else { var $i_3_i_i_i = $i_2_i_i_i;label = 334; break; }
  case 334: 
   var $i_3_i_i_i;
   var $929=(($i_3_i_i_i)>>>(0)) < (($907)>>>(0)); //@line 1285 "src/markdown.c"
   if ($929) { label = 335; break; } else { label = 338; break; } //@line 1285 "src/markdown.c"
  case 335: 
   var $_sum212=((($_sum211)+($i_3_i_i_i))|0); //@line 1285 "src/markdown.c"
   var $931=(($data+$_sum212)|0); //@line 1285 "src/markdown.c"
   var $932=HEAP8[($931)]; //@line 1285 "src/markdown.c"
   var $933=(($932 << 24) >> 24)==32; //@line 1285 "src/markdown.c"
   var $934=((($i_3_i_i_i)+(1))|0); //@line 1285 "src/markdown.c"
   if ($933) { var $i_3_i_i_i = $934;label = 334; break; } else { label = 336; break; }
  case 336: 
   var $936=(($932 << 24) >> 24)==10; //@line 1286 "src/markdown.c"
   var $phitmp_i_i_i=$936 ? 2 : 0; //@line 1286 "src/markdown.c"
   var $_0_i132_i = $phitmp_i_i_i;label = 337; break; //@line 1286 "src/markdown.c"
  case 337: 
   var $_0_i132_i;
   var $937=(($i_2_i130_i)|(0))==-2; //@line 1466 "src/markdown.c"
   var $not__i=(($_0_i132_i)|(0))!=0; //@line 1466 "src/markdown.c"
   var $938=$937 | $not__i; //@line 1466 "src/markdown.c"
   if ($938) { label = 338; break; } else { var $end_2_i = $end_0190_i;var $level_1_i = 0;var $end_0188_i = $end_0190_i;label = 344; break; } //@line 1466 "src/markdown.c"
  case 338: 
   var $939=(($868 << 24) >> 24)==60; //@line 1472 "src/markdown.c"
   if ($939) { label = 339; break; } else { label = 341; break; } //@line 1472 "src/markdown.c"
  case 339: 
   var $941=HEAP32[(($16)>>2)]; //@line 1472 "src/markdown.c"
   var $942=(($941)|(0))==0; //@line 1472 "src/markdown.c"
   if ($942) { label = 341; break; } else { label = 340; break; } //@line 1472 "src/markdown.c"
  case 340: 
   var $944=_parse_htmlblock($ob, $rndr, $744, $745, 0); //@line 1473 "src/markdown.c"
   var $945=(($944)|(0))==0; //@line 1473 "src/markdown.c"
   if ($945) { label = 341; break; } else { var $end_2_i = $end_0190_i;var $level_1_i = 0;var $end_0188_i = $end_0190_i;label = 344; break; } //@line 1473 "src/markdown.c"
  case 341: 
   var $947=HEAP32[(($10)>>2)]; //@line 1479 "src/markdown.c"
   var $948=$947 & 4; //@line 1479 "src/markdown.c"
   var $949=(($948)|(0))==0; //@line 1479 "src/markdown.c"
   if ($949) { label = 343; break; } else { label = 342; break; } //@line 1479 "src/markdown.c"
  case 342: 
   var $951=_is_codefence($744, $745, 0); //@line 1480 "src/markdown.c"
   var $_not_i=(($951)|(0))!=0; //@line 1480 "src/markdown.c"
   var $_not220_i=$_lcssa405 ^ 1; //@line 1480 "src/markdown.c"
   var $brmerge_i=$_not_i | $_not220_i; //@line 1480 "src/markdown.c"
   var $end_0190_mux_i=$_not_i ? $end_0190_i : $end_1_i; //@line 1480 "src/markdown.c"
   if ($brmerge_i) { var $end_2_i = $end_0190_mux_i;var $level_1_i = 0;var $end_0188_i = $end_0190_mux_i;label = 344; break; } else { var $end_0190_i = $end_1_i;label = 263; break; } //@line 1480 "src/markdown.c"
  case 343: 
   if ($_lcssa405) { var $end_0190_i = $end_1_i;label = 263; break; } else { var $end_2_i = $end_1_i;var $level_1_i = 0;var $end_0188_i = $end_1_i;label = 344; break; } //@line 1439 "src/markdown.c"
  case 344: 
   var $end_0188_i;
   var $level_1_i;
   var $end_2_i;
   var $work_sroa_1_0_i = $end_0188_i;label = 345; break; //@line 1490 "src/markdown.c"
  case 345: 
   var $work_sroa_1_0_i;
   var $953=(($work_sroa_1_0_i)|(0))==0; //@line 1490 "src/markdown.c"
   if ($953) { var $work_sroa_1_0_lcssa_i = 0;var $_lcssa_i = 0;label = 347; break; } else { label = 346; break; } //@line 1490 "src/markdown.c"
  case 346: 
   var $955=((($work_sroa_1_0_i)-(1))|0); //@line 1490 "src/markdown.c"
   var $_sum204=((($955)+($beg_0359))|0); //@line 1490 "src/markdown.c"
   var $956=(($data+$_sum204)|0); //@line 1490 "src/markdown.c"
   var $957=HEAP8[($956)]; //@line 1490 "src/markdown.c"
   var $958=(($957 << 24) >> 24)==10; //@line 1490 "src/markdown.c"
   if ($958) { var $work_sroa_1_0_i = $955;label = 345; break; } else { var $work_sroa_1_0_lcssa_i = $work_sroa_1_0_i;var $_lcssa_i = 1;label = 347; break; }
  case 347: 
   var $_lcssa_i;
   var $work_sroa_1_0_lcssa_i;
   var $959=(($level_1_i)|(0))==0; //@line 1493 "src/markdown.c"
   if ($959) { label = 348; break; } else { label = 355; break; } //@line 1493 "src/markdown.c"
  case 348: 
   var $961=HEAP32[(($3)>>2)]; //@line 132 "src/markdown.c"
   var $962=HEAP32[(($18)>>2)]; //@line 132 "src/markdown.c"
   var $963=(($961)>>>(0)) < (($962)>>>(0)); //@line 132 "src/markdown.c"
   if ($963) { label = 349; break; } else { label = 351; break; } //@line 132 "src/markdown.c"
  case 349: 
   var $965=HEAP32[(($19)>>2)]; //@line 132 "src/markdown.c"
   var $966=(($965+($961<<2))|0); //@line 132 "src/markdown.c"
   var $967=HEAP32[(($966)>>2)]; //@line 132 "src/markdown.c"
   var $968=(($967)|(0))==0; //@line 132 "src/markdown.c"
   if ($968) { label = 351; break; } else { label = 350; break; } //@line 132 "src/markdown.c"
  case 350: 
   var $970=((($961)+(1))|0); //@line 134 "src/markdown.c"
   HEAP32[(($3)>>2)]=$970; //@line 134 "src/markdown.c"
   var $971=HEAP32[(($966)>>2)]; //@line 134 "src/markdown.c"
   var $972=$971; //@line 134 "src/markdown.c"
   var $973=(($971+4)|0); //@line 135 "src/markdown.c"
   var $974=$973; //@line 135 "src/markdown.c"
   HEAP32[(($974)>>2)]=0; //@line 135 "src/markdown.c"
   var $work_0_i133_i = $972;label = 352; break; //@line 136 "src/markdown.c"
  case 351: 
   var $976=_bufnew(256); //@line 137 "src/markdown.c"
   var $977=$976; //@line 138 "src/markdown.c"
   var $978=_stack_push($17, $977); //@line 138 "src/markdown.c"
   var $work_0_i133_i = $976;label = 352; break;
  case 352: 
   var $work_0_i133_i;
   _parse_inline($work_0_i133_i, $rndr, $30, $work_sroa_1_0_lcssa_i); //@line 1495 "src/markdown.c"
   var $979=HEAP32[(($22)>>2)]; //@line 1496 "src/markdown.c"
   var $980=(($979)|(0))==0; //@line 1496 "src/markdown.c"
   if ($980) { label = 354; break; } else { label = 353; break; } //@line 1496 "src/markdown.c"
  case 353: 
   var $982=HEAP32[(($15)>>2)]; //@line 1497 "src/markdown.c"
   FUNCTION_TABLE[$979]($ob, $work_0_i133_i, $982); //@line 1497 "src/markdown.c"
   label = 354; break; //@line 1497 "src/markdown.c"
  case 354: 
   var $984=HEAP32[(($3)>>2)]; //@line 147 "src/markdown.c"
   var $985=((($984)-(1))|0); //@line 147 "src/markdown.c"
   HEAP32[(($3)>>2)]=$985; //@line 147 "src/markdown.c"
   label = 374; break; //@line 1499 "src/markdown.c"
  case 355: 
   if ($_lcssa_i) { var $work_sroa_1_1_in_i = $work_sroa_1_0_lcssa_i;label = 356; break; } else { var $work_sroa_1_3_i = 0;var $work_sroa_0_0_i = $30;label = 367; break; } //@line 1502 "src/markdown.c"
  case 356: 
   var $work_sroa_1_1_in_i;
   var $work_sroa_1_1_i=((($work_sroa_1_1_in_i)-(1))|0); //@line 1505 "src/markdown.c"
   var $987=(($work_sroa_1_1_i)|(0))==0; //@line 1507 "src/markdown.c"
   if ($987) { var $work_sroa_1_2_i = 0;label = 358; break; } else { label = 357; break; } //@line 1507 "src/markdown.c"
  case 357: 
   var $_sum205=((($work_sroa_1_1_i)+($beg_0359))|0); //@line 1507 "src/markdown.c"
   var $989=(($data+$_sum205)|0); //@line 1507 "src/markdown.c"
   var $990=HEAP8[($989)]; //@line 1507 "src/markdown.c"
   var $991=(($990 << 24) >> 24)==10; //@line 1507 "src/markdown.c"
   if ($991) { var $work_sroa_1_2_i = $work_sroa_1_1_i;label = 358; break; } else { var $work_sroa_1_1_in_i = $work_sroa_1_1_i;label = 356; break; }
  case 358: 
   var $work_sroa_1_2_i;
   var $cond_i=(($work_sroa_1_2_i)|(0))==0; //@line 1511 "src/markdown.c"
   if ($cond_i) { var $work_sroa_1_3_i = $work_sroa_1_0_lcssa_i;var $work_sroa_0_0_i = $30;label = 367; break; } else { label = 359; break; } //@line 1511 "src/markdown.c"
  case 359: 
   var $993=((($work_sroa_1_2_i)-(1))|0); //@line 1511 "src/markdown.c"
   var $_sum206=((($993)+($beg_0359))|0); //@line 1511 "src/markdown.c"
   var $994=(($data+$_sum206)|0); //@line 1511 "src/markdown.c"
   var $995=HEAP8[($994)]; //@line 1511 "src/markdown.c"
   var $996=(($995 << 24) >> 24)==10; //@line 1511 "src/markdown.c"
   if ($996) { var $work_sroa_1_2_i = $993;label = 358; break; } else { label = 360; break; }
  case 360: 
   var $998=HEAP32[(($3)>>2)]; //@line 132 "src/markdown.c"
   var $999=HEAP32[(($18)>>2)]; //@line 132 "src/markdown.c"
   var $1000=(($998)>>>(0)) < (($999)>>>(0)); //@line 132 "src/markdown.c"
   if ($1000) { label = 361; break; } else { label = 363; break; } //@line 132 "src/markdown.c"
  case 361: 
   var $1002=HEAP32[(($19)>>2)]; //@line 132 "src/markdown.c"
   var $1003=(($1002+($998<<2))|0); //@line 132 "src/markdown.c"
   var $1004=HEAP32[(($1003)>>2)]; //@line 132 "src/markdown.c"
   var $1005=(($1004)|(0))==0; //@line 132 "src/markdown.c"
   if ($1005) { label = 363; break; } else { label = 362; break; } //@line 132 "src/markdown.c"
  case 362: 
   var $1007=((($998)+(1))|0); //@line 134 "src/markdown.c"
   HEAP32[(($3)>>2)]=$1007; //@line 134 "src/markdown.c"
   var $1008=HEAP32[(($1003)>>2)]; //@line 134 "src/markdown.c"
   var $1009=$1008; //@line 134 "src/markdown.c"
   var $1010=(($1008+4)|0); //@line 135 "src/markdown.c"
   var $1011=$1010; //@line 135 "src/markdown.c"
   HEAP32[(($1011)>>2)]=0; //@line 135 "src/markdown.c"
   var $work_0_i135_i = $1009;label = 364; break; //@line 136 "src/markdown.c"
  case 363: 
   var $1013=_bufnew(256); //@line 137 "src/markdown.c"
   var $1014=$1013; //@line 138 "src/markdown.c"
   var $1015=_stack_push($17, $1014); //@line 138 "src/markdown.c"
   var $work_0_i135_i = $1013;label = 364; break;
  case 364: 
   var $work_0_i135_i;
   _parse_inline($work_0_i135_i, $rndr, $30, $work_sroa_1_2_i); //@line 1516 "src/markdown.c"
   var $1016=HEAP32[(($22)>>2)]; //@line 1518 "src/markdown.c"
   var $1017=(($1016)|(0))==0; //@line 1518 "src/markdown.c"
   if ($1017) { label = 366; break; } else { label = 365; break; } //@line 1518 "src/markdown.c"
  case 365: 
   var $1019=HEAP32[(($15)>>2)]; //@line 1519 "src/markdown.c"
   FUNCTION_TABLE[$1016]($ob, $work_0_i135_i, $1019); //@line 1519 "src/markdown.c"
   label = 366; break; //@line 1519 "src/markdown.c"
  case 366: 
   var $1021=HEAP32[(($3)>>2)]; //@line 147 "src/markdown.c"
   var $1022=((($1021)-(1))|0); //@line 147 "src/markdown.c"
   HEAP32[(($3)>>2)]=$1022; //@line 147 "src/markdown.c"
   var $_sum207=((($work_sroa_1_1_in_i)+($beg_0359))|0); //@line 1522 "src/markdown.c"
   var $1023=(($data+$_sum207)|0); //@line 1522 "src/markdown.c"
   var $1024=((($work_sroa_1_0_lcssa_i)-($work_sroa_1_1_in_i))|0); //@line 1523 "src/markdown.c"
   var $work_sroa_1_3_i = $1024;var $work_sroa_0_0_i = $1023;label = 367; break; //@line 1524 "src/markdown.c"
  case 367: 
   var $work_sroa_0_0_i;
   var $work_sroa_1_3_i;
   var $1025=HEAP32[(($1)>>2)]; //@line 132 "src/markdown.c"
   var $1026=HEAP32[(($12)>>2)]; //@line 132 "src/markdown.c"
   var $1027=(($1025)>>>(0)) < (($1026)>>>(0)); //@line 132 "src/markdown.c"
   if ($1027) { label = 368; break; } else { label = 370; break; } //@line 132 "src/markdown.c"
  case 368: 
   var $1029=HEAP32[(($13)>>2)]; //@line 132 "src/markdown.c"
   var $1030=(($1029+($1025<<2))|0); //@line 132 "src/markdown.c"
   var $1031=HEAP32[(($1030)>>2)]; //@line 132 "src/markdown.c"
   var $1032=(($1031)|(0))==0; //@line 132 "src/markdown.c"
   if ($1032) { label = 370; break; } else { label = 369; break; } //@line 132 "src/markdown.c"
  case 369: 
   var $1034=((($1025)+(1))|0); //@line 134 "src/markdown.c"
   HEAP32[(($1)>>2)]=$1034; //@line 134 "src/markdown.c"
   var $1035=HEAP32[(($1030)>>2)]; //@line 134 "src/markdown.c"
   var $1036=$1035; //@line 134 "src/markdown.c"
   var $1037=(($1035+4)|0); //@line 135 "src/markdown.c"
   var $1038=$1037; //@line 135 "src/markdown.c"
   HEAP32[(($1038)>>2)]=0; //@line 135 "src/markdown.c"
   var $work_0_i_i = $1036;label = 371; break; //@line 136 "src/markdown.c"
  case 370: 
   var $1040=_bufnew(64); //@line 137 "src/markdown.c"
   var $1041=$1040; //@line 138 "src/markdown.c"
   var $1042=_stack_push($11, $1041); //@line 138 "src/markdown.c"
   var $work_0_i_i = $1040;label = 371; break;
  case 371: 
   var $work_0_i_i;
   _parse_inline($work_0_i_i, $rndr, $work_sroa_0_0_i, $work_sroa_1_3_i); //@line 1529 "src/markdown.c"
   var $1043=HEAP32[(($14)>>2)]; //@line 1531 "src/markdown.c"
   var $1044=(($1043)|(0))==0; //@line 1531 "src/markdown.c"
   if ($1044) { label = 373; break; } else { label = 372; break; } //@line 1531 "src/markdown.c"
  case 372: 
   var $1046=HEAP32[(($15)>>2)]; //@line 1532 "src/markdown.c"
   FUNCTION_TABLE[$1043]($ob, $work_0_i_i, $level_1_i, $1046); //@line 1532 "src/markdown.c"
   label = 373; break; //@line 1532 "src/markdown.c"
  case 373: 
   var $1048=HEAP32[(($1)>>2)]; //@line 147 "src/markdown.c"
   var $1049=((($1048)-(1))|0); //@line 147 "src/markdown.c"
   HEAP32[(($1)>>2)]=$1049; //@line 147 "src/markdown.c"
   label = 374; break;
  case 374: 
   var $1050=((($end_2_i)+($beg_0359))|0); //@line 2243 "src/markdown.c"
   var $beg_0_be = $1050;label = 33; break;
  case 375: 
   STACKTOP = sp;
   return; //@line 2245 "src/markdown.c"
  default: assert(0, "bad label: " + label);
 }
}
function _sd_version($ver_major, $ver_minor, $ver_revision) {
 var label = 0;
 HEAP32[(($ver_major)>>2)]=1; //@line 2552 "src/markdown.c"
 HEAP32[(($ver_minor)>>2)]=16; //@line 2553 "src/markdown.c"
 HEAP32[(($ver_revision)>>2)]=0; //@line 2554 "src/markdown.c"
 return; //@line 2555 "src/markdown.c"
}
Module["_sd_version"] = _sd_version;
function _sd_markdown_free($md) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($md+408)|0); //@line 2537 "src/markdown.c"
   var $2=(($md+416)|0); //@line 2537 "src/markdown.c"
   var $3=HEAP32[(($2)>>2)]; //@line 2537 "src/markdown.c"
   var $4=(($3)|(0))==0; //@line 2537 "src/markdown.c"
   if ($4) { label = 3; break; } else { label = 2; break; } //@line 2537 "src/markdown.c"
  case 2: 
   var $5=(($1)|0); //@line 2538 "src/markdown.c"
   var $i_014 = 0;label = 5; break; //@line 2537 "src/markdown.c"
  case 3: 
   var $6=(($md+396)|0); //@line 2540 "src/markdown.c"
   var $7=(($md+404)|0); //@line 2540 "src/markdown.c"
   var $8=HEAP32[(($7)>>2)]; //@line 2540 "src/markdown.c"
   var $9=(($8)|(0))==0; //@line 2540 "src/markdown.c"
   if ($9) { label = 7; break; } else { label = 4; break; } //@line 2540 "src/markdown.c"
  case 4: 
   var $10=(($6)|0); //@line 2541 "src/markdown.c"
   var $i_112 = 0;label = 6; break; //@line 2540 "src/markdown.c"
  case 5: 
   var $i_014;
   var $12=HEAP32[(($5)>>2)]; //@line 2538 "src/markdown.c"
   var $13=(($12+($i_014<<2))|0); //@line 2538 "src/markdown.c"
   var $14=HEAP32[(($13)>>2)]; //@line 2538 "src/markdown.c"
   var $15=$14; //@line 2538 "src/markdown.c"
   _bufrelease($15); //@line 2538 "src/markdown.c"
   var $16=((($i_014)+(1))|0); //@line 2537 "src/markdown.c"
   var $17=HEAP32[(($2)>>2)]; //@line 2537 "src/markdown.c"
   var $18=(($16)>>>(0)) < (($17)>>>(0)); //@line 2537 "src/markdown.c"
   if ($18) { var $i_014 = $16;label = 5; break; } else { label = 3; break; } //@line 2537 "src/markdown.c"
  case 6: 
   var $i_112;
   var $20=HEAP32[(($10)>>2)]; //@line 2541 "src/markdown.c"
   var $21=(($20+($i_112<<2))|0); //@line 2541 "src/markdown.c"
   var $22=HEAP32[(($21)>>2)]; //@line 2541 "src/markdown.c"
   var $23=$22; //@line 2541 "src/markdown.c"
   _bufrelease($23); //@line 2541 "src/markdown.c"
   var $24=((($i_112)+(1))|0); //@line 2540 "src/markdown.c"
   var $25=HEAP32[(($7)>>2)]; //@line 2540 "src/markdown.c"
   var $26=(($24)>>>(0)) < (($25)>>>(0)); //@line 2540 "src/markdown.c"
   if ($26) { var $i_112 = $24;label = 6; break; } else { label = 7; break; } //@line 2540 "src/markdown.c"
  case 7: 
   _stack_free($1); //@line 2543 "src/markdown.c"
   _stack_free($6); //@line 2544 "src/markdown.c"
   var $27=$md; //@line 2546 "src/markdown.c"
   _free($27); //@line 2546 "src/markdown.c"
   return; //@line 2547 "src/markdown.c"
  default: assert(0, "bad label: " + label);
 }
}
Module["_sd_markdown_free"] = _sd_markdown_free;
function _parse_htmlblock($ob, $rndr, $data, $size, $do_render) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 16)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $work=sp;
   var $1=(($work)|0); //@line 1903 "src/markdown.c"
   HEAP32[(($1)>>2)]=$data; //@line 1903 "src/markdown.c"
   var $2=(($work+4)|0); //@line 1903 "src/markdown.c"
   HEAP32[(($2)>>2)]=0; //@line 1903 "src/markdown.c"
   var $3=(($work+8)|0); //@line 1903 "src/markdown.c"
   HEAP32[(($3)>>2)]=0; //@line 1903 "src/markdown.c"
   var $4=(($work+12)|0); //@line 1903 "src/markdown.c"
   HEAP32[(($4)>>2)]=0; //@line 1903 "src/markdown.c"
   var $5=(($size)>>>(0)) < 2; //@line 1906 "src/markdown.c"
   if ($5) { var $_0 = 0;label = 51; break; } else { label = 2; break; } //@line 1906 "src/markdown.c"
  case 2: 
   var $7=HEAP8[($data)]; //@line 1906 "src/markdown.c"
   var $8=(($7 << 24) >> 24)==60; //@line 1906 "src/markdown.c"
   var $9=(($size)>>>(0)) > 1; //@line 1910 "src/markdown.c"
   var $or_cond=$8 & $9; //@line 1906 "src/markdown.c"
   if ($or_cond) { var $i_0105 = 1;label = 3; break; } else { var $_0 = 0;label = 51; break; } //@line 1906 "src/markdown.c"
  case 3: 
   var $i_0105;
   var $10=(($data+$i_0105)|0); //@line 1910 "src/markdown.c"
   var $11=HEAP8[($10)]; //@line 1910 "src/markdown.c"
   if ((($11 << 24) >> 24)==62 | (($11 << 24) >> 24)==32) {
    label = 5; break;
   }
   else {
   label = 4; break;
   }
  case 4: 
   var $13=((($i_0105)+(1))|0); //@line 1911 "src/markdown.c"
   var $14=(($13)>>>(0)) < (($size)>>>(0)); //@line 1910 "src/markdown.c"
   if ($14) { var $i_0105 = $13;label = 3; break; } else { label = 12; break; } //@line 1910 "src/markdown.c"
  case 5: 
   var $16=(($data+1)|0); //@line 1914 "src/markdown.c"
   var $17=((($i_0105)-(1))|0); //@line 1914 "src/markdown.c"
   var $18=(($17)>>>(0)) < 11; //@line 193 "src/html_blocks.h"
   var $19=(($17)|(0))!=0; //@line 193 "src/html_blocks.h"
   var $or_cond_i=$18 & $19; //@line 193 "src/html_blocks.h"
   if ($or_cond_i) { label = 6; break; } else { label = 12; break; } //@line 193 "src/html_blocks.h"
  case 6: 
   var $cond_i_i=(($17)|(0))==1; //@line 125 "src/html_blocks.h"
   if ($cond_i_i) { var $hval_0_i_i = 1;label = 8; break; } else { label = 7; break; } //@line 125 "src/html_blocks.h"
  case 7: 
   var $22=(($data+2)|0); //@line 128 "src/html_blocks.h"
   var $23=HEAP8[($22)]; //@line 128 "src/html_blocks.h"
   var $24=(($23)&(255)); //@line 128 "src/html_blocks.h"
   var $25=((($24)+(1))|0); //@line 128 "src/html_blocks.h"
   var $26=((632+$25)|0); //@line 128 "src/html_blocks.h"
   var $27=HEAP8[($26)]; //@line 128 "src/html_blocks.h"
   var $28=(($27)&(255)); //@line 128 "src/html_blocks.h"
   var $29=((($28)+($17))|0); //@line 128 "src/html_blocks.h"
   var $hval_0_i_i = $29;label = 8; break; //@line 128 "src/html_blocks.h"
  case 8: 
   var $hval_0_i_i;
   var $30=HEAP8[($16)]; //@line 131 "src/html_blocks.h"
   var $31=(($30)&(255)); //@line 131 "src/html_blocks.h"
   var $32=((632+$31)|0); //@line 131 "src/html_blocks.h"
   var $33=HEAP8[($32)]; //@line 131 "src/html_blocks.h"
   var $34=(($33)&(255)); //@line 131 "src/html_blocks.h"
   var $35=((($34)+($hval_0_i_i))|0); //@line 131 "src/html_blocks.h"
   var $36=(($35)>>>(0)) < 38; //@line 197 "src/html_blocks.h"
   if ($36) { label = 9; break; } else { label = 12; break; } //@line 197 "src/html_blocks.h"
  case 9: 
   var $38=((896+($35<<2))|0); //@line 199 "src/html_blocks.h"
   var $39=HEAP32[(($38)>>2)]; //@line 199 "src/html_blocks.h"
   var $40=HEAP8[($39)]; //@line 201 "src/html_blocks.h"
   var $41=$40 ^ $30; //@line 201 "src/html_blocks.h"
   var $42=$41 & -33; //@line 201 "src/html_blocks.h"
   var $43=(($42 << 24) >> 24)==0; //@line 201 "src/html_blocks.h"
   if ($43) { label = 10; break; } else { label = 12; break; } //@line 201 "src/html_blocks.h"
  case 10: 
   var $45=_strncasecmp($16, $39, $17); //@line 201 "src/html_blocks.h"
   var $46=(($45)|(0))==0; //@line 201 "src/html_blocks.h"
   if ($46) { label = 11; break; } else { label = 12; break; } //@line 201 "src/html_blocks.h"
  case 11: 
   var $48=(($39+$17)|0); //@line 201 "src/html_blocks.h"
   var $49=HEAP8[($48)]; //@line 201 "src/html_blocks.h"
   var $50=(($49 << 24) >> 24)==0; //@line 201 "src/html_blocks.h"
   if ($50) { label = 44; break; } else { label = 12; break; } //@line 201 "src/html_blocks.h"
  case 12: 
   var $51=(($size)>>>(0)) > 5; //@line 1920 "src/markdown.c"
   if ($51) { label = 13; break; } else { label = 30; break; } //@line 1920 "src/markdown.c"
  case 13: 
   var $53=(($data+1)|0); //@line 1920 "src/markdown.c"
   var $54=HEAP8[($53)]; //@line 1920 "src/markdown.c"
   var $55=(($54 << 24) >> 24)==33; //@line 1920 "src/markdown.c"
   if ($55) { label = 14; break; } else { label = 30; break; } //@line 1920 "src/markdown.c"
  case 14: 
   var $57=(($data+2)|0); //@line 1920 "src/markdown.c"
   var $58=HEAP8[($57)]; //@line 1920 "src/markdown.c"
   var $59=(($58 << 24) >> 24)==45; //@line 1920 "src/markdown.c"
   if ($59) { label = 15; break; } else { label = 30; break; } //@line 1920 "src/markdown.c"
  case 15: 
   var $61=(($data+3)|0); //@line 1920 "src/markdown.c"
   var $62=HEAP8[($61)]; //@line 1920 "src/markdown.c"
   var $63=(($62 << 24) >> 24)==45; //@line 1920 "src/markdown.c"
   if ($63) { var $i_1102 = 5;label = 16; break; } else { label = 30; break; } //@line 1920 "src/markdown.c"
  case 16: 
   var $i_1102;
   var $64=((($i_1102)-(2))|0); //@line 1923 "src/markdown.c"
   var $65=(($data+$64)|0); //@line 1923 "src/markdown.c"
   var $66=HEAP8[($65)]; //@line 1923 "src/markdown.c"
   var $67=(($66 << 24) >> 24)==45; //@line 1923 "src/markdown.c"
   if ($67) { label = 17; break; } else { label = 18; break; } //@line 1923 "src/markdown.c"
  case 17: 
   var $69=((($i_1102)-(1))|0); //@line 1923 "src/markdown.c"
   var $70=(($data+$69)|0); //@line 1923 "src/markdown.c"
   var $71=HEAP8[($70)]; //@line 1923 "src/markdown.c"
   var $72=(($71 << 24) >> 24)==45; //@line 1923 "src/markdown.c"
   if ($72) { label = 20; break; } else { label = 18; break; } //@line 1923 "src/markdown.c"
  case 18: 
   var $73=((($i_1102)+(1))|0); //@line 1924 "src/markdown.c"
   var $i_1_be = $73;label = 19; break;
  case 19: 
   var $i_1_be;
   var $74=(($i_1_be)>>>(0)) < (($size)>>>(0)); //@line 1923 "src/markdown.c"
   if ($74) { var $i_1102 = $i_1_be;label = 16; break; } else { label = 21; break; } //@line 1923 "src/markdown.c"
  case 20: 
   var $76=(($data+$i_1102)|0); //@line 1923 "src/markdown.c"
   var $77=HEAP8[($76)]; //@line 1923 "src/markdown.c"
   var $phitmp=(($77 << 24) >> 24)==62;
   var $78=((($i_1102)+(1))|0); //@line 1924 "src/markdown.c"
   if ($phitmp) { var $i_2 = $78;label = 22; break; } else { var $i_1_be = $78;label = 19; break; }
  case 21: 
   var $79=((($i_1_be)+(1))|0); //@line 1924 "src/markdown.c"
   var $i_2 = $79;label = 22; break;
  case 22: 
   var $i_2;
   var $80=(($i_2)>>>(0)) < (($size)>>>(0)); //@line 1928 "src/markdown.c"
   if ($80) { label = 23; break; } else { label = 30; break; } //@line 1928 "src/markdown.c"
  case 23: 
   var $82=((($size)-($i_2))|0); //@line 1929 "src/markdown.c"
   var $83=(($i_2)|(0))==(($size)|(0)); //@line 1124 "src/markdown.c"
   if ($83) { var $91 = 1;label = 27; break; } else { var $i_08_i = 0;label = 24; break; } //@line 1124 "src/markdown.c"
  case 24: 
   var $i_08_i;
   var $_sum96=((($i_08_i)+($i_2))|0); //@line 1124 "src/markdown.c"
   var $84=(($data+$_sum96)|0); //@line 1124 "src/markdown.c"
   var $85=HEAP8[($84)]; //@line 1124 "src/markdown.c"
   if ((($85 << 24) >> 24)==32) {
    label = 25; break;
   }
   else if ((($85 << 24) >> 24)==10) {
    var $i_0_lcssa_i = $i_08_i;label = 26; break;
   }
   else {
   label = 30; break;
   }
  case 25: 
   var $87=((($i_08_i)+(1))|0); //@line 1124 "src/markdown.c"
   var $88=(($87)>>>(0)) < (($82)>>>(0)); //@line 1124 "src/markdown.c"
   if ($88) { var $i_08_i = $87;label = 24; break; } else { var $i_0_lcssa_i = $87;label = 26; break; } //@line 1124 "src/markdown.c"
  case 26: 
   var $i_0_lcssa_i;
   var $89=((($i_0_lcssa_i)+(1))|0); //@line 1128 "src/markdown.c"
   var $90=(($89)|(0))==0; //@line 1931 "src/markdown.c"
   if ($90) { label = 30; break; } else { var $91 = $89;label = 27; break; } //@line 1931 "src/markdown.c"
  case 27: 
   var $91;
   var $92=((($91)+($i_2))|0); //@line 1932 "src/markdown.c"
   HEAP32[(($2)>>2)]=$92; //@line 1932 "src/markdown.c"
   var $93=(($do_render)|(0))==0; //@line 1933 "src/markdown.c"
   if ($93) { var $_0 = $92;label = 51; break; } else { label = 28; break; } //@line 1933 "src/markdown.c"
  case 28: 
   var $95=(($rndr+8)|0); //@line 1933 "src/markdown.c"
   var $96=HEAP32[(($95)>>2)]; //@line 1933 "src/markdown.c"
   var $97=(($96)|(0))==0; //@line 1933 "src/markdown.c"
   if ($97) { var $_0 = $92;label = 51; break; } else { label = 29; break; } //@line 1933 "src/markdown.c"
  case 29: 
   var $99=(($rndr+104)|0); //@line 1934 "src/markdown.c"
   var $100=HEAP32[(($99)>>2)]; //@line 1934 "src/markdown.c"
   FUNCTION_TABLE[$96]($ob, $work, $100); //@line 1934 "src/markdown.c"
   var $_pre=HEAP32[(($2)>>2)]; //@line 1935 "src/markdown.c"
   var $_0 = $_pre;label = 51; break; //@line 1934 "src/markdown.c"
  case 30: 
   var $101=(($size)>>>(0)) > 4; //@line 1940 "src/markdown.c"
   if ($101) { label = 31; break; } else { var $_0 = 0;label = 51; break; } //@line 1940 "src/markdown.c"
  case 31: 
   var $103=(($data+1)|0); //@line 1940 "src/markdown.c"
   var $104=HEAP8[($103)]; //@line 1940 "src/markdown.c"
   if ((($104 << 24) >> 24)==104 | (($104 << 24) >> 24)==72) {
    label = 32; break;
   }
   else {
   var $_0 = 0;label = 51; break;
   }
  case 32: 
   var $105=(($data+2)|0); //@line 1940 "src/markdown.c"
   var $106=HEAP8[($105)]; //@line 1940 "src/markdown.c"
   if ((($106 << 24) >> 24)==114 | (($106 << 24) >> 24)==82) {
    var $i_3 = 3;label = 33; break;
   }
   else {
   var $_0 = 0;label = 51; break;
   }
  case 33: 
   var $i_3;
   var $107=(($i_3)>>>(0)) < (($size)>>>(0)); //@line 1942 "src/markdown.c"
   if ($107) { label = 35; break; } else { label = 34; break; } //@line 1942 "src/markdown.c"
  case 34: 
   var $108=((($i_3)+(1))|0); //@line 1943 "src/markdown.c"
   var $114 = $108;label = 36; break;
  case 35: 
   var $110=(($data+$i_3)|0); //@line 1942 "src/markdown.c"
   var $111=HEAP8[($110)]; //@line 1942 "src/markdown.c"
   var $112=(($111 << 24) >> 24)==62; //@line 1942 "src/markdown.c"
   var $113=((($i_3)+(1))|0); //@line 1943 "src/markdown.c"
   if ($112) { var $114 = $113;label = 36; break; } else { var $i_3 = $113;label = 33; break; }
  case 36: 
   var $114;
   var $115=(($114)>>>(0)) < (($size)>>>(0)); //@line 1945 "src/markdown.c"
   if ($115) { label = 37; break; } else { var $_0 = 0;label = 51; break; } //@line 1945 "src/markdown.c"
  case 37: 
   var $117=((($size)-($114))|0); //@line 1947 "src/markdown.c"
   var $118=(($114)|(0))==(($size)|(0)); //@line 1124 "src/markdown.c"
   if ($118) { var $126 = 1;label = 41; break; } else { var $i_08_i84 = 0;label = 38; break; } //@line 1124 "src/markdown.c"
  case 38: 
   var $i_08_i84;
   var $_sum=((($i_08_i84)+($114))|0); //@line 1124 "src/markdown.c"
   var $119=(($data+$_sum)|0); //@line 1124 "src/markdown.c"
   var $120=HEAP8[($119)]; //@line 1124 "src/markdown.c"
   if ((($120 << 24) >> 24)==32) {
    label = 39; break;
   }
   else if ((($120 << 24) >> 24)==10) {
    var $i_0_lcssa_i86 = $i_08_i84;label = 40; break;
   }
   else {
   var $_0 = 0;label = 51; break;
   }
  case 39: 
   var $122=((($i_08_i84)+(1))|0); //@line 1124 "src/markdown.c"
   var $123=(($122)>>>(0)) < (($117)>>>(0)); //@line 1124 "src/markdown.c"
   if ($123) { var $i_08_i84 = $122;label = 38; break; } else { var $i_0_lcssa_i86 = $122;label = 40; break; } //@line 1124 "src/markdown.c"
  case 40: 
   var $i_0_lcssa_i86;
   var $124=((($i_0_lcssa_i86)+(1))|0); //@line 1128 "src/markdown.c"
   var $125=(($124)|(0))==0; //@line 1948 "src/markdown.c"
   if ($125) { var $_0 = 0;label = 51; break; } else { var $126 = $124;label = 41; break; } //@line 1948 "src/markdown.c"
  case 41: 
   var $126;
   var $127=((($126)+($114))|0); //@line 1949 "src/markdown.c"
   HEAP32[(($2)>>2)]=$127; //@line 1949 "src/markdown.c"
   var $128=(($do_render)|(0))==0; //@line 1950 "src/markdown.c"
   if ($128) { var $_0 = $127;label = 51; break; } else { label = 42; break; } //@line 1950 "src/markdown.c"
  case 42: 
   var $130=(($rndr+8)|0); //@line 1950 "src/markdown.c"
   var $131=HEAP32[(($130)>>2)]; //@line 1950 "src/markdown.c"
   var $132=(($131)|(0))==0; //@line 1950 "src/markdown.c"
   if ($132) { var $_0 = $127;label = 51; break; } else { label = 43; break; } //@line 1950 "src/markdown.c"
  case 43: 
   var $134=(($rndr+104)|0); //@line 1951 "src/markdown.c"
   var $135=HEAP32[(($134)>>2)]; //@line 1951 "src/markdown.c"
   FUNCTION_TABLE[$131]($ob, $work, $135); //@line 1951 "src/markdown.c"
   var $_pre110=HEAP32[(($2)>>2)]; //@line 1952 "src/markdown.c"
   var $_0 = $_pre110;label = 51; break; //@line 1951 "src/markdown.c"
  case 44: 
   var $137=_htmlblock_end($39, $data, $size, 1); //@line 1963 "src/markdown.c"
   var $138=(($137)|(0))==0; //@line 1967 "src/markdown.c"
   if ($138) { label = 45; break; } else { var $tag_end_095 = $137;label = 48; break; } //@line 1967 "src/markdown.c"
  case 45: 
   var $140=_strcmp($39, ((2104)|0)); //@line 1967 "src/markdown.c"
   var $141=(($140)|(0))==0; //@line 1967 "src/markdown.c"
   if ($141) { var $_0 = 0;label = 51; break; } else { label = 46; break; } //@line 1967 "src/markdown.c"
  case 46: 
   var $143=_strcmp($39, ((1160)|0)); //@line 1967 "src/markdown.c"
   var $144=(($143)|(0))==0; //@line 1967 "src/markdown.c"
   if ($144) { var $_0 = 0;label = 51; break; } else { label = 47; break; } //@line 1967 "src/markdown.c"
  case 47: 
   var $146=_htmlblock_end($39, $data, $size, 0); //@line 1968 "src/markdown.c"
   var $147=(($146)|(0))==0; //@line 1971 "src/markdown.c"
   if ($147) { var $_0 = 0;label = 51; break; } else { var $tag_end_095 = $146;label = 48; break; } //@line 1971 "src/markdown.c"
  case 48: 
   var $tag_end_095;
   HEAP32[(($2)>>2)]=$tag_end_095; //@line 1975 "src/markdown.c"
   var $148=(($do_render)|(0))==0; //@line 1976 "src/markdown.c"
   if ($148) { var $_0 = $tag_end_095;label = 51; break; } else { label = 49; break; } //@line 1976 "src/markdown.c"
  case 49: 
   var $150=(($rndr+8)|0); //@line 1976 "src/markdown.c"
   var $151=HEAP32[(($150)>>2)]; //@line 1976 "src/markdown.c"
   var $152=(($151)|(0))==0; //@line 1976 "src/markdown.c"
   if ($152) { var $_0 = $tag_end_095;label = 51; break; } else { label = 50; break; } //@line 1976 "src/markdown.c"
  case 50: 
   var $154=(($rndr+104)|0); //@line 1977 "src/markdown.c"
   var $155=HEAP32[(($154)>>2)]; //@line 1977 "src/markdown.c"
   FUNCTION_TABLE[$151]($ob, $work, $155); //@line 1977 "src/markdown.c"
   var $_0 = $tag_end_095;label = 51; break; //@line 1977 "src/markdown.c"
  case 51: 
   var $_0;
   STACKTOP = sp;
   return $_0; //@line 1980 "src/markdown.c"
  default: assert(0, "bad label: " + label);
 }
}
function _parse_list($ob, $rndr, $data, $size, $flags) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($rndr+396)|0); //@line 130 "src/markdown.c"
   var $2=(($rndr+400)|0); //@line 132 "src/markdown.c"
   var $3=HEAP32[(($2)>>2)]; //@line 132 "src/markdown.c"
   var $4=(($rndr+404)|0); //@line 132 "src/markdown.c"
   var $5=HEAP32[(($4)>>2)]; //@line 132 "src/markdown.c"
   var $6=(($3)>>>(0)) < (($5)>>>(0)); //@line 132 "src/markdown.c"
   if ($6) { label = 2; break; } else { label = 4; break; } //@line 132 "src/markdown.c"
  case 2: 
   var $8=(($1)|0); //@line 132 "src/markdown.c"
   var $9=HEAP32[(($8)>>2)]; //@line 132 "src/markdown.c"
   var $10=(($9+($3<<2))|0); //@line 132 "src/markdown.c"
   var $11=HEAP32[(($10)>>2)]; //@line 132 "src/markdown.c"
   var $12=(($11)|(0))==0; //@line 132 "src/markdown.c"
   if ($12) { label = 4; break; } else { label = 3; break; } //@line 132 "src/markdown.c"
  case 3: 
   var $14=((($3)+(1))|0); //@line 134 "src/markdown.c"
   HEAP32[(($2)>>2)]=$14; //@line 134 "src/markdown.c"
   var $15=HEAP32[(($10)>>2)]; //@line 134 "src/markdown.c"
   var $16=$15; //@line 134 "src/markdown.c"
   var $17=(($15+4)|0); //@line 135 "src/markdown.c"
   var $18=$17; //@line 135 "src/markdown.c"
   HEAP32[(($18)>>2)]=0; //@line 135 "src/markdown.c"
   var $work_0_i = $16;label = 5; break; //@line 136 "src/markdown.c"
  case 4: 
   var $20=_bufnew(256); //@line 137 "src/markdown.c"
   var $21=$20; //@line 138 "src/markdown.c"
   var $22=_stack_push($1, $21); //@line 138 "src/markdown.c"
   var $work_0_i = $20;label = 5; break;
  case 5: 
   var $work_0_i;
   var $23=(($rndr+408)|0); //@line 130 "src/markdown.c"
   var $24=(($rndr+412)|0); //@line 132 "src/markdown.c"
   var $25=(($rndr+416)|0); //@line 132 "src/markdown.c"
   var $26=(($23)|0); //@line 132 "src/markdown.c"
   var $27=(($rndr+24)|0); //@line 1755 "src/markdown.c"
   var $28=(($rndr+104)|0); //@line 1756 "src/markdown.c"
   var $29=(($rndr+420)|0); //@line 1682 "src/markdown.c"
   var $i_0 = 0;var $flags53 = $flags;label = 6; break; //@line 1773 "src/markdown.c"
  case 6: 
   var $flags53;
   var $i_0;
   var $31=(($i_0)>>>(0)) < (($size)>>>(0)); //@line 1773 "src/markdown.c"
   if ($31) { label = 7; break; } else { var $i_1 = $i_0;var $flags54 = $flags53;label = 131; break; } //@line 1773 "src/markdown.c"
  case 7: 
   var $33=(($data+$i_0)|0); //@line 1774 "src/markdown.c"
   var $34=((($size)-($i_0))|0); //@line 1774 "src/markdown.c"
   var $orgpre_0_i = 0;label = 8; break; //@line 1636 "src/markdown.c"
  case 8: 
   var $orgpre_0_i;
   var $36=(($orgpre_0_i)>>>(0)) < 3; //@line 1636 "src/markdown.c"
   var $37=(($orgpre_0_i)>>>(0)) < (($34)>>>(0)); //@line 1636 "src/markdown.c"
   var $or_cond_i=$36 & $37; //@line 1636 "src/markdown.c"
   if ($or_cond_i) { label = 9; break; } else { label = 10; break; } //@line 1636 "src/markdown.c"
  case 9: 
   var $_sum94=((($orgpre_0_i)+($i_0))|0); //@line 1636 "src/markdown.c"
   var $39=(($data+$_sum94)|0); //@line 1636 "src/markdown.c"
   var $40=HEAP8[($39)]; //@line 1636 "src/markdown.c"
   var $41=(($40 << 24) >> 24)==32; //@line 1636 "src/markdown.c"
   var $42=((($orgpre_0_i)+(1))|0); //@line 1637 "src/markdown.c"
   if ($41) { var $orgpre_0_i = $42;label = 8; break; } else { label = 10; break; }
  case 10: 
   var $43=(($i_0)|(0))==(($size)|(0)); //@line 1365 "src/markdown.c"
   if ($43) { var $i_0_i_i = 0;label = 12; break; } else { label = 11; break; } //@line 1365 "src/markdown.c"
  case 11: 
   var $45=HEAP8[($33)]; //@line 1365 "src/markdown.c"
   var $46=(($45 << 24) >> 24)==32; //@line 1365 "src/markdown.c"
   var $__i_i=(($46)&(1)); //@line 1365 "src/markdown.c"
   var $i_0_i_i = $__i_i;label = 12; break; //@line 1365 "src/markdown.c"
  case 12: 
   var $i_0_i_i;
   var $48=(($i_0_i_i)>>>(0)) < (($34)>>>(0)); //@line 1366 "src/markdown.c"
   if ($48) { label = 13; break; } else { var $i_1_i_i = $i_0_i_i;label = 14; break; } //@line 1366 "src/markdown.c"
  case 13: 
   var $_sum93=((($i_0_i_i)+($i_0))|0); //@line 1366 "src/markdown.c"
   var $50=(($data+$_sum93)|0); //@line 1366 "src/markdown.c"
   var $51=HEAP8[($50)]; //@line 1366 "src/markdown.c"
   var $52=(($51 << 24) >> 24)==32; //@line 1366 "src/markdown.c"
   var $53=(($52)&(1)); //@line 1366 "src/markdown.c"
   var $_i_0_i_i=((($53)+($i_0_i_i))|0); //@line 1366 "src/markdown.c"
   var $i_1_i_i = $_i_0_i_i;label = 14; break; //@line 1366 "src/markdown.c"
  case 14: 
   var $i_1_i_i;
   var $55=(($i_1_i_i)>>>(0)) < (($34)>>>(0)); //@line 1367 "src/markdown.c"
   if ($55) { label = 15; break; } else { var $i_2_i_i = $i_1_i_i;label = 16; break; } //@line 1367 "src/markdown.c"
  case 15: 
   var $_sum92=((($i_1_i_i)+($i_0))|0); //@line 1367 "src/markdown.c"
   var $57=(($data+$_sum92)|0); //@line 1367 "src/markdown.c"
   var $58=HEAP8[($57)]; //@line 1367 "src/markdown.c"
   var $59=(($58 << 24) >> 24)==32; //@line 1367 "src/markdown.c"
   var $60=(($59)&(1)); //@line 1367 "src/markdown.c"
   var $_i_1_i_i=((($60)+($i_1_i_i))|0); //@line 1367 "src/markdown.c"
   var $i_2_i_i = $_i_1_i_i;label = 16; break; //@line 1367 "src/markdown.c"
  case 16: 
   var $i_2_i_i;
   var $62=((($i_2_i_i)+(1))|0); //@line 1369 "src/markdown.c"
   var $63=(($62)>>>(0)) < (($34)>>>(0)); //@line 1369 "src/markdown.c"
   if ($63) { label = 17; break; } else { label = 36; break; } //@line 1369 "src/markdown.c"
  case 17: 
   var $_sum84=((($i_2_i_i)+($i_0))|0); //@line 1369 "src/markdown.c"
   var $65=(($data+$_sum84)|0); //@line 1369 "src/markdown.c"
   var $66=HEAP8[($65)]; //@line 1369 "src/markdown.c"
   if ((($66 << 24) >> 24)==42 | (($66 << 24) >> 24)==43 | (($66 << 24) >> 24)==45) {
    label = 18; break;
   }
   else {
   label = 36; break;
   }
  case 18: 
   var $_sum85=((($62)+($i_0))|0); //@line 1369 "src/markdown.c"
   var $68=(($data+$_sum85)|0); //@line 1369 "src/markdown.c"
   var $69=HEAP8[($68)]; //@line 1369 "src/markdown.c"
   var $70=(($69 << 24) >> 24)==32; //@line 1369 "src/markdown.c"
   if ($70) { label = 19; break; } else { label = 36; break; } //@line 1369 "src/markdown.c"
  case 19: 
   var $72=((($34)-($i_2_i_i))|0); //@line 1374 "src/markdown.c"
   var $i_0_i16 = 0;label = 20; break; //@line 1296 "src/markdown.c"
  case 20: 
   var $i_0_i16;
   var $74=(($i_0_i16)>>>(0)) < (($72)>>>(0)); //@line 1296 "src/markdown.c"
   if ($74) { label = 22; break; } else { label = 21; break; } //@line 1296 "src/markdown.c"
  case 21: 
   var $75=((($i_0_i16)+(1))|0); //@line 1297 "src/markdown.c"
   var $81 = $75;label = 23; break;
  case 22: 
   var $_sum91=((($i_0_i16)+($_sum84))|0); //@line 1296 "src/markdown.c"
   var $77=(($data+$_sum91)|0); //@line 1296 "src/markdown.c"
   var $78=HEAP8[($77)]; //@line 1296 "src/markdown.c"
   var $79=(($78 << 24) >> 24)==10; //@line 1296 "src/markdown.c"
   var $80=((($i_0_i16)+(1))|0); //@line 1297 "src/markdown.c"
   if ($79) { var $81 = $80;label = 23; break; } else { var $i_0_i16 = $80;label = 20; break; }
  case 23: 
   var $81;
   var $82=(($81)>>>(0)) < (($72)>>>(0)); //@line 1299 "src/markdown.c"
   if ($82) { label = 24; break; } else { var $_0_i22 = 0;label = 35; break; } //@line 1299 "src/markdown.c"
  case 24: 
   var $_sum86=((($81)+($_sum84))|0); //@line 1302 "src/markdown.c"
   var $84=(($data+$_sum86)|0); //@line 1302 "src/markdown.c"
   var $85=((($72)-($81))|0); //@line 1302 "src/markdown.c"
   var $86=HEAP8[($84)]; //@line 1277 "src/markdown.c"
   if ((($86 << 24) >> 24)==61) {
    var $i_0_i_i17 = 1;label = 25; break;
   }
   else if ((($86 << 24) >> 24)==45) {
    var $i_2_i_i20 = 1;label = 30; break;
   }
   else {
   var $_0_i22 = 0;label = 35; break;
   }
  case 25: 
   var $i_0_i_i17;
   var $87=(($i_0_i_i17)>>>(0)) < (($85)>>>(0)); //@line 1278 "src/markdown.c"
   if ($87) { label = 26; break; } else { var $i_1_i_i18 = $i_0_i_i17;label = 27; break; } //@line 1278 "src/markdown.c"
  case 26: 
   var $_sum90=((($_sum86)+($i_0_i_i17))|0); //@line 1278 "src/markdown.c"
   var $89=(($data+$_sum90)|0); //@line 1278 "src/markdown.c"
   var $90=HEAP8[($89)]; //@line 1278 "src/markdown.c"
   var $91=(($90 << 24) >> 24)==61; //@line 1278 "src/markdown.c"
   var $92=((($i_0_i_i17)+(1))|0); //@line 1278 "src/markdown.c"
   if ($91) { var $i_0_i_i17 = $92;label = 25; break; } else { var $i_1_i_i18 = $i_0_i_i17;label = 27; break; }
  case 27: 
   var $i_1_i_i18;
   var $93=(($i_1_i_i18)>>>(0)) < (($85)>>>(0)); //@line 1279 "src/markdown.c"
   if ($93) { label = 28; break; } else { label = 36; break; } //@line 1279 "src/markdown.c"
  case 28: 
   var $_sum89=((($_sum86)+($i_1_i_i18))|0); //@line 1279 "src/markdown.c"
   var $95=(($data+$_sum89)|0); //@line 1279 "src/markdown.c"
   var $96=HEAP8[($95)]; //@line 1279 "src/markdown.c"
   var $97=(($96 << 24) >> 24)==32; //@line 1279 "src/markdown.c"
   var $98=((($i_1_i_i18)+(1))|0); //@line 1279 "src/markdown.c"
   if ($97) { var $i_1_i_i18 = $98;label = 27; break; } else { label = 29; break; }
  case 29: 
   var $100=(($96 << 24) >> 24)==10; //@line 1280 "src/markdown.c"
   var $phitmp31_i_i=(($100)&(1)); //@line 1280 "src/markdown.c"
   var $_0_i22 = $phitmp31_i_i;label = 35; break; //@line 1280 "src/markdown.c"
  case 30: 
   var $i_2_i_i20;
   var $101=(($i_2_i_i20)>>>(0)) < (($85)>>>(0)); //@line 1284 "src/markdown.c"
   if ($101) { label = 31; break; } else { var $i_3_i_i = $i_2_i_i20;label = 32; break; } //@line 1284 "src/markdown.c"
  case 31: 
   var $_sum88=((($_sum86)+($i_2_i_i20))|0); //@line 1284 "src/markdown.c"
   var $103=(($data+$_sum88)|0); //@line 1284 "src/markdown.c"
   var $104=HEAP8[($103)]; //@line 1284 "src/markdown.c"
   var $105=(($104 << 24) >> 24)==45; //@line 1284 "src/markdown.c"
   var $106=((($i_2_i_i20)+(1))|0); //@line 1284 "src/markdown.c"
   if ($105) { var $i_2_i_i20 = $106;label = 30; break; } else { var $i_3_i_i = $i_2_i_i20;label = 32; break; }
  case 32: 
   var $i_3_i_i;
   var $107=(($i_3_i_i)>>>(0)) < (($85)>>>(0)); //@line 1285 "src/markdown.c"
   if ($107) { label = 33; break; } else { label = 36; break; } //@line 1285 "src/markdown.c"
  case 33: 
   var $_sum87=((($_sum86)+($i_3_i_i))|0); //@line 1285 "src/markdown.c"
   var $109=(($data+$_sum87)|0); //@line 1285 "src/markdown.c"
   var $110=HEAP8[($109)]; //@line 1285 "src/markdown.c"
   var $111=(($110 << 24) >> 24)==32; //@line 1285 "src/markdown.c"
   var $112=((($i_3_i_i)+(1))|0); //@line 1285 "src/markdown.c"
   if ($111) { var $i_3_i_i = $112;label = 32; break; } else { label = 34; break; }
  case 34: 
   var $114=(($110 << 24) >> 24)==10; //@line 1286 "src/markdown.c"
   var $phitmp_i_i=$114 ? 2 : 0; //@line 1286 "src/markdown.c"
   var $_0_i22 = $phitmp_i_i;label = 35; break; //@line 1286 "src/markdown.c"
  case 35: 
   var $_0_i22;
   var $115=(($_0_i22)|(0))==0; //@line 1374 "src/markdown.c"
   var $116=((($i_2_i_i)+(2))|0); //@line 1377 "src/markdown.c"
   var $_30_i_i=$115 ? $116 : 0; //@line 1374 "src/markdown.c"
   var $117=(($_30_i_i)|(0))==0; //@line 1640 "src/markdown.c"
   if ($117) { label = 36; break; } else { var $beg_0_i58_ph = $_30_i_i;label = 37; break; } //@line 1640 "src/markdown.c"
  case 36: 
   var $118=_prefix_oli($33, $34); //@line 1641 "src/markdown.c"
   var $119=(($118)|(0))==0; //@line 1643 "src/markdown.c"
   if ($119) { var $i_1 = $i_0;var $flags54 = $flags53;label = 131; break; } else { var $beg_0_i58_ph = $118;label = 37; break; } //@line 1643 "src/markdown.c"
  case 37: 
   var $beg_0_i58_ph;
   var $120=((($i_0)-(1))|0); //@line 1648 "src/markdown.c"
   var $end_0_i = $beg_0_i58_ph;label = 38; break; //@line 1648 "src/markdown.c"
  case 38: 
   var $end_0_i;
   var $121=(($end_0_i)>>>(0)) < (($34)>>>(0)); //@line 1648 "src/markdown.c"
   if ($121) { label = 39; break; } else { label = 40; break; } //@line 1648 "src/markdown.c"
  case 39: 
   var $_sum83=((($120)+($end_0_i))|0); //@line 1648 "src/markdown.c"
   var $123=(($data+$_sum83)|0); //@line 1648 "src/markdown.c"
   var $124=HEAP8[($123)]; //@line 1648 "src/markdown.c"
   var $125=(($124 << 24) >> 24)==10; //@line 1648 "src/markdown.c"
   var $126=((($end_0_i)+(1))|0); //@line 1649 "src/markdown.c"
   if ($125) { label = 40; break; } else { var $end_0_i = $126;label = 38; break; }
  case 40: 
   var $127=HEAP32[(($24)>>2)]; //@line 132 "src/markdown.c"
   var $128=HEAP32[(($25)>>2)]; //@line 132 "src/markdown.c"
   var $129=(($127)>>>(0)) < (($128)>>>(0)); //@line 132 "src/markdown.c"
   if ($129) { label = 41; break; } else { label = 43; break; } //@line 132 "src/markdown.c"
  case 41: 
   var $131=HEAP32[(($26)>>2)]; //@line 132 "src/markdown.c"
   var $132=(($131+($127<<2))|0); //@line 132 "src/markdown.c"
   var $133=HEAP32[(($132)>>2)]; //@line 132 "src/markdown.c"
   var $134=(($133)|(0))==0; //@line 132 "src/markdown.c"
   if ($134) { label = 43; break; } else { label = 42; break; } //@line 132 "src/markdown.c"
  case 42: 
   var $136=((($127)+(1))|0); //@line 134 "src/markdown.c"
   HEAP32[(($24)>>2)]=$136; //@line 134 "src/markdown.c"
   var $137=HEAP32[(($132)>>2)]; //@line 134 "src/markdown.c"
   var $138=$137; //@line 134 "src/markdown.c"
   var $139=(($137+4)|0); //@line 135 "src/markdown.c"
   var $140=$139; //@line 135 "src/markdown.c"
   HEAP32[(($140)>>2)]=0; //@line 135 "src/markdown.c"
   var $work_0_i_i = $138;label = 44; break; //@line 136 "src/markdown.c"
  case 43: 
   var $142=_bufnew(64); //@line 137 "src/markdown.c"
   var $143=$142; //@line 138 "src/markdown.c"
   var $144=_stack_push($23, $143); //@line 138 "src/markdown.c"
   var $work_0_i_i = $142;label = 44; break;
  case 44: 
   var $work_0_i_i;
   var $145=HEAP32[(($24)>>2)]; //@line 132 "src/markdown.c"
   var $146=HEAP32[(($25)>>2)]; //@line 132 "src/markdown.c"
   var $147=(($145)>>>(0)) < (($146)>>>(0)); //@line 132 "src/markdown.c"
   if ($147) { label = 45; break; } else { label = 47; break; } //@line 132 "src/markdown.c"
  case 45: 
   var $149=HEAP32[(($26)>>2)]; //@line 132 "src/markdown.c"
   var $150=(($149+($145<<2))|0); //@line 132 "src/markdown.c"
   var $151=HEAP32[(($150)>>2)]; //@line 132 "src/markdown.c"
   var $152=(($151)|(0))==0; //@line 132 "src/markdown.c"
   if ($152) { label = 47; break; } else { label = 46; break; } //@line 132 "src/markdown.c"
  case 46: 
   var $154=((($145)+(1))|0); //@line 134 "src/markdown.c"
   HEAP32[(($24)>>2)]=$154; //@line 134 "src/markdown.c"
   var $155=HEAP32[(($150)>>2)]; //@line 134 "src/markdown.c"
   var $156=$155; //@line 134 "src/markdown.c"
   var $157=(($155+4)|0); //@line 135 "src/markdown.c"
   var $158=$157; //@line 135 "src/markdown.c"
   HEAP32[(($158)>>2)]=0; //@line 135 "src/markdown.c"
   var $work_0_i146_i = $156;label = 48; break; //@line 136 "src/markdown.c"
  case 47: 
   var $160=_bufnew(64); //@line 137 "src/markdown.c"
   var $161=$160; //@line 138 "src/markdown.c"
   var $162=_stack_push($23, $161); //@line 138 "src/markdown.c"
   var $work_0_i146_i = $160;label = 48; break;
  case 48: 
   var $work_0_i146_i;
   var $_sum=((($beg_0_i58_ph)+($i_0))|0); //@line 1656 "src/markdown.c"
   var $163=(($data+$_sum)|0); //@line 1656 "src/markdown.c"
   var $164=((($end_0_i)-($beg_0_i58_ph))|0); //@line 1656 "src/markdown.c"
   _bufput($work_0_i_i, $163, $164); //@line 1656 "src/markdown.c"
   if ($121) { label = 49; break; } else { var $has_inside_empty_3_i = 0;var $flags51 = $flags53;var $beg_1_i109 = $end_0_i;var $sublist_0_i_ph132 = 0;label = 120; break; } //@line 1660 "src/markdown.c"
  case 49: 
   var $165=$flags53 & 1; //@line 1695 "src/markdown.c"
   var $166=(($165)|(0))==0; //@line 1695 "src/markdown.c"
   var $167=(($165)|(0))!=0; //@line 1695 "src/markdown.c"
   var $168=(($work_0_i_i+4)|0); //@line 1711 "src/markdown.c"
   var $beg_1_i_ph142 = $end_0_i;var $sublist_0_i_ph143 = 0;var $has_inside_empty_0_i_ph146 = 0;var $in_fence_0_i_ph149 = 0;label = 50; break; //@line 1660 "src/markdown.c"
  case 50: 
   var $in_fence_0_i_ph149;
   var $has_inside_empty_0_i_ph146;
   var $sublist_0_i_ph143;
   var $beg_1_i_ph142;
   var $beg_1_i120 = $beg_1_i_ph142;var $in_empty_0_i121 = 0;label = 51; break; //@line 1660 "src/markdown.c"
  case 51: 
   var $in_empty_0_i121;
   var $beg_1_i120;
   var $end_2_in_i = $beg_1_i120;label = 52; break; //@line 1663 "src/markdown.c"
  case 52: 
   var $end_2_in_i;
   var $end_2_i=((($end_2_in_i)+(1))|0); //@line 1663 "src/markdown.c"
   var $170=(($end_2_i)>>>(0)) < (($34)>>>(0)); //@line 1665 "src/markdown.c"
   if ($170) { label = 53; break; } else { label = 54; break; } //@line 1665 "src/markdown.c"
  case 53: 
   var $_sum82=((($end_2_in_i)+($i_0))|0); //@line 1665 "src/markdown.c"
   var $172=(($data+$_sum82)|0); //@line 1665 "src/markdown.c"
   var $173=HEAP8[($172)]; //@line 1665 "src/markdown.c"
   var $174=(($173 << 24) >> 24)==10; //@line 1665 "src/markdown.c"
   if ($174) { label = 54; break; } else { var $end_2_in_i = $end_2_i;label = 52; break; }
  case 54: 
   var $_sum61=((($beg_1_i120)+($i_0))|0); //@line 1669 "src/markdown.c"
   var $175=((($end_2_i)-($beg_1_i120))|0); //@line 1669 "src/markdown.c"
   var $176=(($end_2_i)|(0))==(($beg_1_i120)|(0)); //@line 1124 "src/markdown.c"
   if ($176) { var $end_2_i156 = $beg_1_i120;label = 58; break; } else { var $i_08_i_i = 0;label = 55; break; } //@line 1124 "src/markdown.c"
  case 55: 
   var $i_08_i_i;
   var $_sum62=((($_sum61)+($i_08_i_i))|0); //@line 1124 "src/markdown.c"
   var $177=(($data+$_sum62)|0); //@line 1124 "src/markdown.c"
   var $178=HEAP8[($177)]; //@line 1124 "src/markdown.c"
   if ((($178 << 24) >> 24)==32) {
    label = 56; break;
   }
   else if ((($178 << 24) >> 24)==10) {
    var $i_0_lcssa_i_i = $i_08_i_i;label = 57; break;
   }
   else {
   var $i_0_i = 0;label = 59; break;
   }
  case 56: 
   var $180=((($i_08_i_i)+(1))|0); //@line 1124 "src/markdown.c"
   var $181=(($180)>>>(0)) < (($175)>>>(0)); //@line 1124 "src/markdown.c"
   if ($181) { var $i_08_i_i = $180;label = 55; break; } else { var $i_0_lcssa_i_i = $180;label = 57; break; } //@line 1124 "src/markdown.c"
  case 57: 
   var $i_0_lcssa_i_i;
   var $182=(($i_0_lcssa_i_i)|(0))==-1; //@line 1669 "src/markdown.c"
   if ($182) { var $i_0_i = 0;label = 59; break; } else { var $end_2_i156 = $end_2_i;label = 58; break; } //@line 1669 "src/markdown.c"
  case 58: 
   var $end_2_i156;
   if ($170) { var $beg_1_i120 = $end_2_i156;var $in_empty_0_i121 = 1;label = 51; break; } else { var $has_inside_empty_3_i = $has_inside_empty_0_i_ph146;var $flags51 = $flags53;var $beg_1_i109 = $end_2_i156;var $sublist_0_i_ph132 = $sublist_0_i_ph143;label = 120; break; } //@line 1660 "src/markdown.c"
  case 59: 
   var $i_0_i;
   var $183=(($i_0_i)>>>(0)) < 4; //@line 1677 "src/markdown.c"
   if ($183) { label = 60; break; } else { label = 62; break; } //@line 1677 "src/markdown.c"
  case 60: 
   var $185=((($i_0_i)+($beg_1_i120))|0); //@line 1677 "src/markdown.c"
   var $186=(($185)>>>(0)) < (($end_2_i)>>>(0)); //@line 1677 "src/markdown.c"
   if ($186) { label = 61; break; } else { label = 62; break; } //@line 1677 "src/markdown.c"
  case 61: 
   var $_sum81=((($185)+($i_0))|0); //@line 1677 "src/markdown.c"
   var $188=(($data+$_sum81)|0); //@line 1677 "src/markdown.c"
   var $189=HEAP8[($188)]; //@line 1677 "src/markdown.c"
   var $190=(($189 << 24) >> 24)==32; //@line 1677 "src/markdown.c"
   var $191=((($i_0_i)+(1))|0); //@line 1678 "src/markdown.c"
   if ($190) { var $i_0_i = $191;label = 59; break; } else { label = 62; break; }
  case 62: 
   var $192=HEAP32[(($29)>>2)]; //@line 1682 "src/markdown.c"
   var $193=$192 & 4; //@line 1682 "src/markdown.c"
   var $194=(($193)|(0))==0; //@line 1682 "src/markdown.c"
   if ($194) { var $in_fence_1_i = $in_fence_0_i_ph149;label = 65; break; } else { label = 63; break; } //@line 1682 "src/markdown.c"
  case 63: 
   var $_sum63=((($_sum61)+($i_0_i))|0); //@line 1683 "src/markdown.c"
   var $196=(($data+$_sum63)|0); //@line 1683 "src/markdown.c"
   var $197=((($175)-($i_0_i))|0); //@line 1683 "src/markdown.c"
   var $198=_is_codefence($196, $197, 0); //@line 1683 "src/markdown.c"
   var $199=(($198)|(0))==0; //@line 1683 "src/markdown.c"
   if ($199) { var $in_fence_1_i = $in_fence_0_i_ph149;label = 65; break; } else { label = 64; break; } //@line 1683 "src/markdown.c"
  case 64: 
   var $201=(($in_fence_0_i_ph149)|(0))==0; //@line 1684 "src/markdown.c"
   var $202=(($201)&(1)); //@line 1684 "src/markdown.c"
   var $in_fence_1_i = $202;label = 65; break; //@line 1684 "src/markdown.c"
  case 65: 
   var $in_fence_1_i;
   var $204=(($in_fence_1_i)|(0))==0; //@line 1689 "src/markdown.c"
   if ($204) { label = 66; break; } else { var $has_next_oli_0_i = 0;var $has_next_uli_0_i = 0;label = 93; break; } //@line 1689 "src/markdown.c"
  case 66: 
   var $_sum70=((($_sum61)+($i_0_i))|0); //@line 1690 "src/markdown.c"
   var $206=(($data+$_sum70)|0); //@line 1690 "src/markdown.c"
   var $207=((($175)-($i_0_i))|0); //@line 1690 "src/markdown.c"
   var $208=(($175)|(0))==(($i_0_i)|(0)); //@line 1365 "src/markdown.c"
   if ($208) { var $i_0_i149_i = 0;label = 68; break; } else { label = 67; break; } //@line 1365 "src/markdown.c"
  case 67: 
   var $210=HEAP8[($206)]; //@line 1365 "src/markdown.c"
   var $211=(($210 << 24) >> 24)==32; //@line 1365 "src/markdown.c"
   var $__i148_i=(($211)&(1)); //@line 1365 "src/markdown.c"
   var $i_0_i149_i = $__i148_i;label = 68; break; //@line 1365 "src/markdown.c"
  case 68: 
   var $i_0_i149_i;
   var $213=(($i_0_i149_i)>>>(0)) < (($207)>>>(0)); //@line 1366 "src/markdown.c"
   if ($213) { label = 69; break; } else { var $i_1_i151_i = $i_0_i149_i;label = 70; break; } //@line 1366 "src/markdown.c"
  case 69: 
   var $_sum80=((($i_0_i149_i)+($_sum70))|0); //@line 1366 "src/markdown.c"
   var $215=(($data+$_sum80)|0); //@line 1366 "src/markdown.c"
   var $216=HEAP8[($215)]; //@line 1366 "src/markdown.c"
   var $217=(($216 << 24) >> 24)==32; //@line 1366 "src/markdown.c"
   var $218=(($217)&(1)); //@line 1366 "src/markdown.c"
   var $_i_0_i150_i=((($218)+($i_0_i149_i))|0); //@line 1366 "src/markdown.c"
   var $i_1_i151_i = $_i_0_i150_i;label = 70; break; //@line 1366 "src/markdown.c"
  case 70: 
   var $i_1_i151_i;
   var $220=(($i_1_i151_i)>>>(0)) < (($207)>>>(0)); //@line 1367 "src/markdown.c"
   if ($220) { label = 71; break; } else { var $i_2_i153_i = $i_1_i151_i;label = 72; break; } //@line 1367 "src/markdown.c"
  case 71: 
   var $_sum79=((($i_1_i151_i)+($_sum70))|0); //@line 1367 "src/markdown.c"
   var $222=(($data+$_sum79)|0); //@line 1367 "src/markdown.c"
   var $223=HEAP8[($222)]; //@line 1367 "src/markdown.c"
   var $224=(($223 << 24) >> 24)==32; //@line 1367 "src/markdown.c"
   var $225=(($224)&(1)); //@line 1367 "src/markdown.c"
   var $_i_1_i152_i=((($225)+($i_1_i151_i))|0); //@line 1367 "src/markdown.c"
   var $i_2_i153_i = $_i_1_i152_i;label = 72; break; //@line 1367 "src/markdown.c"
  case 72: 
   var $i_2_i153_i;
   var $227=((($i_2_i153_i)+(1))|0); //@line 1369 "src/markdown.c"
   var $228=(($227)>>>(0)) < (($207)>>>(0)); //@line 1369 "src/markdown.c"
   if ($228) { label = 73; break; } else { var $282 = 0;label = 92; break; } //@line 1369 "src/markdown.c"
  case 73: 
   var $_sum71=((($i_2_i153_i)+($_sum70))|0); //@line 1369 "src/markdown.c"
   var $230=(($data+$_sum71)|0); //@line 1369 "src/markdown.c"
   var $231=HEAP8[($230)]; //@line 1369 "src/markdown.c"
   if ((($231 << 24) >> 24)==42 | (($231 << 24) >> 24)==43 | (($231 << 24) >> 24)==45) {
    label = 74; break;
   }
   else {
   var $282 = 0;label = 92; break;
   }
  case 74: 
   var $_sum72=((($227)+($_sum70))|0); //@line 1369 "src/markdown.c"
   var $233=(($data+$_sum72)|0); //@line 1369 "src/markdown.c"
   var $234=HEAP8[($233)]; //@line 1369 "src/markdown.c"
   var $235=(($234 << 24) >> 24)==32; //@line 1369 "src/markdown.c"
   if ($235) { label = 75; break; } else { var $282 = 0;label = 92; break; } //@line 1369 "src/markdown.c"
  case 75: 
   var $237=((($207)-($i_2_i153_i))|0); //@line 1374 "src/markdown.c"
   var $i_0_i23 = 0;label = 76; break; //@line 1296 "src/markdown.c"
  case 76: 
   var $i_0_i23;
   var $239=(($i_0_i23)>>>(0)) < (($237)>>>(0)); //@line 1296 "src/markdown.c"
   if ($239) { label = 78; break; } else { label = 77; break; } //@line 1296 "src/markdown.c"
  case 77: 
   var $240=((($i_0_i23)+(1))|0); //@line 1297 "src/markdown.c"
   var $246 = $240;label = 79; break;
  case 78: 
   var $_sum78=((($i_0_i23)+($_sum71))|0); //@line 1296 "src/markdown.c"
   var $242=(($data+$_sum78)|0); //@line 1296 "src/markdown.c"
   var $243=HEAP8[($242)]; //@line 1296 "src/markdown.c"
   var $244=(($243 << 24) >> 24)==10; //@line 1296 "src/markdown.c"
   var $245=((($i_0_i23)+(1))|0); //@line 1297 "src/markdown.c"
   if ($244) { var $246 = $245;label = 79; break; } else { var $i_0_i23 = $245;label = 76; break; }
  case 79: 
   var $246;
   var $247=(($246)>>>(0)) < (($237)>>>(0)); //@line 1299 "src/markdown.c"
   if ($247) { label = 80; break; } else { var $_0_i40 = 0;label = 91; break; } //@line 1299 "src/markdown.c"
  case 80: 
   var $_sum73=((($246)+($_sum71))|0); //@line 1302 "src/markdown.c"
   var $249=(($data+$_sum73)|0); //@line 1302 "src/markdown.c"
   var $250=((($237)-($246))|0); //@line 1302 "src/markdown.c"
   var $251=HEAP8[($249)]; //@line 1277 "src/markdown.c"
   if ((($251 << 24) >> 24)==61) {
    var $i_0_i_i26 = 1;label = 81; break;
   }
   else if ((($251 << 24) >> 24)==45) {
    var $i_2_i_i33 = 1;label = 86; break;
   }
   else {
   var $_0_i40 = 0;label = 91; break;
   }
  case 81: 
   var $i_0_i_i26;
   var $252=(($i_0_i_i26)>>>(0)) < (($250)>>>(0)); //@line 1278 "src/markdown.c"
   if ($252) { label = 82; break; } else { var $i_1_i_i29 = $i_0_i_i26;label = 83; break; } //@line 1278 "src/markdown.c"
  case 82: 
   var $_sum77=((($_sum73)+($i_0_i_i26))|0); //@line 1278 "src/markdown.c"
   var $254=(($data+$_sum77)|0); //@line 1278 "src/markdown.c"
   var $255=HEAP8[($254)]; //@line 1278 "src/markdown.c"
   var $256=(($255 << 24) >> 24)==61; //@line 1278 "src/markdown.c"
   var $257=((($i_0_i_i26)+(1))|0); //@line 1278 "src/markdown.c"
   if ($256) { var $i_0_i_i26 = $257;label = 81; break; } else { var $i_1_i_i29 = $i_0_i_i26;label = 83; break; }
  case 83: 
   var $i_1_i_i29;
   var $258=(($i_1_i_i29)>>>(0)) < (($250)>>>(0)); //@line 1279 "src/markdown.c"
   if ($258) { label = 84; break; } else { var $_0_i40 = 1;label = 91; break; } //@line 1279 "src/markdown.c"
  case 84: 
   var $_sum76=((($_sum73)+($i_1_i_i29))|0); //@line 1279 "src/markdown.c"
   var $260=(($data+$_sum76)|0); //@line 1279 "src/markdown.c"
   var $261=HEAP8[($260)]; //@line 1279 "src/markdown.c"
   var $262=(($261 << 24) >> 24)==32; //@line 1279 "src/markdown.c"
   var $263=((($i_1_i_i29)+(1))|0); //@line 1279 "src/markdown.c"
   if ($262) { var $i_1_i_i29 = $263;label = 83; break; } else { label = 85; break; }
  case 85: 
   var $265=(($261 << 24) >> 24)==10; //@line 1280 "src/markdown.c"
   var $phitmp31_i_i32=(($265)&(1)); //@line 1280 "src/markdown.c"
   var $_0_i40 = $phitmp31_i_i32;label = 91; break; //@line 1280 "src/markdown.c"
  case 86: 
   var $i_2_i_i33;
   var $266=(($i_2_i_i33)>>>(0)) < (($250)>>>(0)); //@line 1284 "src/markdown.c"
   if ($266) { label = 87; break; } else { var $i_3_i_i36 = $i_2_i_i33;label = 88; break; } //@line 1284 "src/markdown.c"
  case 87: 
   var $_sum75=((($_sum73)+($i_2_i_i33))|0); //@line 1284 "src/markdown.c"
   var $268=(($data+$_sum75)|0); //@line 1284 "src/markdown.c"
   var $269=HEAP8[($268)]; //@line 1284 "src/markdown.c"
   var $270=(($269 << 24) >> 24)==45; //@line 1284 "src/markdown.c"
   var $271=((($i_2_i_i33)+(1))|0); //@line 1284 "src/markdown.c"
   if ($270) { var $i_2_i_i33 = $271;label = 86; break; } else { var $i_3_i_i36 = $i_2_i_i33;label = 88; break; }
  case 88: 
   var $i_3_i_i36;
   var $272=(($i_3_i_i36)>>>(0)) < (($250)>>>(0)); //@line 1285 "src/markdown.c"
   if ($272) { label = 89; break; } else { var $_0_i40 = 2;label = 91; break; } //@line 1285 "src/markdown.c"
  case 89: 
   var $_sum74=((($_sum73)+($i_3_i_i36))|0); //@line 1285 "src/markdown.c"
   var $274=(($data+$_sum74)|0); //@line 1285 "src/markdown.c"
   var $275=HEAP8[($274)]; //@line 1285 "src/markdown.c"
   var $276=(($275 << 24) >> 24)==32; //@line 1285 "src/markdown.c"
   var $277=((($i_3_i_i36)+(1))|0); //@line 1285 "src/markdown.c"
   if ($276) { var $i_3_i_i36 = $277;label = 88; break; } else { label = 90; break; }
  case 90: 
   var $279=(($275 << 24) >> 24)==10; //@line 1286 "src/markdown.c"
   var $phitmp_i_i39=$279 ? 2 : 0; //@line 1286 "src/markdown.c"
   var $_0_i40 = $phitmp_i_i39;label = 91; break; //@line 1286 "src/markdown.c"
  case 91: 
   var $_0_i40;
   var $280=(($_0_i40)|(0))==0; //@line 1374 "src/markdown.c"
   var $281=((($i_2_i153_i)+(2))|0); //@line 1377 "src/markdown.c"
   var $_30_i154_i=$280 ? $281 : 0; //@line 1374 "src/markdown.c"
   var $282 = $_30_i154_i;label = 92; break;
  case 92: 
   var $282;
   var $283=_prefix_oli($206, $207); //@line 1691 "src/markdown.c"
   var $has_next_oli_0_i = $283;var $has_next_uli_0_i = $282;label = 93; break; //@line 1692 "src/markdown.c"
  case 93: 
   var $has_next_uli_0_i;
   var $has_next_oli_0_i;
   var $285=(($in_empty_0_i121)|(0))!=0; //@line 1695 "src/markdown.c"
   if ($285) { label = 94; break; } else { label = 97; break; } //@line 1695 "src/markdown.c"
  case 94: 
   var $287=(($has_next_uli_0_i)|(0))==0; //@line 1695 "src/markdown.c"
   var $or_cond141_i=$166 | $287; //@line 1695 "src/markdown.c"
   if ($or_cond141_i) { label = 95; break; } else { label = 96; break; } //@line 1695 "src/markdown.c"
  case 95: 
   var $289=(($has_next_oli_0_i)|(0))==0; //@line 1695 "src/markdown.c"
   var $or_cond142_i=$167 | $289; //@line 1695 "src/markdown.c"
   if ($or_cond142_i) { label = 97; break; } else { label = 96; break; } //@line 1695 "src/markdown.c"
  case 96: 
   var $291=$flags53 | 8; //@line 1698 "src/markdown.c"
   var $has_inside_empty_3_i = $has_inside_empty_0_i_ph146;var $flags51 = $291;var $beg_1_i109 = $beg_1_i120;var $sublist_0_i_ph132 = $sublist_0_i_ph143;label = 120; break; //@line 1699 "src/markdown.c"
  case 97: 
   var $293=(($has_next_uli_0_i)|(0))==0; //@line 1703 "src/markdown.c"
   if ($293) { label = 111; break; } else { label = 98; break; } //@line 1703 "src/markdown.c"
  case 98: 
   var $_sum64=((($_sum61)+($i_0_i))|0); //@line 1703 "src/markdown.c"
   var $295=((($175)-($i_0_i))|0); //@line 1703 "src/markdown.c"
   var $296=(($295)>>>(0)) < 3; //@line 1139 "src/markdown.c"
   if ($296) { label = 112; break; } else { label = 99; break; } //@line 1139 "src/markdown.c"
  case 99: 
   var $298=(($data+$_sum64)|0); //@line 1703 "src/markdown.c"
   var $299=HEAP8[($298)]; //@line 1140 "src/markdown.c"
   var $300=(($299 << 24) >> 24)==32; //@line 1140 "src/markdown.c"
   if ($300) { label = 100; break; } else { var $i_0_i157_i = 0;label = 102; break; } //@line 1140 "src/markdown.c"
  case 100: 
   var $_sum68=((($_sum64)+(1))|0); //@line 1141 "src/markdown.c"
   var $302=(($data+$_sum68)|0); //@line 1141 "src/markdown.c"
   var $303=HEAP8[($302)]; //@line 1141 "src/markdown.c"
   var $304=(($303 << 24) >> 24)==32; //@line 1141 "src/markdown.c"
   if ($304) { label = 101; break; } else { var $i_0_i157_i = 1;label = 102; break; } //@line 1141 "src/markdown.c"
  case 101: 
   var $_sum69=((($_sum64)+(2))|0); //@line 1142 "src/markdown.c"
   var $306=(($data+$_sum69)|0); //@line 1142 "src/markdown.c"
   var $307=HEAP8[($306)]; //@line 1142 "src/markdown.c"
   var $308=(($307 << 24) >> 24)==32; //@line 1142 "src/markdown.c"
   var $__i156_i=$308 ? 3 : 2; //@line 1142 "src/markdown.c"
   var $i_0_i157_i = $__i156_i;label = 102; break; //@line 1142 "src/markdown.c"
  case 102: 
   var $i_0_i157_i;
   var $310=((($i_0_i157_i)+(2))|0); //@line 1145 "src/markdown.c"
   var $311=(($310)>>>(0)) < (($295)>>>(0)); //@line 1145 "src/markdown.c"
   if ($311) { label = 103; break; } else { label = 112; break; } //@line 1145 "src/markdown.c"
  case 103: 
   var $_sum66=((($i_0_i157_i)+($_sum64))|0); //@line 1145 "src/markdown.c"
   var $313=(($data+$_sum66)|0); //@line 1145 "src/markdown.c"
   var $314=HEAP8[($313)]; //@line 1145 "src/markdown.c"
   if ((($314 << 24) >> 24)==42 | (($314 << 24) >> 24)==45 | (($314 << 24) >> 24)==95) {
    label = 104; break;
   }
   else {
   label = 112; break;
   }
  case 104: 
   var $316=(($i_0_i157_i)>>>(0)) < (($295)>>>(0)); //@line 1151 "src/markdown.c"
   if ($316) { var $317 = $314;var $n_029_i_i105 = 0;var $i_128_i_i106 = $i_0_i157_i;label = 105; break; } else { label = 112; break; } //@line 1151 "src/markdown.c"
  case 105: 
   var $i_128_i_i106;
   var $n_029_i_i105;
   var $317;
   var $318=(($317 << 24) >> 24)==(($314 << 24) >> 24); //@line 1152 "src/markdown.c"
   if ($318) { label = 106; break; } else { label = 107; break; } //@line 1152 "src/markdown.c"
  case 106: 
   var $320=((($n_029_i_i105)+(1))|0); //@line 1152 "src/markdown.c"
   var $n_1_i_i = $320;label = 108; break; //@line 1152 "src/markdown.c"
  case 107: 
   var $322=(($317 << 24) >> 24)==32; //@line 1153 "src/markdown.c"
   if ($322) { var $n_1_i_i = $n_029_i_i105;label = 108; break; } else { label = 112; break; } //@line 1153 "src/markdown.c"
  case 108: 
   var $n_1_i_i;
   var $324=((($i_128_i_i106)+(1))|0); //@line 1156 "src/markdown.c"
   var $325=(($324)>>>(0)) < (($295)>>>(0)); //@line 1151 "src/markdown.c"
   if ($325) { label = 109; break; } else { label = 110; break; } //@line 1151 "src/markdown.c"
  case 109: 
   var $_sum67=((($324)+($_sum64))|0);
   var $_phi_trans_insert_i_i=(($data+$_sum67)|0);
   var $_pre_i_i=HEAP8[($_phi_trans_insert_i_i)]; //@line 1151 "src/markdown.c"
   var $326=(($_pre_i_i << 24) >> 24)==10; //@line 1151 "src/markdown.c"
   if ($326) { label = 110; break; } else { var $317 = $_pre_i_i;var $n_029_i_i105 = $n_1_i_i;var $i_128_i_i106 = $324;label = 105; break; }
  case 110: 
   var $327=(($n_1_i_i)>>>(0)) > 2; //@line 1159 "src/markdown.c"
   var $328=(($has_next_oli_0_i)|(0))==0; //@line 1703 "src/markdown.c"
   var $or_cond143_i=$327 & $328; //@line 1703 "src/markdown.c"
   if ($or_cond143_i) { label = 115; break; } else { label = 112; break; } //@line 1703 "src/markdown.c"
  case 111: 
   var $_old_i=(($has_next_oli_0_i)|(0))==0; //@line 1703 "src/markdown.c"
   if ($_old_i) { label = 115; break; } else { label = 112; break; } //@line 1703 "src/markdown.c"
  case 112: 
   var $_has_inside_empty_0_i=$285 ? 1 : $has_inside_empty_0_i_ph146; //@line 1704 "src/markdown.c"
   var $330=(($i_0_i)|(0))==(($orgpre_0_i)|(0)); //@line 1707 "src/markdown.c"
   if ($330) { var $has_inside_empty_3_i = $_has_inside_empty_0_i;var $flags51 = $flags53;var $beg_1_i109 = $beg_1_i120;var $sublist_0_i_ph132 = $sublist_0_i_ph143;label = 120; break; } else { label = 113; break; } //@line 1707 "src/markdown.c"
  case 113: 
   var $332=(($sublist_0_i_ph143)|(0))==0; //@line 1710 "src/markdown.c"
   if ($332) { label = 114; break; } else { var $has_inside_empty_2_i = $_has_inside_empty_0_i;var $sublist_1_i = $sublist_0_i_ph143;label = 119; break; } //@line 1710 "src/markdown.c"
  case 114: 
   var $334=HEAP32[(($168)>>2)]; //@line 1711 "src/markdown.c"
   var $has_inside_empty_2_i = $_has_inside_empty_0_i;var $sublist_1_i = $334;label = 119; break; //@line 1711 "src/markdown.c"
  case 115: 
   var $336=(($i_0_i)|(0))==0; //@line 1716 "src/markdown.c"
   var $or_cond145_i=$285 & $336; //@line 1716 "src/markdown.c"
   if ($or_cond145_i) { label = 116; break; } else { label = 117; break; } //@line 1716 "src/markdown.c"
  case 116: 
   var $338=$flags53 | 8; //@line 1717 "src/markdown.c"
   var $has_inside_empty_3_i = $has_inside_empty_0_i_ph146;var $flags51 = $338;var $beg_1_i109 = $beg_1_i120;var $sublist_0_i_ph132 = $sublist_0_i_ph143;label = 120; break; //@line 1718 "src/markdown.c"
  case 117: 
   if ($285) { label = 118; break; } else { var $has_inside_empty_2_i = $has_inside_empty_0_i_ph146;var $sublist_1_i = $sublist_0_i_ph143;label = 119; break; } //@line 1720 "src/markdown.c"
  case 118: 
   _bufputc($work_0_i_i, 10); //@line 1721 "src/markdown.c"
   var $has_inside_empty_2_i = 1;var $sublist_1_i = $sublist_0_i_ph143;label = 119; break; //@line 1723 "src/markdown.c"
  case 119: 
   var $sublist_1_i;
   var $has_inside_empty_2_i;
   var $_sum65=((($_sum61)+($i_0_i))|0); //@line 1728 "src/markdown.c"
   var $341=(($data+$_sum65)|0); //@line 1728 "src/markdown.c"
   var $342=((($175)-($i_0_i))|0); //@line 1728 "src/markdown.c"
   _bufput($work_0_i_i, $341, $342); //@line 1728 "src/markdown.c"
   if ($170) { var $beg_1_i_ph142 = $end_2_i;var $sublist_0_i_ph143 = $sublist_1_i;var $has_inside_empty_0_i_ph146 = $has_inside_empty_2_i;var $in_fence_0_i_ph149 = $in_fence_1_i;label = 50; break; } else { var $has_inside_empty_3_i = $has_inside_empty_2_i;var $flags51 = $flags53;var $beg_1_i109 = $end_2_i;var $sublist_0_i_ph132 = $sublist_1_i;label = 120; break; } //@line 1660 "src/markdown.c"
  case 120: 
   var $sublist_0_i_ph132;
   var $beg_1_i109;
   var $flags51;
   var $has_inside_empty_3_i;
   var $343=(($has_inside_empty_3_i)|(0))==0; //@line 1733 "src/markdown.c"
   var $344=$flags51 | 2; //@line 1734 "src/markdown.c"
   var $flags50=$343 ? $flags51 : $344; //@line 1733 "src/markdown.c"
   var $345=$flags50 & 2; //@line 1736 "src/markdown.c"
   var $346=(($345)|(0))==0; //@line 1736 "src/markdown.c"
   var $347=(($sublist_0_i_ph132)|(0))!=0; //@line 1738 "src/markdown.c"
   var $348=(($work_0_i_i+4)|0); //@line 1746 "src/markdown.c"
   var $349=HEAP32[(($348)>>2)]; //@line 1746 "src/markdown.c"
   var $350=(($sublist_0_i_ph132)>>>(0)) < (($349)>>>(0)); //@line 1746 "src/markdown.c"
   var $or_cond193=$347 & $350; //@line 1746 "src/markdown.c"
   var $351=(($work_0_i_i)|0); //@line 1747 "src/markdown.c"
   var $352=HEAP32[(($351)>>2)]; //@line 1747 "src/markdown.c"
   if ($346) { label = 124; break; } else { label = 121; break; } //@line 1736 "src/markdown.c"
  case 121: 
   if ($or_cond193) { label = 122; break; } else { label = 123; break; } //@line 1738 "src/markdown.c"
  case 122: 
   _parse_block($work_0_i146_i, $rndr, $352, $sublist_0_i_ph132); //@line 1739 "src/markdown.c"
   var $355=HEAP32[(($351)>>2)]; //@line 1740 "src/markdown.c"
   var $356=(($355+$sublist_0_i_ph132)|0); //@line 1740 "src/markdown.c"
   var $357=HEAP32[(($348)>>2)]; //@line 1740 "src/markdown.c"
   var $358=((($357)-($sublist_0_i_ph132))|0); //@line 1740 "src/markdown.c"
   _parse_block($work_0_i146_i, $rndr, $356, $358); //@line 1740 "src/markdown.c"
   label = 127; break; //@line 1741 "src/markdown.c"
  case 123: 
   _parse_block($work_0_i146_i, $rndr, $352, $349); //@line 1743 "src/markdown.c"
   label = 127; break;
  case 124: 
   if ($or_cond193) { label = 125; break; } else { label = 126; break; } //@line 1746 "src/markdown.c"
  case 125: 
   _parse_inline($work_0_i146_i, $rndr, $352, $sublist_0_i_ph132); //@line 1747 "src/markdown.c"
   var $361=HEAP32[(($351)>>2)]; //@line 1748 "src/markdown.c"
   var $362=(($361+$sublist_0_i_ph132)|0); //@line 1748 "src/markdown.c"
   var $363=HEAP32[(($348)>>2)]; //@line 1748 "src/markdown.c"
   var $364=((($363)-($sublist_0_i_ph132))|0); //@line 1748 "src/markdown.c"
   _parse_block($work_0_i146_i, $rndr, $362, $364); //@line 1748 "src/markdown.c"
   label = 127; break; //@line 1749 "src/markdown.c"
  case 126: 
   _parse_inline($work_0_i146_i, $rndr, $352, $349); //@line 1751 "src/markdown.c"
   label = 127; break;
  case 127: 
   var $366=HEAP32[(($27)>>2)]; //@line 1755 "src/markdown.c"
   var $367=(($366)|(0))==0; //@line 1755 "src/markdown.c"
   if ($367) { label = 129; break; } else { label = 128; break; } //@line 1755 "src/markdown.c"
  case 128: 
   var $369=HEAP32[(($28)>>2)]; //@line 1756 "src/markdown.c"
   FUNCTION_TABLE[$366]($work_0_i, $work_0_i146_i, $flags50, $369); //@line 1756 "src/markdown.c"
   label = 129; break; //@line 1756 "src/markdown.c"
  case 129: 
   var $370=HEAP32[(($24)>>2)]; //@line 147 "src/markdown.c"
   var $371=((($370)-(2))|0); //@line 147 "src/markdown.c"
   HEAP32[(($24)>>2)]=$371; //@line 147 "src/markdown.c"
   var $372=((($beg_1_i109)+($i_0))|0); //@line 1775 "src/markdown.c"
   var $373=(($beg_1_i109)|(0))==0; //@line 1777 "src/markdown.c"
   if ($373) { var $i_1 = $372;var $flags54 = $flags50;label = 131; break; } else { label = 130; break; } //@line 1777 "src/markdown.c"
  case 130: 
   var $375=$flags50 & 8; //@line 1777 "src/markdown.c"
   var $376=(($375)|(0))==0; //@line 1777 "src/markdown.c"
   if ($376) { var $i_0 = $372;var $flags53 = $flags50;label = 6; break; } else { var $i_1 = $372;var $flags54 = $flags50;label = 131; break; } //@line 1777 "src/markdown.c"
  case 131: 
   var $flags54;
   var $i_1;
   var $377=(($rndr+20)|0); //@line 1781 "src/markdown.c"
   var $378=HEAP32[(($377)>>2)]; //@line 1781 "src/markdown.c"
   var $379=(($378)|(0))==0; //@line 1781 "src/markdown.c"
   if ($379) { label = 133; break; } else { label = 132; break; } //@line 1781 "src/markdown.c"
  case 132: 
   var $381=HEAP32[(($28)>>2)]; //@line 1782 "src/markdown.c"
   FUNCTION_TABLE[$378]($ob, $work_0_i, $flags54, $381); //@line 1782 "src/markdown.c"
   label = 133; break; //@line 1782 "src/markdown.c"
  case 133: 
   var $383=HEAP32[(($2)>>2)]; //@line 147 "src/markdown.c"
   var $384=((($383)-(1))|0); //@line 147 "src/markdown.c"
   HEAP32[(($2)>>2)]=$384; //@line 147 "src/markdown.c"
   return $i_1; //@line 1784 "src/markdown.c"
  default: assert(0, "bad label: " + label);
 }
}
function _prefix_oli($data, $size) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($size)|(0))==0; //@line 1340 "src/markdown.c"
   if ($1) { var $i_0 = 0;label = 3; break; } else { label = 2; break; } //@line 1340 "src/markdown.c"
  case 2: 
   var $3=HEAP8[($data)]; //@line 1340 "src/markdown.c"
   var $4=(($3 << 24) >> 24)==32; //@line 1340 "src/markdown.c"
   var $_=(($4)&(1)); //@line 1340 "src/markdown.c"
   var $i_0 = $_;label = 3; break; //@line 1340 "src/markdown.c"
  case 3: 
   var $i_0;
   var $6=(($i_0)>>>(0)) < (($size)>>>(0)); //@line 1341 "src/markdown.c"
   if ($6) { label = 4; break; } else { var $i_1 = $i_0;label = 5; break; } //@line 1341 "src/markdown.c"
  case 4: 
   var $8=(($data+$i_0)|0); //@line 1341 "src/markdown.c"
   var $9=HEAP8[($8)]; //@line 1341 "src/markdown.c"
   var $10=(($9 << 24) >> 24)==32; //@line 1341 "src/markdown.c"
   var $11=(($10)&(1)); //@line 1341 "src/markdown.c"
   var $_i_0=((($11)+($i_0))|0); //@line 1341 "src/markdown.c"
   var $i_1 = $_i_0;label = 5; break; //@line 1341 "src/markdown.c"
  case 5: 
   var $i_1;
   var $13=(($i_1)>>>(0)) < (($size)>>>(0)); //@line 1342 "src/markdown.c"
   if ($13) { label = 6; break; } else { var $i_2 = $i_1;label = 7; break; } //@line 1342 "src/markdown.c"
  case 6: 
   var $15=(($data+$i_1)|0); //@line 1342 "src/markdown.c"
   var $16=HEAP8[($15)]; //@line 1342 "src/markdown.c"
   var $17=(($16 << 24) >> 24)==32; //@line 1342 "src/markdown.c"
   var $18=(($17)&(1)); //@line 1342 "src/markdown.c"
   var $_i_1=((($18)+($i_1))|0); //@line 1342 "src/markdown.c"
   var $i_2 = $_i_1;label = 7; break; //@line 1342 "src/markdown.c"
  case 7: 
   var $i_2;
   var $20=(($i_2)>>>(0)) < (($size)>>>(0)); //@line 1344 "src/markdown.c"
   if ($20) { label = 8; break; } else { label = 32; break; } //@line 1344 "src/markdown.c"
  case 8: 
   var $22=(($data+$i_2)|0); //@line 1344 "src/markdown.c"
   var $23=HEAP8[($22)]; //@line 1344 "src/markdown.c"
   var $_off=((($23)-(48))&255); //@line 1344 "src/markdown.c"
   var $24=(($_off)&(255)) > 9; //@line 1344 "src/markdown.c"
   if ($24) { label = 32; break; } else { var $i_3 = $i_2;label = 9; break; } //@line 1344 "src/markdown.c"
  case 9: 
   var $i_3;
   var $25=(($i_3)>>>(0)) < (($size)>>>(0)); //@line 1347 "src/markdown.c"
   if ($25) { label = 11; break; } else { label = 10; break; } //@line 1347 "src/markdown.c"
  case 10: 
   var $26=((($i_3)+(1))|0); //@line 1348 "src/markdown.c"
   var $32 = $26;label = 12; break;
  case 11: 
   var $28=(($data+$i_3)|0); //@line 1347 "src/markdown.c"
   var $29=HEAP8[($28)]; //@line 1347 "src/markdown.c"
   var $_off45=((($29)-(48))&255); //@line 1347 "src/markdown.c"
   var $30=(($_off45)&(255)) < 10; //@line 1347 "src/markdown.c"
   var $31=((($i_3)+(1))|0); //@line 1348 "src/markdown.c"
   if ($30) { var $i_3 = $31;label = 9; break; } else { var $32 = $31;label = 12; break; }
  case 12: 
   var $32;
   var $33=(($32)>>>(0)) < (($size)>>>(0)); //@line 1350 "src/markdown.c"
   if ($33) { label = 13; break; } else { label = 32; break; } //@line 1350 "src/markdown.c"
  case 13: 
   var $35=(($data+$i_3)|0); //@line 1350 "src/markdown.c"
   var $36=HEAP8[($35)]; //@line 1350 "src/markdown.c"
   var $37=(($36 << 24) >> 24)==46; //@line 1350 "src/markdown.c"
   if ($37) { label = 14; break; } else { label = 32; break; } //@line 1350 "src/markdown.c"
  case 14: 
   var $39=(($data+$32)|0); //@line 1350 "src/markdown.c"
   var $40=HEAP8[($39)]; //@line 1350 "src/markdown.c"
   var $41=(($40 << 24) >> 24)==32; //@line 1350 "src/markdown.c"
   if ($41) { label = 15; break; } else { label = 32; break; } //@line 1350 "src/markdown.c"
  case 15: 
   var $43=((($size)-($i_3))|0); //@line 1353 "src/markdown.c"
   var $i_0_i = 0;label = 16; break; //@line 1296 "src/markdown.c"
  case 16: 
   var $i_0_i;
   var $45=(($i_0_i)>>>(0)) < (($43)>>>(0)); //@line 1296 "src/markdown.c"
   if ($45) { label = 18; break; } else { label = 17; break; } //@line 1296 "src/markdown.c"
  case 17: 
   var $46=((($i_0_i)+(1))|0); //@line 1297 "src/markdown.c"
   var $52 = $46;label = 19; break;
  case 18: 
   var $_sum44=((($i_0_i)+($i_3))|0); //@line 1296 "src/markdown.c"
   var $48=(($data+$_sum44)|0); //@line 1296 "src/markdown.c"
   var $49=HEAP8[($48)]; //@line 1296 "src/markdown.c"
   var $50=(($49 << 24) >> 24)==10; //@line 1296 "src/markdown.c"
   var $51=((($i_0_i)+(1))|0); //@line 1297 "src/markdown.c"
   if ($50) { var $52 = $51;label = 19; break; } else { var $i_0_i = $51;label = 16; break; }
  case 19: 
   var $52;
   var $53=(($52)>>>(0)) < (($43)>>>(0)); //@line 1299 "src/markdown.c"
   if ($53) { label = 20; break; } else { var $_0_i = 0;label = 31; break; } //@line 1299 "src/markdown.c"
  case 20: 
   var $_sum=((($52)+($i_3))|0); //@line 1302 "src/markdown.c"
   var $55=(($data+$_sum)|0); //@line 1302 "src/markdown.c"
   var $56=((($43)-($52))|0); //@line 1302 "src/markdown.c"
   var $57=HEAP8[($55)]; //@line 1277 "src/markdown.c"
   if ((($57 << 24) >> 24)==61) {
    var $i_0_i_i = 1;label = 21; break;
   }
   else if ((($57 << 24) >> 24)==45) {
    var $i_2_i_i = 1;label = 26; break;
   }
   else {
   var $_0_i = 0;label = 31; break;
   }
  case 21: 
   var $i_0_i_i;
   var $58=(($i_0_i_i)>>>(0)) < (($56)>>>(0)); //@line 1278 "src/markdown.c"
   if ($58) { label = 22; break; } else { var $i_1_i_i = $i_0_i_i;label = 23; break; } //@line 1278 "src/markdown.c"
  case 22: 
   var $_sum43=((($_sum)+($i_0_i_i))|0); //@line 1278 "src/markdown.c"
   var $60=(($data+$_sum43)|0); //@line 1278 "src/markdown.c"
   var $61=HEAP8[($60)]; //@line 1278 "src/markdown.c"
   var $62=(($61 << 24) >> 24)==61; //@line 1278 "src/markdown.c"
   var $63=((($i_0_i_i)+(1))|0); //@line 1278 "src/markdown.c"
   if ($62) { var $i_0_i_i = $63;label = 21; break; } else { var $i_1_i_i = $i_0_i_i;label = 23; break; }
  case 23: 
   var $i_1_i_i;
   var $64=(($i_1_i_i)>>>(0)) < (($56)>>>(0)); //@line 1279 "src/markdown.c"
   if ($64) { label = 24; break; } else { var $_0_i = 1;label = 31; break; } //@line 1279 "src/markdown.c"
  case 24: 
   var $_sum42=((($_sum)+($i_1_i_i))|0); //@line 1279 "src/markdown.c"
   var $66=(($data+$_sum42)|0); //@line 1279 "src/markdown.c"
   var $67=HEAP8[($66)]; //@line 1279 "src/markdown.c"
   var $68=(($67 << 24) >> 24)==32; //@line 1279 "src/markdown.c"
   var $69=((($i_1_i_i)+(1))|0); //@line 1279 "src/markdown.c"
   if ($68) { var $i_1_i_i = $69;label = 23; break; } else { label = 25; break; }
  case 25: 
   var $71=(($67 << 24) >> 24)==10; //@line 1280 "src/markdown.c"
   var $phitmp31_i_i=(($71)&(1)); //@line 1280 "src/markdown.c"
   var $_0_i = $phitmp31_i_i;label = 31; break; //@line 1280 "src/markdown.c"
  case 26: 
   var $i_2_i_i;
   var $72=(($i_2_i_i)>>>(0)) < (($56)>>>(0)); //@line 1284 "src/markdown.c"
   if ($72) { label = 27; break; } else { var $i_3_i_i = $i_2_i_i;label = 28; break; } //@line 1284 "src/markdown.c"
  case 27: 
   var $_sum41=((($_sum)+($i_2_i_i))|0); //@line 1284 "src/markdown.c"
   var $74=(($data+$_sum41)|0); //@line 1284 "src/markdown.c"
   var $75=HEAP8[($74)]; //@line 1284 "src/markdown.c"
   var $76=(($75 << 24) >> 24)==45; //@line 1284 "src/markdown.c"
   var $77=((($i_2_i_i)+(1))|0); //@line 1284 "src/markdown.c"
   if ($76) { var $i_2_i_i = $77;label = 26; break; } else { var $i_3_i_i = $i_2_i_i;label = 28; break; }
  case 28: 
   var $i_3_i_i;
   var $78=(($i_3_i_i)>>>(0)) < (($56)>>>(0)); //@line 1285 "src/markdown.c"
   if ($78) { label = 29; break; } else { var $_0_i = 2;label = 31; break; } //@line 1285 "src/markdown.c"
  case 29: 
   var $_sum40=((($_sum)+($i_3_i_i))|0); //@line 1285 "src/markdown.c"
   var $80=(($data+$_sum40)|0); //@line 1285 "src/markdown.c"
   var $81=HEAP8[($80)]; //@line 1285 "src/markdown.c"
   var $82=(($81 << 24) >> 24)==32; //@line 1285 "src/markdown.c"
   var $83=((($i_3_i_i)+(1))|0); //@line 1285 "src/markdown.c"
   if ($82) { var $i_3_i_i = $83;label = 28; break; } else { label = 30; break; }
  case 30: 
   var $85=(($81 << 24) >> 24)==10; //@line 1286 "src/markdown.c"
   var $phitmp_i_i=$85 ? 2 : 0; //@line 1286 "src/markdown.c"
   var $_0_i = $phitmp_i_i;label = 31; break; //@line 1286 "src/markdown.c"
  case 31: 
   var $_0_i;
   var $86=(($_0_i)|(0))==0; //@line 1353 "src/markdown.c"
   var $87=((($i_3)+(2))|0); //@line 1356 "src/markdown.c"
   var $_39=$86 ? $87 : 0; //@line 1353 "src/markdown.c"
   return $_39; //@line 1353 "src/markdown.c"
  case 32: 
   return 0; //@line 1357 "src/markdown.c"
  default: assert(0, "bad label: " + label);
 }
}
function _is_codefence($data, $size, $syntax) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($size)>>>(0)) < 3; //@line 1171 "src/markdown.c"
   if ($1) { var $_0 = 0;label = 34; break; } else { label = 2; break; } //@line 1171 "src/markdown.c"
  case 2: 
   var $3=HEAP8[($data)]; //@line 1172 "src/markdown.c"
   var $4=(($3 << 24) >> 24)==32; //@line 1172 "src/markdown.c"
   if ($4) { label = 3; break; } else { var $i_0_i = 0;label = 5; break; } //@line 1172 "src/markdown.c"
  case 3: 
   var $6=(($data+1)|0); //@line 1173 "src/markdown.c"
   var $7=HEAP8[($6)]; //@line 1173 "src/markdown.c"
   var $8=(($7 << 24) >> 24)==32; //@line 1173 "src/markdown.c"
   if ($8) { label = 4; break; } else { var $i_0_i = 1;label = 5; break; } //@line 1173 "src/markdown.c"
  case 4: 
   var $10=(($data+2)|0); //@line 1174 "src/markdown.c"
   var $11=HEAP8[($10)]; //@line 1174 "src/markdown.c"
   var $12=(($11 << 24) >> 24)==32; //@line 1174 "src/markdown.c"
   var $__i=$12 ? 3 : 2; //@line 1174 "src/markdown.c"
   var $i_0_i = $__i;label = 5; break; //@line 1174 "src/markdown.c"
  case 5: 
   var $i_0_i;
   var $14=((($i_0_i)+(2))|0); //@line 1177 "src/markdown.c"
   var $15=(($14)>>>(0)) < (($size)>>>(0)); //@line 1177 "src/markdown.c"
   if ($15) { label = 6; break; } else { var $_0 = 0;label = 34; break; } //@line 1177 "src/markdown.c"
  case 6: 
   var $17=(($data+$i_0_i)|0); //@line 1177 "src/markdown.c"
   var $18=HEAP8[($17)]; //@line 1177 "src/markdown.c"
   if ((($18 << 24) >> 24)==126 | (($18 << 24) >> 24)==96) {
    label = 7; break;
   }
   else {
   var $_0 = 0;label = 34; break;
   }
  case 7: 
   var $20=(($i_0_i)>>>(0)) < (($size)>>>(0)); //@line 1183 "src/markdown.c"
   if ($20) { var $n_022_i96 = 0;var $i_121_i97 = $i_0_i;label = 8; break; } else { var $_0 = 0;label = 34; break; } //@line 1183 "src/markdown.c"
  case 8: 
   var $i_121_i97;
   var $n_022_i96;
   var $21=((($n_022_i96)+(1))|0); //@line 1184 "src/markdown.c"
   var $22=((($i_121_i97)+(1))|0); //@line 1184 "src/markdown.c"
   var $23=(($22)>>>(0)) < (($size)>>>(0)); //@line 1183 "src/markdown.c"
   if ($23) { label = 9; break; } else { label = 10; break; } //@line 1183 "src/markdown.c"
  case 9: 
   var $_phi_trans_insert_i=(($data+$22)|0);
   var $_pre_i=HEAP8[($_phi_trans_insert_i)]; //@line 1183 "src/markdown.c"
   var $24=(($_pre_i << 24) >> 24)==(($18 << 24) >> 24); //@line 1183 "src/markdown.c"
   if ($24) { var $n_022_i96 = $21;var $i_121_i97 = $22;label = 8; break; } else { label = 10; break; }
  case 10: 
   var $25=(($21)>>>(0)) < 3; //@line 1187 "src/markdown.c"
   var $_i_1_i=$25 ? 0 : $22; //@line 1188 "src/markdown.c"
   var $26=(($_i_1_i)|(0))==0; //@line 1201 "src/markdown.c"
   if ($26) { var $_0 = 0;label = 34; break; } else { var $i_0 = $_i_1_i;label = 11; break; } //@line 1201 "src/markdown.c"
  case 11: 
   var $i_0;
   var $27=(($i_0)>>>(0)) < (($size)>>>(0)); //@line 1204 "src/markdown.c"
   var $28=(($data+$i_0)|0); //@line 1204 "src/markdown.c"
   if ($27) { label = 13; break; } else { var $syn_start_1 = $28;var $syn_len_4 = 0;var $i_3 = $i_0;label = 28; break; } //@line 1204 "src/markdown.c"
  case 12: 
   if ($27) { var $i_287 = $i_0;var $syn_len_388 = 0;label = 26; break; } else { var $syn_start_1 = $28;var $syn_len_4 = 0;var $i_3 = $i_0;label = 28; break; } //@line 1230 "src/markdown.c"
  case 13: 
   var $30=HEAP8[($28)]; //@line 1204 "src/markdown.c"
   var $31=((($i_0)+(1))|0); //@line 1205 "src/markdown.c"
   if ((($30 << 24) >> 24)==32) {
    var $i_0 = $31;label = 11; break;
   }
   else if ((($30 << 24) >> 24)==123) {
    label = 14; break;
   }
   else {
   label = 12; break;
   }
  case 14: 
   var $33=(($data+$31)|0); //@line 1210 "src/markdown.c"
   var $34=(($31)>>>(0)) < (($size)>>>(0)); //@line 1212 "src/markdown.c"
   if ($34) { var $i_1_in80 = $i_0;var $syn_len_081 = 0;var $i_182 = $31;label = 15; break; } else { var $i_1_in_lcssa = $i_0;var $syn_len_0_lcssa = 0;var $i_1_lcssa = $31;label = 17; break; } //@line 1212 "src/markdown.c"
  case 15: 
   var $i_182;
   var $syn_len_081;
   var $i_1_in80;
   var $35=(($data+$i_182)|0); //@line 1212 "src/markdown.c"
   var $36=HEAP8[($35)]; //@line 1212 "src/markdown.c"
   if ((($36 << 24) >> 24)==125 | (($36 << 24) >> 24)==10) {
    var $i_1_in_lcssa = $i_1_in80;var $syn_len_0_lcssa = $syn_len_081;var $i_1_lcssa = $i_182;label = 17; break;
   }
   else {
   label = 16; break;
   }
  case 16: 
   var $38=((($syn_len_081)+(1))|0); //@line 1213 "src/markdown.c"
   var $i_1=((($i_182)+(1))|0); //@line 1210 "src/markdown.c"
   var $39=(($i_1)>>>(0)) < (($size)>>>(0)); //@line 1212 "src/markdown.c"
   if ($39) { var $i_1_in80 = $i_182;var $syn_len_081 = $38;var $i_182 = $i_1;label = 15; break; } else { var $i_1_in_lcssa = $i_182;var $syn_len_0_lcssa = $38;var $i_1_lcssa = $i_1;label = 17; break; } //@line 1212 "src/markdown.c"
  case 17: 
   var $i_1_lcssa;
   var $syn_len_0_lcssa;
   var $i_1_in_lcssa;
   var $40=(($i_1_lcssa)|(0))==(($size)|(0)); //@line 1216 "src/markdown.c"
   if ($40) { var $_0 = 0;label = 34; break; } else { label = 18; break; } //@line 1216 "src/markdown.c"
  case 18: 
   var $42=(($data+$i_1_lcssa)|0); //@line 1216 "src/markdown.c"
   var $43=HEAP8[($42)]; //@line 1216 "src/markdown.c"
   var $44=(($43 << 24) >> 24)==125; //@line 1216 "src/markdown.c"
   if ($44) { label = 19; break; } else { var $_0 = 0;label = 34; break; } //@line 1216 "src/markdown.c"
  case 19: 
   var $45=(($syn_len_0_lcssa)|(0))==0; //@line 1221 "src/markdown.c"
   if ($45) { var $syn_len_2_lcssa = 0;var $syn_start_0_lcssa121 = $33;label = 25; break; } else { var $syn_len_174 = $syn_len_0_lcssa;var $syn_start_075 = $33;label = 20; break; } //@line 1221 "src/markdown.c"
  case 20: 
   var $syn_start_075;
   var $syn_len_174;
   var $46=HEAP8[($syn_start_075)]; //@line 1221 "src/markdown.c"
   if ((($46 << 24) >> 24)==32 | (($46 << 24) >> 24)==10) {
    label = 22; break;
   }
   else {
   label = 21; break;
   }
  case 21: 
   var $47=(($syn_len_174)|(0))==0; //@line 1225 "src/markdown.c"
   if ($47) { var $syn_len_2_lcssa = 0;var $syn_start_0_lcssa121 = $syn_start_075;label = 25; break; } else { var $syn_len_270 = $syn_len_174;label = 23; break; } //@line 1225 "src/markdown.c"
  case 22: 
   var $48=(($syn_start_075+1)|0); //@line 1222 "src/markdown.c"
   var $49=((($syn_len_174)-(1))|0); //@line 1222 "src/markdown.c"
   var $50=(($49)|(0))==0; //@line 1221 "src/markdown.c"
   if ($50) { var $syn_len_2_lcssa = 0;var $syn_start_0_lcssa121 = $48;label = 25; break; } else { var $syn_len_174 = $49;var $syn_start_075 = $48;label = 20; break; } //@line 1221 "src/markdown.c"
  case 23: 
   var $syn_len_270;
   var $51=((($syn_len_270)-(1))|0); //@line 1225 "src/markdown.c"
   var $52=(($syn_start_075+$51)|0); //@line 1225 "src/markdown.c"
   var $53=HEAP8[($52)]; //@line 1225 "src/markdown.c"
   if ((($53 << 24) >> 24)==32 | (($53 << 24) >> 24)==10) {
    label = 24; break;
   }
   else {
   var $syn_len_2_lcssa = $syn_len_270;var $syn_start_0_lcssa121 = $syn_start_075;label = 25; break;
   }
  case 24: 
   var $54=(($51)|(0))==0; //@line 1225 "src/markdown.c"
   if ($54) { var $syn_len_2_lcssa = 0;var $syn_start_0_lcssa121 = $syn_start_075;label = 25; break; } else { var $syn_len_270 = $51;label = 23; break; } //@line 1225 "src/markdown.c"
  case 25: 
   var $syn_start_0_lcssa121;
   var $syn_len_2_lcssa;
   var $55=((($i_1_in_lcssa)+(2))|0); //@line 1228 "src/markdown.c"
   var $syn_start_1 = $syn_start_0_lcssa121;var $syn_len_4 = $syn_len_2_lcssa;var $i_3 = $55;label = 28; break; //@line 1229 "src/markdown.c"
  case 26: 
   var $syn_len_388;
   var $i_287;
   var $56=(($data+$i_287)|0); //@line 1230 "src/markdown.c"
   var $57=HEAP8[($56)]; //@line 1230 "src/markdown.c"
   if ((($57 << 24) >> 24)==32 | (($57 << 24) >> 24)==10) {
    var $syn_start_1 = $28;var $syn_len_4 = $syn_len_388;var $i_3 = $i_287;label = 28; break;
   }
   else {
   label = 27; break;
   }
  case 27: 
   var $58=((($syn_len_388)+(1))|0); //@line 1231 "src/markdown.c"
   var $59=((($i_287)+(1))|0); //@line 1231 "src/markdown.c"
   var $60=(($59)>>>(0)) < (($size)>>>(0)); //@line 1230 "src/markdown.c"
   if ($60) { var $i_287 = $59;var $syn_len_388 = $58;label = 26; break; } else { var $syn_start_1 = $28;var $syn_len_4 = $58;var $i_3 = $59;label = 28; break; } //@line 1230 "src/markdown.c"
  case 28: 
   var $i_3;
   var $syn_len_4;
   var $syn_start_1;
   var $61=(($syntax)|(0))==0; //@line 1235 "src/markdown.c"
   if ($61) { label = 30; break; } else { label = 29; break; } //@line 1235 "src/markdown.c"
  case 29: 
   var $63=(($syntax)|0); //@line 1236 "src/markdown.c"
   HEAP32[(($63)>>2)]=$syn_start_1; //@line 1236 "src/markdown.c"
   var $64=(($syntax+4)|0); //@line 1237 "src/markdown.c"
   HEAP32[(($64)>>2)]=$syn_len_4; //@line 1237 "src/markdown.c"
   label = 30; break; //@line 1238 "src/markdown.c"
  case 30: 
   var $65=(($i_3)>>>(0)) < (($size)>>>(0)); //@line 1240 "src/markdown.c"
   if ($65) { var $i_469 = $i_3;label = 31; break; } else { var $i_4_lcssa = $i_3;label = 33; break; } //@line 1240 "src/markdown.c"
  case 31: 
   var $i_469;
   var $66=(($data+$i_469)|0); //@line 1240 "src/markdown.c"
   var $67=HEAP8[($66)]; //@line 1240 "src/markdown.c"
   if ((($67 << 24) >> 24)==32) {
    label = 32; break;
   }
   else if ((($67 << 24) >> 24)==10) {
    var $i_4_lcssa = $i_469;label = 33; break;
   }
   else {
   var $_0 = 0;label = 34; break;
   }
  case 32: 
   var $68=((($i_469)+(1))|0); //@line 1244 "src/markdown.c"
   var $69=(($68)>>>(0)) < (($size)>>>(0)); //@line 1240 "src/markdown.c"
   if ($69) { var $i_469 = $68;label = 31; break; } else { var $i_4_lcssa = $68;label = 33; break; } //@line 1240 "src/markdown.c"
  case 33: 
   var $i_4_lcssa;
   var $70=((($i_4_lcssa)+(1))|0); //@line 1247 "src/markdown.c"
   var $_0 = $70;label = 34; break; //@line 1247 "src/markdown.c"
  case 34: 
   var $_0;
   return $_0; //@line 1248 "src/markdown.c"
  default: assert(0, "bad label: " + label);
 }
}
function _parse_inline($ob, $rndr, $data, $size) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 16)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $work=sp;
   var $1=$work; //@line 357 "src/markdown.c"
   HEAP32[(($1)>>2)]=0; HEAP32[((($1)+(4))>>2)]=0; HEAP32[((($1)+(8))>>2)]=0; HEAP32[((($1)+(12))>>2)]=0; //@line 357 "src/markdown.c"
   var $2=(($rndr+412)|0); //@line 359 "src/markdown.c"
   var $3=HEAP32[(($2)>>2)]; //@line 359 "src/markdown.c"
   var $4=(($rndr+400)|0); //@line 359 "src/markdown.c"
   var $5=HEAP32[(($4)>>2)]; //@line 359 "src/markdown.c"
   var $6=((($5)+($3))|0); //@line 359 "src/markdown.c"
   var $7=(($rndr+424)|0); //@line 359 "src/markdown.c"
   var $8=HEAP32[(($7)>>2)]; //@line 359 "src/markdown.c"
   var $9=(($6)>>>(0)) > (($8)>>>(0)); //@line 359 "src/markdown.c"
   var $10=(($size)|(0))==0; //@line 363 "src/markdown.c"
   var $or_cond=$9 | $10; //@line 359 "src/markdown.c"
   if ($or_cond) { label = 11; break; } else { label = 2; break; } //@line 359 "src/markdown.c"
  case 2: 
   var $11=(($rndr+92)|0); //@line 369 "src/markdown.c"
   var $12=(($work)|0); //@line 370 "src/markdown.c"
   var $13=(($work+4)|0); //@line 371 "src/markdown.c"
   var $14=(($rndr+104)|0); //@line 372 "src/markdown.c"
   var $i_038 = 0;var $end_039 = 0;var $action_040 = 0;label = 3; break; //@line 363 "src/markdown.c"
  case 3: 
   var $action_040;
   var $end_039;
   var $i_038;
   var $action_1 = $action_040;var $end_1 = $end_039;label = 4; break; //@line 365 "src/markdown.c"
  case 4: 
   var $end_1;
   var $action_1;
   var $16=(($end_1)>>>(0)) < (($size)>>>(0)); //@line 365 "src/markdown.c"
   if ($16) { label = 5; break; } else { var $action_2 = $action_1;var $_lcssa = 0;label = 6; break; } //@line 365 "src/markdown.c"
  case 5: 
   var $18=(($data+$end_1)|0); //@line 365 "src/markdown.c"
   var $19=HEAP8[($18)]; //@line 365 "src/markdown.c"
   var $20=(($19)&(255)); //@line 365 "src/markdown.c"
   var $21=(($rndr+140+$20)|0); //@line 365 "src/markdown.c"
   var $22=HEAP8[($21)]; //@line 365 "src/markdown.c"
   var $23=(($22 << 24) >> 24)==0; //@line 365 "src/markdown.c"
   var $24=((($end_1)+(1))|0); //@line 366 "src/markdown.c"
   if ($23) { var $action_1 = 0;var $end_1 = $24;label = 4; break; } else { var $action_2 = $22;var $_lcssa = 1;label = 6; break; }
  case 6: 
   var $_lcssa;
   var $action_2;
   var $25=HEAP32[(($11)>>2)]; //@line 369 "src/markdown.c"
   var $26=(($25)|(0))==0; //@line 369 "src/markdown.c"
   var $27=(($data+$i_038)|0); //@line 375 "src/markdown.c"
   if ($26) { label = 8; break; } else { label = 7; break; } //@line 369 "src/markdown.c"
  case 7: 
   HEAP32[(($12)>>2)]=$27; //@line 370 "src/markdown.c"
   var $29=((($end_1)-($i_038))|0); //@line 371 "src/markdown.c"
   HEAP32[(($13)>>2)]=$29; //@line 371 "src/markdown.c"
   var $30=HEAP32[(($14)>>2)]; //@line 372 "src/markdown.c"
   FUNCTION_TABLE[$25]($ob, $work, $30); //@line 372 "src/markdown.c"
   label = 9; break; //@line 373 "src/markdown.c"
  case 8: 
   var $32=((($end_1)-($i_038))|0); //@line 375 "src/markdown.c"
   _bufput($ob, $27, $32); //@line 375 "src/markdown.c"
   label = 9; break;
  case 9: 
   if ($_lcssa) { label = 10; break; } else { label = 11; break; } //@line 377 "src/markdown.c"
  case 10: 
   var $34=(($action_2)&(255)); //@line 380 "src/markdown.c"
   var $35=((560+($34<<2))|0); //@line 380 "src/markdown.c"
   var $36=HEAP32[(($35)>>2)]; //@line 380 "src/markdown.c"
   var $37=(($data+$end_1)|0); //@line 380 "src/markdown.c"
   var $38=((($size)-($end_1))|0); //@line 380 "src/markdown.c"
   var $39=FUNCTION_TABLE[$36]($ob, $rndr, $37, $end_1, $38); //@line 380 "src/markdown.c"
   var $40=(($39)|(0))==0; //@line 381 "src/markdown.c"
   var $41=((($39)+($end_1))|0); //@line 384 "src/markdown.c"
   var $42=((($end_1)+(1))|0); //@line 382 "src/markdown.c"
   var $end_0_be=$40 ? $42 : $41; //@line 381 "src/markdown.c"
   var $43=(($41)>>>(0)) < (($size)>>>(0)); //@line 363 "src/markdown.c"
   if ($43) { var $i_038 = $41;var $end_039 = $end_0_be;var $action_040 = $action_2;label = 3; break; } else { label = 11; break; } //@line 363 "src/markdown.c"
  case 11: 
   STACKTOP = sp;
   return; //@line 388 "src/markdown.c"
  default: assert(0, "bad label: " + label);
 }
}
function _char_emphasis($ob, $rndr, $data, $offset, $size) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=HEAP8[($data)]; //@line 596 "src/markdown.c"
   var $2=(($rndr+420)|0); //@line 599 "src/markdown.c"
   var $3=HEAP32[(($2)>>2)]; //@line 599 "src/markdown.c"
   var $4=$3 & 1; //@line 599 "src/markdown.c"
   var $5=(($4)|(0))==0; //@line 599 "src/markdown.c"
   var $6=(($offset)|(0))==0; //@line 600 "src/markdown.c"
   var $or_cond=$5 | $6; //@line 599 "src/markdown.c"
   if ($or_cond) { label = 4; break; } else { label = 2; break; } //@line 599 "src/markdown.c"
  case 2: 
   var $8=((($data)-(1))|0); //@line 600 "src/markdown.c"
   var $9=HEAP8[($8)]; //@line 600 "src/markdown.c"
   if ((($9 << 24) >> 24)==32 | (($9 << 24) >> 24)==10) {
    label = 4; break;
   }
   else {
   label = 3; break;
   }
  case 3: 
   var $11=(($9 << 24) >> 24)==62; //@line 600 "src/markdown.c"
   var $12=(($size)>>>(0)) > 2; //@line 604 "src/markdown.c"
   var $or_cond52=$11 & $12; //@line 600 "src/markdown.c"
   if ($or_cond52) { label = 5; break; } else { var $_0 = 0;label = 34; break; } //@line 600 "src/markdown.c"
  case 4: 
   var $_old=(($size)>>>(0)) > 2; //@line 604 "src/markdown.c"
   if ($_old) { label = 5; break; } else { var $_0 = 0;label = 34; break; } //@line 604 "src/markdown.c"
  case 5: 
   var $14=(($data+1)|0); //@line 604 "src/markdown.c"
   var $15=HEAP8[($14)]; //@line 604 "src/markdown.c"
   var $16=(($15 << 24) >> 24)==(($1 << 24) >> 24); //@line 604 "src/markdown.c"
   if ($16) { label = 8; break; } else { label = 6; break; } //@line 604 "src/markdown.c"
  case 6: 
   var $18=(($1 << 24) >> 24)==126; //@line 607 "src/markdown.c"
   var $19=(($15 << 24) >> 24)==32; //@line 250 "src/markdown.c"
   var $or_cond54=$18 | $19; //@line 607 "src/markdown.c"
   var $20=(($15 << 24) >> 24)==10; //@line 250 "src/markdown.c"
   var $or_cond63=$or_cond54 | $20; //@line 607 "src/markdown.c"
   if ($or_cond63) { var $_0 = 0;label = 34; break; } else { label = 7; break; } //@line 607 "src/markdown.c"
  case 7: 
   var $22=((($size)-(1))|0); //@line 607 "src/markdown.c"
   var $23=_parse_emph1($ob, $rndr, $14, $22, $1); //@line 607 "src/markdown.c"
   var $24=(($23)|(0))==0; //@line 607 "src/markdown.c"
   var $25=((($23)+(1))|0); //@line 610 "src/markdown.c"
   var $_=$24 ? 0 : $25; //@line 607 "src/markdown.c"
   return $_; //@line 607 "src/markdown.c"
  case 8: 
   var $27=(($size)>>>(0)) > 3; //@line 613 "src/markdown.c"
   if ($27) { label = 9; break; } else { var $_0 = 0;label = 34; break; } //@line 613 "src/markdown.c"
  case 9: 
   var $29=(($data+2)|0); //@line 613 "src/markdown.c"
   var $30=HEAP8[($29)]; //@line 613 "src/markdown.c"
   var $31=(($30 << 24) >> 24)==(($1 << 24) >> 24); //@line 613 "src/markdown.c"
   if ($31) { label = 12; break; } else { label = 10; break; } //@line 613 "src/markdown.c"
  case 10: 
   if ((($30 << 24) >> 24)==32 | (($30 << 24) >> 24)==10) {
    var $_0 = 0;label = 34; break;
   }
   else {
   label = 11; break;
   }
  case 11: 
   var $34=((($size)-(2))|0); //@line 614 "src/markdown.c"
   var $35=_parse_emph2($ob, $rndr, $29, $34, $1); //@line 614 "src/markdown.c"
   var $36=(($35)|(0))==0; //@line 614 "src/markdown.c"
   var $37=((($35)+(2))|0); //@line 617 "src/markdown.c"
   var $_42=$36 ? 0 : $37; //@line 614 "src/markdown.c"
   var $_0 = $_42;label = 34; break; //@line 614 "src/markdown.c"
  case 12: 
   var $39=(($size)>>>(0)) > 4; //@line 620 "src/markdown.c"
   if ($39) { label = 13; break; } else { var $_0 = 0;label = 34; break; } //@line 620 "src/markdown.c"
  case 13: 
   var $41=(($data+2)|0); //@line 620 "src/markdown.c"
   var $42=HEAP8[($41)]; //@line 620 "src/markdown.c"
   var $43=(($42 << 24) >> 24)==(($1 << 24) >> 24); //@line 620 "src/markdown.c"
   if ($43) { label = 14; break; } else { var $_0 = 0;label = 34; break; } //@line 620 "src/markdown.c"
  case 14: 
   var $45=(($data+3)|0); //@line 620 "src/markdown.c"
   var $46=HEAP8[($45)]; //@line 620 "src/markdown.c"
   var $47=(($46 << 24) >> 24)==(($1 << 24) >> 24); //@line 620 "src/markdown.c"
   var $48=(($1 << 24) >> 24)==126; //@line 621 "src/markdown.c"
   var $or_cond43=$47 | $48; //@line 620 "src/markdown.c"
   var $49=(($46 << 24) >> 24)==32; //@line 250 "src/markdown.c"
   var $or_cond56=$or_cond43 | $49; //@line 620 "src/markdown.c"
   var $50=(($46 << 24) >> 24)==10; //@line 250 "src/markdown.c"
   var $or_cond65=$or_cond56 | $50; //@line 620 "src/markdown.c"
   if ($or_cond65) { var $_0 = 0;label = 34; break; } else { label = 15; break; } //@line 620 "src/markdown.c"
  case 15: 
   var $52=((($size)-(3))|0); //@line 621 "src/markdown.c"
   var $53=(($52)|(0))==0; //@line 558 "src/markdown.c"
   if ($53) { var $127 = 0;label = 33; break; } else { var $i_054_i = 0;label = 16; break; } //@line 558 "src/markdown.c"
  case 16: 
   var $i_054_i;
   var $_sum=((($i_054_i)+(3))|0); //@line 559 "src/markdown.c"
   var $54=(($data+$_sum)|0); //@line 559 "src/markdown.c"
   var $55=((($52)-($i_054_i))|0); //@line 559 "src/markdown.c"
   var $56=_find_emph_char($54, $55, $1); //@line 559 "src/markdown.c"
   var $57=(($56)|(0))==0; //@line 560 "src/markdown.c"
   if ($57) { var $127 = 0;label = 33; break; } else { label = 17; break; } //@line 560 "src/markdown.c"
  case 17: 
   var $59=((($56)+($i_054_i))|0); //@line 561 "src/markdown.c"
   var $_sum57=((($59)+(3))|0); //@line 564 "src/markdown.c"
   var $60=(($data+$_sum57)|0); //@line 564 "src/markdown.c"
   var $61=HEAP8[($60)]; //@line 564 "src/markdown.c"
   var $62=(($61 << 24) >> 24)==(($1 << 24) >> 24); //@line 564 "src/markdown.c"
   if ($62) { label = 19; break; } else { label = 18; break; } //@line 564 "src/markdown.c"
  case 18: 
   var $63=(($59)>>>(0)) < (($52)>>>(0)); //@line 558 "src/markdown.c"
   if ($63) { var $i_054_i = $59;label = 16; break; } else { var $127 = 0;label = 33; break; } //@line 558 "src/markdown.c"
  case 19: 
   var $_sum58=((($59)+(2))|0); //@line 564 "src/markdown.c"
   var $65=(($data+$_sum58)|0); //@line 564 "src/markdown.c"
   var $66=HEAP8[($65)]; //@line 564 "src/markdown.c"
   if ((($66 << 24) >> 24)==32 | (($66 << 24) >> 24)==10) {
    label = 18; break;
   }
   else {
   label = 20; break;
   }
  case 20: 
   var $68=(($_sum58)>>>(0)) < (($52)>>>(0)); //@line 567 "src/markdown.c"
   var $69=((($59)+(1))|0); //@line 567 "src/markdown.c"
   if ($68) { label = 21; break; } else { label = 29; break; } //@line 567 "src/markdown.c"
  case 21: 
   var $_sum60=((($59)+(4))|0); //@line 567 "src/markdown.c"
   var $71=(($data+$_sum60)|0); //@line 567 "src/markdown.c"
   var $72=HEAP8[($71)]; //@line 567 "src/markdown.c"
   var $73=(($72 << 24) >> 24)==(($1 << 24) >> 24); //@line 567 "src/markdown.c"
   if ($73) { label = 22; break; } else { label = 29; break; } //@line 567 "src/markdown.c"
  case 22: 
   var $_sum61=((($59)+(5))|0); //@line 567 "src/markdown.c"
   var $75=(($data+$_sum61)|0); //@line 567 "src/markdown.c"
   var $76=HEAP8[($75)]; //@line 567 "src/markdown.c"
   var $77=(($76 << 24) >> 24)==(($1 << 24) >> 24); //@line 567 "src/markdown.c"
   if ($77) { label = 23; break; } else { label = 29; break; } //@line 567 "src/markdown.c"
  case 23: 
   var $79=(($rndr+76)|0); //@line 567 "src/markdown.c"
   var $80=HEAP32[(($79)>>2)]; //@line 567 "src/markdown.c"
   var $81=(($80)|(0))==0; //@line 567 "src/markdown.c"
   if ($81) { label = 29; break; } else { label = 24; break; } //@line 567 "src/markdown.c"
  case 24: 
   var $83=(($rndr+408)|0); //@line 130 "src/markdown.c"
   var $84=(($rndr+412)|0); //@line 132 "src/markdown.c"
   var $85=HEAP32[(($84)>>2)]; //@line 132 "src/markdown.c"
   var $86=(($rndr+416)|0); //@line 132 "src/markdown.c"
   var $87=HEAP32[(($86)>>2)]; //@line 132 "src/markdown.c"
   var $88=(($85)>>>(0)) < (($87)>>>(0)); //@line 132 "src/markdown.c"
   if ($88) { label = 25; break; } else { label = 27; break; } //@line 132 "src/markdown.c"
  case 25: 
   var $90=(($83)|0); //@line 132 "src/markdown.c"
   var $91=HEAP32[(($90)>>2)]; //@line 132 "src/markdown.c"
   var $92=(($91+($85<<2))|0); //@line 132 "src/markdown.c"
   var $93=HEAP32[(($92)>>2)]; //@line 132 "src/markdown.c"
   var $94=(($93)|(0))==0; //@line 132 "src/markdown.c"
   if ($94) { label = 27; break; } else { label = 26; break; } //@line 132 "src/markdown.c"
  case 26: 
   var $96=((($85)+(1))|0); //@line 134 "src/markdown.c"
   HEAP32[(($84)>>2)]=$96; //@line 134 "src/markdown.c"
   var $97=HEAP32[(($92)>>2)]; //@line 134 "src/markdown.c"
   var $98=$97; //@line 134 "src/markdown.c"
   var $99=(($97+4)|0); //@line 135 "src/markdown.c"
   var $100=$99; //@line 135 "src/markdown.c"
   HEAP32[(($100)>>2)]=0; //@line 135 "src/markdown.c"
   var $work_0_i_i = $98;label = 28; break; //@line 136 "src/markdown.c"
  case 27: 
   var $102=_bufnew(64); //@line 137 "src/markdown.c"
   var $103=$102; //@line 138 "src/markdown.c"
   var $104=_stack_push($83, $103); //@line 138 "src/markdown.c"
   var $work_0_i_i = $102;label = 28; break;
  case 28: 
   var $work_0_i_i;
   _parse_inline($work_0_i_i, $rndr, $45, $59); //@line 571 "src/markdown.c"
   var $105=HEAP32[(($79)>>2)]; //@line 572 "src/markdown.c"
   var $106=(($rndr+104)|0); //@line 572 "src/markdown.c"
   var $107=HEAP32[(($106)>>2)]; //@line 572 "src/markdown.c"
   var $108=FUNCTION_TABLE[$105]($ob, $work_0_i_i, $107); //@line 572 "src/markdown.c"
   var $109=HEAP32[(($84)>>2)]; //@line 147 "src/markdown.c"
   var $110=((($109)-(1))|0); //@line 147 "src/markdown.c"
   HEAP32[(($84)>>2)]=$110; //@line 147 "src/markdown.c"
   var $111=(($108)|(0))==0; //@line 574 "src/markdown.c"
   var $__i=$111 ? 0 : $_sum57; //@line 574 "src/markdown.c"
   var $127 = $__i;label = 33; break; //@line 574 "src/markdown.c"
  case 29: 
   var $112=(($69)>>>(0)) < (($52)>>>(0)); //@line 576 "src/markdown.c"
   if ($112) { label = 30; break; } else { label = 32; break; } //@line 576 "src/markdown.c"
  case 30: 
   var $_sum59=((($59)+(4))|0); //@line 576 "src/markdown.c"
   var $114=(($data+$_sum59)|0); //@line 576 "src/markdown.c"
   var $115=HEAP8[($114)]; //@line 576 "src/markdown.c"
   var $116=(($115 << 24) >> 24)==(($1 << 24) >> 24); //@line 576 "src/markdown.c"
   if ($116) { label = 31; break; } else { label = 32; break; } //@line 576 "src/markdown.c"
  case 31: 
   var $118=((($size)-(1))|0); //@line 578 "src/markdown.c"
   var $119=_parse_emph1($ob, $rndr, $14, $118, $1); //@line 578 "src/markdown.c"
   var $120=(($119)|(0))==0; //@line 579 "src/markdown.c"
   var $121=((($119)-(2))|0); //@line 580 "src/markdown.c"
   var $_52_i=$120 ? 0 : $121; //@line 579 "src/markdown.c"
   var $127 = $_52_i;label = 33; break;
  case 32: 
   var $123=((($size)-(2))|0); //@line 584 "src/markdown.c"
   var $124=_parse_emph2($ob, $rndr, $41, $123, $1); //@line 584 "src/markdown.c"
   var $125=(($124)|(0))==0; //@line 585 "src/markdown.c"
   var $126=((($124)-(1))|0); //@line 586 "src/markdown.c"
   var $_53_i=$125 ? 0 : $126; //@line 585 "src/markdown.c"
   var $127 = $_53_i;label = 33; break; //@line 585 "src/markdown.c"
  case 33: 
   var $127;
   var $128=(($127)|(0))==0; //@line 621 "src/markdown.c"
   var $129=((($127)+(3))|0); //@line 624 "src/markdown.c"
   var $_44=$128 ? 0 : $129; //@line 621 "src/markdown.c"
   var $_0 = $_44;label = 34; break; //@line 621 "src/markdown.c"
  case 34: 
   var $_0;
   return $_0; //@line 628 "src/markdown.c"
  default: assert(0, "bad label: " + label);
 }
}
function _char_codespan($ob, $rndr, $data, $offset, $size) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 16)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $work=sp;
   var $nb_0 = 0;label = 2; break; //@line 653 "src/markdown.c"
  case 2: 
   var $nb_0;
   var $2=(($nb_0)>>>(0)) < (($size)>>>(0)); //@line 653 "src/markdown.c"
   if ($2) { label = 3; break; } else { var $end_0_lcssa = $nb_0;var $i_0_lcssa = 0;var $_lcssa = 0;label = 7; break; } //@line 653 "src/markdown.c"
  case 3: 
   var $4=(($data+$nb_0)|0); //@line 653 "src/markdown.c"
   var $5=HEAP8[($4)]; //@line 653 "src/markdown.c"
   var $6=(($5 << 24) >> 24)==96; //@line 653 "src/markdown.c"
   var $7=((($nb_0)+(1))|0); //@line 654 "src/markdown.c"
   if ($6) { var $nb_0 = $7;label = 2; break; } else { label = 4; break; }
  case 4: 
   var $8=(($nb_0)|(0))!=0; //@line 658 "src/markdown.c"
   var $or_cond45=$2 & $8; //@line 658 "src/markdown.c"
   if ($or_cond45) { var $end_046 = $nb_0;var $i_047 = 1;label = 5; break; } else { var $end_0_lcssa54 = $nb_0;label = 8; break; } //@line 658 "src/markdown.c"
  case 5: 
   var $i_047;
   var $end_046;
   var $9=(($data+$end_046)|0); //@line 659 "src/markdown.c"
   var $10=HEAP8[($9)]; //@line 659 "src/markdown.c"
   var $11=(($10 << 24) >> 24)==96; //@line 659 "src/markdown.c"
   var $i_1=$11 ? $i_047 : 0; //@line 659 "src/markdown.c"
   var $12=((($end_046)+(1))|0); //@line 658 "src/markdown.c"
   var $13=(($12)>>>(0)) < (($size)>>>(0)); //@line 658 "src/markdown.c"
   var $14=(($i_1)>>>(0)) < (($nb_0)>>>(0)); //@line 658 "src/markdown.c"
   var $or_cond=$13 & $14; //@line 658 "src/markdown.c"
   if ($or_cond) { label = 6; break; } else { var $end_0_lcssa = $12;var $i_0_lcssa = $i_1;var $_lcssa = $13;label = 7; break; } //@line 658 "src/markdown.c"
  case 6: 
   var $phitmp=((($i_1)+(1))|0); //@line 658 "src/markdown.c"
   var $end_046 = $12;var $i_047 = $phitmp;label = 5; break; //@line 658 "src/markdown.c"
  case 7: 
   var $_lcssa;
   var $i_0_lcssa;
   var $end_0_lcssa;
   var $15=(($i_0_lcssa)>>>(0)) >= (($nb_0)>>>(0)); //@line 663 "src/markdown.c"
   var $or_cond43=$15 | $_lcssa; //@line 663 "src/markdown.c"
   if ($or_cond43) { var $end_0_lcssa54 = $end_0_lcssa;label = 8; break; } else { var $_0 = 0;label = 17; break; } //@line 663 "src/markdown.c"
  case 8: 
   var $end_0_lcssa54;
   var $f_begin_0 = $nb_0;label = 9; break; //@line 668 "src/markdown.c"
  case 9: 
   var $f_begin_0;
   var $17=(($f_begin_0)>>>(0)) < (($end_0_lcssa54)>>>(0)); //@line 668 "src/markdown.c"
   if ($17) { label = 10; break; } else { label = 11; break; } //@line 668 "src/markdown.c"
  case 10: 
   var $19=(($data+$f_begin_0)|0); //@line 668 "src/markdown.c"
   var $20=HEAP8[($19)]; //@line 668 "src/markdown.c"
   var $21=(($20 << 24) >> 24)==32; //@line 668 "src/markdown.c"
   var $22=((($f_begin_0)+(1))|0); //@line 669 "src/markdown.c"
   if ($21) { var $f_begin_0 = $22;label = 9; break; } else { label = 11; break; }
  case 11: 
   var $23=((($end_0_lcssa54)-($nb_0))|0); //@line 671 "src/markdown.c"
   var $f_end_0 = $23;label = 12; break; //@line 672 "src/markdown.c"
  case 12: 
   var $f_end_0;
   var $25=(($f_end_0)>>>(0)) > (($nb_0)>>>(0)); //@line 672 "src/markdown.c"
   if ($25) { label = 13; break; } else { label = 14; break; } //@line 672 "src/markdown.c"
  case 13: 
   var $27=((($f_end_0)-(1))|0); //@line 672 "src/markdown.c"
   var $28=(($data+$27)|0); //@line 672 "src/markdown.c"
   var $29=HEAP8[($28)]; //@line 672 "src/markdown.c"
   var $30=(($29 << 24) >> 24)==32; //@line 672 "src/markdown.c"
   if ($30) { var $f_end_0 = $27;label = 12; break; } else { label = 14; break; }
  case 14: 
   var $31=(($f_begin_0)>>>(0)) < (($f_end_0)>>>(0)); //@line 676 "src/markdown.c"
   if ($31) { label = 15; break; } else { label = 16; break; } //@line 676 "src/markdown.c"
  case 15: 
   var $33=(($work)|0); //@line 677 "src/markdown.c"
   var $34=(($data+$f_begin_0)|0); //@line 677 "src/markdown.c"
   HEAP32[(($33)>>2)]=$34; //@line 677 "src/markdown.c"
   var $35=(($work+4)|0); //@line 677 "src/markdown.c"
   var $36=((($f_end_0)-($f_begin_0))|0); //@line 677 "src/markdown.c"
   HEAP32[(($35)>>2)]=$36; //@line 677 "src/markdown.c"
   var $37=(($work+8)|0); //@line 677 "src/markdown.c"
   HEAP32[(($37)>>2)]=0; //@line 677 "src/markdown.c"
   var $38=(($work+12)|0); //@line 677 "src/markdown.c"
   HEAP32[(($38)>>2)]=0; //@line 677 "src/markdown.c"
   var $39=(($rndr+48)|0); //@line 678 "src/markdown.c"
   var $40=HEAP32[(($39)>>2)]; //@line 678 "src/markdown.c"
   var $41=(($rndr+104)|0); //@line 678 "src/markdown.c"
   var $42=HEAP32[(($41)>>2)]; //@line 678 "src/markdown.c"
   var $43=FUNCTION_TABLE[$40]($ob, $work, $42); //@line 678 "src/markdown.c"
   var $44=(($43)|(0))==0; //@line 678 "src/markdown.c"
   var $_end_0=$44 ? 0 : $end_0_lcssa54; //@line 678 "src/markdown.c"
   var $_0 = $_end_0;label = 17; break; //@line 678 "src/markdown.c"
  case 16: 
   var $46=(($rndr+48)|0); //@line 681 "src/markdown.c"
   var $47=HEAP32[(($46)>>2)]; //@line 681 "src/markdown.c"
   var $48=(($rndr+104)|0); //@line 681 "src/markdown.c"
   var $49=HEAP32[(($48)>>2)]; //@line 681 "src/markdown.c"
   var $50=FUNCTION_TABLE[$47]($ob, 0, $49); //@line 681 "src/markdown.c"
   var $51=(($50)|(0))==0; //@line 681 "src/markdown.c"
   var $_end_044=$51 ? 0 : $end_0_lcssa54; //@line 681 "src/markdown.c"
   STACKTOP = sp;
   return $_end_044; //@line 681 "src/markdown.c"
  case 17: 
   var $_0;
   STACKTOP = sp;
   return $_0; //@line 686 "src/markdown.c"
  default: assert(0, "bad label: " + label);
 }
}
function _char_linebreak($ob, $rndr, $data, $offset, $size) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($offset)>>>(0)) < 2; //@line 635 "src/markdown.c"
   if ($1) { var $_0 = 0;label = 9; break; } else { label = 2; break; } //@line 635 "src/markdown.c"
  case 2: 
   var $3=((($data)-(1))|0); //@line 635 "src/markdown.c"
   var $4=HEAP8[($3)]; //@line 635 "src/markdown.c"
   var $5=(($4 << 24) >> 24)==32; //@line 635 "src/markdown.c"
   if ($5) { label = 3; break; } else { var $_0 = 0;label = 9; break; } //@line 635 "src/markdown.c"
  case 3: 
   var $7=((($data)-(2))|0); //@line 635 "src/markdown.c"
   var $8=HEAP8[($7)]; //@line 635 "src/markdown.c"
   var $9=(($8 << 24) >> 24)==32; //@line 635 "src/markdown.c"
   if ($9) { label = 4; break; } else { var $_0 = 0;label = 9; break; } //@line 635 "src/markdown.c"
  case 4: 
   var $10=(($ob+4)|0); //@line 639 "src/markdown.c"
   var $11=HEAP32[(($10)>>2)]; //@line 639 "src/markdown.c"
   var $12=(($11)|(0))==0; //@line 639 "src/markdown.c"
   if ($12) { label = 8; break; } else { label = 5; break; } //@line 639 "src/markdown.c"
  case 5: 
   var $13=(($ob)|0); //@line 639 "src/markdown.c"
   var $_pre=HEAP32[(($13)>>2)]; //@line 639 "src/markdown.c"
   var $15 = $11;label = 6; break; //@line 639 "src/markdown.c"
  case 6: 
   var $15;
   var $16=((($15)-(1))|0); //@line 639 "src/markdown.c"
   var $17=(($_pre+$16)|0); //@line 639 "src/markdown.c"
   var $18=HEAP8[($17)]; //@line 639 "src/markdown.c"
   var $19=(($18 << 24) >> 24)==32; //@line 639 "src/markdown.c"
   if ($19) { label = 7; break; } else { label = 8; break; }
  case 7: 
   HEAP32[(($10)>>2)]=$16; //@line 640 "src/markdown.c"
   var $21=(($16)|(0))==0; //@line 639 "src/markdown.c"
   if ($21) { label = 8; break; } else { var $15 = $16;label = 6; break; } //@line 639 "src/markdown.c"
  case 8: 
   var $22=(($rndr+64)|0); //@line 642 "src/markdown.c"
   var $23=HEAP32[(($22)>>2)]; //@line 642 "src/markdown.c"
   var $24=(($rndr+104)|0); //@line 642 "src/markdown.c"
   var $25=HEAP32[(($24)>>2)]; //@line 642 "src/markdown.c"
   var $26=FUNCTION_TABLE[$23]($ob, $25); //@line 642 "src/markdown.c"
   var $27=(($26)|(0))!=0; //@line 642 "src/markdown.c"
   var $28=(($27)&(1)); //@line 642 "src/markdown.c"
   var $_0 = $28;label = 9; break; //@line 642 "src/markdown.c"
  case 9: 
   var $_0;
   return $_0; //@line 643 "src/markdown.c"
  default: assert(0, "bad label: " + label);
 }
}
function _char_link($ob, $rndr, $data, $offset, $size) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($offset)|(0))==0; //@line 844 "src/markdown.c"
   if ($1) { label = 2; break; } else { label = 3; break; } //@line 844 "src/markdown.c"
  case 2: 
   var $2=(($rndr+412)|0); //@line 850 "src/markdown.c"
   var $3=HEAP32[(($2)>>2)]; //@line 850 "src/markdown.c"
   var $15 = $2;var $14 = $3;label = 5; break; //@line 855 "src/markdown.c"
  case 3: 
   var $5=((($data)-(1))|0); //@line 844 "src/markdown.c"
   var $6=HEAP8[($5)]; //@line 844 "src/markdown.c"
   var $7=(($6 << 24) >> 24)==33; //@line 844 "src/markdown.c"
   var $8=(($rndr+412)|0); //@line 850 "src/markdown.c"
   var $9=HEAP32[(($8)>>2)]; //@line 850 "src/markdown.c"
   if ($7) { label = 4; break; } else { var $15 = $8;var $14 = $9;label = 5; break; } //@line 855 "src/markdown.c"
  case 4: 
   var $11=(($rndr+60)|0); //@line 855 "src/markdown.c"
   var $12=HEAP32[(($11)>>2)]; //@line 855 "src/markdown.c"
   var $13=(($12)|(0))==0; //@line 855 "src/markdown.c"
   if ($13) { var $i_8 = 1;var $ret_0 = 0;var $410 = $8;var $409 = $9;label = 128; break; } else { var $_ph290 = 1;var $_ph289 = $8;var $19 = $9;label = 6; break; } //@line 855 "src/markdown.c"
  case 5: 
   var $14;
   var $15;
   var $16=(($rndr+68)|0); //@line 855 "src/markdown.c"
   var $17=HEAP32[(($16)>>2)]; //@line 855 "src/markdown.c"
   var $18=(($17)|(0))==0; //@line 855 "src/markdown.c"
   if ($18) { var $i_8 = 1;var $ret_0 = 0;var $410 = $15;var $409 = $14;label = 128; break; } else { var $_ph290 = 0;var $_ph289 = $15;var $19 = $14;label = 6; break; } //@line 855 "src/markdown.c"
  case 6: 
   var $19;
   var $_ph289;
   var $_ph290;
   var $20=(($size)>>>(0)) > 1; //@line 859 "src/markdown.c"
   if ($20) { var $text_has_nl_0301 = 0;var $i_0302 = 1;var $level_0303 = 1;label = 7; break; } else { var $i_8 = 1;var $ret_0 = 0;var $410 = $_ph289;var $409 = $19;label = 128; break; } //@line 859 "src/markdown.c"
  case 7: 
   var $level_0303;
   var $i_0302;
   var $text_has_nl_0301;
   var $21=(($data+$i_0302)|0); //@line 860 "src/markdown.c"
   var $22=HEAP8[($21)]; //@line 860 "src/markdown.c"
   var $23=(($22 << 24) >> 24)==10; //@line 860 "src/markdown.c"
   if ($23) { var $level_1 = $level_0303;var $text_has_nl_1 = 1;label = 12; break; } else { label = 8; break; } //@line 860 "src/markdown.c"
  case 8: 
   var $25=((($i_0302)-(1))|0); //@line 863 "src/markdown.c"
   var $26=(($data+$25)|0); //@line 863 "src/markdown.c"
   var $27=HEAP8[($26)]; //@line 863 "src/markdown.c"
   var $28=(($27 << 24) >> 24)==92; //@line 863 "src/markdown.c"
   if ($28) { var $level_1 = $level_0303;var $text_has_nl_1 = $text_has_nl_0301;label = 12; break; } else { label = 9; break; } //@line 863 "src/markdown.c"
  case 9: 
   if ((($22 << 24) >> 24)==91) {
    label = 10; break;
   }
   else if ((($22 << 24) >> 24)==93) {
    label = 11; break;
   }
   else {
   var $level_1 = $level_0303;var $text_has_nl_1 = $text_has_nl_0301;label = 12; break;
   }
  case 10: 
   var $31=((($level_0303)+(1))|0); //@line 867 "src/markdown.c"
   var $level_1 = $31;var $text_has_nl_1 = $text_has_nl_0301;label = 12; break; //@line 867 "src/markdown.c"
  case 11: 
   var $33=((($level_0303)-(1))|0); //@line 870 "src/markdown.c"
   var $34=(($33)|(0)) < 1; //@line 871 "src/markdown.c"
   if ($34) { label = 13; break; } else { var $level_1 = $33;var $text_has_nl_1 = $text_has_nl_0301;label = 12; break; } //@line 871 "src/markdown.c"
  case 12: 
   var $text_has_nl_1;
   var $level_1;
   var $36=((($i_0302)+(1))|0); //@line 859 "src/markdown.c"
   var $37=(($36)>>>(0)) < (($size)>>>(0)); //@line 859 "src/markdown.c"
   if ($37) { var $text_has_nl_0301 = $text_has_nl_1;var $i_0302 = $36;var $level_0303 = $level_1;label = 7; break; } else { var $i_8 = $36;var $ret_0 = 0;var $410 = $_ph289;var $409 = $19;label = 128; break; } //@line 859 "src/markdown.c"
  case 13: 
   var $39=((($i_0302)+(1))|0); //@line 880 "src/markdown.c"
   var $40=(($39)>>>(0)) < (($size)>>>(0)); //@line 884 "src/markdown.c"
   if ($40) { var $i_1285 = $39;label = 14; break; } else { var $i_1281 = $39;label = 81; break; } //@line 884 "src/markdown.c"
  case 14: 
   var $i_1285;
   var $41=(($data+$i_1285)|0); //@line 884 "src/markdown.c"
   var $42=HEAP8[($41)]; //@line 884 "src/markdown.c"
   if ((($42 << 24) >> 24)==32 | (($42 << 24) >> 24)==10) {
    label = 15; break;
   }
   else if ((($42 << 24) >> 24)==40) {
    label = 16; break;
   }
   else if ((($42 << 24) >> 24)==91) {
    label = 57; break;
   }
   else {
   var $i_1281 = $i_1285;label = 81; break;
   }
  case 15: 
   var $43=((($i_1285)+(1))|0); //@line 885 "src/markdown.c"
   var $44=(($43)>>>(0)) < (($size)>>>(0)); //@line 884 "src/markdown.c"
   if ($44) { var $i_1285 = $43;label = 14; break; } else { var $i_1281 = $43;label = 81; break; } //@line 884 "src/markdown.c"
  case 16: 
   var $i_2266=((($i_1285)+(1))|0); //@line 890 "src/markdown.c"
   var $45=(($i_2266)>>>(0)) < (($size)>>>(0)); //@line 892 "src/markdown.c"
   if ($45) { var $i_2_in267 = $i_1285;var $i_2268 = $i_2266;label = 17; break; } else { var $i_2_in_lcssa = $i_1285;var $i_2_lcssa = $i_2266;label = 19; break; } //@line 892 "src/markdown.c"
  case 17: 
   var $i_2268;
   var $i_2_in267;
   var $46=(($data+$i_2268)|0); //@line 892 "src/markdown.c"
   var $47=HEAP8[($46)]; //@line 892 "src/markdown.c"
   if ((($47 << 24) >> 24)==32 | (($47 << 24) >> 24)==10) {
    label = 18; break;
   }
   else {
   var $i_2_in_lcssa = $i_2_in267;var $i_2_lcssa = $i_2268;label = 19; break;
   }
  case 18: 
   var $i_2=((($i_2268)+(1))|0); //@line 890 "src/markdown.c"
   var $48=(($i_2)>>>(0)) < (($size)>>>(0)); //@line 892 "src/markdown.c"
   if ($48) { var $i_2_in267 = $i_2268;var $i_2268 = $i_2;label = 17; break; } else { var $i_2_in_lcssa = $i_2268;var $i_2_lcssa = $i_2;label = 19; break; } //@line 892 "src/markdown.c"
  case 19: 
   var $i_2_lcssa;
   var $i_2_in_lcssa;
   var $49=(($i_2_lcssa)>>>(0)) < (($size)>>>(0)); //@line 898 "src/markdown.c"
   if ($49) { var $i_3262 = $i_2_lcssa;label = 20; break; } else { var $i_8 = $i_2_lcssa;var $ret_0 = 0;var $410 = $_ph289;var $409 = $19;label = 128; break; } //@line 898 "src/markdown.c"
  case 20: 
   var $i_3262;
   var $50=(($data+$i_3262)|0); //@line 899 "src/markdown.c"
   var $51=HEAP8[($50)]; //@line 899 "src/markdown.c"
   if ((($51 << 24) >> 24)==92) {
    label = 21; break;
   }
   else if ((($51 << 24) >> 24)==41) {
    var $i_5_ph = $i_3262;var $link_e_0_ph = $i_3262;var $title_b_0_ph = 0;var $title_e_1_ph = 0;label = 41; break;
   }
   else {
   label = 22; break;
   }
  case 21: 
   var $53=((($i_3262)+(2))|0); //@line 899 "src/markdown.c"
   var $i_3_be = $53;label = 26; break; //@line 899 "src/markdown.c"
  case 22: 
   var $55=(($i_3262)|(0))==0; //@line 901 "src/markdown.c"
   if ($55) { label = 25; break; } else { label = 23; break; } //@line 901 "src/markdown.c"
  case 23: 
   var $57=((($i_3262)-(1))|0); //@line 901 "src/markdown.c"
   var $58=(($data+$57)|0); //@line 901 "src/markdown.c"
   var $59=HEAP8[($58)]; //@line 901 "src/markdown.c"
   if ((($59 << 24) >> 24)==32 | (($59 << 24) >> 24)==10) {
    label = 24; break;
   }
   else {
   label = 25; break;
   }
  case 24: 
   if ((($51 << 24) >> 24)==39 | (($51 << 24) >> 24)==34) {
    label = 27; break;
   }
   else {
   label = 25; break;
   }
  case 25: 
   var $61=((($i_3262)+(1))|0); //@line 902 "src/markdown.c"
   var $i_3_be = $61;label = 26; break;
  case 26: 
   var $i_3_be;
   var $62=(($i_3_be)>>>(0)) < (($size)>>>(0)); //@line 898 "src/markdown.c"
   if ($62) { var $i_3262 = $i_3_be;label = 20; break; } else { var $i_8 = $i_3_be;var $ret_0 = 0;var $410 = $_ph289;var $409 = $19;label = 128; break; } //@line 898 "src/markdown.c"
  case 27: 
   var $64=((($i_3262)+(1))|0); //@line 912 "src/markdown.c"
   var $65=(($64)>>>(0)) < (($size)>>>(0)); //@line 915 "src/markdown.c"
   if ($65) { var $in_title_0_ph308 = 0;var $i_4_ph309 = $64;label = 28; break; } else { var $i_8 = $64;var $ret_0 = 0;var $410 = $_ph289;var $409 = $19;label = 128; break; } //@line 915 "src/markdown.c"
  case 28: 
   var $i_4_ph309;
   var $in_title_0_ph308;
   var $i_4252 = $i_4_ph309;label = 29; break; //@line 915 "src/markdown.c"
  case 29: 
   var $i_4252;
   var $67=(($data+$i_4252)|0); //@line 916 "src/markdown.c"
   var $68=HEAP8[($67)]; //@line 916 "src/markdown.c"
   var $69=(($68 << 24) >> 24)==92; //@line 916 "src/markdown.c"
   if ($69) { label = 30; break; } else { label = 31; break; } //@line 916 "src/markdown.c"
  case 30: 
   var $71=((($i_4252)+(2))|0); //@line 916 "src/markdown.c"
   var $i_4_be = $71;label = 35; break; //@line 916 "src/markdown.c"
  case 31: 
   var $73=(($68 << 24) >> 24)==(($51 << 24) >> 24); //@line 917 "src/markdown.c"
   if ($73) { label = 32; break; } else { label = 33; break; } //@line 917 "src/markdown.c"
  case 32: 
   var $74=((($i_4252)+(1))|0); //@line 917 "src/markdown.c"
   var $75=(($74)>>>(0)) < (($size)>>>(0)); //@line 915 "src/markdown.c"
   if ($75) { var $in_title_0_ph308 = 1;var $i_4_ph309 = $74;label = 28; break; } else { var $i_8 = $74;var $ret_0 = 0;var $410 = $_ph289;var $409 = $19;label = 128; break; } //@line 915 "src/markdown.c"
  case 33: 
   var $77=(($68 << 24) >> 24)==41; //@line 918 "src/markdown.c"
   var $or_cond=$77 & $in_title_0_ph308; //@line 918 "src/markdown.c"
   if ($or_cond) { label = 36; break; } else { label = 34; break; } //@line 918 "src/markdown.c"
  case 34: 
   var $79=((($i_4252)+(1))|0); //@line 919 "src/markdown.c"
   var $i_4_be = $79;label = 35; break;
  case 35: 
   var $i_4_be;
   var $80=(($i_4_be)>>>(0)) < (($size)>>>(0)); //@line 915 "src/markdown.c"
   if ($80) { var $i_4252 = $i_4_be;label = 29; break; } else { var $i_8 = $i_4_be;var $ret_0 = 0;var $410 = $_ph289;var $409 = $19;label = 128; break; } //@line 915 "src/markdown.c"
  case 36: 
   var $title_e_0242=((($i_4252)-(1))|0); //@line 925 "src/markdown.c"
   var $81=(($title_e_0242)>>>(0)) > (($64)>>>(0)); //@line 926 "src/markdown.c"
   if ($81) { var $title_e_0243 = $title_e_0242;label = 37; break; } else { var $title_e_0_lcssa = $title_e_0242;label = 39; break; } //@line 926 "src/markdown.c"
  case 37: 
   var $title_e_0243;
   var $82=(($data+$title_e_0243)|0); //@line 926 "src/markdown.c"
   var $83=HEAP8[($82)]; //@line 926 "src/markdown.c"
   if ((($83 << 24) >> 24)==32 | (($83 << 24) >> 24)==10) {
    label = 38; break;
   }
   else {
   var $title_e_0_lcssa = $title_e_0243;label = 39; break;
   }
  case 38: 
   var $title_e_0=((($title_e_0243)-(1))|0); //@line 925 "src/markdown.c"
   var $84=(($title_e_0)>>>(0)) > (($64)>>>(0)); //@line 926 "src/markdown.c"
   if ($84) { var $title_e_0243 = $title_e_0;label = 37; break; } else { var $title_e_0_lcssa = $title_e_0;label = 39; break; } //@line 926 "src/markdown.c"
  case 39: 
   var $title_e_0_lcssa;
   var $85=(($data+$title_e_0_lcssa)|0); //@line 930 "src/markdown.c"
   var $86=HEAP8[($85)]; //@line 930 "src/markdown.c"
   if ((($86 << 24) >> 24)==39 | (($86 << 24) >> 24)==34) {
    var $i_5_ph = $i_4252;var $link_e_0_ph = $i_3262;var $title_b_0_ph = $64;var $title_e_1_ph = $title_e_0_lcssa;label = 41; break;
   }
   else {
   label = 40; break;
   }
  case 40: 
   var $i_5_ph = $i_4252;var $link_e_0_ph = $i_4252;var $title_b_0_ph = 0;var $title_e_1_ph = 0;label = 41; break; //@line 933 "src/markdown.c"
  case 41: 
   var $title_e_1_ph;
   var $title_b_0_ph;
   var $link_e_0_ph;
   var $i_5_ph;
   var $88=(($link_e_0_ph)>>>(0)) > (($i_2_lcssa)>>>(0)); //@line 937 "src/markdown.c"
   if ($88) { var $link_e_0240 = $link_e_0_ph;label = 42; break; } else { var $link_e_0_lcssa = $link_e_0_ph;label = 44; break; } //@line 937 "src/markdown.c"
  case 42: 
   var $link_e_0240;
   var $89=((($link_e_0240)-(1))|0); //@line 937 "src/markdown.c"
   var $90=(($data+$89)|0); //@line 937 "src/markdown.c"
   var $91=HEAP8[($90)]; //@line 937 "src/markdown.c"
   if ((($91 << 24) >> 24)==32 | (($91 << 24) >> 24)==10) {
    label = 43; break;
   }
   else {
   var $link_e_0_lcssa = $link_e_0240;label = 44; break;
   }
  case 43: 
   var $92=(($89)>>>(0)) > (($i_2_lcssa)>>>(0)); //@line 937 "src/markdown.c"
   if ($92) { var $link_e_0240 = $89;label = 42; break; } else { var $link_e_0_lcssa = $89;label = 44; break; } //@line 937 "src/markdown.c"
  case 44: 
   var $link_e_0_lcssa;
   var $93=(($data+$i_2_lcssa)|0); //@line 941 "src/markdown.c"
   var $94=HEAP8[($93)]; //@line 941 "src/markdown.c"
   var $95=(($94 << 24) >> 24)==60; //@line 941 "src/markdown.c"
   var $96=((($i_2_in_lcssa)+(2))|0); //@line 941 "src/markdown.c"
   var $_i_2=$95 ? $96 : $i_2_lcssa; //@line 941 "src/markdown.c"
   var $97=((($link_e_0_lcssa)-(1))|0); //@line 942 "src/markdown.c"
   var $98=(($data+$97)|0); //@line 942 "src/markdown.c"
   var $99=HEAP8[($98)]; //@line 942 "src/markdown.c"
   var $100=(($99 << 24) >> 24)==62; //@line 942 "src/markdown.c"
   var $link_e_1=$100 ? $97 : $link_e_0_lcssa; //@line 942 "src/markdown.c"
   var $101=(($link_e_1)>>>(0)) > (($_i_2)>>>(0)); //@line 945 "src/markdown.c"
   if ($101) { label = 45; break; } else { var $link_0 = 0;label = 50; break; } //@line 945 "src/markdown.c"
  case 45: 
   var $103=(($rndr+408)|0); //@line 130 "src/markdown.c"
   var $104=(($rndr+416)|0); //@line 132 "src/markdown.c"
   var $105=HEAP32[(($104)>>2)]; //@line 132 "src/markdown.c"
   var $106=(($19)>>>(0)) < (($105)>>>(0)); //@line 132 "src/markdown.c"
   if ($106) { label = 46; break; } else { label = 48; break; } //@line 132 "src/markdown.c"
  case 46: 
   var $108=(($103)|0); //@line 132 "src/markdown.c"
   var $109=HEAP32[(($108)>>2)]; //@line 132 "src/markdown.c"
   var $110=(($109+($19<<2))|0); //@line 132 "src/markdown.c"
   var $111=HEAP32[(($110)>>2)]; //@line 132 "src/markdown.c"
   var $112=(($111)|(0))==0; //@line 132 "src/markdown.c"
   if ($112) { label = 48; break; } else { label = 47; break; } //@line 132 "src/markdown.c"
  case 47: 
   var $114=((($19)+(1))|0); //@line 134 "src/markdown.c"
   HEAP32[(($_ph289)>>2)]=$114; //@line 134 "src/markdown.c"
   var $115=HEAP32[(($110)>>2)]; //@line 134 "src/markdown.c"
   var $116=$115; //@line 134 "src/markdown.c"
   var $117=(($115+4)|0); //@line 135 "src/markdown.c"
   var $118=$117; //@line 135 "src/markdown.c"
   HEAP32[(($118)>>2)]=0; //@line 135 "src/markdown.c"
   var $work_0_i209 = $116;label = 49; break; //@line 136 "src/markdown.c"
  case 48: 
   var $120=_bufnew(64); //@line 137 "src/markdown.c"
   var $121=$120; //@line 138 "src/markdown.c"
   var $122=_stack_push($103, $121); //@line 138 "src/markdown.c"
   var $work_0_i209 = $120;label = 49; break;
  case 49: 
   var $work_0_i209;
   var $123=(($data+$_i_2)|0); //@line 947 "src/markdown.c"
   var $124=((($link_e_1)-($_i_2))|0); //@line 947 "src/markdown.c"
   _bufput($work_0_i209, $123, $124); //@line 947 "src/markdown.c"
   var $link_0 = $work_0_i209;label = 50; break; //@line 948 "src/markdown.c"
  case 50: 
   var $link_0;
   var $126=(($title_e_1_ph)>>>(0)) > (($title_b_0_ph)>>>(0)); //@line 950 "src/markdown.c"
   if ($126) { label = 51; break; } else { var $title_0 = 0;label = 56; break; } //@line 950 "src/markdown.c"
  case 51: 
   var $128=(($rndr+408)|0); //@line 130 "src/markdown.c"
   var $129=HEAP32[(($_ph289)>>2)]; //@line 132 "src/markdown.c"
   var $130=(($rndr+416)|0); //@line 132 "src/markdown.c"
   var $131=HEAP32[(($130)>>2)]; //@line 132 "src/markdown.c"
   var $132=(($129)>>>(0)) < (($131)>>>(0)); //@line 132 "src/markdown.c"
   if ($132) { label = 52; break; } else { label = 54; break; } //@line 132 "src/markdown.c"
  case 52: 
   var $134=(($128)|0); //@line 132 "src/markdown.c"
   var $135=HEAP32[(($134)>>2)]; //@line 132 "src/markdown.c"
   var $136=(($135+($129<<2))|0); //@line 132 "src/markdown.c"
   var $137=HEAP32[(($136)>>2)]; //@line 132 "src/markdown.c"
   var $138=(($137)|(0))==0; //@line 132 "src/markdown.c"
   if ($138) { label = 54; break; } else { label = 53; break; } //@line 132 "src/markdown.c"
  case 53: 
   var $140=((($129)+(1))|0); //@line 134 "src/markdown.c"
   HEAP32[(($_ph289)>>2)]=$140; //@line 134 "src/markdown.c"
   var $141=HEAP32[(($136)>>2)]; //@line 134 "src/markdown.c"
   var $142=$141; //@line 134 "src/markdown.c"
   var $143=(($141+4)|0); //@line 135 "src/markdown.c"
   var $144=$143; //@line 135 "src/markdown.c"
   HEAP32[(($144)>>2)]=0; //@line 135 "src/markdown.c"
   var $work_0_i211 = $142;label = 55; break; //@line 136 "src/markdown.c"
  case 54: 
   var $146=_bufnew(64); //@line 137 "src/markdown.c"
   var $147=$146; //@line 138 "src/markdown.c"
   var $148=_stack_push($128, $147); //@line 138 "src/markdown.c"
   var $work_0_i211 = $146;label = 55; break;
  case 55: 
   var $work_0_i211;
   var $149=(($data+$title_b_0_ph)|0); //@line 952 "src/markdown.c"
   var $150=((($title_e_1_ph)-($title_b_0_ph))|0); //@line 952 "src/markdown.c"
   _bufput($work_0_i211, $149, $150); //@line 952 "src/markdown.c"
   var $title_0 = $work_0_i211;label = 56; break; //@line 953 "src/markdown.c"
  case 56: 
   var $title_0;
   var $152=((($i_5_ph)+(1))|0); //@line 955 "src/markdown.c"
   var $i_7 = $152;var $title_1 = $title_0;var $link_1 = $link_0;label = 100; break; //@line 956 "src/markdown.c"
  case 57: 
   var $154=((($i_1285)+(1))|0); //@line 964 "src/markdown.c"
   var $i_6 = $154;label = 58; break; //@line 966 "src/markdown.c"
  case 58: 
   var $i_6;
   var $156=(($i_6)>>>(0)) < (($size)>>>(0)); //@line 966 "src/markdown.c"
   if ($156) { label = 59; break; } else { var $i_8 = $i_6;var $ret_0 = 0;var $410 = $_ph289;var $409 = $19;label = 128; break; } //@line 966 "src/markdown.c"
  case 59: 
   var $158=(($data+$i_6)|0); //@line 966 "src/markdown.c"
   var $159=HEAP8[($158)]; //@line 966 "src/markdown.c"
   var $160=(($159 << 24) >> 24)==93; //@line 966 "src/markdown.c"
   var $161=((($i_6)+(1))|0); //@line 966 "src/markdown.c"
   if ($160) { label = 60; break; } else { var $i_6 = $161;label = 58; break; }
  case 60: 
   var $163=(($154)|(0))==(($i_6)|(0)); //@line 971 "src/markdown.c"
   if ($163) { label = 61; break; } else { label = 74; break; } //@line 971 "src/markdown.c"
  case 61: 
   var $165=(($text_has_nl_0301)|(0))==0; //@line 972 "src/markdown.c"
   if ($165) { label = 73; break; } else { label = 62; break; } //@line 972 "src/markdown.c"
  case 62: 
   var $167=(($rndr+408)|0); //@line 130 "src/markdown.c"
   var $168=(($rndr+416)|0); //@line 132 "src/markdown.c"
   var $169=HEAP32[(($168)>>2)]; //@line 132 "src/markdown.c"
   var $170=(($19)>>>(0)) < (($169)>>>(0)); //@line 132 "src/markdown.c"
   if ($170) { label = 63; break; } else { label = 65; break; } //@line 132 "src/markdown.c"
  case 63: 
   var $172=(($167)|0); //@line 132 "src/markdown.c"
   var $173=HEAP32[(($172)>>2)]; //@line 132 "src/markdown.c"
   var $174=(($173+($19<<2))|0); //@line 132 "src/markdown.c"
   var $175=HEAP32[(($174)>>2)]; //@line 132 "src/markdown.c"
   var $176=(($175)|(0))==0; //@line 132 "src/markdown.c"
   if ($176) { label = 65; break; } else { label = 64; break; } //@line 132 "src/markdown.c"
  case 64: 
   var $178=((($19)+(1))|0); //@line 134 "src/markdown.c"
   HEAP32[(($_ph289)>>2)]=$178; //@line 134 "src/markdown.c"
   var $179=HEAP32[(($174)>>2)]; //@line 134 "src/markdown.c"
   var $180=$179; //@line 134 "src/markdown.c"
   var $181=(($179+4)|0); //@line 135 "src/markdown.c"
   var $182=$181; //@line 135 "src/markdown.c"
   HEAP32[(($182)>>2)]=0; //@line 135 "src/markdown.c"
   var $work_0_i213 = $180;label = 66; break; //@line 136 "src/markdown.c"
  case 65: 
   var $184=_bufnew(64); //@line 137 "src/markdown.c"
   var $185=$184; //@line 138 "src/markdown.c"
   var $186=_stack_push($167, $185); //@line 138 "src/markdown.c"
   var $work_0_i213 = $184;label = 66; break;
  case 66: 
   var $work_0_i213;
   var $187=(($i_0302)>>>(0)) > 1; //@line 976 "src/markdown.c"
   if ($187) { var $j_0275 = 1;label = 67; break; } else { label = 72; break; } //@line 976 "src/markdown.c"
  case 67: 
   var $j_0275;
   var $188=(($data+$j_0275)|0); //@line 977 "src/markdown.c"
   var $189=HEAP8[($188)]; //@line 977 "src/markdown.c"
   var $190=(($189 << 24) >> 24)==10; //@line 977 "src/markdown.c"
   if ($190) { label = 69; break; } else { label = 68; break; } //@line 977 "src/markdown.c"
  case 68: 
   var $192=(($189)&(255)); //@line 977 "src/markdown.c"
   _bufputc($work_0_i213, $192); //@line 978 "src/markdown.c"
   label = 71; break; //@line 978 "src/markdown.c"
  case 69: 
   var $194=((($j_0275)-(1))|0); //@line 979 "src/markdown.c"
   var $195=(($data+$194)|0); //@line 979 "src/markdown.c"
   var $196=HEAP8[($195)]; //@line 979 "src/markdown.c"
   var $197=(($196 << 24) >> 24)==32; //@line 979 "src/markdown.c"
   if ($197) { label = 71; break; } else { label = 70; break; } //@line 979 "src/markdown.c"
  case 70: 
   _bufputc($work_0_i213, 32); //@line 980 "src/markdown.c"
   label = 71; break; //@line 980 "src/markdown.c"
  case 71: 
   var $200=((($j_0275)+(1))|0); //@line 976 "src/markdown.c"
   var $201=(($200)>>>(0)) < (($i_0302)>>>(0)); //@line 976 "src/markdown.c"
   if ($201) { var $j_0275 = $200;label = 67; break; } else { label = 72; break; } //@line 976 "src/markdown.c"
  case 72: 
   var $202=(($work_0_i213)|0); //@line 983 "src/markdown.c"
   var $203=HEAP32[(($202)>>2)]; //@line 983 "src/markdown.c"
   var $204=(($work_0_i213+4)|0); //@line 984 "src/markdown.c"
   var $205=HEAP32[(($204)>>2)]; //@line 984 "src/markdown.c"
   var $id_sroa_0_0 = $203;var $id_sroa_1_0 = $205;label = 75; break; //@line 985 "src/markdown.c"
  case 73: 
   var $207=(($data+1)|0); //@line 986 "src/markdown.c"
   var $id_sroa_0_0 = $207;var $id_sroa_1_0 = $25;label = 75; break;
  case 74: 
   var $209=(($data+$154)|0); //@line 990 "src/markdown.c"
   var $210=((($i_6)-($154))|0); //@line 991 "src/markdown.c"
   var $id_sroa_0_0 = $209;var $id_sroa_1_0 = $210;label = 75; break;
  case 75: 
   var $id_sroa_1_0;
   var $id_sroa_0_0;
   var $212=(($id_sroa_1_0)|(0))==0; //@line 176 "src/markdown.c"
   if ($212) { var $hash_0_lcssa_i_i = 0;label = 77; break; } else { var $i_08_i_i = 0;var $hash_09_i_i = 0;label = 76; break; } //@line 176 "src/markdown.c"
  case 76: 
   var $hash_09_i_i;
   var $i_08_i_i;
   var $213=(($id_sroa_0_0+$i_08_i_i)|0); //@line 177 "src/markdown.c"
   var $214=HEAP8[($213)]; //@line 177 "src/markdown.c"
   var $215=(($214)&(255)); //@line 177 "src/markdown.c"
   var $216=_tolower($215); //@line 177 "src/markdown.c"
   var $tmp7_i_i=((($hash_09_i_i)*(65600))&-1);
   var $217=((($216)-($hash_09_i_i))|0); //@line 177 "src/markdown.c"
   var $218=((($217)+($tmp7_i_i))|0); //@line 177 "src/markdown.c"
   var $219=((($i_08_i_i)+(1))|0); //@line 176 "src/markdown.c"
   var $220=(($219)>>>(0)) < (($id_sroa_1_0)>>>(0)); //@line 176 "src/markdown.c"
   if ($220) { var $i_08_i_i = $219;var $hash_09_i_i = $218;label = 76; break; } else { var $hash_0_lcssa_i_i = $218;label = 77; break; } //@line 176 "src/markdown.c"
  case 77: 
   var $hash_0_lcssa_i_i;
   var $221=$hash_0_lcssa_i_i & 7; //@line 205 "src/markdown.c"
   var $222=(($rndr+108+($221<<2))|0); //@line 205 "src/markdown.c"
   var $ref_0_in_i = $222;label = 78; break; //@line 207 "src/markdown.c"
  case 78: 
   var $ref_0_in_i;
   var $ref_0_i=HEAP32[(($ref_0_in_i)>>2)]; //@line 205 "src/markdown.c"
   var $224=(($ref_0_i)|(0))==0; //@line 207 "src/markdown.c"
   if ($224) { var $i_8 = $i_6;var $ret_0 = 0;var $410 = $_ph289;var $409 = $19;label = 128; break; } else { label = 79; break; } //@line 207 "src/markdown.c"
  case 79: 
   var $226=(($ref_0_i)|0); //@line 208 "src/markdown.c"
   var $227=HEAP32[(($226)>>2)]; //@line 208 "src/markdown.c"
   var $228=(($227)|(0))==(($hash_0_lcssa_i_i)|(0)); //@line 208 "src/markdown.c"
   var $229=(($ref_0_i+12)|0); //@line 211 "src/markdown.c"
   if ($228) { label = 80; break; } else { var $ref_0_in_i = $229;label = 78; break; } //@line 208 "src/markdown.c"
  case 80: 
   var $231=(($ref_0_i+4)|0); //@line 999 "src/markdown.c"
   var $232=HEAP32[(($231)>>2)]; //@line 999 "src/markdown.c"
   var $233=(($ref_0_i+8)|0); //@line 1000 "src/markdown.c"
   var $234=HEAP32[(($233)>>2)]; //@line 1000 "src/markdown.c"
   var $i_7 = $161;var $title_1 = $234;var $link_1 = $232;label = 100; break; //@line 1002 "src/markdown.c"
  case 81: 
   var $i_1281;
   var $235=(($text_has_nl_0301)|(0))==0; //@line 1010 "src/markdown.c"
   if ($235) { label = 93; break; } else { label = 82; break; } //@line 1010 "src/markdown.c"
  case 82: 
   var $237=(($rndr+408)|0); //@line 130 "src/markdown.c"
   var $238=(($rndr+416)|0); //@line 132 "src/markdown.c"
   var $239=HEAP32[(($238)>>2)]; //@line 132 "src/markdown.c"
   var $240=(($19)>>>(0)) < (($239)>>>(0)); //@line 132 "src/markdown.c"
   if ($240) { label = 83; break; } else { label = 85; break; } //@line 132 "src/markdown.c"
  case 83: 
   var $242=(($237)|0); //@line 132 "src/markdown.c"
   var $243=HEAP32[(($242)>>2)]; //@line 132 "src/markdown.c"
   var $244=(($243+($19<<2))|0); //@line 132 "src/markdown.c"
   var $245=HEAP32[(($244)>>2)]; //@line 132 "src/markdown.c"
   var $246=(($245)|(0))==0; //@line 132 "src/markdown.c"
   if ($246) { label = 85; break; } else { label = 84; break; } //@line 132 "src/markdown.c"
  case 84: 
   var $248=((($19)+(1))|0); //@line 134 "src/markdown.c"
   HEAP32[(($_ph289)>>2)]=$248; //@line 134 "src/markdown.c"
   var $249=HEAP32[(($244)>>2)]; //@line 134 "src/markdown.c"
   var $250=$249; //@line 134 "src/markdown.c"
   var $251=(($249+4)|0); //@line 135 "src/markdown.c"
   var $252=$251; //@line 135 "src/markdown.c"
   HEAP32[(($252)>>2)]=0; //@line 135 "src/markdown.c"
   var $work_0_i215 = $250;label = 86; break; //@line 136 "src/markdown.c"
  case 85: 
   var $254=_bufnew(64); //@line 137 "src/markdown.c"
   var $255=$254; //@line 138 "src/markdown.c"
   var $256=_stack_push($237, $255); //@line 138 "src/markdown.c"
   var $work_0_i215 = $254;label = 86; break;
  case 86: 
   var $work_0_i215;
   var $257=(($i_0302)>>>(0)) > 1; //@line 1014 "src/markdown.c"
   if ($257) { var $j4_0239 = 1;label = 87; break; } else { label = 92; break; } //@line 1014 "src/markdown.c"
  case 87: 
   var $j4_0239;
   var $258=(($data+$j4_0239)|0); //@line 1015 "src/markdown.c"
   var $259=HEAP8[($258)]; //@line 1015 "src/markdown.c"
   var $260=(($259 << 24) >> 24)==10; //@line 1015 "src/markdown.c"
   if ($260) { label = 89; break; } else { label = 88; break; } //@line 1015 "src/markdown.c"
  case 88: 
   var $262=(($259)&(255)); //@line 1015 "src/markdown.c"
   _bufputc($work_0_i215, $262); //@line 1016 "src/markdown.c"
   label = 91; break; //@line 1016 "src/markdown.c"
  case 89: 
   var $264=((($j4_0239)-(1))|0); //@line 1017 "src/markdown.c"
   var $265=(($data+$264)|0); //@line 1017 "src/markdown.c"
   var $266=HEAP8[($265)]; //@line 1017 "src/markdown.c"
   var $267=(($266 << 24) >> 24)==32; //@line 1017 "src/markdown.c"
   if ($267) { label = 91; break; } else { label = 90; break; } //@line 1017 "src/markdown.c"
  case 90: 
   _bufputc($work_0_i215, 32); //@line 1018 "src/markdown.c"
   label = 91; break; //@line 1018 "src/markdown.c"
  case 91: 
   var $270=((($j4_0239)+(1))|0); //@line 1014 "src/markdown.c"
   var $271=(($270)>>>(0)) < (($i_0302)>>>(0)); //@line 1014 "src/markdown.c"
   if ($271) { var $j4_0239 = $270;label = 87; break; } else { label = 92; break; } //@line 1014 "src/markdown.c"
  case 92: 
   var $272=(($work_0_i215)|0); //@line 1021 "src/markdown.c"
   var $273=HEAP32[(($272)>>2)]; //@line 1021 "src/markdown.c"
   var $274=(($work_0_i215+4)|0); //@line 1022 "src/markdown.c"
   var $275=HEAP32[(($274)>>2)]; //@line 1022 "src/markdown.c"
   var $id1_sroa_0_0 = $273;var $id1_sroa_1_0 = $275;label = 94; break; //@line 1023 "src/markdown.c"
  case 93: 
   var $277=(($data+1)|0); //@line 1024 "src/markdown.c"
   var $id1_sroa_0_0 = $277;var $id1_sroa_1_0 = $25;label = 94; break;
  case 94: 
   var $id1_sroa_1_0;
   var $id1_sroa_0_0;
   var $279=(($id1_sroa_1_0)|(0))==0; //@line 176 "src/markdown.c"
   if ($279) { var $hash_0_lcssa_i_i221 = 0;label = 96; break; } else { var $i_08_i_i218 = 0;var $hash_09_i_i217 = 0;label = 95; break; } //@line 176 "src/markdown.c"
  case 95: 
   var $hash_09_i_i217;
   var $i_08_i_i218;
   var $280=(($id1_sroa_0_0+$i_08_i_i218)|0); //@line 177 "src/markdown.c"
   var $281=HEAP8[($280)]; //@line 177 "src/markdown.c"
   var $282=(($281)&(255)); //@line 177 "src/markdown.c"
   var $283=_tolower($282); //@line 177 "src/markdown.c"
   var $tmp7_i_i219=((($hash_09_i_i217)*(65600))&-1);
   var $284=((($283)-($hash_09_i_i217))|0); //@line 177 "src/markdown.c"
   var $285=((($284)+($tmp7_i_i219))|0); //@line 177 "src/markdown.c"
   var $286=((($i_08_i_i218)+(1))|0); //@line 176 "src/markdown.c"
   var $287=(($286)>>>(0)) < (($id1_sroa_1_0)>>>(0)); //@line 176 "src/markdown.c"
   if ($287) { var $i_08_i_i218 = $286;var $hash_09_i_i217 = $285;label = 95; break; } else { var $hash_0_lcssa_i_i221 = $285;label = 96; break; } //@line 176 "src/markdown.c"
  case 96: 
   var $hash_0_lcssa_i_i221;
   var $288=$hash_0_lcssa_i_i221 & 7; //@line 205 "src/markdown.c"
   var $289=(($rndr+108+($288<<2))|0); //@line 205 "src/markdown.c"
   var $ref_0_in_i223 = $289;label = 97; break; //@line 207 "src/markdown.c"
  case 97: 
   var $ref_0_in_i223;
   var $ref_0_i224=HEAP32[(($ref_0_in_i223)>>2)]; //@line 205 "src/markdown.c"
   var $291=(($ref_0_i224)|(0))==0; //@line 207 "src/markdown.c"
   if ($291) { var $i_8 = $i_1281;var $ret_0 = 0;var $410 = $_ph289;var $409 = $19;label = 128; break; } else { label = 98; break; } //@line 207 "src/markdown.c"
  case 98: 
   var $293=(($ref_0_i224)|0); //@line 208 "src/markdown.c"
   var $294=HEAP32[(($293)>>2)]; //@line 208 "src/markdown.c"
   var $295=(($294)|(0))==(($hash_0_lcssa_i_i221)|(0)); //@line 208 "src/markdown.c"
   var $296=(($ref_0_i224+12)|0); //@line 211 "src/markdown.c"
   if ($295) { label = 99; break; } else { var $ref_0_in_i223 = $296;label = 97; break; } //@line 208 "src/markdown.c"
  case 99: 
   var $298=(($ref_0_i224+4)|0); //@line 1034 "src/markdown.c"
   var $299=HEAP32[(($298)>>2)]; //@line 1034 "src/markdown.c"
   var $300=(($ref_0_i224+8)|0); //@line 1035 "src/markdown.c"
   var $301=HEAP32[(($300)>>2)]; //@line 1035 "src/markdown.c"
   var $i_7 = $39;var $title_1 = $301;var $link_1 = $299;label = 100; break;
  case 100: 
   var $link_1;
   var $title_1;
   var $i_7;
   var $303=(($i_0302)>>>(0)) > 1; //@line 1042 "src/markdown.c"
   if ($303) { label = 101; break; } else { var $content_0 = 0;var $332 = $_ph290;label = 108; break; } //@line 1042 "src/markdown.c"
  case 101: 
   var $305=(($rndr+408)|0); //@line 130 "src/markdown.c"
   var $306=HEAP32[(($_ph289)>>2)]; //@line 132 "src/markdown.c"
   var $307=(($rndr+416)|0); //@line 132 "src/markdown.c"
   var $308=HEAP32[(($307)>>2)]; //@line 132 "src/markdown.c"
   var $309=(($306)>>>(0)) < (($308)>>>(0)); //@line 132 "src/markdown.c"
   if ($309) { label = 102; break; } else { label = 104; break; } //@line 132 "src/markdown.c"
  case 102: 
   var $311=(($305)|0); //@line 132 "src/markdown.c"
   var $312=HEAP32[(($311)>>2)]; //@line 132 "src/markdown.c"
   var $313=(($312+($306<<2))|0); //@line 132 "src/markdown.c"
   var $314=HEAP32[(($313)>>2)]; //@line 132 "src/markdown.c"
   var $315=(($314)|(0))==0; //@line 132 "src/markdown.c"
   if ($315) { label = 104; break; } else { label = 103; break; } //@line 132 "src/markdown.c"
  case 103: 
   var $317=((($306)+(1))|0); //@line 134 "src/markdown.c"
   HEAP32[(($_ph289)>>2)]=$317; //@line 134 "src/markdown.c"
   var $318=HEAP32[(($313)>>2)]; //@line 134 "src/markdown.c"
   var $319=$318; //@line 134 "src/markdown.c"
   var $320=(($318+4)|0); //@line 135 "src/markdown.c"
   var $321=$320; //@line 135 "src/markdown.c"
   HEAP32[(($321)>>2)]=0; //@line 135 "src/markdown.c"
   var $work_0_i227 = $319;label = 105; break; //@line 136 "src/markdown.c"
  case 104: 
   var $323=_bufnew(64); //@line 137 "src/markdown.c"
   var $324=$323; //@line 138 "src/markdown.c"
   var $325=_stack_push($305, $324); //@line 138 "src/markdown.c"
   var $work_0_i227 = $323;label = 105; break;
  case 105: 
   var $work_0_i227;
   if ($_ph290) { label = 106; break; } else { label = 107; break; } //@line 1044 "src/markdown.c"
  case 106: 
   var $327=(($data+1)|0); //@line 1045 "src/markdown.c"
   _bufput($work_0_i227, $327, $25); //@line 1045 "src/markdown.c"
   var $content_0 = $work_0_i227;var $332 = 1;label = 108; break; //@line 1046 "src/markdown.c"
  case 107: 
   var $329=(($rndr+428)|0); //@line 1049 "src/markdown.c"
   HEAP32[(($329)>>2)]=1; //@line 1049 "src/markdown.c"
   var $330=(($data+1)|0); //@line 1050 "src/markdown.c"
   _parse_inline($work_0_i227, $rndr, $330, $25); //@line 1050 "src/markdown.c"
   HEAP32[(($329)>>2)]=0; //@line 1051 "src/markdown.c"
   var $content_0 = $work_0_i227;var $332 = 0;label = 108; break;
  case 108: 
   var $332;
   var $content_0;
   var $333=(($link_1)|(0))==0; //@line 1055 "src/markdown.c"
   if ($333) { var $u_link_0 = 0;label = 122; break; } else { label = 109; break; } //@line 1055 "src/markdown.c"
  case 109: 
   var $335=(($rndr+408)|0); //@line 130 "src/markdown.c"
   var $336=HEAP32[(($_ph289)>>2)]; //@line 132 "src/markdown.c"
   var $337=(($rndr+416)|0); //@line 132 "src/markdown.c"
   var $338=HEAP32[(($337)>>2)]; //@line 132 "src/markdown.c"
   var $339=(($336)>>>(0)) < (($338)>>>(0)); //@line 132 "src/markdown.c"
   if ($339) { label = 110; break; } else { label = 112; break; } //@line 132 "src/markdown.c"
  case 110: 
   var $341=(($335)|0); //@line 132 "src/markdown.c"
   var $342=HEAP32[(($341)>>2)]; //@line 132 "src/markdown.c"
   var $343=(($342+($336<<2))|0); //@line 132 "src/markdown.c"
   var $344=HEAP32[(($343)>>2)]; //@line 132 "src/markdown.c"
   var $345=(($344)|(0))==0; //@line 132 "src/markdown.c"
   if ($345) { label = 112; break; } else { label = 111; break; } //@line 132 "src/markdown.c"
  case 111: 
   var $347=((($336)+(1))|0); //@line 134 "src/markdown.c"
   HEAP32[(($_ph289)>>2)]=$347; //@line 134 "src/markdown.c"
   var $348=HEAP32[(($343)>>2)]; //@line 134 "src/markdown.c"
   var $349=$348; //@line 134 "src/markdown.c"
   var $350=(($348+4)|0); //@line 135 "src/markdown.c"
   var $351=$350; //@line 135 "src/markdown.c"
   HEAP32[(($351)>>2)]=0; //@line 135 "src/markdown.c"
   var $work_0_i = $349;label = 113; break; //@line 136 "src/markdown.c"
  case 112: 
   var $353=_bufnew(64); //@line 137 "src/markdown.c"
   var $354=$353; //@line 138 "src/markdown.c"
   var $355=_stack_push($335, $354); //@line 138 "src/markdown.c"
   var $work_0_i = $353;label = 113; break;
  case 113: 
   var $work_0_i;
   var $356=(($link_1+4)|0); //@line 154 "src/markdown.c"
   var $357=HEAP32[(($356)>>2)]; //@line 154 "src/markdown.c"
   var $358=(($357)|(0))==0; //@line 154 "src/markdown.c"
   if ($358) { var $u_link_0 = $work_0_i;label = 122; break; } else { label = 114; break; } //@line 154 "src/markdown.c"
  case 114: 
   var $359=(($link_1)|0); //@line 156 "src/markdown.c"
   var $i_018_i = 0;var $360 = $357;label = 115; break; //@line 154 "src/markdown.c"
  case 115: 
   var $360;
   var $i_018_i;
   var $i_1_i = $i_018_i;label = 116; break; //@line 156 "src/markdown.c"
  case 116: 
   var $i_1_i;
   var $362=(($i_1_i)>>>(0)) < (($360)>>>(0)); //@line 156 "src/markdown.c"
   if ($362) { label = 117; break; } else { label = 118; break; } //@line 156 "src/markdown.c"
  case 117: 
   var $364=HEAP32[(($359)>>2)]; //@line 156 "src/markdown.c"
   var $365=(($364+$i_1_i)|0); //@line 156 "src/markdown.c"
   var $366=HEAP8[($365)]; //@line 156 "src/markdown.c"
   var $367=(($366 << 24) >> 24)==92; //@line 156 "src/markdown.c"
   var $368=((($i_1_i)+(1))|0); //@line 157 "src/markdown.c"
   if ($367) { label = 118; break; } else { var $i_1_i = $368;label = 116; break; }
  case 118: 
   var $369=(($i_1_i)>>>(0)) > (($i_018_i)>>>(0)); //@line 159 "src/markdown.c"
   if ($369) { label = 119; break; } else { var $375 = $360;label = 120; break; } //@line 159 "src/markdown.c"
  case 119: 
   var $371=HEAP32[(($359)>>2)]; //@line 160 "src/markdown.c"
   var $372=(($371+$i_018_i)|0); //@line 160 "src/markdown.c"
   var $373=((($i_1_i)-($i_018_i))|0); //@line 160 "src/markdown.c"
   _bufput($work_0_i, $372, $373); //@line 160 "src/markdown.c"
   var $_pre_i=HEAP32[(($356)>>2)]; //@line 162 "src/markdown.c"
   var $375 = $_pre_i;label = 120; break; //@line 160 "src/markdown.c"
  case 120: 
   var $375;
   var $376=((($i_1_i)+(1))|0); //@line 162 "src/markdown.c"
   var $377=(($376)>>>(0)) < (($375)>>>(0)); //@line 162 "src/markdown.c"
   if ($377) { label = 121; break; } else { var $u_link_0 = $work_0_i;label = 122; break; } //@line 162 "src/markdown.c"
  case 121: 
   var $379=HEAP32[(($359)>>2)]; //@line 165 "src/markdown.c"
   var $380=(($379+$376)|0); //@line 165 "src/markdown.c"
   var $381=HEAP8[($380)]; //@line 165 "src/markdown.c"
   var $382=(($381)&(255)); //@line 165 "src/markdown.c"
   _bufputc($work_0_i, $382); //@line 165 "src/markdown.c"
   var $383=((($i_1_i)+(2))|0); //@line 166 "src/markdown.c"
   var $384=HEAP32[(($356)>>2)]; //@line 154 "src/markdown.c"
   var $385=(($383)>>>(0)) < (($384)>>>(0)); //@line 154 "src/markdown.c"
   if ($385) { var $i_018_i = $383;var $360 = $384;label = 115; break; } else { var $u_link_0 = $work_0_i;label = 122; break; } //@line 154 "src/markdown.c"
  case 122: 
   var $u_link_0;
   if ($332) { label = 123; break; } else { label = 127; break; } //@line 1061 "src/markdown.c"
  case 123: 
   var $387=(($ob+4)|0); //@line 1062 "src/markdown.c"
   var $388=HEAP32[(($387)>>2)]; //@line 1062 "src/markdown.c"
   var $389=(($388)|(0))==0; //@line 1062 "src/markdown.c"
   if ($389) { label = 126; break; } else { label = 124; break; } //@line 1062 "src/markdown.c"
  case 124: 
   var $391=((($388)-(1))|0); //@line 1062 "src/markdown.c"
   var $392=(($ob)|0); //@line 1062 "src/markdown.c"
   var $393=HEAP32[(($392)>>2)]; //@line 1062 "src/markdown.c"
   var $394=(($393+$391)|0); //@line 1062 "src/markdown.c"
   var $395=HEAP8[($394)]; //@line 1062 "src/markdown.c"
   var $396=(($395 << 24) >> 24)==33; //@line 1062 "src/markdown.c"
   if ($396) { label = 125; break; } else { label = 126; break; } //@line 1062 "src/markdown.c"
  case 125: 
   HEAP32[(($387)>>2)]=$391; //@line 1063 "src/markdown.c"
   label = 126; break; //@line 1063 "src/markdown.c"
  case 126: 
   var $398=(($rndr+60)|0); //@line 1065 "src/markdown.c"
   var $399=HEAP32[(($398)>>2)]; //@line 1065 "src/markdown.c"
   var $400=(($rndr+104)|0); //@line 1065 "src/markdown.c"
   var $401=HEAP32[(($400)>>2)]; //@line 1065 "src/markdown.c"
   var $402=FUNCTION_TABLE[$399]($ob, $u_link_0, $title_1, $content_0, $401); //@line 1065 "src/markdown.c"
   var $i_8 = $i_7;var $ret_0 = $402;var $410 = $_ph289;var $409 = $19;label = 128; break; //@line 1066 "src/markdown.c"
  case 127: 
   var $404=(($rndr+68)|0); //@line 1067 "src/markdown.c"
   var $405=HEAP32[(($404)>>2)]; //@line 1067 "src/markdown.c"
   var $406=(($rndr+104)|0); //@line 1067 "src/markdown.c"
   var $407=HEAP32[(($406)>>2)]; //@line 1067 "src/markdown.c"
   var $408=FUNCTION_TABLE[$405]($ob, $u_link_0, $title_1, $content_0, $407); //@line 1067 "src/markdown.c"
   var $i_8 = $i_7;var $ret_0 = $408;var $410 = $_ph289;var $409 = $19;label = 128; break;
  case 128: 
   var $409;
   var $410;
   var $ret_0;
   var $i_8;
   HEAP32[(($410)>>2)]=$409; //@line 1072 "src/markdown.c"
   var $411=(($ret_0)|(0))!=0; //@line 1073 "src/markdown.c"
   var $412=$411 ? $i_8 : 0; //@line 1073 "src/markdown.c"
   return $412; //@line 1073 "src/markdown.c"
  default: assert(0, "bad label: " + label);
 }
}
function _char_langle_tag($ob, $rndr, $data, $offset, $size) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 16)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $work=sp;
   var $1=(($size)>>>(0)) < 3; //@line 296 "src/markdown.c"
   if ($1) { var $_lcssa_i = 0;var $75 = 0;label = 27; break; } else { label = 2; break; } //@line 296 "src/markdown.c"
  case 2: 
   var $3=HEAP8[($data)]; //@line 299 "src/markdown.c"
   var $4=(($3 << 24) >> 24)==60; //@line 299 "src/markdown.c"
   if ($4) { label = 3; break; } else { var $_lcssa_i = 0;var $75 = 0;label = 27; break; } //@line 299 "src/markdown.c"
  case 3: 
   var $6=(($data+1)|0); //@line 300 "src/markdown.c"
   var $7=HEAP8[($6)]; //@line 300 "src/markdown.c"
   var $8=(($7 << 24) >> 24)==47; //@line 300 "src/markdown.c"
   var $9=$8 ? 2 : 1; //@line 300 "src/markdown.c"
   var $10=(($data+$9)|0); //@line 302 "src/markdown.c"
   var $11=HEAP8[($10)]; //@line 302 "src/markdown.c"
   var $12=(($11)&(255)); //@line 302 "src/markdown.c"
   var $13=_isalnum($12); //@line 302 "src/markdown.c"
   var $14=(($13)|(0))==0; //@line 302 "src/markdown.c"
   if ($14) { var $_lcssa_i = 0;var $75 = 0;label = 27; break; } else { label = 4; break; } //@line 302 "src/markdown.c"
  case 4: 
   var $16=(($9)>>>(0)) < (($size)>>>(0)); //@line 309 "src/markdown.c"
   if ($16) { var $i_077_i = $9;label = 5; break; } else { var $i_0_lcssa_i = $9;label = 8; break; } //@line 309 "src/markdown.c"
  case 5: 
   var $i_077_i;
   var $17=(($data+$i_077_i)|0); //@line 309 "src/markdown.c"
   var $18=HEAP8[($17)]; //@line 309 "src/markdown.c"
   var $19=(($18)&(255)); //@line 309 "src/markdown.c"
   var $20=_isalnum($19); //@line 309 "src/markdown.c"
   var $21=(($20)|(0))==0; //@line 309 "src/markdown.c"
   if ($21) { label = 6; break; } else { label = 7; break; } //@line 309 "src/markdown.c"
  case 6: 
   var $23=HEAP8[($17)]; //@line 309 "src/markdown.c"
   if ((($23 << 24) >> 24)==46 | (($23 << 24) >> 24)==43 | (($23 << 24) >> 24)==45) {
    label = 7; break;
   }
   else {
   var $i_0_lcssa_i = $i_077_i;label = 8; break;
   }
  case 7: 
   var $24=((($i_077_i)+(1))|0); //@line 310 "src/markdown.c"
   var $25=(($24)>>>(0)) < (($size)>>>(0)); //@line 309 "src/markdown.c"
   if ($25) { var $i_077_i = $24;label = 5; break; } else { var $i_0_lcssa_i = $24;label = 8; break; } //@line 309 "src/markdown.c"
  case 8: 
   var $i_0_lcssa_i;
   var $26=(($i_0_lcssa_i)>>>(0)) > 1; //@line 312 "src/markdown.c"
   if ($26) { label = 9; break; } else { var $i_3_i = $i_0_lcssa_i;label = 25; break; } //@line 312 "src/markdown.c"
  case 9: 
   var $28=(($data+$i_0_lcssa_i)|0); //@line 312 "src/markdown.c"
   var $29=HEAP8[($28)]; //@line 312 "src/markdown.c"
   var $30=(($29 << 24) >> 24)==64; //@line 312 "src/markdown.c"
   if ($30) { label = 10; break; } else { label = 17; break; } //@line 312 "src/markdown.c"
  case 10: 
   var $32=((($size)-($i_0_lcssa_i))|0); //@line 313 "src/markdown.c"
   var $33=(($i_0_lcssa_i)|(0))==(($size)|(0)); //@line 265 "src/markdown.c"
   if ($33) { label = 17; break; } else { var $i_011_i_i = 0;var $nb_012_i_i = 0;label = 11; break; } //@line 265 "src/markdown.c"
  case 11: 
   var $nb_012_i_i;
   var $i_011_i_i;
   var $_sum_i=((($i_011_i_i)+($i_0_lcssa_i))|0); //@line 266 "src/markdown.c"
   var $34=(($data+$_sum_i)|0); //@line 266 "src/markdown.c"
   var $35=HEAP8[($34)]; //@line 266 "src/markdown.c"
   var $36=(($35)&(255)); //@line 266 "src/markdown.c"
   var $37=_isalnum($36); //@line 266 "src/markdown.c"
   var $38=(($37)|(0))==0; //@line 266 "src/markdown.c"
   if ($38) { label = 12; break; } else { var $nb_1_i_i = $nb_012_i_i;label = 14; break; } //@line 266 "src/markdown.c"
  case 12: 
   var $40=HEAP8[($34)]; //@line 269 "src/markdown.c"
   var $41=(($40)&(255)); //@line 269 "src/markdown.c"
   switch((($41)|(0))) {
   case 64:{
    label = 13; break;
   }
   case 45: case 46: case 95:{
    var $nb_1_i_i = $nb_012_i_i;label = 14; break;
   }
   case 62:{
    label = 15; break;
   }
   default: {
   label = 17; break;
   }
   } break; 
  case 13: 
   var $43=((($nb_012_i_i)+(1))|0); //@line 271 "src/markdown.c"
   var $nb_1_i_i = $43;label = 14; break; //@line 271 "src/markdown.c"
  case 14: 
   var $nb_1_i_i;
   var $45=((($i_011_i_i)+(1))|0); //@line 265 "src/markdown.c"
   var $46=(($45)>>>(0)) < (($32)>>>(0)); //@line 265 "src/markdown.c"
   if ($46) { var $i_011_i_i = $45;var $nb_012_i_i = $nb_1_i_i;label = 11; break; } else { label = 17; break; } //@line 265 "src/markdown.c"
  case 15: 
   var $47=(($nb_012_i_i)|(0))==1; //@line 279 "src/markdown.c"
   var $48=((($i_011_i_i)+(1))|0); //@line 279 "src/markdown.c"
   var $__i_i=$47 ? $48 : 0; //@line 279 "src/markdown.c"
   var $49=(($__i_i)|(0))==0; //@line 313 "src/markdown.c"
   if ($49) { label = 17; break; } else { label = 16; break; } //@line 313 "src/markdown.c"
  case 16: 
   var $51=((($__i_i)+($i_0_lcssa_i))|0); //@line 315 "src/markdown.c"
   var $_lcssa_i = $51;var $75 = 2;label = 27; break; //@line 315 "src/markdown.c"
  case 17: 
   var $52=(($i_0_lcssa_i)>>>(0)) > 2; //@line 319 "src/markdown.c"
   if ($52) { label = 18; break; } else { var $i_3_i = $i_0_lcssa_i;label = 25; break; } //@line 319 "src/markdown.c"
  case 18: 
   var $53=HEAP8[($28)]; //@line 319 "src/markdown.c"
   var $54=(($53 << 24) >> 24)==58; //@line 319 "src/markdown.c"
   var $_24=(($54)&(1)); //@line 319 "src/markdown.c"
   var $_i_0_lcssa_i=((($_24)+($i_0_lcssa_i))|0); //@line 319 "src/markdown.c"
   var $55=(($_i_0_lcssa_i)>>>(0)) >= (($size)>>>(0)); //@line 325 "src/markdown.c"
   var $56=$54 ^ 1; //@line 328 "src/markdown.c"
   var $or_cond=$55 | $56; //@line 325 "src/markdown.c"
   if ($or_cond) { var $i_3_i = $_i_0_lcssa_i;label = 25; break; } else { var $i_272_i = $_i_0_lcssa_i;label = 19; break; } //@line 325 "src/markdown.c"
  case 19: 
   var $i_272_i;
   var $57=(($data+$i_272_i)|0); //@line 332 "src/markdown.c"
   var $58=HEAP8[($57)]; //@line 332 "src/markdown.c"
   switch((($58 << 24) >> 24)) {
   case 92:{
    label = 20; break;
   }
   case 62: case 39: case 34: case 32: case 10:{
    label = 23; break;
   }
   default: {
   label = 21; break;
   }
   } break; 
  case 20: 
   var $60=((($i_272_i)+(2))|0); //@line 332 "src/markdown.c"
   var $i_2_be_i = $60;label = 22; break; //@line 332 "src/markdown.c"
  case 21: 
   var $62=((($i_272_i)+(1))|0); //@line 336 "src/markdown.c"
   var $i_2_be_i = $62;label = 22; break;
  case 22: 
   var $i_2_be_i;
   var $63=(($i_2_be_i)>>>(0)) < (($size)>>>(0)); //@line 331 "src/markdown.c"
   if ($63) { var $i_272_i = $i_2_be_i;label = 19; break; } else { var $_lcssa_i = 0;var $75 = $_24;label = 27; break; } //@line 331 "src/markdown.c"
  case 23: 
   var $65=(($i_272_i)>>>(0)) > (($_i_0_lcssa_i)>>>(0)); //@line 340 "src/markdown.c"
   var $66=(($58 << 24) >> 24)==62; //@line 340 "src/markdown.c"
   var $or_cond_i=$65 & $66; //@line 340 "src/markdown.c"
   if ($or_cond_i) { label = 24; break; } else { var $i_3_i = $i_272_i;label = 25; break; } //@line 340 "src/markdown.c"
  case 24: 
   var $68=((($i_272_i)+(1))|0); //@line 340 "src/markdown.c"
   var $_lcssa_i = $68;var $75 = $_24;label = 27; break; //@line 340 "src/markdown.c"
  case 25: 
   var $i_3_i;
   var $69=(($i_3_i)>>>(0)) < (($size)>>>(0)); //@line 346 "src/markdown.c"
   if ($69) { label = 26; break; } else { var $_lcssa_i = 0;var $75 = 0;label = 27; break; } //@line 346 "src/markdown.c"
  case 26: 
   var $71=(($data+$i_3_i)|0); //@line 346 "src/markdown.c"
   var $72=HEAP8[($71)]; //@line 346 "src/markdown.c"
   var $73=(($72 << 24) >> 24)==62; //@line 346 "src/markdown.c"
   var $74=((($i_3_i)+(1))|0); //@line 346 "src/markdown.c"
   if ($73) { var $_lcssa_i = $74;var $75 = 0;label = 27; break; } else { var $i_3_i = $74;label = 25; break; }
  case 27: 
   var $75;
   var $_lcssa_i;
   var $76=(($work)|0); //@line 748 "src/markdown.c"
   HEAP32[(($76)>>2)]=$data; //@line 748 "src/markdown.c"
   var $77=(($work+4)|0); //@line 748 "src/markdown.c"
   HEAP32[(($77)>>2)]=$_lcssa_i; //@line 748 "src/markdown.c"
   var $78=(($work+8)|0); //@line 748 "src/markdown.c"
   HEAP32[(($78)>>2)]=0; //@line 748 "src/markdown.c"
   var $79=(($work+12)|0); //@line 748 "src/markdown.c"
   HEAP32[(($79)>>2)]=0; //@line 748 "src/markdown.c"
   var $80=(($_lcssa_i)>>>(0)) > 2; //@line 751 "src/markdown.c"
   if ($80) { label = 28; break; } else { var $ret_0 = 0;label = 45; break; } //@line 751 "src/markdown.c"
  case 28: 
   var $82=(($rndr+44)|0); //@line 752 "src/markdown.c"
   var $83=HEAP32[(($82)>>2)]; //@line 752 "src/markdown.c"
   var $84=(($83)|(0))==0; //@line 752 "src/markdown.c"
   var $85=(($75)|(0))==0; //@line 752 "src/markdown.c"
   var $or_cond25=$84 | $85; //@line 752 "src/markdown.c"
   if ($or_cond25) { label = 43; break; } else { label = 29; break; } //@line 752 "src/markdown.c"
  case 29: 
   var $87=(($rndr+408)|0); //@line 130 "src/markdown.c"
   var $88=(($rndr+412)|0); //@line 132 "src/markdown.c"
   var $89=HEAP32[(($88)>>2)]; //@line 132 "src/markdown.c"
   var $90=(($rndr+416)|0); //@line 132 "src/markdown.c"
   var $91=HEAP32[(($90)>>2)]; //@line 132 "src/markdown.c"
   var $92=(($89)>>>(0)) < (($91)>>>(0)); //@line 132 "src/markdown.c"
   if ($92) { label = 30; break; } else { label = 32; break; } //@line 132 "src/markdown.c"
  case 30: 
   var $94=(($87)|0); //@line 132 "src/markdown.c"
   var $95=HEAP32[(($94)>>2)]; //@line 132 "src/markdown.c"
   var $96=(($95+($89<<2))|0); //@line 132 "src/markdown.c"
   var $97=HEAP32[(($96)>>2)]; //@line 132 "src/markdown.c"
   var $98=(($97)|(0))==0; //@line 132 "src/markdown.c"
   if ($98) { label = 32; break; } else { label = 31; break; } //@line 132 "src/markdown.c"
  case 31: 
   var $100=((($89)+(1))|0); //@line 134 "src/markdown.c"
   HEAP32[(($88)>>2)]=$100; //@line 134 "src/markdown.c"
   var $101=HEAP32[(($96)>>2)]; //@line 134 "src/markdown.c"
   var $102=$101; //@line 134 "src/markdown.c"
   var $103=(($101+4)|0); //@line 135 "src/markdown.c"
   var $104=$103; //@line 135 "src/markdown.c"
   HEAP32[(($104)>>2)]=0; //@line 135 "src/markdown.c"
   var $work_0_i = $102;label = 33; break; //@line 136 "src/markdown.c"
  case 32: 
   var $106=_bufnew(64); //@line 137 "src/markdown.c"
   var $107=$106; //@line 138 "src/markdown.c"
   var $108=_stack_push($87, $107); //@line 138 "src/markdown.c"
   var $work_0_i = $106;label = 33; break;
  case 33: 
   var $work_0_i;
   var $109=(($data+1)|0); //@line 754 "src/markdown.c"
   HEAP32[(($76)>>2)]=$109; //@line 754 "src/markdown.c"
   var $110=((($_lcssa_i)-(2))|0); //@line 755 "src/markdown.c"
   HEAP32[(($77)>>2)]=$110; //@line 755 "src/markdown.c"
   var $111=(($110)|(0))==0; //@line 154 "src/markdown.c"
   if ($111) { label = 42; break; } else { var $i_018_i = 0;var $113 = $110;var $112 = $109;label = 34; break; } //@line 154 "src/markdown.c"
  case 34: 
   var $112;
   var $113;
   var $i_018_i;
   var $i_1_i20 = $i_018_i;label = 35; break; //@line 156 "src/markdown.c"
  case 35: 
   var $i_1_i20;
   var $115=(($i_1_i20)>>>(0)) < (($113)>>>(0)); //@line 156 "src/markdown.c"
   if ($115) { label = 36; break; } else { label = 37; break; } //@line 156 "src/markdown.c"
  case 36: 
   var $117=(($112+$i_1_i20)|0); //@line 156 "src/markdown.c"
   var $118=HEAP8[($117)]; //@line 156 "src/markdown.c"
   var $119=(($118 << 24) >> 24)==92; //@line 156 "src/markdown.c"
   var $120=((($i_1_i20)+(1))|0); //@line 157 "src/markdown.c"
   if ($119) { label = 37; break; } else { var $i_1_i20 = $120;label = 35; break; }
  case 37: 
   var $121=(($i_1_i20)>>>(0)) > (($i_018_i)>>>(0)); //@line 159 "src/markdown.c"
   if ($121) { label = 38; break; } else { var $126 = $113;label = 39; break; } //@line 159 "src/markdown.c"
  case 38: 
   var $123=(($112+$i_018_i)|0); //@line 160 "src/markdown.c"
   var $124=((($i_1_i20)-($i_018_i))|0); //@line 160 "src/markdown.c"
   _bufput($work_0_i, $123, $124); //@line 160 "src/markdown.c"
   var $_pre_i=HEAP32[(($77)>>2)]; //@line 162 "src/markdown.c"
   var $126 = $_pre_i;label = 39; break; //@line 160 "src/markdown.c"
  case 39: 
   var $126;
   var $127=((($i_1_i20)+(1))|0); //@line 162 "src/markdown.c"
   var $128=(($127)>>>(0)) < (($126)>>>(0)); //@line 162 "src/markdown.c"
   if ($128) { label = 40; break; } else { label = 42; break; } //@line 162 "src/markdown.c"
  case 40: 
   var $130=HEAP32[(($76)>>2)]; //@line 165 "src/markdown.c"
   var $131=(($130+$127)|0); //@line 165 "src/markdown.c"
   var $132=HEAP8[($131)]; //@line 165 "src/markdown.c"
   var $133=(($132)&(255)); //@line 165 "src/markdown.c"
   _bufputc($work_0_i, $133); //@line 165 "src/markdown.c"
   var $134=((($i_1_i20)+(2))|0); //@line 166 "src/markdown.c"
   var $135=HEAP32[(($77)>>2)]; //@line 154 "src/markdown.c"
   var $136=(($134)>>>(0)) < (($135)>>>(0)); //@line 154 "src/markdown.c"
   if ($136) { label = 41; break; } else { label = 42; break; } //@line 154 "src/markdown.c"
  case 41: 
   var $_pre=HEAP32[(($76)>>2)]; //@line 156 "src/markdown.c"
   var $i_018_i = $134;var $113 = $135;var $112 = $_pre;label = 34; break; //@line 154 "src/markdown.c"
  case 42: 
   var $137=HEAP32[(($82)>>2)]; //@line 757 "src/markdown.c"
   var $138=(($rndr+104)|0); //@line 757 "src/markdown.c"
   var $139=HEAP32[(($138)>>2)]; //@line 757 "src/markdown.c"
   var $140=FUNCTION_TABLE[$137]($ob, $work_0_i, $75, $139); //@line 757 "src/markdown.c"
   var $141=HEAP32[(($88)>>2)]; //@line 147 "src/markdown.c"
   var $142=((($141)-(1))|0); //@line 147 "src/markdown.c"
   HEAP32[(($88)>>2)]=$142; //@line 147 "src/markdown.c"
   var $ret_0 = $140;label = 45; break; //@line 759 "src/markdown.c"
  case 43: 
   var $144=(($rndr+72)|0); //@line 760 "src/markdown.c"
   var $145=HEAP32[(($144)>>2)]; //@line 760 "src/markdown.c"
   var $146=(($145)|(0))==0; //@line 760 "src/markdown.c"
   if ($146) { var $ret_0 = 0;label = 45; break; } else { label = 44; break; } //@line 760 "src/markdown.c"
  case 44: 
   var $148=(($rndr+104)|0); //@line 761 "src/markdown.c"
   var $149=HEAP32[(($148)>>2)]; //@line 761 "src/markdown.c"
   var $150=FUNCTION_TABLE[$145]($ob, $work, $149); //@line 761 "src/markdown.c"
   var $ret_0 = $150;label = 45; break; //@line 761 "src/markdown.c"
  case 45: 
   var $ret_0;
   var $152=(($ret_0)|(0))==0; //@line 764 "src/markdown.c"
   var $_=$152 ? 0 : $_lcssa_i; //@line 764 "src/markdown.c"
   STACKTOP = sp;
   return $_; //@line 766 "src/markdown.c"
  default: assert(0, "bad label: " + label);
 }
}
function _char_escape($ob, $rndr, $data, $offset, $size) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 16)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $work=sp;
   var $1=$work; //@line 694 "src/markdown.c"
   HEAP32[(($1)>>2)]=0; HEAP32[((($1)+(4))>>2)]=0; HEAP32[((($1)+(8))>>2)]=0; HEAP32[((($1)+(12))>>2)]=0; //@line 694 "src/markdown.c"
   var $2=(($size)>>>(0)) > 1; //@line 696 "src/markdown.c"
   if ($2) { label = 2; break; } else { label = 6; break; } //@line 696 "src/markdown.c"
  case 2: 
   var $4=(($data+1)|0); //@line 697 "src/markdown.c"
   var $5=HEAP8[($4)]; //@line 697 "src/markdown.c"
   var $6=(($5)&(255)); //@line 697 "src/markdown.c"
   var $memchr=_memchr(((1768)|0), $6, 23); //@line 697 "src/markdown.c"
   var $7=(($memchr)|(0))==0; //@line 697 "src/markdown.c"
   if ($7) { var $_0 = 0;label = 8; break; } else { label = 3; break; } //@line 697 "src/markdown.c"
  case 3: 
   var $9=(($rndr+92)|0); //@line 700 "src/markdown.c"
   var $10=HEAP32[(($9)>>2)]; //@line 700 "src/markdown.c"
   var $11=(($10)|(0))==0; //@line 700 "src/markdown.c"
   if ($11) { label = 5; break; } else { label = 4; break; } //@line 700 "src/markdown.c"
  case 4: 
   var $13=(($work)|0); //@line 701 "src/markdown.c"
   HEAP32[(($13)>>2)]=$4; //@line 701 "src/markdown.c"
   var $14=(($work+4)|0); //@line 702 "src/markdown.c"
   HEAP32[(($14)>>2)]=1; //@line 702 "src/markdown.c"
   var $15=(($rndr+104)|0); //@line 703 "src/markdown.c"
   var $16=HEAP32[(($15)>>2)]; //@line 703 "src/markdown.c"
   FUNCTION_TABLE[$10]($ob, $work, $16); //@line 703 "src/markdown.c"
   var $_0 = 2;label = 8; break; //@line 704 "src/markdown.c"
  case 5: 
   _bufputc($ob, $6); //@line 705 "src/markdown.c"
   var $_0 = 2;label = 8; break;
  case 6: 
   var $19=(($size)|(0))==1; //@line 706 "src/markdown.c"
   if ($19) { label = 7; break; } else { var $_0 = 2;label = 8; break; } //@line 706 "src/markdown.c"
  case 7: 
   var $21=HEAP8[($data)]; //@line 707 "src/markdown.c"
   var $22=(($21)&(255)); //@line 707 "src/markdown.c"
   _bufputc($ob, $22); //@line 707 "src/markdown.c"
   var $_0 = 2;label = 8; break; //@line 708 "src/markdown.c"
  case 8: 
   var $_0;
   STACKTOP = sp;
   return $_0; //@line 711 "src/markdown.c"
  default: assert(0, "bad label: " + label);
 }
}
function _char_entity($ob, $rndr, $data, $offset, $size) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 16)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $work=sp;
   var $1=$work; //@line 719 "src/markdown.c"
   HEAP32[(($1)>>2)]=0; HEAP32[((($1)+(4))>>2)]=0; HEAP32[((($1)+(8))>>2)]=0; HEAP32[((($1)+(12))>>2)]=0; //@line 719 "src/markdown.c"
   var $2=(($size)>>>(0)) > 1; //@line 721 "src/markdown.c"
   if ($2) { label = 2; break; } else { var $end_0 = 1;label = 3; break; } //@line 721 "src/markdown.c"
  case 2: 
   var $4=(($data+1)|0); //@line 721 "src/markdown.c"
   var $5=HEAP8[($4)]; //@line 721 "src/markdown.c"
   var $6=(($5 << 24) >> 24)==35; //@line 721 "src/markdown.c"
   var $_=$6 ? 2 : 1; //@line 721 "src/markdown.c"
   var $end_0 = $_;label = 3; break; //@line 721 "src/markdown.c"
  case 3: 
   var $end_0;
   var $7=(($end_0)>>>(0)) < (($size)>>>(0)); //@line 724 "src/markdown.c"
   if ($7) { label = 4; break; } else { var $_0 = 0;label = 9; break; } //@line 724 "src/markdown.c"
  case 4: 
   var $9=(($data+$end_0)|0); //@line 724 "src/markdown.c"
   var $10=HEAP8[($9)]; //@line 724 "src/markdown.c"
   var $11=(($10)&(255)); //@line 724 "src/markdown.c"
   var $12=_isalnum($11); //@line 724 "src/markdown.c"
   var $13=(($12)|(0))==0; //@line 724 "src/markdown.c"
   var $14=((($end_0)+(1))|0); //@line 725 "src/markdown.c"
   if ($13) { label = 5; break; } else { var $end_0 = $14;label = 3; break; }
  case 5: 
   var $16=HEAP8[($9)]; //@line 727 "src/markdown.c"
   var $17=(($16 << 24) >> 24)==59; //@line 727 "src/markdown.c"
   if ($17) { label = 6; break; } else { var $_0 = 0;label = 9; break; } //@line 727 "src/markdown.c"
  case 6: 
   var $19=(($rndr+88)|0); //@line 732 "src/markdown.c"
   var $20=HEAP32[(($19)>>2)]; //@line 732 "src/markdown.c"
   var $21=(($20)|(0))==0; //@line 732 "src/markdown.c"
   if ($21) { label = 8; break; } else { label = 7; break; } //@line 732 "src/markdown.c"
  case 7: 
   var $23=(($work)|0); //@line 733 "src/markdown.c"
   HEAP32[(($23)>>2)]=$data; //@line 733 "src/markdown.c"
   var $24=(($work+4)|0); //@line 734 "src/markdown.c"
   HEAP32[(($24)>>2)]=$14; //@line 734 "src/markdown.c"
   var $25=(($rndr+104)|0); //@line 735 "src/markdown.c"
   var $26=HEAP32[(($25)>>2)]; //@line 735 "src/markdown.c"
   FUNCTION_TABLE[$20]($ob, $work, $26); //@line 735 "src/markdown.c"
   var $_0 = $14;label = 9; break; //@line 736 "src/markdown.c"
  case 8: 
   _bufput($ob, $data, $14); //@line 737 "src/markdown.c"
   var $_0 = $14;label = 9; break;
  case 9: 
   var $_0;
   STACKTOP = sp;
   return $_0; //@line 740 "src/markdown.c"
  default: assert(0, "bad label: " + label);
 }
}
function _char_autolink_url($ob, $rndr, $data, $offset, $size) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $rewind=sp;
   var $1=(($rndr+44)|0); //@line 826 "src/markdown.c"
   var $2=HEAP32[(($1)>>2)]; //@line 826 "src/markdown.c"
   var $3=(($2)|(0))==0; //@line 826 "src/markdown.c"
   if ($3) { var $_0 = 0;label = 10; break; } else { label = 2; break; } //@line 826 "src/markdown.c"
  case 2: 
   var $5=(($rndr+428)|0); //@line 826 "src/markdown.c"
   var $6=HEAP32[(($5)>>2)]; //@line 826 "src/markdown.c"
   var $7=(($6)|(0))==0; //@line 826 "src/markdown.c"
   if ($7) { label = 3; break; } else { var $_0 = 0;label = 10; break; } //@line 826 "src/markdown.c"
  case 3: 
   var $9=(($rndr+408)|0); //@line 130 "src/markdown.c"
   var $10=(($rndr+412)|0); //@line 132 "src/markdown.c"
   var $11=HEAP32[(($10)>>2)]; //@line 132 "src/markdown.c"
   var $12=(($rndr+416)|0); //@line 132 "src/markdown.c"
   var $13=HEAP32[(($12)>>2)]; //@line 132 "src/markdown.c"
   var $14=(($11)>>>(0)) < (($13)>>>(0)); //@line 132 "src/markdown.c"
   if ($14) { label = 4; break; } else { label = 6; break; } //@line 132 "src/markdown.c"
  case 4: 
   var $16=(($9)|0); //@line 132 "src/markdown.c"
   var $17=HEAP32[(($16)>>2)]; //@line 132 "src/markdown.c"
   var $18=(($17+($11<<2))|0); //@line 132 "src/markdown.c"
   var $19=HEAP32[(($18)>>2)]; //@line 132 "src/markdown.c"
   var $20=(($19)|(0))==0; //@line 132 "src/markdown.c"
   if ($20) { label = 6; break; } else { label = 5; break; } //@line 132 "src/markdown.c"
  case 5: 
   var $22=((($11)+(1))|0); //@line 134 "src/markdown.c"
   HEAP32[(($10)>>2)]=$22; //@line 134 "src/markdown.c"
   var $23=HEAP32[(($18)>>2)]; //@line 134 "src/markdown.c"
   var $24=$23; //@line 134 "src/markdown.c"
   var $25=(($23+4)|0); //@line 135 "src/markdown.c"
   var $26=$25; //@line 135 "src/markdown.c"
   HEAP32[(($26)>>2)]=0; //@line 135 "src/markdown.c"
   var $work_0_i = $24;label = 7; break; //@line 136 "src/markdown.c"
  case 6: 
   var $28=_bufnew(64); //@line 137 "src/markdown.c"
   var $29=$28; //@line 138 "src/markdown.c"
   var $30=_stack_push($9, $29); //@line 138 "src/markdown.c"
   var $work_0_i = $28;label = 7; break;
  case 7: 
   var $work_0_i;
   var $31=_sd_autolink__url($rewind, $work_0_i, $data, $offset, $size, 0); //@line 831 "src/markdown.c"
   var $32=(($31)|(0))==0; //@line 831 "src/markdown.c"
   if ($32) { label = 9; break; } else { label = 8; break; } //@line 831 "src/markdown.c"
  case 8: 
   var $34=HEAP32[(($rewind)>>2)]; //@line 832 "src/markdown.c"
   var $35=(($ob+4)|0); //@line 832 "src/markdown.c"
   var $36=HEAP32[(($35)>>2)]; //@line 832 "src/markdown.c"
   var $37=((($36)-($34))|0); //@line 832 "src/markdown.c"
   HEAP32[(($35)>>2)]=$37; //@line 832 "src/markdown.c"
   var $38=HEAP32[(($1)>>2)]; //@line 833 "src/markdown.c"
   var $39=(($rndr+104)|0); //@line 833 "src/markdown.c"
   var $40=HEAP32[(($39)>>2)]; //@line 833 "src/markdown.c"
   var $41=FUNCTION_TABLE[$38]($ob, $work_0_i, 1, $40); //@line 833 "src/markdown.c"
   label = 9; break; //@line 834 "src/markdown.c"
  case 9: 
   var $43=HEAP32[(($10)>>2)]; //@line 147 "src/markdown.c"
   var $44=((($43)-(1))|0); //@line 147 "src/markdown.c"
   HEAP32[(($10)>>2)]=$44; //@line 147 "src/markdown.c"
   var $_0 = $31;label = 10; break; //@line 837 "src/markdown.c"
  case 10: 
   var $_0;
   STACKTOP = sp;
   return $_0; //@line 838 "src/markdown.c"
  default: assert(0, "bad label: " + label);
 }
}
function _char_autolink_email($ob, $rndr, $data, $offset, $size) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $rewind=sp;
   var $1=(($rndr+44)|0); //@line 806 "src/markdown.c"
   var $2=HEAP32[(($1)>>2)]; //@line 806 "src/markdown.c"
   var $3=(($2)|(0))==0; //@line 806 "src/markdown.c"
   if ($3) { var $_0 = 0;label = 10; break; } else { label = 2; break; } //@line 806 "src/markdown.c"
  case 2: 
   var $5=(($rndr+428)|0); //@line 806 "src/markdown.c"
   var $6=HEAP32[(($5)>>2)]; //@line 806 "src/markdown.c"
   var $7=(($6)|(0))==0; //@line 806 "src/markdown.c"
   if ($7) { label = 3; break; } else { var $_0 = 0;label = 10; break; } //@line 806 "src/markdown.c"
  case 3: 
   var $9=(($rndr+408)|0); //@line 130 "src/markdown.c"
   var $10=(($rndr+412)|0); //@line 132 "src/markdown.c"
   var $11=HEAP32[(($10)>>2)]; //@line 132 "src/markdown.c"
   var $12=(($rndr+416)|0); //@line 132 "src/markdown.c"
   var $13=HEAP32[(($12)>>2)]; //@line 132 "src/markdown.c"
   var $14=(($11)>>>(0)) < (($13)>>>(0)); //@line 132 "src/markdown.c"
   if ($14) { label = 4; break; } else { label = 6; break; } //@line 132 "src/markdown.c"
  case 4: 
   var $16=(($9)|0); //@line 132 "src/markdown.c"
   var $17=HEAP32[(($16)>>2)]; //@line 132 "src/markdown.c"
   var $18=(($17+($11<<2))|0); //@line 132 "src/markdown.c"
   var $19=HEAP32[(($18)>>2)]; //@line 132 "src/markdown.c"
   var $20=(($19)|(0))==0; //@line 132 "src/markdown.c"
   if ($20) { label = 6; break; } else { label = 5; break; } //@line 132 "src/markdown.c"
  case 5: 
   var $22=((($11)+(1))|0); //@line 134 "src/markdown.c"
   HEAP32[(($10)>>2)]=$22; //@line 134 "src/markdown.c"
   var $23=HEAP32[(($18)>>2)]; //@line 134 "src/markdown.c"
   var $24=$23; //@line 134 "src/markdown.c"
   var $25=(($23+4)|0); //@line 135 "src/markdown.c"
   var $26=$25; //@line 135 "src/markdown.c"
   HEAP32[(($26)>>2)]=0; //@line 135 "src/markdown.c"
   var $work_0_i = $24;label = 7; break; //@line 136 "src/markdown.c"
  case 6: 
   var $28=_bufnew(64); //@line 137 "src/markdown.c"
   var $29=$28; //@line 138 "src/markdown.c"
   var $30=_stack_push($9, $29); //@line 138 "src/markdown.c"
   var $work_0_i = $28;label = 7; break;
  case 7: 
   var $work_0_i;
   var $31=_sd_autolink__email($rewind, $work_0_i, $data, $offset, $size, 0); //@line 811 "src/markdown.c"
   var $32=(($31)|(0))==0; //@line 811 "src/markdown.c"
   if ($32) { label = 9; break; } else { label = 8; break; } //@line 811 "src/markdown.c"
  case 8: 
   var $34=HEAP32[(($rewind)>>2)]; //@line 812 "src/markdown.c"
   var $35=(($ob+4)|0); //@line 812 "src/markdown.c"
   var $36=HEAP32[(($35)>>2)]; //@line 812 "src/markdown.c"
   var $37=((($36)-($34))|0); //@line 812 "src/markdown.c"
   HEAP32[(($35)>>2)]=$37; //@line 812 "src/markdown.c"
   var $38=HEAP32[(($1)>>2)]; //@line 813 "src/markdown.c"
   var $39=(($rndr+104)|0); //@line 813 "src/markdown.c"
   var $40=HEAP32[(($39)>>2)]; //@line 813 "src/markdown.c"
   var $41=FUNCTION_TABLE[$38]($ob, $work_0_i, 2, $40); //@line 813 "src/markdown.c"
   label = 9; break; //@line 814 "src/markdown.c"
  case 9: 
   var $43=HEAP32[(($10)>>2)]; //@line 147 "src/markdown.c"
   var $44=((($43)-(1))|0); //@line 147 "src/markdown.c"
   HEAP32[(($10)>>2)]=$44; //@line 147 "src/markdown.c"
   var $_0 = $31;label = 10; break; //@line 817 "src/markdown.c"
  case 10: 
   var $_0;
   STACKTOP = sp;
   return $_0; //@line 818 "src/markdown.c"
  default: assert(0, "bad label: " + label);
 }
}
function _char_autolink_www($ob, $rndr, $data, $offset, $size) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $rewind=sp;
   var $1=(($rndr+68)|0); //@line 774 "src/markdown.c"
   var $2=HEAP32[(($1)>>2)]; //@line 774 "src/markdown.c"
   var $3=(($2)|(0))==0; //@line 774 "src/markdown.c"
   if ($3) { var $_0 = 0;label = 21; break; } else { label = 2; break; } //@line 774 "src/markdown.c"
  case 2: 
   var $5=(($rndr+428)|0); //@line 774 "src/markdown.c"
   var $6=HEAP32[(($5)>>2)]; //@line 774 "src/markdown.c"
   var $7=(($6)|(0))==0; //@line 774 "src/markdown.c"
   if ($7) { label = 3; break; } else { var $_0 = 0;label = 21; break; } //@line 774 "src/markdown.c"
  case 3: 
   var $9=(($rndr+408)|0); //@line 130 "src/markdown.c"
   var $10=(($rndr+412)|0); //@line 132 "src/markdown.c"
   var $11=HEAP32[(($10)>>2)]; //@line 132 "src/markdown.c"
   var $12=(($rndr+416)|0); //@line 132 "src/markdown.c"
   var $13=HEAP32[(($12)>>2)]; //@line 132 "src/markdown.c"
   var $14=(($11)>>>(0)) < (($13)>>>(0)); //@line 132 "src/markdown.c"
   if ($14) { label = 4; break; } else { label = 6; break; } //@line 132 "src/markdown.c"
  case 4: 
   var $16=(($9)|0); //@line 132 "src/markdown.c"
   var $17=HEAP32[(($16)>>2)]; //@line 132 "src/markdown.c"
   var $18=(($17+($11<<2))|0); //@line 132 "src/markdown.c"
   var $19=HEAP32[(($18)>>2)]; //@line 132 "src/markdown.c"
   var $20=(($19)|(0))==0; //@line 132 "src/markdown.c"
   if ($20) { label = 6; break; } else { label = 5; break; } //@line 132 "src/markdown.c"
  case 5: 
   var $22=((($11)+(1))|0); //@line 134 "src/markdown.c"
   HEAP32[(($10)>>2)]=$22; //@line 134 "src/markdown.c"
   var $23=HEAP32[(($18)>>2)]; //@line 134 "src/markdown.c"
   var $24=$23; //@line 134 "src/markdown.c"
   var $25=(($23+4)|0); //@line 135 "src/markdown.c"
   var $26=$25; //@line 135 "src/markdown.c"
   HEAP32[(($26)>>2)]=0; //@line 135 "src/markdown.c"
   var $work_0_i = $24;label = 7; break; //@line 136 "src/markdown.c"
  case 6: 
   var $28=_bufnew(64); //@line 137 "src/markdown.c"
   var $29=$28; //@line 138 "src/markdown.c"
   var $30=_stack_push($9, $29); //@line 138 "src/markdown.c"
   var $work_0_i = $28;label = 7; break;
  case 7: 
   var $work_0_i;
   var $31=_sd_autolink__www($rewind, $work_0_i, $data, $offset, $size, 0); //@line 779 "src/markdown.c"
   var $32=(($31)|(0))==0; //@line 779 "src/markdown.c"
   var $_pre33=HEAP32[(($10)>>2)]; //@line 147 "src/markdown.c"
   if ($32) { var $99 = $_pre33;label = 20; break; } else { label = 8; break; } //@line 779 "src/markdown.c"
  case 8: 
   var $34=HEAP32[(($12)>>2)]; //@line 132 "src/markdown.c"
   var $35=(($_pre33)>>>(0)) < (($34)>>>(0)); //@line 132 "src/markdown.c"
   if ($35) { label = 9; break; } else { label = 11; break; } //@line 132 "src/markdown.c"
  case 9: 
   var $37=(($9)|0); //@line 132 "src/markdown.c"
   var $38=HEAP32[(($37)>>2)]; //@line 132 "src/markdown.c"
   var $39=(($38+($_pre33<<2))|0); //@line 132 "src/markdown.c"
   var $40=HEAP32[(($39)>>2)]; //@line 132 "src/markdown.c"
   var $41=(($40)|(0))==0; //@line 132 "src/markdown.c"
   if ($41) { label = 11; break; } else { label = 10; break; } //@line 132 "src/markdown.c"
  case 10: 
   var $43=((($_pre33)+(1))|0); //@line 134 "src/markdown.c"
   HEAP32[(($10)>>2)]=$43; //@line 134 "src/markdown.c"
   var $44=HEAP32[(($39)>>2)]; //@line 134 "src/markdown.c"
   var $45=$44; //@line 134 "src/markdown.c"
   var $46=(($44+4)|0); //@line 135 "src/markdown.c"
   var $47=$46; //@line 135 "src/markdown.c"
   HEAP32[(($47)>>2)]=0; //@line 135 "src/markdown.c"
   var $work_0_i29 = $45;label = 12; break; //@line 136 "src/markdown.c"
  case 11: 
   var $49=_bufnew(64); //@line 137 "src/markdown.c"
   var $50=$49; //@line 138 "src/markdown.c"
   var $51=_stack_push($9, $50); //@line 138 "src/markdown.c"
   var $work_0_i29 = $49;label = 12; break;
  case 12: 
   var $work_0_i29;
   _bufput($work_0_i29, ((1800)|0), 7); //@line 781 "src/markdown.c"
   var $52=(($work_0_i)|0); //@line 782 "src/markdown.c"
   var $53=HEAP32[(($52)>>2)]; //@line 782 "src/markdown.c"
   var $54=(($work_0_i+4)|0); //@line 782 "src/markdown.c"
   var $55=HEAP32[(($54)>>2)]; //@line 782 "src/markdown.c"
   _bufput($work_0_i29, $53, $55); //@line 782 "src/markdown.c"
   var $56=HEAP32[(($rewind)>>2)]; //@line 784 "src/markdown.c"
   var $57=(($ob+4)|0); //@line 784 "src/markdown.c"
   var $58=HEAP32[(($57)>>2)]; //@line 784 "src/markdown.c"
   var $59=((($58)-($56))|0); //@line 784 "src/markdown.c"
   HEAP32[(($57)>>2)]=$59; //@line 784 "src/markdown.c"
   var $60=(($rndr+92)|0); //@line 785 "src/markdown.c"
   var $61=HEAP32[(($60)>>2)]; //@line 785 "src/markdown.c"
   var $62=(($61)|(0))==0; //@line 785 "src/markdown.c"
   if ($62) { label = 18; break; } else { label = 13; break; } //@line 785 "src/markdown.c"
  case 13: 
   var $64=HEAP32[(($10)>>2)]; //@line 132 "src/markdown.c"
   var $65=HEAP32[(($12)>>2)]; //@line 132 "src/markdown.c"
   var $66=(($64)>>>(0)) < (($65)>>>(0)); //@line 132 "src/markdown.c"
   if ($66) { label = 14; break; } else { label = 16; break; } //@line 132 "src/markdown.c"
  case 14: 
   var $68=(($9)|0); //@line 132 "src/markdown.c"
   var $69=HEAP32[(($68)>>2)]; //@line 132 "src/markdown.c"
   var $70=(($69+($64<<2))|0); //@line 132 "src/markdown.c"
   var $71=HEAP32[(($70)>>2)]; //@line 132 "src/markdown.c"
   var $72=(($71)|(0))==0; //@line 132 "src/markdown.c"
   if ($72) { label = 16; break; } else { label = 15; break; } //@line 132 "src/markdown.c"
  case 15: 
   var $74=((($64)+(1))|0); //@line 134 "src/markdown.c"
   HEAP32[(($10)>>2)]=$74; //@line 134 "src/markdown.c"
   var $75=HEAP32[(($70)>>2)]; //@line 134 "src/markdown.c"
   var $76=$75; //@line 134 "src/markdown.c"
   var $77=(($75+4)|0); //@line 135 "src/markdown.c"
   var $78=$77; //@line 135 "src/markdown.c"
   HEAP32[(($78)>>2)]=0; //@line 135 "src/markdown.c"
   var $work_0_i31 = $76;label = 17; break; //@line 136 "src/markdown.c"
  case 16: 
   var $80=_bufnew(64); //@line 137 "src/markdown.c"
   var $81=$80; //@line 138 "src/markdown.c"
   var $82=_stack_push($9, $81); //@line 138 "src/markdown.c"
   var $work_0_i31 = $80;label = 17; break;
  case 17: 
   var $work_0_i31;
   var $83=HEAP32[(($60)>>2)]; //@line 787 "src/markdown.c"
   var $84=(($rndr+104)|0); //@line 787 "src/markdown.c"
   var $85=HEAP32[(($84)>>2)]; //@line 787 "src/markdown.c"
   FUNCTION_TABLE[$83]($work_0_i31, $work_0_i, $85); //@line 787 "src/markdown.c"
   var $86=HEAP32[(($1)>>2)]; //@line 788 "src/markdown.c"
   var $87=HEAP32[(($84)>>2)]; //@line 788 "src/markdown.c"
   var $88=FUNCTION_TABLE[$86]($ob, $work_0_i29, 0, $work_0_i31, $87); //@line 788 "src/markdown.c"
   var $89=HEAP32[(($10)>>2)]; //@line 147 "src/markdown.c"
   var $90=((($89)-(1))|0); //@line 147 "src/markdown.c"
   HEAP32[(($10)>>2)]=$90; //@line 147 "src/markdown.c"
   var $97 = $90;label = 19; break; //@line 790 "src/markdown.c"
  case 18: 
   var $92=HEAP32[(($1)>>2)]; //@line 791 "src/markdown.c"
   var $93=(($rndr+104)|0); //@line 791 "src/markdown.c"
   var $94=HEAP32[(($93)>>2)]; //@line 791 "src/markdown.c"
   var $95=FUNCTION_TABLE[$92]($ob, $work_0_i29, 0, $work_0_i, $94); //@line 791 "src/markdown.c"
   var $_pre=HEAP32[(($10)>>2)]; //@line 147 "src/markdown.c"
   var $97 = $_pre;label = 19; break;
  case 19: 
   var $97;
   var $98=((($97)-(1))|0); //@line 147 "src/markdown.c"
   HEAP32[(($10)>>2)]=$98; //@line 147 "src/markdown.c"
   var $99 = $98;label = 20; break; //@line 794 "src/markdown.c"
  case 20: 
   var $99;
   var $100=((($99)-(1))|0); //@line 147 "src/markdown.c"
   HEAP32[(($10)>>2)]=$100; //@line 147 "src/markdown.c"
   var $_0 = $31;label = 21; break; //@line 797 "src/markdown.c"
  case 21: 
   var $_0;
   STACKTOP = sp;
   return $_0; //@line 798 "src/markdown.c"
  default: assert(0, "bad label: " + label);
 }
}
function _find_emph_char($data, $size, $c) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($size)>>>(0)) > 1; //@line 396 "src/markdown.c"
   if ($1) { var $i_0137 = 1;label = 2; break; } else { var $_0 = 0;label = 35; break; } //@line 396 "src/markdown.c"
  case 2: 
   var $i_0137;
   var $2=(($i_0137)>>>(0)) < (($size)>>>(0)); //@line 397 "src/markdown.c"
   if ($2) { var $i_196 = $i_0137;label = 3; break; } else { var $i_1_lcssa = $i_0137;label = 6; break; } //@line 397 "src/markdown.c"
  case 3: 
   var $i_196;
   var $3=(($data+$i_196)|0); //@line 397 "src/markdown.c"
   var $4=HEAP8[($3)]; //@line 397 "src/markdown.c"
   var $notlhs=(($4 << 24) >> 24)==(($c << 24) >> 24); //@line 397 "src/markdown.c"
   if ($notlhs) { var $i_1_lcssa = $i_196;label = 6; break; } else { label = 4; break; }
  case 4: 
   if ((($4 << 24) >> 24)==96 | (($4 << 24) >> 24)==91) {
    var $i_1_lcssa = $i_196;label = 6; break;
   }
   else {
   label = 5; break;
   }
  case 5: 
   var $6=((($i_196)+(1))|0); //@line 398 "src/markdown.c"
   var $7=(($6)>>>(0)) < (($size)>>>(0)); //@line 397 "src/markdown.c"
   if ($7) { var $i_196 = $6;label = 3; break; } else { var $i_1_lcssa = $6;label = 6; break; } //@line 397 "src/markdown.c"
  case 6: 
   var $i_1_lcssa;
   var $8=(($i_1_lcssa)|(0))==(($size)|(0)); //@line 400 "src/markdown.c"
   if ($8) { var $_0 = 0;label = 35; break; } else { label = 7; break; } //@line 400 "src/markdown.c"
  case 7: 
   var $10=(($data+$i_1_lcssa)|0); //@line 403 "src/markdown.c"
   var $11=HEAP8[($10)]; //@line 403 "src/markdown.c"
   var $12=(($11 << 24) >> 24)==(($c << 24) >> 24); //@line 403 "src/markdown.c"
   if ($12) { var $_0 = $i_1_lcssa;label = 35; break; } else { label = 8; break; } //@line 403 "src/markdown.c"
  case 8: 
   var $14=(($i_1_lcssa)|(0))==0; //@line 407 "src/markdown.c"
   if ($14) { label = 12; break; } else { label = 9; break; } //@line 407 "src/markdown.c"
  case 9: 
   var $16=((($i_1_lcssa)-(1))|0); //@line 407 "src/markdown.c"
   var $17=(($data+$16)|0); //@line 407 "src/markdown.c"
   var $18=HEAP8[($17)]; //@line 407 "src/markdown.c"
   var $19=(($18 << 24) >> 24)==92; //@line 407 "src/markdown.c"
   if ($19) { label = 10; break; } else { label = 12; break; } //@line 407 "src/markdown.c"
  case 10: 
   var $21=((($i_1_lcssa)+(1))|0); //@line 408 "src/markdown.c"
   var $i_0_be = $21;label = 11; break; //@line 408 "src/markdown.c"
  case 11: 
   var $i_0_be;
   var $22=(($i_0_be)>>>(0)) < (($size)>>>(0)); //@line 396 "src/markdown.c"
   if ($22) { var $i_0137 = $i_0_be;label = 2; break; } else { var $_0 = 0;label = 35; break; } //@line 396 "src/markdown.c"
  case 12: 
   if ((($11 << 24) >> 24)==96) {
    label = 13; break;
   }
   else if ((($11 << 24) >> 24)==91) {
    label = 14; break;
   }
   else {
   var $i_0_be = $i_1_lcssa;label = 11; break;
   }
  case 13: 
   var $24=(($i_1_lcssa)>>>(0)) < (($size)>>>(0)); //@line 416 "src/markdown.c"
   if ($24) { var $i_2121 = $i_1_lcssa;var $span_nb_0122 = 0;var $26 = 1;label = 15; break; } else { var $_0 = 0;label = 35; break; } //@line 416 "src/markdown.c"
  case 14: 
   var $i_498=((($i_1_lcssa)+(1))|0); //@line 438 "src/markdown.c"
   var $25=(($i_498)>>>(0)) < (($size)>>>(0)); //@line 439 "src/markdown.c"
   if ($25) { var $i_4_in99 = $i_1_lcssa;var $tmp_i1_0100 = 0;var $i_4101 = $i_498;label = 23; break; } else { var $i_4_in_lcssa = $i_1_lcssa;var $tmp_i1_0_lcssa = 0;label = 25; break; } //@line 439 "src/markdown.c"
  case 15: 
   var $26;
   var $span_nb_0122;
   var $i_2121;
   if ($26) { label = 16; break; } else { label = 18; break; }
  case 16: 
   var $28=((($i_2121)+(1))|0); //@line 417 "src/markdown.c"
   var $29=(($28)>>>(0)) < (($size)>>>(0)); //@line 416 "src/markdown.c"
   if ($29) { label = 17; break; } else { var $_0 = 0;label = 35; break; } //@line 416 "src/markdown.c"
  case 17: 
   var $30=((($span_nb_0122)+(1))|0); //@line 417 "src/markdown.c"
   var $_phi_trans_insert=(($data+$28)|0);
   var $_pre=HEAP8[($_phi_trans_insert)]; //@line 416 "src/markdown.c"
   var $phitmp=(($_pre << 24) >> 24)==96; //@line 416 "src/markdown.c"
   var $i_2121 = $28;var $span_nb_0122 = $30;var $26 = $phitmp;label = 15; break; //@line 416 "src/markdown.c"
  case 18: 
   var $31=(($i_2121)>>>(0)) < (($size)>>>(0)); //@line 424 "src/markdown.c"
   var $32=(($span_nb_0122)|(0))!=0; //@line 424 "src/markdown.c"
   var $or_cond88124=$31 & $32; //@line 424 "src/markdown.c"
   if ($or_cond88124) { var $i_3125 = $i_2121;var $bt_0126 = 0;var $tmp_i_0127 = 0;label = 19; break; } else { var $i_3_lcssa = $i_2121;var $tmp_i_0_lcssa = 0;var $_lcssa = $31;label = 22; break; } //@line 424 "src/markdown.c"
  case 19: 
   var $tmp_i_0127;
   var $bt_0126;
   var $i_3125;
   var $33=(($tmp_i_0127)|(0))==0; //@line 425 "src/markdown.c"
   var $34=(($data+$i_3125)|0); //@line 425 "src/markdown.c"
   var $35=HEAP8[($34)]; //@line 425 "src/markdown.c"
   if ($33) { label = 20; break; } else { var $tmp_i_1 = $tmp_i_0127;label = 21; break; } //@line 425 "src/markdown.c"
  case 20: 
   var $37=(($35 << 24) >> 24)==(($c << 24) >> 24); //@line 425 "src/markdown.c"
   var $i_3_tmp_i_0=$37 ? $i_3125 : 0; //@line 425 "src/markdown.c"
   var $tmp_i_1 = $i_3_tmp_i_0;label = 21; break; //@line 425 "src/markdown.c"
  case 21: 
   var $tmp_i_1;
   var $38=(($35 << 24) >> 24)==96; //@line 426 "src/markdown.c"
   var $39=((($bt_0126)+(1))|0); //@line 426 "src/markdown.c"
   var $bt_1=$38 ? $39 : 0; //@line 426 "src/markdown.c"
   var $40=((($i_3125)+(1))|0); //@line 428 "src/markdown.c"
   var $41=(($40)>>>(0)) < (($size)>>>(0)); //@line 424 "src/markdown.c"
   var $42=(($bt_1)>>>(0)) < (($span_nb_0122)>>>(0)); //@line 424 "src/markdown.c"
   var $or_cond88=$41 & $42; //@line 424 "src/markdown.c"
   if ($or_cond88) { var $i_3125 = $40;var $bt_0126 = $bt_1;var $tmp_i_0127 = $tmp_i_1;label = 19; break; } else { var $i_3_lcssa = $40;var $tmp_i_0_lcssa = $tmp_i_1;var $_lcssa = $41;label = 22; break; } //@line 424 "src/markdown.c"
  case 22: 
   var $_lcssa;
   var $tmp_i_0_lcssa;
   var $i_3_lcssa;
   if ($_lcssa) { var $i_0_be = $i_3_lcssa;label = 11; break; } else { var $_0 = $tmp_i_0_lcssa;label = 35; break; } //@line 431 "src/markdown.c"
  case 23: 
   var $i_4101;
   var $tmp_i1_0100;
   var $i_4_in99;
   var $43=(($data+$i_4101)|0); //@line 439 "src/markdown.c"
   var $44=HEAP8[($43)]; //@line 439 "src/markdown.c"
   var $45=(($44 << 24) >> 24)==93; //@line 439 "src/markdown.c"
   if ($45) { var $i_4_in_lcssa = $i_4_in99;var $tmp_i1_0_lcssa = $tmp_i1_0100;label = 25; break; } else { label = 24; break; }
  case 24: 
   var $47=(($tmp_i1_0100)|(0))==0; //@line 440 "src/markdown.c"
   var $48=(($44 << 24) >> 24)==(($c << 24) >> 24); //@line 440 "src/markdown.c"
   var $or_cond89=$47 & $48; //@line 440 "src/markdown.c"
   var $tmp_i1_1=$or_cond89 ? $i_4101 : $tmp_i1_0100; //@line 440 "src/markdown.c"
   var $i_4=((($i_4101)+(1))|0); //@line 438 "src/markdown.c"
   var $49=(($i_4)>>>(0)) < (($size)>>>(0)); //@line 439 "src/markdown.c"
   if ($49) { var $i_4_in99 = $i_4101;var $tmp_i1_0100 = $tmp_i1_1;var $i_4101 = $i_4;label = 23; break; } else { var $i_4_in_lcssa = $i_4101;var $tmp_i1_0_lcssa = $tmp_i1_1;label = 25; break; } //@line 439 "src/markdown.c"
  case 25: 
   var $tmp_i1_0_lcssa;
   var $i_4_in_lcssa;
   var $50=((($i_4_in_lcssa)+(2))|0); //@line 444 "src/markdown.c"
   var $51=(($50)>>>(0)) < (($size)>>>(0)); //@line 445 "src/markdown.c"
   if ($51) { var $i_5106 = $50;label = 26; break; } else { var $_0 = $tmp_i1_0_lcssa;label = 35; break; } //@line 445 "src/markdown.c"
  case 26: 
   var $i_5106;
   var $52=(($data+$i_5106)|0); //@line 445 "src/markdown.c"
   var $53=HEAP8[($52)]; //@line 445 "src/markdown.c"
   if ((($53 << 24) >> 24)==32 | (($53 << 24) >> 24)==10) {
    label = 27; break;
   }
   else {
   label = 28; break;
   }
  case 27: 
   var $55=((($i_5106)+(1))|0); //@line 446 "src/markdown.c"
   var $56=(($55)>>>(0)) < (($size)>>>(0)); //@line 445 "src/markdown.c"
   if ($56) { var $i_5106 = $55;label = 26; break; } else { var $_0 = $tmp_i1_0_lcssa;label = 35; break; } //@line 445 "src/markdown.c"
  case 28: 
   var $58=(($53)&(255)); //@line 451 "src/markdown.c"
   if ((($58)|(0))==40) {
    label = 29; break;
   }
   else if ((($58)|(0))==91) {
    var $cc_0 = 93;label = 31; break;
   }
   else {
   label = 30; break;
   }
  case 29: 
   var $cc_0 = 41;label = 31; break; //@line 456 "src/markdown.c"
  case 30: 
   var $61=(($tmp_i1_0_lcssa)|(0))==0; //@line 459 "src/markdown.c"
   if ($61) { var $i_0_be = $i_5106;label = 11; break; } else { var $_0 = $tmp_i1_0_lcssa;label = 35; break; } //@line 459 "src/markdown.c"
  case 31: 
   var $cc_0;
   var $i_6111=((($i_5106)+(1))|0); //@line 465 "src/markdown.c"
   var $63=(($i_6111)>>>(0)) < (($size)>>>(0)); //@line 466 "src/markdown.c"
   if ($63) { var $i_6_in112 = $i_5106;var $tmp_i1_2113 = $tmp_i1_0_lcssa;var $i_6114 = $i_6111;label = 32; break; } else { var $_0 = $tmp_i1_0_lcssa;label = 35; break; } //@line 466 "src/markdown.c"
  case 32: 
   var $i_6114;
   var $tmp_i1_2113;
   var $i_6_in112;
   var $64=(($data+$i_6114)|0); //@line 466 "src/markdown.c"
   var $65=HEAP8[($64)]; //@line 466 "src/markdown.c"
   var $66=(($65)&(255)); //@line 466 "src/markdown.c"
   var $67=(($66)|(0))==(($cc_0)|(0)); //@line 466 "src/markdown.c"
   if ($67) { label = 34; break; } else { label = 33; break; }
  case 33: 
   var $69=(($tmp_i1_2113)|(0))==0; //@line 467 "src/markdown.c"
   var $70=(($65 << 24) >> 24)==(($c << 24) >> 24); //@line 467 "src/markdown.c"
   var $or_cond91=$69 & $70; //@line 467 "src/markdown.c"
   var $tmp_i1_3=$or_cond91 ? $i_6114 : $tmp_i1_2113; //@line 467 "src/markdown.c"
   var $i_6=((($i_6114)+(1))|0); //@line 465 "src/markdown.c"
   var $71=(($i_6)>>>(0)) < (($size)>>>(0)); //@line 466 "src/markdown.c"
   if ($71) { var $i_6_in112 = $i_6114;var $tmp_i1_2113 = $tmp_i1_3;var $i_6114 = $i_6;label = 32; break; } else { var $_0 = $tmp_i1_3;label = 35; break; } //@line 466 "src/markdown.c"
  case 34: 
   var $73=((($i_6_in112)+(2))|0); //@line 474 "src/markdown.c"
   var $i_0_be = $73;label = 11; break; //@line 475 "src/markdown.c"
  case 35: 
   var $_0;
   return $_0; //@line 479 "src/markdown.c"
  default: assert(0, "bad label: " + label);
 }
}
function _char_superscript($ob, $rndr, $data, $offset, $size) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($rndr+84)|0); //@line 1082 "src/markdown.c"
   var $2=HEAP32[(($1)>>2)]; //@line 1082 "src/markdown.c"
   var $3=(($2)|(0))==0; //@line 1082 "src/markdown.c"
   var $4=(($size)>>>(0)) < 2; //@line 1085 "src/markdown.c"
   var $or_cond=$3 | $4; //@line 1082 "src/markdown.c"
   if ($or_cond) { var $_0 = 0;label = 18; break; } else { label = 2; break; } //@line 1082 "src/markdown.c"
  case 2: 
   var $6=(($data+1)|0); //@line 1088 "src/markdown.c"
   var $7=HEAP8[($6)]; //@line 1088 "src/markdown.c"
   var $8=(($7 << 24) >> 24)==40; //@line 1088 "src/markdown.c"
   if ($8) { var $sup_len_0 = 2;label = 4; break; } else { label = 3; break; } //@line 1088 "src/markdown.c"
  case 3: 
   var $9=(($size)>>>(0)) > 1; //@line 1099 "src/markdown.c"
   if ($9) { var $sup_len_134 = 1;var $22 = $7;label = 8; break; } else { var $sup_start_036 = 1;label = 12; break; } //@line 1099 "src/markdown.c"
  case 4: 
   var $sup_len_0;
   var $10=(($sup_len_0)>>>(0)) < (($size)>>>(0)); //@line 1091 "src/markdown.c"
   if ($10) { label = 5; break; } else { label = 7; break; } //@line 1091 "src/markdown.c"
  case 5: 
   var $12=(($data+$sup_len_0)|0); //@line 1091 "src/markdown.c"
   var $13=HEAP8[($12)]; //@line 1091 "src/markdown.c"
   var $14=(($13 << 24) >> 24)==41; //@line 1091 "src/markdown.c"
   if ($14) { label = 7; break; } else { label = 6; break; } //@line 1091 "src/markdown.c"
  case 6: 
   var $16=((($sup_len_0)-(1))|0); //@line 1091 "src/markdown.c"
   var $17=(($data+$16)|0); //@line 1091 "src/markdown.c"
   var $18=HEAP8[($17)]; //@line 1091 "src/markdown.c"
   var $19=(($18 << 24) >> 24)==92; //@line 1091 "src/markdown.c"
   var $20=((($sup_len_0)+(1))|0); //@line 1092 "src/markdown.c"
   if ($19) { label = 7; break; } else { var $sup_len_0 = $20;label = 4; break; }
  case 7: 
   var $21=(($sup_len_0)|(0))==(($size)|(0)); //@line 1094 "src/markdown.c"
   if ($21) { var $_0 = 0;label = 18; break; } else { var $sup_len_2 = $sup_len_0;var $sup_start_0 = 2;label = 11; break; } //@line 1094 "src/markdown.c"
  case 8: 
   var $22;
   var $sup_len_134;
   if ((($22 << 24) >> 24)==32 | (($22 << 24) >> 24)==10) {
    var $sup_len_2 = $sup_len_134;var $sup_start_0 = 1;label = 11; break;
   }
   else {
   label = 9; break;
   }
  case 9: 
   var $24=((($sup_len_134)+(1))|0); //@line 1100 "src/markdown.c"
   var $25=(($24)>>>(0)) < (($size)>>>(0)); //@line 1099 "src/markdown.c"
   if ($25) { label = 10; break; } else { var $sup_len_2 = $24;var $sup_start_0 = 1;label = 11; break; } //@line 1099 "src/markdown.c"
  case 10: 
   var $_phi_trans_insert=(($data+$24)|0);
   var $_pre=HEAP8[($_phi_trans_insert)]; //@line 1099 "src/markdown.c"
   var $sup_len_134 = $24;var $22 = $_pre;label = 8; break; //@line 1099 "src/markdown.c"
  case 11: 
   var $sup_start_0;
   var $sup_len_2;
   var $26=(($sup_len_2)|(0))==(($sup_start_0)|(0)); //@line 1103 "src/markdown.c"
   if ($26) { var $sup_start_036 = $sup_start_0;label = 12; break; } else { label = 13; break; } //@line 1103 "src/markdown.c"
  case 12: 
   var $sup_start_036;
   var $27=(($sup_start_036)|(0))==2; //@line 1104 "src/markdown.c"
   var $28=$27 ? 3 : 0; //@line 1104 "src/markdown.c"
   var $_0 = $28;label = 18; break; //@line 1104 "src/markdown.c"
  case 13: 
   var $30=((($sup_len_2)-($sup_start_0))|0); //@line 1103 "src/markdown.c"
   var $31=(($rndr+408)|0); //@line 130 "src/markdown.c"
   var $32=(($rndr+412)|0); //@line 132 "src/markdown.c"
   var $33=HEAP32[(($32)>>2)]; //@line 132 "src/markdown.c"
   var $34=(($rndr+416)|0); //@line 132 "src/markdown.c"
   var $35=HEAP32[(($34)>>2)]; //@line 132 "src/markdown.c"
   var $36=(($33)>>>(0)) < (($35)>>>(0)); //@line 132 "src/markdown.c"
   if ($36) { label = 14; break; } else { label = 16; break; } //@line 132 "src/markdown.c"
  case 14: 
   var $38=(($31)|0); //@line 132 "src/markdown.c"
   var $39=HEAP32[(($38)>>2)]; //@line 132 "src/markdown.c"
   var $40=(($39+($33<<2))|0); //@line 132 "src/markdown.c"
   var $41=HEAP32[(($40)>>2)]; //@line 132 "src/markdown.c"
   var $42=(($41)|(0))==0; //@line 132 "src/markdown.c"
   if ($42) { label = 16; break; } else { label = 15; break; } //@line 132 "src/markdown.c"
  case 15: 
   var $44=((($33)+(1))|0); //@line 134 "src/markdown.c"
   HEAP32[(($32)>>2)]=$44; //@line 134 "src/markdown.c"
   var $45=HEAP32[(($40)>>2)]; //@line 134 "src/markdown.c"
   var $46=$45; //@line 134 "src/markdown.c"
   var $47=(($45+4)|0); //@line 135 "src/markdown.c"
   var $48=$47; //@line 135 "src/markdown.c"
   HEAP32[(($48)>>2)]=0; //@line 135 "src/markdown.c"
   var $work_0_i = $46;label = 17; break; //@line 136 "src/markdown.c"
  case 16: 
   var $50=_bufnew(64); //@line 137 "src/markdown.c"
   var $51=$50; //@line 138 "src/markdown.c"
   var $52=_stack_push($31, $51); //@line 138 "src/markdown.c"
   var $work_0_i = $50;label = 17; break;
  case 17: 
   var $work_0_i;
   var $53=(($data+$sup_start_0)|0); //@line 1107 "src/markdown.c"
   _parse_inline($work_0_i, $rndr, $53, $30); //@line 1107 "src/markdown.c"
   var $54=HEAP32[(($1)>>2)]; //@line 1108 "src/markdown.c"
   var $55=(($rndr+104)|0); //@line 1108 "src/markdown.c"
   var $56=HEAP32[(($55)>>2)]; //@line 1108 "src/markdown.c"
   var $57=FUNCTION_TABLE[$54]($ob, $work_0_i, $56); //@line 1108 "src/markdown.c"
   var $58=HEAP32[(($32)>>2)]; //@line 147 "src/markdown.c"
   var $59=((($58)-(1))|0); //@line 147 "src/markdown.c"
   HEAP32[(($32)>>2)]=$59; //@line 147 "src/markdown.c"
   var $60=(($sup_start_0)|(0))==2; //@line 1111 "src/markdown.c"
   var $61=(($60)&(1)); //@line 1111 "src/markdown.c"
   var $62=((($61)+($sup_len_2))|0); //@line 1111 "src/markdown.c"
   var $_0 = $62;label = 18; break; //@line 1111 "src/markdown.c"
  case 18: 
   var $_0;
   return $_0; //@line 1112 "src/markdown.c"
  default: assert(0, "bad label: " + label);
 }
}
function _parse_emph1($ob, $rndr, $data, $size, $c) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($rndr+56)|0); //@line 490 "src/markdown.c"
   var $2=HEAP32[(($1)>>2)]; //@line 490 "src/markdown.c"
   var $3=(($2)|(0))==0; //@line 490 "src/markdown.c"
   if ($3) { var $_0 = 0;label = 19; break; } else { label = 2; break; } //@line 490 "src/markdown.c"
  case 2: 
   var $5=(($size)>>>(0)) > 1; //@line 493 "src/markdown.c"
   if ($5) { label = 3; break; } else { var $i_0_ph = 0;label = 5; break; } //@line 493 "src/markdown.c"
  case 3: 
   var $7=HEAP8[($data)]; //@line 493 "src/markdown.c"
   var $8=(($7 << 24) >> 24)==(($c << 24) >> 24); //@line 493 "src/markdown.c"
   if ($8) { label = 4; break; } else { var $i_0_ph = 0;label = 5; break; } //@line 493 "src/markdown.c"
  case 4: 
   var $10=(($data+1)|0); //@line 493 "src/markdown.c"
   var $11=HEAP8[($10)]; //@line 493 "src/markdown.c"
   var $12=(($11 << 24) >> 24)==(($c << 24) >> 24); //@line 493 "src/markdown.c"
   var $_=(($12)&(1)); //@line 493 "src/markdown.c"
   var $i_0_ph = $_;label = 5; break; //@line 493 "src/markdown.c"
  case 5: 
   var $i_0_ph;
   var $13=(($i_0_ph)>>>(0)) < (($size)>>>(0)); //@line 495 "src/markdown.c"
   if ($13) { label = 6; break; } else { var $_0 = 0;label = 19; break; } //@line 495 "src/markdown.c"
  case 6: 
   var $14=(($rndr+420)|0); //@line 503 "src/markdown.c"
   var $i_038 = $i_0_ph;label = 7; break; //@line 495 "src/markdown.c"
  case 7: 
   var $i_038;
   var $15=(($data+$i_038)|0); //@line 496 "src/markdown.c"
   var $16=((($size)-($i_038))|0); //@line 496 "src/markdown.c"
   var $17=_find_emph_char($15, $16, $c); //@line 496 "src/markdown.c"
   var $18=(($17)|(0))==0; //@line 497 "src/markdown.c"
   if ($18) { var $_0 = 0;label = 19; break; } else { label = 8; break; } //@line 497 "src/markdown.c"
  case 8: 
   var $20=((($17)+($i_038))|0); //@line 498 "src/markdown.c"
   var $21=(($20)>>>(0)) < (($size)>>>(0)); //@line 499 "src/markdown.c"
   if ($21) { label = 9; break; } else { var $_0 = 0;label = 19; break; } //@line 499 "src/markdown.c"
  case 9: 
   var $23=(($data+$20)|0); //@line 501 "src/markdown.c"
   var $24=HEAP8[($23)]; //@line 501 "src/markdown.c"
   var $25=(($24 << 24) >> 24)==(($c << 24) >> 24); //@line 501 "src/markdown.c"
   if ($25) { label = 10; break; } else { var $i_038 = $20;label = 7; break; } //@line 501 "src/markdown.c"
  case 10: 
   var $27=((($20)-(1))|0); //@line 501 "src/markdown.c"
   var $28=(($data+$27)|0); //@line 501 "src/markdown.c"
   var $29=HEAP8[($28)]; //@line 501 "src/markdown.c"
   if ((($29 << 24) >> 24)==32 | (($29 << 24) >> 24)==10) {
    var $i_038 = $20;label = 7; break;
   }
   else {
   label = 11; break;
   }
  case 11: 
   var $31=HEAP32[(($14)>>2)]; //@line 503 "src/markdown.c"
   var $32=$31 & 1; //@line 503 "src/markdown.c"
   var $33=(($32)|(0))==0; //@line 503 "src/markdown.c"
   if ($33) { label = 14; break; } else { label = 12; break; } //@line 503 "src/markdown.c"
  case 12: 
   var $35=((($20)+(1))|0); //@line 504 "src/markdown.c"
   var $36=(($35)>>>(0)) < (($size)>>>(0)); //@line 504 "src/markdown.c"
   if ($36) { label = 13; break; } else { label = 14; break; } //@line 504 "src/markdown.c"
  case 13: 
   var $38=(($data+$35)|0); //@line 504 "src/markdown.c"
   var $39=HEAP8[($38)]; //@line 504 "src/markdown.c"
   var $40=(($39)&(255)); //@line 504 "src/markdown.c"
   var $41=_isalnum($40); //@line 504 "src/markdown.c"
   var $42=(($41)|(0))==0; //@line 504 "src/markdown.c"
   if ($42) { label = 14; break; } else { var $i_038 = $20;label = 7; break; } //@line 504 "src/markdown.c"
  case 14: 
   var $44=(($rndr+408)|0); //@line 130 "src/markdown.c"
   var $45=(($rndr+412)|0); //@line 132 "src/markdown.c"
   var $46=HEAP32[(($45)>>2)]; //@line 132 "src/markdown.c"
   var $47=(($rndr+416)|0); //@line 132 "src/markdown.c"
   var $48=HEAP32[(($47)>>2)]; //@line 132 "src/markdown.c"
   var $49=(($46)>>>(0)) < (($48)>>>(0)); //@line 132 "src/markdown.c"
   if ($49) { label = 15; break; } else { label = 17; break; } //@line 132 "src/markdown.c"
  case 15: 
   var $51=(($44)|0); //@line 132 "src/markdown.c"
   var $52=HEAP32[(($51)>>2)]; //@line 132 "src/markdown.c"
   var $53=(($52+($46<<2))|0); //@line 132 "src/markdown.c"
   var $54=HEAP32[(($53)>>2)]; //@line 132 "src/markdown.c"
   var $55=(($54)|(0))==0; //@line 132 "src/markdown.c"
   if ($55) { label = 17; break; } else { label = 16; break; } //@line 132 "src/markdown.c"
  case 16: 
   var $57=((($46)+(1))|0); //@line 134 "src/markdown.c"
   HEAP32[(($45)>>2)]=$57; //@line 134 "src/markdown.c"
   var $58=HEAP32[(($53)>>2)]; //@line 134 "src/markdown.c"
   var $59=$58; //@line 134 "src/markdown.c"
   var $60=(($58+4)|0); //@line 135 "src/markdown.c"
   var $61=$60; //@line 135 "src/markdown.c"
   HEAP32[(($61)>>2)]=0; //@line 135 "src/markdown.c"
   var $work_0_i = $59;label = 18; break; //@line 136 "src/markdown.c"
  case 17: 
   var $63=_bufnew(64); //@line 137 "src/markdown.c"
   var $64=$63; //@line 138 "src/markdown.c"
   var $65=_stack_push($44, $64); //@line 138 "src/markdown.c"
   var $work_0_i = $63;label = 18; break;
  case 18: 
   var $work_0_i;
   _parse_inline($work_0_i, $rndr, $data, $20); //@line 509 "src/markdown.c"
   var $66=HEAP32[(($1)>>2)]; //@line 510 "src/markdown.c"
   var $67=(($rndr+104)|0); //@line 510 "src/markdown.c"
   var $68=HEAP32[(($67)>>2)]; //@line 510 "src/markdown.c"
   var $69=FUNCTION_TABLE[$66]($ob, $work_0_i, $68); //@line 510 "src/markdown.c"
   var $70=HEAP32[(($45)>>2)]; //@line 147 "src/markdown.c"
   var $71=((($70)-(1))|0); //@line 147 "src/markdown.c"
   HEAP32[(($45)>>2)]=$71; //@line 147 "src/markdown.c"
   var $72=(($69)|(0))==0; //@line 512 "src/markdown.c"
   var $73=((($20)+(1))|0); //@line 512 "src/markdown.c"
   var $_37=$72 ? 0 : $73; //@line 512 "src/markdown.c"
   var $_0 = $_37;label = 19; break; //@line 512 "src/markdown.c"
  case 19: 
   var $_0;
   return $_0; //@line 517 "src/markdown.c"
  default: assert(0, "bad label: " + label);
 }
}
function _parse_emph2($ob, $rndr, $data, $size, $c) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($c << 24) >> 24)==126; //@line 528 "src/markdown.c"
   var $2=(($rndr+80)|0); //@line 528 "src/markdown.c"
   var $3=(($rndr+52)|0); //@line 528 "src/markdown.c"
   var $_in=$1 ? $2 : $3; //@line 528 "src/markdown.c"
   var $4=HEAP32[(($_in)>>2)]; //@line 528 "src/markdown.c"
   var $5=(($4)|(0))==0; //@line 530 "src/markdown.c"
   var $6=(($size)|(0))==0; //@line 533 "src/markdown.c"
   var $or_cond36=$5 | $6; //@line 530 "src/markdown.c"
   if ($or_cond36) { var $_0 = 0;label = 13; break; } else { var $i_033 = 0;label = 2; break; } //@line 530 "src/markdown.c"
  case 2: 
   var $i_033;
   var $7=(($data+$i_033)|0); //@line 534 "src/markdown.c"
   var $8=((($size)-($i_033))|0); //@line 534 "src/markdown.c"
   var $9=_find_emph_char($7, $8, $c); //@line 534 "src/markdown.c"
   var $10=(($9)|(0))==0; //@line 535 "src/markdown.c"
   if ($10) { var $_0 = 0;label = 13; break; } else { label = 3; break; } //@line 535 "src/markdown.c"
  case 3: 
   var $12=((($9)+($i_033))|0); //@line 536 "src/markdown.c"
   var $13=((($12)+(1))|0); //@line 538 "src/markdown.c"
   var $14=(($13)>>>(0)) < (($size)>>>(0)); //@line 538 "src/markdown.c"
   if ($14) { label = 4; break; } else { var $_0 = 0;label = 13; break; } //@line 538 "src/markdown.c"
  case 4: 
   var $16=(($data+$12)|0); //@line 538 "src/markdown.c"
   var $17=HEAP8[($16)]; //@line 538 "src/markdown.c"
   var $18=(($17 << 24) >> 24)==(($c << 24) >> 24); //@line 538 "src/markdown.c"
   if ($18) { label = 5; break; } else { var $i_033 = $13;label = 2; break; } //@line 538 "src/markdown.c"
  case 5: 
   var $20=(($data+$13)|0); //@line 538 "src/markdown.c"
   var $21=HEAP8[($20)]; //@line 538 "src/markdown.c"
   var $22=(($21 << 24) >> 24)!=(($c << 24) >> 24); //@line 538 "src/markdown.c"
   var $23=(($12)|(0))==0; //@line 538 "src/markdown.c"
   var $or_cond=$22 | $23; //@line 538 "src/markdown.c"
   if ($or_cond) { label = 6; break; } else { label = 7; break; } //@line 538 "src/markdown.c"
  case 6: 
   if ($14) { var $i_033 = $13;label = 2; break; } else { var $_0 = 0;label = 13; break; } //@line 533 "src/markdown.c"
  case 7: 
   var $25=((($12)-(1))|0); //@line 538 "src/markdown.c"
   var $26=(($data+$25)|0); //@line 538 "src/markdown.c"
   var $27=HEAP8[($26)]; //@line 538 "src/markdown.c"
   if ((($27 << 24) >> 24)==32 | (($27 << 24) >> 24)==10) {
    label = 6; break;
   }
   else {
   label = 8; break;
   }
  case 8: 
   var $29=(($rndr+408)|0); //@line 130 "src/markdown.c"
   var $30=(($rndr+412)|0); //@line 132 "src/markdown.c"
   var $31=HEAP32[(($30)>>2)]; //@line 132 "src/markdown.c"
   var $32=(($rndr+416)|0); //@line 132 "src/markdown.c"
   var $33=HEAP32[(($32)>>2)]; //@line 132 "src/markdown.c"
   var $34=(($31)>>>(0)) < (($33)>>>(0)); //@line 132 "src/markdown.c"
   if ($34) { label = 9; break; } else { label = 11; break; } //@line 132 "src/markdown.c"
  case 9: 
   var $36=(($29)|0); //@line 132 "src/markdown.c"
   var $37=HEAP32[(($36)>>2)]; //@line 132 "src/markdown.c"
   var $38=(($37+($31<<2))|0); //@line 132 "src/markdown.c"
   var $39=HEAP32[(($38)>>2)]; //@line 132 "src/markdown.c"
   var $40=(($39)|(0))==0; //@line 132 "src/markdown.c"
   if ($40) { label = 11; break; } else { label = 10; break; } //@line 132 "src/markdown.c"
  case 10: 
   var $42=((($31)+(1))|0); //@line 134 "src/markdown.c"
   HEAP32[(($30)>>2)]=$42; //@line 134 "src/markdown.c"
   var $43=HEAP32[(($38)>>2)]; //@line 134 "src/markdown.c"
   var $44=$43; //@line 134 "src/markdown.c"
   var $45=(($43+4)|0); //@line 135 "src/markdown.c"
   var $46=$45; //@line 135 "src/markdown.c"
   HEAP32[(($46)>>2)]=0; //@line 135 "src/markdown.c"
   var $work_0_i = $44;label = 12; break; //@line 136 "src/markdown.c"
  case 11: 
   var $48=_bufnew(64); //@line 137 "src/markdown.c"
   var $49=$48; //@line 138 "src/markdown.c"
   var $50=_stack_push($29, $49); //@line 138 "src/markdown.c"
   var $work_0_i = $48;label = 12; break;
  case 12: 
   var $work_0_i;
   _parse_inline($work_0_i, $rndr, $data, $12); //@line 540 "src/markdown.c"
   var $51=(($rndr+104)|0); //@line 541 "src/markdown.c"
   var $52=HEAP32[(($51)>>2)]; //@line 541 "src/markdown.c"
   var $53=FUNCTION_TABLE[$4]($ob, $work_0_i, $52); //@line 541 "src/markdown.c"
   var $54=HEAP32[(($30)>>2)]; //@line 147 "src/markdown.c"
   var $55=((($54)-(1))|0); //@line 147 "src/markdown.c"
   HEAP32[(($30)>>2)]=$55; //@line 147 "src/markdown.c"
   var $56=(($53)|(0))==0; //@line 543 "src/markdown.c"
   var $57=((($12)+(2))|0); //@line 543 "src/markdown.c"
   var $_=$56 ? 0 : $57; //@line 543 "src/markdown.c"
   var $_0 = $_;label = 13; break; //@line 543 "src/markdown.c"
  case 13: 
   var $_0;
   return $_0; //@line 548 "src/markdown.c"
  default: assert(0, "bad label: " + label);
 }
}
function _parse_table_row($ob, $rndr, $data, $size, $columns, $col_data, $header_flag) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 16)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $empty_cell=sp;
   var $1=(($rndr+40)|0); //@line 1995 "src/markdown.c"
   var $2=HEAP32[(($1)>>2)]; //@line 1995 "src/markdown.c"
   var $3=(($2)|(0))==0; //@line 1995 "src/markdown.c"
   if ($3) { label = 30; break; } else { label = 2; break; } //@line 1995 "src/markdown.c"
  case 2: 
   var $5=(($rndr+36)|0); //@line 1995 "src/markdown.c"
   var $6=HEAP32[(($5)>>2)]; //@line 1995 "src/markdown.c"
   var $7=(($6)|(0))==0; //@line 1995 "src/markdown.c"
   if ($7) { label = 30; break; } else { label = 3; break; } //@line 1995 "src/markdown.c"
  case 3: 
   var $9=(($rndr+408)|0); //@line 130 "src/markdown.c"
   var $10=(($rndr+412)|0); //@line 132 "src/markdown.c"
   var $11=HEAP32[(($10)>>2)]; //@line 132 "src/markdown.c"
   var $12=(($rndr+416)|0); //@line 132 "src/markdown.c"
   var $13=HEAP32[(($12)>>2)]; //@line 132 "src/markdown.c"
   var $14=(($11)>>>(0)) < (($13)>>>(0)); //@line 132 "src/markdown.c"
   if ($14) { label = 4; break; } else { label = 6; break; } //@line 132 "src/markdown.c"
  case 4: 
   var $16=(($9)|0); //@line 132 "src/markdown.c"
   var $17=HEAP32[(($16)>>2)]; //@line 132 "src/markdown.c"
   var $18=(($17+($11<<2))|0); //@line 132 "src/markdown.c"
   var $19=HEAP32[(($18)>>2)]; //@line 132 "src/markdown.c"
   var $20=(($19)|(0))==0; //@line 132 "src/markdown.c"
   if ($20) { label = 6; break; } else { label = 5; break; } //@line 132 "src/markdown.c"
  case 5: 
   var $22=((($11)+(1))|0); //@line 134 "src/markdown.c"
   HEAP32[(($10)>>2)]=$22; //@line 134 "src/markdown.c"
   var $23=HEAP32[(($18)>>2)]; //@line 134 "src/markdown.c"
   var $24=$23; //@line 134 "src/markdown.c"
   var $25=(($23+4)|0); //@line 135 "src/markdown.c"
   var $26=$25; //@line 135 "src/markdown.c"
   HEAP32[(($26)>>2)]=0; //@line 135 "src/markdown.c"
   var $work_0_i = $24;label = 7; break; //@line 136 "src/markdown.c"
  case 6: 
   var $28=_bufnew(64); //@line 137 "src/markdown.c"
   var $29=$28; //@line 138 "src/markdown.c"
   var $30=_stack_push($9, $29); //@line 138 "src/markdown.c"
   var $work_0_i = $28;label = 7; break;
  case 7: 
   var $work_0_i;
   var $31=(($size)|(0))==0; //@line 2000 "src/markdown.c"
   if ($31) { var $i_1_ph = 0;label = 9; break; } else { label = 8; break; } //@line 2000 "src/markdown.c"
  case 8: 
   var $33=HEAP8[($data)]; //@line 2000 "src/markdown.c"
   var $34=(($33 << 24) >> 24)==124; //@line 2000 "src/markdown.c"
   var $_=(($34)&(1)); //@line 2000 "src/markdown.c"
   var $i_1_ph = $_;label = 9; break; //@line 2000 "src/markdown.c"
  case 9: 
   var $i_1_ph;
   var $35=(($columns)|(0))!=0; //@line 2003 "src/markdown.c"
   var $36=(($i_1_ph)>>>(0)) < (($size)>>>(0)); //@line 2003 "src/markdown.c"
   var $or_cond67=$35 & $36; //@line 2003 "src/markdown.c"
   if ($or_cond67) { label = 10; break; } else { var $col_0_lcssa = 0;label = 11; break; } //@line 2003 "src/markdown.c"
  case 10: 
   var $37=(($9)|0); //@line 132 "src/markdown.c"
   var $38=(($rndr+104)|0); //@line 2023 "src/markdown.c"
   var $_pre=HEAP32[(($10)>>2)]; //@line 132 "src/markdown.c"
   var $col_068 = 0;var $i_169 = $i_1_ph;var $43 = $_pre;label = 14; break; //@line 2003 "src/markdown.c"
  case 11: 
   var $col_0_lcssa;
   var $39=(($col_0_lcssa)>>>(0)) < (($columns)>>>(0)); //@line 2029 "src/markdown.c"
   if ($39) { label = 13; break; } else { label = 12; break; } //@line 2029 "src/markdown.c"
  case 12: 
   var $_pre76=(($rndr+104)|0); //@line 2034 "src/markdown.c"
   var $_pre_phi = $_pre76;label = 29; break; //@line 2029 "src/markdown.c"
  case 13: 
   var $40=$empty_cell; //@line 2030 "src/markdown.c"
   var $41=(($rndr+104)|0); //@line 2031 "src/markdown.c"
   var $col_159 = $col_0_lcssa;label = 28; break; //@line 2029 "src/markdown.c"
  case 14: 
   var $43;
   var $i_169;
   var $col_068;
   var $44=HEAP32[(($12)>>2)]; //@line 132 "src/markdown.c"
   var $45=(($43)>>>(0)) < (($44)>>>(0)); //@line 132 "src/markdown.c"
   if ($45) { label = 15; break; } else { label = 17; break; } //@line 132 "src/markdown.c"
  case 15: 
   var $47=HEAP32[(($37)>>2)]; //@line 132 "src/markdown.c"
   var $48=(($47+($43<<2))|0); //@line 132 "src/markdown.c"
   var $49=HEAP32[(($48)>>2)]; //@line 132 "src/markdown.c"
   var $50=(($49)|(0))==0; //@line 132 "src/markdown.c"
   if ($50) { label = 17; break; } else { label = 16; break; } //@line 132 "src/markdown.c"
  case 16: 
   var $52=((($43)+(1))|0); //@line 134 "src/markdown.c"
   HEAP32[(($10)>>2)]=$52; //@line 134 "src/markdown.c"
   var $53=HEAP32[(($48)>>2)]; //@line 134 "src/markdown.c"
   var $54=$53; //@line 134 "src/markdown.c"
   var $55=(($53+4)|0); //@line 135 "src/markdown.c"
   var $56=$55; //@line 135 "src/markdown.c"
   HEAP32[(($56)>>2)]=0; //@line 135 "src/markdown.c"
   var $work_0_i55 = $54;label = 18; break; //@line 136 "src/markdown.c"
  case 17: 
   var $58=_bufnew(64); //@line 137 "src/markdown.c"
   var $59=$58; //@line 138 "src/markdown.c"
   var $60=_stack_push($9, $59); //@line 138 "src/markdown.c"
   var $work_0_i55 = $58;label = 18; break;
  case 18: 
   var $work_0_i55;
   var $61=(($i_169)>>>(0)) < (($size)>>>(0)); //@line 2009 "src/markdown.c"
   if ($61) { var $i_260 = $i_169;label = 19; break; } else { var $i_2_lcssa = $i_169;label = 21; break; } //@line 2009 "src/markdown.c"
  case 19: 
   var $i_260;
   var $62=(($data+$i_260)|0); //@line 2009 "src/markdown.c"
   var $63=HEAP8[($62)]; //@line 2009 "src/markdown.c"
   if ((($63 << 24) >> 24)==32 | (($63 << 24) >> 24)==10) {
    label = 20; break;
   }
   else {
   var $i_2_lcssa = $i_260;label = 21; break;
   }
  case 20: 
   var $64=((($i_260)+(1))|0); //@line 2010 "src/markdown.c"
   var $65=(($64)>>>(0)) < (($size)>>>(0)); //@line 2009 "src/markdown.c"
   if ($65) { var $i_260 = $64;label = 19; break; } else { var $i_2_lcssa = $64;label = 21; break; } //@line 2009 "src/markdown.c"
  case 21: 
   var $i_2_lcssa;
   var $i_3 = $i_2_lcssa;label = 22; break;
  case 22: 
   var $i_3;
   var $66=(($i_3)>>>(0)) < (($size)>>>(0)); //@line 2014 "src/markdown.c"
   if ($66) { label = 23; break; } else { label = 24; break; } //@line 2014 "src/markdown.c"
  case 23: 
   var $68=(($data+$i_3)|0); //@line 2014 "src/markdown.c"
   var $69=HEAP8[($68)]; //@line 2014 "src/markdown.c"
   var $70=(($69 << 24) >> 24)==124; //@line 2014 "src/markdown.c"
   var $71=((($i_3)+(1))|0); //@line 2015 "src/markdown.c"
   if ($70) { label = 24; break; } else { var $i_3 = $71;label = 22; break; }
  case 24: 
   var $cell_end_062=((($i_3)-(1))|0); //@line 2017 "src/markdown.c"
   var $72=(($cell_end_062)>>>(0)) > (($i_2_lcssa)>>>(0)); //@line 2019 "src/markdown.c"
   if ($72) { var $cell_end_0_in63 = $i_3;var $cell_end_064 = $cell_end_062;label = 25; break; } else { var $cell_end_0_in_lcssa = $i_3;label = 27; break; } //@line 2019 "src/markdown.c"
  case 25: 
   var $cell_end_064;
   var $cell_end_0_in63;
   var $73=(($data+$cell_end_064)|0); //@line 2019 "src/markdown.c"
   var $74=HEAP8[($73)]; //@line 2019 "src/markdown.c"
   if ((($74 << 24) >> 24)==32 | (($74 << 24) >> 24)==10) {
    label = 26; break;
   }
   else {
   var $cell_end_0_in_lcssa = $cell_end_0_in63;label = 27; break;
   }
  case 26: 
   var $cell_end_0=((($cell_end_064)-(1))|0); //@line 2017 "src/markdown.c"
   var $75=(($cell_end_0)>>>(0)) > (($i_2_lcssa)>>>(0)); //@line 2019 "src/markdown.c"
   if ($75) { var $cell_end_0_in63 = $cell_end_064;var $cell_end_064 = $cell_end_0;label = 25; break; } else { var $cell_end_0_in_lcssa = $cell_end_064;label = 27; break; } //@line 2019 "src/markdown.c"
  case 27: 
   var $cell_end_0_in_lcssa;
   var $76=(($data+$i_2_lcssa)|0); //@line 2022 "src/markdown.c"
   var $77=((($cell_end_0_in_lcssa)-($i_2_lcssa))|0); //@line 2022 "src/markdown.c"
   _parse_inline($work_0_i55, $rndr, $76, $77); //@line 2022 "src/markdown.c"
   var $78=HEAP32[(($1)>>2)]; //@line 2023 "src/markdown.c"
   var $79=(($col_data+($col_068<<2))|0); //@line 2023 "src/markdown.c"
   var $80=HEAP32[(($79)>>2)]; //@line 2023 "src/markdown.c"
   var $81=$80 | $header_flag; //@line 2023 "src/markdown.c"
   var $82=HEAP32[(($38)>>2)]; //@line 2023 "src/markdown.c"
   FUNCTION_TABLE[$78]($work_0_i, $work_0_i55, $81, $82); //@line 2023 "src/markdown.c"
   var $83=HEAP32[(($10)>>2)]; //@line 147 "src/markdown.c"
   var $84=((($83)-(1))|0); //@line 147 "src/markdown.c"
   HEAP32[(($10)>>2)]=$84; //@line 147 "src/markdown.c"
   var $85=((($i_3)+(1))|0); //@line 2026 "src/markdown.c"
   var $86=((($col_068)+(1))|0); //@line 2003 "src/markdown.c"
   var $87=(($86)>>>(0)) < (($columns)>>>(0)); //@line 2003 "src/markdown.c"
   var $88=(($85)>>>(0)) < (($size)>>>(0)); //@line 2003 "src/markdown.c"
   var $or_cond=$87 & $88; //@line 2003 "src/markdown.c"
   if ($or_cond) { var $col_068 = $86;var $i_169 = $85;var $43 = $84;label = 14; break; } else { var $col_0_lcssa = $86;label = 11; break; } //@line 2003 "src/markdown.c"
  case 28: 
   var $col_159;
   HEAP32[(($40)>>2)]=0; HEAP32[((($40)+(4))>>2)]=0; HEAP32[((($40)+(8))>>2)]=0; HEAP32[((($40)+(12))>>2)]=0; //@line 2030 "src/markdown.c"
   var $89=HEAP32[(($1)>>2)]; //@line 2031 "src/markdown.c"
   var $90=(($col_data+($col_159<<2))|0); //@line 2031 "src/markdown.c"
   var $91=HEAP32[(($90)>>2)]; //@line 2031 "src/markdown.c"
   var $92=$91 | $header_flag; //@line 2031 "src/markdown.c"
   var $93=HEAP32[(($41)>>2)]; //@line 2031 "src/markdown.c"
   FUNCTION_TABLE[$89]($work_0_i, $empty_cell, $92, $93); //@line 2031 "src/markdown.c"
   var $94=((($col_159)+(1))|0); //@line 2029 "src/markdown.c"
   var $95=(($94)>>>(0)) < (($columns)>>>(0)); //@line 2029 "src/markdown.c"
   if ($95) { var $col_159 = $94;label = 28; break; } else { var $_pre_phi = $41;label = 29; break; } //@line 2029 "src/markdown.c"
  case 29: 
   var $_pre_phi; //@line 2034 "src/markdown.c"
   var $96=HEAP32[(($5)>>2)]; //@line 2034 "src/markdown.c"
   var $97=HEAP32[(($_pre_phi)>>2)]; //@line 2034 "src/markdown.c"
   FUNCTION_TABLE[$96]($ob, $work_0_i, $97); //@line 2034 "src/markdown.c"
   var $98=HEAP32[(($10)>>2)]; //@line 147 "src/markdown.c"
   var $99=((($98)-(1))|0); //@line 147 "src/markdown.c"
   HEAP32[(($10)>>2)]=$99; //@line 147 "src/markdown.c"
   label = 30; break; //@line 2037 "src/markdown.c"
  case 30: 
   STACKTOP = sp;
   return; //@line 2037 "src/markdown.c"
  default: assert(0, "bad label: " + label);
 }
}
function _htmlblock_end($curtag, $data, $size, $start_of_line) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=_strlen($curtag); //@line 1862 "src/markdown.c"
   var $2=(($size)>>>(0)) > 1; //@line 1866 "src/markdown.c"
   if ($2) { label = 2; break; } else { var $_0 = 0;label = 46; break; } //@line 1866 "src/markdown.c"
  case 2: 
   var $3=(($start_of_line)|(0))==0; //@line 1882 "src/markdown.c"
   var $4=((($1)+(3))|0); //@line 1885 "src/markdown.c"
   var $5=((($1)+(2))|0); //@line 1837 "src/markdown.c"
   if ($3) { var $i_013 = 1;label = 25; break; } else { var $i_013_us = 1;var $block_lines_014_us = 0;label = 3; break; }
  case 3: 
   var $block_lines_014_us;
   var $i_013_us;
   var $i_17_us=((($i_013_us)+(1))|0); //@line 1867 "src/markdown.c"
   var $6=(($i_17_us)>>>(0)) < (($size)>>>(0)); //@line 1868 "src/markdown.c"
   if ($6) { label = 22; break; } else { var $i_1_in_lcssa_us = $i_013_us;var $block_lines_1_lcssa_us = $block_lines_014_us;var $i_1_lcssa_us = $i_17_us;label = 6; break; } //@line 1868 "src/markdown.c"
  case 4: 
   var $8;
   var $i_110_us;
   var $block_lines_19_us;
   var $i_1_in8_us;
   var $9=(($8 << 24) >> 24)==60; //@line 1868 "src/markdown.c"
   var $10=(($data+$i_110_us)|0); //@line 1868 "src/markdown.c"
   var $11=HEAP8[($10)]; //@line 1868 "src/markdown.c"
   var $phitmp_us=(($11 << 24) >> 24)==47;
   var $or_cond=$9 & $phitmp_us; //@line 1868 "src/markdown.c"
   if ($or_cond) { var $i_1_in_lcssa_us = $i_1_in8_us;var $block_lines_1_lcssa_us = $block_lines_19_us;var $i_1_lcssa_us = $i_110_us;label = 6; break; } else { label = 5; break; } //@line 1868 "src/markdown.c"
  case 5: 
   var $12=(($11 << 24) >> 24)==10; //@line 1869 "src/markdown.c"
   var $13=(($12)&(1)); //@line 1869 "src/markdown.c"
   var $_block_lines_1_us=((($13)+($block_lines_19_us))|0); //@line 1869 "src/markdown.c"
   var $i_1_us=((($i_110_us)+(1))|0); //@line 1867 "src/markdown.c"
   var $14=(($i_1_us)>>>(0)) < (($size)>>>(0)); //@line 1868 "src/markdown.c"
   if ($14) { var $i_1_in8_us = $i_110_us;var $block_lines_19_us = $_block_lines_1_us;var $i_110_us = $i_1_us;var $8 = $11;label = 4; break; } else { var $i_1_in_lcssa_us = $i_110_us;var $block_lines_1_lcssa_us = $_block_lines_1_us;var $i_1_lcssa_us = $i_1_us;label = 6; break; } //@line 1868 "src/markdown.c"
  case 6: 
   var $i_1_lcssa_us;
   var $block_lines_1_lcssa_us;
   var $i_1_in_lcssa_us;
   var $15=(($block_lines_1_lcssa_us)|(0)) > 0; //@line 1882 "src/markdown.c"
   if ($15) { label = 7; break; } else { label = 8; break; } //@line 1882 "src/markdown.c"
  case 7: 
   var $17=((($i_1_in_lcssa_us)-(1))|0); //@line 1882 "src/markdown.c"
   var $18=(($data+$17)|0); //@line 1882 "src/markdown.c"
   var $19=HEAP8[($18)]; //@line 1882 "src/markdown.c"
   var $20=(($19 << 24) >> 24)==10; //@line 1882 "src/markdown.c"
   if ($20) { label = 8; break; } else { label = 24; break; } //@line 1882 "src/markdown.c"
  case 8: 
   var $22=((($4)+($i_1_in_lcssa_us))|0); //@line 1885 "src/markdown.c"
   var $23=(($22)>>>(0)) < (($size)>>>(0)); //@line 1885 "src/markdown.c"
   if ($23) { label = 9; break; } else { var $_0 = 0;label = 46; break; } //@line 1885 "src/markdown.c"
  case 9: 
   var $25=((($size)-($i_1_lcssa_us))|0); //@line 1888 "src/markdown.c"
   var $26=((($25)+(1))|0); //@line 1888 "src/markdown.c"
   var $27=(($4)>>>(0)) < (($26)>>>(0)); //@line 1836 "src/markdown.c"
   if ($27) { label = 10; break; } else { label = 24; break; } //@line 1836 "src/markdown.c"
  case 10: 
   var $_sum_us=((($i_1_in_lcssa_us)+(2))|0); //@line 1837 "src/markdown.c"
   var $29=(($data+$_sum_us)|0); //@line 1837 "src/markdown.c"
   var $30=_strncasecmp($29, $curtag, $1); //@line 1837 "src/markdown.c"
   var $31=(($30)|(0))==0; //@line 1837 "src/markdown.c"
   if ($31) { label = 11; break; } else { label = 24; break; } //@line 1837 "src/markdown.c"
  case 11: 
   var $_sum2_us=((($5)+($i_1_in_lcssa_us))|0); //@line 1837 "src/markdown.c"
   var $33=(($data+$_sum2_us)|0); //@line 1837 "src/markdown.c"
   var $34=HEAP8[($33)]; //@line 1837 "src/markdown.c"
   var $35=(($34 << 24) >> 24)==62; //@line 1837 "src/markdown.c"
   if ($35) { label = 12; break; } else { label = 24; break; } //@line 1837 "src/markdown.c"
  case 12: 
   var $37=((($26)-($4))|0); //@line 1844 "src/markdown.c"
   var $38=(($4)|(0))==(($26)|(0)); //@line 1124 "src/markdown.c"
   if ($38) { var $w_0_i_us = 1;label = 16; break; } else { var $i_08_i_i_us = 0;label = 13; break; } //@line 1124 "src/markdown.c"
  case 13: 
   var $i_08_i_i_us;
   var $_sum3_us=((($22)+($i_08_i_i_us))|0); //@line 1124 "src/markdown.c"
   var $39=(($data+$_sum3_us)|0); //@line 1124 "src/markdown.c"
   var $40=HEAP8[($39)]; //@line 1124 "src/markdown.c"
   if ((($40 << 24) >> 24)==32) {
    label = 14; break;
   }
   else if ((($40 << 24) >> 24)==10) {
    var $i_0_lcssa_i_i_us = $i_08_i_i_us;label = 15; break;
   }
   else {
   label = 24; break;
   }
  case 14: 
   var $42=((($i_08_i_i_us)+(1))|0); //@line 1124 "src/markdown.c"
   var $43=(($42)>>>(0)) < (($37)>>>(0)); //@line 1124 "src/markdown.c"
   if ($43) { var $i_08_i_i_us = $42;label = 13; break; } else { var $i_0_lcssa_i_i_us = $42;label = 15; break; } //@line 1124 "src/markdown.c"
  case 15: 
   var $i_0_lcssa_i_i_us;
   var $44=((($i_0_lcssa_i_i_us)+(1))|0); //@line 1128 "src/markdown.c"
   var $45=(($44)|(0))==0; //@line 1844 "src/markdown.c"
   if ($45) { label = 24; break; } else { var $w_0_i_us = $44;label = 16; break; } //@line 1844 "src/markdown.c"
  case 16: 
   var $w_0_i_us;
   var $46=((($w_0_i_us)+($4))|0); //@line 1846 "src/markdown.c"
   var $47=(($46)>>>(0)) < (($26)>>>(0)); //@line 1849 "src/markdown.c"
   if ($47) { label = 17; break; } else { var $w_1_i_us = 0;label = 21; break; } //@line 1849 "src/markdown.c"
  case 17: 
   var $49=((($26)-($46))|0); //@line 1850 "src/markdown.c"
   var $50=(($46)|(0))==(($26)|(0)); //@line 1124 "src/markdown.c"
   if ($50) { var $i_0_lcssa_i3_i_us = 0;label = 20; break; } else { label = 23; break; } //@line 1124 "src/markdown.c"
  case 18: 
   var $i_08_i1_i_us;
   var $_sum4_us=((($_sum_i_us)+($i_08_i1_i_us))|0); //@line 1124 "src/markdown.c"
   var $51=(($data+$_sum4_us)|0); //@line 1124 "src/markdown.c"
   var $52=HEAP8[($51)]; //@line 1124 "src/markdown.c"
   if ((($52 << 24) >> 24)==32) {
    label = 19; break;
   }
   else if ((($52 << 24) >> 24)==10) {
    var $i_0_lcssa_i3_i_us = $i_08_i1_i_us;label = 20; break;
   }
   else {
   var $w_1_i_us = 0;label = 21; break;
   }
  case 19: 
   var $54=((($i_08_i1_i_us)+(1))|0); //@line 1124 "src/markdown.c"
   var $55=(($54)>>>(0)) < (($49)>>>(0)); //@line 1124 "src/markdown.c"
   if ($55) { var $i_08_i1_i_us = $54;label = 18; break; } else { var $i_0_lcssa_i3_i_us = $54;label = 20; break; } //@line 1124 "src/markdown.c"
  case 20: 
   var $i_0_lcssa_i3_i_us;
   var $56=((($i_0_lcssa_i3_i_us)+(1))|0); //@line 1128 "src/markdown.c"
   var $w_1_i_us = $56;label = 21; break; //@line 1128 "src/markdown.c"
  case 21: 
   var $w_1_i_us;
   var $57=((($w_1_i_us)+($46))|0); //@line 1852 "src/markdown.c"
   var $58=(($57)|(0))==0; //@line 1889 "src/markdown.c"
   if ($58) { label = 24; break; } else { var $i_1_in_lcssa_lcssa = $i_1_in_lcssa_us;var $_lcssa = $57;label = 45; break; } //@line 1889 "src/markdown.c"
  case 22: 
   var $_phi_trans_insert=(($data+$i_013_us)|0);
   var $_pre=HEAP8[($_phi_trans_insert)]; //@line 1868 "src/markdown.c"
   var $i_1_in8_us = $i_013_us;var $block_lines_19_us = $block_lines_014_us;var $i_110_us = $i_17_us;var $8 = $_pre;label = 4; break; //@line 1868 "src/markdown.c"
  case 23: 
   var $_sum_i_us=((($46)+($i_1_in_lcssa_us))|0); //@line 1124 "src/markdown.c"
   var $i_08_i1_i_us = 0;label = 18; break; //@line 1124 "src/markdown.c"
  case 24: 
   var $59=(($i_1_lcssa_us)>>>(0)) < (($size)>>>(0)); //@line 1866 "src/markdown.c"
   if ($59) { var $i_013_us = $i_1_lcssa_us;var $block_lines_014_us = $block_lines_1_lcssa_us;label = 3; break; } else { var $_0 = 0;label = 46; break; } //@line 1866 "src/markdown.c"
  case 25: 
   var $i_013;
   var $i_17=((($i_013)+(1))|0); //@line 1867 "src/markdown.c"
   var $60=(($i_17)>>>(0)) < (($size)>>>(0)); //@line 1868 "src/markdown.c"
   if ($60) { label = 26; break; } else { var $i_1_in_lcssa = $i_013;var $i_1_lcssa = $i_17;label = 29; break; } //@line 1868 "src/markdown.c"
  case 26: 
   var $_phi_trans_insert29=(($data+$i_013)|0);
   var $_pre30=HEAP8[($_phi_trans_insert29)]; //@line 1868 "src/markdown.c"
   var $i_1_in8 = $i_013;var $i_110 = $i_17;var $62 = $_pre30;label = 27; break; //@line 1868 "src/markdown.c"
  case 27: 
   var $62;
   var $i_110;
   var $i_1_in8;
   var $63=(($62 << 24) >> 24)==60; //@line 1868 "src/markdown.c"
   var $64=(($data+$i_110)|0); //@line 1868 "src/markdown.c"
   var $65=HEAP8[($64)]; //@line 1868 "src/markdown.c"
   var $phitmp=(($65 << 24) >> 24)==47;
   var $or_cond35=$63 & $phitmp; //@line 1868 "src/markdown.c"
   if ($or_cond35) { var $i_1_in_lcssa = $i_1_in8;var $i_1_lcssa = $i_110;label = 29; break; } else { label = 28; break; } //@line 1868 "src/markdown.c"
  case 28: 
   var $i_1=((($i_110)+(1))|0); //@line 1867 "src/markdown.c"
   var $66=(($i_1)>>>(0)) < (($size)>>>(0)); //@line 1868 "src/markdown.c"
   if ($66) { var $i_1_in8 = $i_110;var $i_110 = $i_1;var $62 = $65;label = 27; break; } else { var $i_1_in_lcssa = $i_110;var $i_1_lcssa = $i_1;label = 29; break; } //@line 1868 "src/markdown.c"
  case 29: 
   var $i_1_lcssa;
   var $i_1_in_lcssa;
   var $68=((($4)+($i_1_in_lcssa))|0); //@line 1885 "src/markdown.c"
   var $69=(($68)>>>(0)) < (($size)>>>(0)); //@line 1885 "src/markdown.c"
   if ($69) { label = 30; break; } else { var $_0 = 0;label = 46; break; } //@line 1885 "src/markdown.c"
  case 30: 
   var $71=((($size)-($i_1_lcssa))|0); //@line 1888 "src/markdown.c"
   var $72=((($71)+(1))|0); //@line 1888 "src/markdown.c"
   var $73=(($4)>>>(0)) < (($72)>>>(0)); //@line 1836 "src/markdown.c"
   if ($73) { label = 31; break; } else { label = 44; break; } //@line 1836 "src/markdown.c"
  case 31: 
   var $_sum=((($i_1_in_lcssa)+(2))|0); //@line 1837 "src/markdown.c"
   var $75=(($data+$_sum)|0); //@line 1837 "src/markdown.c"
   var $76=_strncasecmp($75, $curtag, $1); //@line 1837 "src/markdown.c"
   var $77=(($76)|(0))==0; //@line 1837 "src/markdown.c"
   if ($77) { label = 32; break; } else { label = 44; break; } //@line 1837 "src/markdown.c"
  case 32: 
   var $_sum2=((($5)+($i_1_in_lcssa))|0); //@line 1837 "src/markdown.c"
   var $79=(($data+$_sum2)|0); //@line 1837 "src/markdown.c"
   var $80=HEAP8[($79)]; //@line 1837 "src/markdown.c"
   var $81=(($80 << 24) >> 24)==62; //@line 1837 "src/markdown.c"
   if ($81) { label = 33; break; } else { label = 44; break; } //@line 1837 "src/markdown.c"
  case 33: 
   var $83=((($72)-($4))|0); //@line 1844 "src/markdown.c"
   var $84=(($4)|(0))==(($72)|(0)); //@line 1124 "src/markdown.c"
   if ($84) { var $w_0_i = 1;label = 37; break; } else { var $i_08_i_i = 0;label = 34; break; } //@line 1124 "src/markdown.c"
  case 34: 
   var $i_08_i_i;
   var $_sum3=((($68)+($i_08_i_i))|0); //@line 1124 "src/markdown.c"
   var $85=(($data+$_sum3)|0); //@line 1124 "src/markdown.c"
   var $86=HEAP8[($85)]; //@line 1124 "src/markdown.c"
   if ((($86 << 24) >> 24)==32) {
    label = 35; break;
   }
   else if ((($86 << 24) >> 24)==10) {
    var $i_0_lcssa_i_i = $i_08_i_i;label = 36; break;
   }
   else {
   label = 44; break;
   }
  case 35: 
   var $88=((($i_08_i_i)+(1))|0); //@line 1124 "src/markdown.c"
   var $89=(($88)>>>(0)) < (($83)>>>(0)); //@line 1124 "src/markdown.c"
   if ($89) { var $i_08_i_i = $88;label = 34; break; } else { var $i_0_lcssa_i_i = $88;label = 36; break; } //@line 1124 "src/markdown.c"
  case 36: 
   var $i_0_lcssa_i_i;
   var $90=((($i_0_lcssa_i_i)+(1))|0); //@line 1128 "src/markdown.c"
   var $91=(($90)|(0))==0; //@line 1844 "src/markdown.c"
   if ($91) { label = 44; break; } else { var $w_0_i = $90;label = 37; break; } //@line 1844 "src/markdown.c"
  case 37: 
   var $w_0_i;
   var $92=((($w_0_i)+($4))|0); //@line 1846 "src/markdown.c"
   var $93=(($92)>>>(0)) < (($72)>>>(0)); //@line 1849 "src/markdown.c"
   if ($93) { label = 38; break; } else { var $w_1_i = 0;label = 43; break; } //@line 1849 "src/markdown.c"
  case 38: 
   var $95=((($72)-($92))|0); //@line 1850 "src/markdown.c"
   var $96=(($92)|(0))==(($72)|(0)); //@line 1124 "src/markdown.c"
   if ($96) { var $i_0_lcssa_i3_i = 0;label = 42; break; } else { label = 39; break; } //@line 1124 "src/markdown.c"
  case 39: 
   var $_sum_i=((($92)+($i_1_in_lcssa))|0); //@line 1124 "src/markdown.c"
   var $i_08_i1_i = 0;label = 40; break; //@line 1124 "src/markdown.c"
  case 40: 
   var $i_08_i1_i;
   var $_sum4=((($_sum_i)+($i_08_i1_i))|0); //@line 1124 "src/markdown.c"
   var $97=(($data+$_sum4)|0); //@line 1124 "src/markdown.c"
   var $98=HEAP8[($97)]; //@line 1124 "src/markdown.c"
   if ((($98 << 24) >> 24)==32) {
    label = 41; break;
   }
   else if ((($98 << 24) >> 24)==10) {
    var $i_0_lcssa_i3_i = $i_08_i1_i;label = 42; break;
   }
   else {
   var $w_1_i = 0;label = 43; break;
   }
  case 41: 
   var $100=((($i_08_i1_i)+(1))|0); //@line 1124 "src/markdown.c"
   var $101=(($100)>>>(0)) < (($95)>>>(0)); //@line 1124 "src/markdown.c"
   if ($101) { var $i_08_i1_i = $100;label = 40; break; } else { var $i_0_lcssa_i3_i = $100;label = 42; break; } //@line 1124 "src/markdown.c"
  case 42: 
   var $i_0_lcssa_i3_i;
   var $102=((($i_0_lcssa_i3_i)+(1))|0); //@line 1128 "src/markdown.c"
   var $w_1_i = $102;label = 43; break; //@line 1128 "src/markdown.c"
  case 43: 
   var $w_1_i;
   var $103=((($w_1_i)+($92))|0); //@line 1852 "src/markdown.c"
   var $104=(($103)|(0))==0; //@line 1889 "src/markdown.c"
   if ($104) { label = 44; break; } else { var $i_1_in_lcssa_lcssa = $i_1_in_lcssa;var $_lcssa = $103;label = 45; break; } //@line 1889 "src/markdown.c"
  case 44: 
   var $105=(($i_1_lcssa)>>>(0)) < (($size)>>>(0)); //@line 1866 "src/markdown.c"
   if ($105) { var $i_013 = $i_1_lcssa;label = 25; break; } else { var $_0 = 0;label = 46; break; } //@line 1866 "src/markdown.c"
  case 45: 
   var $_lcssa;
   var $i_1_in_lcssa_lcssa;
   var $106=((($_lcssa)+($i_1_in_lcssa_lcssa))|0); //@line 1890 "src/markdown.c"
   var $_0 = $106;label = 46; break; //@line 1890 "src/markdown.c"
  case 46: 
   var $_0;
   return $_0; //@line 1894 "src/markdown.c"
  default: assert(0, "bad label: " + label);
 }
}
function _stack_free($st) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($st)|(0))==0; //@line 31 "src/stack.c"
   if ($1) { label = 3; break; } else { label = 2; break; } //@line 31 "src/stack.c"
  case 2: 
   var $3=(($st)|0); //@line 34 "src/stack.c"
   var $4=HEAP32[(($3)>>2)]; //@line 34 "src/stack.c"
   var $5=$4; //@line 34 "src/stack.c"
   _free($5); //@line 34 "src/stack.c"
   HEAP32[(($3)>>2)]=0; //@line 36 "src/stack.c"
   var $6=(($st+4)|0); //@line 37 "src/stack.c"
   HEAP32[(($6)>>2)]=0; //@line 37 "src/stack.c"
   var $7=(($st+8)|0); //@line 38 "src/stack.c"
   HEAP32[(($7)>>2)]=0; //@line 38 "src/stack.c"
   label = 3; break; //@line 39 "src/stack.c"
  case 3: 
   return; //@line 39 "src/stack.c"
  default: assert(0, "bad label: " + label);
 }
}
function _stack_init($st, $initial_size) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($st)|0); //@line 44 "src/stack.c"
   HEAP32[(($1)>>2)]=0; //@line 44 "src/stack.c"
   var $2=(($st+4)|0); //@line 45 "src/stack.c"
   HEAP32[(($2)>>2)]=0; //@line 45 "src/stack.c"
   var $3=(($st+8)|0); //@line 46 "src/stack.c"
   HEAP32[(($3)>>2)]=0; //@line 46 "src/stack.c"
   var $4=(($initial_size)|(0))==0; //@line 48 "src/stack.c"
   var $_initial_size=$4 ? 8 : $initial_size; //@line 48 "src/stack.c"
   var $5=$_initial_size << 2; //@line 12 "src/stack.c"
   var $6=_realloc(0, $5); //@line 12 "src/stack.c"
   var $7=$6; //@line 12 "src/stack.c"
   var $8=(($6)|(0))==0; //@line 13 "src/stack.c"
   if ($8) { var $_0_i = -1;label = 4; break; } else { label = 2; break; } //@line 13 "src/stack.c"
  case 2: 
   var $10=HEAP32[(($3)>>2)]; //@line 16 "src/stack.c"
   var $11=(($7+($10<<2))|0); //@line 16 "src/stack.c"
   var $12=$11; //@line 16 "src/stack.c"
   var $13=((($_initial_size)-($10))|0); //@line 16 "src/stack.c"
   var $14=$13 << 2; //@line 16 "src/stack.c"
   _memset($12, 0, $14); //@line 16 "src/stack.c"
   HEAP32[(($1)>>2)]=$7; //@line 19 "src/stack.c"
   HEAP32[(($3)>>2)]=$_initial_size; //@line 20 "src/stack.c"
   var $15=HEAP32[(($2)>>2)]; //@line 22 "src/stack.c"
   var $16=(($15)>>>(0)) > (($_initial_size)>>>(0)); //@line 22 "src/stack.c"
   if ($16) { label = 3; break; } else { var $_0_i = 0;label = 4; break; } //@line 22 "src/stack.c"
  case 3: 
   HEAP32[(($2)>>2)]=$_initial_size; //@line 23 "src/stack.c"
   var $_0_i = 0;label = 4; break; //@line 23 "src/stack.c"
  case 4: 
   var $_0_i;
   return $_0_i; //@line 51 "src/stack.c"
  default: assert(0, "bad label: " + label);
 }
}
function _stack_push($st, $item) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($st+4)|0); //@line 66 "src/stack.c"
   var $2=HEAP32[(($1)>>2)]; //@line 66 "src/stack.c"
   var $3=$2 << 1; //@line 66 "src/stack.c"
   var $4=(($st+8)|0); //@line 9 "src/stack.c"
   var $5=HEAP32[(($4)>>2)]; //@line 9 "src/stack.c"
   var $6=(($5)>>>(0)) < (($3)>>>(0)); //@line 9 "src/stack.c"
   var $7=(($st)|0); //@line 12 "src/stack.c"
   var $8=HEAP32[(($7)>>2)]; //@line 12 "src/stack.c"
   if ($6) { label = 2; break; } else { var $25 = $2;var $24 = $8;label = 5; break; } //@line 9 "src/stack.c"
  case 2: 
   var $10=$8; //@line 12 "src/stack.c"
   var $11=$2 << 3; //@line 12 "src/stack.c"
   var $12=_realloc($10, $11); //@line 12 "src/stack.c"
   var $13=$12; //@line 12 "src/stack.c"
   var $14=(($12)|(0))==0; //@line 13 "src/stack.c"
   if ($14) { var $_0 = -1;label = 6; break; } else { label = 3; break; } //@line 13 "src/stack.c"
  case 3: 
   var $16=HEAP32[(($4)>>2)]; //@line 16 "src/stack.c"
   var $17=(($13+($16<<2))|0); //@line 16 "src/stack.c"
   var $18=$17; //@line 16 "src/stack.c"
   var $19=((($3)-($16))|0); //@line 16 "src/stack.c"
   var $20=$19 << 2; //@line 16 "src/stack.c"
   _memset($18, 0, $20); //@line 16 "src/stack.c"
   HEAP32[(($7)>>2)]=$13; //@line 19 "src/stack.c"
   HEAP32[(($4)>>2)]=$3; //@line 20 "src/stack.c"
   var $21=HEAP32[(($1)>>2)]; //@line 22 "src/stack.c"
   var $22=(($21)>>>(0)) > (($3)>>>(0)); //@line 22 "src/stack.c"
   if ($22) { label = 4; break; } else { var $25 = $21;var $24 = $13;label = 5; break; } //@line 22 "src/stack.c"
  case 4: 
   HEAP32[(($1)>>2)]=$3; //@line 23 "src/stack.c"
   var $25 = $3;var $24 = $13;label = 5; break; //@line 23 "src/stack.c"
  case 5: 
   var $24;
   var $25;
   var $26=((($25)+(1))|0); //@line 69 "src/stack.c"
   HEAP32[(($1)>>2)]=$26; //@line 69 "src/stack.c"
   var $27=(($24+($25<<2))|0); //@line 69 "src/stack.c"
   HEAP32[(($27)>>2)]=$item; //@line 69 "src/stack.c"
   var $_0 = 0;label = 6; break; //@line 70 "src/stack.c"
  case 6: 
   var $_0;
   return $_0; //@line 71 "src/stack.c"
  default: assert(0, "bad label: " + label);
 }
}
function _bufnew($unit) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=_malloc(16); //@line 85 "src/buffer.c"
   var $2=$1; //@line 85 "src/buffer.c"
   var $3=(($1)|(0))==0; //@line 87 "src/buffer.c"
   if ($3) { label = 3; break; } else { label = 2; break; } //@line 87 "src/buffer.c"
  case 2: 
   var $5=$1; //@line 88 "src/buffer.c"
   HEAP32[(($5)>>2)]=0; //@line 88 "src/buffer.c"
   var $6=(($1+8)|0); //@line 89 "src/buffer.c"
   var $7=$6; //@line 89 "src/buffer.c"
   HEAP32[(($7)>>2)]=0; //@line 89 "src/buffer.c"
   var $8=(($1+4)|0); //@line 89 "src/buffer.c"
   var $9=$8; //@line 89 "src/buffer.c"
   HEAP32[(($9)>>2)]=0; //@line 89 "src/buffer.c"
   var $10=(($1+12)|0); //@line 90 "src/buffer.c"
   var $11=$10; //@line 90 "src/buffer.c"
   HEAP32[(($11)>>2)]=$unit; //@line 90 "src/buffer.c"
   label = 3; break; //@line 91 "src/buffer.c"
  case 3: 
   return $2; //@line 92 "src/buffer.c"
  default: assert(0, "bad label: " + label);
 }
}
Module["_bufnew"] = _bufnew;
function _bufprefix($buf, $prefix) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($buf)|(0))==0; //@line 38 "src/buffer.c"
   if ($1) { label = 4; break; } else { label = 2; break; } //@line 38 "src/buffer.c"
  case 2: 
   var $3=(($buf+12)|0); //@line 38 "src/buffer.c"
   var $4=HEAP32[(($3)>>2)]; //@line 38 "src/buffer.c"
   var $5=(($4)|(0))==0; //@line 38 "src/buffer.c"
   if ($5) { label = 4; break; } else { label = 3; break; } //@line 38 "src/buffer.c"
  case 3: 
   var $6=(($buf+4)|0); //@line 40 "src/buffer.c"
   var $7=HEAP32[(($6)>>2)]; //@line 40 "src/buffer.c"
   var $8=(($buf)|0); //@line 44 "src/buffer.c"
   var $i_0 = 0;label = 5; break; //@line 40 "src/buffer.c"
  case 4: 
   ___assert_func(((1736)|0), 38, ((2648)|0), ((2384)|0)); //@line 38 "src/buffer.c"
   throw "Reached an unreachable!"; //@line 38 "src/buffer.c"
  case 5: 
   var $i_0;
   var $11=(($i_0)>>>(0)) < (($7)>>>(0)); //@line 40 "src/buffer.c"
   if ($11) { label = 6; break; } else { var $_0 = 0;label = 9; break; } //@line 40 "src/buffer.c"
  case 6: 
   var $13=(($prefix+$i_0)|0); //@line 41 "src/buffer.c"
   var $14=HEAP8[($13)]; //@line 41 "src/buffer.c"
   var $15=(($14 << 24) >> 24); //@line 41 "src/buffer.c"
   var $16=(($14 << 24) >> 24)==0; //@line 41 "src/buffer.c"
   if ($16) { var $_0 = 0;label = 9; break; } else { label = 7; break; } //@line 41 "src/buffer.c"
  case 7: 
   var $18=HEAP32[(($8)>>2)]; //@line 44 "src/buffer.c"
   var $19=(($18+$i_0)|0); //@line 44 "src/buffer.c"
   var $20=HEAP8[($19)]; //@line 44 "src/buffer.c"
   var $21=(($20)&(255)); //@line 44 "src/buffer.c"
   var $22=(($21)|(0))==(($15)|(0)); //@line 44 "src/buffer.c"
   var $23=((($i_0)+(1))|0); //@line 40 "src/buffer.c"
   if ($22) { var $i_0 = $23;label = 5; break; } else { label = 8; break; } //@line 44 "src/buffer.c"
  case 8: 
   var $25=((($21)-($15))|0); //@line 45 "src/buffer.c"
   var $_0 = $25;label = 9; break; //@line 45 "src/buffer.c"
  case 9: 
   var $_0;
   return $_0; //@line 49 "src/buffer.c"
  default: assert(0, "bad label: " + label);
 }
}
Module["_bufprefix"] = _bufprefix;
function _bufgrow($buf, $neosz) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($buf)|(0))==0; //@line 58 "src/buffer.c"
   if ($1) { label = 3; break; } else { label = 2; break; } //@line 58 "src/buffer.c"
  case 2: 
   var $3=(($buf+12)|0); //@line 58 "src/buffer.c"
   var $4=HEAP32[(($3)>>2)]; //@line 58 "src/buffer.c"
   var $5=(($4)|(0))==0; //@line 58 "src/buffer.c"
   if ($5) { label = 3; break; } else { label = 4; break; } //@line 58 "src/buffer.c"
  case 3: 
   ___assert_func(((1736)|0), 58, ((2664)|0), ((2384)|0)); //@line 58 "src/buffer.c"
   throw "Reached an unreachable!"; //@line 58 "src/buffer.c"
  case 4: 
   var $8=(($neosz)>>>(0)) > 16777216; //@line 60 "src/buffer.c"
   if ($8) { var $_0 = -1;label = 10; break; } else { label = 5; break; } //@line 60 "src/buffer.c"
  case 5: 
   var $10=(($buf+8)|0); //@line 63 "src/buffer.c"
   var $11=HEAP32[(($10)>>2)]; //@line 63 "src/buffer.c"
   var $12=(($11)>>>(0)) < (($neosz)>>>(0)); //@line 63 "src/buffer.c"
   if ($12) { label = 6; break; } else { var $_0 = 0;label = 10; break; } //@line 63 "src/buffer.c"
  case 6: 
   var $14=((($11)+($4))|0); //@line 66 "src/buffer.c"
   var $15=(($14)>>>(0)) < (($neosz)>>>(0)); //@line 67 "src/buffer.c"
   if ($15) { var $neoasz_016 = $14;label = 7; break; } else { var $neoasz_0_lcssa = $14;label = 8; break; } //@line 67 "src/buffer.c"
  case 7: 
   var $neoasz_016;
   var $16=((($4)+($neoasz_016))|0); //@line 68 "src/buffer.c"
   var $17=(($16)>>>(0)) < (($neosz)>>>(0)); //@line 67 "src/buffer.c"
   if ($17) { var $neoasz_016 = $16;label = 7; break; } else { var $neoasz_0_lcssa = $16;label = 8; break; } //@line 67 "src/buffer.c"
  case 8: 
   var $neoasz_0_lcssa;
   var $18=(($buf)|0); //@line 70 "src/buffer.c"
   var $19=HEAP32[(($18)>>2)]; //@line 70 "src/buffer.c"
   var $20=_realloc($19, $neoasz_0_lcssa); //@line 70 "src/buffer.c"
   var $21=(($20)|(0))==0; //@line 71 "src/buffer.c"
   if ($21) { var $_0 = -1;label = 10; break; } else { label = 9; break; } //@line 71 "src/buffer.c"
  case 9: 
   HEAP32[(($18)>>2)]=$20; //@line 74 "src/buffer.c"
   HEAP32[(($10)>>2)]=$neoasz_0_lcssa; //@line 75 "src/buffer.c"
   var $_0 = 0;label = 10; break; //@line 76 "src/buffer.c"
  case 10: 
   var $_0;
   return $_0; //@line 77 "src/buffer.c"
  default: assert(0, "bad label: " + label);
 }
}
Module["_bufgrow"] = _bufgrow;
function _bufcstr($buf) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($buf)|(0))==0; //@line 99 "src/buffer.c"
   if ($1) { label = 3; break; } else { label = 2; break; } //@line 99 "src/buffer.c"
  case 2: 
   var $3=(($buf+12)|0); //@line 99 "src/buffer.c"
   var $4=HEAP32[(($3)>>2)]; //@line 99 "src/buffer.c"
   var $5=(($4)|(0))==0; //@line 99 "src/buffer.c"
   if ($5) { label = 3; break; } else { label = 4; break; } //@line 99 "src/buffer.c"
  case 3: 
   ___assert_func(((1736)|0), 99, ((2672)|0), ((2384)|0)); //@line 99 "src/buffer.c"
   throw "Reached an unreachable!"; //@line 99 "src/buffer.c"
  case 4: 
   var $8=(($buf+4)|0); //@line 101 "src/buffer.c"
   var $9=HEAP32[(($8)>>2)]; //@line 101 "src/buffer.c"
   var $10=(($buf+8)|0); //@line 101 "src/buffer.c"
   var $11=HEAP32[(($10)>>2)]; //@line 101 "src/buffer.c"
   var $12=(($9)>>>(0)) < (($11)>>>(0)); //@line 101 "src/buffer.c"
   if ($12) { label = 5; break; } else { label = 6; break; } //@line 101 "src/buffer.c"
  case 5: 
   var $14=(($buf)|0); //@line 101 "src/buffer.c"
   var $15=HEAP32[(($14)>>2)]; //@line 101 "src/buffer.c"
   var $16=(($15+$9)|0); //@line 101 "src/buffer.c"
   var $17=HEAP8[($16)]; //@line 101 "src/buffer.c"
   var $18=(($17 << 24) >> 24)==0; //@line 101 "src/buffer.c"
   if ($18) { var $_0 = $15;label = 13; break; } else { label = 6; break; } //@line 101 "src/buffer.c"
  case 6: 
   var $20=((($9)+(1))|0); //@line 104 "src/buffer.c"
   var $21=(($20)>>>(0)) > (($11)>>>(0)); //@line 104 "src/buffer.c"
   if ($21) { label = 7; break; } else { var $34 = $9;label = 12; break; } //@line 104 "src/buffer.c"
  case 7: 
   var $23=(($20)>>>(0)) > 16777216; //@line 60 "src/buffer.c"
   if ($23) { var $_0 = 0;label = 13; break; } else { label = 8; break; } //@line 60 "src/buffer.c"
  case 8: 
   var $25=((($4)+($11))|0); //@line 66 "src/buffer.c"
   var $26=(($25)>>>(0)) < (($20)>>>(0)); //@line 67 "src/buffer.c"
   if ($26) { var $neoasz_016_i = $25;label = 9; break; } else { var $neoasz_0_lcssa_i = $25;label = 10; break; } //@line 67 "src/buffer.c"
  case 9: 
   var $neoasz_016_i;
   var $27=((($neoasz_016_i)+($4))|0); //@line 68 "src/buffer.c"
   var $28=(($27)>>>(0)) < (($20)>>>(0)); //@line 67 "src/buffer.c"
   if ($28) { var $neoasz_016_i = $27;label = 9; break; } else { var $neoasz_0_lcssa_i = $27;label = 10; break; } //@line 67 "src/buffer.c"
  case 10: 
   var $neoasz_0_lcssa_i;
   var $29=(($buf)|0); //@line 70 "src/buffer.c"
   var $30=HEAP32[(($29)>>2)]; //@line 70 "src/buffer.c"
   var $31=_realloc($30, $neoasz_0_lcssa_i); //@line 70 "src/buffer.c"
   var $32=(($31)|(0))==0; //@line 71 "src/buffer.c"
   if ($32) { var $_0 = 0;label = 13; break; } else { label = 11; break; } //@line 71 "src/buffer.c"
  case 11: 
   HEAP32[(($29)>>2)]=$31; //@line 74 "src/buffer.c"
   HEAP32[(($10)>>2)]=$neoasz_0_lcssa_i; //@line 75 "src/buffer.c"
   var $_pre=HEAP32[(($8)>>2)]; //@line 105 "src/buffer.c"
   var $34 = $_pre;label = 12; break; //@line 76 "src/buffer.c"
  case 12: 
   var $34;
   var $35=(($buf)|0); //@line 105 "src/buffer.c"
   var $36=HEAP32[(($35)>>2)]; //@line 105 "src/buffer.c"
   var $37=(($36+$34)|0); //@line 105 "src/buffer.c"
   HEAP8[($37)]=0; //@line 105 "src/buffer.c"
   var $38=HEAP32[(($35)>>2)]; //@line 106 "src/buffer.c"
   var $_0 = $38;label = 13; break; //@line 106 "src/buffer.c"
  case 13: 
   var $_0;
   return $_0; //@line 110 "src/buffer.c"
  default: assert(0, "bad label: " + label);
 }
}
Module["_bufcstr"] = _bufcstr;
function _bufprintf($buf, $fmt, varrp) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 16)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $ap=sp;
   var $1=(($buf)|(0))==0; //@line 119 "src/buffer.c"
   if ($1) { label = 3; break; } else { label = 2; break; } //@line 119 "src/buffer.c"
  case 2: 
   var $3=(($buf+12)|0); //@line 119 "src/buffer.c"
   var $4=HEAP32[(($3)>>2)]; //@line 119 "src/buffer.c"
   var $5=(($4)|(0))==0; //@line 119 "src/buffer.c"
   if ($5) { label = 3; break; } else { label = 4; break; } //@line 119 "src/buffer.c"
  case 3: 
   ___assert_func(((1736)|0), 119, ((2632)|0), ((2384)|0)); //@line 119 "src/buffer.c"
   throw "Reached an unreachable!"; //@line 119 "src/buffer.c"
  case 4: 
   var $8=(($buf+4)|0); //@line 121 "src/buffer.c"
   var $9=HEAP32[(($8)>>2)]; //@line 121 "src/buffer.c"
   var $10=(($buf+8)|0); //@line 121 "src/buffer.c"
   var $11=HEAP32[(($10)>>2)]; //@line 121 "src/buffer.c"
   var $12=(($9)>>>(0)) < (($11)>>>(0)); //@line 121 "src/buffer.c"
   if ($12) { label = 11; break; } else { label = 5; break; } //@line 121 "src/buffer.c"
  case 5: 
   var $14=((($9)+(1))|0); //@line 121 "src/buffer.c"
   var $15=(($14)>>>(0)) > 16777216; //@line 60 "src/buffer.c"
   if ($15) { label = 24; break; } else { label = 6; break; } //@line 60 "src/buffer.c"
  case 6: 
   var $17=(($11)>>>(0)) < (($14)>>>(0)); //@line 63 "src/buffer.c"
   if ($17) { label = 7; break; } else { label = 11; break; } //@line 63 "src/buffer.c"
  case 7: 
   var $19=((($11)+($4))|0); //@line 66 "src/buffer.c"
   var $20=(($19)>>>(0)) < (($14)>>>(0)); //@line 67 "src/buffer.c"
   if ($20) { var $neoasz_016_i = $19;label = 8; break; } else { var $neoasz_0_lcssa_i = $19;label = 9; break; } //@line 67 "src/buffer.c"
  case 8: 
   var $neoasz_016_i;
   var $21=((($neoasz_016_i)+($4))|0); //@line 68 "src/buffer.c"
   var $22=(($21)>>>(0)) < (($14)>>>(0)); //@line 67 "src/buffer.c"
   if ($22) { var $neoasz_016_i = $21;label = 8; break; } else { var $neoasz_0_lcssa_i = $21;label = 9; break; } //@line 67 "src/buffer.c"
  case 9: 
   var $neoasz_0_lcssa_i;
   var $23=(($buf)|0); //@line 70 "src/buffer.c"
   var $24=HEAP32[(($23)>>2)]; //@line 70 "src/buffer.c"
   var $25=_realloc($24, $neoasz_0_lcssa_i); //@line 70 "src/buffer.c"
   var $26=(($25)|(0))==0; //@line 71 "src/buffer.c"
   if ($26) { label = 24; break; } else { label = 10; break; } //@line 71 "src/buffer.c"
  case 10: 
   HEAP32[(($23)>>2)]=$25; //@line 74 "src/buffer.c"
   HEAP32[(($10)>>2)]=$neoasz_0_lcssa_i; //@line 75 "src/buffer.c"
   label = 11; break; //@line 76 "src/buffer.c"
  case 11: 
   var $28=(($ap)|0); //@line 124 "src/buffer.c"
   var $29=$ap; //@line 124 "src/buffer.c"
   HEAP32[(($29)>>2)]=varrp;HEAP32[((($29)+(4))>>2)]=0; //@line 124 "src/buffer.c"
   var $30=(($buf)|0); //@line 125 "src/buffer.c"
   var $31=HEAP32[(($30)>>2)]; //@line 125 "src/buffer.c"
   var $32=HEAP32[(($8)>>2)]; //@line 125 "src/buffer.c"
   var $33=(($31+$32)|0); //@line 125 "src/buffer.c"
   var $34=HEAP32[(($10)>>2)]; //@line 125 "src/buffer.c"
   var $35=((($34)-($32))|0); //@line 125 "src/buffer.c"
   var $36=_vsnprintf($33, $35, $fmt, $28); //@line 125 "src/buffer.c"
 //@line 126 "src/buffer.c"
   var $37=(($36)|(0)) < 0; //@line 128 "src/buffer.c"
   if ($37) { label = 24; break; } else { label = 12; break; } //@line 128 "src/buffer.c"
  case 12: 
   var $39=HEAP32[(($10)>>2)]; //@line 138 "src/buffer.c"
   var $40=HEAP32[(($8)>>2)]; //@line 138 "src/buffer.c"
   var $41=((($39)-($40))|0); //@line 138 "src/buffer.c"
   var $42=(($36)>>>(0)) < (($41)>>>(0)); //@line 138 "src/buffer.c"
   if ($42) { var $n_035 = $36;var $70 = $40;label = 23; break; } else { label = 13; break; } //@line 138 "src/buffer.c"
  case 13: 
   var $44=((($36)+(1))|0); //@line 139 "src/buffer.c"
   var $45=((($44)+($40))|0); //@line 139 "src/buffer.c"
   var $46=HEAP32[(($3)>>2)]; //@line 58 "src/buffer.c"
   var $47=(($46)|(0))==0; //@line 58 "src/buffer.c"
   if ($47) { label = 14; break; } else { label = 15; break; } //@line 58 "src/buffer.c"
  case 14: 
   ___assert_func(((1736)|0), 58, ((2664)|0), ((2384)|0)); //@line 58 "src/buffer.c"
   throw "Reached an unreachable!"; //@line 58 "src/buffer.c"
  case 15: 
   var $50=(($45)>>>(0)) > 16777216; //@line 60 "src/buffer.c"
   if ($50) { label = 24; break; } else { label = 16; break; } //@line 60 "src/buffer.c"
  case 16: 
   var $52=(($39)>>>(0)) < (($45)>>>(0)); //@line 63 "src/buffer.c"
   if ($52) { label = 17; break; } else { label = 21; break; } //@line 63 "src/buffer.c"
  case 17: 
   var $54=((($46)+($39))|0); //@line 66 "src/buffer.c"
   var $55=(($54)>>>(0)) < (($45)>>>(0)); //@line 67 "src/buffer.c"
   if ($55) { var $neoasz_016_i25 = $54;label = 18; break; } else { var $neoasz_0_lcssa_i27 = $54;label = 19; break; } //@line 67 "src/buffer.c"
  case 18: 
   var $neoasz_016_i25;
   var $56=((($neoasz_016_i25)+($46))|0); //@line 68 "src/buffer.c"
   var $57=(($56)>>>(0)) < (($45)>>>(0)); //@line 67 "src/buffer.c"
   if ($57) { var $neoasz_016_i25 = $56;label = 18; break; } else { var $neoasz_0_lcssa_i27 = $56;label = 19; break; } //@line 67 "src/buffer.c"
  case 19: 
   var $neoasz_0_lcssa_i27;
   var $58=HEAP32[(($30)>>2)]; //@line 70 "src/buffer.c"
   var $59=_realloc($58, $neoasz_0_lcssa_i27); //@line 70 "src/buffer.c"
   var $60=(($59)|(0))==0; //@line 71 "src/buffer.c"
   if ($60) { label = 24; break; } else { label = 20; break; } //@line 71 "src/buffer.c"
  case 20: 
   HEAP32[(($30)>>2)]=$59; //@line 74 "src/buffer.c"
   HEAP32[(($10)>>2)]=$neoasz_0_lcssa_i27; //@line 75 "src/buffer.c"
   label = 21; break; //@line 76 "src/buffer.c"
  case 21: 
   HEAP32[(($29)>>2)]=varrp;HEAP32[((($29)+(4))>>2)]=0; //@line 142 "src/buffer.c"
   var $63=HEAP32[(($30)>>2)]; //@line 143 "src/buffer.c"
   var $64=HEAP32[(($8)>>2)]; //@line 143 "src/buffer.c"
   var $65=(($63+$64)|0); //@line 143 "src/buffer.c"
   var $66=HEAP32[(($10)>>2)]; //@line 143 "src/buffer.c"
   var $67=((($66)-($64))|0); //@line 143 "src/buffer.c"
   var $68=_vsnprintf($65, $67, $fmt, $28); //@line 143 "src/buffer.c"
 //@line 144 "src/buffer.c"
   var $69=(($68)|(0)) < 0; //@line 147 "src/buffer.c"
   if ($69) { label = 24; break; } else { label = 22; break; } //@line 147 "src/buffer.c"
  case 22: 
   var $_pre=HEAP32[(($8)>>2)]; //@line 150 "src/buffer.c"
   var $n_035 = $68;var $70 = $_pre;label = 23; break; //@line 147 "src/buffer.c"
  case 23: 
   var $70;
   var $n_035;
   var $71=((($70)+($n_035))|0); //@line 150 "src/buffer.c"
   HEAP32[(($8)>>2)]=$71; //@line 150 "src/buffer.c"
   label = 24; break; //@line 151 "src/buffer.c"
  case 24: 
   STACKTOP = sp;
   return; //@line 151 "src/buffer.c"
  default: assert(0, "bad label: " + label);
 }
}
Module["_bufprintf"] = _bufprintf;
function _bufput($buf, $data, $len) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($buf)|(0))==0; //@line 157 "src/buffer.c"
   if ($1) { label = 3; break; } else { label = 2; break; } //@line 157 "src/buffer.c"
  case 2: 
   var $3=(($buf+12)|0); //@line 157 "src/buffer.c"
   var $4=HEAP32[(($3)>>2)]; //@line 157 "src/buffer.c"
   var $5=(($4)|(0))==0; //@line 157 "src/buffer.c"
   if ($5) { label = 3; break; } else { label = 4; break; } //@line 157 "src/buffer.c"
  case 3: 
   ___assert_func(((1736)|0), 157, ((2624)|0), ((2384)|0)); //@line 157 "src/buffer.c"
   throw "Reached an unreachable!"; //@line 157 "src/buffer.c"
  case 4: 
   var $8=(($buf+4)|0); //@line 159 "src/buffer.c"
   var $9=HEAP32[(($8)>>2)]; //@line 159 "src/buffer.c"
   var $10=((($9)+($len))|0); //@line 159 "src/buffer.c"
   var $11=(($buf+8)|0); //@line 159 "src/buffer.c"
   var $12=HEAP32[(($11)>>2)]; //@line 159 "src/buffer.c"
   var $13=(($10)>>>(0)) > (($12)>>>(0)); //@line 159 "src/buffer.c"
   if ($13) { label = 5; break; } else { var $26 = $9;label = 10; break; } //@line 159 "src/buffer.c"
  case 5: 
   var $15=(($10)>>>(0)) > 16777216; //@line 60 "src/buffer.c"
   if ($15) { label = 11; break; } else { label = 6; break; } //@line 60 "src/buffer.c"
  case 6: 
   var $17=((($12)+($4))|0); //@line 66 "src/buffer.c"
   var $18=(($17)>>>(0)) < (($10)>>>(0)); //@line 67 "src/buffer.c"
   if ($18) { var $neoasz_016_i = $17;label = 7; break; } else { var $neoasz_0_lcssa_i = $17;label = 8; break; } //@line 67 "src/buffer.c"
  case 7: 
   var $neoasz_016_i;
   var $19=((($neoasz_016_i)+($4))|0); //@line 68 "src/buffer.c"
   var $20=(($19)>>>(0)) < (($10)>>>(0)); //@line 67 "src/buffer.c"
   if ($20) { var $neoasz_016_i = $19;label = 7; break; } else { var $neoasz_0_lcssa_i = $19;label = 8; break; } //@line 67 "src/buffer.c"
  case 8: 
   var $neoasz_0_lcssa_i;
   var $21=(($buf)|0); //@line 70 "src/buffer.c"
   var $22=HEAP32[(($21)>>2)]; //@line 70 "src/buffer.c"
   var $23=_realloc($22, $neoasz_0_lcssa_i); //@line 70 "src/buffer.c"
   var $24=(($23)|(0))==0; //@line 71 "src/buffer.c"
   if ($24) { label = 11; break; } else { label = 9; break; } //@line 71 "src/buffer.c"
  case 9: 
   HEAP32[(($21)>>2)]=$23; //@line 74 "src/buffer.c"
   HEAP32[(($11)>>2)]=$neoasz_0_lcssa_i; //@line 75 "src/buffer.c"
   var $_pre=HEAP32[(($8)>>2)]; //@line 162 "src/buffer.c"
   var $26 = $_pre;label = 10; break; //@line 76 "src/buffer.c"
  case 10: 
   var $26;
   var $27=(($buf)|0); //@line 162 "src/buffer.c"
   var $28=HEAP32[(($27)>>2)]; //@line 162 "src/buffer.c"
   var $29=(($28+$26)|0); //@line 162 "src/buffer.c"
   assert($len % 1 === 0);(_memcpy($29, $data, $len)|0); //@line 162 "src/buffer.c"
   var $30=HEAP32[(($8)>>2)]; //@line 163 "src/buffer.c"
   var $31=((($30)+($len))|0); //@line 163 "src/buffer.c"
   HEAP32[(($8)>>2)]=$31; //@line 163 "src/buffer.c"
   label = 11; break; //@line 164 "src/buffer.c"
  case 11: 
   return; //@line 164 "src/buffer.c"
  default: assert(0, "bad label: " + label);
 }
}
function _bufputs($buf, $str) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=_strlen($str); //@line 170 "src/buffer.c"
   var $2=(($buf)|(0))==0; //@line 157 "src/buffer.c"
   if ($2) { label = 3; break; } else { label = 2; break; } //@line 157 "src/buffer.c"
  case 2: 
   var $4=(($buf+12)|0); //@line 157 "src/buffer.c"
   var $5=HEAP32[(($4)>>2)]; //@line 157 "src/buffer.c"
   var $6=(($5)|(0))==0; //@line 157 "src/buffer.c"
   if ($6) { label = 3; break; } else { label = 4; break; } //@line 157 "src/buffer.c"
  case 3: 
   ___assert_func(((1736)|0), 157, ((2624)|0), ((2384)|0)); //@line 157 "src/buffer.c"
   throw "Reached an unreachable!"; //@line 157 "src/buffer.c"
  case 4: 
   var $9=(($buf+4)|0); //@line 159 "src/buffer.c"
   var $10=HEAP32[(($9)>>2)]; //@line 159 "src/buffer.c"
   var $11=((($10)+($1))|0); //@line 159 "src/buffer.c"
   var $12=(($buf+8)|0); //@line 159 "src/buffer.c"
   var $13=HEAP32[(($12)>>2)]; //@line 159 "src/buffer.c"
   var $14=(($11)>>>(0)) > (($13)>>>(0)); //@line 159 "src/buffer.c"
   if ($14) { label = 6; break; } else { label = 5; break; } //@line 159 "src/buffer.c"
  case 5: 
   var $_phi_trans_insert=(($buf)|0);
   var $_pre=HEAP32[(($_phi_trans_insert)>>2)]; //@line 162 "src/buffer.c"
   var $28 = $10;var $27 = $_pre;label = 11; break; //@line 159 "src/buffer.c"
  case 6: 
   var $16=(($11)>>>(0)) > 16777216; //@line 60 "src/buffer.c"
   if ($16) { label = 12; break; } else { label = 7; break; } //@line 60 "src/buffer.c"
  case 7: 
   var $18=((($13)+($5))|0); //@line 66 "src/buffer.c"
   var $19=(($18)>>>(0)) < (($11)>>>(0)); //@line 67 "src/buffer.c"
   if ($19) { var $neoasz_016_i_i = $18;label = 8; break; } else { var $neoasz_0_lcssa_i_i = $18;label = 9; break; } //@line 67 "src/buffer.c"
  case 8: 
   var $neoasz_016_i_i;
   var $20=((($neoasz_016_i_i)+($5))|0); //@line 68 "src/buffer.c"
   var $21=(($20)>>>(0)) < (($11)>>>(0)); //@line 67 "src/buffer.c"
   if ($21) { var $neoasz_016_i_i = $20;label = 8; break; } else { var $neoasz_0_lcssa_i_i = $20;label = 9; break; } //@line 67 "src/buffer.c"
  case 9: 
   var $neoasz_0_lcssa_i_i;
   var $22=(($buf)|0); //@line 70 "src/buffer.c"
   var $23=HEAP32[(($22)>>2)]; //@line 70 "src/buffer.c"
   var $24=_realloc($23, $neoasz_0_lcssa_i_i); //@line 70 "src/buffer.c"
   var $25=(($24)|(0))==0; //@line 71 "src/buffer.c"
   if ($25) { label = 12; break; } else { label = 10; break; } //@line 71 "src/buffer.c"
  case 10: 
   HEAP32[(($22)>>2)]=$24; //@line 74 "src/buffer.c"
   HEAP32[(($12)>>2)]=$neoasz_0_lcssa_i_i; //@line 75 "src/buffer.c"
   var $_pre_i=HEAP32[(($9)>>2)]; //@line 162 "src/buffer.c"
   var $28 = $_pre_i;var $27 = $24;label = 11; break; //@line 76 "src/buffer.c"
  case 11: 
   var $27;
   var $28;
   var $29=(($27+$28)|0); //@line 162 "src/buffer.c"
   assert($1 % 1 === 0);(_memcpy($29, $str, $1)|0); //@line 162 "src/buffer.c"
   var $30=HEAP32[(($9)>>2)]; //@line 163 "src/buffer.c"
   var $31=((($30)+($1))|0); //@line 163 "src/buffer.c"
   HEAP32[(($9)>>2)]=$31; //@line 163 "src/buffer.c"
   label = 12; break; //@line 164 "src/buffer.c"
  case 12: 
   return; //@line 171 "src/buffer.c"
  default: assert(0, "bad label: " + label);
 }
}
Module["_bufputs"] = _bufputs;
function _bufrelease($buf) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($buf)|(0))==0; //@line 191 "src/buffer.c"
   if ($1) { label = 3; break; } else { label = 2; break; } //@line 191 "src/buffer.c"
  case 2: 
   var $3=(($buf)|0); //@line 194 "src/buffer.c"
   var $4=HEAP32[(($3)>>2)]; //@line 194 "src/buffer.c"
   _free($4); //@line 194 "src/buffer.c"
   var $5=$buf; //@line 195 "src/buffer.c"
   _free($5); //@line 195 "src/buffer.c"
   label = 3; break; //@line 196 "src/buffer.c"
  case 3: 
   return; //@line 196 "src/buffer.c"
  default: assert(0, "bad label: " + label);
 }
}
Module["_bufrelease"] = _bufrelease;
function _bufreset($buf) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($buf)|(0))==0; //@line 203 "src/buffer.c"
   if ($1) { label = 3; break; } else { label = 2; break; } //@line 203 "src/buffer.c"
  case 2: 
   var $3=(($buf)|0); //@line 206 "src/buffer.c"
   var $4=HEAP32[(($3)>>2)]; //@line 206 "src/buffer.c"
   _free($4); //@line 206 "src/buffer.c"
   HEAP32[(($3)>>2)]=0; //@line 207 "src/buffer.c"
   var $5=(($buf+8)|0); //@line 208 "src/buffer.c"
   HEAP32[(($5)>>2)]=0; //@line 208 "src/buffer.c"
   var $6=(($buf+4)|0); //@line 208 "src/buffer.c"
   HEAP32[(($6)>>2)]=0; //@line 208 "src/buffer.c"
   label = 3; break; //@line 209 "src/buffer.c"
  case 3: 
   return; //@line 209 "src/buffer.c"
  default: assert(0, "bad label: " + label);
 }
}
Module["_bufreset"] = _bufreset;
function _sd_autolink_issafe($link, $link_len) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($link_len)>>>(0)) > 1; //@line 42 "src/autolink.c"
   if ($1) { label = 2; break; } else { label = 17; break; } //@line 42 "src/autolink.c"
  case 2: 
   var $3=_strncasecmp($link, ((1488)|0), 1); //@line 43 "src/autolink.c"
   var $4=(($3)|(0))==0; //@line 43 "src/autolink.c"
   if ($4) { label = 3; break; } else { label = 4; break; } //@line 43 "src/autolink.c"
  case 3: 
   var $6=(($link+1)|0); //@line 44 "src/autolink.c"
   var $7=HEAP8[($6)]; //@line 44 "src/autolink.c"
   var $8=(($7)&(255)); //@line 44 "src/autolink.c"
   var $9=_isalnum($8); //@line 44 "src/autolink.c"
   var $10=(($9)|(0))==0; //@line 44 "src/autolink.c"
   if ($10) { label = 4; break; } else { var $_0 = 1;label = 5; break; } //@line 44 "src/autolink.c"
  case 4: 
   var $12=(($link_len)>>>(0)) > 7; //@line 42 "src/autolink.c"
   if ($12) { label = 6; break; } else { label = 11; break; } //@line 42 "src/autolink.c"
  case 5: 
   var $_0;
   return $_0; //@line 49 "src/autolink.c"
  case 6: 
   var $15=_strncasecmp($link, ((2352)|0), 7); //@line 43 "src/autolink.c"
   var $16=(($15)|(0))==0; //@line 43 "src/autolink.c"
   if ($16) { label = 7; break; } else { label = 8; break; } //@line 43 "src/autolink.c"
  case 7: 
   var $18=(($link+7)|0); //@line 44 "src/autolink.c"
   var $19=HEAP8[($18)]; //@line 44 "src/autolink.c"
   var $20=(($19)&(255)); //@line 44 "src/autolink.c"
   var $21=_isalnum($20); //@line 44 "src/autolink.c"
   var $22=(($21)|(0))==0; //@line 44 "src/autolink.c"
   if ($22) { label = 8; break; } else { var $_0 = 1;label = 5; break; } //@line 44 "src/autolink.c"
  case 8: 
   var $24=(($link_len)>>>(0)) > 8; //@line 42 "src/autolink.c"
   if ($24) { label = 9; break; } else { label = 11; break; } //@line 42 "src/autolink.c"
  case 9: 
   var $26=_strncasecmp($link, ((2048)|0), 8); //@line 43 "src/autolink.c"
   var $27=(($26)|(0))==0; //@line 43 "src/autolink.c"
   if ($27) { label = 10; break; } else { label = 11; break; } //@line 43 "src/autolink.c"
  case 10: 
   var $29=(($link+8)|0); //@line 44 "src/autolink.c"
   var $30=HEAP8[($29)]; //@line 44 "src/autolink.c"
   var $31=(($30)&(255)); //@line 44 "src/autolink.c"
   var $32=_isalnum($31); //@line 44 "src/autolink.c"
   var $33=(($32)|(0))==0; //@line 44 "src/autolink.c"
   if ($33) { label = 11; break; } else { var $_0 = 1;label = 5; break; } //@line 44 "src/autolink.c"
  case 11: 
   var $34=(($link_len)>>>(0)) > 6; //@line 42 "src/autolink.c"
   if ($34) { label = 12; break; } else { label = 17; break; } //@line 42 "src/autolink.c"
  case 12: 
   var $36=_strncasecmp($link, ((1704)|0), 6); //@line 43 "src/autolink.c"
   var $37=(($36)|(0))==0; //@line 43 "src/autolink.c"
   if ($37) { label = 13; break; } else { label = 14; break; } //@line 43 "src/autolink.c"
  case 13: 
   var $39=(($link+6)|0); //@line 44 "src/autolink.c"
   var $40=HEAP8[($39)]; //@line 44 "src/autolink.c"
   var $41=(($40)&(255)); //@line 44 "src/autolink.c"
   var $42=_isalnum($41); //@line 44 "src/autolink.c"
   var $43=(($42)|(0))==0; //@line 44 "src/autolink.c"
   if ($43) { label = 14; break; } else { var $_0 = 1;label = 5; break; } //@line 44 "src/autolink.c"
  case 14: 
   var $45=(($link_len)>>>(0)) > 7; //@line 42 "src/autolink.c"
   if ($45) { label = 15; break; } else { label = 17; break; } //@line 42 "src/autolink.c"
  case 15: 
   var $47=_strncasecmp($link, ((1496)|0), 7); //@line 43 "src/autolink.c"
   var $48=(($47)|(0))==0; //@line 43 "src/autolink.c"
   if ($48) { label = 16; break; } else { label = 17; break; } //@line 43 "src/autolink.c"
  case 16: 
   var $50=(($link+7)|0); //@line 44 "src/autolink.c"
   var $51=HEAP8[($50)]; //@line 44 "src/autolink.c"
   var $52=(($51)&(255)); //@line 44 "src/autolink.c"
   var $53=_isalnum($52); //@line 44 "src/autolink.c"
   var $54=(($53)|(0))==0; //@line 44 "src/autolink.c"
   if ($54) { label = 17; break; } else { var $_0 = 1;label = 5; break; } //@line 44 "src/autolink.c"
  case 17: 
   var $_0 = 0;label = 5; break;
  default: assert(0, "bad label: " + label);
 }
}
function _sd_autolink__www($rewind_p, $link, $data, $max_rewind, $size, $flags) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($max_rewind)|(0))==0; //@line 172 "src/autolink.c"
   if ($1) { label = 4; break; } else { label = 2; break; } //@line 172 "src/autolink.c"
  case 2: 
   var $3=((($data)-(1))|0); //@line 172 "src/autolink.c"
   var $4=HEAP8[($3)]; //@line 172 "src/autolink.c"
   var $5=(($4)&(255)); //@line 172 "src/autolink.c"
   var $6=_ispunct($5); //@line 172 "src/autolink.c"
   var $7=(($6)|(0))==0; //@line 172 "src/autolink.c"
   if ($7) { label = 3; break; } else { label = 4; break; } //@line 172 "src/autolink.c"
  case 3: 
   var $9=HEAP8[($3)]; //@line 172 "src/autolink.c"
   var $10=(($9)&(255)); //@line 172 "src/autolink.c"
   var $11=_isspace($10); //@line 172 "src/autolink.c"
   var $12=(($11)|(0))==0; //@line 172 "src/autolink.c"
   var $13=(($size)>>>(0)) < 4; //@line 175 "src/autolink.c"
   var $or_cond=$12 | $13; //@line 172 "src/autolink.c"
   if ($or_cond) { var $_0 = 0;label = 18; break; } else { label = 5; break; } //@line 172 "src/autolink.c"
  case 4: 
   var $_old=(($size)>>>(0)) < 4; //@line 175 "src/autolink.c"
   if ($_old) { var $_0 = 0;label = 18; break; } else { label = 5; break; } //@line 175 "src/autolink.c"
  case 5: 
   var $16=_memcmp($data, ((1320)|0), 4); //@line 175 "src/autolink.c"
   var $17=(($16)|(0))==0; //@line 175 "src/autolink.c"
   if ($17) { label = 6; break; } else { var $_0 = 0;label = 18; break; } //@line 175 "src/autolink.c"
  case 6: 
   var $19=HEAP8[($data)]; //@line 140 "src/autolink.c"
   var $20=(($19)&(255)); //@line 140 "src/autolink.c"
   var $21=_isalnum($20); //@line 140 "src/autolink.c"
   var $22=(($21)|(0))==0; //@line 140 "src/autolink.c"
   if ($22) { var $_0 = 0;label = 18; break; } else { label = 7; break; } //@line 140 "src/autolink.c"
  case 7: 
   var $23=((($size)-(1))|0); //@line 143 "src/autolink.c"
   var $24=(($23)>>>(0)) > 1; //@line 143 "src/autolink.c"
   if ($24) { var $i_014_i = 1;var $np_015_i = 0;label = 8; break; } else { var $_0 = 0;label = 18; break; } //@line 143 "src/autolink.c"
  case 8: 
   var $np_015_i;
   var $i_014_i;
   var $25=(($data+$i_014_i)|0); //@line 144 "src/autolink.c"
   var $26=HEAP8[($25)]; //@line 144 "src/autolink.c"
   var $27=(($26 << 24) >> 24)==46; //@line 144 "src/autolink.c"
   if ($27) { label = 9; break; } else { label = 10; break; } //@line 144 "src/autolink.c"
  case 9: 
   var $29=((($np_015_i)+(1))|0); //@line 144 "src/autolink.c"
   var $np_1_i = $29;label = 12; break; //@line 144 "src/autolink.c"
  case 10: 
   var $31=(($26)&(255)); //@line 144 "src/autolink.c"
   var $32=_isalnum($31); //@line 145 "src/autolink.c"
   var $33=(($32)|(0))==0; //@line 145 "src/autolink.c"
   if ($33) { label = 11; break; } else { var $np_1_i = $np_015_i;label = 12; break; } //@line 145 "src/autolink.c"
  case 11: 
   var $35=HEAP8[($25)]; //@line 145 "src/autolink.c"
   var $36=(($35 << 24) >> 24)==45; //@line 145 "src/autolink.c"
   if ($36) { var $np_1_i = $np_015_i;label = 12; break; } else { var $i_0_lcssa_i = $i_014_i;var $np_0_lcssa_i = $np_015_i;label = 13; break; } //@line 145 "src/autolink.c"
  case 12: 
   var $np_1_i;
   var $38=((($i_014_i)+(1))|0); //@line 143 "src/autolink.c"
   var $39=(($38)>>>(0)) < (($23)>>>(0)); //@line 143 "src/autolink.c"
   if ($39) { var $i_014_i = $38;var $np_015_i = $np_1_i;label = 8; break; } else { var $i_0_lcssa_i = $38;var $np_0_lcssa_i = $np_1_i;label = 13; break; } //@line 143 "src/autolink.c"
  case 13: 
   var $np_0_lcssa_i;
   var $i_0_lcssa_i;
   var $40=(($np_0_lcssa_i)|(0))!=0; //@line 157 "src/autolink.c"
   var $41=$40 ? $i_0_lcssa_i : 0; //@line 157 "src/autolink.c"
   var $42=(($41)|(0))==0; //@line 180 "src/autolink.c"
   if ($42) { var $_0 = 0;label = 18; break; } else { var $link_end_0 = $41;label = 14; break; } //@line 180 "src/autolink.c"
  case 14: 
   var $link_end_0;
   var $43=(($link_end_0)>>>(0)) < (($size)>>>(0)); //@line 183 "src/autolink.c"
   if ($43) { label = 15; break; } else { label = 16; break; } //@line 183 "src/autolink.c"
  case 15: 
   var $45=(($data+$link_end_0)|0); //@line 183 "src/autolink.c"
   var $46=HEAP8[($45)]; //@line 183 "src/autolink.c"
   var $47=(($46)&(255)); //@line 183 "src/autolink.c"
   var $48=_isspace($47); //@line 183 "src/autolink.c"
   var $49=(($48)|(0))==0; //@line 183 "src/autolink.c"
   var $50=((($link_end_0)+(1))|0); //@line 184 "src/autolink.c"
   if ($49) { var $link_end_0 = $50;label = 14; break; } else { label = 16; break; }
  case 16: 
   var $51=_autolink_delim($data, $link_end_0); //@line 186 "src/autolink.c"
   var $52=(($51)|(0))==0; //@line 188 "src/autolink.c"
   if ($52) { var $_0 = 0;label = 18; break; } else { label = 17; break; } //@line 188 "src/autolink.c"
  case 17: 
   _bufput($link, $data, $51); //@line 191 "src/autolink.c"
   HEAP32[(($rewind_p)>>2)]=0; //@line 192 "src/autolink.c"
   var $_0 = $51;label = 18; break; //@line 194 "src/autolink.c"
  case 18: 
   var $_0;
   return $_0; //@line 195 "src/autolink.c"
  default: assert(0, "bad label: " + label);
 }
}
function _autolink_delim($data, $link_end) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $i_0 = 0;label = 2; break; //@line 57 "src/autolink.c"
  case 2: 
   var $i_0;
   var $2=(($i_0)>>>(0)) < (($link_end)>>>(0)); //@line 57 "src/autolink.c"
   if ($2) { label = 3; break; } else { var $_034_ph = $link_end;label = 4; break; } //@line 57 "src/autolink.c"
  case 3: 
   var $4=(($data+$i_0)|0); //@line 58 "src/autolink.c"
   var $5=HEAP8[($4)]; //@line 58 "src/autolink.c"
   var $6=(($5 << 24) >> 24)==60; //@line 58 "src/autolink.c"
   var $7=((($i_0)+(1))|0); //@line 57 "src/autolink.c"
   if ($6) { var $_034_ph = $i_0;label = 4; break; } else { var $i_0 = $7;label = 2; break; } //@line 58 "src/autolink.c"
  case 4: 
   var $_034_ph;
   var $cond11=(($_034_ph)|(0))==0; //@line 63 "src/autolink.c"
   if ($cond11) { var $_0 = 0;label = 24; break; } else { var $_03412 = $_034_ph;label = 5; break; } //@line 63 "src/autolink.c"
  case 5: 
   var $_03412;
   var $8=((($_03412)-(1))|0); //@line 64 "src/autolink.c"
   var $9=(($data+$8)|0); //@line 64 "src/autolink.c"
   var $10=HEAP8[($9)]; //@line 64 "src/autolink.c"
   var $11=(($10)&(255)); //@line 64 "src/autolink.c"
   var $memchr=_memchr(((1144)|0), $11, 5); //@line 64 "src/autolink.c"
   var $12=(($memchr)|(0))==0; //@line 64 "src/autolink.c"
   if ($12) { label = 6; break; } else { var $_034_be = $8;label = 13; break; } //@line 64 "src/autolink.c"
  case 6: 
   var $14=(($10 << 24) >> 24)==59; //@line 67 "src/autolink.c"
   if ($14) { label = 7; break; } else { label = 14; break; } //@line 67 "src/autolink.c"
  case 7: 
   var $16=((($_03412)-(2))|0); //@line 68 "src/autolink.c"
   var $new_end_0 = $16;label = 8; break; //@line 70 "src/autolink.c"
  case 8: 
   var $new_end_0;
   var $18=(($new_end_0)|(0))==0; //@line 70 "src/autolink.c"
   if ($18) { var $new_end_0_lcssa = 0;label = 10; break; } else { label = 9; break; } //@line 70 "src/autolink.c"
  case 9: 
   var $20=(($data+$new_end_0)|0); //@line 70 "src/autolink.c"
   var $21=HEAP8[($20)]; //@line 70 "src/autolink.c"
   var $22=(($21)&(255)); //@line 70 "src/autolink.c"
   var $23=_isalpha($22); //@line 70 "src/autolink.c"
   var $24=(($23)|(0))==0; //@line 70 "src/autolink.c"
   var $25=((($new_end_0)-(1))|0); //@line 71 "src/autolink.c"
   if ($24) { var $new_end_0_lcssa = $new_end_0;label = 10; break; } else { var $new_end_0 = $25;label = 8; break; }
  case 10: 
   var $new_end_0_lcssa;
   var $26=(($new_end_0_lcssa)>>>(0)) < (($16)>>>(0)); //@line 73 "src/autolink.c"
   if ($26) { label = 11; break; } else { label = 12; break; } //@line 73 "src/autolink.c"
  case 11: 
   var $28=(($data+$new_end_0_lcssa)|0); //@line 73 "src/autolink.c"
   var $29=HEAP8[($28)]; //@line 73 "src/autolink.c"
   var $30=(($29 << 24) >> 24)==38; //@line 73 "src/autolink.c"
   if ($30) { var $_034_be = $new_end_0_lcssa;label = 13; break; } else { label = 12; break; } //@line 73 "src/autolink.c"
  case 12: 
   var $_034_be = $8;label = 13; break;
  case 13: 
   var $_034_be;
   var $cond=(($_034_be)|(0))==0; //@line 63 "src/autolink.c"
   if ($cond) { var $_0 = 0;label = 24; break; } else { var $_03412 = $_034_be;label = 5; break; } //@line 63 "src/autolink.c"
  case 14: 
   switch((($11)|(0))) {
   case 41:{
    label = 15; break;
   }
   case 93:{
    label = 16; break;
   }
   case 125:{
    label = 17; break;
   }
   case 34: case 39:{
    var $copen_0_ph = $11;label = 18; break;
   }
   default: {
   var $_0 = $_03412;label = 24; break;
   }
   } break; 
  case 15: 
   var $copen_0_ph = 40;label = 18; break; //@line 89 "src/autolink.c"
  case 16: 
   var $copen_0_ph = 91;label = 18; break; //@line 90 "src/autolink.c"
  case 17: 
   var $copen_0_ph = 123;label = 18; break; //@line 91 "src/autolink.c"
  case 18: 
   var $copen_0_ph;
   var $36=(($_03412)|(0))==0; //@line 119 "src/autolink.c"
   if ($36) { var $closing_0_lcssa = 0;var $opening_0_lcssa = 0;label = 23; break; } else { var $closing_03 = 0;var $opening_04 = 0;var $i1_05 = 0;label = 19; break; } //@line 119 "src/autolink.c"
  case 19: 
   var $i1_05;
   var $opening_04;
   var $closing_03;
   var $37=(($data+$i1_05)|0); //@line 120 "src/autolink.c"
   var $38=HEAP8[($37)]; //@line 120 "src/autolink.c"
   var $39=(($38)&(255)); //@line 120 "src/autolink.c"
   var $40=(($39)|(0))==(($copen_0_ph)|(0)); //@line 120 "src/autolink.c"
   if ($40) { label = 20; break; } else { label = 21; break; } //@line 120 "src/autolink.c"
  case 20: 
   var $42=((($opening_04)+(1))|0); //@line 121 "src/autolink.c"
   var $opening_1 = $42;var $closing_1 = $closing_03;label = 22; break; //@line 121 "src/autolink.c"
  case 21: 
   var $44=(($38 << 24) >> 24)==(($10 << 24) >> 24); //@line 122 "src/autolink.c"
   var $45=(($44)&(1)); //@line 122 "src/autolink.c"
   var $_closing_0=((($45)+($closing_03))|0); //@line 122 "src/autolink.c"
   var $opening_1 = $opening_04;var $closing_1 = $_closing_0;label = 22; break; //@line 122 "src/autolink.c"
  case 22: 
   var $closing_1;
   var $opening_1;
   var $47=((($i1_05)+(1))|0); //@line 125 "src/autolink.c"
   var $48=(($47)>>>(0)) < (($_03412)>>>(0)); //@line 119 "src/autolink.c"
   if ($48) { var $closing_03 = $closing_1;var $opening_04 = $opening_1;var $i1_05 = $47;label = 19; break; } else { var $closing_0_lcssa = $closing_1;var $opening_0_lcssa = $opening_1;label = 23; break; } //@line 119 "src/autolink.c"
  case 23: 
   var $opening_0_lcssa;
   var $closing_0_lcssa;
   var $49=(($closing_0_lcssa)|(0))==(($opening_0_lcssa)|(0)); //@line 128 "src/autolink.c"
   var $_034_=$49 ? $_03412 : $8; //@line 128 "src/autolink.c"
   return $_034_; //@line 128 "src/autolink.c"
  case 24: 
   var $_0;
   return $_0; //@line 133 "src/autolink.c"
  default: assert(0, "bad label: " + label);
 }
}
function _sd_autolink__email($rewind_p, $link, $data, $max_rewind, $size, $flags) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($max_rewind)|(0))==0; //@line 209 "src/autolink.c"
   if ($1) { var $_0 = 0;label = 17; break; } else { var $rewind_041 = 0;label = 2; break; } //@line 209 "src/autolink.c"
  case 2: 
   var $rewind_041;
   var $2=$rewind_041 ^ -1; //@line 210 "src/autolink.c"
   var $3=(($data+$2)|0); //@line 210 "src/autolink.c"
   var $4=HEAP8[($3)]; //@line 210 "src/autolink.c"
   var $5=(($4)&(255)); //@line 212 "src/autolink.c"
   var $6=_isalnum($5); //@line 212 "src/autolink.c"
   var $7=(($6)|(0))==0; //@line 212 "src/autolink.c"
   if ($7) { label = 3; break; } else { label = 4; break; } //@line 212 "src/autolink.c"
  case 3: 
   var $memchr=_memchr(((1176)|0), $5, 5); //@line 215 "src/autolink.c"
   var $9=(($memchr)|(0))==0; //@line 215 "src/autolink.c"
   if ($9) { var $rewind_0_lcssa = $rewind_041;label = 5; break; } else { label = 4; break; } //@line 215 "src/autolink.c"
  case 4: 
   var $11=((($rewind_041)+(1))|0); //@line 209 "src/autolink.c"
   var $12=(($11)>>>(0)) < (($max_rewind)>>>(0)); //@line 209 "src/autolink.c"
   if ($12) { var $rewind_041 = $11;label = 2; break; } else { var $rewind_0_lcssa = $11;label = 5; break; } //@line 209 "src/autolink.c"
  case 5: 
   var $rewind_0_lcssa;
   var $13=(($rewind_0_lcssa)|(0))==0; //@line 221 "src/autolink.c"
   if ($13) { var $_0 = 0;label = 17; break; } else { label = 6; break; } //@line 221 "src/autolink.c"
  case 6: 
   var $14=((($size)-(1))|0); //@line 232 "src/autolink.c"
   var $15=(($size)|(0))==0; //@line 224 "src/autolink.c"
   if ($15) { var $_0 = 0;label = 17; break; } else { var $nb_036 = 0;var $np_037 = 0;var $link_end_038 = 0;label = 7; break; } //@line 224 "src/autolink.c"
  case 7: 
   var $link_end_038;
   var $np_037;
   var $nb_036;
   var $16=(($data+$link_end_038)|0); //@line 225 "src/autolink.c"
   var $17=HEAP8[($16)]; //@line 225 "src/autolink.c"
   var $18=(($17)&(255)); //@line 227 "src/autolink.c"
   var $19=_isalnum($18); //@line 227 "src/autolink.c"
   var $20=(($19)|(0))==0; //@line 227 "src/autolink.c"
   if ($20) { label = 8; break; } else { var $np_1 = $np_037;var $nb_1 = $nb_036;label = 12; break; } //@line 227 "src/autolink.c"
  case 8: 
   if ((($17 << 24) >> 24)==64) {
    label = 9; break;
   }
   else if ((($17 << 24) >> 24)==46) {
    label = 10; break;
   }
   else if ((($17 << 24) >> 24)==45 | (($17 << 24) >> 24)==95) {
    var $np_1 = $np_037;var $nb_1 = $nb_036;label = 12; break;
   }
   else {
   var $nb_0_lcssa = $nb_036;var $np_0_lcssa = $np_037;var $link_end_0_lcssa = $link_end_038;label = 13; break;
   }
  case 9: 
   var $23=((($nb_036)+(1))|0); //@line 231 "src/autolink.c"
   var $np_1 = $np_037;var $nb_1 = $23;label = 12; break; //@line 231 "src/autolink.c"
  case 10: 
   var $25=(($link_end_038)>>>(0)) < (($14)>>>(0)); //@line 232 "src/autolink.c"
   if ($25) { label = 11; break; } else { var $nb_0_lcssa = $nb_036;var $np_0_lcssa = $np_037;var $link_end_0_lcssa = $link_end_038;label = 13; break; } //@line 232 "src/autolink.c"
  case 11: 
   var $27=((($np_037)+(1))|0); //@line 233 "src/autolink.c"
   var $np_1 = $27;var $nb_1 = $nb_036;label = 12; break; //@line 233 "src/autolink.c"
  case 12: 
   var $nb_1;
   var $np_1;
   var $29=((($link_end_038)+(1))|0); //@line 224 "src/autolink.c"
   var $30=(($29)>>>(0)) < (($size)>>>(0)); //@line 224 "src/autolink.c"
   if ($30) { var $nb_036 = $nb_1;var $np_037 = $np_1;var $link_end_038 = $29;label = 7; break; } else { var $nb_0_lcssa = $nb_1;var $np_0_lcssa = $np_1;var $link_end_0_lcssa = $29;label = 13; break; } //@line 224 "src/autolink.c"
  case 13: 
   var $link_end_0_lcssa;
   var $np_0_lcssa;
   var $nb_0_lcssa;
   var $notlhs=(($link_end_0_lcssa)>>>(0)) < 2; //@line 238 "src/autolink.c"
   var $notrhs=(($nb_0_lcssa)|(0))!=1; //@line 238 "src/autolink.c"
   var $or_cond_not=$notrhs | $notlhs; //@line 238 "src/autolink.c"
   var $31=(($np_0_lcssa)|(0))==0; //@line 238 "src/autolink.c"
   var $or_cond35=$or_cond_not | $31; //@line 238 "src/autolink.c"
   if ($or_cond35) { var $_0 = 0;label = 17; break; } else { label = 14; break; } //@line 238 "src/autolink.c"
  case 14: 
   var $33=((($link_end_0_lcssa)-(1))|0); //@line 239 "src/autolink.c"
   var $34=(($data+$33)|0); //@line 239 "src/autolink.c"
   var $35=HEAP8[($34)]; //@line 239 "src/autolink.c"
   var $36=(($35)&(255)); //@line 239 "src/autolink.c"
   var $37=_isalpha($36); //@line 239 "src/autolink.c"
   var $38=(($37)|(0))==0; //@line 239 "src/autolink.c"
   if ($38) { var $_0 = 0;label = 17; break; } else { label = 15; break; } //@line 239 "src/autolink.c"
  case 15: 
   var $40=_autolink_delim($data, $link_end_0_lcssa); //@line 242 "src/autolink.c"
   var $41=(($40)|(0))==0; //@line 244 "src/autolink.c"
   if ($41) { var $_0 = 0;label = 17; break; } else { label = 16; break; } //@line 244 "src/autolink.c"
  case 16: 
   var $43=(((-$rewind_0_lcssa))|0); //@line 247 "src/autolink.c"
   var $44=(($data+$43)|0); //@line 247 "src/autolink.c"
   var $45=((($40)+($rewind_0_lcssa))|0); //@line 247 "src/autolink.c"
   _bufput($link, $44, $45); //@line 247 "src/autolink.c"
   HEAP32[(($rewind_p)>>2)]=$rewind_0_lcssa; //@line 248 "src/autolink.c"
   var $_0 = $40;label = 17; break; //@line 250 "src/autolink.c"
  case 17: 
   var $_0;
   return $_0; //@line 251 "src/autolink.c"
  default: assert(0, "bad label: " + label);
 }
}
function _sd_autolink__url($rewind_p, $link, $data, $max_rewind, $size, $flags) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($size)>>>(0)) < 4; //@line 264 "src/autolink.c"
   if ($1) { var $_0 = 0;label = 22; break; } else { label = 2; break; } //@line 264 "src/autolink.c"
  case 2: 
   var $3=(($data+1)|0); //@line 264 "src/autolink.c"
   var $4=HEAP8[($3)]; //@line 264 "src/autolink.c"
   var $5=(($4 << 24) >> 24)==47; //@line 264 "src/autolink.c"
   if ($5) { label = 3; break; } else { var $_0 = 0;label = 22; break; } //@line 264 "src/autolink.c"
  case 3: 
   var $7=(($data+2)|0); //@line 264 "src/autolink.c"
   var $8=HEAP8[($7)]; //@line 264 "src/autolink.c"
   var $9=(($8 << 24) >> 24)==47; //@line 264 "src/autolink.c"
   if ($9) { var $rewind_0 = 0;label = 4; break; } else { var $_0 = 0;label = 22; break; } //@line 264 "src/autolink.c"
  case 4: 
   var $rewind_0;
   var $10=(($rewind_0)>>>(0)) < (($max_rewind)>>>(0)); //@line 267 "src/autolink.c"
   if ($10) { label = 5; break; } else { label = 6; break; } //@line 267 "src/autolink.c"
  case 5: 
   var $12=$rewind_0 ^ -1; //@line 267 "src/autolink.c"
   var $13=(($data+$12)|0); //@line 267 "src/autolink.c"
   var $14=HEAP8[($13)]; //@line 267 "src/autolink.c"
   var $15=(($14)&(255)); //@line 267 "src/autolink.c"
   var $16=_isalpha($15); //@line 267 "src/autolink.c"
   var $17=(($16)|(0))==0; //@line 267 "src/autolink.c"
   var $18=((($rewind_0)+(1))|0); //@line 268 "src/autolink.c"
   if ($17) { label = 6; break; } else { var $rewind_0 = $18;label = 4; break; }
  case 6: 
   var $19=(((-$rewind_0))|0); //@line 270 "src/autolink.c"
   var $20=(($data+$19)|0); //@line 270 "src/autolink.c"
   var $21=((($rewind_0)+($size))|0); //@line 270 "src/autolink.c"
   var $22=_sd_autolink_issafe($20, $21); //@line 270 "src/autolink.c"
   var $23=(($22)|(0))==0; //@line 270 "src/autolink.c"
   if ($23) { var $_0 = 0;label = 22; break; } else { label = 7; break; } //@line 270 "src/autolink.c"
  case 7: 
   var $25=(($data+3)|0); //@line 275 "src/autolink.c"
   var $26=$flags & 1; //@line 275 "src/autolink.c"
   var $27=HEAP8[($25)]; //@line 140 "src/autolink.c"
   var $28=(($27)&(255)); //@line 140 "src/autolink.c"
   var $29=_isalnum($28); //@line 140 "src/autolink.c"
   var $30=(($29)|(0))==0; //@line 140 "src/autolink.c"
   if ($30) { var $_0 = 0;label = 22; break; } else { label = 8; break; } //@line 140 "src/autolink.c"
  case 8: 
   var $31=((($size)-(4))|0); //@line 143 "src/autolink.c"
   var $32=(($31)>>>(0)) > 1; //@line 143 "src/autolink.c"
   if ($32) { var $i_014_i = 1;var $np_015_i = 0;label = 9; break; } else { var $i_0_lcssa_i = 1;var $np_0_lcssa_i = 0;label = 14; break; } //@line 143 "src/autolink.c"
  case 9: 
   var $np_015_i;
   var $i_014_i;
   var $_sum=((($i_014_i)+(3))|0); //@line 144 "src/autolink.c"
   var $33=(($data+$_sum)|0); //@line 144 "src/autolink.c"
   var $34=HEAP8[($33)]; //@line 144 "src/autolink.c"
   var $35=(($34 << 24) >> 24)==46; //@line 144 "src/autolink.c"
   if ($35) { label = 10; break; } else { label = 11; break; } //@line 144 "src/autolink.c"
  case 10: 
   var $37=((($np_015_i)+(1))|0); //@line 144 "src/autolink.c"
   var $np_1_i = $37;label = 13; break; //@line 144 "src/autolink.c"
  case 11: 
   var $39=(($34)&(255)); //@line 144 "src/autolink.c"
   var $40=_isalnum($39); //@line 145 "src/autolink.c"
   var $41=(($40)|(0))==0; //@line 145 "src/autolink.c"
   if ($41) { label = 12; break; } else { var $np_1_i = $np_015_i;label = 13; break; } //@line 145 "src/autolink.c"
  case 12: 
   var $43=HEAP8[($33)]; //@line 145 "src/autolink.c"
   var $44=(($43 << 24) >> 24)==45; //@line 145 "src/autolink.c"
   if ($44) { var $np_1_i = $np_015_i;label = 13; break; } else { var $i_0_lcssa_i = $i_014_i;var $np_0_lcssa_i = $np_015_i;label = 14; break; } //@line 145 "src/autolink.c"
  case 13: 
   var $np_1_i;
   var $46=((($i_014_i)+(1))|0); //@line 143 "src/autolink.c"
   var $47=(($46)>>>(0)) < (($31)>>>(0)); //@line 143 "src/autolink.c"
   if ($47) { var $i_014_i = $46;var $np_015_i = $np_1_i;label = 9; break; } else { var $i_0_lcssa_i = $46;var $np_0_lcssa_i = $np_1_i;label = 14; break; } //@line 143 "src/autolink.c"
  case 14: 
   var $np_0_lcssa_i;
   var $i_0_lcssa_i;
   var $48=(($26)|(0))==0; //@line 148 "src/autolink.c"
   if ($48) { label = 15; break; } else { var $_0_i = $i_0_lcssa_i;label = 16; break; } //@line 148 "src/autolink.c"
  case 15: 
   var $50=(($np_0_lcssa_i)|(0))!=0; //@line 157 "src/autolink.c"
   var $51=$50 ? $i_0_lcssa_i : 0; //@line 157 "src/autolink.c"
   var $_0_i = $51;label = 16; break; //@line 157 "src/autolink.c"
  case 16: 
   var $_0_i;
   var $52=(($_0_i)|(0))==0; //@line 280 "src/autolink.c"
   if ($52) { var $_0 = 0;label = 22; break; } else { label = 17; break; } //@line 280 "src/autolink.c"
  case 17: 
   var $54=((($_0_i)+(3))|0); //@line 283 "src/autolink.c"
   var $link_end_0 = $54;label = 18; break; //@line 284 "src/autolink.c"
  case 18: 
   var $link_end_0;
   var $56=(($link_end_0)>>>(0)) < (($size)>>>(0)); //@line 284 "src/autolink.c"
   if ($56) { label = 19; break; } else { label = 20; break; } //@line 284 "src/autolink.c"
  case 19: 
   var $58=(($data+$link_end_0)|0); //@line 284 "src/autolink.c"
   var $59=HEAP8[($58)]; //@line 284 "src/autolink.c"
   var $60=(($59)&(255)); //@line 284 "src/autolink.c"
   var $61=_isspace($60); //@line 284 "src/autolink.c"
   var $62=(($61)|(0))==0; //@line 284 "src/autolink.c"
   var $63=((($link_end_0)+(1))|0); //@line 285 "src/autolink.c"
   if ($62) { var $link_end_0 = $63;label = 18; break; } else { label = 20; break; }
  case 20: 
   var $64=_autolink_delim($data, $link_end_0); //@line 287 "src/autolink.c"
   var $65=(($64)|(0))==0; //@line 289 "src/autolink.c"
   if ($65) { var $_0 = 0;label = 22; break; } else { label = 21; break; } //@line 289 "src/autolink.c"
  case 21: 
   var $67=((($64)+($rewind_0))|0); //@line 292 "src/autolink.c"
   _bufput($link, $20, $67); //@line 292 "src/autolink.c"
   HEAP32[(($rewind_p)>>2)]=$rewind_0; //@line 293 "src/autolink.c"
   var $_0 = $64;label = 22; break; //@line 295 "src/autolink.c"
  case 22: 
   var $_0;
   return $_0; //@line 296 "src/autolink.c"
  default: assert(0, "bad label: " + label);
 }
}
function _create_sd_callbacks() {
 var label = 0;
 var $1=_malloc(104); //@line 21 "src/redcarpet_js.c"
 var $2=$1; //@line 21 "src/redcarpet_js.c"
 return $2; //@line 21 "src/redcarpet_js.c"
}
Module["_create_sd_callbacks"] = _create_sd_callbacks;
function _create_html_renderopt() {
 var label = 0;
 var $1=_malloc(20); //@line 25 "src/redcarpet_js.c"
 var $2=$1; //@line 25 "src/redcarpet_js.c"
 return $2; //@line 25 "src/redcarpet_js.c"
}
Module["_create_html_renderopt"] = _create_html_renderopt;
function _sdhtml_is_tag($tag_data, $tag_size, $tagname) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($tag_size)>>>(0)) < 3; //@line 36 "html/html.c"
   if ($1) { var $_019 = 0;label = 11; break; } else { label = 2; break; } //@line 36 "html/html.c"
  case 2: 
   var $3=HEAP8[($tag_data)]; //@line 36 "html/html.c"
   var $4=(($3 << 24) >> 24)==60; //@line 36 "html/html.c"
   if ($4) { label = 3; break; } else { var $_019 = 0;label = 11; break; } //@line 36 "html/html.c"
  case 3: 
   var $6=(($tag_data+1)|0); //@line 41 "html/html.c"
   var $7=HEAP8[($6)]; //@line 41 "html/html.c"
   var $8=(($7 << 24) >> 24)==47; //@line 41 "html/html.c"
   var $_=$8 ? 2 : 1; //@line 41 "html/html.c"
   var $9=(($_)>>>(0)) < (($tag_size)>>>(0)); //@line 46 "html/html.c"
   if ($9) { var $_022 = $tagname;var $i_023 = $_;label = 4; break; } else { var $i_0_lcssa = $_;label = 7; break; } //@line 46 "html/html.c"
  case 4: 
   var $i_023;
   var $_022;
   var $10=HEAP8[($_022)]; //@line 47 "html/html.c"
   var $11=(($10 << 24) >> 24)==0; //@line 47 "html/html.c"
   if ($11) { var $i_0_lcssa = $i_023;label = 7; break; } else { label = 5; break; } //@line 47 "html/html.c"
  case 5: 
   var $13=(($10 << 24) >> 24); //@line 47 "html/html.c"
   var $14=(($tag_data+$i_023)|0); //@line 50 "html/html.c"
   var $15=HEAP8[($14)]; //@line 50 "html/html.c"
   var $16=(($15)&(255)); //@line 50 "html/html.c"
   var $17=(($16)|(0))==(($13)|(0)); //@line 50 "html/html.c"
   if ($17) { label = 6; break; } else { var $_019 = 0;label = 11; break; } //@line 50 "html/html.c"
  case 6: 
   var $19=((($i_023)+(1))|0); //@line 46 "html/html.c"
   var $20=(($_022+1)|0); //@line 46 "html/html.c"
   var $21=(($19)>>>(0)) < (($tag_size)>>>(0)); //@line 46 "html/html.c"
   if ($21) { var $_022 = $20;var $i_023 = $19;label = 4; break; } else { var $i_0_lcssa = $19;label = 7; break; } //@line 46 "html/html.c"
  case 7: 
   var $i_0_lcssa;
   var $22=(($i_0_lcssa)|(0))==(($tag_size)|(0)); //@line 54 "html/html.c"
   if ($22) { var $_019 = 0;label = 11; break; } else { label = 8; break; } //@line 54 "html/html.c"
  case 8: 
   var $24=(($tag_data+$i_0_lcssa)|0); //@line 57 "html/html.c"
   var $25=HEAP8[($24)]; //@line 57 "html/html.c"
   var $26=(($25)&(255)); //@line 57 "html/html.c"
   var $27=_isspace($26); //@line 57 "html/html.c"
   var $28=(($27)|(0))==0; //@line 57 "html/html.c"
   if ($28) { label = 9; break; } else { label = 10; break; } //@line 57 "html/html.c"
  case 9: 
   var $30=HEAP8[($24)]; //@line 57 "html/html.c"
   var $31=(($30 << 24) >> 24)==62; //@line 57 "html/html.c"
   if ($31) { label = 10; break; } else { var $_019 = 0;label = 11; break; } //@line 57 "html/html.c"
  case 10: 
   var $_019 = $_;label = 11; break; //@line 58 "html/html.c"
  case 11: 
   var $_019;
   return $_019; //@line 61 "html/html.c"
  default: assert(0, "bad label: " + label);
 }
}
function _sdhtml_toc_renderer($callbacks, $options) {
 var label = 0;
 var $1=$options; //@line 577 "html/html.c"
 HEAP32[(($1)>>2)]=0; HEAP32[((($1)+(4))>>2)]=0; HEAP32[((($1)+(8))>>2)]=0; HEAP32[((($1)+(12))>>2)]=0; HEAP32[((($1)+(16))>>2)]=0; //@line 577 "html/html.c"
 var $2=(($options+12)|0); //@line 578 "html/html.c"
 HEAP32[(($2)>>2)]=64; //@line 578 "html/html.c"
 var $3=$callbacks; //@line 580 "html/html.c"
 assert(104 % 1 === 0);(_memcpy($3, 344, 104)|0); //@line 580 "html/html.c"
 return; //@line 581 "html/html.c"
}
Module["_sdhtml_toc_renderer"] = _sdhtml_toc_renderer;
function _toc_header($ob, $text, $level, $opaque) {
 var label = 0;
 var tempVarArgs = 0;
 var sp  = STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($opaque+4)|0); //@line 496 "html/html.c"
   var $2=$1; //@line 496 "html/html.c"
   var $3=HEAP32[(($2)>>2)]; //@line 496 "html/html.c"
   var $4=(($3)|(0))==0; //@line 496 "html/html.c"
   if ($4) { label = 3; break; } else { label = 2; break; } //@line 496 "html/html.c"
  case 2: 
   var $_phi_trans_insert=(($opaque+8)|0);
   var $_phi_trans_insert27=$_phi_trans_insert;
   var $_pre=HEAP32[(($_phi_trans_insert27)>>2)]; //@line 499 "html/html.c"
   var $10 = $_pre;label = 4; break; //@line 496 "html/html.c"
  case 3: 
   var $6=((($level)-(1))|0); //@line 497 "html/html.c"
   var $7=(($opaque+8)|0); //@line 497 "html/html.c"
   var $8=$7; //@line 497 "html/html.c"
   HEAP32[(($8)>>2)]=$6; //@line 497 "html/html.c"
   var $10 = $6;label = 4; break; //@line 498 "html/html.c"
  case 4: 
   var $10;
   var $11=((($level)-($10))|0); //@line 499 "html/html.c"
   var $12=(($11)|(0)) > (($3)|(0)); //@line 501 "html/html.c"
   if ($12) { label = 5; break; } else { label = 6; break; } //@line 501 "html/html.c"
  case 5: 
   _bufput($ob, ((1288)|0), 10); //@line 503 "html/html.c"
   var $13=HEAP32[(($2)>>2)]; //@line 504 "html/html.c"
   var $14=((($13)+(1))|0); //@line 504 "html/html.c"
   HEAP32[(($2)>>2)]=$14; //@line 504 "html/html.c"
   var $15=(($11)|(0)) > (($14)|(0)); //@line 502 "html/html.c"
   if ($15) { label = 5; break; } else { label = 11; break; } //@line 502 "html/html.c"
  case 6: 
   var $17=(($11)|(0)) < (($3)|(0)); //@line 506 "html/html.c"
   if ($17) { label = 7; break; } else { label = 10; break; } //@line 506 "html/html.c"
  case 7: 
   _bufput($ob, ((1816)|0), 6); //@line 507 "html/html.c"
   var $19=HEAP32[(($2)>>2)]; //@line 508 "html/html.c"
   var $20=(($11)|(0)) < (($19)|(0)); //@line 508 "html/html.c"
   if ($20) { label = 8; break; } else { label = 9; break; } //@line 508 "html/html.c"
  case 8: 
   _bufput($ob, ((1272)|0), 12); //@line 509 "html/html.c"
   var $21=HEAP32[(($2)>>2)]; //@line 510 "html/html.c"
   var $22=((($21)-(1))|0); //@line 510 "html/html.c"
   HEAP32[(($2)>>2)]=$22; //@line 510 "html/html.c"
   var $23=(($11)|(0)) < (($22)|(0)); //@line 508 "html/html.c"
   if ($23) { label = 8; break; } else { label = 9; break; } //@line 508 "html/html.c"
  case 9: 
   _bufput($ob, ((1264)|0), 5); //@line 512 "html/html.c"
   label = 11; break; //@line 513 "html/html.c"
  case 10: 
   _bufput($ob, ((1232)|0), 11); //@line 514 "html/html.c"
   label = 11; break;
  case 11: 
   var $25=$opaque; //@line 517 "html/html.c"
   var $26=HEAP32[(($25)>>2)]; //@line 517 "html/html.c"
   var $27=((($26)+(1))|0); //@line 517 "html/html.c"
   HEAP32[(($25)>>2)]=$27; //@line 517 "html/html.c"
   _bufprintf($ob, ((1208)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$26,tempVarArgs)); STACKTOP=tempVarArgs; //@line 517 "html/html.c"
   var $28=(($text)|(0))==0; //@line 518 "html/html.c"
   if ($28) { label = 13; break; } else { label = 12; break; } //@line 518 "html/html.c"
  case 12: 
   var $30=(($text)|0); //@line 519 "html/html.c"
   var $31=HEAP32[(($30)>>2)]; //@line 519 "html/html.c"
   var $32=(($text+4)|0); //@line 519 "html/html.c"
   var $33=HEAP32[(($32)>>2)]; //@line 519 "html/html.c"
   _houdini_escape_html0($ob, $31, $33, 0); //@line 65 "html/html.c"
   label = 13; break; //@line 519 "html/html.c"
  case 13: 
   _bufput($ob, ((1184)|0), 5); //@line 520 "html/html.c"
   STACKTOP = sp;
   return; //@line 521 "html/html.c"
  default: assert(0, "bad label: " + label);
 }
}
function _rndr_codespan($ob, $text, $opaque) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   _bufput($ob, ((1328)|0), 6); //@line 166 "html/html.c"
   var $1=(($text)|(0))==0; //@line 167 "html/html.c"
   if ($1) { label = 3; break; } else { label = 2; break; } //@line 167 "html/html.c"
  case 2: 
   var $3=(($text)|0); //@line 167 "html/html.c"
   var $4=HEAP32[(($3)>>2)]; //@line 167 "html/html.c"
   var $5=(($text+4)|0); //@line 167 "html/html.c"
   var $6=HEAP32[(($5)>>2)]; //@line 167 "html/html.c"
   _houdini_escape_html0($ob, $4, $6, 0); //@line 65 "html/html.c"
   label = 3; break; //@line 167 "html/html.c"
  case 3: 
   _bufput($ob, ((1312)|0), 7); //@line 168 "html/html.c"
   return 1; //@line 169 "html/html.c"
  default: assert(0, "bad label: " + label);
 }
}
function _bufputc($buf, $c) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($buf)|(0))==0; //@line 178 "src/buffer.c"
   if ($1) { label = 3; break; } else { label = 2; break; } //@line 178 "src/buffer.c"
  case 2: 
   var $3=(($buf+12)|0); //@line 178 "src/buffer.c"
   var $4=HEAP32[(($3)>>2)]; //@line 178 "src/buffer.c"
   var $5=(($4)|(0))==0; //@line 178 "src/buffer.c"
   if ($5) { label = 3; break; } else { label = 4; break; } //@line 178 "src/buffer.c"
  case 3: 
   ___assert_func(((1736)|0), 178, ((2616)|0), ((2384)|0)); //@line 178 "src/buffer.c"
   throw "Reached an unreachable!"; //@line 178 "src/buffer.c"
  case 4: 
   var $8=(($buf+4)|0); //@line 180 "src/buffer.c"
   var $9=HEAP32[(($8)>>2)]; //@line 180 "src/buffer.c"
   var $10=((($9)+(1))|0); //@line 180 "src/buffer.c"
   var $11=(($buf+8)|0); //@line 180 "src/buffer.c"
   var $12=HEAP32[(($11)>>2)]; //@line 180 "src/buffer.c"
   var $13=(($10)>>>(0)) > (($12)>>>(0)); //@line 180 "src/buffer.c"
   if ($13) { label = 5; break; } else { var $26 = $9;label = 10; break; } //@line 180 "src/buffer.c"
  case 5: 
   var $15=(($10)>>>(0)) > 16777216; //@line 60 "src/buffer.c"
   if ($15) { label = 11; break; } else { label = 6; break; } //@line 60 "src/buffer.c"
  case 6: 
   var $17=((($12)+($4))|0); //@line 66 "src/buffer.c"
   var $18=(($17)>>>(0)) < (($10)>>>(0)); //@line 67 "src/buffer.c"
   if ($18) { var $neoasz_016_i = $17;label = 7; break; } else { var $neoasz_0_lcssa_i = $17;label = 8; break; } //@line 67 "src/buffer.c"
  case 7: 
   var $neoasz_016_i;
   var $19=((($neoasz_016_i)+($4))|0); //@line 68 "src/buffer.c"
   var $20=(($19)>>>(0)) < (($10)>>>(0)); //@line 67 "src/buffer.c"
   if ($20) { var $neoasz_016_i = $19;label = 7; break; } else { var $neoasz_0_lcssa_i = $19;label = 8; break; } //@line 67 "src/buffer.c"
  case 8: 
   var $neoasz_0_lcssa_i;
   var $21=(($buf)|0); //@line 70 "src/buffer.c"
   var $22=HEAP32[(($21)>>2)]; //@line 70 "src/buffer.c"
   var $23=_realloc($22, $neoasz_0_lcssa_i); //@line 70 "src/buffer.c"
   var $24=(($23)|(0))==0; //@line 71 "src/buffer.c"
   if ($24) { label = 11; break; } else { label = 9; break; } //@line 71 "src/buffer.c"
  case 9: 
   HEAP32[(($21)>>2)]=$23; //@line 74 "src/buffer.c"
   HEAP32[(($11)>>2)]=$neoasz_0_lcssa_i; //@line 75 "src/buffer.c"
   var $_pre=HEAP32[(($8)>>2)]; //@line 183 "src/buffer.c"
   var $26 = $_pre;label = 10; break; //@line 76 "src/buffer.c"
  case 10: 
   var $26;
   var $27=(($c) & 255); //@line 183 "src/buffer.c"
   var $28=(($buf)|0); //@line 183 "src/buffer.c"
   var $29=HEAP32[(($28)>>2)]; //@line 183 "src/buffer.c"
   var $30=(($29+$26)|0); //@line 183 "src/buffer.c"
   HEAP8[($30)]=$27; //@line 183 "src/buffer.c"
   var $31=HEAP32[(($8)>>2)]; //@line 184 "src/buffer.c"
   var $32=((($31)+(1))|0); //@line 184 "src/buffer.c"
   HEAP32[(($8)>>2)]=$32; //@line 184 "src/buffer.c"
   label = 11; break; //@line 185 "src/buffer.c"
  case 11: 
   return; //@line 185 "src/buffer.c"
  default: assert(0, "bad label: " + label);
 }
}
Module["_bufputc"] = _bufputc;
function _bufslurp($buf, $len) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($buf)|(0))==0; //@line 215 "src/buffer.c"
   if ($1) { label = 3; break; } else { label = 2; break; } //@line 215 "src/buffer.c"
  case 2: 
   var $3=(($buf+12)|0); //@line 215 "src/buffer.c"
   var $4=HEAP32[(($3)>>2)]; //@line 215 "src/buffer.c"
   var $5=(($4)|(0))==0; //@line 215 "src/buffer.c"
   if ($5) { label = 3; break; } else { label = 4; break; } //@line 215 "src/buffer.c"
  case 3: 
   ___assert_func(((1736)|0), 215, ((2600)|0), ((2384)|0)); //@line 215 "src/buffer.c"
   throw "Reached an unreachable!"; //@line 215 "src/buffer.c"
  case 4: 
   var $8=(($buf+4)|0); //@line 217 "src/buffer.c"
   var $9=HEAP32[(($8)>>2)]; //@line 217 "src/buffer.c"
   var $10=(($9)>>>(0)) > (($len)>>>(0)); //@line 217 "src/buffer.c"
   if ($10) { label = 6; break; } else { label = 5; break; } //@line 217 "src/buffer.c"
  case 5: 
   HEAP32[(($8)>>2)]=0; //@line 218 "src/buffer.c"
   label = 7; break; //@line 219 "src/buffer.c"
  case 6: 
   var $13=((($9)-($len))|0); //@line 222 "src/buffer.c"
   HEAP32[(($8)>>2)]=$13; //@line 222 "src/buffer.c"
   var $14=(($buf)|0); //@line 223 "src/buffer.c"
   var $15=HEAP32[(($14)>>2)]; //@line 223 "src/buffer.c"
   var $16=(($15+$len)|0); //@line 223 "src/buffer.c"
   _memmove($15, $16, $13, 1, 0); //@line 223 "src/buffer.c"
   label = 7; break; //@line 224 "src/buffer.c"
  case 7: 
   return; //@line 224 "src/buffer.c"
  default: assert(0, "bad label: " + label);
 }
}
Module["_bufslurp"] = _bufslurp;
function _rndr_double_emphasis($ob, $text, $opaque) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($text)|(0))==0; //@line 187 "html/html.c"
   if ($1) { var $_0 = 0;label = 4; break; } else { label = 2; break; } //@line 187 "html/html.c"
  case 2: 
   var $3=(($text+4)|0); //@line 187 "html/html.c"
   var $4=HEAP32[(($3)>>2)]; //@line 187 "html/html.c"
   var $5=(($4)|(0))==0; //@line 187 "html/html.c"
   if ($5) { var $_0 = 0;label = 4; break; } else { label = 3; break; } //@line 187 "html/html.c"
  case 3: 
   _bufput($ob, ((1352)|0), 8); //@line 190 "html/html.c"
   var $7=(($text)|0); //@line 191 "html/html.c"
   var $8=HEAP32[(($7)>>2)]; //@line 191 "html/html.c"
   var $9=HEAP32[(($3)>>2)]; //@line 191 "html/html.c"
   _bufput($ob, $8, $9); //@line 191 "html/html.c"
   _bufput($ob, ((1336)|0), 9); //@line 192 "html/html.c"
   var $_0 = 1;label = 4; break; //@line 194 "html/html.c"
  case 4: 
   var $_0;
   return $_0; //@line 195 "html/html.c"
  default: assert(0, "bad label: " + label);
 }
}
function _rndr_emphasis($ob, $text, $opaque) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($text)|(0))==0; //@line 200 "html/html.c"
   if ($1) { var $_0 = 0;label = 4; break; } else { label = 2; break; } //@line 200 "html/html.c"
  case 2: 
   var $3=(($text+4)|0); //@line 200 "html/html.c"
   var $4=HEAP32[(($3)>>2)]; //@line 200 "html/html.c"
   var $5=(($4)|(0))==0; //@line 200 "html/html.c"
   if ($5) { var $_0 = 0;label = 4; break; } else { label = 3; break; } //@line 200 "html/html.c"
  case 3: 
   _bufput($ob, ((1392)|0), 4); //@line 201 "html/html.c"
   var $7=(($text)|0); //@line 202 "html/html.c"
   var $8=HEAP32[(($7)>>2)]; //@line 202 "html/html.c"
   var $9=HEAP32[(($3)>>2)]; //@line 202 "html/html.c"
   _bufput($ob, $8, $9); //@line 202 "html/html.c"
   _bufput($ob, ((1368)|0), 5); //@line 203 "html/html.c"
   var $_0 = 1;label = 4; break; //@line 204 "html/html.c"
  case 4: 
   var $_0;
   return $_0; //@line 205 "html/html.c"
  default: assert(0, "bad label: " + label);
 }
}
function _toc_link($ob, $link, $title, $content, $opaque) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($content)|(0))==0; //@line 526 "html/html.c"
   if ($1) { label = 4; break; } else { label = 2; break; } //@line 526 "html/html.c"
  case 2: 
   var $3=(($content+4)|0); //@line 526 "html/html.c"
   var $4=HEAP32[(($3)>>2)]; //@line 526 "html/html.c"
   var $5=(($4)|(0))==0; //@line 526 "html/html.c"
   if ($5) { label = 4; break; } else { label = 3; break; } //@line 526 "html/html.c"
  case 3: 
   var $7=(($content)|0); //@line 527 "html/html.c"
   var $8=HEAP32[(($7)>>2)]; //@line 527 "html/html.c"
   _bufput($ob, $8, $4); //@line 527 "html/html.c"
   label = 4; break; //@line 527 "html/html.c"
  case 4: 
   return 1; //@line 528 "html/html.c"
  default: assert(0, "bad label: " + label);
 }
}
function _rndr_triple_emphasis($ob, $text, $opaque) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($text)|(0))==0; //@line 347 "html/html.c"
   if ($1) { var $_0 = 0;label = 4; break; } else { label = 2; break; } //@line 347 "html/html.c"
  case 2: 
   var $3=(($text+4)|0); //@line 347 "html/html.c"
   var $4=HEAP32[(($3)>>2)]; //@line 347 "html/html.c"
   var $5=(($4)|(0))==0; //@line 347 "html/html.c"
   if ($5) { var $_0 = 0;label = 4; break; } else { label = 3; break; } //@line 347 "html/html.c"
  case 3: 
   _bufput($ob, ((1432)|0), 12); //@line 348 "html/html.c"
   var $7=(($text)|0); //@line 349 "html/html.c"
   var $8=HEAP32[(($7)>>2)]; //@line 349 "html/html.c"
   var $9=HEAP32[(($3)>>2)]; //@line 349 "html/html.c"
   _bufput($ob, $8, $9); //@line 349 "html/html.c"
   _bufput($ob, ((1400)|0), 14); //@line 350 "html/html.c"
   var $_0 = 1;label = 4; break; //@line 351 "html/html.c"
  case 4: 
   var $_0;
   return $_0; //@line 352 "html/html.c"
  default: assert(0, "bad label: " + label);
 }
}
function _rndr_strikethrough($ob, $text, $opaque) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($text)|(0))==0; //@line 175 "html/html.c"
   if ($1) { var $_0 = 0;label = 4; break; } else { label = 2; break; } //@line 175 "html/html.c"
  case 2: 
   var $3=(($text+4)|0); //@line 175 "html/html.c"
   var $4=HEAP32[(($3)>>2)]; //@line 175 "html/html.c"
   var $5=(($4)|(0))==0; //@line 175 "html/html.c"
   if ($5) { var $_0 = 0;label = 4; break; } else { label = 3; break; } //@line 175 "html/html.c"
  case 3: 
   _bufput($ob, ((1456)|0), 5); //@line 178 "html/html.c"
   var $7=(($text)|0); //@line 179 "html/html.c"
   var $8=HEAP32[(($7)>>2)]; //@line 179 "html/html.c"
   var $9=HEAP32[(($3)>>2)]; //@line 179 "html/html.c"
   _bufput($ob, $8, $9); //@line 179 "html/html.c"
   _bufput($ob, ((1448)|0), 6); //@line 180 "html/html.c"
   var $_0 = 1;label = 4; break; //@line 181 "html/html.c"
  case 4: 
   var $_0;
   return $_0; //@line 182 "html/html.c"
  default: assert(0, "bad label: " + label);
 }
}
function _rndr_superscript($ob, $text, $opaque) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($text)|(0))==0; //@line 475 "html/html.c"
   if ($1) { var $_0 = 0;label = 4; break; } else { label = 2; break; } //@line 475 "html/html.c"
  case 2: 
   var $3=(($text+4)|0); //@line 475 "html/html.c"
   var $4=HEAP32[(($3)>>2)]; //@line 475 "html/html.c"
   var $5=(($4)|(0))==0; //@line 475 "html/html.c"
   if ($5) { var $_0 = 0;label = 4; break; } else { label = 3; break; } //@line 475 "html/html.c"
  case 3: 
   _bufput($ob, ((1504)|0), 5); //@line 476 "html/html.c"
   var $7=(($text)|0); //@line 477 "html/html.c"
   var $8=HEAP32[(($7)>>2)]; //@line 477 "html/html.c"
   var $9=HEAP32[(($3)>>2)]; //@line 477 "html/html.c"
   _bufput($ob, $8, $9); //@line 477 "html/html.c"
   _bufput($ob, ((1464)|0), 6); //@line 478 "html/html.c"
   var $_0 = 1;label = 4; break; //@line 479 "html/html.c"
  case 4: 
   var $_0;
   return $_0; //@line 480 "html/html.c"
  default: assert(0, "bad label: " + label);
 }
}
function _toc_finalize($ob, $opaque) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($opaque+4)|0); //@line 536 "html/html.c"
   var $2=$1; //@line 536 "html/html.c"
   var $3=HEAP32[(($2)>>2)]; //@line 536 "html/html.c"
   var $4=(($3)|(0)) > 0; //@line 536 "html/html.c"
   if ($4) { label = 2; break; } else { label = 3; break; } //@line 536 "html/html.c"
  case 2: 
   _bufput($ob, ((1512)|0), 12); //@line 537 "html/html.c"
   var $5=HEAP32[(($2)>>2)]; //@line 538 "html/html.c"
   var $6=((($5)-(1))|0); //@line 538 "html/html.c"
   HEAP32[(($2)>>2)]=$6; //@line 538 "html/html.c"
   var $7=(($6)|(0)) > 0; //@line 536 "html/html.c"
   if ($7) { label = 2; break; } else { label = 3; break; } //@line 536 "html/html.c"
  case 3: 
   return; //@line 540 "html/html.c"
  default: assert(0, "bad label: " + label);
 }
}
function _sdhtml_renderer($callbacks, $options, $render_flags) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=$options; //@line 619 "html/html.c"
   HEAP32[(($1)>>2)]=0; HEAP32[((($1)+(4))>>2)]=0; HEAP32[((($1)+(8))>>2)]=0; HEAP32[((($1)+(12))>>2)]=0; HEAP32[((($1)+(16))>>2)]=0; //@line 619 "html/html.c"
   var $2=(($options+12)|0); //@line 620 "html/html.c"
   HEAP32[(($2)>>2)]=$render_flags; //@line 620 "html/html.c"
   var $3=$callbacks; //@line 623 "html/html.c"
   assert(104 % 1 === 0);(_memcpy($3, 448, 104)|0); //@line 623 "html/html.c"
   var $4=$render_flags & 4; //@line 625 "html/html.c"
   var $5=(($4)|(0))==0; //@line 625 "html/html.c"
   if ($5) { label = 3; break; } else { label = 2; break; } //@line 625 "html/html.c"
  case 2: 
   var $7=(($callbacks+60)|0); //@line 626 "html/html.c"
   HEAP32[(($7)>>2)]=0; //@line 626 "html/html.c"
   label = 3; break; //@line 626 "html/html.c"
  case 3: 
   var $9=$render_flags & 8; //@line 628 "html/html.c"
   var $10=(($9)|(0))==0; //@line 628 "html/html.c"
   if ($10) { label = 5; break; } else { label = 4; break; } //@line 628 "html/html.c"
  case 4: 
   var $12=(($callbacks+68)|0); //@line 629 "html/html.c"
   HEAP32[(($12)>>2)]=0; //@line 629 "html/html.c"
   var $13=(($callbacks+44)|0); //@line 630 "html/html.c"
   HEAP32[(($13)>>2)]=0; //@line 630 "html/html.c"
   label = 5; break; //@line 631 "html/html.c"
  case 5: 
   var $15=$render_flags & 513; //@line 633 "html/html.c"
   var $16=(($15)|(0))==0; //@line 633 "html/html.c"
   if ($16) { label = 7; break; } else { label = 6; break; } //@line 633 "html/html.c"
  case 6: 
   var $18=(($callbacks+8)|0); //@line 634 "html/html.c"
   HEAP32[(($18)>>2)]=0; //@line 634 "html/html.c"
   label = 7; break; //@line 634 "html/html.c"
  case 7: 
   return; //@line 635 "html/html.c"
  default: assert(0, "bad label: " + label);
 }
}
Module["_sdhtml_renderer"] = _sdhtml_renderer;
function _rndr_blockcode($ob, $text, $lang, $opaque) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($ob+4)|0); //@line 121 "html/html.c"
   var $2=HEAP32[(($1)>>2)]; //@line 121 "html/html.c"
   var $3=(($2)|(0))==0; //@line 121 "html/html.c"
   if ($3) { label = 3; break; } else { label = 2; break; } //@line 121 "html/html.c"
  case 2: 
   _bufputc($ob, 10); //@line 121 "html/html.c"
   label = 3; break; //@line 121 "html/html.c"
  case 3: 
   var $6=(($lang)|(0))==0; //@line 123 "html/html.c"
   if ($6) { label = 21; break; } else { label = 4; break; } //@line 123 "html/html.c"
  case 4: 
   var $8=(($lang+4)|0); //@line 123 "html/html.c"
   var $9=HEAP32[(($8)>>2)]; //@line 123 "html/html.c"
   var $10=(($9)|(0))==0; //@line 123 "html/html.c"
   if ($10) { label = 21; break; } else { label = 5; break; } //@line 123 "html/html.c"
  case 5: 
   _bufput($ob, ((1568)|0), 18); //@line 125 "html/html.c"
   var $12=HEAP32[(($8)>>2)]; //@line 127 "html/html.c"
   var $13=(($12)|(0))==0; //@line 127 "html/html.c"
   if ($13) { label = 20; break; } else { label = 6; break; } //@line 127 "html/html.c"
  case 6: 
   var $14=(($lang)|0); //@line 128 "html/html.c"
   var $i_037 = 0;var $cls_038 = 0;var $15 = $12;label = 7; break; //@line 127 "html/html.c"
  case 7: 
   var $15;
   var $cls_038;
   var $i_037;
   var $i_1 = $i_037;var $17 = $15;label = 8; break; //@line 128 "html/html.c"
  case 8: 
   var $17;
   var $i_1;
   var $18=(($i_1)>>>(0)) < (($17)>>>(0)); //@line 128 "html/html.c"
   if ($18) { label = 9; break; } else { var $27 = $17;label = 12; break; } //@line 128 "html/html.c"
  case 9: 
   var $20=HEAP32[(($14)>>2)]; //@line 128 "html/html.c"
   var $21=(($20+$i_1)|0); //@line 128 "html/html.c"
   var $22=HEAP8[($21)]; //@line 128 "html/html.c"
   var $23=(($22)&(255)); //@line 128 "html/html.c"
   var $24=_isspace($23); //@line 128 "html/html.c"
   var $25=(($24)|(0))==0; //@line 128 "html/html.c"
   if ($25) { label = 11; break; } else { label = 10; break; }
  case 10: 
   var $26=((($i_1)+(1))|0); //@line 129 "html/html.c"
   var $_pre42=HEAP32[(($8)>>2)]; //@line 128 "html/html.c"
   var $i_1 = $26;var $17 = $_pre42;label = 8; break;
  case 11: 
   var $_pre43=HEAP32[(($8)>>2)]; //@line 131 "html/html.c"
   var $27 = $_pre43;label = 12; break;
  case 12: 
   var $27; //@line 131 "html/html.c"
   var $28=(($i_1)>>>(0)) < (($27)>>>(0)); //@line 131 "html/html.c"
   if ($28) { var $i_2 = $i_1;var $29 = $27;label = 13; break; } else { var $i_3 = $i_1;var $51 = $27;label = 19; break; } //@line 131 "html/html.c"
  case 13: 
   var $29;
   var $i_2;
   var $30=(($i_2)>>>(0)) < (($29)>>>(0)); //@line 133 "html/html.c"
   if ($30) { label = 14; break; } else { label = 16; break; } //@line 133 "html/html.c"
  case 14: 
   var $32=HEAP32[(($14)>>2)]; //@line 133 "html/html.c"
   var $33=(($32+$i_2)|0); //@line 133 "html/html.c"
   var $34=HEAP8[($33)]; //@line 133 "html/html.c"
   var $35=(($34)&(255)); //@line 133 "html/html.c"
   var $36=_isspace($35); //@line 133 "html/html.c"
   var $37=(($36)|(0))==0; //@line 133 "html/html.c"
   if ($37) { label = 15; break; } else { label = 16; break; }
  case 15: 
   var $38=((($i_2)+(1))|0); //@line 134 "html/html.c"
   var $_pre44=HEAP32[(($8)>>2)]; //@line 133 "html/html.c"
   var $i_2 = $38;var $29 = $_pre44;label = 13; break;
  case 16: 
   var $39=HEAP32[(($14)>>2)]; //@line 136 "html/html.c"
   var $40=(($39+$i_1)|0); //@line 136 "html/html.c"
   var $41=HEAP8[($40)]; //@line 136 "html/html.c"
   var $42=(($41 << 24) >> 24)==46; //@line 136 "html/html.c"
   var $43=(($42)&(1)); //@line 136 "html/html.c"
   var $_i_1=((($43)+($i_1))|0); //@line 136 "html/html.c"
   var $44=(($cls_038)|(0))==0; //@line 139 "html/html.c"
   if ($44) { var $47 = $39;label = 18; break; } else { label = 17; break; } //@line 139 "html/html.c"
  case 17: 
   _bufputc($ob, 32); //@line 139 "html/html.c"
   var $_pre39=HEAP32[(($14)>>2)]; //@line 140 "html/html.c"
   var $47 = $_pre39;label = 18; break; //@line 139 "html/html.c"
  case 18: 
   var $47;
   var $48=(($47+$_i_1)|0); //@line 140 "html/html.c"
   var $49=((($i_2)-($_i_1))|0); //@line 140 "html/html.c"
   _houdini_escape_html0($ob, $48, $49, 0); //@line 65 "html/html.c"
   var $_pre=HEAP32[(($8)>>2)]; //@line 127 "html/html.c"
   var $i_3 = $i_2;var $51 = $_pre;label = 19; break; //@line 141 "html/html.c"
  case 19: 
   var $51;
   var $i_3;
   var $52=((($i_3)+(1))|0); //@line 127 "html/html.c"
   var $53=((($cls_038)+(1))|0); //@line 127 "html/html.c"
   var $54=(($52)>>>(0)) < (($51)>>>(0)); //@line 127 "html/html.c"
   if ($54) { var $i_037 = $52;var $cls_038 = $53;var $15 = $51;label = 7; break; } else { label = 20; break; } //@line 127 "html/html.c"
  case 20: 
   _bufput($ob, ((1304)|0), 2); //@line 144 "html/html.c"
   label = 22; break; //@line 145 "html/html.c"
  case 21: 
   _bufput($ob, ((1544)|0), 11); //@line 146 "html/html.c"
   label = 22; break;
  case 22: 
   var $57=(($text)|(0))==0; //@line 148 "html/html.c"
   if ($57) { label = 24; break; } else { label = 23; break; } //@line 148 "html/html.c"
  case 23: 
   var $59=(($text)|0); //@line 149 "html/html.c"
   var $60=HEAP32[(($59)>>2)]; //@line 149 "html/html.c"
   var $61=(($text+4)|0); //@line 149 "html/html.c"
   var $62=HEAP32[(($61)>>2)]; //@line 149 "html/html.c"
   _houdini_escape_html0($ob, $60, $62, 0); //@line 65 "html/html.c"
   label = 24; break; //@line 149 "html/html.c"
  case 24: 
   _bufput($ob, ((1528)|0), 14); //@line 151 "html/html.c"
   return; //@line 152 "html/html.c"
  default: assert(0, "bad label: " + label);
 }
}
function _rndr_blockquote($ob, $text, $opaque) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($ob+4)|0); //@line 157 "html/html.c"
   var $2=HEAP32[(($1)>>2)]; //@line 157 "html/html.c"
   var $3=(($2)|(0))==0; //@line 157 "html/html.c"
   if ($3) { label = 3; break; } else { label = 2; break; } //@line 157 "html/html.c"
  case 2: 
   _bufputc($ob, 10); //@line 157 "html/html.c"
   label = 3; break; //@line 157 "html/html.c"
  case 3: 
   _bufput($ob, ((1624)|0), 13); //@line 158 "html/html.c"
   var $6=(($text)|(0))==0; //@line 159 "html/html.c"
   if ($6) { label = 5; break; } else { label = 4; break; } //@line 159 "html/html.c"
  case 4: 
   var $8=(($text)|0); //@line 159 "html/html.c"
   var $9=HEAP32[(($8)>>2)]; //@line 159 "html/html.c"
   var $10=(($text+4)|0); //@line 159 "html/html.c"
   var $11=HEAP32[(($10)>>2)]; //@line 159 "html/html.c"
   _bufput($ob, $9, $11); //@line 159 "html/html.c"
   label = 5; break; //@line 159 "html/html.c"
  case 5: 
   _bufput($ob, ((1592)|0), 14); //@line 160 "html/html.c"
   return; //@line 161 "html/html.c"
  default: assert(0, "bad label: " + label);
 }
}
function _rndr_raw_block($ob, $text, $opaque) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($text)|(0))==0; //@line 333 "html/html.c"
   if ($1) { label = 11; break; } else { label = 2; break; } //@line 333 "html/html.c"
  case 2: 
   var $3=(($text+4)|0); //@line 334 "html/html.c"
   var $4=HEAP32[(($3)>>2)]; //@line 334 "html/html.c"
   var $5=(($text)|0); //@line 335 "html/html.c"
   var $sz_0 = $4;label = 3; break; //@line 335 "html/html.c"
  case 3: 
   var $sz_0;
   var $7=(($sz_0)|(0))==0; //@line 335 "html/html.c"
   if ($7) { var $sz_0_lcssa = 0;label = 5; break; } else { label = 4; break; } //@line 335 "html/html.c"
  case 4: 
   var $9=((($sz_0)-(1))|0); //@line 335 "html/html.c"
   var $10=HEAP32[(($5)>>2)]; //@line 335 "html/html.c"
   var $11=(($10+$9)|0); //@line 335 "html/html.c"
   var $12=HEAP8[($11)]; //@line 335 "html/html.c"
   var $13=(($12 << 24) >> 24)==10; //@line 335 "html/html.c"
   if ($13) { var $sz_0 = $9;label = 3; break; } else { var $sz_0_lcssa = $sz_0;label = 5; break; }
  case 5: 
   var $sz_0_lcssa;
   var $org_0 = 0;label = 6; break; //@line 337 "html/html.c"
  case 6: 
   var $org_0;
   var $14=(($org_0)>>>(0)) < (($sz_0_lcssa)>>>(0)); //@line 337 "html/html.c"
   if ($14) { label = 7; break; } else { label = 11; break; } //@line 337 "html/html.c"
  case 7: 
   var $16=HEAP32[(($5)>>2)]; //@line 337 "html/html.c"
   var $17=(($16+$org_0)|0); //@line 337 "html/html.c"
   var $18=HEAP8[($17)]; //@line 337 "html/html.c"
   var $19=(($18 << 24) >> 24)==10; //@line 337 "html/html.c"
   var $20=((($org_0)+(1))|0); //@line 337 "html/html.c"
   if ($19) { var $org_0 = $20;label = 6; break; } else { label = 8; break; }
  case 8: 
   var $22=(($ob+4)|0); //@line 339 "html/html.c"
   var $23=HEAP32[(($22)>>2)]; //@line 339 "html/html.c"
   var $24=(($23)|(0))==0; //@line 339 "html/html.c"
   if ($24) { var $27 = $16;label = 10; break; } else { label = 9; break; } //@line 339 "html/html.c"
  case 9: 
   _bufputc($ob, 10); //@line 339 "html/html.c"
   var $_pre=HEAP32[(($5)>>2)]; //@line 340 "html/html.c"
   var $27 = $_pre;label = 10; break; //@line 339 "html/html.c"
  case 10: 
   var $27;
   var $28=(($27+$org_0)|0); //@line 340 "html/html.c"
   var $29=((($sz_0_lcssa)-($org_0))|0); //@line 340 "html/html.c"
   _bufput($ob, $28, $29); //@line 340 "html/html.c"
   _bufputc($ob, 10); //@line 341 "html/html.c"
   label = 11; break; //@line 342 "html/html.c"
  case 11: 
   return; //@line 342 "html/html.c"
  default: assert(0, "bad label: " + label);
 }
}
function _rndr_header($ob, $text, $level, $opaque) {
 var label = 0;
 var tempVarArgs = 0;
 var sp  = STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($ob+4)|0); //@line 220 "html/html.c"
   var $2=HEAP32[(($1)>>2)]; //@line 220 "html/html.c"
   var $3=(($2)|(0))==0; //@line 220 "html/html.c"
   if ($3) { label = 3; break; } else { label = 2; break; } //@line 220 "html/html.c"
  case 2: 
   _bufputc($ob, 10); //@line 221 "html/html.c"
   label = 3; break; //@line 221 "html/html.c"
  case 3: 
   var $6=(($opaque+12)|0); //@line 223 "html/html.c"
   var $7=$6; //@line 223 "html/html.c"
   var $8=HEAP32[(($7)>>2)]; //@line 223 "html/html.c"
   var $9=$8 & 64; //@line 223 "html/html.c"
   var $10=(($9)|(0))==0; //@line 223 "html/html.c"
   if ($10) { label = 5; break; } else { label = 4; break; } //@line 223 "html/html.c"
  case 4: 
   var $12=$opaque; //@line 224 "html/html.c"
   var $13=HEAP32[(($12)>>2)]; //@line 224 "html/html.c"
   var $14=((($13)+(1))|0); //@line 224 "html/html.c"
   HEAP32[(($12)>>2)]=$14; //@line 224 "html/html.c"
   _bufprintf($ob, ((1672)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$level,HEAP32[(((tempVarArgs)+(8))>>2)]=$13,tempVarArgs)); STACKTOP=tempVarArgs; //@line 224 "html/html.c"
   label = 6; break; //@line 224 "html/html.c"
  case 5: 
   _bufprintf($ob, ((1648)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$level,tempVarArgs)); STACKTOP=tempVarArgs; //@line 226 "html/html.c"
   label = 6; break;
  case 6: 
   var $17=(($text)|(0))==0; //@line 228 "html/html.c"
   if ($17) { label = 8; break; } else { label = 7; break; } //@line 228 "html/html.c"
  case 7: 
   var $19=(($text)|0); //@line 228 "html/html.c"
   var $20=HEAP32[(($19)>>2)]; //@line 228 "html/html.c"
   var $21=(($text+4)|0); //@line 228 "html/html.c"
   var $22=HEAP32[(($21)>>2)]; //@line 228 "html/html.c"
   _bufput($ob, $20, $22); //@line 228 "html/html.c"
   label = 8; break; //@line 228 "html/html.c"
  case 8: 
   _bufprintf($ob, ((1640)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$level,tempVarArgs)); STACKTOP=tempVarArgs; //@line 229 "html/html.c"
   STACKTOP = sp;
   return; //@line 230 "html/html.c"
  default: assert(0, "bad label: " + label);
 }
}
function _rndr_hrule($ob, $opaque) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($ob+4)|0); //@line 358 "html/html.c"
   var $2=HEAP32[(($1)>>2)]; //@line 358 "html/html.c"
   var $3=(($2)|(0))==0; //@line 358 "html/html.c"
   if ($3) { label = 3; break; } else { label = 2; break; } //@line 358 "html/html.c"
  case 2: 
   _bufputc($ob, 10); //@line 358 "html/html.c"
   label = 3; break; //@line 358 "html/html.c"
  case 3: 
   var $6=(($opaque+12)|0); //@line 359 "html/html.c"
   var $7=$6; //@line 359 "html/html.c"
   var $8=HEAP32[(($7)>>2)]; //@line 359 "html/html.c"
   var $9=$8 & 256; //@line 359 "html/html.c"
   var $10=(($9)|(0))!=0; //@line 359 "html/html.c"
   var $11=$10 ? (((1712)|0)) : (((1696)|0)); //@line 359 "html/html.c"
   _bufputs($ob, $11); //@line 359 "html/html.c"
   return; //@line 360 "html/html.c"
  default: assert(0, "bad label: " + label);
 }
}
function _rndr_list($ob, $text, $flags, $opaque) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($ob+4)|0); //@line 266 "html/html.c"
   var $2=HEAP32[(($1)>>2)]; //@line 266 "html/html.c"
   var $3=(($2)|(0))==0; //@line 266 "html/html.c"
   if ($3) { label = 3; break; } else { label = 2; break; } //@line 266 "html/html.c"
  case 2: 
   _bufputc($ob, 10); //@line 266 "html/html.c"
   label = 3; break; //@line 266 "html/html.c"
  case 3: 
   var $6=$flags & 1; //@line 267 "html/html.c"
   var $7=(($6)|(0))!=0; //@line 267 "html/html.c"
   var $8=$7 ? (((1792)|0)) : (((1752)|0)); //@line 267 "html/html.c"
   _bufput($ob, $8, 5); //@line 267 "html/html.c"
   var $9=(($text)|(0))==0; //@line 268 "html/html.c"
   if ($9) { label = 5; break; } else { label = 4; break; } //@line 268 "html/html.c"
  case 4: 
   var $11=(($text)|0); //@line 268 "html/html.c"
   var $12=HEAP32[(($11)>>2)]; //@line 268 "html/html.c"
   var $13=(($text+4)|0); //@line 268 "html/html.c"
   var $14=HEAP32[(($13)>>2)]; //@line 268 "html/html.c"
   _bufput($ob, $12, $14); //@line 268 "html/html.c"
   label = 5; break; //@line 268 "html/html.c"
  case 5: 
   var $16=$7 ? (((1728)|0)) : (((1720)|0)); //@line 269 "html/html.c"
   _bufput($ob, $16, 6); //@line 269 "html/html.c"
   return; //@line 270 "html/html.c"
  default: assert(0, "bad label: " + label);
 }
}
function _rndr_listitem($ob, $text, $flags, $opaque) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   _bufput($ob, ((1872)|0), 4); //@line 275 "html/html.c"
   var $1=(($text)|(0))==0; //@line 276 "html/html.c"
   if ($1) { label = 7; break; } else { label = 2; break; } //@line 276 "html/html.c"
  case 2: 
   var $3=(($text+4)|0); //@line 277 "html/html.c"
   var $4=HEAP32[(($3)>>2)]; //@line 277 "html/html.c"
   var $5=(($text)|0); //@line 278 "html/html.c"
   var $size_0 = $4;label = 3; break; //@line 278 "html/html.c"
  case 3: 
   var $size_0;
   var $7=(($size_0)|(0))==0; //@line 278 "html/html.c"
   if ($7) { label = 4; break; } else { label = 5; break; } //@line 278 "html/html.c"
  case 4: 
   var $_pre=HEAP32[(($5)>>2)]; //@line 281 "html/html.c"
   var $size_0_lcssa = 0;var $14 = $_pre;label = 6; break; //@line 278 "html/html.c"
  case 5: 
   var $9=((($size_0)-(1))|0); //@line 278 "html/html.c"
   var $10=HEAP32[(($5)>>2)]; //@line 278 "html/html.c"
   var $11=(($10+$9)|0); //@line 278 "html/html.c"
   var $12=HEAP8[($11)]; //@line 278 "html/html.c"
   var $13=(($12 << 24) >> 24)==10; //@line 278 "html/html.c"
   if ($13) { var $size_0 = $9;label = 3; break; } else { var $size_0_lcssa = $size_0;var $14 = $10;label = 6; break; }
  case 6: 
   var $14;
   var $size_0_lcssa;
   _bufput($ob, $14, $size_0_lcssa); //@line 281 "html/html.c"
   label = 7; break; //@line 282 "html/html.c"
  case 7: 
   _bufput($ob, ((1816)|0), 6); //@line 283 "html/html.c"
   return; //@line 284 "html/html.c"
  default: assert(0, "bad label: " + label);
 }
}
function _rndr_paragraph($ob, $text, $opaque) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($ob+4)|0); //@line 292 "html/html.c"
   var $2=HEAP32[(($1)>>2)]; //@line 292 "html/html.c"
   var $3=(($2)|(0))==0; //@line 292 "html/html.c"
   if ($3) { label = 3; break; } else { label = 2; break; } //@line 292 "html/html.c"
  case 2: 
   _bufputc($ob, 10); //@line 292 "html/html.c"
   label = 3; break; //@line 292 "html/html.c"
  case 3: 
   var $6=(($text)|(0))==0; //@line 294 "html/html.c"
   if ($6) { label = 22; break; } else { label = 4; break; } //@line 294 "html/html.c"
  case 4: 
   var $8=(($text+4)|0); //@line 294 "html/html.c"
   var $9=HEAP32[(($8)>>2)]; //@line 294 "html/html.c"
   var $10=(($9)|(0))==0; //@line 294 "html/html.c"
   if ($10) { label = 22; break; } else { label = 5; break; } //@line 294 "html/html.c"
  case 5: 
   var $11=(($text)|0); //@line 297 "html/html.c"
   var $i_0 = 0;var $13 = $9;label = 6; break; //@line 297 "html/html.c"
  case 6: 
   var $13;
   var $i_0;
   var $14=(($i_0)>>>(0)) < (($13)>>>(0)); //@line 297 "html/html.c"
   if ($14) { label = 7; break; } else { var $23 = $13;label = 10; break; } //@line 297 "html/html.c"
  case 7: 
   var $16=HEAP32[(($11)>>2)]; //@line 297 "html/html.c"
   var $17=(($16+$i_0)|0); //@line 297 "html/html.c"
   var $18=HEAP8[($17)]; //@line 297 "html/html.c"
   var $19=(($18)&(255)); //@line 297 "html/html.c"
   var $20=_isspace($19); //@line 297 "html/html.c"
   var $21=(($20)|(0))==0; //@line 297 "html/html.c"
   if ($21) { label = 9; break; } else { label = 8; break; }
  case 8: 
   var $22=((($i_0)+(1))|0); //@line 297 "html/html.c"
   var $_pre39=HEAP32[(($8)>>2)]; //@line 297 "html/html.c"
   var $i_0 = $22;var $13 = $_pre39;label = 6; break;
  case 9: 
   var $_pre40=HEAP32[(($8)>>2)]; //@line 299 "html/html.c"
   var $23 = $_pre40;label = 10; break;
  case 10: 
   var $23;
   var $24=(($i_0)|(0))==(($23)|(0)); //@line 299 "html/html.c"
   if ($24) { label = 22; break; } else { label = 11; break; } //@line 299 "html/html.c"
  case 11: 
   _bufput($ob, ((1936)|0), 3); //@line 302 "html/html.c"
   var $26=(($opaque+12)|0); //@line 303 "html/html.c"
   var $27=$26; //@line 303 "html/html.c"
   var $28=HEAP32[(($27)>>2)]; //@line 303 "html/html.c"
   var $29=$28 & 128; //@line 303 "html/html.c"
   var $30=(($29)|(0))==0; //@line 303 "html/html.c"
   if ($30) { label = 20; break; } else { label = 12; break; } //@line 303 "html/html.c"
  case 12: 
   var $31=HEAP32[(($8)>>2)]; //@line 305 "html/html.c"
   var $32=(($i_0)>>>(0)) < (($31)>>>(0)); //@line 305 "html/html.c"
   if ($32) { var $i_137 = $i_0;var $33 = $31;label = 13; break; } else { label = 21; break; } //@line 305 "html/html.c"
  case 13: 
   var $33;
   var $i_137;
   var $i_2 = $i_137;label = 14; break; //@line 307 "html/html.c"
  case 14: 
   var $i_2;
   var $35=(($i_2)>>>(0)) < (($33)>>>(0)); //@line 307 "html/html.c"
   if ($35) { label = 15; break; } else { label = 16; break; } //@line 307 "html/html.c"
  case 15: 
   var $37=HEAP32[(($11)>>2)]; //@line 307 "html/html.c"
   var $38=(($37+$i_2)|0); //@line 307 "html/html.c"
   var $39=HEAP8[($38)]; //@line 307 "html/html.c"
   var $40=(($39 << 24) >> 24)==10; //@line 307 "html/html.c"
   var $41=((($i_2)+(1))|0); //@line 308 "html/html.c"
   if ($40) { label = 16; break; } else { var $i_2 = $41;label = 14; break; }
  case 16: 
   var $42=(($i_2)>>>(0)) > (($i_137)>>>(0)); //@line 310 "html/html.c"
   if ($42) { label = 17; break; } else { var $48 = $33;label = 18; break; } //@line 310 "html/html.c"
  case 17: 
   var $44=HEAP32[(($11)>>2)]; //@line 311 "html/html.c"
   var $45=(($44+$i_137)|0); //@line 311 "html/html.c"
   var $46=((($i_2)-($i_137))|0); //@line 311 "html/html.c"
   _bufput($ob, $45, $46); //@line 311 "html/html.c"
   var $_pre=HEAP32[(($8)>>2)]; //@line 317 "html/html.c"
   var $48 = $_pre;label = 18; break; //@line 311 "html/html.c"
  case 18: 
   var $48;
   var $49=((($48)-(1))|0); //@line 317 "html/html.c"
   var $50=(($i_2)>>>(0)) < (($49)>>>(0)); //@line 317 "html/html.c"
   if ($50) { label = 19; break; } else { label = 21; break; } //@line 317 "html/html.c"
  case 19: 
   var $52=HEAP32[(($27)>>2)]; //@line 211 "html/html.c"
   var $53=$52 & 256; //@line 211 "html/html.c"
   var $54=(($53)|(0))!=0; //@line 211 "html/html.c"
   var $55=$54 ? (((1136)|0)) : (((1112)|0)); //@line 211 "html/html.c"
   _bufputs($ob, $55); //@line 211 "html/html.c"
   var $56=((($i_2)+(1))|0); //@line 321 "html/html.c"
   var $57=HEAP32[(($8)>>2)]; //@line 305 "html/html.c"
   var $58=(($56)>>>(0)) < (($57)>>>(0)); //@line 305 "html/html.c"
   if ($58) { var $i_137 = $56;var $33 = $57;label = 13; break; } else { label = 21; break; } //@line 305 "html/html.c"
  case 20: 
   var $60=HEAP32[(($11)>>2)]; //@line 324 "html/html.c"
   var $61=(($60+$i_0)|0); //@line 324 "html/html.c"
   var $62=HEAP32[(($8)>>2)]; //@line 324 "html/html.c"
   var $63=((($62)-($i_0))|0); //@line 324 "html/html.c"
   _bufput($ob, $61, $63); //@line 324 "html/html.c"
   label = 21; break;
  case 21: 
   _bufput($ob, ((1920)|0), 5); //@line 326 "html/html.c"
   label = 22; break; //@line 327 "html/html.c"
  case 22: 
   return; //@line 327 "html/html.c"
  default: assert(0, "bad label: " + label);
 }
}
function _rndr_table($ob, $header, $body, $opaque) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($ob+4)|0); //@line 417 "html/html.c"
   var $2=HEAP32[(($1)>>2)]; //@line 417 "html/html.c"
   var $3=(($2)|(0))==0; //@line 417 "html/html.c"
   if ($3) { label = 3; break; } else { label = 2; break; } //@line 417 "html/html.c"
  case 2: 
   _bufputc($ob, 10); //@line 417 "html/html.c"
   label = 3; break; //@line 417 "html/html.c"
  case 3: 
   _bufput($ob, ((2072)|0), 15); //@line 418 "html/html.c"
   var $6=(($header)|(0))==0; //@line 419 "html/html.c"
   if ($6) { label = 5; break; } else { label = 4; break; } //@line 419 "html/html.c"
  case 4: 
   var $8=(($header)|0); //@line 420 "html/html.c"
   var $9=HEAP32[(($8)>>2)]; //@line 420 "html/html.c"
   var $10=(($header+4)|0); //@line 420 "html/html.c"
   var $11=HEAP32[(($10)>>2)]; //@line 420 "html/html.c"
   _bufput($ob, $9, $11); //@line 420 "html/html.c"
   label = 5; break; //@line 420 "html/html.c"
  case 5: 
   _bufput($ob, ((2024)|0), 16); //@line 421 "html/html.c"
   var $13=(($body)|(0))==0; //@line 422 "html/html.c"
   if ($13) { label = 7; break; } else { label = 6; break; } //@line 422 "html/html.c"
  case 6: 
   var $15=(($body)|0); //@line 423 "html/html.c"
   var $16=HEAP32[(($15)>>2)]; //@line 423 "html/html.c"
   var $17=(($body+4)|0); //@line 423 "html/html.c"
   var $18=HEAP32[(($17)>>2)]; //@line 423 "html/html.c"
   _bufput($ob, $16, $18); //@line 423 "html/html.c"
   label = 7; break; //@line 423 "html/html.c"
  case 7: 
   _bufput($ob, ((1984)|0), 17); //@line 424 "html/html.c"
   return; //@line 425 "html/html.c"
  default: assert(0, "bad label: " + label);
 }
}
function _rndr_tablerow($ob, $text, $opaque) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   _bufput($ob, ((2112)|0), 5); //@line 430 "html/html.c"
   var $1=(($text)|(0))==0; //@line 431 "html/html.c"
   if ($1) { label = 3; break; } else { label = 2; break; } //@line 431 "html/html.c"
  case 2: 
   var $3=(($text)|0); //@line 432 "html/html.c"
   var $4=HEAP32[(($3)>>2)]; //@line 432 "html/html.c"
   var $5=(($text+4)|0); //@line 432 "html/html.c"
   var $6=HEAP32[(($5)>>2)]; //@line 432 "html/html.c"
   _bufput($ob, $4, $6); //@line 432 "html/html.c"
   label = 3; break; //@line 432 "html/html.c"
  case 3: 
   _bufput($ob, ((2096)|0), 6); //@line 433 "html/html.c"
   return; //@line 434 "html/html.c"
  default: assert(0, "bad label: " + label);
 }
}
function _rndr_tablecell($ob, $text, $flags, $opaque) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=$flags & 4; //@line 439 "html/html.c"
   var $2=(($1)|(0))!=0; //@line 439 "html/html.c"
   if ($2) { label = 2; break; } else { label = 3; break; } //@line 439 "html/html.c"
  case 2: 
   _bufput($ob, ((2376)|0), 3); //@line 440 "html/html.c"
   label = 4; break; //@line 441 "html/html.c"
  case 3: 
   _bufput($ob, ((2344)|0), 3); //@line 442 "html/html.c"
   label = 4; break;
  case 4: 
   var $6=$flags & 3; //@line 445 "html/html.c"
   if ((($6)|(0))==3) {
    label = 5; break;
   }
   else if ((($6)|(0))==1) {
    label = 6; break;
   }
   else if ((($6)|(0))==2) {
    label = 7; break;
   }
   else {
   label = 8; break;
   }
  case 5: 
   _bufput($ob, ((2304)|0), 16); //@line 447 "html/html.c"
   label = 9; break; //@line 448 "html/html.c"
  case 6: 
   _bufput($ob, ((2264)|0), 14); //@line 451 "html/html.c"
   label = 9; break; //@line 452 "html/html.c"
  case 7: 
   _bufput($ob, ((2232)|0), 15); //@line 455 "html/html.c"
   label = 9; break; //@line 456 "html/html.c"
  case 8: 
   _bufput($ob, ((2200)|0), 1); //@line 459 "html/html.c"
   label = 9; break; //@line 460 "html/html.c"
  case 9: 
   var $12=(($text)|(0))==0; //@line 462 "html/html.c"
   if ($12) { label = 11; break; } else { label = 10; break; } //@line 462 "html/html.c"
  case 10: 
   var $14=(($text)|0); //@line 463 "html/html.c"
   var $15=HEAP32[(($14)>>2)]; //@line 463 "html/html.c"
   var $16=(($text+4)|0); //@line 463 "html/html.c"
   var $17=HEAP32[(($16)>>2)]; //@line 463 "html/html.c"
   _bufput($ob, $15, $17); //@line 463 "html/html.c"
   label = 11; break; //@line 463 "html/html.c"
  case 11: 
   if ($2) { label = 12; break; } else { label = 13; break; } //@line 465 "html/html.c"
  case 12: 
   _bufput($ob, ((2168)|0), 6); //@line 466 "html/html.c"
   label = 14; break; //@line 467 "html/html.c"
  case 13: 
   _bufput($ob, ((2136)|0), 6); //@line 468 "html/html.c"
   label = 14; break;
  case 14: 
   return; //@line 470 "html/html.c"
  default: assert(0, "bad label: " + label);
 }
}
function _rndr_autolink($ob, $link, $type, $opaque) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($link)|(0))==0; //@line 81 "html/html.c"
   if ($1) { var $_0 = 0;label = 14; break; } else { label = 2; break; } //@line 81 "html/html.c"
  case 2: 
   var $3=(($link+4)|0); //@line 81 "html/html.c"
   var $4=HEAP32[(($3)>>2)]; //@line 81 "html/html.c"
   var $5=(($4)|(0))==0; //@line 81 "html/html.c"
   if ($5) { var $_0 = 0;label = 14; break; } else { label = 3; break; } //@line 81 "html/html.c"
  case 3: 
   var $7=(($opaque+12)|0); //@line 84 "html/html.c"
   var $8=$7; //@line 84 "html/html.c"
   var $9=HEAP32[(($8)>>2)]; //@line 84 "html/html.c"
   var $10=$9 & 32; //@line 84 "html/html.c"
   var $11=(($10)|(0))==0; //@line 84 "html/html.c"
   if ($11) { label = 5; break; } else { label = 4; break; } //@line 84 "html/html.c"
  case 4: 
   var $13=(($link)|0); //@line 85 "html/html.c"
   var $14=HEAP32[(($13)>>2)]; //@line 85 "html/html.c"
   var $15=_sd_autolink_issafe($14, $4); //@line 85 "html/html.c"
   var $16=(($15)|(0))!=0; //@line 85 "html/html.c"
   var $17=(($type)|(0))==2; //@line 85 "html/html.c"
   var $or_cond=$16 | $17; //@line 85 "html/html.c"
   if ($or_cond) { label = 5; break; } else { var $_0 = 0;label = 14; break; } //@line 85 "html/html.c"
  case 5: 
   _bufput($ob, ((1656)|0), 9); //@line 89 "html/html.c"
   var $19=(($type)|(0))==2; //@line 90 "html/html.c"
   if ($19) { label = 6; break; } else { label = 7; break; } //@line 90 "html/html.c"
  case 6: 
   _bufput($ob, ((2424)|0), 7); //@line 91 "html/html.c"
   label = 7; break; //@line 91 "html/html.c"
  case 7: 
   var $22=(($link)|0); //@line 92 "html/html.c"
   var $23=HEAP32[(($22)>>2)]; //@line 92 "html/html.c"
   var $24=HEAP32[(($3)>>2)]; //@line 92 "html/html.c"
   _houdini_escape_href($ob, $23, $24); //@line 70 "html/html.c"
   var $25=(($opaque+16)|0); //@line 94 "html/html.c"
   var $26=$25; //@line 94 "html/html.c"
   var $27=HEAP32[(($26)>>2)]; //@line 94 "html/html.c"
   var $28=(($27)|(0))==0; //@line 94 "html/html.c"
   if ($28) { label = 9; break; } else { label = 8; break; } //@line 94 "html/html.c"
  case 8: 
   _bufputc($ob, 34); //@line 95 "html/html.c"
   var $30=HEAP32[(($26)>>2)]; //@line 96 "html/html.c"
   FUNCTION_TABLE[$30]($ob, $link, $opaque); //@line 96 "html/html.c"
   _bufputc($ob, 62); //@line 97 "html/html.c"
   label = 10; break; //@line 98 "html/html.c"
  case 9: 
   _bufput($ob, ((1304)|0), 2); //@line 99 "html/html.c"
   label = 10; break;
  case 10: 
   var $33=_bufprefix($link, ((2424)|0)); //@line 107 "html/html.c"
   var $34=(($33)|(0))==0; //@line 107 "html/html.c"
   var $35=HEAP32[(($22)>>2)]; //@line 108 "html/html.c"
   if ($34) { label = 11; break; } else { label = 12; break; } //@line 107 "html/html.c"
  case 11: 
   var $37=(($35+7)|0); //@line 108 "html/html.c"
   var $38=HEAP32[(($3)>>2)]; //@line 108 "html/html.c"
   var $39=((($38)-(7))|0); //@line 108 "html/html.c"
   _houdini_escape_html0($ob, $37, $39, 0); //@line 65 "html/html.c"
   label = 13; break; //@line 109 "html/html.c"
  case 12: 
   var $41=HEAP32[(($3)>>2)]; //@line 110 "html/html.c"
   _houdini_escape_html0($ob, $35, $41, 0); //@line 65 "html/html.c"
   label = 13; break;
  case 13: 
   _bufput($ob, ((1168)|0), 4); //@line 113 "html/html.c"
   var $_0 = 1;label = 14; break; //@line 115 "html/html.c"
  case 14: 
   var $_0;
   return $_0; //@line 116 "html/html.c"
  default: assert(0, "bad label: " + label);
 }
}
function _rndr_image($ob, $link, $title, $alt, $opaque) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($link)|(0))==0; //@line 366 "html/html.c"
   if ($1) { var $_0 = 0;label = 10; break; } else { label = 2; break; } //@line 366 "html/html.c"
  case 2: 
   var $3=(($link+4)|0); //@line 366 "html/html.c"
   var $4=HEAP32[(($3)>>2)]; //@line 366 "html/html.c"
   var $5=(($4)|(0))==0; //@line 366 "html/html.c"
   if ($5) { var $_0 = 0;label = 10; break; } else { label = 3; break; } //@line 366 "html/html.c"
  case 3: 
   _bufput($ob, ((1048)|0), 10); //@line 368 "html/html.c"
   var $7=(($link)|0); //@line 369 "html/html.c"
   var $8=HEAP32[(($7)>>2)]; //@line 369 "html/html.c"
   var $9=HEAP32[(($3)>>2)]; //@line 369 "html/html.c"
   _houdini_escape_href($ob, $8, $9); //@line 70 "html/html.c"
   _bufput($ob, ((2520)|0), 7); //@line 370 "html/html.c"
   var $10=(($alt)|(0))==0; //@line 372 "html/html.c"
   if ($10) { label = 6; break; } else { label = 4; break; } //@line 372 "html/html.c"
  case 4: 
   var $12=(($alt+4)|0); //@line 372 "html/html.c"
   var $13=HEAP32[(($12)>>2)]; //@line 372 "html/html.c"
   var $14=(($13)|(0))==0; //@line 372 "html/html.c"
   if ($14) { label = 6; break; } else { label = 5; break; } //@line 372 "html/html.c"
  case 5: 
   var $16=(($alt)|0); //@line 373 "html/html.c"
   var $17=HEAP32[(($16)>>2)]; //@line 373 "html/html.c"
   _houdini_escape_html0($ob, $17, $13, 0); //@line 65 "html/html.c"
   label = 6; break; //@line 373 "html/html.c"
  case 6: 
   var $19=(($title)|(0))==0; //@line 375 "html/html.c"
   if ($19) { label = 9; break; } else { label = 7; break; } //@line 375 "html/html.c"
  case 7: 
   var $21=(($title+4)|0); //@line 375 "html/html.c"
   var $22=HEAP32[(($21)>>2)]; //@line 375 "html/html.c"
   var $23=(($22)|(0))==0; //@line 375 "html/html.c"
   if ($23) { label = 9; break; } else { label = 8; break; } //@line 375 "html/html.c"
  case 8: 
   _bufput($ob, ((1472)|0), 9); //@line 376 "html/html.c"
   var $25=(($title)|0); //@line 377 "html/html.c"
   var $26=HEAP32[(($25)>>2)]; //@line 377 "html/html.c"
   var $27=HEAP32[(($21)>>2)]; //@line 377 "html/html.c"
   _houdini_escape_html0($ob, $26, $27, 0); //@line 65 "html/html.c"
   label = 9; break; //@line 377 "html/html.c"
  case 9: 
   var $29=(($opaque+12)|0); //@line 379 "html/html.c"
   var $30=$29; //@line 379 "html/html.c"
   var $31=HEAP32[(($30)>>2)]; //@line 379 "html/html.c"
   var $32=$31 & 256; //@line 379 "html/html.c"
   var $33=(($32)|(0))!=0; //@line 379 "html/html.c"
   var $34=$33 ? (((2472)|0)) : (((1304)|0)); //@line 379 "html/html.c"
   _bufputs($ob, $34); //@line 379 "html/html.c"
   var $_0 = 1;label = 10; break; //@line 380 "html/html.c"
  case 10: 
   var $_0;
   return $_0; //@line 381 "html/html.c"
  default: assert(0, "bad label: " + label);
 }
}
function _rndr_linebreak($ob, $opaque) {
 var label = 0;
 var $1=(($opaque+12)|0); //@line 211 "html/html.c"
 var $2=$1; //@line 211 "html/html.c"
 var $3=HEAP32[(($2)>>2)]; //@line 211 "html/html.c"
 var $4=$3 & 256; //@line 211 "html/html.c"
 var $5=(($4)|(0))!=0; //@line 211 "html/html.c"
 var $6=$5 ? (((1136)|0)) : (((1112)|0)); //@line 211 "html/html.c"
 _bufputs($ob, $6); //@line 211 "html/html.c"
 return 1; //@line 212 "html/html.c"
}
function _rndr_link($ob, $link, $title, $content, $opaque) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($link)|(0))==0; //@line 237 "html/html.c"
   if ($1) { label = 8; break; } else { label = 2; break; } //@line 237 "html/html.c"
  case 2: 
   var $3=(($opaque+12)|0); //@line 237 "html/html.c"
   var $4=$3; //@line 237 "html/html.c"
   var $5=HEAP32[(($4)>>2)]; //@line 237 "html/html.c"
   var $6=$5 & 32; //@line 237 "html/html.c"
   var $7=(($6)|(0))==0; //@line 237 "html/html.c"
   if ($7) { label = 3; break; } else { label = 4; break; } //@line 237 "html/html.c"
  case 3: 
   _bufput($ob, ((1656)|0), 9); //@line 240 "html/html.c"
   var $_pre=(($link+4)|0); //@line 242 "html/html.c"
   var $_pre_phi = $_pre;label = 6; break; //@line 242 "html/html.c"
  case 4: 
   var $9=(($link)|0); //@line 237 "html/html.c"
   var $10=HEAP32[(($9)>>2)]; //@line 237 "html/html.c"
   var $11=(($link+4)|0); //@line 237 "html/html.c"
   var $12=HEAP32[(($11)>>2)]; //@line 237 "html/html.c"
   var $13=_sd_autolink_issafe($10, $12); //@line 237 "html/html.c"
   var $14=(($13)|(0))==0; //@line 237 "html/html.c"
   if ($14) { var $_0 = 0;label = 19; break; } else { label = 5; break; } //@line 237 "html/html.c"
  case 5: 
   _bufput($ob, ((1656)|0), 9); //@line 240 "html/html.c"
   var $_pre_phi = $11;label = 6; break; //@line 242 "html/html.c"
  case 6: 
   var $_pre_phi; //@line 242 "html/html.c"
   var $17=HEAP32[(($_pre_phi)>>2)]; //@line 242 "html/html.c"
   var $18=(($17)|(0))==0; //@line 242 "html/html.c"
   if ($18) { label = 9; break; } else { label = 7; break; } //@line 242 "html/html.c"
  case 7: 
   var $20=(($link)|0); //@line 243 "html/html.c"
   var $21=HEAP32[(($20)>>2)]; //@line 243 "html/html.c"
   _houdini_escape_href($ob, $21, $17); //@line 70 "html/html.c"
   label = 9; break; //@line 243 "html/html.c"
  case 8: 
   _bufput($ob, ((1656)|0), 9); //@line 240 "html/html.c"
   label = 9; break;
  case 9: 
   var $23=(($title)|(0))==0; //@line 245 "html/html.c"
   if ($23) { label = 12; break; } else { label = 10; break; } //@line 245 "html/html.c"
  case 10: 
   var $25=(($title+4)|0); //@line 245 "html/html.c"
   var $26=HEAP32[(($25)>>2)]; //@line 245 "html/html.c"
   var $27=(($26)|(0))==0; //@line 245 "html/html.c"
   if ($27) { label = 12; break; } else { label = 11; break; } //@line 245 "html/html.c"
  case 11: 
   _bufput($ob, ((1472)|0), 9); //@line 246 "html/html.c"
   var $29=(($title)|0); //@line 247 "html/html.c"
   var $30=HEAP32[(($29)>>2)]; //@line 247 "html/html.c"
   var $31=HEAP32[(($25)>>2)]; //@line 247 "html/html.c"
   _houdini_escape_html0($ob, $30, $31, 0); //@line 65 "html/html.c"
   label = 12; break; //@line 248 "html/html.c"
  case 12: 
   var $33=(($opaque+16)|0); //@line 250 "html/html.c"
   var $34=$33; //@line 250 "html/html.c"
   var $35=HEAP32[(($34)>>2)]; //@line 250 "html/html.c"
   var $36=(($35)|(0))==0; //@line 250 "html/html.c"
   if ($36) { label = 14; break; } else { label = 13; break; } //@line 250 "html/html.c"
  case 13: 
   _bufputc($ob, 34); //@line 251 "html/html.c"
   var $38=HEAP32[(($34)>>2)]; //@line 252 "html/html.c"
   FUNCTION_TABLE[$38]($ob, $link, $opaque); //@line 252 "html/html.c"
   _bufputc($ob, 62); //@line 253 "html/html.c"
   label = 15; break; //@line 254 "html/html.c"
  case 14: 
   _bufput($ob, ((1304)|0), 2); //@line 255 "html/html.c"
   label = 15; break;
  case 15: 
   var $41=(($content)|(0))==0; //@line 258 "html/html.c"
   if ($41) { label = 18; break; } else { label = 16; break; } //@line 258 "html/html.c"
  case 16: 
   var $43=(($content+4)|0); //@line 258 "html/html.c"
   var $44=HEAP32[(($43)>>2)]; //@line 258 "html/html.c"
   var $45=(($44)|(0))==0; //@line 258 "html/html.c"
   if ($45) { label = 18; break; } else { label = 17; break; } //@line 258 "html/html.c"
  case 17: 
   var $47=(($content)|0); //@line 258 "html/html.c"
   var $48=HEAP32[(($47)>>2)]; //@line 258 "html/html.c"
   _bufput($ob, $48, $44); //@line 258 "html/html.c"
   label = 18; break; //@line 258 "html/html.c"
  case 18: 
   _bufput($ob, ((1168)|0), 4); //@line 259 "html/html.c"
   var $_0 = 1;label = 19; break; //@line 260 "html/html.c"
  case 19: 
   var $_0;
   return $_0; //@line 261 "html/html.c"
  default: assert(0, "bad label: " + label);
 }
}
function _rndr_raw_html($ob, $text, $opaque) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($opaque+12)|0); //@line 390 "html/html.c"
   var $2=$1; //@line 390 "html/html.c"
   var $3=HEAP32[(($2)>>2)]; //@line 390 "html/html.c"
   var $4=$3 & 512; //@line 390 "html/html.c"
   var $5=(($4)|(0))==0; //@line 390 "html/html.c"
   if ($5) { label = 3; break; } else { label = 2; break; } //@line 390 "html/html.c"
  case 2: 
   var $7=(($text)|0); //@line 391 "html/html.c"
   var $8=HEAP32[(($7)>>2)]; //@line 391 "html/html.c"
   var $9=(($text+4)|0); //@line 391 "html/html.c"
   var $10=HEAP32[(($9)>>2)]; //@line 391 "html/html.c"
   _houdini_escape_html0($ob, $8, $10, 0); //@line 65 "html/html.c"
   label = 38; break; //@line 392 "html/html.c"
  case 3: 
   var $12=$3 & 1; //@line 395 "html/html.c"
   var $13=(($12)|(0))==0; //@line 395 "html/html.c"
   if ($13) { label = 4; break; } else { label = 38; break; } //@line 395 "html/html.c"
  case 4: 
   var $15=$3 & 2; //@line 398 "html/html.c"
   var $16=(($15)|(0))==0; //@line 398 "html/html.c"
   if ($16) { var $53 = $3;label = 15; break; } else { label = 5; break; } //@line 398 "html/html.c"
  case 5: 
   var $18=(($text)|0); //@line 399 "html/html.c"
   var $19=HEAP32[(($18)>>2)]; //@line 399 "html/html.c"
   var $20=(($text+4)|0); //@line 399 "html/html.c"
   var $21=HEAP32[(($20)>>2)]; //@line 399 "html/html.c"
   var $22=(($21)>>>(0)) < 3; //@line 36 "html/html.c"
   if ($22) { var $53 = $3;label = 15; break; } else { label = 6; break; } //@line 36 "html/html.c"
  case 6: 
   var $24=HEAP8[($19)]; //@line 36 "html/html.c"
   var $25=(($24 << 24) >> 24)==60; //@line 36 "html/html.c"
   if ($25) { label = 7; break; } else { var $53 = $3;label = 15; break; } //@line 36 "html/html.c"
  case 7: 
   var $27=(($19+1)|0); //@line 41 "html/html.c"
   var $28=HEAP8[($27)]; //@line 41 "html/html.c"
   var $29=(($28 << 24) >> 24)==47; //@line 41 "html/html.c"
   var $__i=$29 ? 2 : 1; //@line 41 "html/html.c"
   var $30=(($__i)>>>(0)) < (($21)>>>(0)); //@line 46 "html/html.c"
   if ($30) { var $_022_i = ((1248)|0);var $i_023_i = $__i;label = 8; break; } else { var $i_0_lcssa_i = $__i;label = 11; break; } //@line 46 "html/html.c"
  case 8: 
   var $i_023_i;
   var $_022_i;
   var $31=HEAP8[($_022_i)]; //@line 47 "html/html.c"
   var $32=(($31 << 24) >> 24)==0; //@line 47 "html/html.c"
   if ($32) { var $i_0_lcssa_i = $i_023_i;label = 11; break; } else { label = 9; break; } //@line 47 "html/html.c"
  case 9: 
   var $34=(($31 << 24) >> 24); //@line 47 "html/html.c"
   var $35=(($19+$i_023_i)|0); //@line 50 "html/html.c"
   var $36=HEAP8[($35)]; //@line 50 "html/html.c"
   var $37=(($36)&(255)); //@line 50 "html/html.c"
   var $38=(($37)|(0))==(($34)|(0)); //@line 50 "html/html.c"
   if ($38) { label = 10; break; } else { var $53 = $3;label = 15; break; } //@line 50 "html/html.c"
  case 10: 
   var $40=((($i_023_i)+(1))|0); //@line 46 "html/html.c"
   var $41=(($_022_i+1)|0); //@line 46 "html/html.c"
   var $42=(($40)>>>(0)) < (($21)>>>(0)); //@line 46 "html/html.c"
   if ($42) { var $_022_i = $41;var $i_023_i = $40;label = 8; break; } else { var $i_0_lcssa_i = $40;label = 11; break; } //@line 46 "html/html.c"
  case 11: 
   var $i_0_lcssa_i;
   var $43=(($i_0_lcssa_i)|(0))==(($21)|(0)); //@line 54 "html/html.c"
   if ($43) { var $53 = $3;label = 15; break; } else { label = 12; break; } //@line 54 "html/html.c"
  case 12: 
   var $45=(($19+$i_0_lcssa_i)|0); //@line 57 "html/html.c"
   var $46=HEAP8[($45)]; //@line 57 "html/html.c"
   var $47=(($46)&(255)); //@line 57 "html/html.c"
   var $48=_isspace($47); //@line 57 "html/html.c"
   var $49=(($48)|(0))==0; //@line 57 "html/html.c"
   if ($49) { label = 13; break; } else { label = 38; break; } //@line 57 "html/html.c"
  case 13: 
   var $51=HEAP8[($45)]; //@line 57 "html/html.c"
   var $52=(($51 << 24) >> 24)==62; //@line 57 "html/html.c"
   if ($52) { label = 38; break; } else { label = 14; break; } //@line 57 "html/html.c"
  case 14: 
   var $_pre=HEAP32[(($2)>>2)]; //@line 402 "html/html.c"
   var $53 = $_pre;label = 15; break; //@line 57 "html/html.c"
  case 15: 
   var $53;
   var $54=$53 & 8; //@line 402 "html/html.c"
   var $55=(($54)|(0))==0; //@line 402 "html/html.c"
   if ($55) { var $92 = $53;label = 26; break; } else { label = 16; break; } //@line 402 "html/html.c"
  case 16: 
   var $57=(($text)|0); //@line 403 "html/html.c"
   var $58=HEAP32[(($57)>>2)]; //@line 403 "html/html.c"
   var $59=(($text+4)|0); //@line 403 "html/html.c"
   var $60=HEAP32[(($59)>>2)]; //@line 403 "html/html.c"
   var $61=(($60)>>>(0)) < 3; //@line 36 "html/html.c"
   if ($61) { var $92 = $53;label = 26; break; } else { label = 17; break; } //@line 36 "html/html.c"
  case 17: 
   var $63=HEAP8[($58)]; //@line 36 "html/html.c"
   var $64=(($63 << 24) >> 24)==60; //@line 36 "html/html.c"
   if ($64) { label = 18; break; } else { var $92 = $53;label = 26; break; } //@line 36 "html/html.c"
  case 18: 
   var $66=(($58+1)|0); //@line 41 "html/html.c"
   var $67=HEAP8[($66)]; //@line 41 "html/html.c"
   var $68=(($67 << 24) >> 24)==47; //@line 41 "html/html.c"
   var $__i18=$68 ? 2 : 1; //@line 41 "html/html.c"
   var $69=(($__i18)>>>(0)) < (($60)>>>(0)); //@line 46 "html/html.c"
   if ($69) { var $_022_i20 = ((2288)|0);var $i_023_i19 = $__i18;label = 19; break; } else { var $i_0_lcssa_i22 = $__i18;label = 22; break; } //@line 46 "html/html.c"
  case 19: 
   var $i_023_i19;
   var $_022_i20;
   var $70=HEAP8[($_022_i20)]; //@line 47 "html/html.c"
   var $71=(($70 << 24) >> 24)==0; //@line 47 "html/html.c"
   if ($71) { var $i_0_lcssa_i22 = $i_023_i19;label = 22; break; } else { label = 20; break; } //@line 47 "html/html.c"
  case 20: 
   var $73=(($70 << 24) >> 24); //@line 47 "html/html.c"
   var $74=(($58+$i_023_i19)|0); //@line 50 "html/html.c"
   var $75=HEAP8[($74)]; //@line 50 "html/html.c"
   var $76=(($75)&(255)); //@line 50 "html/html.c"
   var $77=(($76)|(0))==(($73)|(0)); //@line 50 "html/html.c"
   if ($77) { label = 21; break; } else { var $92 = $53;label = 26; break; } //@line 50 "html/html.c"
  case 21: 
   var $79=((($i_023_i19)+(1))|0); //@line 46 "html/html.c"
   var $80=(($_022_i20+1)|0); //@line 46 "html/html.c"
   var $81=(($79)>>>(0)) < (($60)>>>(0)); //@line 46 "html/html.c"
   if ($81) { var $_022_i20 = $80;var $i_023_i19 = $79;label = 19; break; } else { var $i_0_lcssa_i22 = $79;label = 22; break; } //@line 46 "html/html.c"
  case 22: 
   var $i_0_lcssa_i22;
   var $82=(($i_0_lcssa_i22)|(0))==(($60)|(0)); //@line 54 "html/html.c"
   if ($82) { var $92 = $53;label = 26; break; } else { label = 23; break; } //@line 54 "html/html.c"
  case 23: 
   var $84=(($58+$i_0_lcssa_i22)|0); //@line 57 "html/html.c"
   var $85=HEAP8[($84)]; //@line 57 "html/html.c"
   var $86=(($85)&(255)); //@line 57 "html/html.c"
   var $87=_isspace($86); //@line 57 "html/html.c"
   var $88=(($87)|(0))==0; //@line 57 "html/html.c"
   if ($88) { label = 24; break; } else { label = 38; break; } //@line 57 "html/html.c"
  case 24: 
   var $90=HEAP8[($84)]; //@line 57 "html/html.c"
   var $91=(($90 << 24) >> 24)==62; //@line 57 "html/html.c"
   if ($91) { label = 38; break; } else { label = 25; break; } //@line 57 "html/html.c"
  case 25: 
   var $_pre38=HEAP32[(($2)>>2)]; //@line 406 "html/html.c"
   var $92 = $_pre38;label = 26; break; //@line 57 "html/html.c"
  case 26: 
   var $92;
   var $93=$92 & 4; //@line 406 "html/html.c"
   var $94=(($93)|(0))==0; //@line 406 "html/html.c"
   var $_pre39=(($text)|0); //@line 410 "html/html.c"
   if ($94) { label = 27; break; } else { label = 28; break; } //@line 406 "html/html.c"
  case 27: 
   var $_pre40=(($text+4)|0); //@line 410 "html/html.c"
   var $_pre_phi41 = $_pre40;label = 37; break; //@line 406 "html/html.c"
  case 28: 
   var $96=HEAP32[(($_pre39)>>2)]; //@line 407 "html/html.c"
   var $97=(($text+4)|0); //@line 407 "html/html.c"
   var $98=HEAP32[(($97)>>2)]; //@line 407 "html/html.c"
   var $99=(($98)>>>(0)) < 3; //@line 36 "html/html.c"
   if ($99) { var $_pre_phi41 = $97;label = 37; break; } else { label = 29; break; } //@line 36 "html/html.c"
  case 29: 
   var $101=HEAP8[($96)]; //@line 36 "html/html.c"
   var $102=(($101 << 24) >> 24)==60; //@line 36 "html/html.c"
   if ($102) { label = 30; break; } else { var $_pre_phi41 = $97;label = 37; break; } //@line 36 "html/html.c"
  case 30: 
   var $104=(($96+1)|0); //@line 41 "html/html.c"
   var $105=HEAP8[($104)]; //@line 41 "html/html.c"
   var $106=(($105 << 24) >> 24)==47; //@line 41 "html/html.c"
   var $__i26=$106 ? 2 : 1; //@line 41 "html/html.c"
   var $107=(($__i26)>>>(0)) < (($98)>>>(0)); //@line 46 "html/html.c"
   if ($107) { var $_022_i28 = ((1944)|0);var $i_023_i27 = $__i26;label = 31; break; } else { var $i_0_lcssa_i30 = $__i26;label = 34; break; } //@line 46 "html/html.c"
  case 31: 
   var $i_023_i27;
   var $_022_i28;
   var $108=HEAP8[($_022_i28)]; //@line 47 "html/html.c"
   var $109=(($108 << 24) >> 24)==0; //@line 47 "html/html.c"
   if ($109) { var $i_0_lcssa_i30 = $i_023_i27;label = 34; break; } else { label = 32; break; } //@line 47 "html/html.c"
  case 32: 
   var $111=(($108 << 24) >> 24); //@line 47 "html/html.c"
   var $112=(($96+$i_023_i27)|0); //@line 50 "html/html.c"
   var $113=HEAP8[($112)]; //@line 50 "html/html.c"
   var $114=(($113)&(255)); //@line 50 "html/html.c"
   var $115=(($114)|(0))==(($111)|(0)); //@line 50 "html/html.c"
   if ($115) { label = 33; break; } else { var $_pre_phi41 = $97;label = 37; break; } //@line 50 "html/html.c"
  case 33: 
   var $117=((($i_023_i27)+(1))|0); //@line 46 "html/html.c"
   var $118=(($_022_i28+1)|0); //@line 46 "html/html.c"
   var $119=(($117)>>>(0)) < (($98)>>>(0)); //@line 46 "html/html.c"
   if ($119) { var $_022_i28 = $118;var $i_023_i27 = $117;label = 31; break; } else { var $i_0_lcssa_i30 = $117;label = 34; break; } //@line 46 "html/html.c"
  case 34: 
   var $i_0_lcssa_i30;
   var $120=(($i_0_lcssa_i30)|(0))==(($98)|(0)); //@line 54 "html/html.c"
   if ($120) { var $_pre_phi41 = $97;label = 37; break; } else { label = 35; break; } //@line 54 "html/html.c"
  case 35: 
   var $122=(($96+$i_0_lcssa_i30)|0); //@line 57 "html/html.c"
   var $123=HEAP8[($122)]; //@line 57 "html/html.c"
   var $124=(($123)&(255)); //@line 57 "html/html.c"
   var $125=_isspace($124); //@line 57 "html/html.c"
   var $126=(($125)|(0))==0; //@line 57 "html/html.c"
   if ($126) { label = 36; break; } else { label = 38; break; } //@line 57 "html/html.c"
  case 36: 
   var $128=HEAP8[($122)]; //@line 57 "html/html.c"
   var $129=(($128 << 24) >> 24)==62; //@line 57 "html/html.c"
   if ($129) { label = 38; break; } else { var $_pre_phi41 = $97;label = 37; break; } //@line 57 "html/html.c"
  case 37: 
   var $_pre_phi41; //@line 410 "html/html.c"
   var $130=HEAP32[(($_pre39)>>2)]; //@line 410 "html/html.c"
   var $131=HEAP32[(($_pre_phi41)>>2)]; //@line 410 "html/html.c"
   _bufput($ob, $130, $131); //@line 410 "html/html.c"
   label = 38; break; //@line 411 "html/html.c"
  case 38: 
   return 1; //@line 412 "html/html.c"
  default: assert(0, "bad label: " + label);
 }
}
function _rndr_normal_text($ob, $text, $opaque) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($text)|(0))==0; //@line 485 "html/html.c"
   if ($1) { label = 3; break; } else { label = 2; break; } //@line 485 "html/html.c"
  case 2: 
   var $3=(($text)|0); //@line 486 "html/html.c"
   var $4=HEAP32[(($3)>>2)]; //@line 486 "html/html.c"
   var $5=(($text+4)|0); //@line 486 "html/html.c"
   var $6=HEAP32[(($5)>>2)]; //@line 486 "html/html.c"
   _houdini_escape_html0($ob, $4, $6, 0); //@line 65 "html/html.c"
   label = 3; break; //@line 486 "html/html.c"
  case 3: 
   return; //@line 487 "html/html.c"
  default: assert(0, "bad label: " + label);
 }
}
function _sdhtml_smartypants($ob, $text, $size) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $smrt=sp; //@line 364 "html/html_smartypants.c"
   var $tmpcast=$smrt; //@line 364 "html/html_smartypants.c"
   var $$etemp$0$0=0;
   var $$etemp$0$1=0;
   var $st$1$0=(($smrt)|0);
   HEAP32[(($st$1$0)>>2)]=$$etemp$0$0;
   var $st$2$1=(($smrt+4)|0);
   HEAP32[(($st$2$1)>>2)]=$$etemp$0$1;
   var $1=(($text)|(0))==0; //@line 366 "html/html_smartypants.c"
   if ($1) { label = 13; break; } else { label = 2; break; } //@line 366 "html/html_smartypants.c"
  case 2: 
   var $3=_bufgrow($ob, $size); //@line 369 "html/html_smartypants.c"
   var $4=(($size)|(0))==0; //@line 371 "html/html_smartypants.c"
   if ($4) { label = 13; break; } else { var $i_028 = 0;label = 3; break; } //@line 371 "html/html_smartypants.c"
  case 3: 
   var $i_028;
   var $i_1 = $i_028;label = 4; break; //@line 376 "html/html_smartypants.c"
  case 4: 
   var $i_1;
   var $6=(($i_1)>>>(0)) < (($size)>>>(0)); //@line 376 "html/html_smartypants.c"
   if ($6) { label = 5; break; } else { var $action_127 = 0;var $_lcssa = 0;label = 6; break; } //@line 376 "html/html_smartypants.c"
  case 5: 
   var $8=(($text+$i_1)|0); //@line 376 "html/html_smartypants.c"
   var $9=HEAP8[($8)]; //@line 376 "html/html_smartypants.c"
   var $10=(($9)&(255)); //@line 376 "html/html_smartypants.c"
   var $11=((56+$10)|0); //@line 376 "html/html_smartypants.c"
   var $12=HEAP8[($11)]; //@line 376 "html/html_smartypants.c"
   var $13=(($12 << 24) >> 24)==0; //@line 376 "html/html_smartypants.c"
   var $14=((($i_1)+(1))|0); //@line 377 "html/html_smartypants.c"
   if ($13) { var $i_1 = $14;label = 4; break; } else { var $action_127 = $12;var $_lcssa = 1;label = 6; break; }
  case 6: 
   var $_lcssa;
   var $action_127;
   var $15=(($i_1)>>>(0)) > (($i_028)>>>(0)); //@line 379 "html/html_smartypants.c"
   if ($15) { label = 7; break; } else { label = 8; break; } //@line 379 "html/html_smartypants.c"
  case 7: 
   var $17=(($text+$i_028)|0); //@line 380 "html/html_smartypants.c"
   var $18=((($i_1)-($i_028))|0); //@line 380 "html/html_smartypants.c"
   _bufput($ob, $17, $18); //@line 380 "html/html_smartypants.c"
   label = 8; break; //@line 380 "html/html_smartypants.c"
  case 8: 
   if ($_lcssa) { label = 9; break; } else { var $i_2 = $i_1;label = 12; break; } //@line 382 "html/html_smartypants.c"
  case 9: 
   var $21=(($action_127)&(255)); //@line 383 "html/html_smartypants.c"
   var $22=((8+($21<<2))|0); //@line 383 "html/html_smartypants.c"
   var $23=HEAP32[(($22)>>2)]; //@line 383 "html/html_smartypants.c"
   var $24=(($i_1)|(0))==0; //@line 383 "html/html_smartypants.c"
   if ($24) { var $_off0 = 0;label = 11; break; } else { label = 10; break; } //@line 383 "html/html_smartypants.c"
  case 10: 
   var $26=((($i_1)-(1))|0); //@line 383 "html/html_smartypants.c"
   var $27=(($text+$26)|0); //@line 383 "html/html_smartypants.c"
   var $28=HEAP8[($27)]; //@line 383 "html/html_smartypants.c"
   var $_off0 = $28;label = 11; break; //@line 383 "html/html_smartypants.c"
  case 11: 
   var $_off0;
   var $30=(($text+$i_1)|0); //@line 383 "html/html_smartypants.c"
   var $31=((($size)-($i_1))|0); //@line 383 "html/html_smartypants.c"
   var $32=FUNCTION_TABLE[$23]($ob, $tmpcast, $_off0, $30, $31); //@line 383 "html/html_smartypants.c"
   var $33=((($32)+($i_1))|0); //@line 383 "html/html_smartypants.c"
   var $i_2 = $33;label = 12; break; //@line 385 "html/html_smartypants.c"
  case 12: 
   var $i_2;
   var $35=((($i_2)+(1))|0); //@line 371 "html/html_smartypants.c"
   var $36=(($35)>>>(0)) < (($size)>>>(0)); //@line 371 "html/html_smartypants.c"
   if ($36) { var $i_028 = $35;label = 3; break; } else { label = 13; break; } //@line 371 "html/html_smartypants.c"
  case 13: 
   STACKTOP = sp;
   return; //@line 387 "html/html_smartypants.c"
  default: assert(0, "bad label: " + label);
 }
}
Module["_sdhtml_smartypants"] = _sdhtml_smartypants;
function _smartypants_cb__dash($ob, $smrt, $previous_char, $text, $size) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($size)>>>(0)) > 2; //@line 170 "html/html_smartypants.c"
   if ($1) { label = 2; break; } else { label = 5; break; } //@line 170 "html/html_smartypants.c"
  case 2: 
   var $3=(($text+1)|0); //@line 170 "html/html_smartypants.c"
   var $4=HEAP8[($3)]; //@line 170 "html/html_smartypants.c"
   var $5=(($4 << 24) >> 24)==45; //@line 170 "html/html_smartypants.c"
   if ($5) { label = 3; break; } else { label = 5; break; } //@line 170 "html/html_smartypants.c"
  case 3: 
   var $7=(($text+2)|0); //@line 170 "html/html_smartypants.c"
   var $8=HEAP8[($7)]; //@line 170 "html/html_smartypants.c"
   var $9=(($8 << 24) >> 24)==45; //@line 170 "html/html_smartypants.c"
   if ($9) { label = 4; break; } else { label = 5; break; } //@line 170 "html/html_smartypants.c"
  case 4: 
   _bufput($ob, ((2184)|0), 7); //@line 171 "html/html_smartypants.c"
   var $_0 = 2;label = 9; break; //@line 172 "html/html_smartypants.c"
  case 5: 
   var $12=(($size)>>>(0)) > 1; //@line 175 "html/html_smartypants.c"
   if ($12) { label = 6; break; } else { label = 8; break; } //@line 175 "html/html_smartypants.c"
  case 6: 
   var $14=(($text+1)|0); //@line 175 "html/html_smartypants.c"
   var $15=HEAP8[($14)]; //@line 175 "html/html_smartypants.c"
   var $16=(($15 << 24) >> 24)==45; //@line 175 "html/html_smartypants.c"
   if ($16) { label = 7; break; } else { label = 8; break; } //@line 175 "html/html_smartypants.c"
  case 7: 
   _bufput($ob, ((2144)|0), 7); //@line 176 "html/html_smartypants.c"
   var $_0 = 1;label = 9; break; //@line 177 "html/html_smartypants.c"
  case 8: 
   var $19=HEAP8[($text)]; //@line 180 "html/html_smartypants.c"
   var $20=(($19)&(255)); //@line 180 "html/html_smartypants.c"
   _bufputc($ob, $20); //@line 180 "html/html_smartypants.c"
   var $_0 = 0;label = 9; break; //@line 181 "html/html_smartypants.c"
  case 9: 
   var $_0;
   return $_0; //@line 182 "html/html_smartypants.c"
  default: assert(0, "bad label: " + label);
 }
}
function _smartypants_cb__parens($ob, $smrt, $previous_char, $text, $size) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($size)>>>(0)) > 2; //@line 143 "html/html_smartypants.c"
   if ($1) { label = 2; break; } else { label = 11; break; } //@line 143 "html/html_smartypants.c"
  case 2: 
   var $3=(($text+1)|0); //@line 144 "html/html_smartypants.c"
   var $4=HEAP8[($3)]; //@line 144 "html/html_smartypants.c"
   var $5=(($4)&(255)); //@line 144 "html/html_smartypants.c"
   var $6=_tolower($5); //@line 144 "html/html_smartypants.c"
   var $7=(($text+2)|0); //@line 145 "html/html_smartypants.c"
   var $8=HEAP8[($7)]; //@line 145 "html/html_smartypants.c"
   var $9=(($8)&(255)); //@line 145 "html/html_smartypants.c"
   var $10=_tolower($9); //@line 145 "html/html_smartypants.c"
   var $11=$6 & 255; //@line 147 "html/html_smartypants.c"
   if ((($11)|(0))==99) {
    label = 3; break;
   }
   else if ((($11)|(0))==114) {
    label = 5; break;
   }
   else {
   label = 7; break;
   }
  case 3: 
   var $13=$10 & 255; //@line 147 "html/html_smartypants.c"
   var $14=(($13)|(0))==41; //@line 147 "html/html_smartypants.c"
   if ($14) { label = 4; break; } else { label = 11; break; } //@line 147 "html/html_smartypants.c"
  case 4: 
   _bufput($ob, ((2280)|0), 6); //@line 148 "html/html_smartypants.c"
   var $_0 = 2;label = 12; break; //@line 149 "html/html_smartypants.c"
  case 5: 
   var $17=$10 & 255; //@line 152 "html/html_smartypants.c"
   var $18=(($17)|(0))==41; //@line 152 "html/html_smartypants.c"
   if ($18) { label = 6; break; } else { label = 11; break; } //@line 152 "html/html_smartypants.c"
  case 6: 
   _bufput($ob, ((2248)|0), 5); //@line 153 "html/html_smartypants.c"
   var $_0 = 2;label = 12; break; //@line 154 "html/html_smartypants.c"
  case 7: 
   var $21=(($size)>>>(0)) > 3; //@line 157 "html/html_smartypants.c"
   var $22=(($11)|(0))==116; //@line 157 "html/html_smartypants.c"
   var $or_cond=$21 & $22; //@line 157 "html/html_smartypants.c"
   if ($or_cond) { label = 8; break; } else { label = 11; break; } //@line 157 "html/html_smartypants.c"
  case 8: 
   var $24=$10 & 255; //@line 157 "html/html_smartypants.c"
   var $25=(($24)|(0))==109; //@line 157 "html/html_smartypants.c"
   if ($25) { label = 9; break; } else { label = 11; break; } //@line 157 "html/html_smartypants.c"
  case 9: 
   var $27=(($text+3)|0); //@line 157 "html/html_smartypants.c"
   var $28=HEAP8[($27)]; //@line 157 "html/html_smartypants.c"
   var $29=(($28 << 24) >> 24)==41; //@line 157 "html/html_smartypants.c"
   if ($29) { label = 10; break; } else { label = 11; break; } //@line 157 "html/html_smartypants.c"
  case 10: 
   _bufput($ob, ((2208)|0), 7); //@line 158 "html/html_smartypants.c"
   var $_0 = 3;label = 12; break; //@line 159 "html/html_smartypants.c"
  case 11: 
   var $31=HEAP8[($text)]; //@line 163 "html/html_smartypants.c"
   var $32=(($31)&(255)); //@line 163 "html/html_smartypants.c"
   _bufputc($ob, $32); //@line 163 "html/html_smartypants.c"
   var $_0 = 0;label = 12; break; //@line 164 "html/html_smartypants.c"
  case 12: 
   var $_0;
   return $_0; //@line 165 "html/html_smartypants.c"
  default: assert(0, "bad label: " + label);
 }
}
function _smartypants_cb__squote($ob, $smrt, $previous_char, $text, $size) {
 var label = 0;
 var tempVarArgs = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $ent_i=sp;
   var $1=(($size)>>>(0)) > 1; //@line 106 "html/html_smartypants.c"
   if ($1) { label = 2; break; } else { label = 30; break; } //@line 106 "html/html_smartypants.c"
  case 2: 
   var $3=(($text+1)|0); //@line 107 "html/html_smartypants.c"
   var $4=HEAP8[($3)]; //@line 107 "html/html_smartypants.c"
   var $5=(($4)&(255)); //@line 107 "html/html_smartypants.c"
   var $6=_tolower($5); //@line 107 "html/html_smartypants.c"
   var $7=$6 & 255; //@line 109 "html/html_smartypants.c"
   switch((($7)|(0))) {
   case 39:{
    label = 3; break;
   }
   case 115: case 116: case 109: case 100:{
    label = 15; break;
   }
   default: {
   label = 20; break;
   }
   } break; 
  case 3: 
   var $9=(($size)>>>(0)) > 2; //@line 110 "html/html_smartypants.c"
   if ($9) { label = 4; break; } else { var $_off032 = 0;label = 5; break; } //@line 110 "html/html_smartypants.c"
  case 4: 
   var $11=(($text+2)|0); //@line 110 "html/html_smartypants.c"
   var $12=HEAP8[($11)]; //@line 110 "html/html_smartypants.c"
   var $_off032 = $12;label = 5; break; //@line 110 "html/html_smartypants.c"
  case 5: 
   var $_off032;
   var $14=(($smrt+4)|0); //@line 110 "html/html_smartypants.c"
   var $15=(($ent_i)|0); //@line 87 "html/html_smartypants.c"
   var $16=HEAP32[(($14)>>2)]; //@line 91 "html/html_smartypants.c"
   var $17=(($16)|(0))==0; //@line 91 "html/html_smartypants.c"
   if ($17) { label = 10; break; } else { label = 6; break; } //@line 91 "html/html_smartypants.c"
  case 6: 
   var $19=(($_off032)&(255)); //@line 83 "html/html_smartypants.c"
   var $20=(($_off032 << 24) >> 24)==0; //@line 83 "html/html_smartypants.c"
   if ($20) { label = 9; break; } else { label = 7; break; } //@line 83 "html/html_smartypants.c"
  case 7: 
   var $22=_isspace($19); //@line 83 "html/html_smartypants.c"
   var $23=(($22)|(0))==0; //@line 83 "html/html_smartypants.c"
   if ($23) { label = 8; break; } else { label = 9; break; } //@line 83 "html/html_smartypants.c"
  case 8: 
   var $24=_ispunct($19); //@line 83 "html/html_smartypants.c"
   var $25=(($24)|(0))==0; //@line 83 "html/html_smartypants.c"
   if ($25) { label = 20; break; } else { label = 9; break; } //@line 91 "html/html_smartypants.c"
  case 9: 
   var $_pr_i=HEAP32[(($14)>>2)]; //@line 94 "html/html_smartypants.c"
   var $26=(($_pr_i)|(0))==0; //@line 94 "html/html_smartypants.c"
   if ($26) { label = 10; break; } else { var $34 = $_pr_i;label = 14; break; } //@line 94 "html/html_smartypants.c"
  case 10: 
   var $27=(($previous_char)&(255)); //@line 83 "html/html_smartypants.c"
   var $28=(($previous_char << 24) >> 24)==0; //@line 83 "html/html_smartypants.c"
   if ($28) { label = 13; break; } else { label = 11; break; } //@line 83 "html/html_smartypants.c"
  case 11: 
   var $30=_isspace($27); //@line 83 "html/html_smartypants.c"
   var $31=(($30)|(0))==0; //@line 83 "html/html_smartypants.c"
   if ($31) { label = 12; break; } else { label = 13; break; } //@line 83 "html/html_smartypants.c"
  case 12: 
   var $32=_ispunct($27); //@line 83 "html/html_smartypants.c"
   var $33=(($32)|(0))==0; //@line 83 "html/html_smartypants.c"
   if ($33) { label = 20; break; } else { label = 13; break; } //@line 94 "html/html_smartypants.c"
  case 13: 
   var $_pre_i=HEAP32[(($14)>>2)]; //@line 97 "html/html_smartypants.c"
   var $34 = $_pre_i;label = 14; break; //@line 94 "html/html_smartypants.c"
  case 14: 
   var $34;
   var $35=(($34)|(0))!=0; //@line 97 "html/html_smartypants.c"
   var $36=$35 ? 114 : 108; //@line 97 "html/html_smartypants.c"
   var $37=_snprintf($15, 8, ((1064)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$36,HEAP32[(((tempVarArgs)+(8))>>2)]=100,tempVarArgs)); STACKTOP=tempVarArgs; //@line 97 "html/html_smartypants.c"
   var $38=HEAP32[(($14)>>2)]; //@line 98 "html/html_smartypants.c"
   var $39=(($38)|(0))==0; //@line 98 "html/html_smartypants.c"
   var $40=(($39)&(1)); //@line 98 "html/html_smartypants.c"
   HEAP32[(($14)>>2)]=$40; //@line 98 "html/html_smartypants.c"
   _bufputs($ob, $15); //@line 99 "html/html_smartypants.c"
   var $_0 = 1;label = 43; break; //@line 110 "html/html_smartypants.c"
  case 15: 
   var $42=(($size)|(0))==3; //@line 114 "html/html_smartypants.c"
   if ($42) { label = 19; break; } else { label = 16; break; } //@line 114 "html/html_smartypants.c"
  case 16: 
   var $44=(($text+2)|0); //@line 115 "html/html_smartypants.c"
   var $45=HEAP8[($44)]; //@line 115 "html/html_smartypants.c"
   var $46=(($45)&(255)); //@line 83 "html/html_smartypants.c"
   var $47=(($45 << 24) >> 24)==0; //@line 83 "html/html_smartypants.c"
   if ($47) { label = 19; break; } else { label = 17; break; } //@line 83 "html/html_smartypants.c"
  case 17: 
   var $49=_isspace($46); //@line 83 "html/html_smartypants.c"
   var $50=(($49)|(0))==0; //@line 83 "html/html_smartypants.c"
   if ($50) { label = 18; break; } else { label = 19; break; } //@line 83 "html/html_smartypants.c"
  case 18: 
   var $51=_ispunct($46); //@line 83 "html/html_smartypants.c"
   var $52=(($51)|(0))==0; //@line 83 "html/html_smartypants.c"
   if ($52) { label = 20; break; } else { label = 19; break; } //@line 115 "html/html_smartypants.c"
  case 19: 
   _bufput($ob, ((2328)|0), 7); //@line 116 "html/html_smartypants.c"
   var $_0 = 0;label = 43; break; //@line 117 "html/html_smartypants.c"
  case 20: 
   var $54=(($size)>>>(0)) > 2; //@line 120 "html/html_smartypants.c"
   if ($54) { label = 21; break; } else { label = 30; break; } //@line 120 "html/html_smartypants.c"
  case 21: 
   var $56=(($text+2)|0); //@line 121 "html/html_smartypants.c"
   var $57=HEAP8[($56)]; //@line 121 "html/html_smartypants.c"
   var $58=(($57)&(255)); //@line 121 "html/html_smartypants.c"
   var $59=_tolower($58); //@line 121 "html/html_smartypants.c"
   if ((($7)|(0))==114) {
    label = 22; break;
   }
   else if ((($7)|(0))==108) {
    label = 23; break;
   }
   else if ((($7)|(0))==118) {
    label = 24; break;
   }
   else {
   label = 30; break;
   }
  case 22: 
   var $61=$59 & 255; //@line 123 "html/html_smartypants.c"
   var $62=(($61)|(0))==101; //@line 123 "html/html_smartypants.c"
   if ($62) { label = 25; break; } else { label = 30; break; } //@line 123 "html/html_smartypants.c"
  case 23: 
   var $64=$59 & 255; //@line 123 "html/html_smartypants.c"
   var $65=(($64)|(0))==108; //@line 123 "html/html_smartypants.c"
   if ($65) { label = 25; break; } else { label = 30; break; } //@line 123 "html/html_smartypants.c"
  case 24: 
   var $67=$59 & 255; //@line 123 "html/html_smartypants.c"
   var $68=(($67)|(0))==101; //@line 123 "html/html_smartypants.c"
   if ($68) { label = 25; break; } else { label = 30; break; } //@line 123 "html/html_smartypants.c"
  case 25: 
   var $70=(($size)|(0))==4; //@line 123 "html/html_smartypants.c"
   if ($70) { label = 29; break; } else { label = 26; break; } //@line 123 "html/html_smartypants.c"
  case 26: 
   var $72=(($text+3)|0); //@line 126 "html/html_smartypants.c"
   var $73=HEAP8[($72)]; //@line 126 "html/html_smartypants.c"
   var $74=(($73)&(255)); //@line 83 "html/html_smartypants.c"
   var $75=(($73 << 24) >> 24)==0; //@line 83 "html/html_smartypants.c"
   if ($75) { label = 29; break; } else { label = 27; break; } //@line 83 "html/html_smartypants.c"
  case 27: 
   var $77=_isspace($74); //@line 83 "html/html_smartypants.c"
   var $78=(($77)|(0))==0; //@line 83 "html/html_smartypants.c"
   if ($78) { label = 28; break; } else { label = 29; break; } //@line 83 "html/html_smartypants.c"
  case 28: 
   var $79=_ispunct($74); //@line 83 "html/html_smartypants.c"
   var $80=(($79)|(0))==0; //@line 83 "html/html_smartypants.c"
   if ($80) { label = 30; break; } else { label = 29; break; } //@line 126 "html/html_smartypants.c"
  case 29: 
   _bufput($ob, ((2328)|0), 7); //@line 127 "html/html_smartypants.c"
   var $_0 = 0;label = 43; break; //@line 128 "html/html_smartypants.c"
  case 30: 
   var $81=(($size)|(0))==0; //@line 133 "html/html_smartypants.c"
   if ($81) { var $_off0 = 0;label = 32; break; } else { label = 31; break; } //@line 133 "html/html_smartypants.c"
  case 31: 
   var $83=(($text+1)|0); //@line 133 "html/html_smartypants.c"
   var $84=HEAP8[($83)]; //@line 133 "html/html_smartypants.c"
   var $_off0 = $84;label = 32; break; //@line 133 "html/html_smartypants.c"
  case 32: 
   var $_off0;
   var $86=(($smrt)|0); //@line 133 "html/html_smartypants.c"
   var $87=(($ent_i)|0); //@line 87 "html/html_smartypants.c"
   var $88=HEAP32[(($86)>>2)]; //@line 91 "html/html_smartypants.c"
   var $89=(($88)|(0))==0; //@line 91 "html/html_smartypants.c"
   if ($89) { label = 37; break; } else { label = 33; break; } //@line 91 "html/html_smartypants.c"
  case 33: 
   var $91=(($_off0)&(255)); //@line 83 "html/html_smartypants.c"
   var $92=(($_off0 << 24) >> 24)==0; //@line 83 "html/html_smartypants.c"
   if ($92) { label = 36; break; } else { label = 34; break; } //@line 83 "html/html_smartypants.c"
  case 34: 
   var $94=_isspace($91); //@line 83 "html/html_smartypants.c"
   var $95=(($94)|(0))==0; //@line 83 "html/html_smartypants.c"
   if ($95) { label = 35; break; } else { label = 36; break; } //@line 83 "html/html_smartypants.c"
  case 35: 
   var $96=_ispunct($91); //@line 83 "html/html_smartypants.c"
   var $97=(($96)|(0))==0; //@line 83 "html/html_smartypants.c"
   if ($97) { label = 42; break; } else { label = 36; break; } //@line 91 "html/html_smartypants.c"
  case 36: 
   var $_pr_i36=HEAP32[(($86)>>2)]; //@line 94 "html/html_smartypants.c"
   var $98=(($_pr_i36)|(0))==0; //@line 94 "html/html_smartypants.c"
   if ($98) { label = 37; break; } else { var $106 = $_pr_i36;label = 41; break; } //@line 94 "html/html_smartypants.c"
  case 37: 
   var $99=(($previous_char)&(255)); //@line 83 "html/html_smartypants.c"
   var $100=(($previous_char << 24) >> 24)==0; //@line 83 "html/html_smartypants.c"
   if ($100) { label = 40; break; } else { label = 38; break; } //@line 83 "html/html_smartypants.c"
  case 38: 
   var $102=_isspace($99); //@line 83 "html/html_smartypants.c"
   var $103=(($102)|(0))==0; //@line 83 "html/html_smartypants.c"
   if ($103) { label = 39; break; } else { label = 40; break; } //@line 83 "html/html_smartypants.c"
  case 39: 
   var $104=_ispunct($99); //@line 83 "html/html_smartypants.c"
   var $105=(($104)|(0))==0; //@line 83 "html/html_smartypants.c"
   if ($105) { label = 42; break; } else { label = 40; break; } //@line 94 "html/html_smartypants.c"
  case 40: 
   var $_pre_i38=HEAP32[(($86)>>2)]; //@line 97 "html/html_smartypants.c"
   var $106 = $_pre_i38;label = 41; break; //@line 94 "html/html_smartypants.c"
  case 41: 
   var $106;
   var $107=(($106)|(0))!=0; //@line 97 "html/html_smartypants.c"
   var $108=$107 ? 114 : 108; //@line 97 "html/html_smartypants.c"
   var $109=_snprintf($87, 8, ((1064)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$108,HEAP32[(((tempVarArgs)+(8))>>2)]=115,tempVarArgs)); STACKTOP=tempVarArgs; //@line 97 "html/html_smartypants.c"
   var $110=HEAP32[(($86)>>2)]; //@line 98 "html/html_smartypants.c"
   var $111=(($110)|(0))==0; //@line 98 "html/html_smartypants.c"
   var $112=(($111)&(1)); //@line 98 "html/html_smartypants.c"
   HEAP32[(($86)>>2)]=$112; //@line 98 "html/html_smartypants.c"
   _bufputs($ob, $87); //@line 99 "html/html_smartypants.c"
   var $_0 = 0;label = 43; break; //@line 133 "html/html_smartypants.c"
  case 42: 
   var $114=HEAP8[($text)]; //@line 136 "html/html_smartypants.c"
   var $115=(($114)&(255)); //@line 136 "html/html_smartypants.c"
   _bufputc($ob, $115); //@line 136 "html/html_smartypants.c"
   var $_0 = 0;label = 43; break; //@line 137 "html/html_smartypants.c"
  case 43: 
   var $_0;
   STACKTOP = sp;
   return $_0; //@line 138 "html/html_smartypants.c"
  default: assert(0, "bad label: " + label);
 }
}
function _smartypants_cb__dquote($ob, $smrt, $previous_char, $text, $size) {
 var label = 0;
 var tempVarArgs = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $ent_i=sp;
   var $1=(($size)|(0))==0; //@line 262 "html/html_smartypants.c"
   if ($1) { var $_off0 = 0;label = 3; break; } else { label = 2; break; } //@line 262 "html/html_smartypants.c"
  case 2: 
   var $3=(($text+1)|0); //@line 262 "html/html_smartypants.c"
   var $4=HEAP8[($3)]; //@line 262 "html/html_smartypants.c"
   var $_off0 = $4;label = 3; break; //@line 262 "html/html_smartypants.c"
  case 3: 
   var $_off0;
   var $6=(($smrt+4)|0); //@line 262 "html/html_smartypants.c"
   var $7=(($ent_i)|0); //@line 87 "html/html_smartypants.c"
   var $8=HEAP32[(($6)>>2)]; //@line 91 "html/html_smartypants.c"
   var $9=(($8)|(0))==0; //@line 91 "html/html_smartypants.c"
   if ($9) { label = 8; break; } else { label = 4; break; } //@line 91 "html/html_smartypants.c"
  case 4: 
   var $11=(($_off0)&(255)); //@line 83 "html/html_smartypants.c"
   var $12=(($_off0 << 24) >> 24)==0; //@line 83 "html/html_smartypants.c"
   if ($12) { label = 7; break; } else { label = 5; break; } //@line 83 "html/html_smartypants.c"
  case 5: 
   var $14=_isspace($11); //@line 83 "html/html_smartypants.c"
   var $15=(($14)|(0))==0; //@line 83 "html/html_smartypants.c"
   if ($15) { label = 6; break; } else { label = 7; break; } //@line 83 "html/html_smartypants.c"
  case 6: 
   var $16=_ispunct($11); //@line 83 "html/html_smartypants.c"
   var $17=(($16)|(0))==0; //@line 83 "html/html_smartypants.c"
   if ($17) { label = 13; break; } else { label = 7; break; } //@line 91 "html/html_smartypants.c"
  case 7: 
   var $_pr_i=HEAP32[(($6)>>2)]; //@line 94 "html/html_smartypants.c"
   var $18=(($_pr_i)|(0))==0; //@line 94 "html/html_smartypants.c"
   if ($18) { label = 8; break; } else { var $26 = $_pr_i;label = 12; break; } //@line 94 "html/html_smartypants.c"
  case 8: 
   var $19=(($previous_char)&(255)); //@line 83 "html/html_smartypants.c"
   var $20=(($previous_char << 24) >> 24)==0; //@line 83 "html/html_smartypants.c"
   if ($20) { label = 11; break; } else { label = 9; break; } //@line 83 "html/html_smartypants.c"
  case 9: 
   var $22=_isspace($19); //@line 83 "html/html_smartypants.c"
   var $23=(($22)|(0))==0; //@line 83 "html/html_smartypants.c"
   if ($23) { label = 10; break; } else { label = 11; break; } //@line 83 "html/html_smartypants.c"
  case 10: 
   var $24=_ispunct($19); //@line 83 "html/html_smartypants.c"
   var $25=(($24)|(0))==0; //@line 83 "html/html_smartypants.c"
   if ($25) { label = 13; break; } else { label = 11; break; } //@line 94 "html/html_smartypants.c"
  case 11: 
   var $_pre_i=HEAP32[(($6)>>2)]; //@line 97 "html/html_smartypants.c"
   var $26 = $_pre_i;label = 12; break; //@line 94 "html/html_smartypants.c"
  case 12: 
   var $26;
   var $27=(($26)|(0))!=0; //@line 97 "html/html_smartypants.c"
   var $28=$27 ? 114 : 108; //@line 97 "html/html_smartypants.c"
   var $29=_snprintf($7, 8, ((1064)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$28,HEAP32[(((tempVarArgs)+(8))>>2)]=100,tempVarArgs)); STACKTOP=tempVarArgs; //@line 97 "html/html_smartypants.c"
   var $30=HEAP32[(($6)>>2)]; //@line 98 "html/html_smartypants.c"
   var $31=(($30)|(0))==0; //@line 98 "html/html_smartypants.c"
   var $32=(($31)&(1)); //@line 98 "html/html_smartypants.c"
   HEAP32[(($6)>>2)]=$32; //@line 98 "html/html_smartypants.c"
   _bufputs($ob, $7); //@line 99 "html/html_smartypants.c"
   label = 14; break; //@line 262 "html/html_smartypants.c"
  case 13: 
   _bufput($ob, ((2408)|0), 6); //@line 263 "html/html_smartypants.c"
   label = 14; break; //@line 263 "html/html_smartypants.c"
  case 14: 
   STACKTOP = sp;
   return 0; //@line 265 "html/html_smartypants.c"
  default: assert(0, "bad label: " + label);
 }
}
function _smartypants_cb__amp($ob, $smrt, $previous_char, $text, $size) {
 var label = 0;
 var tempVarArgs = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $ent_i=sp;
   var $1=(($size)>>>(0)) > 5; //@line 187 "html/html_smartypants.c"
   if ($1) { label = 2; break; } else { label = 15; break; } //@line 187 "html/html_smartypants.c"
  case 2: 
   var $3=_memcmp($text, ((2408)|0), 6); //@line 187 "html/html_smartypants.c"
   var $4=(($3)|(0))==0; //@line 187 "html/html_smartypants.c"
   if ($4) { label = 3; break; } else { label = 15; break; } //@line 187 "html/html_smartypants.c"
  case 3: 
   var $6=(($size)>>>(0)) > 6; //@line 188 "html/html_smartypants.c"
   if ($6) { label = 4; break; } else { var $_off0 = 0;label = 5; break; } //@line 188 "html/html_smartypants.c"
  case 4: 
   var $8=(($text+6)|0); //@line 188 "html/html_smartypants.c"
   var $9=HEAP8[($8)]; //@line 188 "html/html_smartypants.c"
   var $_off0 = $9;label = 5; break; //@line 188 "html/html_smartypants.c"
  case 5: 
   var $_off0;
   var $11=(($smrt+4)|0); //@line 188 "html/html_smartypants.c"
   var $12=(($ent_i)|0); //@line 87 "html/html_smartypants.c"
   var $13=HEAP32[(($11)>>2)]; //@line 91 "html/html_smartypants.c"
   var $14=(($13)|(0))==0; //@line 91 "html/html_smartypants.c"
   if ($14) { label = 10; break; } else { label = 6; break; } //@line 91 "html/html_smartypants.c"
  case 6: 
   var $16=(($_off0)&(255)); //@line 83 "html/html_smartypants.c"
   var $17=(($_off0 << 24) >> 24)==0; //@line 83 "html/html_smartypants.c"
   if ($17) { label = 9; break; } else { label = 7; break; } //@line 83 "html/html_smartypants.c"
  case 7: 
   var $19=_isspace($16); //@line 83 "html/html_smartypants.c"
   var $20=(($19)|(0))==0; //@line 83 "html/html_smartypants.c"
   if ($20) { label = 8; break; } else { label = 9; break; } //@line 83 "html/html_smartypants.c"
  case 8: 
   var $21=_ispunct($16); //@line 83 "html/html_smartypants.c"
   var $22=(($21)|(0))==0; //@line 83 "html/html_smartypants.c"
   if ($22) { label = 15; break; } else { label = 9; break; } //@line 91 "html/html_smartypants.c"
  case 9: 
   var $_pr_i=HEAP32[(($11)>>2)]; //@line 94 "html/html_smartypants.c"
   var $23=(($_pr_i)|(0))==0; //@line 94 "html/html_smartypants.c"
   if ($23) { label = 10; break; } else { var $31 = $_pr_i;label = 14; break; } //@line 94 "html/html_smartypants.c"
  case 10: 
   var $24=(($previous_char)&(255)); //@line 83 "html/html_smartypants.c"
   var $25=(($previous_char << 24) >> 24)==0; //@line 83 "html/html_smartypants.c"
   if ($25) { label = 13; break; } else { label = 11; break; } //@line 83 "html/html_smartypants.c"
  case 11: 
   var $27=_isspace($24); //@line 83 "html/html_smartypants.c"
   var $28=(($27)|(0))==0; //@line 83 "html/html_smartypants.c"
   if ($28) { label = 12; break; } else { label = 13; break; } //@line 83 "html/html_smartypants.c"
  case 12: 
   var $29=_ispunct($24); //@line 83 "html/html_smartypants.c"
   var $30=(($29)|(0))==0; //@line 83 "html/html_smartypants.c"
   if ($30) { label = 15; break; } else { label = 13; break; } //@line 94 "html/html_smartypants.c"
  case 13: 
   var $_pre_i=HEAP32[(($11)>>2)]; //@line 97 "html/html_smartypants.c"
   var $31 = $_pre_i;label = 14; break; //@line 94 "html/html_smartypants.c"
  case 14: 
   var $31;
   var $32=(($31)|(0))!=0; //@line 97 "html/html_smartypants.c"
   var $33=$32 ? 114 : 108; //@line 97 "html/html_smartypants.c"
   var $34=_snprintf($12, 8, ((1064)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$33,HEAP32[(((tempVarArgs)+(8))>>2)]=100,tempVarArgs)); STACKTOP=tempVarArgs; //@line 97 "html/html_smartypants.c"
   var $35=HEAP32[(($11)>>2)]; //@line 98 "html/html_smartypants.c"
   var $36=(($35)|(0))==0; //@line 98 "html/html_smartypants.c"
   var $37=(($36)&(1)); //@line 98 "html/html_smartypants.c"
   HEAP32[(($11)>>2)]=$37; //@line 98 "html/html_smartypants.c"
   _bufputs($ob, $12); //@line 99 "html/html_smartypants.c"
   var $_0 = 5;label = 18; break; //@line 188 "html/html_smartypants.c"
  case 15: 
   var $38=(($size)>>>(0)) > 3; //@line 192 "html/html_smartypants.c"
   if ($38) { label = 16; break; } else { label = 17; break; } //@line 192 "html/html_smartypants.c"
  case 16: 
   var $40=_memcmp($text, ((2360)|0), 4); //@line 192 "html/html_smartypants.c"
   var $41=(($40)|(0))==0; //@line 192 "html/html_smartypants.c"
   if ($41) { var $_0 = 3;label = 18; break; } else { label = 17; break; } //@line 192 "html/html_smartypants.c"
  case 17: 
   _bufputc($ob, 38); //@line 195 "html/html_smartypants.c"
   var $_0 = 0;label = 18; break; //@line 196 "html/html_smartypants.c"
  case 18: 
   var $_0;
   STACKTOP = sp;
   return $_0; //@line 197 "html/html_smartypants.c"
  default: assert(0, "bad label: " + label);
 }
}
function _smartypants_cb__period($ob, $smrt, $previous_char, $text, $size) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($size)>>>(0)) > 2; //@line 202 "html/html_smartypants.c"
   if ($1) { label = 2; break; } else { label = 10; break; } //@line 202 "html/html_smartypants.c"
  case 2: 
   var $3=(($text+1)|0); //@line 202 "html/html_smartypants.c"
   var $4=HEAP8[($3)]; //@line 202 "html/html_smartypants.c"
   var $5=(($4 << 24) >> 24)==46; //@line 202 "html/html_smartypants.c"
   if ($5) { label = 3; break; } else { label = 5; break; } //@line 202 "html/html_smartypants.c"
  case 3: 
   var $7=(($text+2)|0); //@line 202 "html/html_smartypants.c"
   var $8=HEAP8[($7)]; //@line 202 "html/html_smartypants.c"
   var $9=(($8 << 24) >> 24)==46; //@line 202 "html/html_smartypants.c"
   if ($9) { label = 4; break; } else { label = 5; break; } //@line 202 "html/html_smartypants.c"
  case 4: 
   _bufput($ob, ((2440)|0), 8); //@line 203 "html/html_smartypants.c"
   var $_0 = 2;label = 11; break; //@line 204 "html/html_smartypants.c"
  case 5: 
   var $12=(($size)>>>(0)) > 4; //@line 207 "html/html_smartypants.c"
   var $13=(($4 << 24) >> 24)==32; //@line 207 "html/html_smartypants.c"
   var $or_cond=$12 & $13; //@line 207 "html/html_smartypants.c"
   if ($or_cond) { label = 6; break; } else { label = 10; break; } //@line 207 "html/html_smartypants.c"
  case 6: 
   var $15=(($text+2)|0); //@line 207 "html/html_smartypants.c"
   var $16=HEAP8[($15)]; //@line 207 "html/html_smartypants.c"
   var $17=(($16 << 24) >> 24)==46; //@line 207 "html/html_smartypants.c"
   if ($17) { label = 7; break; } else { label = 10; break; } //@line 207 "html/html_smartypants.c"
  case 7: 
   var $19=(($text+3)|0); //@line 207 "html/html_smartypants.c"
   var $20=HEAP8[($19)]; //@line 207 "html/html_smartypants.c"
   var $21=(($20 << 24) >> 24)==32; //@line 207 "html/html_smartypants.c"
   if ($21) { label = 8; break; } else { label = 10; break; } //@line 207 "html/html_smartypants.c"
  case 8: 
   var $23=(($text+4)|0); //@line 207 "html/html_smartypants.c"
   var $24=HEAP8[($23)]; //@line 207 "html/html_smartypants.c"
   var $25=(($24 << 24) >> 24)==46; //@line 207 "html/html_smartypants.c"
   if ($25) { label = 9; break; } else { label = 10; break; } //@line 207 "html/html_smartypants.c"
  case 9: 
   _bufput($ob, ((2440)|0), 8); //@line 208 "html/html_smartypants.c"
   var $_0 = 4;label = 11; break; //@line 209 "html/html_smartypants.c"
  case 10: 
   var $27=HEAP8[($text)]; //@line 212 "html/html_smartypants.c"
   var $28=(($27)&(255)); //@line 212 "html/html_smartypants.c"
   _bufputc($ob, $28); //@line 212 "html/html_smartypants.c"
   var $_0 = 0;label = 11; break; //@line 213 "html/html_smartypants.c"
  case 11: 
   var $_0;
   return $_0; //@line 214 "html/html_smartypants.c"
  default: assert(0, "bad label: " + label);
 }
}
function _smartypants_cb__number($ob, $smrt, $previous_char, $text, $size) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($previous_char)&(255)); //@line 83 "html/html_smartypants.c"
   var $2=(($previous_char << 24) >> 24)==0; //@line 83 "html/html_smartypants.c"
   if ($2) { var $9 = 1;label = 4; break; } else { label = 2; break; } //@line 83 "html/html_smartypants.c"
  case 2: 
   var $4=_isspace($1); //@line 83 "html/html_smartypants.c"
   var $5=(($4)|(0))==0; //@line 83 "html/html_smartypants.c"
   if ($5) { label = 3; break; } else { var $9 = 1;label = 4; break; } //@line 83 "html/html_smartypants.c"
  case 3: 
   var $7=_ispunct($1); //@line 83 "html/html_smartypants.c"
   var $8=(($7)|(0))!=0; //@line 83 "html/html_smartypants.c"
   var $9 = $8;label = 4; break; //@line 83 "html/html_smartypants.c"
  case 4: 
   var $9;
   var $10=(($size)>>>(0)) > 2; //@line 230 "html/html_smartypants.c"
   var $or_cond=$9 & $10; //@line 230 "html/html_smartypants.c"
   if ($or_cond) { label = 5; break; } else { label = 37; break; } //@line 230 "html/html_smartypants.c"
  case 5: 
   var $12=HEAP8[($text)]; //@line 231 "html/html_smartypants.c"
   var $13=(($12 << 24) >> 24)==49; //@line 231 "html/html_smartypants.c"
   if ($13) { label = 6; break; } else { label = 24; break; } //@line 231 "html/html_smartypants.c"
  case 6: 
   var $15=(($text+1)|0); //@line 231 "html/html_smartypants.c"
   var $16=HEAP8[($15)]; //@line 231 "html/html_smartypants.c"
   var $17=(($16 << 24) >> 24)==47; //@line 231 "html/html_smartypants.c"
   if ($17) { label = 7; break; } else { label = 24; break; } //@line 231 "html/html_smartypants.c"
  case 7: 
   var $19=(($text+2)|0); //@line 231 "html/html_smartypants.c"
   var $20=HEAP8[($19)]; //@line 231 "html/html_smartypants.c"
   var $21=(($20 << 24) >> 24)==50; //@line 231 "html/html_smartypants.c"
   if ($21) { label = 8; break; } else { label = 14; break; } //@line 231 "html/html_smartypants.c"
  case 8: 
   var $23=(($size)|(0))==3; //@line 232 "html/html_smartypants.c"
   if ($23) { label = 12; break; } else { label = 9; break; } //@line 232 "html/html_smartypants.c"
  case 9: 
   var $25=(($text+3)|0); //@line 232 "html/html_smartypants.c"
   var $26=HEAP8[($25)]; //@line 232 "html/html_smartypants.c"
   var $27=(($26)&(255)); //@line 83 "html/html_smartypants.c"
   var $28=(($26 << 24) >> 24)==0; //@line 83 "html/html_smartypants.c"
   if ($28) { label = 12; break; } else { label = 10; break; } //@line 83 "html/html_smartypants.c"
  case 10: 
   var $30=_isspace($27); //@line 83 "html/html_smartypants.c"
   var $31=(($30)|(0))==0; //@line 83 "html/html_smartypants.c"
   if ($31) { label = 11; break; } else { label = 12; break; } //@line 83 "html/html_smartypants.c"
  case 11: 
   var $32=_ispunct($27); //@line 83 "html/html_smartypants.c"
   var $33=(($32)|(0))==0; //@line 83 "html/html_smartypants.c"
   if ($33) { label = 13; break; } else { label = 12; break; } //@line 232 "html/html_smartypants.c"
  case 12: 
   _bufput($ob, ((1080)|0), 8); //@line 233 "html/html_smartypants.c"
   var $_0 = 2;label = 38; break; //@line 234 "html/html_smartypants.c"
  case 13: 
   var $_pr_pre=HEAP8[($text)]; //@line 238 "html/html_smartypants.c"
   var $35=(($_pr_pre << 24) >> 24)==49; //@line 238 "html/html_smartypants.c"
   if ($35) { label = 14; break; } else { var $67 = $_pr_pre;label = 25; break; } //@line 238 "html/html_smartypants.c"
  case 14: 
   var $_pr=HEAP8[($15)]; //@line 238 "html/html_smartypants.c"
   var $36=(($_pr << 24) >> 24)==47; //@line 238 "html/html_smartypants.c"
   if ($36) { label = 15; break; } else { label = 24; break; } //@line 238 "html/html_smartypants.c"
  case 15: 
   var $38=(($text+2)|0); //@line 238 "html/html_smartypants.c"
   var $39=HEAP8[($38)]; //@line 238 "html/html_smartypants.c"
   var $40=(($39 << 24) >> 24)==52; //@line 238 "html/html_smartypants.c"
   if ($40) { label = 16; break; } else { label = 24; break; } //@line 238 "html/html_smartypants.c"
  case 16: 
   var $42=(($size)|(0))==3; //@line 239 "html/html_smartypants.c"
   if ($42) { label = 23; break; } else { label = 17; break; } //@line 239 "html/html_smartypants.c"
  case 17: 
   var $44=(($text+3)|0); //@line 239 "html/html_smartypants.c"
   var $45=HEAP8[($44)]; //@line 239 "html/html_smartypants.c"
   var $46=(($45)&(255)); //@line 83 "html/html_smartypants.c"
   var $47=(($45 << 24) >> 24)==0; //@line 83 "html/html_smartypants.c"
   if ($47) { label = 23; break; } else { label = 18; break; } //@line 83 "html/html_smartypants.c"
  case 18: 
   var $49=_isspace($46); //@line 83 "html/html_smartypants.c"
   var $50=(($49)|(0))==0; //@line 83 "html/html_smartypants.c"
   if ($50) { label = 19; break; } else { label = 23; break; } //@line 83 "html/html_smartypants.c"
  case 19: 
   var $51=_ispunct($46); //@line 83 "html/html_smartypants.c"
   var $52=(($51)|(0))==0; //@line 83 "html/html_smartypants.c"
   if ($52) { label = 20; break; } else { label = 23; break; } //@line 239 "html/html_smartypants.c"
  case 20: 
   var $54=(($size)>>>(0)) > 4; //@line 239 "html/html_smartypants.c"
   if ($54) { label = 21; break; } else { label = 24; break; } //@line 239 "html/html_smartypants.c"
  case 21: 
   var $56=HEAP8[($44)]; //@line 240 "html/html_smartypants.c"
   var $57=(($56)&(255)); //@line 240 "html/html_smartypants.c"
   var $58=_tolower($57); //@line 240 "html/html_smartypants.c"
   var $59=(($58)|(0))==116; //@line 240 "html/html_smartypants.c"
   if ($59) { label = 22; break; } else { label = 24; break; } //@line 240 "html/html_smartypants.c"
  case 22: 
   var $61=(($text+4)|0); //@line 240 "html/html_smartypants.c"
   var $62=HEAP8[($61)]; //@line 240 "html/html_smartypants.c"
   var $63=(($62)&(255)); //@line 240 "html/html_smartypants.c"
   var $64=_tolower($63); //@line 240 "html/html_smartypants.c"
   var $65=(($64)|(0))==104; //@line 240 "html/html_smartypants.c"
   if ($65) { label = 23; break; } else { label = 24; break; } //@line 240 "html/html_smartypants.c"
  case 23: 
   _bufput($ob, ((2528)|0), 8); //@line 241 "html/html_smartypants.c"
   var $_0 = 2;label = 38; break; //@line 242 "html/html_smartypants.c"
  case 24: 
   var $_pr36=HEAP8[($text)]; //@line 246 "html/html_smartypants.c"
   var $67 = $_pr36;label = 25; break;
  case 25: 
   var $67; //@line 246 "html/html_smartypants.c"
   var $68=(($67 << 24) >> 24)==51; //@line 246 "html/html_smartypants.c"
   if ($68) { label = 26; break; } else { label = 37; break; } //@line 246 "html/html_smartypants.c"
  case 26: 
   var $70=(($text+1)|0); //@line 246 "html/html_smartypants.c"
   var $71=HEAP8[($70)]; //@line 246 "html/html_smartypants.c"
   var $72=(($71 << 24) >> 24)==47; //@line 246 "html/html_smartypants.c"
   if ($72) { label = 27; break; } else { label = 37; break; } //@line 246 "html/html_smartypants.c"
  case 27: 
   var $74=(($text+2)|0); //@line 246 "html/html_smartypants.c"
   var $75=HEAP8[($74)]; //@line 246 "html/html_smartypants.c"
   var $76=(($75 << 24) >> 24)==52; //@line 246 "html/html_smartypants.c"
   if ($76) { label = 28; break; } else { label = 37; break; } //@line 246 "html/html_smartypants.c"
  case 28: 
   var $78=(($size)|(0))==3; //@line 247 "html/html_smartypants.c"
   if ($78) { label = 36; break; } else { label = 29; break; } //@line 247 "html/html_smartypants.c"
  case 29: 
   var $80=(($text+3)|0); //@line 247 "html/html_smartypants.c"
   var $81=HEAP8[($80)]; //@line 247 "html/html_smartypants.c"
   var $82=(($81)&(255)); //@line 83 "html/html_smartypants.c"
   var $83=(($81 << 24) >> 24)==0; //@line 83 "html/html_smartypants.c"
   if ($83) { label = 36; break; } else { label = 30; break; } //@line 83 "html/html_smartypants.c"
  case 30: 
   var $85=_isspace($82); //@line 83 "html/html_smartypants.c"
   var $86=(($85)|(0))==0; //@line 83 "html/html_smartypants.c"
   if ($86) { label = 31; break; } else { label = 36; break; } //@line 83 "html/html_smartypants.c"
  case 31: 
   var $87=_ispunct($82); //@line 83 "html/html_smartypants.c"
   var $88=(($87)|(0))==0; //@line 83 "html/html_smartypants.c"
   if ($88) { label = 32; break; } else { label = 36; break; } //@line 247 "html/html_smartypants.c"
  case 32: 
   var $90=(($size)>>>(0)) > 5; //@line 247 "html/html_smartypants.c"
   if ($90) { label = 33; break; } else { label = 37; break; } //@line 247 "html/html_smartypants.c"
  case 33: 
   var $92=HEAP8[($80)]; //@line 248 "html/html_smartypants.c"
   var $93=(($92)&(255)); //@line 248 "html/html_smartypants.c"
   var $94=_tolower($93); //@line 248 "html/html_smartypants.c"
   var $95=(($94)|(0))==116; //@line 248 "html/html_smartypants.c"
   if ($95) { label = 34; break; } else { label = 37; break; } //@line 248 "html/html_smartypants.c"
  case 34: 
   var $97=(($text+4)|0); //@line 248 "html/html_smartypants.c"
   var $98=HEAP8[($97)]; //@line 248 "html/html_smartypants.c"
   var $99=(($98)&(255)); //@line 248 "html/html_smartypants.c"
   var $100=_tolower($99); //@line 248 "html/html_smartypants.c"
   var $101=(($100)|(0))==104; //@line 248 "html/html_smartypants.c"
   if ($101) { label = 35; break; } else { label = 37; break; } //@line 248 "html/html_smartypants.c"
  case 35: 
   var $103=(($text+5)|0); //@line 248 "html/html_smartypants.c"
   var $104=HEAP8[($103)]; //@line 248 "html/html_smartypants.c"
   var $105=(($104)&(255)); //@line 248 "html/html_smartypants.c"
   var $106=_tolower($105); //@line 248 "html/html_smartypants.c"
   var $107=(($106)|(0))==115; //@line 248 "html/html_smartypants.c"
   if ($107) { label = 36; break; } else { label = 37; break; } //@line 248 "html/html_smartypants.c"
  case 36: 
   _bufput($ob, ((2496)|0), 8); //@line 249 "html/html_smartypants.c"
   var $_0 = 2;label = 38; break; //@line 250 "html/html_smartypants.c"
  case 37: 
   var $108=HEAP8[($text)]; //@line 255 "html/html_smartypants.c"
   var $109=(($108)&(255)); //@line 255 "html/html_smartypants.c"
   _bufputc($ob, $109); //@line 255 "html/html_smartypants.c"
   var $_0 = 0;label = 38; break; //@line 256 "html/html_smartypants.c"
  case 38: 
   var $_0;
   return $_0; //@line 257 "html/html_smartypants.c"
  default: assert(0, "bad label: " + label);
 }
}
function _smartypants_cb__ltag($ob, $smrt, $previous_char, $text, $size) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $i_0 = 0;label = 2; break; //@line 278 "html/html_smartypants.c"
  case 2: 
   var $i_0;
   var $2=(($i_0)>>>(0)) < (($size)>>>(0)); //@line 278 "html/html_smartypants.c"
   if ($2) { label = 3; break; } else { var $tag_0 = 0;label = 4; break; } //@line 278 "html/html_smartypants.c"
  case 3: 
   var $4=(($text+$i_0)|0); //@line 278 "html/html_smartypants.c"
   var $5=HEAP8[($4)]; //@line 278 "html/html_smartypants.c"
   var $6=(($5 << 24) >> 24)==62; //@line 278 "html/html_smartypants.c"
   var $7=((($i_0)+(1))|0); //@line 279 "html/html_smartypants.c"
   if ($6) { var $tag_0 = 0;label = 4; break; } else { var $i_0 = $7;label = 2; break; }
  case 4: 
   var $tag_0;
   var $8=(($tag_0)>>>(0)) < 8; //@line 281 "html/html_smartypants.c"
   if ($8) { label = 5; break; } else { var $i_3 = $i_0;label = 13; break; } //@line 281 "html/html_smartypants.c"
  case 5: 
   var $10=((312+($tag_0<<2))|0); //@line 282 "html/html_smartypants.c"
   var $11=HEAP32[(($10)>>2)]; //@line 282 "html/html_smartypants.c"
   var $12=_sdhtml_is_tag($text, $size, $11); //@line 282 "html/html_smartypants.c"
   var $13=(($12)|(0))==1; //@line 282 "html/html_smartypants.c"
   var $14=((($tag_0)+(1))|0); //@line 281 "html/html_smartypants.c"
   if ($13) { var $i_1 = $i_0;label = 6; break; } else { var $tag_0 = $14;label = 4; break; } //@line 282 "html/html_smartypants.c"
  case 6: 
   var $i_1;
   var $15=(($i_1)>>>(0)) < (($size)>>>(0)); //@line 288 "html/html_smartypants.c"
   if ($15) { label = 7; break; } else { label = 9; break; } //@line 288 "html/html_smartypants.c"
  case 7: 
   var $17=(($text+$i_1)|0); //@line 288 "html/html_smartypants.c"
   var $18=HEAP8[($17)]; //@line 288 "html/html_smartypants.c"
   var $19=(($18 << 24) >> 24)==60; //@line 288 "html/html_smartypants.c"
   if ($19) { label = 9; break; } else { label = 8; break; }
  case 8: 
   var $i_1_be=((($i_1)+(1))|0); //@line 289 "html/html_smartypants.c"
   var $i_1 = $i_1_be;label = 6; break;
  case 9: 
   var $20=(($i_1)|(0))==(($size)|(0)); //@line 291 "html/html_smartypants.c"
   if ($20) { var $i_2 = $size;label = 11; break; } else { label = 10; break; } //@line 291 "html/html_smartypants.c"
  case 10: 
   var $22=(($text+$i_1)|0); //@line 294 "html/html_smartypants.c"
   var $23=((($size)-($i_1))|0); //@line 294 "html/html_smartypants.c"
   var $24=_sdhtml_is_tag($22, $23, $11); //@line 294 "html/html_smartypants.c"
   var $25=(($24)|(0))==2; //@line 294 "html/html_smartypants.c"
   if ($25) { var $i_2 = $i_1;label = 11; break; } else { label = 8; break; } //@line 294 "html/html_smartypants.c"
  case 11: 
   var $i_2;
   var $26=(($i_2)>>>(0)) < (($size)>>>(0)); //@line 300 "html/html_smartypants.c"
   if ($26) { label = 12; break; } else { var $i_3 = $i_2;label = 13; break; } //@line 300 "html/html_smartypants.c"
  case 12: 
   var $28=(($text+$i_2)|0); //@line 300 "html/html_smartypants.c"
   var $29=HEAP8[($28)]; //@line 300 "html/html_smartypants.c"
   var $30=(($29 << 24) >> 24)==62; //@line 300 "html/html_smartypants.c"
   var $31=((($i_2)+(1))|0); //@line 301 "html/html_smartypants.c"
   if ($30) { var $i_3 = $i_2;label = 13; break; } else { var $i_2 = $31;label = 11; break; }
  case 13: 
   var $i_3;
   var $32=((($i_3)+(1))|0); //@line 304 "html/html_smartypants.c"
   _bufput($ob, $text, $32); //@line 304 "html/html_smartypants.c"
   return $i_3; //@line 305 "html/html_smartypants.c"
  default: assert(0, "bad label: " + label);
 }
}
function _smartypants_cb__backtick($ob, $smrt, $previous_char, $text, $size) {
 var label = 0;
 var tempVarArgs = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $ent_i=sp;
   var $1=(($size)>>>(0)) > 1; //@line 219 "html/html_smartypants.c"
   if ($1) { label = 2; break; } else { var $_0 = 0;label = 15; break; } //@line 219 "html/html_smartypants.c"
  case 2: 
   var $3=(($text+1)|0); //@line 219 "html/html_smartypants.c"
   var $4=HEAP8[($3)]; //@line 219 "html/html_smartypants.c"
   var $5=(($4 << 24) >> 24)==96; //@line 219 "html/html_smartypants.c"
   if ($5) { label = 3; break; } else { var $_0 = 0;label = 15; break; } //@line 219 "html/html_smartypants.c"
  case 3: 
   var $7=(($size)>>>(0)) > 2; //@line 220 "html/html_smartypants.c"
   if ($7) { label = 4; break; } else { var $_off0 = 0;label = 5; break; } //@line 220 "html/html_smartypants.c"
  case 4: 
   var $9=(($text+2)|0); //@line 220 "html/html_smartypants.c"
   var $10=HEAP8[($9)]; //@line 220 "html/html_smartypants.c"
   var $_off0 = $10;label = 5; break; //@line 220 "html/html_smartypants.c"
  case 5: 
   var $_off0;
   var $12=(($smrt+4)|0); //@line 220 "html/html_smartypants.c"
   var $13=(($ent_i)|0); //@line 87 "html/html_smartypants.c"
   var $14=HEAP32[(($12)>>2)]; //@line 91 "html/html_smartypants.c"
   var $15=(($14)|(0))==0; //@line 91 "html/html_smartypants.c"
   if ($15) { label = 10; break; } else { label = 6; break; } //@line 91 "html/html_smartypants.c"
  case 6: 
   var $17=(($_off0)&(255)); //@line 83 "html/html_smartypants.c"
   var $18=(($_off0 << 24) >> 24)==0; //@line 83 "html/html_smartypants.c"
   if ($18) { label = 9; break; } else { label = 7; break; } //@line 83 "html/html_smartypants.c"
  case 7: 
   var $20=_isspace($17); //@line 83 "html/html_smartypants.c"
   var $21=(($20)|(0))==0; //@line 83 "html/html_smartypants.c"
   if ($21) { label = 8; break; } else { label = 9; break; } //@line 83 "html/html_smartypants.c"
  case 8: 
   var $22=_ispunct($17); //@line 83 "html/html_smartypants.c"
   var $23=(($22)|(0))==0; //@line 83 "html/html_smartypants.c"
   if ($23) { var $_0 = 0;label = 15; break; } else { label = 9; break; } //@line 91 "html/html_smartypants.c"
  case 9: 
   var $_pr_i=HEAP32[(($12)>>2)]; //@line 94 "html/html_smartypants.c"
   var $24=(($_pr_i)|(0))==0; //@line 94 "html/html_smartypants.c"
   if ($24) { label = 10; break; } else { var $32 = $_pr_i;label = 14; break; } //@line 94 "html/html_smartypants.c"
  case 10: 
   var $25=(($previous_char)&(255)); //@line 83 "html/html_smartypants.c"
   var $26=(($previous_char << 24) >> 24)==0; //@line 83 "html/html_smartypants.c"
   if ($26) { label = 13; break; } else { label = 11; break; } //@line 83 "html/html_smartypants.c"
  case 11: 
   var $28=_isspace($25); //@line 83 "html/html_smartypants.c"
   var $29=(($28)|(0))==0; //@line 83 "html/html_smartypants.c"
   if ($29) { label = 12; break; } else { label = 13; break; } //@line 83 "html/html_smartypants.c"
  case 12: 
   var $30=_ispunct($25); //@line 83 "html/html_smartypants.c"
   var $31=(($30)|(0))==0; //@line 83 "html/html_smartypants.c"
   if ($31) { var $_0 = 0;label = 15; break; } else { label = 13; break; } //@line 94 "html/html_smartypants.c"
  case 13: 
   var $_pre_i=HEAP32[(($12)>>2)]; //@line 97 "html/html_smartypants.c"
   var $32 = $_pre_i;label = 14; break; //@line 94 "html/html_smartypants.c"
  case 14: 
   var $32;
   var $33=(($32)|(0))!=0; //@line 97 "html/html_smartypants.c"
   var $34=$33 ? 114 : 108; //@line 97 "html/html_smartypants.c"
   var $35=_snprintf($13, 8, ((1064)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$34,HEAP32[(((tempVarArgs)+(8))>>2)]=100,tempVarArgs)); STACKTOP=tempVarArgs; //@line 97 "html/html_smartypants.c"
   var $36=HEAP32[(($12)>>2)]; //@line 98 "html/html_smartypants.c"
   var $37=(($36)|(0))==0; //@line 98 "html/html_smartypants.c"
   var $38=(($37)&(1)); //@line 98 "html/html_smartypants.c"
   HEAP32[(($12)>>2)]=$38; //@line 98 "html/html_smartypants.c"
   _bufputs($ob, $13); //@line 99 "html/html_smartypants.c"
   var $_0 = 1;label = 15; break; //@line 220 "html/html_smartypants.c"
  case 15: 
   var $_0;
   STACKTOP = sp;
   return $_0; //@line 225 "html/html_smartypants.c"
  default: assert(0, "bad label: " + label);
 }
}
function _smartypants_cb__escape($ob, $smrt, $previous_char, $text, $size) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($size)>>>(0)) < 2; //@line 311 "html/html_smartypants.c"
   if ($1) { var $_0 = 0;label = 5; break; } else { label = 2; break; } //@line 311 "html/html_smartypants.c"
  case 2: 
   var $3=(($text+1)|0); //@line 314 "html/html_smartypants.c"
   var $4=HEAP8[($3)]; //@line 314 "html/html_smartypants.c"
   var $5=(($4)&(255)); //@line 314 "html/html_smartypants.c"
   switch((($5)|(0))) {
   case 92: case 34: case 39: case 46: case 45: case 96:{
    label = 3; break;
   }
   default: {
   label = 4; break;
   }
   } break; 
  case 3: 
   _bufputc($ob, $5); //@line 321 "html/html_smartypants.c"
   var $_0 = 1;label = 5; break; //@line 322 "html/html_smartypants.c"
  case 4: 
   _bufputc($ob, 92); //@line 325 "html/html_smartypants.c"
   var $_0 = 0;label = 5; break; //@line 326 "html/html_smartypants.c"
  case 5: 
   var $_0;
   return $_0; //@line 328 "html/html_smartypants.c"
  default: assert(0, "bad label: " + label);
 }
}
function _houdini_escape_html0($ob, $src, $size, $secure) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=((($size)*(12))&-1); //@line 54 "html/houdini_html_e.c"
   var $2=((((($1)>>>(0)))/(10))&-1); //@line 54 "html/houdini_html_e.c"
   var $3=_bufgrow($ob, $2); //@line 54 "html/houdini_html_e.c"
   var $4=(($size)|(0))==0; //@line 56 "html/houdini_html_e.c"
   if ($4) { label = 20; break; } else { label = 2; break; } //@line 56 "html/houdini_html_e.c"
  case 2: 
   var $5=(($secure)|(0))==0; //@line 69 "html/houdini_html_e.c"
   if ($5) { var $i_023_us = 0;var $esc_024_us = 0;label = 3; break; } else { var $i_023 = 0;var $esc_024 = 0;label = 13; break; }
  case 3: 
   var $esc_024_us;
   var $i_023_us;
   var $esc_1_us = $esc_024_us;var $i_1_us = $i_023_us;label = 4; break; //@line 58 "html/houdini_html_e.c"
  case 4: 
   var $i_1_us;
   var $esc_1_us;
   var $7=(($i_1_us)>>>(0)) < (($size)>>>(0)); //@line 58 "html/houdini_html_e.c"
   if ($7) { label = 5; break; } else { var $esc_222_us = $esc_1_us;var $_lcssa25 = 0;label = 6; break; } //@line 58 "html/houdini_html_e.c"
  case 5: 
   var $9=(($src+$i_1_us)|0); //@line 58 "html/houdini_html_e.c"
   var $10=HEAP8[($9)]; //@line 58 "html/houdini_html_e.c"
   var $11=(($10)&(255)); //@line 58 "html/houdini_html_e.c"
   var $12=((2680+$11)|0); //@line 58 "html/houdini_html_e.c"
   var $13=HEAP8[($12)]; //@line 58 "html/houdini_html_e.c"
   var $14=(($13 << 24) >> 24); //@line 58 "html/houdini_html_e.c"
   var $15=(($13 << 24) >> 24)==0; //@line 58 "html/houdini_html_e.c"
   var $16=((($i_1_us)+(1))|0); //@line 59 "html/houdini_html_e.c"
   if ($15) { var $esc_1_us = $14;var $i_1_us = $16;label = 4; break; } else { var $esc_222_us = $14;var $_lcssa25 = 1;label = 6; break; }
  case 6: 
   var $_lcssa25;
   var $esc_222_us;
   var $17=(($i_1_us)>>>(0)) > (($i_023_us)>>>(0)); //@line 61 "html/houdini_html_e.c"
   if ($17) { label = 7; break; } else { label = 8; break; } //@line 61 "html/houdini_html_e.c"
  case 7: 
   var $19=(($src+$i_023_us)|0); //@line 62 "html/houdini_html_e.c"
   var $20=((($i_1_us)-($i_023_us))|0); //@line 62 "html/houdini_html_e.c"
   _bufput($ob, $19, $20); //@line 62 "html/houdini_html_e.c"
   label = 8; break; //@line 62 "html/houdini_html_e.c"
  case 8: 
   if ($_lcssa25) { label = 9; break; } else { label = 20; break; } //@line 65 "html/houdini_html_e.c"
  case 9: 
   var $23=(($src+$i_1_us)|0); //@line 69 "html/houdini_html_e.c"
   var $24=HEAP8[($23)]; //@line 69 "html/houdini_html_e.c"
   var $25=(($24 << 24) >> 24)==47; //@line 69 "html/houdini_html_e.c"
   if ($25) { label = 11; break; } else { label = 10; break; } //@line 69 "html/houdini_html_e.c"
  case 10: 
   var $27=((2936+($esc_222_us<<2))|0); //@line 72 "html/houdini_html_e.c"
   var $28=HEAP32[(($27)>>2)]; //@line 72 "html/houdini_html_e.c"
   _bufputs($ob, $28); //@line 72 "html/houdini_html_e.c"
   label = 12; break;
  case 11: 
   _bufputc($ob, 47); //@line 70 "html/houdini_html_e.c"
   label = 12; break; //@line 71 "html/houdini_html_e.c"
  case 12: 
   var $31=((($i_1_us)+(1))|0); //@line 75 "html/houdini_html_e.c"
   var $32=(($31)>>>(0)) < (($size)>>>(0)); //@line 56 "html/houdini_html_e.c"
   if ($32) { var $i_023_us = $31;var $esc_024_us = $esc_222_us;label = 3; break; } else { label = 20; break; } //@line 56 "html/houdini_html_e.c"
  case 13: 
   var $esc_024;
   var $i_023;
   var $esc_1 = $esc_024;var $i_1 = $i_023;label = 14; break; //@line 58 "html/houdini_html_e.c"
  case 14: 
   var $i_1;
   var $esc_1;
   var $34=(($i_1)>>>(0)) < (($size)>>>(0)); //@line 58 "html/houdini_html_e.c"
   if ($34) { label = 15; break; } else { var $esc_222 = $esc_1;var $_lcssa = 0;label = 16; break; } //@line 58 "html/houdini_html_e.c"
  case 15: 
   var $36=(($src+$i_1)|0); //@line 58 "html/houdini_html_e.c"
   var $37=HEAP8[($36)]; //@line 58 "html/houdini_html_e.c"
   var $38=(($37)&(255)); //@line 58 "html/houdini_html_e.c"
   var $39=((2680+$38)|0); //@line 58 "html/houdini_html_e.c"
   var $40=HEAP8[($39)]; //@line 58 "html/houdini_html_e.c"
   var $41=(($40 << 24) >> 24); //@line 58 "html/houdini_html_e.c"
   var $42=(($40 << 24) >> 24)==0; //@line 58 "html/houdini_html_e.c"
   var $43=((($i_1)+(1))|0); //@line 59 "html/houdini_html_e.c"
   if ($42) { var $esc_1 = $41;var $i_1 = $43;label = 14; break; } else { var $esc_222 = $41;var $_lcssa = 1;label = 16; break; }
  case 16: 
   var $_lcssa;
   var $esc_222;
   var $44=(($i_1)>>>(0)) > (($i_023)>>>(0)); //@line 61 "html/houdini_html_e.c"
   if ($44) { label = 17; break; } else { label = 18; break; } //@line 61 "html/houdini_html_e.c"
  case 17: 
   var $46=(($src+$i_023)|0); //@line 62 "html/houdini_html_e.c"
   var $47=((($i_1)-($i_023))|0); //@line 62 "html/houdini_html_e.c"
   _bufput($ob, $46, $47); //@line 62 "html/houdini_html_e.c"
   label = 18; break; //@line 62 "html/houdini_html_e.c"
  case 18: 
   if ($_lcssa) { label = 19; break; } else { label = 20; break; } //@line 65 "html/houdini_html_e.c"
  case 19: 
   var $50=((2936+($esc_222<<2))|0); //@line 72 "html/houdini_html_e.c"
   var $51=HEAP32[(($50)>>2)]; //@line 72 "html/houdini_html_e.c"
   _bufputs($ob, $51); //@line 72 "html/houdini_html_e.c"
   var $52=((($i_1)+(1))|0); //@line 75 "html/houdini_html_e.c"
   var $53=(($52)>>>(0)) < (($size)>>>(0)); //@line 56 "html/houdini_html_e.c"
   if ($53) { var $i_023 = $52;var $esc_024 = $esc_222;label = 13; break; } else { label = 20; break; } //@line 56 "html/houdini_html_e.c"
  case 20: 
   return; //@line 77 "html/houdini_html_e.c"
  default: assert(0, "bad label: " + label);
 }
}
function _houdini_escape_href($ob, $src, $size) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $hex_str=sp;
   var $1=((($size)*(12))&-1); //@line 60 "html/houdini_href_e.c"
   var $2=((((($1)>>>(0)))/(10))&-1); //@line 60 "html/houdini_href_e.c"
   var $3=_bufgrow($ob, $2); //@line 60 "html/houdini_href_e.c"
   var $4=(($hex_str)|0); //@line 61 "html/houdini_href_e.c"
   HEAP8[($4)]=37; //@line 61 "html/houdini_href_e.c"
   var $5=(($size)|(0))==0; //@line 63 "html/houdini_href_e.c"
   if ($5) { label = 14; break; } else { label = 2; break; } //@line 63 "html/houdini_href_e.c"
  case 2: 
   var $6=(($hex_str+1)|0); //@line 101 "html/houdini_href_e.c"
   var $7=(($hex_str+2)|0); //@line 102 "html/houdini_href_e.c"
   var $i_026 = 0;label = 3; break; //@line 63 "html/houdini_href_e.c"
  case 3: 
   var $i_026;
   var $i_1 = $i_026;label = 4; break; //@line 65 "html/houdini_href_e.c"
  case 4: 
   var $i_1;
   var $9=(($i_1)>>>(0)) < (($size)>>>(0)); //@line 65 "html/houdini_href_e.c"
   if ($9) { label = 5; break; } else { var $_lcssa = 0;label = 6; break; } //@line 65 "html/houdini_href_e.c"
  case 5: 
   var $11=(($src+$i_1)|0); //@line 65 "html/houdini_href_e.c"
   var $12=HEAP8[($11)]; //@line 65 "html/houdini_href_e.c"
   var $13=(($12)&(255)); //@line 65 "html/houdini_href_e.c"
   var $14=((2968+$13)|0); //@line 65 "html/houdini_href_e.c"
   var $15=HEAP8[($14)]; //@line 65 "html/houdini_href_e.c"
   var $16=(($15 << 24) >> 24)==0; //@line 65 "html/houdini_href_e.c"
   var $17=((($i_1)+(1))|0); //@line 66 "html/houdini_href_e.c"
   if ($16) { var $_lcssa = 1;label = 6; break; } else { var $i_1 = $17;label = 4; break; }
  case 6: 
   var $_lcssa;
   var $18=(($i_1)>>>(0)) > (($i_026)>>>(0)); //@line 68 "html/houdini_href_e.c"
   if ($18) { label = 7; break; } else { label = 8; break; } //@line 68 "html/houdini_href_e.c"
  case 7: 
   var $20=(($src+$i_026)|0); //@line 69 "html/houdini_href_e.c"
   var $21=((($i_1)-($i_026))|0); //@line 69 "html/houdini_href_e.c"
   _bufput($ob, $20, $21); //@line 69 "html/houdini_href_e.c"
   label = 8; break; //@line 69 "html/houdini_href_e.c"
  case 8: 
   if ($_lcssa) { label = 9; break; } else { label = 14; break; } //@line 72 "html/houdini_href_e.c"
  case 9: 
   var $24=(($src+$i_1)|0); //@line 75 "html/houdini_href_e.c"
   var $25=HEAP8[($24)]; //@line 75 "html/houdini_href_e.c"
   var $26=(($25)&(255)); //@line 75 "html/houdini_href_e.c"
   if ((($26)|(0))==38) {
    label = 10; break;
   }
   else if ((($26)|(0))==39) {
    label = 11; break;
   }
   else {
   label = 12; break;
   }
  case 10: 
   _bufput($ob, ((2432)|0), 5); //@line 79 "html/houdini_href_e.c"
   label = 13; break; //@line 80 "html/houdini_href_e.c"
  case 11: 
   _bufput($ob, ((2480)|0), 6); //@line 86 "html/houdini_href_e.c"
   label = 13; break; //@line 87 "html/houdini_href_e.c"
  case 12: 
   var $30=$26 >>> 4; //@line 101 "html/houdini_href_e.c"
   var $31=((608+$30)|0); //@line 101 "html/houdini_href_e.c"
   var $32=HEAP8[($31)]; //@line 101 "html/houdini_href_e.c"
   HEAP8[($6)]=$32; //@line 101 "html/houdini_href_e.c"
   var $33=$26 & 15; //@line 102 "html/houdini_href_e.c"
   var $34=((608+$33)|0); //@line 102 "html/houdini_href_e.c"
   var $35=HEAP8[($34)]; //@line 102 "html/houdini_href_e.c"
   HEAP8[($7)]=$35; //@line 102 "html/houdini_href_e.c"
   _bufput($ob, $4, 3); //@line 103 "html/houdini_href_e.c"
   label = 13; break; //@line 104 "html/houdini_href_e.c"
  case 13: 
   var $37=((($i_1)+(1))|0); //@line 106 "html/houdini_href_e.c"
   var $38=(($37)>>>(0)) < (($size)>>>(0)); //@line 63 "html/houdini_href_e.c"
   if ($38) { var $i_026 = $37;label = 3; break; } else { label = 14; break; } //@line 63 "html/houdini_href_e.c"
  case 14: 
   STACKTOP = sp;
   return; //@line 108 "html/houdini_href_e.c"
  default: assert(0, "bad label: " + label);
 }
}
function _malloc($bytes) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($bytes)>>>(0)) < 245;
   if ($1) { label = 2; break; } else { label = 78; break; }
  case 2: 
   var $3=(($bytes)>>>(0)) < 11;
   if ($3) { var $8 = 16;label = 4; break; } else { label = 3; break; }
  case 3: 
   var $5=((($bytes)+(11))|0);
   var $6=$5 & -8;
   var $8 = $6;label = 4; break;
  case 4: 
   var $8;
   var $9=$8 >>> 3;
   var $10=HEAP32[((((3264)|0))>>2)];
   var $11=$10 >>> (($9)>>>(0));
   var $12=$11 & 3;
   var $13=(($12)|(0))==0;
   if ($13) { label = 12; break; } else { label = 5; break; }
  case 5: 
   var $15=$11 & 1;
   var $16=$15 ^ 1;
   var $17=((($16)+($9))|0);
   var $18=$17 << 1;
   var $19=((3304+($18<<2))|0);
   var $20=$19;
   var $_sum111=((($18)+(2))|0);
   var $21=((3304+($_sum111<<2))|0);
   var $22=HEAP32[(($21)>>2)];
   var $23=(($22+8)|0);
   var $24=HEAP32[(($23)>>2)];
   var $25=(($20)|(0))==(($24)|(0));
   if ($25) { label = 6; break; } else { label = 7; break; }
  case 6: 
   var $27=1 << $17;
   var $28=$27 ^ -1;
   var $29=$10 & $28;
   HEAP32[((((3264)|0))>>2)]=$29;
   label = 11; break;
  case 7: 
   var $31=$24;
   var $32=HEAP32[((((3280)|0))>>2)];
   var $33=(($31)>>>(0)) < (($32)>>>(0));
   if ($33) { label = 10; break; } else { label = 8; break; }
  case 8: 
   var $35=(($24+12)|0);
   var $36=HEAP32[(($35)>>2)];
   var $37=(($36)|(0))==(($22)|(0));
   if ($37) { label = 9; break; } else { label = 10; break; }
  case 9: 
   HEAP32[(($35)>>2)]=$20;
   HEAP32[(($21)>>2)]=$24;
   label = 11; break;
  case 10: 
   _abort();
   throw "Reached an unreachable!";
  case 11: 
   var $40=$17 << 3;
   var $41=$40 | 3;
   var $42=(($22+4)|0);
   HEAP32[(($42)>>2)]=$41;
   var $43=$22;
   var $_sum113114=$40 | 4;
   var $44=(($43+$_sum113114)|0);
   var $45=$44;
   var $46=HEAP32[(($45)>>2)];
   var $47=$46 | 1;
   HEAP32[(($45)>>2)]=$47;
   var $48=$23;
   var $mem_0 = $48;label = 341; break;
  case 12: 
   var $50=HEAP32[((((3272)|0))>>2)];
   var $51=(($8)>>>(0)) > (($50)>>>(0));
   if ($51) { label = 13; break; } else { var $nb_0 = $8;label = 160; break; }
  case 13: 
   var $53=(($11)|(0))==0;
   if ($53) { label = 27; break; } else { label = 14; break; }
  case 14: 
   var $55=$11 << $9;
   var $56=2 << $9;
   var $57=(((-$56))|0);
   var $58=$56 | $57;
   var $59=$55 & $58;
   var $60=(((-$59))|0);
   var $61=$59 & $60;
   var $62=((($61)-(1))|0);
   var $63=$62 >>> 12;
   var $64=$63 & 16;
   var $65=$62 >>> (($64)>>>(0));
   var $66=$65 >>> 5;
   var $67=$66 & 8;
   var $68=$67 | $64;
   var $69=$65 >>> (($67)>>>(0));
   var $70=$69 >>> 2;
   var $71=$70 & 4;
   var $72=$68 | $71;
   var $73=$69 >>> (($71)>>>(0));
   var $74=$73 >>> 1;
   var $75=$74 & 2;
   var $76=$72 | $75;
   var $77=$73 >>> (($75)>>>(0));
   var $78=$77 >>> 1;
   var $79=$78 & 1;
   var $80=$76 | $79;
   var $81=$77 >>> (($79)>>>(0));
   var $82=((($80)+($81))|0);
   var $83=$82 << 1;
   var $84=((3304+($83<<2))|0);
   var $85=$84;
   var $_sum104=((($83)+(2))|0);
   var $86=((3304+($_sum104<<2))|0);
   var $87=HEAP32[(($86)>>2)];
   var $88=(($87+8)|0);
   var $89=HEAP32[(($88)>>2)];
   var $90=(($85)|(0))==(($89)|(0));
   if ($90) { label = 15; break; } else { label = 16; break; }
  case 15: 
   var $92=1 << $82;
   var $93=$92 ^ -1;
   var $94=$10 & $93;
   HEAP32[((((3264)|0))>>2)]=$94;
   label = 20; break;
  case 16: 
   var $96=$89;
   var $97=HEAP32[((((3280)|0))>>2)];
   var $98=(($96)>>>(0)) < (($97)>>>(0));
   if ($98) { label = 19; break; } else { label = 17; break; }
  case 17: 
   var $100=(($89+12)|0);
   var $101=HEAP32[(($100)>>2)];
   var $102=(($101)|(0))==(($87)|(0));
   if ($102) { label = 18; break; } else { label = 19; break; }
  case 18: 
   HEAP32[(($100)>>2)]=$85;
   HEAP32[(($86)>>2)]=$89;
   label = 20; break;
  case 19: 
   _abort();
   throw "Reached an unreachable!";
  case 20: 
   var $105=$82 << 3;
   var $106=((($105)-($8))|0);
   var $107=$8 | 3;
   var $108=(($87+4)|0);
   HEAP32[(($108)>>2)]=$107;
   var $109=$87;
   var $110=(($109+$8)|0);
   var $111=$110;
   var $112=$106 | 1;
   var $_sum106107=$8 | 4;
   var $113=(($109+$_sum106107)|0);
   var $114=$113;
   HEAP32[(($114)>>2)]=$112;
   var $115=(($109+$105)|0);
   var $116=$115;
   HEAP32[(($116)>>2)]=$106;
   var $117=HEAP32[((((3272)|0))>>2)];
   var $118=(($117)|(0))==0;
   if ($118) { label = 26; break; } else { label = 21; break; }
  case 21: 
   var $120=HEAP32[((((3284)|0))>>2)];
   var $121=$117 >>> 3;
   var $122=$121 << 1;
   var $123=((3304+($122<<2))|0);
   var $124=$123;
   var $125=HEAP32[((((3264)|0))>>2)];
   var $126=1 << $121;
   var $127=$125 & $126;
   var $128=(($127)|(0))==0;
   if ($128) { label = 22; break; } else { label = 23; break; }
  case 22: 
   var $130=$125 | $126;
   HEAP32[((((3264)|0))>>2)]=$130;
   var $_sum109_pre=((($122)+(2))|0);
   var $_pre=((3304+($_sum109_pre<<2))|0);
   var $F4_0 = $124;var $_pre_phi = $_pre;label = 25; break;
  case 23: 
   var $_sum110=((($122)+(2))|0);
   var $132=((3304+($_sum110<<2))|0);
   var $133=HEAP32[(($132)>>2)];
   var $134=$133;
   var $135=HEAP32[((((3280)|0))>>2)];
   var $136=(($134)>>>(0)) < (($135)>>>(0));
   if ($136) { label = 24; break; } else { var $F4_0 = $133;var $_pre_phi = $132;label = 25; break; }
  case 24: 
   _abort();
   throw "Reached an unreachable!";
  case 25: 
   var $_pre_phi;
   var $F4_0;
   HEAP32[(($_pre_phi)>>2)]=$120;
   var $139=(($F4_0+12)|0);
   HEAP32[(($139)>>2)]=$120;
   var $140=(($120+8)|0);
   HEAP32[(($140)>>2)]=$F4_0;
   var $141=(($120+12)|0);
   HEAP32[(($141)>>2)]=$124;
   label = 26; break;
  case 26: 
   HEAP32[((((3272)|0))>>2)]=$106;
   HEAP32[((((3284)|0))>>2)]=$111;
   var $143=$88;
   var $mem_0 = $143;label = 341; break;
  case 27: 
   var $145=HEAP32[((((3268)|0))>>2)];
   var $146=(($145)|(0))==0;
   if ($146) { var $nb_0 = $8;label = 160; break; } else { label = 28; break; }
  case 28: 
   var $148=(((-$145))|0);
   var $149=$145 & $148;
   var $150=((($149)-(1))|0);
   var $151=$150 >>> 12;
   var $152=$151 & 16;
   var $153=$150 >>> (($152)>>>(0));
   var $154=$153 >>> 5;
   var $155=$154 & 8;
   var $156=$155 | $152;
   var $157=$153 >>> (($155)>>>(0));
   var $158=$157 >>> 2;
   var $159=$158 & 4;
   var $160=$156 | $159;
   var $161=$157 >>> (($159)>>>(0));
   var $162=$161 >>> 1;
   var $163=$162 & 2;
   var $164=$160 | $163;
   var $165=$161 >>> (($163)>>>(0));
   var $166=$165 >>> 1;
   var $167=$166 & 1;
   var $168=$164 | $167;
   var $169=$165 >>> (($167)>>>(0));
   var $170=((($168)+($169))|0);
   var $171=((3568+($170<<2))|0);
   var $172=HEAP32[(($171)>>2)];
   var $173=(($172+4)|0);
   var $174=HEAP32[(($173)>>2)];
   var $175=$174 & -8;
   var $176=((($175)-($8))|0);
   var $t_0_i = $172;var $v_0_i = $172;var $rsize_0_i = $176;label = 29; break;
  case 29: 
   var $rsize_0_i;
   var $v_0_i;
   var $t_0_i;
   var $178=(($t_0_i+16)|0);
   var $179=HEAP32[(($178)>>2)];
   var $180=(($179)|(0))==0;
   if ($180) { label = 30; break; } else { var $185 = $179;label = 31; break; }
  case 30: 
   var $182=(($t_0_i+20)|0);
   var $183=HEAP32[(($182)>>2)];
   var $184=(($183)|(0))==0;
   if ($184) { label = 32; break; } else { var $185 = $183;label = 31; break; }
  case 31: 
   var $185;
   var $186=(($185+4)|0);
   var $187=HEAP32[(($186)>>2)];
   var $188=$187 & -8;
   var $189=((($188)-($8))|0);
   var $190=(($189)>>>(0)) < (($rsize_0_i)>>>(0));
   var $_rsize_0_i=$190 ? $189 : $rsize_0_i;
   var $_v_0_i=$190 ? $185 : $v_0_i;
   var $t_0_i = $185;var $v_0_i = $_v_0_i;var $rsize_0_i = $_rsize_0_i;label = 29; break;
  case 32: 
   var $192=$v_0_i;
   var $193=HEAP32[((((3280)|0))>>2)];
   var $194=(($192)>>>(0)) < (($193)>>>(0));
   if ($194) { label = 76; break; } else { label = 33; break; }
  case 33: 
   var $196=(($192+$8)|0);
   var $197=$196;
   var $198=(($192)>>>(0)) < (($196)>>>(0));
   if ($198) { label = 34; break; } else { label = 76; break; }
  case 34: 
   var $200=(($v_0_i+24)|0);
   var $201=HEAP32[(($200)>>2)];
   var $202=(($v_0_i+12)|0);
   var $203=HEAP32[(($202)>>2)];
   var $204=(($203)|(0))==(($v_0_i)|(0));
   if ($204) { label = 40; break; } else { label = 35; break; }
  case 35: 
   var $206=(($v_0_i+8)|0);
   var $207=HEAP32[(($206)>>2)];
   var $208=$207;
   var $209=(($208)>>>(0)) < (($193)>>>(0));
   if ($209) { label = 39; break; } else { label = 36; break; }
  case 36: 
   var $211=(($207+12)|0);
   var $212=HEAP32[(($211)>>2)];
   var $213=(($212)|(0))==(($v_0_i)|(0));
   if ($213) { label = 37; break; } else { label = 39; break; }
  case 37: 
   var $215=(($203+8)|0);
   var $216=HEAP32[(($215)>>2)];
   var $217=(($216)|(0))==(($v_0_i)|(0));
   if ($217) { label = 38; break; } else { label = 39; break; }
  case 38: 
   HEAP32[(($211)>>2)]=$203;
   HEAP32[(($215)>>2)]=$207;
   var $R_1_i = $203;label = 47; break;
  case 39: 
   _abort();
   throw "Reached an unreachable!";
  case 40: 
   var $220=(($v_0_i+20)|0);
   var $221=HEAP32[(($220)>>2)];
   var $222=(($221)|(0))==0;
   if ($222) { label = 41; break; } else { var $R_0_i = $221;var $RP_0_i = $220;label = 42; break; }
  case 41: 
   var $224=(($v_0_i+16)|0);
   var $225=HEAP32[(($224)>>2)];
   var $226=(($225)|(0))==0;
   if ($226) { var $R_1_i = 0;label = 47; break; } else { var $R_0_i = $225;var $RP_0_i = $224;label = 42; break; }
  case 42: 
   var $RP_0_i;
   var $R_0_i;
   var $227=(($R_0_i+20)|0);
   var $228=HEAP32[(($227)>>2)];
   var $229=(($228)|(0))==0;
   if ($229) { label = 43; break; } else { var $R_0_i = $228;var $RP_0_i = $227;label = 42; break; }
  case 43: 
   var $231=(($R_0_i+16)|0);
   var $232=HEAP32[(($231)>>2)];
   var $233=(($232)|(0))==0;
   if ($233) { label = 44; break; } else { var $R_0_i = $232;var $RP_0_i = $231;label = 42; break; }
  case 44: 
   var $235=$RP_0_i;
   var $236=(($235)>>>(0)) < (($193)>>>(0));
   if ($236) { label = 46; break; } else { label = 45; break; }
  case 45: 
   HEAP32[(($RP_0_i)>>2)]=0;
   var $R_1_i = $R_0_i;label = 47; break;
  case 46: 
   _abort();
   throw "Reached an unreachable!";
  case 47: 
   var $R_1_i;
   var $240=(($201)|(0))==0;
   if ($240) { label = 67; break; } else { label = 48; break; }
  case 48: 
   var $242=(($v_0_i+28)|0);
   var $243=HEAP32[(($242)>>2)];
   var $244=((3568+($243<<2))|0);
   var $245=HEAP32[(($244)>>2)];
   var $246=(($v_0_i)|(0))==(($245)|(0));
   if ($246) { label = 49; break; } else { label = 51; break; }
  case 49: 
   HEAP32[(($244)>>2)]=$R_1_i;
   var $cond_i=(($R_1_i)|(0))==0;
   if ($cond_i) { label = 50; break; } else { label = 57; break; }
  case 50: 
   var $248=HEAP32[(($242)>>2)];
   var $249=1 << $248;
   var $250=$249 ^ -1;
   var $251=HEAP32[((((3268)|0))>>2)];
   var $252=$251 & $250;
   HEAP32[((((3268)|0))>>2)]=$252;
   label = 67; break;
  case 51: 
   var $254=$201;
   var $255=HEAP32[((((3280)|0))>>2)];
   var $256=(($254)>>>(0)) < (($255)>>>(0));
   if ($256) { label = 55; break; } else { label = 52; break; }
  case 52: 
   var $258=(($201+16)|0);
   var $259=HEAP32[(($258)>>2)];
   var $260=(($259)|(0))==(($v_0_i)|(0));
   if ($260) { label = 53; break; } else { label = 54; break; }
  case 53: 
   HEAP32[(($258)>>2)]=$R_1_i;
   label = 56; break;
  case 54: 
   var $263=(($201+20)|0);
   HEAP32[(($263)>>2)]=$R_1_i;
   label = 56; break;
  case 55: 
   _abort();
   throw "Reached an unreachable!";
  case 56: 
   var $266=(($R_1_i)|(0))==0;
   if ($266) { label = 67; break; } else { label = 57; break; }
  case 57: 
   var $268=$R_1_i;
   var $269=HEAP32[((((3280)|0))>>2)];
   var $270=(($268)>>>(0)) < (($269)>>>(0));
   if ($270) { label = 66; break; } else { label = 58; break; }
  case 58: 
   var $272=(($R_1_i+24)|0);
   HEAP32[(($272)>>2)]=$201;
   var $273=(($v_0_i+16)|0);
   var $274=HEAP32[(($273)>>2)];
   var $275=(($274)|(0))==0;
   if ($275) { label = 62; break; } else { label = 59; break; }
  case 59: 
   var $277=$274;
   var $278=HEAP32[((((3280)|0))>>2)];
   var $279=(($277)>>>(0)) < (($278)>>>(0));
   if ($279) { label = 61; break; } else { label = 60; break; }
  case 60: 
   var $281=(($R_1_i+16)|0);
   HEAP32[(($281)>>2)]=$274;
   var $282=(($274+24)|0);
   HEAP32[(($282)>>2)]=$R_1_i;
   label = 62; break;
  case 61: 
   _abort();
   throw "Reached an unreachable!";
  case 62: 
   var $285=(($v_0_i+20)|0);
   var $286=HEAP32[(($285)>>2)];
   var $287=(($286)|(0))==0;
   if ($287) { label = 67; break; } else { label = 63; break; }
  case 63: 
   var $289=$286;
   var $290=HEAP32[((((3280)|0))>>2)];
   var $291=(($289)>>>(0)) < (($290)>>>(0));
   if ($291) { label = 65; break; } else { label = 64; break; }
  case 64: 
   var $293=(($R_1_i+20)|0);
   HEAP32[(($293)>>2)]=$286;
   var $294=(($286+24)|0);
   HEAP32[(($294)>>2)]=$R_1_i;
   label = 67; break;
  case 65: 
   _abort();
   throw "Reached an unreachable!";
  case 66: 
   _abort();
   throw "Reached an unreachable!";
  case 67: 
   var $298=(($rsize_0_i)>>>(0)) < 16;
   if ($298) { label = 68; break; } else { label = 69; break; }
  case 68: 
   var $300=((($rsize_0_i)+($8))|0);
   var $301=$300 | 3;
   var $302=(($v_0_i+4)|0);
   HEAP32[(($302)>>2)]=$301;
   var $_sum4_i=((($300)+(4))|0);
   var $303=(($192+$_sum4_i)|0);
   var $304=$303;
   var $305=HEAP32[(($304)>>2)];
   var $306=$305 | 1;
   HEAP32[(($304)>>2)]=$306;
   label = 77; break;
  case 69: 
   var $308=$8 | 3;
   var $309=(($v_0_i+4)|0);
   HEAP32[(($309)>>2)]=$308;
   var $310=$rsize_0_i | 1;
   var $_sum_i137=$8 | 4;
   var $311=(($192+$_sum_i137)|0);
   var $312=$311;
   HEAP32[(($312)>>2)]=$310;
   var $_sum1_i=((($rsize_0_i)+($8))|0);
   var $313=(($192+$_sum1_i)|0);
   var $314=$313;
   HEAP32[(($314)>>2)]=$rsize_0_i;
   var $315=HEAP32[((((3272)|0))>>2)];
   var $316=(($315)|(0))==0;
   if ($316) { label = 75; break; } else { label = 70; break; }
  case 70: 
   var $318=HEAP32[((((3284)|0))>>2)];
   var $319=$315 >>> 3;
   var $320=$319 << 1;
   var $321=((3304+($320<<2))|0);
   var $322=$321;
   var $323=HEAP32[((((3264)|0))>>2)];
   var $324=1 << $319;
   var $325=$323 & $324;
   var $326=(($325)|(0))==0;
   if ($326) { label = 71; break; } else { label = 72; break; }
  case 71: 
   var $328=$323 | $324;
   HEAP32[((((3264)|0))>>2)]=$328;
   var $_sum2_pre_i=((($320)+(2))|0);
   var $_pre_i=((3304+($_sum2_pre_i<<2))|0);
   var $F1_0_i = $322;var $_pre_phi_i = $_pre_i;label = 74; break;
  case 72: 
   var $_sum3_i=((($320)+(2))|0);
   var $330=((3304+($_sum3_i<<2))|0);
   var $331=HEAP32[(($330)>>2)];
   var $332=$331;
   var $333=HEAP32[((((3280)|0))>>2)];
   var $334=(($332)>>>(0)) < (($333)>>>(0));
   if ($334) { label = 73; break; } else { var $F1_0_i = $331;var $_pre_phi_i = $330;label = 74; break; }
  case 73: 
   _abort();
   throw "Reached an unreachable!";
  case 74: 
   var $_pre_phi_i;
   var $F1_0_i;
   HEAP32[(($_pre_phi_i)>>2)]=$318;
   var $337=(($F1_0_i+12)|0);
   HEAP32[(($337)>>2)]=$318;
   var $338=(($318+8)|0);
   HEAP32[(($338)>>2)]=$F1_0_i;
   var $339=(($318+12)|0);
   HEAP32[(($339)>>2)]=$322;
   label = 75; break;
  case 75: 
   HEAP32[((((3272)|0))>>2)]=$rsize_0_i;
   HEAP32[((((3284)|0))>>2)]=$197;
   label = 77; break;
  case 76: 
   _abort();
   throw "Reached an unreachable!";
  case 77: 
   var $342=(($v_0_i+8)|0);
   var $343=$342;
   var $344=(($342)|(0))==0;
   if ($344) { var $nb_0 = $8;label = 160; break; } else { var $mem_0 = $343;label = 341; break; }
  case 78: 
   var $346=(($bytes)>>>(0)) > 4294967231;
   if ($346) { var $nb_0 = -1;label = 160; break; } else { label = 79; break; }
  case 79: 
   var $348=((($bytes)+(11))|0);
   var $349=$348 & -8;
   var $350=HEAP32[((((3268)|0))>>2)];
   var $351=(($350)|(0))==0;
   if ($351) { var $nb_0 = $349;label = 160; break; } else { label = 80; break; }
  case 80: 
   var $353=(((-$349))|0);
   var $354=$348 >>> 8;
   var $355=(($354)|(0))==0;
   if ($355) { var $idx_0_i = 0;label = 83; break; } else { label = 81; break; }
  case 81: 
   var $357=(($349)>>>(0)) > 16777215;
   if ($357) { var $idx_0_i = 31;label = 83; break; } else { label = 82; break; }
  case 82: 
   var $359=((($354)+(1048320))|0);
   var $360=$359 >>> 16;
   var $361=$360 & 8;
   var $362=$354 << $361;
   var $363=((($362)+(520192))|0);
   var $364=$363 >>> 16;
   var $365=$364 & 4;
   var $366=$365 | $361;
   var $367=$362 << $365;
   var $368=((($367)+(245760))|0);
   var $369=$368 >>> 16;
   var $370=$369 & 2;
   var $371=$366 | $370;
   var $372=(((14)-($371))|0);
   var $373=$367 << $370;
   var $374=$373 >>> 15;
   var $375=((($372)+($374))|0);
   var $376=$375 << 1;
   var $377=((($375)+(7))|0);
   var $378=$349 >>> (($377)>>>(0));
   var $379=$378 & 1;
   var $380=$379 | $376;
   var $idx_0_i = $380;label = 83; break;
  case 83: 
   var $idx_0_i;
   var $382=((3568+($idx_0_i<<2))|0);
   var $383=HEAP32[(($382)>>2)];
   var $384=(($383)|(0))==0;
   if ($384) { var $v_2_i = 0;var $rsize_2_i = $353;var $t_1_i = 0;label = 90; break; } else { label = 84; break; }
  case 84: 
   var $386=(($idx_0_i)|(0))==31;
   if ($386) { var $391 = 0;label = 86; break; } else { label = 85; break; }
  case 85: 
   var $388=$idx_0_i >>> 1;
   var $389=(((25)-($388))|0);
   var $391 = $389;label = 86; break;
  case 86: 
   var $391;
   var $392=$349 << $391;
   var $v_0_i118 = 0;var $rsize_0_i117 = $353;var $t_0_i116 = $383;var $sizebits_0_i = $392;var $rst_0_i = 0;label = 87; break;
  case 87: 
   var $rst_0_i;
   var $sizebits_0_i;
   var $t_0_i116;
   var $rsize_0_i117;
   var $v_0_i118;
   var $394=(($t_0_i116+4)|0);
   var $395=HEAP32[(($394)>>2)];
   var $396=$395 & -8;
   var $397=((($396)-($349))|0);
   var $398=(($397)>>>(0)) < (($rsize_0_i117)>>>(0));
   if ($398) { label = 88; break; } else { var $v_1_i = $v_0_i118;var $rsize_1_i = $rsize_0_i117;label = 89; break; }
  case 88: 
   var $400=(($396)|(0))==(($349)|(0));
   if ($400) { var $v_2_i = $t_0_i116;var $rsize_2_i = $397;var $t_1_i = $t_0_i116;label = 90; break; } else { var $v_1_i = $t_0_i116;var $rsize_1_i = $397;label = 89; break; }
  case 89: 
   var $rsize_1_i;
   var $v_1_i;
   var $402=(($t_0_i116+20)|0);
   var $403=HEAP32[(($402)>>2)];
   var $404=$sizebits_0_i >>> 31;
   var $405=(($t_0_i116+16+($404<<2))|0);
   var $406=HEAP32[(($405)>>2)];
   var $407=(($403)|(0))==0;
   var $408=(($403)|(0))==(($406)|(0));
   var $or_cond_i=$407 | $408;
   var $rst_1_i=$or_cond_i ? $rst_0_i : $403;
   var $409=(($406)|(0))==0;
   var $410=$sizebits_0_i << 1;
   if ($409) { var $v_2_i = $v_1_i;var $rsize_2_i = $rsize_1_i;var $t_1_i = $rst_1_i;label = 90; break; } else { var $v_0_i118 = $v_1_i;var $rsize_0_i117 = $rsize_1_i;var $t_0_i116 = $406;var $sizebits_0_i = $410;var $rst_0_i = $rst_1_i;label = 87; break; }
  case 90: 
   var $t_1_i;
   var $rsize_2_i;
   var $v_2_i;
   var $411=(($t_1_i)|(0))==0;
   var $412=(($v_2_i)|(0))==0;
   var $or_cond21_i=$411 & $412;
   if ($or_cond21_i) { label = 91; break; } else { var $t_2_ph_i = $t_1_i;label = 93; break; }
  case 91: 
   var $414=2 << $idx_0_i;
   var $415=(((-$414))|0);
   var $416=$414 | $415;
   var $417=$350 & $416;
   var $418=(($417)|(0))==0;
   if ($418) { var $nb_0 = $349;label = 160; break; } else { label = 92; break; }
  case 92: 
   var $420=(((-$417))|0);
   var $421=$417 & $420;
   var $422=((($421)-(1))|0);
   var $423=$422 >>> 12;
   var $424=$423 & 16;
   var $425=$422 >>> (($424)>>>(0));
   var $426=$425 >>> 5;
   var $427=$426 & 8;
   var $428=$427 | $424;
   var $429=$425 >>> (($427)>>>(0));
   var $430=$429 >>> 2;
   var $431=$430 & 4;
   var $432=$428 | $431;
   var $433=$429 >>> (($431)>>>(0));
   var $434=$433 >>> 1;
   var $435=$434 & 2;
   var $436=$432 | $435;
   var $437=$433 >>> (($435)>>>(0));
   var $438=$437 >>> 1;
   var $439=$438 & 1;
   var $440=$436 | $439;
   var $441=$437 >>> (($439)>>>(0));
   var $442=((($440)+($441))|0);
   var $443=((3568+($442<<2))|0);
   var $444=HEAP32[(($443)>>2)];
   var $t_2_ph_i = $444;label = 93; break;
  case 93: 
   var $t_2_ph_i;
   var $445=(($t_2_ph_i)|(0))==0;
   if ($445) { var $rsize_3_lcssa_i = $rsize_2_i;var $v_3_lcssa_i = $v_2_i;label = 96; break; } else { var $t_228_i = $t_2_ph_i;var $rsize_329_i = $rsize_2_i;var $v_330_i = $v_2_i;label = 94; break; }
  case 94: 
   var $v_330_i;
   var $rsize_329_i;
   var $t_228_i;
   var $446=(($t_228_i+4)|0);
   var $447=HEAP32[(($446)>>2)];
   var $448=$447 & -8;
   var $449=((($448)-($349))|0);
   var $450=(($449)>>>(0)) < (($rsize_329_i)>>>(0));
   var $_rsize_3_i=$450 ? $449 : $rsize_329_i;
   var $t_2_v_3_i=$450 ? $t_228_i : $v_330_i;
   var $451=(($t_228_i+16)|0);
   var $452=HEAP32[(($451)>>2)];
   var $453=(($452)|(0))==0;
   if ($453) { label = 95; break; } else { var $t_228_i = $452;var $rsize_329_i = $_rsize_3_i;var $v_330_i = $t_2_v_3_i;label = 94; break; }
  case 95: 
   var $454=(($t_228_i+20)|0);
   var $455=HEAP32[(($454)>>2)];
   var $456=(($455)|(0))==0;
   if ($456) { var $rsize_3_lcssa_i = $_rsize_3_i;var $v_3_lcssa_i = $t_2_v_3_i;label = 96; break; } else { var $t_228_i = $455;var $rsize_329_i = $_rsize_3_i;var $v_330_i = $t_2_v_3_i;label = 94; break; }
  case 96: 
   var $v_3_lcssa_i;
   var $rsize_3_lcssa_i;
   var $457=(($v_3_lcssa_i)|(0))==0;
   if ($457) { var $nb_0 = $349;label = 160; break; } else { label = 97; break; }
  case 97: 
   var $459=HEAP32[((((3272)|0))>>2)];
   var $460=((($459)-($349))|0);
   var $461=(($rsize_3_lcssa_i)>>>(0)) < (($460)>>>(0));
   if ($461) { label = 98; break; } else { var $nb_0 = $349;label = 160; break; }
  case 98: 
   var $463=$v_3_lcssa_i;
   var $464=HEAP32[((((3280)|0))>>2)];
   var $465=(($463)>>>(0)) < (($464)>>>(0));
   if ($465) { label = 158; break; } else { label = 99; break; }
  case 99: 
   var $467=(($463+$349)|0);
   var $468=$467;
   var $469=(($463)>>>(0)) < (($467)>>>(0));
   if ($469) { label = 100; break; } else { label = 158; break; }
  case 100: 
   var $471=(($v_3_lcssa_i+24)|0);
   var $472=HEAP32[(($471)>>2)];
   var $473=(($v_3_lcssa_i+12)|0);
   var $474=HEAP32[(($473)>>2)];
   var $475=(($474)|(0))==(($v_3_lcssa_i)|(0));
   if ($475) { label = 106; break; } else { label = 101; break; }
  case 101: 
   var $477=(($v_3_lcssa_i+8)|0);
   var $478=HEAP32[(($477)>>2)];
   var $479=$478;
   var $480=(($479)>>>(0)) < (($464)>>>(0));
   if ($480) { label = 105; break; } else { label = 102; break; }
  case 102: 
   var $482=(($478+12)|0);
   var $483=HEAP32[(($482)>>2)];
   var $484=(($483)|(0))==(($v_3_lcssa_i)|(0));
   if ($484) { label = 103; break; } else { label = 105; break; }
  case 103: 
   var $486=(($474+8)|0);
   var $487=HEAP32[(($486)>>2)];
   var $488=(($487)|(0))==(($v_3_lcssa_i)|(0));
   if ($488) { label = 104; break; } else { label = 105; break; }
  case 104: 
   HEAP32[(($482)>>2)]=$474;
   HEAP32[(($486)>>2)]=$478;
   var $R_1_i122 = $474;label = 113; break;
  case 105: 
   _abort();
   throw "Reached an unreachable!";
  case 106: 
   var $491=(($v_3_lcssa_i+20)|0);
   var $492=HEAP32[(($491)>>2)];
   var $493=(($492)|(0))==0;
   if ($493) { label = 107; break; } else { var $R_0_i120 = $492;var $RP_0_i119 = $491;label = 108; break; }
  case 107: 
   var $495=(($v_3_lcssa_i+16)|0);
   var $496=HEAP32[(($495)>>2)];
   var $497=(($496)|(0))==0;
   if ($497) { var $R_1_i122 = 0;label = 113; break; } else { var $R_0_i120 = $496;var $RP_0_i119 = $495;label = 108; break; }
  case 108: 
   var $RP_0_i119;
   var $R_0_i120;
   var $498=(($R_0_i120+20)|0);
   var $499=HEAP32[(($498)>>2)];
   var $500=(($499)|(0))==0;
   if ($500) { label = 109; break; } else { var $R_0_i120 = $499;var $RP_0_i119 = $498;label = 108; break; }
  case 109: 
   var $502=(($R_0_i120+16)|0);
   var $503=HEAP32[(($502)>>2)];
   var $504=(($503)|(0))==0;
   if ($504) { label = 110; break; } else { var $R_0_i120 = $503;var $RP_0_i119 = $502;label = 108; break; }
  case 110: 
   var $506=$RP_0_i119;
   var $507=(($506)>>>(0)) < (($464)>>>(0));
   if ($507) { label = 112; break; } else { label = 111; break; }
  case 111: 
   HEAP32[(($RP_0_i119)>>2)]=0;
   var $R_1_i122 = $R_0_i120;label = 113; break;
  case 112: 
   _abort();
   throw "Reached an unreachable!";
  case 113: 
   var $R_1_i122;
   var $511=(($472)|(0))==0;
   if ($511) { label = 133; break; } else { label = 114; break; }
  case 114: 
   var $513=(($v_3_lcssa_i+28)|0);
   var $514=HEAP32[(($513)>>2)];
   var $515=((3568+($514<<2))|0);
   var $516=HEAP32[(($515)>>2)];
   var $517=(($v_3_lcssa_i)|(0))==(($516)|(0));
   if ($517) { label = 115; break; } else { label = 117; break; }
  case 115: 
   HEAP32[(($515)>>2)]=$R_1_i122;
   var $cond_i123=(($R_1_i122)|(0))==0;
   if ($cond_i123) { label = 116; break; } else { label = 123; break; }
  case 116: 
   var $519=HEAP32[(($513)>>2)];
   var $520=1 << $519;
   var $521=$520 ^ -1;
   var $522=HEAP32[((((3268)|0))>>2)];
   var $523=$522 & $521;
   HEAP32[((((3268)|0))>>2)]=$523;
   label = 133; break;
  case 117: 
   var $525=$472;
   var $526=HEAP32[((((3280)|0))>>2)];
   var $527=(($525)>>>(0)) < (($526)>>>(0));
   if ($527) { label = 121; break; } else { label = 118; break; }
  case 118: 
   var $529=(($472+16)|0);
   var $530=HEAP32[(($529)>>2)];
   var $531=(($530)|(0))==(($v_3_lcssa_i)|(0));
   if ($531) { label = 119; break; } else { label = 120; break; }
  case 119: 
   HEAP32[(($529)>>2)]=$R_1_i122;
   label = 122; break;
  case 120: 
   var $534=(($472+20)|0);
   HEAP32[(($534)>>2)]=$R_1_i122;
   label = 122; break;
  case 121: 
   _abort();
   throw "Reached an unreachable!";
  case 122: 
   var $537=(($R_1_i122)|(0))==0;
   if ($537) { label = 133; break; } else { label = 123; break; }
  case 123: 
   var $539=$R_1_i122;
   var $540=HEAP32[((((3280)|0))>>2)];
   var $541=(($539)>>>(0)) < (($540)>>>(0));
   if ($541) { label = 132; break; } else { label = 124; break; }
  case 124: 
   var $543=(($R_1_i122+24)|0);
   HEAP32[(($543)>>2)]=$472;
   var $544=(($v_3_lcssa_i+16)|0);
   var $545=HEAP32[(($544)>>2)];
   var $546=(($545)|(0))==0;
   if ($546) { label = 128; break; } else { label = 125; break; }
  case 125: 
   var $548=$545;
   var $549=HEAP32[((((3280)|0))>>2)];
   var $550=(($548)>>>(0)) < (($549)>>>(0));
   if ($550) { label = 127; break; } else { label = 126; break; }
  case 126: 
   var $552=(($R_1_i122+16)|0);
   HEAP32[(($552)>>2)]=$545;
   var $553=(($545+24)|0);
   HEAP32[(($553)>>2)]=$R_1_i122;
   label = 128; break;
  case 127: 
   _abort();
   throw "Reached an unreachable!";
  case 128: 
   var $556=(($v_3_lcssa_i+20)|0);
   var $557=HEAP32[(($556)>>2)];
   var $558=(($557)|(0))==0;
   if ($558) { label = 133; break; } else { label = 129; break; }
  case 129: 
   var $560=$557;
   var $561=HEAP32[((((3280)|0))>>2)];
   var $562=(($560)>>>(0)) < (($561)>>>(0));
   if ($562) { label = 131; break; } else { label = 130; break; }
  case 130: 
   var $564=(($R_1_i122+20)|0);
   HEAP32[(($564)>>2)]=$557;
   var $565=(($557+24)|0);
   HEAP32[(($565)>>2)]=$R_1_i122;
   label = 133; break;
  case 131: 
   _abort();
   throw "Reached an unreachable!";
  case 132: 
   _abort();
   throw "Reached an unreachable!";
  case 133: 
   var $569=(($rsize_3_lcssa_i)>>>(0)) < 16;
   if ($569) { label = 134; break; } else { label = 135; break; }
  case 134: 
   var $571=((($rsize_3_lcssa_i)+($349))|0);
   var $572=$571 | 3;
   var $573=(($v_3_lcssa_i+4)|0);
   HEAP32[(($573)>>2)]=$572;
   var $_sum19_i=((($571)+(4))|0);
   var $574=(($463+$_sum19_i)|0);
   var $575=$574;
   var $576=HEAP32[(($575)>>2)];
   var $577=$576 | 1;
   HEAP32[(($575)>>2)]=$577;
   label = 159; break;
  case 135: 
   var $579=$349 | 3;
   var $580=(($v_3_lcssa_i+4)|0);
   HEAP32[(($580)>>2)]=$579;
   var $581=$rsize_3_lcssa_i | 1;
   var $_sum_i125136=$349 | 4;
   var $582=(($463+$_sum_i125136)|0);
   var $583=$582;
   HEAP32[(($583)>>2)]=$581;
   var $_sum1_i126=((($rsize_3_lcssa_i)+($349))|0);
   var $584=(($463+$_sum1_i126)|0);
   var $585=$584;
   HEAP32[(($585)>>2)]=$rsize_3_lcssa_i;
   var $586=$rsize_3_lcssa_i >>> 3;
   var $587=(($rsize_3_lcssa_i)>>>(0)) < 256;
   if ($587) { label = 136; break; } else { label = 141; break; }
  case 136: 
   var $589=$586 << 1;
   var $590=((3304+($589<<2))|0);
   var $591=$590;
   var $592=HEAP32[((((3264)|0))>>2)];
   var $593=1 << $586;
   var $594=$592 & $593;
   var $595=(($594)|(0))==0;
   if ($595) { label = 137; break; } else { label = 138; break; }
  case 137: 
   var $597=$592 | $593;
   HEAP32[((((3264)|0))>>2)]=$597;
   var $_sum15_pre_i=((($589)+(2))|0);
   var $_pre_i127=((3304+($_sum15_pre_i<<2))|0);
   var $F5_0_i = $591;var $_pre_phi_i128 = $_pre_i127;label = 140; break;
  case 138: 
   var $_sum18_i=((($589)+(2))|0);
   var $599=((3304+($_sum18_i<<2))|0);
   var $600=HEAP32[(($599)>>2)];
   var $601=$600;
   var $602=HEAP32[((((3280)|0))>>2)];
   var $603=(($601)>>>(0)) < (($602)>>>(0));
   if ($603) { label = 139; break; } else { var $F5_0_i = $600;var $_pre_phi_i128 = $599;label = 140; break; }
  case 139: 
   _abort();
   throw "Reached an unreachable!";
  case 140: 
   var $_pre_phi_i128;
   var $F5_0_i;
   HEAP32[(($_pre_phi_i128)>>2)]=$468;
   var $606=(($F5_0_i+12)|0);
   HEAP32[(($606)>>2)]=$468;
   var $_sum16_i=((($349)+(8))|0);
   var $607=(($463+$_sum16_i)|0);
   var $608=$607;
   HEAP32[(($608)>>2)]=$F5_0_i;
   var $_sum17_i=((($349)+(12))|0);
   var $609=(($463+$_sum17_i)|0);
   var $610=$609;
   HEAP32[(($610)>>2)]=$591;
   label = 159; break;
  case 141: 
   var $612=$467;
   var $613=$rsize_3_lcssa_i >>> 8;
   var $614=(($613)|(0))==0;
   if ($614) { var $I7_0_i = 0;label = 144; break; } else { label = 142; break; }
  case 142: 
   var $616=(($rsize_3_lcssa_i)>>>(0)) > 16777215;
   if ($616) { var $I7_0_i = 31;label = 144; break; } else { label = 143; break; }
  case 143: 
   var $618=((($613)+(1048320))|0);
   var $619=$618 >>> 16;
   var $620=$619 & 8;
   var $621=$613 << $620;
   var $622=((($621)+(520192))|0);
   var $623=$622 >>> 16;
   var $624=$623 & 4;
   var $625=$624 | $620;
   var $626=$621 << $624;
   var $627=((($626)+(245760))|0);
   var $628=$627 >>> 16;
   var $629=$628 & 2;
   var $630=$625 | $629;
   var $631=(((14)-($630))|0);
   var $632=$626 << $629;
   var $633=$632 >>> 15;
   var $634=((($631)+($633))|0);
   var $635=$634 << 1;
   var $636=((($634)+(7))|0);
   var $637=$rsize_3_lcssa_i >>> (($636)>>>(0));
   var $638=$637 & 1;
   var $639=$638 | $635;
   var $I7_0_i = $639;label = 144; break;
  case 144: 
   var $I7_0_i;
   var $641=((3568+($I7_0_i<<2))|0);
   var $_sum2_i=((($349)+(28))|0);
   var $642=(($463+$_sum2_i)|0);
   var $643=$642;
   HEAP32[(($643)>>2)]=$I7_0_i;
   var $_sum3_i129=((($349)+(16))|0);
   var $644=(($463+$_sum3_i129)|0);
   var $_sum4_i130=((($349)+(20))|0);
   var $645=(($463+$_sum4_i130)|0);
   var $646=$645;
   HEAP32[(($646)>>2)]=0;
   var $647=$644;
   HEAP32[(($647)>>2)]=0;
   var $648=HEAP32[((((3268)|0))>>2)];
   var $649=1 << $I7_0_i;
   var $650=$648 & $649;
   var $651=(($650)|(0))==0;
   if ($651) { label = 145; break; } else { label = 146; break; }
  case 145: 
   var $653=$648 | $649;
   HEAP32[((((3268)|0))>>2)]=$653;
   HEAP32[(($641)>>2)]=$612;
   var $654=$641;
   var $_sum5_i=((($349)+(24))|0);
   var $655=(($463+$_sum5_i)|0);
   var $656=$655;
   HEAP32[(($656)>>2)]=$654;
   var $_sum6_i=((($349)+(12))|0);
   var $657=(($463+$_sum6_i)|0);
   var $658=$657;
   HEAP32[(($658)>>2)]=$612;
   var $_sum7_i=((($349)+(8))|0);
   var $659=(($463+$_sum7_i)|0);
   var $660=$659;
   HEAP32[(($660)>>2)]=$612;
   label = 159; break;
  case 146: 
   var $662=HEAP32[(($641)>>2)];
   var $663=(($I7_0_i)|(0))==31;
   if ($663) { var $668 = 0;label = 148; break; } else { label = 147; break; }
  case 147: 
   var $665=$I7_0_i >>> 1;
   var $666=(((25)-($665))|0);
   var $668 = $666;label = 148; break;
  case 148: 
   var $668;
   var $669=$rsize_3_lcssa_i << $668;
   var $K12_0_i = $669;var $T_0_i = $662;label = 149; break;
  case 149: 
   var $T_0_i;
   var $K12_0_i;
   var $671=(($T_0_i+4)|0);
   var $672=HEAP32[(($671)>>2)];
   var $673=$672 & -8;
   var $674=(($673)|(0))==(($rsize_3_lcssa_i)|(0));
   if ($674) { label = 154; break; } else { label = 150; break; }
  case 150: 
   var $676=$K12_0_i >>> 31;
   var $677=(($T_0_i+16+($676<<2))|0);
   var $678=HEAP32[(($677)>>2)];
   var $679=(($678)|(0))==0;
   var $680=$K12_0_i << 1;
   if ($679) { label = 151; break; } else { var $K12_0_i = $680;var $T_0_i = $678;label = 149; break; }
  case 151: 
   var $682=$677;
   var $683=HEAP32[((((3280)|0))>>2)];
   var $684=(($682)>>>(0)) < (($683)>>>(0));
   if ($684) { label = 153; break; } else { label = 152; break; }
  case 152: 
   HEAP32[(($677)>>2)]=$612;
   var $_sum12_i=((($349)+(24))|0);
   var $686=(($463+$_sum12_i)|0);
   var $687=$686;
   HEAP32[(($687)>>2)]=$T_0_i;
   var $_sum13_i=((($349)+(12))|0);
   var $688=(($463+$_sum13_i)|0);
   var $689=$688;
   HEAP32[(($689)>>2)]=$612;
   var $_sum14_i=((($349)+(8))|0);
   var $690=(($463+$_sum14_i)|0);
   var $691=$690;
   HEAP32[(($691)>>2)]=$612;
   label = 159; break;
  case 153: 
   _abort();
   throw "Reached an unreachable!";
  case 154: 
   var $694=(($T_0_i+8)|0);
   var $695=HEAP32[(($694)>>2)];
   var $696=$T_0_i;
   var $697=HEAP32[((((3280)|0))>>2)];
   var $698=(($696)>>>(0)) < (($697)>>>(0));
   if ($698) { label = 157; break; } else { label = 155; break; }
  case 155: 
   var $700=$695;
   var $701=(($700)>>>(0)) < (($697)>>>(0));
   if ($701) { label = 157; break; } else { label = 156; break; }
  case 156: 
   var $703=(($695+12)|0);
   HEAP32[(($703)>>2)]=$612;
   HEAP32[(($694)>>2)]=$612;
   var $_sum9_i=((($349)+(8))|0);
   var $704=(($463+$_sum9_i)|0);
   var $705=$704;
   HEAP32[(($705)>>2)]=$695;
   var $_sum10_i=((($349)+(12))|0);
   var $706=(($463+$_sum10_i)|0);
   var $707=$706;
   HEAP32[(($707)>>2)]=$T_0_i;
   var $_sum11_i=((($349)+(24))|0);
   var $708=(($463+$_sum11_i)|0);
   var $709=$708;
   HEAP32[(($709)>>2)]=0;
   label = 159; break;
  case 157: 
   _abort();
   throw "Reached an unreachable!";
  case 158: 
   _abort();
   throw "Reached an unreachable!";
  case 159: 
   var $711=(($v_3_lcssa_i+8)|0);
   var $712=$711;
   var $713=(($711)|(0))==0;
   if ($713) { var $nb_0 = $349;label = 160; break; } else { var $mem_0 = $712;label = 341; break; }
  case 160: 
   var $nb_0;
   var $714=HEAP32[((((3272)|0))>>2)];
   var $715=(($nb_0)>>>(0)) > (($714)>>>(0));
   if ($715) { label = 165; break; } else { label = 161; break; }
  case 161: 
   var $717=((($714)-($nb_0))|0);
   var $718=HEAP32[((((3284)|0))>>2)];
   var $719=(($717)>>>(0)) > 15;
   if ($719) { label = 162; break; } else { label = 163; break; }
  case 162: 
   var $721=$718;
   var $722=(($721+$nb_0)|0);
   var $723=$722;
   HEAP32[((((3284)|0))>>2)]=$723;
   HEAP32[((((3272)|0))>>2)]=$717;
   var $724=$717 | 1;
   var $_sum102=((($nb_0)+(4))|0);
   var $725=(($721+$_sum102)|0);
   var $726=$725;
   HEAP32[(($726)>>2)]=$724;
   var $727=(($721+$714)|0);
   var $728=$727;
   HEAP32[(($728)>>2)]=$717;
   var $729=$nb_0 | 3;
   var $730=(($718+4)|0);
   HEAP32[(($730)>>2)]=$729;
   label = 164; break;
  case 163: 
   HEAP32[((((3272)|0))>>2)]=0;
   HEAP32[((((3284)|0))>>2)]=0;
   var $732=$714 | 3;
   var $733=(($718+4)|0);
   HEAP32[(($733)>>2)]=$732;
   var $734=$718;
   var $_sum101=((($714)+(4))|0);
   var $735=(($734+$_sum101)|0);
   var $736=$735;
   var $737=HEAP32[(($736)>>2)];
   var $738=$737 | 1;
   HEAP32[(($736)>>2)]=$738;
   label = 164; break;
  case 164: 
   var $740=(($718+8)|0);
   var $741=$740;
   var $mem_0 = $741;label = 341; break;
  case 165: 
   var $743=HEAP32[((((3276)|0))>>2)];
   var $744=(($nb_0)>>>(0)) < (($743)>>>(0));
   if ($744) { label = 166; break; } else { label = 167; break; }
  case 166: 
   var $746=((($743)-($nb_0))|0);
   HEAP32[((((3276)|0))>>2)]=$746;
   var $747=HEAP32[((((3288)|0))>>2)];
   var $748=$747;
   var $749=(($748+$nb_0)|0);
   var $750=$749;
   HEAP32[((((3288)|0))>>2)]=$750;
   var $751=$746 | 1;
   var $_sum=((($nb_0)+(4))|0);
   var $752=(($748+$_sum)|0);
   var $753=$752;
   HEAP32[(($753)>>2)]=$751;
   var $754=$nb_0 | 3;
   var $755=(($747+4)|0);
   HEAP32[(($755)>>2)]=$754;
   var $756=(($747+8)|0);
   var $757=$756;
   var $mem_0 = $757;label = 341; break;
  case 167: 
   var $759=HEAP32[((((3224)|0))>>2)];
   var $760=(($759)|(0))==0;
   if ($760) { label = 168; break; } else { label = 171; break; }
  case 168: 
   var $762=_sysconf(8);
   var $763=((($762)-(1))|0);
   var $764=$763 & $762;
   var $765=(($764)|(0))==0;
   if ($765) { label = 170; break; } else { label = 169; break; }
  case 169: 
   _abort();
   throw "Reached an unreachable!";
  case 170: 
   HEAP32[((((3232)|0))>>2)]=$762;
   HEAP32[((((3228)|0))>>2)]=$762;
   HEAP32[((((3236)|0))>>2)]=-1;
   HEAP32[((((3240)|0))>>2)]=-1;
   HEAP32[((((3244)|0))>>2)]=0;
   HEAP32[((((3708)|0))>>2)]=0;
   var $767=_time(0);
   var $768=$767 & -16;
   var $769=$768 ^ 1431655768;
   HEAP32[((((3224)|0))>>2)]=$769;
   label = 171; break;
  case 171: 
   var $771=((($nb_0)+(48))|0);
   var $772=HEAP32[((((3232)|0))>>2)];
   var $773=((($nb_0)+(47))|0);
   var $774=((($772)+($773))|0);
   var $775=(((-$772))|0);
   var $776=$774 & $775;
   var $777=(($776)>>>(0)) > (($nb_0)>>>(0));
   if ($777) { label = 172; break; } else { var $mem_0 = 0;label = 341; break; }
  case 172: 
   var $779=HEAP32[((((3704)|0))>>2)];
   var $780=(($779)|(0))==0;
   if ($780) { label = 174; break; } else { label = 173; break; }
  case 173: 
   var $782=HEAP32[((((3696)|0))>>2)];
   var $783=((($782)+($776))|0);
   var $784=(($783)>>>(0)) <= (($782)>>>(0));
   var $785=(($783)>>>(0)) > (($779)>>>(0));
   var $or_cond1_i=$784 | $785;
   if ($or_cond1_i) { var $mem_0 = 0;label = 341; break; } else { label = 174; break; }
  case 174: 
   var $787=HEAP32[((((3708)|0))>>2)];
   var $788=$787 & 4;
   var $789=(($788)|(0))==0;
   if ($789) { label = 175; break; } else { var $tsize_1_i = 0;label = 198; break; }
  case 175: 
   var $791=HEAP32[((((3288)|0))>>2)];
   var $792=(($791)|(0))==0;
   if ($792) { label = 181; break; } else { label = 176; break; }
  case 176: 
   var $794=$791;
   var $sp_0_i_i = ((3712)|0);label = 177; break;
  case 177: 
   var $sp_0_i_i;
   var $796=(($sp_0_i_i)|0);
   var $797=HEAP32[(($796)>>2)];
   var $798=(($797)>>>(0)) > (($794)>>>(0));
   if ($798) { label = 179; break; } else { label = 178; break; }
  case 178: 
   var $800=(($sp_0_i_i+4)|0);
   var $801=HEAP32[(($800)>>2)];
   var $802=(($797+$801)|0);
   var $803=(($802)>>>(0)) > (($794)>>>(0));
   if ($803) { label = 180; break; } else { label = 179; break; }
  case 179: 
   var $805=(($sp_0_i_i+8)|0);
   var $806=HEAP32[(($805)>>2)];
   var $807=(($806)|(0))==0;
   if ($807) { label = 181; break; } else { var $sp_0_i_i = $806;label = 177; break; }
  case 180: 
   var $808=(($sp_0_i_i)|(0))==0;
   if ($808) { label = 181; break; } else { label = 188; break; }
  case 181: 
   var $809=_sbrk(0);
   var $810=(($809)|(0))==-1;
   if ($810) { var $tsize_0303639_i = 0;label = 197; break; } else { label = 182; break; }
  case 182: 
   var $812=$809;
   var $813=HEAP32[((((3228)|0))>>2)];
   var $814=((($813)-(1))|0);
   var $815=$814 & $812;
   var $816=(($815)|(0))==0;
   if ($816) { var $ssize_0_i = $776;label = 184; break; } else { label = 183; break; }
  case 183: 
   var $818=((($814)+($812))|0);
   var $819=(((-$813))|0);
   var $820=$818 & $819;
   var $821=((($776)-($812))|0);
   var $822=((($821)+($820))|0);
   var $ssize_0_i = $822;label = 184; break;
  case 184: 
   var $ssize_0_i;
   var $824=HEAP32[((((3696)|0))>>2)];
   var $825=((($824)+($ssize_0_i))|0);
   var $826=(($ssize_0_i)>>>(0)) > (($nb_0)>>>(0));
   var $827=(($ssize_0_i)>>>(0)) < 2147483647;
   var $or_cond_i131=$826 & $827;
   if ($or_cond_i131) { label = 185; break; } else { var $tsize_0303639_i = 0;label = 197; break; }
  case 185: 
   var $829=HEAP32[((((3704)|0))>>2)];
   var $830=(($829)|(0))==0;
   if ($830) { label = 187; break; } else { label = 186; break; }
  case 186: 
   var $832=(($825)>>>(0)) <= (($824)>>>(0));
   var $833=(($825)>>>(0)) > (($829)>>>(0));
   var $or_cond2_i=$832 | $833;
   if ($or_cond2_i) { var $tsize_0303639_i = 0;label = 197; break; } else { label = 187; break; }
  case 187: 
   var $835=_sbrk($ssize_0_i);
   var $836=(($835)|(0))==(($809)|(0));
   var $ssize_0__i=$836 ? $ssize_0_i : 0;
   var $__i=$836 ? $809 : -1;
   var $tbase_0_i = $__i;var $tsize_0_i = $ssize_0__i;var $br_0_i = $835;var $ssize_1_i = $ssize_0_i;label = 190; break;
  case 188: 
   var $838=HEAP32[((((3276)|0))>>2)];
   var $839=((($774)-($838))|0);
   var $840=$839 & $775;
   var $841=(($840)>>>(0)) < 2147483647;
   if ($841) { label = 189; break; } else { var $tsize_0303639_i = 0;label = 197; break; }
  case 189: 
   var $843=_sbrk($840);
   var $844=HEAP32[(($796)>>2)];
   var $845=HEAP32[(($800)>>2)];
   var $846=(($844+$845)|0);
   var $847=(($843)|(0))==(($846)|(0));
   var $_3_i=$847 ? $840 : 0;
   var $_4_i=$847 ? $843 : -1;
   var $tbase_0_i = $_4_i;var $tsize_0_i = $_3_i;var $br_0_i = $843;var $ssize_1_i = $840;label = 190; break;
  case 190: 
   var $ssize_1_i;
   var $br_0_i;
   var $tsize_0_i;
   var $tbase_0_i;
   var $849=(((-$ssize_1_i))|0);
   var $850=(($tbase_0_i)|(0))==-1;
   if ($850) { label = 191; break; } else { var $tsize_244_i = $tsize_0_i;var $tbase_245_i = $tbase_0_i;label = 201; break; }
  case 191: 
   var $852=(($br_0_i)|(0))!=-1;
   var $853=(($ssize_1_i)>>>(0)) < 2147483647;
   var $or_cond5_i=$852 & $853;
   var $854=(($ssize_1_i)>>>(0)) < (($771)>>>(0));
   var $or_cond6_i=$or_cond5_i & $854;
   if ($or_cond6_i) { label = 192; break; } else { var $ssize_2_i = $ssize_1_i;label = 196; break; }
  case 192: 
   var $856=HEAP32[((((3232)|0))>>2)];
   var $857=((($773)-($ssize_1_i))|0);
   var $858=((($857)+($856))|0);
   var $859=(((-$856))|0);
   var $860=$858 & $859;
   var $861=(($860)>>>(0)) < 2147483647;
   if ($861) { label = 193; break; } else { var $ssize_2_i = $ssize_1_i;label = 196; break; }
  case 193: 
   var $863=_sbrk($860);
   var $864=(($863)|(0))==-1;
   if ($864) { label = 195; break; } else { label = 194; break; }
  case 194: 
   var $866=((($860)+($ssize_1_i))|0);
   var $ssize_2_i = $866;label = 196; break;
  case 195: 
   var $868=_sbrk($849);
   var $tsize_0303639_i = $tsize_0_i;label = 197; break;
  case 196: 
   var $ssize_2_i;
   var $870=(($br_0_i)|(0))==-1;
   if ($870) { var $tsize_0303639_i = $tsize_0_i;label = 197; break; } else { var $tsize_244_i = $ssize_2_i;var $tbase_245_i = $br_0_i;label = 201; break; }
  case 197: 
   var $tsize_0303639_i;
   var $871=HEAP32[((((3708)|0))>>2)];
   var $872=$871 | 4;
   HEAP32[((((3708)|0))>>2)]=$872;
   var $tsize_1_i = $tsize_0303639_i;label = 198; break;
  case 198: 
   var $tsize_1_i;
   var $874=(($776)>>>(0)) < 2147483647;
   if ($874) { label = 199; break; } else { label = 340; break; }
  case 199: 
   var $876=_sbrk($776);
   var $877=_sbrk(0);
   var $notlhs_i=(($876)|(0))!=-1;
   var $notrhs_i=(($877)|(0))!=-1;
   var $or_cond8_not_i=$notrhs_i & $notlhs_i;
   var $878=(($876)>>>(0)) < (($877)>>>(0));
   var $or_cond9_i=$or_cond8_not_i & $878;
   if ($or_cond9_i) { label = 200; break; } else { label = 340; break; }
  case 200: 
   var $879=$877;
   var $880=$876;
   var $881=((($879)-($880))|0);
   var $882=((($nb_0)+(40))|0);
   var $883=(($881)>>>(0)) > (($882)>>>(0));
   var $_tsize_1_i=$883 ? $881 : $tsize_1_i;
   var $_tbase_1_i=$883 ? $876 : -1;
   var $884=(($_tbase_1_i)|(0))==-1;
   if ($884) { label = 340; break; } else { var $tsize_244_i = $_tsize_1_i;var $tbase_245_i = $_tbase_1_i;label = 201; break; }
  case 201: 
   var $tbase_245_i;
   var $tsize_244_i;
   var $885=HEAP32[((((3696)|0))>>2)];
   var $886=((($885)+($tsize_244_i))|0);
   HEAP32[((((3696)|0))>>2)]=$886;
   var $887=HEAP32[((((3700)|0))>>2)];
   var $888=(($886)>>>(0)) > (($887)>>>(0));
   if ($888) { label = 202; break; } else { label = 203; break; }
  case 202: 
   HEAP32[((((3700)|0))>>2)]=$886;
   label = 203; break;
  case 203: 
   var $890=HEAP32[((((3288)|0))>>2)];
   var $891=(($890)|(0))==0;
   if ($891) { label = 204; break; } else { var $sp_067_i = ((3712)|0);label = 211; break; }
  case 204: 
   var $893=HEAP32[((((3280)|0))>>2)];
   var $894=(($893)|(0))==0;
   var $895=(($tbase_245_i)>>>(0)) < (($893)>>>(0));
   var $or_cond10_i=$894 | $895;
   if ($or_cond10_i) { label = 205; break; } else { label = 206; break; }
  case 205: 
   HEAP32[((((3280)|0))>>2)]=$tbase_245_i;
   label = 206; break;
  case 206: 
   HEAP32[((((3712)|0))>>2)]=$tbase_245_i;
   HEAP32[((((3716)|0))>>2)]=$tsize_244_i;
   HEAP32[((((3724)|0))>>2)]=0;
   var $897=HEAP32[((((3224)|0))>>2)];
   HEAP32[((((3300)|0))>>2)]=$897;
   HEAP32[((((3296)|0))>>2)]=-1;
   var $i_02_i_i = 0;label = 207; break;
  case 207: 
   var $i_02_i_i;
   var $899=$i_02_i_i << 1;
   var $900=((3304+($899<<2))|0);
   var $901=$900;
   var $_sum_i_i=((($899)+(3))|0);
   var $902=((3304+($_sum_i_i<<2))|0);
   HEAP32[(($902)>>2)]=$901;
   var $_sum1_i_i=((($899)+(2))|0);
   var $903=((3304+($_sum1_i_i<<2))|0);
   HEAP32[(($903)>>2)]=$901;
   var $904=((($i_02_i_i)+(1))|0);
   var $905=(($904)>>>(0)) < 32;
   if ($905) { var $i_02_i_i = $904;label = 207; break; } else { label = 208; break; }
  case 208: 
   var $906=((($tsize_244_i)-(40))|0);
   var $907=(($tbase_245_i+8)|0);
   var $908=$907;
   var $909=$908 & 7;
   var $910=(($909)|(0))==0;
   if ($910) { var $914 = 0;label = 210; break; } else { label = 209; break; }
  case 209: 
   var $912=(((-$908))|0);
   var $913=$912 & 7;
   var $914 = $913;label = 210; break;
  case 210: 
   var $914;
   var $915=(($tbase_245_i+$914)|0);
   var $916=$915;
   var $917=((($906)-($914))|0);
   HEAP32[((((3288)|0))>>2)]=$916;
   HEAP32[((((3276)|0))>>2)]=$917;
   var $918=$917 | 1;
   var $_sum_i14_i=((($914)+(4))|0);
   var $919=(($tbase_245_i+$_sum_i14_i)|0);
   var $920=$919;
   HEAP32[(($920)>>2)]=$918;
   var $_sum2_i_i=((($tsize_244_i)-(36))|0);
   var $921=(($tbase_245_i+$_sum2_i_i)|0);
   var $922=$921;
   HEAP32[(($922)>>2)]=40;
   var $923=HEAP32[((((3240)|0))>>2)];
   HEAP32[((((3292)|0))>>2)]=$923;
   label = 338; break;
  case 211: 
   var $sp_067_i;
   var $924=(($sp_067_i)|0);
   var $925=HEAP32[(($924)>>2)];
   var $926=(($sp_067_i+4)|0);
   var $927=HEAP32[(($926)>>2)];
   var $928=(($925+$927)|0);
   var $929=(($tbase_245_i)|(0))==(($928)|(0));
   if ($929) { label = 213; break; } else { label = 212; break; }
  case 212: 
   var $931=(($sp_067_i+8)|0);
   var $932=HEAP32[(($931)>>2)];
   var $933=(($932)|(0))==0;
   if ($933) { label = 218; break; } else { var $sp_067_i = $932;label = 211; break; }
  case 213: 
   var $934=(($sp_067_i+12)|0);
   var $935=HEAP32[(($934)>>2)];
   var $936=$935 & 8;
   var $937=(($936)|(0))==0;
   if ($937) { label = 214; break; } else { label = 218; break; }
  case 214: 
   var $939=$890;
   var $940=(($939)>>>(0)) >= (($925)>>>(0));
   var $941=(($939)>>>(0)) < (($tbase_245_i)>>>(0));
   var $or_cond47_i=$940 & $941;
   if ($or_cond47_i) { label = 215; break; } else { label = 218; break; }
  case 215: 
   var $943=((($927)+($tsize_244_i))|0);
   HEAP32[(($926)>>2)]=$943;
   var $944=HEAP32[((((3288)|0))>>2)];
   var $945=HEAP32[((((3276)|0))>>2)];
   var $946=((($945)+($tsize_244_i))|0);
   var $947=$944;
   var $948=(($944+8)|0);
   var $949=$948;
   var $950=$949 & 7;
   var $951=(($950)|(0))==0;
   if ($951) { var $955 = 0;label = 217; break; } else { label = 216; break; }
  case 216: 
   var $953=(((-$949))|0);
   var $954=$953 & 7;
   var $955 = $954;label = 217; break;
  case 217: 
   var $955;
   var $956=(($947+$955)|0);
   var $957=$956;
   var $958=((($946)-($955))|0);
   HEAP32[((((3288)|0))>>2)]=$957;
   HEAP32[((((3276)|0))>>2)]=$958;
   var $959=$958 | 1;
   var $_sum_i18_i=((($955)+(4))|0);
   var $960=(($947+$_sum_i18_i)|0);
   var $961=$960;
   HEAP32[(($961)>>2)]=$959;
   var $_sum2_i19_i=((($946)+(4))|0);
   var $962=(($947+$_sum2_i19_i)|0);
   var $963=$962;
   HEAP32[(($963)>>2)]=40;
   var $964=HEAP32[((((3240)|0))>>2)];
   HEAP32[((((3292)|0))>>2)]=$964;
   label = 338; break;
  case 218: 
   var $965=HEAP32[((((3280)|0))>>2)];
   var $966=(($tbase_245_i)>>>(0)) < (($965)>>>(0));
   if ($966) { label = 219; break; } else { label = 220; break; }
  case 219: 
   HEAP32[((((3280)|0))>>2)]=$tbase_245_i;
   label = 220; break;
  case 220: 
   var $968=(($tbase_245_i+$tsize_244_i)|0);
   var $sp_160_i = ((3712)|0);label = 221; break;
  case 221: 
   var $sp_160_i;
   var $970=(($sp_160_i)|0);
   var $971=HEAP32[(($970)>>2)];
   var $972=(($971)|(0))==(($968)|(0));
   if ($972) { label = 223; break; } else { label = 222; break; }
  case 222: 
   var $974=(($sp_160_i+8)|0);
   var $975=HEAP32[(($974)>>2)];
   var $976=(($975)|(0))==0;
   if ($976) { label = 304; break; } else { var $sp_160_i = $975;label = 221; break; }
  case 223: 
   var $977=(($sp_160_i+12)|0);
   var $978=HEAP32[(($977)>>2)];
   var $979=$978 & 8;
   var $980=(($979)|(0))==0;
   if ($980) { label = 224; break; } else { label = 304; break; }
  case 224: 
   HEAP32[(($970)>>2)]=$tbase_245_i;
   var $982=(($sp_160_i+4)|0);
   var $983=HEAP32[(($982)>>2)];
   var $984=((($983)+($tsize_244_i))|0);
   HEAP32[(($982)>>2)]=$984;
   var $985=(($tbase_245_i+8)|0);
   var $986=$985;
   var $987=$986 & 7;
   var $988=(($987)|(0))==0;
   if ($988) { var $993 = 0;label = 226; break; } else { label = 225; break; }
  case 225: 
   var $990=(((-$986))|0);
   var $991=$990 & 7;
   var $993 = $991;label = 226; break;
  case 226: 
   var $993;
   var $994=(($tbase_245_i+$993)|0);
   var $_sum93_i=((($tsize_244_i)+(8))|0);
   var $995=(($tbase_245_i+$_sum93_i)|0);
   var $996=$995;
   var $997=$996 & 7;
   var $998=(($997)|(0))==0;
   if ($998) { var $1003 = 0;label = 228; break; } else { label = 227; break; }
  case 227: 
   var $1000=(((-$996))|0);
   var $1001=$1000 & 7;
   var $1003 = $1001;label = 228; break;
  case 228: 
   var $1003;
   var $_sum94_i=((($1003)+($tsize_244_i))|0);
   var $1004=(($tbase_245_i+$_sum94_i)|0);
   var $1005=$1004;
   var $1006=$1004;
   var $1007=$994;
   var $1008=((($1006)-($1007))|0);
   var $_sum_i21_i=((($993)+($nb_0))|0);
   var $1009=(($tbase_245_i+$_sum_i21_i)|0);
   var $1010=$1009;
   var $1011=((($1008)-($nb_0))|0);
   var $1012=$nb_0 | 3;
   var $_sum1_i22_i=((($993)+(4))|0);
   var $1013=(($tbase_245_i+$_sum1_i22_i)|0);
   var $1014=$1013;
   HEAP32[(($1014)>>2)]=$1012;
   var $1015=HEAP32[((((3288)|0))>>2)];
   var $1016=(($1005)|(0))==(($1015)|(0));
   if ($1016) { label = 229; break; } else { label = 230; break; }
  case 229: 
   var $1018=HEAP32[((((3276)|0))>>2)];
   var $1019=((($1018)+($1011))|0);
   HEAP32[((((3276)|0))>>2)]=$1019;
   HEAP32[((((3288)|0))>>2)]=$1010;
   var $1020=$1019 | 1;
   var $_sum46_i_i=((($_sum_i21_i)+(4))|0);
   var $1021=(($tbase_245_i+$_sum46_i_i)|0);
   var $1022=$1021;
   HEAP32[(($1022)>>2)]=$1020;
   label = 303; break;
  case 230: 
   var $1024=HEAP32[((((3284)|0))>>2)];
   var $1025=(($1005)|(0))==(($1024)|(0));
   if ($1025) { label = 231; break; } else { label = 232; break; }
  case 231: 
   var $1027=HEAP32[((((3272)|0))>>2)];
   var $1028=((($1027)+($1011))|0);
   HEAP32[((((3272)|0))>>2)]=$1028;
   HEAP32[((((3284)|0))>>2)]=$1010;
   var $1029=$1028 | 1;
   var $_sum44_i_i=((($_sum_i21_i)+(4))|0);
   var $1030=(($tbase_245_i+$_sum44_i_i)|0);
   var $1031=$1030;
   HEAP32[(($1031)>>2)]=$1029;
   var $_sum45_i_i=((($1028)+($_sum_i21_i))|0);
   var $1032=(($tbase_245_i+$_sum45_i_i)|0);
   var $1033=$1032;
   HEAP32[(($1033)>>2)]=$1028;
   label = 303; break;
  case 232: 
   var $_sum2_i23_i=((($tsize_244_i)+(4))|0);
   var $_sum95_i=((($_sum2_i23_i)+($1003))|0);
   var $1035=(($tbase_245_i+$_sum95_i)|0);
   var $1036=$1035;
   var $1037=HEAP32[(($1036)>>2)];
   var $1038=$1037 & 3;
   var $1039=(($1038)|(0))==1;
   if ($1039) { label = 233; break; } else { var $oldfirst_0_i_i = $1005;var $qsize_0_i_i = $1011;label = 280; break; }
  case 233: 
   var $1041=$1037 & -8;
   var $1042=$1037 >>> 3;
   var $1043=(($1037)>>>(0)) < 256;
   if ($1043) { label = 234; break; } else { label = 246; break; }
  case 234: 
   var $_sum3940_i_i=$1003 | 8;
   var $_sum105_i=((($_sum3940_i_i)+($tsize_244_i))|0);
   var $1045=(($tbase_245_i+$_sum105_i)|0);
   var $1046=$1045;
   var $1047=HEAP32[(($1046)>>2)];
   var $_sum41_i_i=((($tsize_244_i)+(12))|0);
   var $_sum106_i=((($_sum41_i_i)+($1003))|0);
   var $1048=(($tbase_245_i+$_sum106_i)|0);
   var $1049=$1048;
   var $1050=HEAP32[(($1049)>>2)];
   var $1051=$1042 << 1;
   var $1052=((3304+($1051<<2))|0);
   var $1053=$1052;
   var $1054=(($1047)|(0))==(($1053)|(0));
   if ($1054) { label = 237; break; } else { label = 235; break; }
  case 235: 
   var $1056=$1047;
   var $1057=HEAP32[((((3280)|0))>>2)];
   var $1058=(($1056)>>>(0)) < (($1057)>>>(0));
   if ($1058) { label = 245; break; } else { label = 236; break; }
  case 236: 
   var $1060=(($1047+12)|0);
   var $1061=HEAP32[(($1060)>>2)];
   var $1062=(($1061)|(0))==(($1005)|(0));
   if ($1062) { label = 237; break; } else { label = 245; break; }
  case 237: 
   var $1063=(($1050)|(0))==(($1047)|(0));
   if ($1063) { label = 238; break; } else { label = 239; break; }
  case 238: 
   var $1065=1 << $1042;
   var $1066=$1065 ^ -1;
   var $1067=HEAP32[((((3264)|0))>>2)];
   var $1068=$1067 & $1066;
   HEAP32[((((3264)|0))>>2)]=$1068;
   label = 279; break;
  case 239: 
   var $1070=(($1050)|(0))==(($1053)|(0));
   if ($1070) { label = 240; break; } else { label = 241; break; }
  case 240: 
   var $_pre56_i_i=(($1050+8)|0);
   var $_pre_phi57_i_i = $_pre56_i_i;label = 243; break;
  case 241: 
   var $1072=$1050;
   var $1073=HEAP32[((((3280)|0))>>2)];
   var $1074=(($1072)>>>(0)) < (($1073)>>>(0));
   if ($1074) { label = 244; break; } else { label = 242; break; }
  case 242: 
   var $1076=(($1050+8)|0);
   var $1077=HEAP32[(($1076)>>2)];
   var $1078=(($1077)|(0))==(($1005)|(0));
   if ($1078) { var $_pre_phi57_i_i = $1076;label = 243; break; } else { label = 244; break; }
  case 243: 
   var $_pre_phi57_i_i;
   var $1079=(($1047+12)|0);
   HEAP32[(($1079)>>2)]=$1050;
   HEAP32[(($_pre_phi57_i_i)>>2)]=$1047;
   label = 279; break;
  case 244: 
   _abort();
   throw "Reached an unreachable!";
  case 245: 
   _abort();
   throw "Reached an unreachable!";
  case 246: 
   var $1081=$1004;
   var $_sum34_i_i=$1003 | 24;
   var $_sum96_i=((($_sum34_i_i)+($tsize_244_i))|0);
   var $1082=(($tbase_245_i+$_sum96_i)|0);
   var $1083=$1082;
   var $1084=HEAP32[(($1083)>>2)];
   var $_sum5_i_i=((($tsize_244_i)+(12))|0);
   var $_sum97_i=((($_sum5_i_i)+($1003))|0);
   var $1085=(($tbase_245_i+$_sum97_i)|0);
   var $1086=$1085;
   var $1087=HEAP32[(($1086)>>2)];
   var $1088=(($1087)|(0))==(($1081)|(0));
   if ($1088) { label = 252; break; } else { label = 247; break; }
  case 247: 
   var $_sum3637_i_i=$1003 | 8;
   var $_sum98_i=((($_sum3637_i_i)+($tsize_244_i))|0);
   var $1090=(($tbase_245_i+$_sum98_i)|0);
   var $1091=$1090;
   var $1092=HEAP32[(($1091)>>2)];
   var $1093=$1092;
   var $1094=HEAP32[((((3280)|0))>>2)];
   var $1095=(($1093)>>>(0)) < (($1094)>>>(0));
   if ($1095) { label = 251; break; } else { label = 248; break; }
  case 248: 
   var $1097=(($1092+12)|0);
   var $1098=HEAP32[(($1097)>>2)];
   var $1099=(($1098)|(0))==(($1081)|(0));
   if ($1099) { label = 249; break; } else { label = 251; break; }
  case 249: 
   var $1101=(($1087+8)|0);
   var $1102=HEAP32[(($1101)>>2)];
   var $1103=(($1102)|(0))==(($1081)|(0));
   if ($1103) { label = 250; break; } else { label = 251; break; }
  case 250: 
   HEAP32[(($1097)>>2)]=$1087;
   HEAP32[(($1101)>>2)]=$1092;
   var $R_1_i_i = $1087;label = 259; break;
  case 251: 
   _abort();
   throw "Reached an unreachable!";
  case 252: 
   var $_sum67_i_i=$1003 | 16;
   var $_sum103_i=((($_sum2_i23_i)+($_sum67_i_i))|0);
   var $1106=(($tbase_245_i+$_sum103_i)|0);
   var $1107=$1106;
   var $1108=HEAP32[(($1107)>>2)];
   var $1109=(($1108)|(0))==0;
   if ($1109) { label = 253; break; } else { var $R_0_i_i = $1108;var $RP_0_i_i = $1107;label = 254; break; }
  case 253: 
   var $_sum104_i=((($_sum67_i_i)+($tsize_244_i))|0);
   var $1111=(($tbase_245_i+$_sum104_i)|0);
   var $1112=$1111;
   var $1113=HEAP32[(($1112)>>2)];
   var $1114=(($1113)|(0))==0;
   if ($1114) { var $R_1_i_i = 0;label = 259; break; } else { var $R_0_i_i = $1113;var $RP_0_i_i = $1112;label = 254; break; }
  case 254: 
   var $RP_0_i_i;
   var $R_0_i_i;
   var $1115=(($R_0_i_i+20)|0);
   var $1116=HEAP32[(($1115)>>2)];
   var $1117=(($1116)|(0))==0;
   if ($1117) { label = 255; break; } else { var $R_0_i_i = $1116;var $RP_0_i_i = $1115;label = 254; break; }
  case 255: 
   var $1119=(($R_0_i_i+16)|0);
   var $1120=HEAP32[(($1119)>>2)];
   var $1121=(($1120)|(0))==0;
   if ($1121) { label = 256; break; } else { var $R_0_i_i = $1120;var $RP_0_i_i = $1119;label = 254; break; }
  case 256: 
   var $1123=$RP_0_i_i;
   var $1124=HEAP32[((((3280)|0))>>2)];
   var $1125=(($1123)>>>(0)) < (($1124)>>>(0));
   if ($1125) { label = 258; break; } else { label = 257; break; }
  case 257: 
   HEAP32[(($RP_0_i_i)>>2)]=0;
   var $R_1_i_i = $R_0_i_i;label = 259; break;
  case 258: 
   _abort();
   throw "Reached an unreachable!";
  case 259: 
   var $R_1_i_i;
   var $1129=(($1084)|(0))==0;
   if ($1129) { label = 279; break; } else { label = 260; break; }
  case 260: 
   var $_sum31_i_i=((($tsize_244_i)+(28))|0);
   var $_sum99_i=((($_sum31_i_i)+($1003))|0);
   var $1131=(($tbase_245_i+$_sum99_i)|0);
   var $1132=$1131;
   var $1133=HEAP32[(($1132)>>2)];
   var $1134=((3568+($1133<<2))|0);
   var $1135=HEAP32[(($1134)>>2)];
   var $1136=(($1081)|(0))==(($1135)|(0));
   if ($1136) { label = 261; break; } else { label = 263; break; }
  case 261: 
   HEAP32[(($1134)>>2)]=$R_1_i_i;
   var $cond_i_i=(($R_1_i_i)|(0))==0;
   if ($cond_i_i) { label = 262; break; } else { label = 269; break; }
  case 262: 
   var $1138=HEAP32[(($1132)>>2)];
   var $1139=1 << $1138;
   var $1140=$1139 ^ -1;
   var $1141=HEAP32[((((3268)|0))>>2)];
   var $1142=$1141 & $1140;
   HEAP32[((((3268)|0))>>2)]=$1142;
   label = 279; break;
  case 263: 
   var $1144=$1084;
   var $1145=HEAP32[((((3280)|0))>>2)];
   var $1146=(($1144)>>>(0)) < (($1145)>>>(0));
   if ($1146) { label = 267; break; } else { label = 264; break; }
  case 264: 
   var $1148=(($1084+16)|0);
   var $1149=HEAP32[(($1148)>>2)];
   var $1150=(($1149)|(0))==(($1081)|(0));
   if ($1150) { label = 265; break; } else { label = 266; break; }
  case 265: 
   HEAP32[(($1148)>>2)]=$R_1_i_i;
   label = 268; break;
  case 266: 
   var $1153=(($1084+20)|0);
   HEAP32[(($1153)>>2)]=$R_1_i_i;
   label = 268; break;
  case 267: 
   _abort();
   throw "Reached an unreachable!";
  case 268: 
   var $1156=(($R_1_i_i)|(0))==0;
   if ($1156) { label = 279; break; } else { label = 269; break; }
  case 269: 
   var $1158=$R_1_i_i;
   var $1159=HEAP32[((((3280)|0))>>2)];
   var $1160=(($1158)>>>(0)) < (($1159)>>>(0));
   if ($1160) { label = 278; break; } else { label = 270; break; }
  case 270: 
   var $1162=(($R_1_i_i+24)|0);
   HEAP32[(($1162)>>2)]=$1084;
   var $_sum3233_i_i=$1003 | 16;
   var $_sum100_i=((($_sum3233_i_i)+($tsize_244_i))|0);
   var $1163=(($tbase_245_i+$_sum100_i)|0);
   var $1164=$1163;
   var $1165=HEAP32[(($1164)>>2)];
   var $1166=(($1165)|(0))==0;
   if ($1166) { label = 274; break; } else { label = 271; break; }
  case 271: 
   var $1168=$1165;
   var $1169=HEAP32[((((3280)|0))>>2)];
   var $1170=(($1168)>>>(0)) < (($1169)>>>(0));
   if ($1170) { label = 273; break; } else { label = 272; break; }
  case 272: 
   var $1172=(($R_1_i_i+16)|0);
   HEAP32[(($1172)>>2)]=$1165;
   var $1173=(($1165+24)|0);
   HEAP32[(($1173)>>2)]=$R_1_i_i;
   label = 274; break;
  case 273: 
   _abort();
   throw "Reached an unreachable!";
  case 274: 
   var $_sum101_i=((($_sum2_i23_i)+($_sum3233_i_i))|0);
   var $1176=(($tbase_245_i+$_sum101_i)|0);
   var $1177=$1176;
   var $1178=HEAP32[(($1177)>>2)];
   var $1179=(($1178)|(0))==0;
   if ($1179) { label = 279; break; } else { label = 275; break; }
  case 275: 
   var $1181=$1178;
   var $1182=HEAP32[((((3280)|0))>>2)];
   var $1183=(($1181)>>>(0)) < (($1182)>>>(0));
   if ($1183) { label = 277; break; } else { label = 276; break; }
  case 276: 
   var $1185=(($R_1_i_i+20)|0);
   HEAP32[(($1185)>>2)]=$1178;
   var $1186=(($1178+24)|0);
   HEAP32[(($1186)>>2)]=$R_1_i_i;
   label = 279; break;
  case 277: 
   _abort();
   throw "Reached an unreachable!";
  case 278: 
   _abort();
   throw "Reached an unreachable!";
  case 279: 
   var $_sum9_i_i=$1041 | $1003;
   var $_sum102_i=((($_sum9_i_i)+($tsize_244_i))|0);
   var $1190=(($tbase_245_i+$_sum102_i)|0);
   var $1191=$1190;
   var $1192=((($1041)+($1011))|0);
   var $oldfirst_0_i_i = $1191;var $qsize_0_i_i = $1192;label = 280; break;
  case 280: 
   var $qsize_0_i_i;
   var $oldfirst_0_i_i;
   var $1194=(($oldfirst_0_i_i+4)|0);
   var $1195=HEAP32[(($1194)>>2)];
   var $1196=$1195 & -2;
   HEAP32[(($1194)>>2)]=$1196;
   var $1197=$qsize_0_i_i | 1;
   var $_sum10_i_i=((($_sum_i21_i)+(4))|0);
   var $1198=(($tbase_245_i+$_sum10_i_i)|0);
   var $1199=$1198;
   HEAP32[(($1199)>>2)]=$1197;
   var $_sum11_i_i=((($qsize_0_i_i)+($_sum_i21_i))|0);
   var $1200=(($tbase_245_i+$_sum11_i_i)|0);
   var $1201=$1200;
   HEAP32[(($1201)>>2)]=$qsize_0_i_i;
   var $1202=$qsize_0_i_i >>> 3;
   var $1203=(($qsize_0_i_i)>>>(0)) < 256;
   if ($1203) { label = 281; break; } else { label = 286; break; }
  case 281: 
   var $1205=$1202 << 1;
   var $1206=((3304+($1205<<2))|0);
   var $1207=$1206;
   var $1208=HEAP32[((((3264)|0))>>2)];
   var $1209=1 << $1202;
   var $1210=$1208 & $1209;
   var $1211=(($1210)|(0))==0;
   if ($1211) { label = 282; break; } else { label = 283; break; }
  case 282: 
   var $1213=$1208 | $1209;
   HEAP32[((((3264)|0))>>2)]=$1213;
   var $_sum27_pre_i_i=((($1205)+(2))|0);
   var $_pre_i24_i=((3304+($_sum27_pre_i_i<<2))|0);
   var $F4_0_i_i = $1207;var $_pre_phi_i25_i = $_pre_i24_i;label = 285; break;
  case 283: 
   var $_sum30_i_i=((($1205)+(2))|0);
   var $1215=((3304+($_sum30_i_i<<2))|0);
   var $1216=HEAP32[(($1215)>>2)];
   var $1217=$1216;
   var $1218=HEAP32[((((3280)|0))>>2)];
   var $1219=(($1217)>>>(0)) < (($1218)>>>(0));
   if ($1219) { label = 284; break; } else { var $F4_0_i_i = $1216;var $_pre_phi_i25_i = $1215;label = 285; break; }
  case 284: 
   _abort();
   throw "Reached an unreachable!";
  case 285: 
   var $_pre_phi_i25_i;
   var $F4_0_i_i;
   HEAP32[(($_pre_phi_i25_i)>>2)]=$1010;
   var $1222=(($F4_0_i_i+12)|0);
   HEAP32[(($1222)>>2)]=$1010;
   var $_sum28_i_i=((($_sum_i21_i)+(8))|0);
   var $1223=(($tbase_245_i+$_sum28_i_i)|0);
   var $1224=$1223;
   HEAP32[(($1224)>>2)]=$F4_0_i_i;
   var $_sum29_i_i=((($_sum_i21_i)+(12))|0);
   var $1225=(($tbase_245_i+$_sum29_i_i)|0);
   var $1226=$1225;
   HEAP32[(($1226)>>2)]=$1207;
   label = 303; break;
  case 286: 
   var $1228=$1009;
   var $1229=$qsize_0_i_i >>> 8;
   var $1230=(($1229)|(0))==0;
   if ($1230) { var $I7_0_i_i = 0;label = 289; break; } else { label = 287; break; }
  case 287: 
   var $1232=(($qsize_0_i_i)>>>(0)) > 16777215;
   if ($1232) { var $I7_0_i_i = 31;label = 289; break; } else { label = 288; break; }
  case 288: 
   var $1234=((($1229)+(1048320))|0);
   var $1235=$1234 >>> 16;
   var $1236=$1235 & 8;
   var $1237=$1229 << $1236;
   var $1238=((($1237)+(520192))|0);
   var $1239=$1238 >>> 16;
   var $1240=$1239 & 4;
   var $1241=$1240 | $1236;
   var $1242=$1237 << $1240;
   var $1243=((($1242)+(245760))|0);
   var $1244=$1243 >>> 16;
   var $1245=$1244 & 2;
   var $1246=$1241 | $1245;
   var $1247=(((14)-($1246))|0);
   var $1248=$1242 << $1245;
   var $1249=$1248 >>> 15;
   var $1250=((($1247)+($1249))|0);
   var $1251=$1250 << 1;
   var $1252=((($1250)+(7))|0);
   var $1253=$qsize_0_i_i >>> (($1252)>>>(0));
   var $1254=$1253 & 1;
   var $1255=$1254 | $1251;
   var $I7_0_i_i = $1255;label = 289; break;
  case 289: 
   var $I7_0_i_i;
   var $1257=((3568+($I7_0_i_i<<2))|0);
   var $_sum12_i26_i=((($_sum_i21_i)+(28))|0);
   var $1258=(($tbase_245_i+$_sum12_i26_i)|0);
   var $1259=$1258;
   HEAP32[(($1259)>>2)]=$I7_0_i_i;
   var $_sum13_i_i=((($_sum_i21_i)+(16))|0);
   var $1260=(($tbase_245_i+$_sum13_i_i)|0);
   var $_sum14_i_i=((($_sum_i21_i)+(20))|0);
   var $1261=(($tbase_245_i+$_sum14_i_i)|0);
   var $1262=$1261;
   HEAP32[(($1262)>>2)]=0;
   var $1263=$1260;
   HEAP32[(($1263)>>2)]=0;
   var $1264=HEAP32[((((3268)|0))>>2)];
   var $1265=1 << $I7_0_i_i;
   var $1266=$1264 & $1265;
   var $1267=(($1266)|(0))==0;
   if ($1267) { label = 290; break; } else { label = 291; break; }
  case 290: 
   var $1269=$1264 | $1265;
   HEAP32[((((3268)|0))>>2)]=$1269;
   HEAP32[(($1257)>>2)]=$1228;
   var $1270=$1257;
   var $_sum15_i_i=((($_sum_i21_i)+(24))|0);
   var $1271=(($tbase_245_i+$_sum15_i_i)|0);
   var $1272=$1271;
   HEAP32[(($1272)>>2)]=$1270;
   var $_sum16_i_i=((($_sum_i21_i)+(12))|0);
   var $1273=(($tbase_245_i+$_sum16_i_i)|0);
   var $1274=$1273;
   HEAP32[(($1274)>>2)]=$1228;
   var $_sum17_i_i=((($_sum_i21_i)+(8))|0);
   var $1275=(($tbase_245_i+$_sum17_i_i)|0);
   var $1276=$1275;
   HEAP32[(($1276)>>2)]=$1228;
   label = 303; break;
  case 291: 
   var $1278=HEAP32[(($1257)>>2)];
   var $1279=(($I7_0_i_i)|(0))==31;
   if ($1279) { var $1284 = 0;label = 293; break; } else { label = 292; break; }
  case 292: 
   var $1281=$I7_0_i_i >>> 1;
   var $1282=(((25)-($1281))|0);
   var $1284 = $1282;label = 293; break;
  case 293: 
   var $1284;
   var $1285=$qsize_0_i_i << $1284;
   var $K8_0_i_i = $1285;var $T_0_i27_i = $1278;label = 294; break;
  case 294: 
   var $T_0_i27_i;
   var $K8_0_i_i;
   var $1287=(($T_0_i27_i+4)|0);
   var $1288=HEAP32[(($1287)>>2)];
   var $1289=$1288 & -8;
   var $1290=(($1289)|(0))==(($qsize_0_i_i)|(0));
   if ($1290) { label = 299; break; } else { label = 295; break; }
  case 295: 
   var $1292=$K8_0_i_i >>> 31;
   var $1293=(($T_0_i27_i+16+($1292<<2))|0);
   var $1294=HEAP32[(($1293)>>2)];
   var $1295=(($1294)|(0))==0;
   var $1296=$K8_0_i_i << 1;
   if ($1295) { label = 296; break; } else { var $K8_0_i_i = $1296;var $T_0_i27_i = $1294;label = 294; break; }
  case 296: 
   var $1298=$1293;
   var $1299=HEAP32[((((3280)|0))>>2)];
   var $1300=(($1298)>>>(0)) < (($1299)>>>(0));
   if ($1300) { label = 298; break; } else { label = 297; break; }
  case 297: 
   HEAP32[(($1293)>>2)]=$1228;
   var $_sum24_i_i=((($_sum_i21_i)+(24))|0);
   var $1302=(($tbase_245_i+$_sum24_i_i)|0);
   var $1303=$1302;
   HEAP32[(($1303)>>2)]=$T_0_i27_i;
   var $_sum25_i_i=((($_sum_i21_i)+(12))|0);
   var $1304=(($tbase_245_i+$_sum25_i_i)|0);
   var $1305=$1304;
   HEAP32[(($1305)>>2)]=$1228;
   var $_sum26_i_i=((($_sum_i21_i)+(8))|0);
   var $1306=(($tbase_245_i+$_sum26_i_i)|0);
   var $1307=$1306;
   HEAP32[(($1307)>>2)]=$1228;
   label = 303; break;
  case 298: 
   _abort();
   throw "Reached an unreachable!";
  case 299: 
   var $1310=(($T_0_i27_i+8)|0);
   var $1311=HEAP32[(($1310)>>2)];
   var $1312=$T_0_i27_i;
   var $1313=HEAP32[((((3280)|0))>>2)];
   var $1314=(($1312)>>>(0)) < (($1313)>>>(0));
   if ($1314) { label = 302; break; } else { label = 300; break; }
  case 300: 
   var $1316=$1311;
   var $1317=(($1316)>>>(0)) < (($1313)>>>(0));
   if ($1317) { label = 302; break; } else { label = 301; break; }
  case 301: 
   var $1319=(($1311+12)|0);
   HEAP32[(($1319)>>2)]=$1228;
   HEAP32[(($1310)>>2)]=$1228;
   var $_sum21_i_i=((($_sum_i21_i)+(8))|0);
   var $1320=(($tbase_245_i+$_sum21_i_i)|0);
   var $1321=$1320;
   HEAP32[(($1321)>>2)]=$1311;
   var $_sum22_i_i=((($_sum_i21_i)+(12))|0);
   var $1322=(($tbase_245_i+$_sum22_i_i)|0);
   var $1323=$1322;
   HEAP32[(($1323)>>2)]=$T_0_i27_i;
   var $_sum23_i_i=((($_sum_i21_i)+(24))|0);
   var $1324=(($tbase_245_i+$_sum23_i_i)|0);
   var $1325=$1324;
   HEAP32[(($1325)>>2)]=0;
   label = 303; break;
  case 302: 
   _abort();
   throw "Reached an unreachable!";
  case 303: 
   var $_sum1819_i_i=$993 | 8;
   var $1326=(($tbase_245_i+$_sum1819_i_i)|0);
   var $mem_0 = $1326;label = 341; break;
  case 304: 
   var $1327=$890;
   var $sp_0_i_i_i = ((3712)|0);label = 305; break;
  case 305: 
   var $sp_0_i_i_i;
   var $1329=(($sp_0_i_i_i)|0);
   var $1330=HEAP32[(($1329)>>2)];
   var $1331=(($1330)>>>(0)) > (($1327)>>>(0));
   if ($1331) { label = 307; break; } else { label = 306; break; }
  case 306: 
   var $1333=(($sp_0_i_i_i+4)|0);
   var $1334=HEAP32[(($1333)>>2)];
   var $1335=(($1330+$1334)|0);
   var $1336=(($1335)>>>(0)) > (($1327)>>>(0));
   if ($1336) { label = 308; break; } else { label = 307; break; }
  case 307: 
   var $1338=(($sp_0_i_i_i+8)|0);
   var $1339=HEAP32[(($1338)>>2)];
   var $sp_0_i_i_i = $1339;label = 305; break;
  case 308: 
   var $_sum_i15_i=((($1334)-(47))|0);
   var $_sum1_i16_i=((($1334)-(39))|0);
   var $1340=(($1330+$_sum1_i16_i)|0);
   var $1341=$1340;
   var $1342=$1341 & 7;
   var $1343=(($1342)|(0))==0;
   if ($1343) { var $1348 = 0;label = 310; break; } else { label = 309; break; }
  case 309: 
   var $1345=(((-$1341))|0);
   var $1346=$1345 & 7;
   var $1348 = $1346;label = 310; break;
  case 310: 
   var $1348;
   var $_sum2_i17_i=((($_sum_i15_i)+($1348))|0);
   var $1349=(($1330+$_sum2_i17_i)|0);
   var $1350=(($890+16)|0);
   var $1351=$1350;
   var $1352=(($1349)>>>(0)) < (($1351)>>>(0));
   var $1353=$1352 ? $1327 : $1349;
   var $1354=(($1353+8)|0);
   var $1355=$1354;
   var $1356=((($tsize_244_i)-(40))|0);
   var $1357=(($tbase_245_i+8)|0);
   var $1358=$1357;
   var $1359=$1358 & 7;
   var $1360=(($1359)|(0))==0;
   if ($1360) { var $1364 = 0;label = 312; break; } else { label = 311; break; }
  case 311: 
   var $1362=(((-$1358))|0);
   var $1363=$1362 & 7;
   var $1364 = $1363;label = 312; break;
  case 312: 
   var $1364;
   var $1365=(($tbase_245_i+$1364)|0);
   var $1366=$1365;
   var $1367=((($1356)-($1364))|0);
   HEAP32[((((3288)|0))>>2)]=$1366;
   HEAP32[((((3276)|0))>>2)]=$1367;
   var $1368=$1367 | 1;
   var $_sum_i_i_i=((($1364)+(4))|0);
   var $1369=(($tbase_245_i+$_sum_i_i_i)|0);
   var $1370=$1369;
   HEAP32[(($1370)>>2)]=$1368;
   var $_sum2_i_i_i=((($tsize_244_i)-(36))|0);
   var $1371=(($tbase_245_i+$_sum2_i_i_i)|0);
   var $1372=$1371;
   HEAP32[(($1372)>>2)]=40;
   var $1373=HEAP32[((((3240)|0))>>2)];
   HEAP32[((((3292)|0))>>2)]=$1373;
   var $1374=(($1353+4)|0);
   var $1375=$1374;
   HEAP32[(($1375)>>2)]=27;
   assert(16 % 1 === 0);HEAP32[(($1354)>>2)]=HEAP32[(((((3712)|0)))>>2)];HEAP32[((($1354)+(4))>>2)]=HEAP32[((((((3712)|0)))+(4))>>2)];HEAP32[((($1354)+(8))>>2)]=HEAP32[((((((3712)|0)))+(8))>>2)];HEAP32[((($1354)+(12))>>2)]=HEAP32[((((((3712)|0)))+(12))>>2)];
   HEAP32[((((3712)|0))>>2)]=$tbase_245_i;
   HEAP32[((((3716)|0))>>2)]=$tsize_244_i;
   HEAP32[((((3724)|0))>>2)]=0;
   HEAP32[((((3720)|0))>>2)]=$1355;
   var $1376=(($1353+28)|0);
   var $1377=$1376;
   HEAP32[(($1377)>>2)]=7;
   var $1378=(($1353+32)|0);
   var $1379=(($1378)>>>(0)) < (($1335)>>>(0));
   if ($1379) { var $1380 = $1377;label = 313; break; } else { label = 314; break; }
  case 313: 
   var $1380;
   var $1381=(($1380+4)|0);
   HEAP32[(($1381)>>2)]=7;
   var $1382=(($1380+8)|0);
   var $1383=$1382;
   var $1384=(($1383)>>>(0)) < (($1335)>>>(0));
   if ($1384) { var $1380 = $1381;label = 313; break; } else { label = 314; break; }
  case 314: 
   var $1385=(($1353)|(0))==(($1327)|(0));
   if ($1385) { label = 338; break; } else { label = 315; break; }
  case 315: 
   var $1387=$1353;
   var $1388=$890;
   var $1389=((($1387)-($1388))|0);
   var $1390=(($1327+$1389)|0);
   var $_sum3_i_i=((($1389)+(4))|0);
   var $1391=(($1327+$_sum3_i_i)|0);
   var $1392=$1391;
   var $1393=HEAP32[(($1392)>>2)];
   var $1394=$1393 & -2;
   HEAP32[(($1392)>>2)]=$1394;
   var $1395=$1389 | 1;
   var $1396=(($890+4)|0);
   HEAP32[(($1396)>>2)]=$1395;
   var $1397=$1390;
   HEAP32[(($1397)>>2)]=$1389;
   var $1398=$1389 >>> 3;
   var $1399=(($1389)>>>(0)) < 256;
   if ($1399) { label = 316; break; } else { label = 321; break; }
  case 316: 
   var $1401=$1398 << 1;
   var $1402=((3304+($1401<<2))|0);
   var $1403=$1402;
   var $1404=HEAP32[((((3264)|0))>>2)];
   var $1405=1 << $1398;
   var $1406=$1404 & $1405;
   var $1407=(($1406)|(0))==0;
   if ($1407) { label = 317; break; } else { label = 318; break; }
  case 317: 
   var $1409=$1404 | $1405;
   HEAP32[((((3264)|0))>>2)]=$1409;
   var $_sum11_pre_i_i=((($1401)+(2))|0);
   var $_pre_i_i=((3304+($_sum11_pre_i_i<<2))|0);
   var $F_0_i_i = $1403;var $_pre_phi_i_i = $_pre_i_i;label = 320; break;
  case 318: 
   var $_sum12_i_i=((($1401)+(2))|0);
   var $1411=((3304+($_sum12_i_i<<2))|0);
   var $1412=HEAP32[(($1411)>>2)];
   var $1413=$1412;
   var $1414=HEAP32[((((3280)|0))>>2)];
   var $1415=(($1413)>>>(0)) < (($1414)>>>(0));
   if ($1415) { label = 319; break; } else { var $F_0_i_i = $1412;var $_pre_phi_i_i = $1411;label = 320; break; }
  case 319: 
   _abort();
   throw "Reached an unreachable!";
  case 320: 
   var $_pre_phi_i_i;
   var $F_0_i_i;
   HEAP32[(($_pre_phi_i_i)>>2)]=$890;
   var $1418=(($F_0_i_i+12)|0);
   HEAP32[(($1418)>>2)]=$890;
   var $1419=(($890+8)|0);
   HEAP32[(($1419)>>2)]=$F_0_i_i;
   var $1420=(($890+12)|0);
   HEAP32[(($1420)>>2)]=$1403;
   label = 338; break;
  case 321: 
   var $1422=$890;
   var $1423=$1389 >>> 8;
   var $1424=(($1423)|(0))==0;
   if ($1424) { var $I1_0_i_i = 0;label = 324; break; } else { label = 322; break; }
  case 322: 
   var $1426=(($1389)>>>(0)) > 16777215;
   if ($1426) { var $I1_0_i_i = 31;label = 324; break; } else { label = 323; break; }
  case 323: 
   var $1428=((($1423)+(1048320))|0);
   var $1429=$1428 >>> 16;
   var $1430=$1429 & 8;
   var $1431=$1423 << $1430;
   var $1432=((($1431)+(520192))|0);
   var $1433=$1432 >>> 16;
   var $1434=$1433 & 4;
   var $1435=$1434 | $1430;
   var $1436=$1431 << $1434;
   var $1437=((($1436)+(245760))|0);
   var $1438=$1437 >>> 16;
   var $1439=$1438 & 2;
   var $1440=$1435 | $1439;
   var $1441=(((14)-($1440))|0);
   var $1442=$1436 << $1439;
   var $1443=$1442 >>> 15;
   var $1444=((($1441)+($1443))|0);
   var $1445=$1444 << 1;
   var $1446=((($1444)+(7))|0);
   var $1447=$1389 >>> (($1446)>>>(0));
   var $1448=$1447 & 1;
   var $1449=$1448 | $1445;
   var $I1_0_i_i = $1449;label = 324; break;
  case 324: 
   var $I1_0_i_i;
   var $1451=((3568+($I1_0_i_i<<2))|0);
   var $1452=(($890+28)|0);
   var $I1_0_c_i_i=$I1_0_i_i;
   HEAP32[(($1452)>>2)]=$I1_0_c_i_i;
   var $1453=(($890+20)|0);
   HEAP32[(($1453)>>2)]=0;
   var $1454=(($890+16)|0);
   HEAP32[(($1454)>>2)]=0;
   var $1455=HEAP32[((((3268)|0))>>2)];
   var $1456=1 << $I1_0_i_i;
   var $1457=$1455 & $1456;
   var $1458=(($1457)|(0))==0;
   if ($1458) { label = 325; break; } else { label = 326; break; }
  case 325: 
   var $1460=$1455 | $1456;
   HEAP32[((((3268)|0))>>2)]=$1460;
   HEAP32[(($1451)>>2)]=$1422;
   var $1461=(($890+24)|0);
   var $_c_i_i=$1451;
   HEAP32[(($1461)>>2)]=$_c_i_i;
   var $1462=(($890+12)|0);
   HEAP32[(($1462)>>2)]=$890;
   var $1463=(($890+8)|0);
   HEAP32[(($1463)>>2)]=$890;
   label = 338; break;
  case 326: 
   var $1465=HEAP32[(($1451)>>2)];
   var $1466=(($I1_0_i_i)|(0))==31;
   if ($1466) { var $1471 = 0;label = 328; break; } else { label = 327; break; }
  case 327: 
   var $1468=$I1_0_i_i >>> 1;
   var $1469=(((25)-($1468))|0);
   var $1471 = $1469;label = 328; break;
  case 328: 
   var $1471;
   var $1472=$1389 << $1471;
   var $K2_0_i_i = $1472;var $T_0_i_i = $1465;label = 329; break;
  case 329: 
   var $T_0_i_i;
   var $K2_0_i_i;
   var $1474=(($T_0_i_i+4)|0);
   var $1475=HEAP32[(($1474)>>2)];
   var $1476=$1475 & -8;
   var $1477=(($1476)|(0))==(($1389)|(0));
   if ($1477) { label = 334; break; } else { label = 330; break; }
  case 330: 
   var $1479=$K2_0_i_i >>> 31;
   var $1480=(($T_0_i_i+16+($1479<<2))|0);
   var $1481=HEAP32[(($1480)>>2)];
   var $1482=(($1481)|(0))==0;
   var $1483=$K2_0_i_i << 1;
   if ($1482) { label = 331; break; } else { var $K2_0_i_i = $1483;var $T_0_i_i = $1481;label = 329; break; }
  case 331: 
   var $1485=$1480;
   var $1486=HEAP32[((((3280)|0))>>2)];
   var $1487=(($1485)>>>(0)) < (($1486)>>>(0));
   if ($1487) { label = 333; break; } else { label = 332; break; }
  case 332: 
   HEAP32[(($1480)>>2)]=$1422;
   var $1489=(($890+24)|0);
   var $T_0_c8_i_i=$T_0_i_i;
   HEAP32[(($1489)>>2)]=$T_0_c8_i_i;
   var $1490=(($890+12)|0);
   HEAP32[(($1490)>>2)]=$890;
   var $1491=(($890+8)|0);
   HEAP32[(($1491)>>2)]=$890;
   label = 338; break;
  case 333: 
   _abort();
   throw "Reached an unreachable!";
  case 334: 
   var $1494=(($T_0_i_i+8)|0);
   var $1495=HEAP32[(($1494)>>2)];
   var $1496=$T_0_i_i;
   var $1497=HEAP32[((((3280)|0))>>2)];
   var $1498=(($1496)>>>(0)) < (($1497)>>>(0));
   if ($1498) { label = 337; break; } else { label = 335; break; }
  case 335: 
   var $1500=$1495;
   var $1501=(($1500)>>>(0)) < (($1497)>>>(0));
   if ($1501) { label = 337; break; } else { label = 336; break; }
  case 336: 
   var $1503=(($1495+12)|0);
   HEAP32[(($1503)>>2)]=$1422;
   HEAP32[(($1494)>>2)]=$1422;
   var $1504=(($890+8)|0);
   var $_c7_i_i=$1495;
   HEAP32[(($1504)>>2)]=$_c7_i_i;
   var $1505=(($890+12)|0);
   var $T_0_c_i_i=$T_0_i_i;
   HEAP32[(($1505)>>2)]=$T_0_c_i_i;
   var $1506=(($890+24)|0);
   HEAP32[(($1506)>>2)]=0;
   label = 338; break;
  case 337: 
   _abort();
   throw "Reached an unreachable!";
  case 338: 
   var $1507=HEAP32[((((3276)|0))>>2)];
   var $1508=(($1507)>>>(0)) > (($nb_0)>>>(0));
   if ($1508) { label = 339; break; } else { label = 340; break; }
  case 339: 
   var $1510=((($1507)-($nb_0))|0);
   HEAP32[((((3276)|0))>>2)]=$1510;
   var $1511=HEAP32[((((3288)|0))>>2)];
   var $1512=$1511;
   var $1513=(($1512+$nb_0)|0);
   var $1514=$1513;
   HEAP32[((((3288)|0))>>2)]=$1514;
   var $1515=$1510 | 1;
   var $_sum_i134=((($nb_0)+(4))|0);
   var $1516=(($1512+$_sum_i134)|0);
   var $1517=$1516;
   HEAP32[(($1517)>>2)]=$1515;
   var $1518=$nb_0 | 3;
   var $1519=(($1511+4)|0);
   HEAP32[(($1519)>>2)]=$1518;
   var $1520=(($1511+8)|0);
   var $1521=$1520;
   var $mem_0 = $1521;label = 341; break;
  case 340: 
   var $1522=___errno_location();
   HEAP32[(($1522)>>2)]=12;
   var $mem_0 = 0;label = 341; break;
  case 341: 
   var $mem_0;
   return $mem_0;
  default: assert(0, "bad label: " + label);
 }
}
Module["_malloc"] = _malloc;
function _calloc($n_elements, $elem_size) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($n_elements)|(0))==0;
   if ($1) { var $req_0 = 0;label = 4; break; } else { label = 2; break; }
  case 2: 
   var $3=(Math.imul($elem_size,$n_elements)|0);
   var $4=$elem_size | $n_elements;
   var $5=(($4)>>>(0)) > 65535;
   if ($5) { label = 3; break; } else { var $req_0 = $3;label = 4; break; }
  case 3: 
   var $7=((((($3)>>>(0)))/((($n_elements)>>>(0))))&-1);
   var $8=(($7)|(0))==(($elem_size)|(0));
   var $_=$8 ? $3 : -1;
   var $req_0 = $_;label = 4; break;
  case 4: 
   var $req_0;
   var $10=_malloc($req_0);
   var $11=(($10)|(0))==0;
   if ($11) { label = 7; break; } else { label = 5; break; }
  case 5: 
   var $13=((($10)-(4))|0);
   var $14=$13;
   var $15=HEAP32[(($14)>>2)];
   var $16=$15 & 3;
   var $17=(($16)|(0))==0;
   if ($17) { label = 7; break; } else { label = 6; break; }
  case 6: 
   _memset($10, 0, $req_0);
   label = 7; break;
  case 7: 
   return $10;
  default: assert(0, "bad label: " + label);
 }
}
Module["_calloc"] = _calloc;
function _free($mem) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($mem)|(0))==0;
   if ($1) { label = 140; break; } else { label = 2; break; }
  case 2: 
   var $3=((($mem)-(8))|0);
   var $4=$3;
   var $5=HEAP32[((((3280)|0))>>2)];
   var $6=(($3)>>>(0)) < (($5)>>>(0));
   if ($6) { label = 139; break; } else { label = 3; break; }
  case 3: 
   var $8=((($mem)-(4))|0);
   var $9=$8;
   var $10=HEAP32[(($9)>>2)];
   var $11=$10 & 3;
   var $12=(($11)|(0))==1;
   if ($12) { label = 139; break; } else { label = 4; break; }
  case 4: 
   var $14=$10 & -8;
   var $_sum=((($14)-(8))|0);
   var $15=(($mem+$_sum)|0);
   var $16=$15;
   var $17=$10 & 1;
   var $18=(($17)|(0))==0;
   if ($18) { label = 5; break; } else { var $p_0 = $4;var $psize_0 = $14;label = 56; break; }
  case 5: 
   var $20=$3;
   var $21=HEAP32[(($20)>>2)];
   var $22=(($11)|(0))==0;
   if ($22) { label = 140; break; } else { label = 6; break; }
  case 6: 
   var $_sum232=(((-8)-($21))|0);
   var $24=(($mem+$_sum232)|0);
   var $25=$24;
   var $26=((($21)+($14))|0);
   var $27=(($24)>>>(0)) < (($5)>>>(0));
   if ($27) { label = 139; break; } else { label = 7; break; }
  case 7: 
   var $29=HEAP32[((((3284)|0))>>2)];
   var $30=(($25)|(0))==(($29)|(0));
   if ($30) { label = 54; break; } else { label = 8; break; }
  case 8: 
   var $32=$21 >>> 3;
   var $33=(($21)>>>(0)) < 256;
   if ($33) { label = 9; break; } else { label = 21; break; }
  case 9: 
   var $_sum276=((($_sum232)+(8))|0);
   var $35=(($mem+$_sum276)|0);
   var $36=$35;
   var $37=HEAP32[(($36)>>2)];
   var $_sum277=((($_sum232)+(12))|0);
   var $38=(($mem+$_sum277)|0);
   var $39=$38;
   var $40=HEAP32[(($39)>>2)];
   var $41=$32 << 1;
   var $42=((3304+($41<<2))|0);
   var $43=$42;
   var $44=(($37)|(0))==(($43)|(0));
   if ($44) { label = 12; break; } else { label = 10; break; }
  case 10: 
   var $46=$37;
   var $47=(($46)>>>(0)) < (($5)>>>(0));
   if ($47) { label = 20; break; } else { label = 11; break; }
  case 11: 
   var $49=(($37+12)|0);
   var $50=HEAP32[(($49)>>2)];
   var $51=(($50)|(0))==(($25)|(0));
   if ($51) { label = 12; break; } else { label = 20; break; }
  case 12: 
   var $52=(($40)|(0))==(($37)|(0));
   if ($52) { label = 13; break; } else { label = 14; break; }
  case 13: 
   var $54=1 << $32;
   var $55=$54 ^ -1;
   var $56=HEAP32[((((3264)|0))>>2)];
   var $57=$56 & $55;
   HEAP32[((((3264)|0))>>2)]=$57;
   var $p_0 = $25;var $psize_0 = $26;label = 56; break;
  case 14: 
   var $59=(($40)|(0))==(($43)|(0));
   if ($59) { label = 15; break; } else { label = 16; break; }
  case 15: 
   var $_pre305=(($40+8)|0);
   var $_pre_phi306 = $_pre305;label = 18; break;
  case 16: 
   var $61=$40;
   var $62=(($61)>>>(0)) < (($5)>>>(0));
   if ($62) { label = 19; break; } else { label = 17; break; }
  case 17: 
   var $64=(($40+8)|0);
   var $65=HEAP32[(($64)>>2)];
   var $66=(($65)|(0))==(($25)|(0));
   if ($66) { var $_pre_phi306 = $64;label = 18; break; } else { label = 19; break; }
  case 18: 
   var $_pre_phi306;
   var $67=(($37+12)|0);
   HEAP32[(($67)>>2)]=$40;
   HEAP32[(($_pre_phi306)>>2)]=$37;
   var $p_0 = $25;var $psize_0 = $26;label = 56; break;
  case 19: 
   _abort();
   throw "Reached an unreachable!";
  case 20: 
   _abort();
   throw "Reached an unreachable!";
  case 21: 
   var $69=$24;
   var $_sum266=((($_sum232)+(24))|0);
   var $70=(($mem+$_sum266)|0);
   var $71=$70;
   var $72=HEAP32[(($71)>>2)];
   var $_sum267=((($_sum232)+(12))|0);
   var $73=(($mem+$_sum267)|0);
   var $74=$73;
   var $75=HEAP32[(($74)>>2)];
   var $76=(($75)|(0))==(($69)|(0));
   if ($76) { label = 27; break; } else { label = 22; break; }
  case 22: 
   var $_sum273=((($_sum232)+(8))|0);
   var $78=(($mem+$_sum273)|0);
   var $79=$78;
   var $80=HEAP32[(($79)>>2)];
   var $81=$80;
   var $82=(($81)>>>(0)) < (($5)>>>(0));
   if ($82) { label = 26; break; } else { label = 23; break; }
  case 23: 
   var $84=(($80+12)|0);
   var $85=HEAP32[(($84)>>2)];
   var $86=(($85)|(0))==(($69)|(0));
   if ($86) { label = 24; break; } else { label = 26; break; }
  case 24: 
   var $88=(($75+8)|0);
   var $89=HEAP32[(($88)>>2)];
   var $90=(($89)|(0))==(($69)|(0));
   if ($90) { label = 25; break; } else { label = 26; break; }
  case 25: 
   HEAP32[(($84)>>2)]=$75;
   HEAP32[(($88)>>2)]=$80;
   var $R_1 = $75;label = 34; break;
  case 26: 
   _abort();
   throw "Reached an unreachable!";
  case 27: 
   var $_sum269=((($_sum232)+(20))|0);
   var $93=(($mem+$_sum269)|0);
   var $94=$93;
   var $95=HEAP32[(($94)>>2)];
   var $96=(($95)|(0))==0;
   if ($96) { label = 28; break; } else { var $R_0 = $95;var $RP_0 = $94;label = 29; break; }
  case 28: 
   var $_sum268=((($_sum232)+(16))|0);
   var $98=(($mem+$_sum268)|0);
   var $99=$98;
   var $100=HEAP32[(($99)>>2)];
   var $101=(($100)|(0))==0;
   if ($101) { var $R_1 = 0;label = 34; break; } else { var $R_0 = $100;var $RP_0 = $99;label = 29; break; }
  case 29: 
   var $RP_0;
   var $R_0;
   var $102=(($R_0+20)|0);
   var $103=HEAP32[(($102)>>2)];
   var $104=(($103)|(0))==0;
   if ($104) { label = 30; break; } else { var $R_0 = $103;var $RP_0 = $102;label = 29; break; }
  case 30: 
   var $106=(($R_0+16)|0);
   var $107=HEAP32[(($106)>>2)];
   var $108=(($107)|(0))==0;
   if ($108) { label = 31; break; } else { var $R_0 = $107;var $RP_0 = $106;label = 29; break; }
  case 31: 
   var $110=$RP_0;
   var $111=(($110)>>>(0)) < (($5)>>>(0));
   if ($111) { label = 33; break; } else { label = 32; break; }
  case 32: 
   HEAP32[(($RP_0)>>2)]=0;
   var $R_1 = $R_0;label = 34; break;
  case 33: 
   _abort();
   throw "Reached an unreachable!";
  case 34: 
   var $R_1;
   var $115=(($72)|(0))==0;
   if ($115) { var $p_0 = $25;var $psize_0 = $26;label = 56; break; } else { label = 35; break; }
  case 35: 
   var $_sum270=((($_sum232)+(28))|0);
   var $117=(($mem+$_sum270)|0);
   var $118=$117;
   var $119=HEAP32[(($118)>>2)];
   var $120=((3568+($119<<2))|0);
   var $121=HEAP32[(($120)>>2)];
   var $122=(($69)|(0))==(($121)|(0));
   if ($122) { label = 36; break; } else { label = 38; break; }
  case 36: 
   HEAP32[(($120)>>2)]=$R_1;
   var $cond=(($R_1)|(0))==0;
   if ($cond) { label = 37; break; } else { label = 44; break; }
  case 37: 
   var $124=HEAP32[(($118)>>2)];
   var $125=1 << $124;
   var $126=$125 ^ -1;
   var $127=HEAP32[((((3268)|0))>>2)];
   var $128=$127 & $126;
   HEAP32[((((3268)|0))>>2)]=$128;
   var $p_0 = $25;var $psize_0 = $26;label = 56; break;
  case 38: 
   var $130=$72;
   var $131=HEAP32[((((3280)|0))>>2)];
   var $132=(($130)>>>(0)) < (($131)>>>(0));
   if ($132) { label = 42; break; } else { label = 39; break; }
  case 39: 
   var $134=(($72+16)|0);
   var $135=HEAP32[(($134)>>2)];
   var $136=(($135)|(0))==(($69)|(0));
   if ($136) { label = 40; break; } else { label = 41; break; }
  case 40: 
   HEAP32[(($134)>>2)]=$R_1;
   label = 43; break;
  case 41: 
   var $139=(($72+20)|0);
   HEAP32[(($139)>>2)]=$R_1;
   label = 43; break;
  case 42: 
   _abort();
   throw "Reached an unreachable!";
  case 43: 
   var $142=(($R_1)|(0))==0;
   if ($142) { var $p_0 = $25;var $psize_0 = $26;label = 56; break; } else { label = 44; break; }
  case 44: 
   var $144=$R_1;
   var $145=HEAP32[((((3280)|0))>>2)];
   var $146=(($144)>>>(0)) < (($145)>>>(0));
   if ($146) { label = 53; break; } else { label = 45; break; }
  case 45: 
   var $148=(($R_1+24)|0);
   HEAP32[(($148)>>2)]=$72;
   var $_sum271=((($_sum232)+(16))|0);
   var $149=(($mem+$_sum271)|0);
   var $150=$149;
   var $151=HEAP32[(($150)>>2)];
   var $152=(($151)|(0))==0;
   if ($152) { label = 49; break; } else { label = 46; break; }
  case 46: 
   var $154=$151;
   var $155=HEAP32[((((3280)|0))>>2)];
   var $156=(($154)>>>(0)) < (($155)>>>(0));
   if ($156) { label = 48; break; } else { label = 47; break; }
  case 47: 
   var $158=(($R_1+16)|0);
   HEAP32[(($158)>>2)]=$151;
   var $159=(($151+24)|0);
   HEAP32[(($159)>>2)]=$R_1;
   label = 49; break;
  case 48: 
   _abort();
   throw "Reached an unreachable!";
  case 49: 
   var $_sum272=((($_sum232)+(20))|0);
   var $162=(($mem+$_sum272)|0);
   var $163=$162;
   var $164=HEAP32[(($163)>>2)];
   var $165=(($164)|(0))==0;
   if ($165) { var $p_0 = $25;var $psize_0 = $26;label = 56; break; } else { label = 50; break; }
  case 50: 
   var $167=$164;
   var $168=HEAP32[((((3280)|0))>>2)];
   var $169=(($167)>>>(0)) < (($168)>>>(0));
   if ($169) { label = 52; break; } else { label = 51; break; }
  case 51: 
   var $171=(($R_1+20)|0);
   HEAP32[(($171)>>2)]=$164;
   var $172=(($164+24)|0);
   HEAP32[(($172)>>2)]=$R_1;
   var $p_0 = $25;var $psize_0 = $26;label = 56; break;
  case 52: 
   _abort();
   throw "Reached an unreachable!";
  case 53: 
   _abort();
   throw "Reached an unreachable!";
  case 54: 
   var $_sum233=((($14)-(4))|0);
   var $176=(($mem+$_sum233)|0);
   var $177=$176;
   var $178=HEAP32[(($177)>>2)];
   var $179=$178 & 3;
   var $180=(($179)|(0))==3;
   if ($180) { label = 55; break; } else { var $p_0 = $25;var $psize_0 = $26;label = 56; break; }
  case 55: 
   HEAP32[((((3272)|0))>>2)]=$26;
   var $182=HEAP32[(($177)>>2)];
   var $183=$182 & -2;
   HEAP32[(($177)>>2)]=$183;
   var $184=$26 | 1;
   var $_sum264=((($_sum232)+(4))|0);
   var $185=(($mem+$_sum264)|0);
   var $186=$185;
   HEAP32[(($186)>>2)]=$184;
   var $187=$15;
   HEAP32[(($187)>>2)]=$26;
   label = 140; break;
  case 56: 
   var $psize_0;
   var $p_0;
   var $189=$p_0;
   var $190=(($189)>>>(0)) < (($15)>>>(0));
   if ($190) { label = 57; break; } else { label = 139; break; }
  case 57: 
   var $_sum263=((($14)-(4))|0);
   var $192=(($mem+$_sum263)|0);
   var $193=$192;
   var $194=HEAP32[(($193)>>2)];
   var $195=$194 & 1;
   var $phitmp=(($195)|(0))==0;
   if ($phitmp) { label = 139; break; } else { label = 58; break; }
  case 58: 
   var $197=$194 & 2;
   var $198=(($197)|(0))==0;
   if ($198) { label = 59; break; } else { label = 112; break; }
  case 59: 
   var $200=HEAP32[((((3288)|0))>>2)];
   var $201=(($16)|(0))==(($200)|(0));
   if ($201) { label = 60; break; } else { label = 62; break; }
  case 60: 
   var $203=HEAP32[((((3276)|0))>>2)];
   var $204=((($203)+($psize_0))|0);
   HEAP32[((((3276)|0))>>2)]=$204;
   HEAP32[((((3288)|0))>>2)]=$p_0;
   var $205=$204 | 1;
   var $206=(($p_0+4)|0);
   HEAP32[(($206)>>2)]=$205;
   var $207=HEAP32[((((3284)|0))>>2)];
   var $208=(($p_0)|(0))==(($207)|(0));
   if ($208) { label = 61; break; } else { label = 140; break; }
  case 61: 
   HEAP32[((((3284)|0))>>2)]=0;
   HEAP32[((((3272)|0))>>2)]=0;
   label = 140; break;
  case 62: 
   var $211=HEAP32[((((3284)|0))>>2)];
   var $212=(($16)|(0))==(($211)|(0));
   if ($212) { label = 63; break; } else { label = 64; break; }
  case 63: 
   var $214=HEAP32[((((3272)|0))>>2)];
   var $215=((($214)+($psize_0))|0);
   HEAP32[((((3272)|0))>>2)]=$215;
   HEAP32[((((3284)|0))>>2)]=$p_0;
   var $216=$215 | 1;
   var $217=(($p_0+4)|0);
   HEAP32[(($217)>>2)]=$216;
   var $218=(($189+$215)|0);
   var $219=$218;
   HEAP32[(($219)>>2)]=$215;
   label = 140; break;
  case 64: 
   var $221=$194 & -8;
   var $222=((($221)+($psize_0))|0);
   var $223=$194 >>> 3;
   var $224=(($194)>>>(0)) < 256;
   if ($224) { label = 65; break; } else { label = 77; break; }
  case 65: 
   var $226=(($mem+$14)|0);
   var $227=$226;
   var $228=HEAP32[(($227)>>2)];
   var $_sum257258=$14 | 4;
   var $229=(($mem+$_sum257258)|0);
   var $230=$229;
   var $231=HEAP32[(($230)>>2)];
   var $232=$223 << 1;
   var $233=((3304+($232<<2))|0);
   var $234=$233;
   var $235=(($228)|(0))==(($234)|(0));
   if ($235) { label = 68; break; } else { label = 66; break; }
  case 66: 
   var $237=$228;
   var $238=HEAP32[((((3280)|0))>>2)];
   var $239=(($237)>>>(0)) < (($238)>>>(0));
   if ($239) { label = 76; break; } else { label = 67; break; }
  case 67: 
   var $241=(($228+12)|0);
   var $242=HEAP32[(($241)>>2)];
   var $243=(($242)|(0))==(($16)|(0));
   if ($243) { label = 68; break; } else { label = 76; break; }
  case 68: 
   var $244=(($231)|(0))==(($228)|(0));
   if ($244) { label = 69; break; } else { label = 70; break; }
  case 69: 
   var $246=1 << $223;
   var $247=$246 ^ -1;
   var $248=HEAP32[((((3264)|0))>>2)];
   var $249=$248 & $247;
   HEAP32[((((3264)|0))>>2)]=$249;
   label = 110; break;
  case 70: 
   var $251=(($231)|(0))==(($234)|(0));
   if ($251) { label = 71; break; } else { label = 72; break; }
  case 71: 
   var $_pre303=(($231+8)|0);
   var $_pre_phi304 = $_pre303;label = 74; break;
  case 72: 
   var $253=$231;
   var $254=HEAP32[((((3280)|0))>>2)];
   var $255=(($253)>>>(0)) < (($254)>>>(0));
   if ($255) { label = 75; break; } else { label = 73; break; }
  case 73: 
   var $257=(($231+8)|0);
   var $258=HEAP32[(($257)>>2)];
   var $259=(($258)|(0))==(($16)|(0));
   if ($259) { var $_pre_phi304 = $257;label = 74; break; } else { label = 75; break; }
  case 74: 
   var $_pre_phi304;
   var $260=(($228+12)|0);
   HEAP32[(($260)>>2)]=$231;
   HEAP32[(($_pre_phi304)>>2)]=$228;
   label = 110; break;
  case 75: 
   _abort();
   throw "Reached an unreachable!";
  case 76: 
   _abort();
   throw "Reached an unreachable!";
  case 77: 
   var $262=$15;
   var $_sum235=((($14)+(16))|0);
   var $263=(($mem+$_sum235)|0);
   var $264=$263;
   var $265=HEAP32[(($264)>>2)];
   var $_sum236237=$14 | 4;
   var $266=(($mem+$_sum236237)|0);
   var $267=$266;
   var $268=HEAP32[(($267)>>2)];
   var $269=(($268)|(0))==(($262)|(0));
   if ($269) { label = 83; break; } else { label = 78; break; }
  case 78: 
   var $271=(($mem+$14)|0);
   var $272=$271;
   var $273=HEAP32[(($272)>>2)];
   var $274=$273;
   var $275=HEAP32[((((3280)|0))>>2)];
   var $276=(($274)>>>(0)) < (($275)>>>(0));
   if ($276) { label = 82; break; } else { label = 79; break; }
  case 79: 
   var $278=(($273+12)|0);
   var $279=HEAP32[(($278)>>2)];
   var $280=(($279)|(0))==(($262)|(0));
   if ($280) { label = 80; break; } else { label = 82; break; }
  case 80: 
   var $282=(($268+8)|0);
   var $283=HEAP32[(($282)>>2)];
   var $284=(($283)|(0))==(($262)|(0));
   if ($284) { label = 81; break; } else { label = 82; break; }
  case 81: 
   HEAP32[(($278)>>2)]=$268;
   HEAP32[(($282)>>2)]=$273;
   var $R7_1 = $268;label = 90; break;
  case 82: 
   _abort();
   throw "Reached an unreachable!";
  case 83: 
   var $_sum239=((($14)+(12))|0);
   var $287=(($mem+$_sum239)|0);
   var $288=$287;
   var $289=HEAP32[(($288)>>2)];
   var $290=(($289)|(0))==0;
   if ($290) { label = 84; break; } else { var $R7_0 = $289;var $RP9_0 = $288;label = 85; break; }
  case 84: 
   var $_sum238=((($14)+(8))|0);
   var $292=(($mem+$_sum238)|0);
   var $293=$292;
   var $294=HEAP32[(($293)>>2)];
   var $295=(($294)|(0))==0;
   if ($295) { var $R7_1 = 0;label = 90; break; } else { var $R7_0 = $294;var $RP9_0 = $293;label = 85; break; }
  case 85: 
   var $RP9_0;
   var $R7_0;
   var $296=(($R7_0+20)|0);
   var $297=HEAP32[(($296)>>2)];
   var $298=(($297)|(0))==0;
   if ($298) { label = 86; break; } else { var $R7_0 = $297;var $RP9_0 = $296;label = 85; break; }
  case 86: 
   var $300=(($R7_0+16)|0);
   var $301=HEAP32[(($300)>>2)];
   var $302=(($301)|(0))==0;
   if ($302) { label = 87; break; } else { var $R7_0 = $301;var $RP9_0 = $300;label = 85; break; }
  case 87: 
   var $304=$RP9_0;
   var $305=HEAP32[((((3280)|0))>>2)];
   var $306=(($304)>>>(0)) < (($305)>>>(0));
   if ($306) { label = 89; break; } else { label = 88; break; }
  case 88: 
   HEAP32[(($RP9_0)>>2)]=0;
   var $R7_1 = $R7_0;label = 90; break;
  case 89: 
   _abort();
   throw "Reached an unreachable!";
  case 90: 
   var $R7_1;
   var $310=(($265)|(0))==0;
   if ($310) { label = 110; break; } else { label = 91; break; }
  case 91: 
   var $_sum250=((($14)+(20))|0);
   var $312=(($mem+$_sum250)|0);
   var $313=$312;
   var $314=HEAP32[(($313)>>2)];
   var $315=((3568+($314<<2))|0);
   var $316=HEAP32[(($315)>>2)];
   var $317=(($262)|(0))==(($316)|(0));
   if ($317) { label = 92; break; } else { label = 94; break; }
  case 92: 
   HEAP32[(($315)>>2)]=$R7_1;
   var $cond298=(($R7_1)|(0))==0;
   if ($cond298) { label = 93; break; } else { label = 100; break; }
  case 93: 
   var $319=HEAP32[(($313)>>2)];
   var $320=1 << $319;
   var $321=$320 ^ -1;
   var $322=HEAP32[((((3268)|0))>>2)];
   var $323=$322 & $321;
   HEAP32[((((3268)|0))>>2)]=$323;
   label = 110; break;
  case 94: 
   var $325=$265;
   var $326=HEAP32[((((3280)|0))>>2)];
   var $327=(($325)>>>(0)) < (($326)>>>(0));
   if ($327) { label = 98; break; } else { label = 95; break; }
  case 95: 
   var $329=(($265+16)|0);
   var $330=HEAP32[(($329)>>2)];
   var $331=(($330)|(0))==(($262)|(0));
   if ($331) { label = 96; break; } else { label = 97; break; }
  case 96: 
   HEAP32[(($329)>>2)]=$R7_1;
   label = 99; break;
  case 97: 
   var $334=(($265+20)|0);
   HEAP32[(($334)>>2)]=$R7_1;
   label = 99; break;
  case 98: 
   _abort();
   throw "Reached an unreachable!";
  case 99: 
   var $337=(($R7_1)|(0))==0;
   if ($337) { label = 110; break; } else { label = 100; break; }
  case 100: 
   var $339=$R7_1;
   var $340=HEAP32[((((3280)|0))>>2)];
   var $341=(($339)>>>(0)) < (($340)>>>(0));
   if ($341) { label = 109; break; } else { label = 101; break; }
  case 101: 
   var $343=(($R7_1+24)|0);
   HEAP32[(($343)>>2)]=$265;
   var $_sum251=((($14)+(8))|0);
   var $344=(($mem+$_sum251)|0);
   var $345=$344;
   var $346=HEAP32[(($345)>>2)];
   var $347=(($346)|(0))==0;
   if ($347) { label = 105; break; } else { label = 102; break; }
  case 102: 
   var $349=$346;
   var $350=HEAP32[((((3280)|0))>>2)];
   var $351=(($349)>>>(0)) < (($350)>>>(0));
   if ($351) { label = 104; break; } else { label = 103; break; }
  case 103: 
   var $353=(($R7_1+16)|0);
   HEAP32[(($353)>>2)]=$346;
   var $354=(($346+24)|0);
   HEAP32[(($354)>>2)]=$R7_1;
   label = 105; break;
  case 104: 
   _abort();
   throw "Reached an unreachable!";
  case 105: 
   var $_sum252=((($14)+(12))|0);
   var $357=(($mem+$_sum252)|0);
   var $358=$357;
   var $359=HEAP32[(($358)>>2)];
   var $360=(($359)|(0))==0;
   if ($360) { label = 110; break; } else { label = 106; break; }
  case 106: 
   var $362=$359;
   var $363=HEAP32[((((3280)|0))>>2)];
   var $364=(($362)>>>(0)) < (($363)>>>(0));
   if ($364) { label = 108; break; } else { label = 107; break; }
  case 107: 
   var $366=(($R7_1+20)|0);
   HEAP32[(($366)>>2)]=$359;
   var $367=(($359+24)|0);
   HEAP32[(($367)>>2)]=$R7_1;
   label = 110; break;
  case 108: 
   _abort();
   throw "Reached an unreachable!";
  case 109: 
   _abort();
   throw "Reached an unreachable!";
  case 110: 
   var $371=$222 | 1;
   var $372=(($p_0+4)|0);
   HEAP32[(($372)>>2)]=$371;
   var $373=(($189+$222)|0);
   var $374=$373;
   HEAP32[(($374)>>2)]=$222;
   var $375=HEAP32[((((3284)|0))>>2)];
   var $376=(($p_0)|(0))==(($375)|(0));
   if ($376) { label = 111; break; } else { var $psize_1 = $222;label = 113; break; }
  case 111: 
   HEAP32[((((3272)|0))>>2)]=$222;
   label = 140; break;
  case 112: 
   var $379=$194 & -2;
   HEAP32[(($193)>>2)]=$379;
   var $380=$psize_0 | 1;
   var $381=(($p_0+4)|0);
   HEAP32[(($381)>>2)]=$380;
   var $382=(($189+$psize_0)|0);
   var $383=$382;
   HEAP32[(($383)>>2)]=$psize_0;
   var $psize_1 = $psize_0;label = 113; break;
  case 113: 
   var $psize_1;
   var $385=$psize_1 >>> 3;
   var $386=(($psize_1)>>>(0)) < 256;
   if ($386) { label = 114; break; } else { label = 119; break; }
  case 114: 
   var $388=$385 << 1;
   var $389=((3304+($388<<2))|0);
   var $390=$389;
   var $391=HEAP32[((((3264)|0))>>2)];
   var $392=1 << $385;
   var $393=$391 & $392;
   var $394=(($393)|(0))==0;
   if ($394) { label = 115; break; } else { label = 116; break; }
  case 115: 
   var $396=$391 | $392;
   HEAP32[((((3264)|0))>>2)]=$396;
   var $_sum248_pre=((($388)+(2))|0);
   var $_pre=((3304+($_sum248_pre<<2))|0);
   var $F16_0 = $390;var $_pre_phi = $_pre;label = 118; break;
  case 116: 
   var $_sum249=((($388)+(2))|0);
   var $398=((3304+($_sum249<<2))|0);
   var $399=HEAP32[(($398)>>2)];
   var $400=$399;
   var $401=HEAP32[((((3280)|0))>>2)];
   var $402=(($400)>>>(0)) < (($401)>>>(0));
   if ($402) { label = 117; break; } else { var $F16_0 = $399;var $_pre_phi = $398;label = 118; break; }
  case 117: 
   _abort();
   throw "Reached an unreachable!";
  case 118: 
   var $_pre_phi;
   var $F16_0;
   HEAP32[(($_pre_phi)>>2)]=$p_0;
   var $405=(($F16_0+12)|0);
   HEAP32[(($405)>>2)]=$p_0;
   var $406=(($p_0+8)|0);
   HEAP32[(($406)>>2)]=$F16_0;
   var $407=(($p_0+12)|0);
   HEAP32[(($407)>>2)]=$390;
   label = 140; break;
  case 119: 
   var $409=$p_0;
   var $410=$psize_1 >>> 8;
   var $411=(($410)|(0))==0;
   if ($411) { var $I18_0 = 0;label = 122; break; } else { label = 120; break; }
  case 120: 
   var $413=(($psize_1)>>>(0)) > 16777215;
   if ($413) { var $I18_0 = 31;label = 122; break; } else { label = 121; break; }
  case 121: 
   var $415=((($410)+(1048320))|0);
   var $416=$415 >>> 16;
   var $417=$416 & 8;
   var $418=$410 << $417;
   var $419=((($418)+(520192))|0);
   var $420=$419 >>> 16;
   var $421=$420 & 4;
   var $422=$421 | $417;
   var $423=$418 << $421;
   var $424=((($423)+(245760))|0);
   var $425=$424 >>> 16;
   var $426=$425 & 2;
   var $427=$422 | $426;
   var $428=(((14)-($427))|0);
   var $429=$423 << $426;
   var $430=$429 >>> 15;
   var $431=((($428)+($430))|0);
   var $432=$431 << 1;
   var $433=((($431)+(7))|0);
   var $434=$psize_1 >>> (($433)>>>(0));
   var $435=$434 & 1;
   var $436=$435 | $432;
   var $I18_0 = $436;label = 122; break;
  case 122: 
   var $I18_0;
   var $438=((3568+($I18_0<<2))|0);
   var $439=(($p_0+28)|0);
   var $I18_0_c=$I18_0;
   HEAP32[(($439)>>2)]=$I18_0_c;
   var $440=(($p_0+20)|0);
   HEAP32[(($440)>>2)]=0;
   var $441=(($p_0+16)|0);
   HEAP32[(($441)>>2)]=0;
   var $442=HEAP32[((((3268)|0))>>2)];
   var $443=1 << $I18_0;
   var $444=$442 & $443;
   var $445=(($444)|(0))==0;
   if ($445) { label = 123; break; } else { label = 124; break; }
  case 123: 
   var $447=$442 | $443;
   HEAP32[((((3268)|0))>>2)]=$447;
   HEAP32[(($438)>>2)]=$409;
   var $448=(($p_0+24)|0);
   var $_c=$438;
   HEAP32[(($448)>>2)]=$_c;
   var $449=(($p_0+12)|0);
   HEAP32[(($449)>>2)]=$p_0;
   var $450=(($p_0+8)|0);
   HEAP32[(($450)>>2)]=$p_0;
   label = 136; break;
  case 124: 
   var $452=HEAP32[(($438)>>2)];
   var $453=(($I18_0)|(0))==31;
   if ($453) { var $458 = 0;label = 126; break; } else { label = 125; break; }
  case 125: 
   var $455=$I18_0 >>> 1;
   var $456=(((25)-($455))|0);
   var $458 = $456;label = 126; break;
  case 126: 
   var $458;
   var $459=$psize_1 << $458;
   var $K19_0 = $459;var $T_0 = $452;label = 127; break;
  case 127: 
   var $T_0;
   var $K19_0;
   var $461=(($T_0+4)|0);
   var $462=HEAP32[(($461)>>2)];
   var $463=$462 & -8;
   var $464=(($463)|(0))==(($psize_1)|(0));
   if ($464) { label = 132; break; } else { label = 128; break; }
  case 128: 
   var $466=$K19_0 >>> 31;
   var $467=(($T_0+16+($466<<2))|0);
   var $468=HEAP32[(($467)>>2)];
   var $469=(($468)|(0))==0;
   var $470=$K19_0 << 1;
   if ($469) { label = 129; break; } else { var $K19_0 = $470;var $T_0 = $468;label = 127; break; }
  case 129: 
   var $472=$467;
   var $473=HEAP32[((((3280)|0))>>2)];
   var $474=(($472)>>>(0)) < (($473)>>>(0));
   if ($474) { label = 131; break; } else { label = 130; break; }
  case 130: 
   HEAP32[(($467)>>2)]=$409;
   var $476=(($p_0+24)|0);
   var $T_0_c245=$T_0;
   HEAP32[(($476)>>2)]=$T_0_c245;
   var $477=(($p_0+12)|0);
   HEAP32[(($477)>>2)]=$p_0;
   var $478=(($p_0+8)|0);
   HEAP32[(($478)>>2)]=$p_0;
   label = 136; break;
  case 131: 
   _abort();
   throw "Reached an unreachable!";
  case 132: 
   var $481=(($T_0+8)|0);
   var $482=HEAP32[(($481)>>2)];
   var $483=$T_0;
   var $484=HEAP32[((((3280)|0))>>2)];
   var $485=(($483)>>>(0)) < (($484)>>>(0));
   if ($485) { label = 135; break; } else { label = 133; break; }
  case 133: 
   var $487=$482;
   var $488=(($487)>>>(0)) < (($484)>>>(0));
   if ($488) { label = 135; break; } else { label = 134; break; }
  case 134: 
   var $490=(($482+12)|0);
   HEAP32[(($490)>>2)]=$409;
   HEAP32[(($481)>>2)]=$409;
   var $491=(($p_0+8)|0);
   var $_c244=$482;
   HEAP32[(($491)>>2)]=$_c244;
   var $492=(($p_0+12)|0);
   var $T_0_c=$T_0;
   HEAP32[(($492)>>2)]=$T_0_c;
   var $493=(($p_0+24)|0);
   HEAP32[(($493)>>2)]=0;
   label = 136; break;
  case 135: 
   _abort();
   throw "Reached an unreachable!";
  case 136: 
   var $495=HEAP32[((((3296)|0))>>2)];
   var $496=((($495)-(1))|0);
   HEAP32[((((3296)|0))>>2)]=$496;
   var $497=(($496)|(0))==0;
   if ($497) { var $sp_0_in_i = ((3720)|0);label = 137; break; } else { label = 140; break; }
  case 137: 
   var $sp_0_in_i;
   var $sp_0_i=HEAP32[(($sp_0_in_i)>>2)];
   var $498=(($sp_0_i)|(0))==0;
   var $499=(($sp_0_i+8)|0);
   if ($498) { label = 138; break; } else { var $sp_0_in_i = $499;label = 137; break; }
  case 138: 
   HEAP32[((((3296)|0))>>2)]=-1;
   label = 140; break;
  case 139: 
   _abort();
   throw "Reached an unreachable!";
  case 140: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
Module["_free"] = _free;
function _realloc($oldmem, $bytes) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($oldmem)|(0))==0;
   if ($1) { label = 2; break; } else { label = 3; break; }
  case 2: 
   var $3=_malloc($bytes);
   var $mem_0 = $3;label = 11; break;
  case 3: 
   var $5=(($bytes)>>>(0)) > 4294967231;
   if ($5) { label = 4; break; } else { label = 5; break; }
  case 4: 
   var $7=___errno_location();
   HEAP32[(($7)>>2)]=12;
   var $mem_0 = 0;label = 11; break;
  case 5: 
   var $9=(($bytes)>>>(0)) < 11;
   if ($9) { var $14 = 16;label = 7; break; } else { label = 6; break; }
  case 6: 
   var $11=((($bytes)+(11))|0);
   var $12=$11 & -8;
   var $14 = $12;label = 7; break;
  case 7: 
   var $14;
   var $15=((($oldmem)-(8))|0);
   var $16=$15;
   var $17=_try_realloc_chunk($16, $14);
   var $18=(($17)|(0))==0;
   if ($18) { label = 9; break; } else { label = 8; break; }
  case 8: 
   var $20=(($17+8)|0);
   var $21=$20;
   var $mem_0 = $21;label = 11; break;
  case 9: 
   var $23=_malloc($bytes);
   var $24=(($23)|(0))==0;
   if ($24) { var $mem_0 = 0;label = 11; break; } else { label = 10; break; }
  case 10: 
   var $26=((($oldmem)-(4))|0);
   var $27=$26;
   var $28=HEAP32[(($27)>>2)];
   var $29=$28 & -8;
   var $30=$28 & 3;
   var $31=(($30)|(0))==0;
   var $32=$31 ? 8 : 4;
   var $33=((($29)-($32))|0);
   var $34=(($33)>>>(0)) < (($bytes)>>>(0));
   var $35=$34 ? $33 : $bytes;
   assert($35 % 1 === 0);(_memcpy($23, $oldmem, $35)|0);
   _free($oldmem);
   var $mem_0 = $23;label = 11; break;
  case 11: 
   var $mem_0;
   return $mem_0;
  default: assert(0, "bad label: " + label);
 }
}
Module["_realloc"] = _realloc;
function _try_realloc_chunk($p, $nb) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($p+4)|0);
   var $2=HEAP32[(($1)>>2)];
   var $3=$2 & -8;
   var $4=$p;
   var $5=(($4+$3)|0);
   var $6=$5;
   var $7=HEAP32[((((3280)|0))>>2)];
   var $8=(($4)>>>(0)) < (($7)>>>(0));
   if ($8) { label = 72; break; } else { label = 2; break; }
  case 2: 
   var $10=$2 & 3;
   var $11=(($10)|(0))!=1;
   var $12=(($4)>>>(0)) < (($5)>>>(0));
   var $or_cond=$11 & $12;
   if ($or_cond) { label = 3; break; } else { label = 72; break; }
  case 3: 
   var $_sum3334=$3 | 4;
   var $14=(($4+$_sum3334)|0);
   var $15=$14;
   var $16=HEAP32[(($15)>>2)];
   var $17=$16 & 1;
   var $phitmp=(($17)|(0))==0;
   if ($phitmp) { label = 72; break; } else { label = 4; break; }
  case 4: 
   var $19=(($10)|(0))==0;
   if ($19) { label = 5; break; } else { label = 9; break; }
  case 5: 
   var $21=(($nb)>>>(0)) < 256;
   if ($21) { var $newp_0 = 0;label = 73; break; } else { label = 6; break; }
  case 6: 
   var $23=((($nb)+(4))|0);
   var $24=(($3)>>>(0)) < (($23)>>>(0));
   if ($24) { label = 8; break; } else { label = 7; break; }
  case 7: 
   var $26=((($3)-($nb))|0);
   var $27=HEAP32[((((3232)|0))>>2)];
   var $28=$27 << 1;
   var $29=(($26)>>>(0)) > (($28)>>>(0));
   if ($29) { label = 8; break; } else { var $newp_0 = $p;label = 73; break; }
  case 8: 
   var $newp_0 = 0;label = 73; break;
  case 9: 
   var $32=(($3)>>>(0)) < (($nb)>>>(0));
   if ($32) { label = 12; break; } else { label = 10; break; }
  case 10: 
   var $34=((($3)-($nb))|0);
   var $35=(($34)>>>(0)) > 15;
   if ($35) { label = 11; break; } else { var $newp_0 = $p;label = 73; break; }
  case 11: 
   var $37=(($4+$nb)|0);
   var $38=$37;
   var $39=$2 & 1;
   var $40=$39 | $nb;
   var $41=$40 | 2;
   HEAP32[(($1)>>2)]=$41;
   var $_sum29=((($nb)+(4))|0);
   var $42=(($4+$_sum29)|0);
   var $43=$42;
   var $44=$34 | 3;
   HEAP32[(($43)>>2)]=$44;
   var $45=HEAP32[(($15)>>2)];
   var $46=$45 | 1;
   HEAP32[(($15)>>2)]=$46;
   _dispose_chunk($38, $34);
   var $newp_0 = $p;label = 73; break;
  case 12: 
   var $48=HEAP32[((((3288)|0))>>2)];
   var $49=(($6)|(0))==(($48)|(0));
   if ($49) { label = 13; break; } else { label = 15; break; }
  case 13: 
   var $51=HEAP32[((((3276)|0))>>2)];
   var $52=((($51)+($3))|0);
   var $53=(($52)>>>(0)) > (($nb)>>>(0));
   if ($53) { label = 14; break; } else { var $newp_0 = 0;label = 73; break; }
  case 14: 
   var $55=((($52)-($nb))|0);
   var $56=(($4+$nb)|0);
   var $57=$56;
   var $58=$2 & 1;
   var $59=$58 | $nb;
   var $60=$59 | 2;
   HEAP32[(($1)>>2)]=$60;
   var $_sum28=((($nb)+(4))|0);
   var $61=(($4+$_sum28)|0);
   var $62=$61;
   var $63=$55 | 1;
   HEAP32[(($62)>>2)]=$63;
   HEAP32[((((3288)|0))>>2)]=$57;
   HEAP32[((((3276)|0))>>2)]=$55;
   var $newp_0 = $p;label = 73; break;
  case 15: 
   var $65=HEAP32[((((3284)|0))>>2)];
   var $66=(($6)|(0))==(($65)|(0));
   if ($66) { label = 16; break; } else { label = 21; break; }
  case 16: 
   var $68=HEAP32[((((3272)|0))>>2)];
   var $69=((($68)+($3))|0);
   var $70=(($69)>>>(0)) < (($nb)>>>(0));
   if ($70) { var $newp_0 = 0;label = 73; break; } else { label = 17; break; }
  case 17: 
   var $72=((($69)-($nb))|0);
   var $73=(($72)>>>(0)) > 15;
   if ($73) { label = 18; break; } else { label = 19; break; }
  case 18: 
   var $75=(($4+$nb)|0);
   var $76=$75;
   var $77=(($4+$69)|0);
   var $78=$2 & 1;
   var $79=$78 | $nb;
   var $80=$79 | 2;
   HEAP32[(($1)>>2)]=$80;
   var $_sum25=((($nb)+(4))|0);
   var $81=(($4+$_sum25)|0);
   var $82=$81;
   var $83=$72 | 1;
   HEAP32[(($82)>>2)]=$83;
   var $84=$77;
   HEAP32[(($84)>>2)]=$72;
   var $_sum26=((($69)+(4))|0);
   var $85=(($4+$_sum26)|0);
   var $86=$85;
   var $87=HEAP32[(($86)>>2)];
   var $88=$87 & -2;
   HEAP32[(($86)>>2)]=$88;
   var $storemerge = $76;var $storemerge27 = $72;label = 20; break;
  case 19: 
   var $90=$2 & 1;
   var $91=$90 | $69;
   var $92=$91 | 2;
   HEAP32[(($1)>>2)]=$92;
   var $_sum23=((($69)+(4))|0);
   var $93=(($4+$_sum23)|0);
   var $94=$93;
   var $95=HEAP32[(($94)>>2)];
   var $96=$95 | 1;
   HEAP32[(($94)>>2)]=$96;
   var $storemerge = 0;var $storemerge27 = 0;label = 20; break;
  case 20: 
   var $storemerge27;
   var $storemerge;
   HEAP32[((((3272)|0))>>2)]=$storemerge27;
   HEAP32[((((3284)|0))>>2)]=$storemerge;
   var $newp_0 = $p;label = 73; break;
  case 21: 
   var $99=$16 & 2;
   var $100=(($99)|(0))==0;
   if ($100) { label = 22; break; } else { var $newp_0 = 0;label = 73; break; }
  case 22: 
   var $102=$16 & -8;
   var $103=((($102)+($3))|0);
   var $104=(($103)>>>(0)) < (($nb)>>>(0));
   if ($104) { var $newp_0 = 0;label = 73; break; } else { label = 23; break; }
  case 23: 
   var $106=((($103)-($nb))|0);
   var $107=$16 >>> 3;
   var $108=(($16)>>>(0)) < 256;
   if ($108) { label = 24; break; } else { label = 36; break; }
  case 24: 
   var $_sum17=((($3)+(8))|0);
   var $110=(($4+$_sum17)|0);
   var $111=$110;
   var $112=HEAP32[(($111)>>2)];
   var $_sum18=((($3)+(12))|0);
   var $113=(($4+$_sum18)|0);
   var $114=$113;
   var $115=HEAP32[(($114)>>2)];
   var $116=$107 << 1;
   var $117=((3304+($116<<2))|0);
   var $118=$117;
   var $119=(($112)|(0))==(($118)|(0));
   if ($119) { label = 27; break; } else { label = 25; break; }
  case 25: 
   var $121=$112;
   var $122=(($121)>>>(0)) < (($7)>>>(0));
   if ($122) { label = 35; break; } else { label = 26; break; }
  case 26: 
   var $124=(($112+12)|0);
   var $125=HEAP32[(($124)>>2)];
   var $126=(($125)|(0))==(($6)|(0));
   if ($126) { label = 27; break; } else { label = 35; break; }
  case 27: 
   var $127=(($115)|(0))==(($112)|(0));
   if ($127) { label = 28; break; } else { label = 29; break; }
  case 28: 
   var $129=1 << $107;
   var $130=$129 ^ -1;
   var $131=HEAP32[((((3264)|0))>>2)];
   var $132=$131 & $130;
   HEAP32[((((3264)|0))>>2)]=$132;
   label = 69; break;
  case 29: 
   var $134=(($115)|(0))==(($118)|(0));
   if ($134) { label = 30; break; } else { label = 31; break; }
  case 30: 
   var $_pre=(($115+8)|0);
   var $_pre_phi = $_pre;label = 33; break;
  case 31: 
   var $136=$115;
   var $137=(($136)>>>(0)) < (($7)>>>(0));
   if ($137) { label = 34; break; } else { label = 32; break; }
  case 32: 
   var $139=(($115+8)|0);
   var $140=HEAP32[(($139)>>2)];
   var $141=(($140)|(0))==(($6)|(0));
   if ($141) { var $_pre_phi = $139;label = 33; break; } else { label = 34; break; }
  case 33: 
   var $_pre_phi;
   var $142=(($112+12)|0);
   HEAP32[(($142)>>2)]=$115;
   HEAP32[(($_pre_phi)>>2)]=$112;
   label = 69; break;
  case 34: 
   _abort();
   throw "Reached an unreachable!";
  case 35: 
   _abort();
   throw "Reached an unreachable!";
  case 36: 
   var $144=$5;
   var $_sum=((($3)+(24))|0);
   var $145=(($4+$_sum)|0);
   var $146=$145;
   var $147=HEAP32[(($146)>>2)];
   var $_sum2=((($3)+(12))|0);
   var $148=(($4+$_sum2)|0);
   var $149=$148;
   var $150=HEAP32[(($149)>>2)];
   var $151=(($150)|(0))==(($144)|(0));
   if ($151) { label = 42; break; } else { label = 37; break; }
  case 37: 
   var $_sum14=((($3)+(8))|0);
   var $153=(($4+$_sum14)|0);
   var $154=$153;
   var $155=HEAP32[(($154)>>2)];
   var $156=$155;
   var $157=(($156)>>>(0)) < (($7)>>>(0));
   if ($157) { label = 41; break; } else { label = 38; break; }
  case 38: 
   var $159=(($155+12)|0);
   var $160=HEAP32[(($159)>>2)];
   var $161=(($160)|(0))==(($144)|(0));
   if ($161) { label = 39; break; } else { label = 41; break; }
  case 39: 
   var $163=(($150+8)|0);
   var $164=HEAP32[(($163)>>2)];
   var $165=(($164)|(0))==(($144)|(0));
   if ($165) { label = 40; break; } else { label = 41; break; }
  case 40: 
   HEAP32[(($159)>>2)]=$150;
   HEAP32[(($163)>>2)]=$155;
   var $R_1 = $150;label = 49; break;
  case 41: 
   _abort();
   throw "Reached an unreachable!";
  case 42: 
   var $_sum4=((($3)+(20))|0);
   var $168=(($4+$_sum4)|0);
   var $169=$168;
   var $170=HEAP32[(($169)>>2)];
   var $171=(($170)|(0))==0;
   if ($171) { label = 43; break; } else { var $R_0 = $170;var $RP_0 = $169;label = 44; break; }
  case 43: 
   var $_sum3=((($3)+(16))|0);
   var $173=(($4+$_sum3)|0);
   var $174=$173;
   var $175=HEAP32[(($174)>>2)];
   var $176=(($175)|(0))==0;
   if ($176) { var $R_1 = 0;label = 49; break; } else { var $R_0 = $175;var $RP_0 = $174;label = 44; break; }
  case 44: 
   var $RP_0;
   var $R_0;
   var $177=(($R_0+20)|0);
   var $178=HEAP32[(($177)>>2)];
   var $179=(($178)|(0))==0;
   if ($179) { label = 45; break; } else { var $R_0 = $178;var $RP_0 = $177;label = 44; break; }
  case 45: 
   var $181=(($R_0+16)|0);
   var $182=HEAP32[(($181)>>2)];
   var $183=(($182)|(0))==0;
   if ($183) { label = 46; break; } else { var $R_0 = $182;var $RP_0 = $181;label = 44; break; }
  case 46: 
   var $185=$RP_0;
   var $186=(($185)>>>(0)) < (($7)>>>(0));
   if ($186) { label = 48; break; } else { label = 47; break; }
  case 47: 
   HEAP32[(($RP_0)>>2)]=0;
   var $R_1 = $R_0;label = 49; break;
  case 48: 
   _abort();
   throw "Reached an unreachable!";
  case 49: 
   var $R_1;
   var $190=(($147)|(0))==0;
   if ($190) { label = 69; break; } else { label = 50; break; }
  case 50: 
   var $_sum11=((($3)+(28))|0);
   var $192=(($4+$_sum11)|0);
   var $193=$192;
   var $194=HEAP32[(($193)>>2)];
   var $195=((3568+($194<<2))|0);
   var $196=HEAP32[(($195)>>2)];
   var $197=(($144)|(0))==(($196)|(0));
   if ($197) { label = 51; break; } else { label = 53; break; }
  case 51: 
   HEAP32[(($195)>>2)]=$R_1;
   var $cond=(($R_1)|(0))==0;
   if ($cond) { label = 52; break; } else { label = 59; break; }
  case 52: 
   var $199=HEAP32[(($193)>>2)];
   var $200=1 << $199;
   var $201=$200 ^ -1;
   var $202=HEAP32[((((3268)|0))>>2)];
   var $203=$202 & $201;
   HEAP32[((((3268)|0))>>2)]=$203;
   label = 69; break;
  case 53: 
   var $205=$147;
   var $206=HEAP32[((((3280)|0))>>2)];
   var $207=(($205)>>>(0)) < (($206)>>>(0));
   if ($207) { label = 57; break; } else { label = 54; break; }
  case 54: 
   var $209=(($147+16)|0);
   var $210=HEAP32[(($209)>>2)];
   var $211=(($210)|(0))==(($144)|(0));
   if ($211) { label = 55; break; } else { label = 56; break; }
  case 55: 
   HEAP32[(($209)>>2)]=$R_1;
   label = 58; break;
  case 56: 
   var $214=(($147+20)|0);
   HEAP32[(($214)>>2)]=$R_1;
   label = 58; break;
  case 57: 
   _abort();
   throw "Reached an unreachable!";
  case 58: 
   var $217=(($R_1)|(0))==0;
   if ($217) { label = 69; break; } else { label = 59; break; }
  case 59: 
   var $219=$R_1;
   var $220=HEAP32[((((3280)|0))>>2)];
   var $221=(($219)>>>(0)) < (($220)>>>(0));
   if ($221) { label = 68; break; } else { label = 60; break; }
  case 60: 
   var $223=(($R_1+24)|0);
   HEAP32[(($223)>>2)]=$147;
   var $_sum12=((($3)+(16))|0);
   var $224=(($4+$_sum12)|0);
   var $225=$224;
   var $226=HEAP32[(($225)>>2)];
   var $227=(($226)|(0))==0;
   if ($227) { label = 64; break; } else { label = 61; break; }
  case 61: 
   var $229=$226;
   var $230=HEAP32[((((3280)|0))>>2)];
   var $231=(($229)>>>(0)) < (($230)>>>(0));
   if ($231) { label = 63; break; } else { label = 62; break; }
  case 62: 
   var $233=(($R_1+16)|0);
   HEAP32[(($233)>>2)]=$226;
   var $234=(($226+24)|0);
   HEAP32[(($234)>>2)]=$R_1;
   label = 64; break;
  case 63: 
   _abort();
   throw "Reached an unreachable!";
  case 64: 
   var $_sum13=((($3)+(20))|0);
   var $237=(($4+$_sum13)|0);
   var $238=$237;
   var $239=HEAP32[(($238)>>2)];
   var $240=(($239)|(0))==0;
   if ($240) { label = 69; break; } else { label = 65; break; }
  case 65: 
   var $242=$239;
   var $243=HEAP32[((((3280)|0))>>2)];
   var $244=(($242)>>>(0)) < (($243)>>>(0));
   if ($244) { label = 67; break; } else { label = 66; break; }
  case 66: 
   var $246=(($R_1+20)|0);
   HEAP32[(($246)>>2)]=$239;
   var $247=(($239+24)|0);
   HEAP32[(($247)>>2)]=$R_1;
   label = 69; break;
  case 67: 
   _abort();
   throw "Reached an unreachable!";
  case 68: 
   _abort();
   throw "Reached an unreachable!";
  case 69: 
   var $251=(($106)>>>(0)) < 16;
   if ($251) { label = 70; break; } else { label = 71; break; }
  case 70: 
   var $253=HEAP32[(($1)>>2)];
   var $254=$253 & 1;
   var $255=$103 | $254;
   var $256=$255 | 2;
   HEAP32[(($1)>>2)]=$256;
   var $_sum910=$103 | 4;
   var $257=(($4+$_sum910)|0);
   var $258=$257;
   var $259=HEAP32[(($258)>>2)];
   var $260=$259 | 1;
   HEAP32[(($258)>>2)]=$260;
   var $newp_0 = $p;label = 73; break;
  case 71: 
   var $262=(($4+$nb)|0);
   var $263=$262;
   var $264=HEAP32[(($1)>>2)];
   var $265=$264 & 1;
   var $266=$265 | $nb;
   var $267=$266 | 2;
   HEAP32[(($1)>>2)]=$267;
   var $_sum5=((($nb)+(4))|0);
   var $268=(($4+$_sum5)|0);
   var $269=$268;
   var $270=$106 | 3;
   HEAP32[(($269)>>2)]=$270;
   var $_sum78=$103 | 4;
   var $271=(($4+$_sum78)|0);
   var $272=$271;
   var $273=HEAP32[(($272)>>2)];
   var $274=$273 | 1;
   HEAP32[(($272)>>2)]=$274;
   _dispose_chunk($263, $106);
   var $newp_0 = $p;label = 73; break;
  case 72: 
   _abort();
   throw "Reached an unreachable!";
  case 73: 
   var $newp_0;
   return $newp_0;
  default: assert(0, "bad label: " + label);
 }
}
function _dispose_chunk($p, $psize) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=$p;
   var $2=(($1+$psize)|0);
   var $3=$2;
   var $4=(($p+4)|0);
   var $5=HEAP32[(($4)>>2)];
   var $6=$5 & 1;
   var $7=(($6)|(0))==0;
   if ($7) { label = 2; break; } else { var $_0 = $p;var $_0277 = $psize;label = 54; break; }
  case 2: 
   var $9=(($p)|0);
   var $10=HEAP32[(($9)>>2)];
   var $11=$5 & 3;
   var $12=(($11)|(0))==0;
   if ($12) { label = 134; break; } else { label = 3; break; }
  case 3: 
   var $14=(((-$10))|0);
   var $15=(($1+$14)|0);
   var $16=$15;
   var $17=((($10)+($psize))|0);
   var $18=HEAP32[((((3280)|0))>>2)];
   var $19=(($15)>>>(0)) < (($18)>>>(0));
   if ($19) { label = 53; break; } else { label = 4; break; }
  case 4: 
   var $21=HEAP32[((((3284)|0))>>2)];
   var $22=(($16)|(0))==(($21)|(0));
   if ($22) { label = 51; break; } else { label = 5; break; }
  case 5: 
   var $24=$10 >>> 3;
   var $25=(($10)>>>(0)) < 256;
   if ($25) { label = 6; break; } else { label = 18; break; }
  case 6: 
   var $_sum35=(((8)-($10))|0);
   var $27=(($1+$_sum35)|0);
   var $28=$27;
   var $29=HEAP32[(($28)>>2)];
   var $_sum36=(((12)-($10))|0);
   var $30=(($1+$_sum36)|0);
   var $31=$30;
   var $32=HEAP32[(($31)>>2)];
   var $33=$24 << 1;
   var $34=((3304+($33<<2))|0);
   var $35=$34;
   var $36=(($29)|(0))==(($35)|(0));
   if ($36) { label = 9; break; } else { label = 7; break; }
  case 7: 
   var $38=$29;
   var $39=(($38)>>>(0)) < (($18)>>>(0));
   if ($39) { label = 17; break; } else { label = 8; break; }
  case 8: 
   var $41=(($29+12)|0);
   var $42=HEAP32[(($41)>>2)];
   var $43=(($42)|(0))==(($16)|(0));
   if ($43) { label = 9; break; } else { label = 17; break; }
  case 9: 
   var $44=(($32)|(0))==(($29)|(0));
   if ($44) { label = 10; break; } else { label = 11; break; }
  case 10: 
   var $46=1 << $24;
   var $47=$46 ^ -1;
   var $48=HEAP32[((((3264)|0))>>2)];
   var $49=$48 & $47;
   HEAP32[((((3264)|0))>>2)]=$49;
   var $_0 = $16;var $_0277 = $17;label = 54; break;
  case 11: 
   var $51=(($32)|(0))==(($35)|(0));
   if ($51) { label = 12; break; } else { label = 13; break; }
  case 12: 
   var $_pre62=(($32+8)|0);
   var $_pre_phi63 = $_pre62;label = 15; break;
  case 13: 
   var $53=$32;
   var $54=(($53)>>>(0)) < (($18)>>>(0));
   if ($54) { label = 16; break; } else { label = 14; break; }
  case 14: 
   var $56=(($32+8)|0);
   var $57=HEAP32[(($56)>>2)];
   var $58=(($57)|(0))==(($16)|(0));
   if ($58) { var $_pre_phi63 = $56;label = 15; break; } else { label = 16; break; }
  case 15: 
   var $_pre_phi63;
   var $59=(($29+12)|0);
   HEAP32[(($59)>>2)]=$32;
   HEAP32[(($_pre_phi63)>>2)]=$29;
   var $_0 = $16;var $_0277 = $17;label = 54; break;
  case 16: 
   _abort();
   throw "Reached an unreachable!";
  case 17: 
   _abort();
   throw "Reached an unreachable!";
  case 18: 
   var $61=$15;
   var $_sum26=(((24)-($10))|0);
   var $62=(($1+$_sum26)|0);
   var $63=$62;
   var $64=HEAP32[(($63)>>2)];
   var $_sum27=(((12)-($10))|0);
   var $65=(($1+$_sum27)|0);
   var $66=$65;
   var $67=HEAP32[(($66)>>2)];
   var $68=(($67)|(0))==(($61)|(0));
   if ($68) { label = 24; break; } else { label = 19; break; }
  case 19: 
   var $_sum33=(((8)-($10))|0);
   var $70=(($1+$_sum33)|0);
   var $71=$70;
   var $72=HEAP32[(($71)>>2)];
   var $73=$72;
   var $74=(($73)>>>(0)) < (($18)>>>(0));
   if ($74) { label = 23; break; } else { label = 20; break; }
  case 20: 
   var $76=(($72+12)|0);
   var $77=HEAP32[(($76)>>2)];
   var $78=(($77)|(0))==(($61)|(0));
   if ($78) { label = 21; break; } else { label = 23; break; }
  case 21: 
   var $80=(($67+8)|0);
   var $81=HEAP32[(($80)>>2)];
   var $82=(($81)|(0))==(($61)|(0));
   if ($82) { label = 22; break; } else { label = 23; break; }
  case 22: 
   HEAP32[(($76)>>2)]=$67;
   HEAP32[(($80)>>2)]=$72;
   var $R_1 = $67;label = 31; break;
  case 23: 
   _abort();
   throw "Reached an unreachable!";
  case 24: 
   var $_sum28=(((16)-($10))|0);
   var $_sum29=((($_sum28)+(4))|0);
   var $85=(($1+$_sum29)|0);
   var $86=$85;
   var $87=HEAP32[(($86)>>2)];
   var $88=(($87)|(0))==0;
   if ($88) { label = 25; break; } else { var $R_0 = $87;var $RP_0 = $86;label = 26; break; }
  case 25: 
   var $90=(($1+$_sum28)|0);
   var $91=$90;
   var $92=HEAP32[(($91)>>2)];
   var $93=(($92)|(0))==0;
   if ($93) { var $R_1 = 0;label = 31; break; } else { var $R_0 = $92;var $RP_0 = $91;label = 26; break; }
  case 26: 
   var $RP_0;
   var $R_0;
   var $94=(($R_0+20)|0);
   var $95=HEAP32[(($94)>>2)];
   var $96=(($95)|(0))==0;
   if ($96) { label = 27; break; } else { var $R_0 = $95;var $RP_0 = $94;label = 26; break; }
  case 27: 
   var $98=(($R_0+16)|0);
   var $99=HEAP32[(($98)>>2)];
   var $100=(($99)|(0))==0;
   if ($100) { label = 28; break; } else { var $R_0 = $99;var $RP_0 = $98;label = 26; break; }
  case 28: 
   var $102=$RP_0;
   var $103=(($102)>>>(0)) < (($18)>>>(0));
   if ($103) { label = 30; break; } else { label = 29; break; }
  case 29: 
   HEAP32[(($RP_0)>>2)]=0;
   var $R_1 = $R_0;label = 31; break;
  case 30: 
   _abort();
   throw "Reached an unreachable!";
  case 31: 
   var $R_1;
   var $107=(($64)|(0))==0;
   if ($107) { var $_0 = $16;var $_0277 = $17;label = 54; break; } else { label = 32; break; }
  case 32: 
   var $_sum30=(((28)-($10))|0);
   var $109=(($1+$_sum30)|0);
   var $110=$109;
   var $111=HEAP32[(($110)>>2)];
   var $112=((3568+($111<<2))|0);
   var $113=HEAP32[(($112)>>2)];
   var $114=(($61)|(0))==(($113)|(0));
   if ($114) { label = 33; break; } else { label = 35; break; }
  case 33: 
   HEAP32[(($112)>>2)]=$R_1;
   var $cond=(($R_1)|(0))==0;
   if ($cond) { label = 34; break; } else { label = 41; break; }
  case 34: 
   var $116=HEAP32[(($110)>>2)];
   var $117=1 << $116;
   var $118=$117 ^ -1;
   var $119=HEAP32[((((3268)|0))>>2)];
   var $120=$119 & $118;
   HEAP32[((((3268)|0))>>2)]=$120;
   var $_0 = $16;var $_0277 = $17;label = 54; break;
  case 35: 
   var $122=$64;
   var $123=HEAP32[((((3280)|0))>>2)];
   var $124=(($122)>>>(0)) < (($123)>>>(0));
   if ($124) { label = 39; break; } else { label = 36; break; }
  case 36: 
   var $126=(($64+16)|0);
   var $127=HEAP32[(($126)>>2)];
   var $128=(($127)|(0))==(($61)|(0));
   if ($128) { label = 37; break; } else { label = 38; break; }
  case 37: 
   HEAP32[(($126)>>2)]=$R_1;
   label = 40; break;
  case 38: 
   var $131=(($64+20)|0);
   HEAP32[(($131)>>2)]=$R_1;
   label = 40; break;
  case 39: 
   _abort();
   throw "Reached an unreachable!";
  case 40: 
   var $134=(($R_1)|(0))==0;
   if ($134) { var $_0 = $16;var $_0277 = $17;label = 54; break; } else { label = 41; break; }
  case 41: 
   var $136=$R_1;
   var $137=HEAP32[((((3280)|0))>>2)];
   var $138=(($136)>>>(0)) < (($137)>>>(0));
   if ($138) { label = 50; break; } else { label = 42; break; }
  case 42: 
   var $140=(($R_1+24)|0);
   HEAP32[(($140)>>2)]=$64;
   var $_sum31=(((16)-($10))|0);
   var $141=(($1+$_sum31)|0);
   var $142=$141;
   var $143=HEAP32[(($142)>>2)];
   var $144=(($143)|(0))==0;
   if ($144) { label = 46; break; } else { label = 43; break; }
  case 43: 
   var $146=$143;
   var $147=HEAP32[((((3280)|0))>>2)];
   var $148=(($146)>>>(0)) < (($147)>>>(0));
   if ($148) { label = 45; break; } else { label = 44; break; }
  case 44: 
   var $150=(($R_1+16)|0);
   HEAP32[(($150)>>2)]=$143;
   var $151=(($143+24)|0);
   HEAP32[(($151)>>2)]=$R_1;
   label = 46; break;
  case 45: 
   _abort();
   throw "Reached an unreachable!";
  case 46: 
   var $_sum32=((($_sum31)+(4))|0);
   var $154=(($1+$_sum32)|0);
   var $155=$154;
   var $156=HEAP32[(($155)>>2)];
   var $157=(($156)|(0))==0;
   if ($157) { var $_0 = $16;var $_0277 = $17;label = 54; break; } else { label = 47; break; }
  case 47: 
   var $159=$156;
   var $160=HEAP32[((((3280)|0))>>2)];
   var $161=(($159)>>>(0)) < (($160)>>>(0));
   if ($161) { label = 49; break; } else { label = 48; break; }
  case 48: 
   var $163=(($R_1+20)|0);
   HEAP32[(($163)>>2)]=$156;
   var $164=(($156+24)|0);
   HEAP32[(($164)>>2)]=$R_1;
   var $_0 = $16;var $_0277 = $17;label = 54; break;
  case 49: 
   _abort();
   throw "Reached an unreachable!";
  case 50: 
   _abort();
   throw "Reached an unreachable!";
  case 51: 
   var $_sum=((($psize)+(4))|0);
   var $168=(($1+$_sum)|0);
   var $169=$168;
   var $170=HEAP32[(($169)>>2)];
   var $171=$170 & 3;
   var $172=(($171)|(0))==3;
   if ($172) { label = 52; break; } else { var $_0 = $16;var $_0277 = $17;label = 54; break; }
  case 52: 
   HEAP32[((((3272)|0))>>2)]=$17;
   var $174=HEAP32[(($169)>>2)];
   var $175=$174 & -2;
   HEAP32[(($169)>>2)]=$175;
   var $176=$17 | 1;
   var $_sum24=(((4)-($10))|0);
   var $177=(($1+$_sum24)|0);
   var $178=$177;
   HEAP32[(($178)>>2)]=$176;
   var $179=$2;
   HEAP32[(($179)>>2)]=$17;
   label = 134; break;
  case 53: 
   _abort();
   throw "Reached an unreachable!";
  case 54: 
   var $_0277;
   var $_0;
   var $181=HEAP32[((((3280)|0))>>2)];
   var $182=(($2)>>>(0)) < (($181)>>>(0));
   if ($182) { label = 133; break; } else { label = 55; break; }
  case 55: 
   var $_sum1=((($psize)+(4))|0);
   var $184=(($1+$_sum1)|0);
   var $185=$184;
   var $186=HEAP32[(($185)>>2)];
   var $187=$186 & 2;
   var $188=(($187)|(0))==0;
   if ($188) { label = 56; break; } else { label = 109; break; }
  case 56: 
   var $190=HEAP32[((((3288)|0))>>2)];
   var $191=(($3)|(0))==(($190)|(0));
   if ($191) { label = 57; break; } else { label = 59; break; }
  case 57: 
   var $193=HEAP32[((((3276)|0))>>2)];
   var $194=((($193)+($_0277))|0);
   HEAP32[((((3276)|0))>>2)]=$194;
   HEAP32[((((3288)|0))>>2)]=$_0;
   var $195=$194 | 1;
   var $196=(($_0+4)|0);
   HEAP32[(($196)>>2)]=$195;
   var $197=HEAP32[((((3284)|0))>>2)];
   var $198=(($_0)|(0))==(($197)|(0));
   if ($198) { label = 58; break; } else { label = 134; break; }
  case 58: 
   HEAP32[((((3284)|0))>>2)]=0;
   HEAP32[((((3272)|0))>>2)]=0;
   label = 134; break;
  case 59: 
   var $201=HEAP32[((((3284)|0))>>2)];
   var $202=(($3)|(0))==(($201)|(0));
   if ($202) { label = 60; break; } else { label = 61; break; }
  case 60: 
   var $204=HEAP32[((((3272)|0))>>2)];
   var $205=((($204)+($_0277))|0);
   HEAP32[((((3272)|0))>>2)]=$205;
   HEAP32[((((3284)|0))>>2)]=$_0;
   var $206=$205 | 1;
   var $207=(($_0+4)|0);
   HEAP32[(($207)>>2)]=$206;
   var $208=$_0;
   var $209=(($208+$205)|0);
   var $210=$209;
   HEAP32[(($210)>>2)]=$205;
   label = 134; break;
  case 61: 
   var $212=$186 & -8;
   var $213=((($212)+($_0277))|0);
   var $214=$186 >>> 3;
   var $215=(($186)>>>(0)) < 256;
   if ($215) { label = 62; break; } else { label = 74; break; }
  case 62: 
   var $_sum20=((($psize)+(8))|0);
   var $217=(($1+$_sum20)|0);
   var $218=$217;
   var $219=HEAP32[(($218)>>2)];
   var $_sum21=((($psize)+(12))|0);
   var $220=(($1+$_sum21)|0);
   var $221=$220;
   var $222=HEAP32[(($221)>>2)];
   var $223=$214 << 1;
   var $224=((3304+($223<<2))|0);
   var $225=$224;
   var $226=(($219)|(0))==(($225)|(0));
   if ($226) { label = 65; break; } else { label = 63; break; }
  case 63: 
   var $228=$219;
   var $229=(($228)>>>(0)) < (($181)>>>(0));
   if ($229) { label = 73; break; } else { label = 64; break; }
  case 64: 
   var $231=(($219+12)|0);
   var $232=HEAP32[(($231)>>2)];
   var $233=(($232)|(0))==(($3)|(0));
   if ($233) { label = 65; break; } else { label = 73; break; }
  case 65: 
   var $234=(($222)|(0))==(($219)|(0));
   if ($234) { label = 66; break; } else { label = 67; break; }
  case 66: 
   var $236=1 << $214;
   var $237=$236 ^ -1;
   var $238=HEAP32[((((3264)|0))>>2)];
   var $239=$238 & $237;
   HEAP32[((((3264)|0))>>2)]=$239;
   label = 107; break;
  case 67: 
   var $241=(($222)|(0))==(($225)|(0));
   if ($241) { label = 68; break; } else { label = 69; break; }
  case 68: 
   var $_pre60=(($222+8)|0);
   var $_pre_phi61 = $_pre60;label = 71; break;
  case 69: 
   var $243=$222;
   var $244=(($243)>>>(0)) < (($181)>>>(0));
   if ($244) { label = 72; break; } else { label = 70; break; }
  case 70: 
   var $246=(($222+8)|0);
   var $247=HEAP32[(($246)>>2)];
   var $248=(($247)|(0))==(($3)|(0));
   if ($248) { var $_pre_phi61 = $246;label = 71; break; } else { label = 72; break; }
  case 71: 
   var $_pre_phi61;
   var $249=(($219+12)|0);
   HEAP32[(($249)>>2)]=$222;
   HEAP32[(($_pre_phi61)>>2)]=$219;
   label = 107; break;
  case 72: 
   _abort();
   throw "Reached an unreachable!";
  case 73: 
   _abort();
   throw "Reached an unreachable!";
  case 74: 
   var $251=$2;
   var $_sum2=((($psize)+(24))|0);
   var $252=(($1+$_sum2)|0);
   var $253=$252;
   var $254=HEAP32[(($253)>>2)];
   var $_sum3=((($psize)+(12))|0);
   var $255=(($1+$_sum3)|0);
   var $256=$255;
   var $257=HEAP32[(($256)>>2)];
   var $258=(($257)|(0))==(($251)|(0));
   if ($258) { label = 80; break; } else { label = 75; break; }
  case 75: 
   var $_sum18=((($psize)+(8))|0);
   var $260=(($1+$_sum18)|0);
   var $261=$260;
   var $262=HEAP32[(($261)>>2)];
   var $263=$262;
   var $264=(($263)>>>(0)) < (($181)>>>(0));
   if ($264) { label = 79; break; } else { label = 76; break; }
  case 76: 
   var $266=(($262+12)|0);
   var $267=HEAP32[(($266)>>2)];
   var $268=(($267)|(0))==(($251)|(0));
   if ($268) { label = 77; break; } else { label = 79; break; }
  case 77: 
   var $270=(($257+8)|0);
   var $271=HEAP32[(($270)>>2)];
   var $272=(($271)|(0))==(($251)|(0));
   if ($272) { label = 78; break; } else { label = 79; break; }
  case 78: 
   HEAP32[(($266)>>2)]=$257;
   HEAP32[(($270)>>2)]=$262;
   var $R7_1 = $257;label = 87; break;
  case 79: 
   _abort();
   throw "Reached an unreachable!";
  case 80: 
   var $_sum5=((($psize)+(20))|0);
   var $275=(($1+$_sum5)|0);
   var $276=$275;
   var $277=HEAP32[(($276)>>2)];
   var $278=(($277)|(0))==0;
   if ($278) { label = 81; break; } else { var $R7_0 = $277;var $RP9_0 = $276;label = 82; break; }
  case 81: 
   var $_sum4=((($psize)+(16))|0);
   var $280=(($1+$_sum4)|0);
   var $281=$280;
   var $282=HEAP32[(($281)>>2)];
   var $283=(($282)|(0))==0;
   if ($283) { var $R7_1 = 0;label = 87; break; } else { var $R7_0 = $282;var $RP9_0 = $281;label = 82; break; }
  case 82: 
   var $RP9_0;
   var $R7_0;
   var $284=(($R7_0+20)|0);
   var $285=HEAP32[(($284)>>2)];
   var $286=(($285)|(0))==0;
   if ($286) { label = 83; break; } else { var $R7_0 = $285;var $RP9_0 = $284;label = 82; break; }
  case 83: 
   var $288=(($R7_0+16)|0);
   var $289=HEAP32[(($288)>>2)];
   var $290=(($289)|(0))==0;
   if ($290) { label = 84; break; } else { var $R7_0 = $289;var $RP9_0 = $288;label = 82; break; }
  case 84: 
   var $292=$RP9_0;
   var $293=(($292)>>>(0)) < (($181)>>>(0));
   if ($293) { label = 86; break; } else { label = 85; break; }
  case 85: 
   HEAP32[(($RP9_0)>>2)]=0;
   var $R7_1 = $R7_0;label = 87; break;
  case 86: 
   _abort();
   throw "Reached an unreachable!";
  case 87: 
   var $R7_1;
   var $297=(($254)|(0))==0;
   if ($297) { label = 107; break; } else { label = 88; break; }
  case 88: 
   var $_sum15=((($psize)+(28))|0);
   var $299=(($1+$_sum15)|0);
   var $300=$299;
   var $301=HEAP32[(($300)>>2)];
   var $302=((3568+($301<<2))|0);
   var $303=HEAP32[(($302)>>2)];
   var $304=(($251)|(0))==(($303)|(0));
   if ($304) { label = 89; break; } else { label = 91; break; }
  case 89: 
   HEAP32[(($302)>>2)]=$R7_1;
   var $cond53=(($R7_1)|(0))==0;
   if ($cond53) { label = 90; break; } else { label = 97; break; }
  case 90: 
   var $306=HEAP32[(($300)>>2)];
   var $307=1 << $306;
   var $308=$307 ^ -1;
   var $309=HEAP32[((((3268)|0))>>2)];
   var $310=$309 & $308;
   HEAP32[((((3268)|0))>>2)]=$310;
   label = 107; break;
  case 91: 
   var $312=$254;
   var $313=HEAP32[((((3280)|0))>>2)];
   var $314=(($312)>>>(0)) < (($313)>>>(0));
   if ($314) { label = 95; break; } else { label = 92; break; }
  case 92: 
   var $316=(($254+16)|0);
   var $317=HEAP32[(($316)>>2)];
   var $318=(($317)|(0))==(($251)|(0));
   if ($318) { label = 93; break; } else { label = 94; break; }
  case 93: 
   HEAP32[(($316)>>2)]=$R7_1;
   label = 96; break;
  case 94: 
   var $321=(($254+20)|0);
   HEAP32[(($321)>>2)]=$R7_1;
   label = 96; break;
  case 95: 
   _abort();
   throw "Reached an unreachable!";
  case 96: 
   var $324=(($R7_1)|(0))==0;
   if ($324) { label = 107; break; } else { label = 97; break; }
  case 97: 
   var $326=$R7_1;
   var $327=HEAP32[((((3280)|0))>>2)];
   var $328=(($326)>>>(0)) < (($327)>>>(0));
   if ($328) { label = 106; break; } else { label = 98; break; }
  case 98: 
   var $330=(($R7_1+24)|0);
   HEAP32[(($330)>>2)]=$254;
   var $_sum16=((($psize)+(16))|0);
   var $331=(($1+$_sum16)|0);
   var $332=$331;
   var $333=HEAP32[(($332)>>2)];
   var $334=(($333)|(0))==0;
   if ($334) { label = 102; break; } else { label = 99; break; }
  case 99: 
   var $336=$333;
   var $337=HEAP32[((((3280)|0))>>2)];
   var $338=(($336)>>>(0)) < (($337)>>>(0));
   if ($338) { label = 101; break; } else { label = 100; break; }
  case 100: 
   var $340=(($R7_1+16)|0);
   HEAP32[(($340)>>2)]=$333;
   var $341=(($333+24)|0);
   HEAP32[(($341)>>2)]=$R7_1;
   label = 102; break;
  case 101: 
   _abort();
   throw "Reached an unreachable!";
  case 102: 
   var $_sum17=((($psize)+(20))|0);
   var $344=(($1+$_sum17)|0);
   var $345=$344;
   var $346=HEAP32[(($345)>>2)];
   var $347=(($346)|(0))==0;
   if ($347) { label = 107; break; } else { label = 103; break; }
  case 103: 
   var $349=$346;
   var $350=HEAP32[((((3280)|0))>>2)];
   var $351=(($349)>>>(0)) < (($350)>>>(0));
   if ($351) { label = 105; break; } else { label = 104; break; }
  case 104: 
   var $353=(($R7_1+20)|0);
   HEAP32[(($353)>>2)]=$346;
   var $354=(($346+24)|0);
   HEAP32[(($354)>>2)]=$R7_1;
   label = 107; break;
  case 105: 
   _abort();
   throw "Reached an unreachable!";
  case 106: 
   _abort();
   throw "Reached an unreachable!";
  case 107: 
   var $358=$213 | 1;
   var $359=(($_0+4)|0);
   HEAP32[(($359)>>2)]=$358;
   var $360=$_0;
   var $361=(($360+$213)|0);
   var $362=$361;
   HEAP32[(($362)>>2)]=$213;
   var $363=HEAP32[((((3284)|0))>>2)];
   var $364=(($_0)|(0))==(($363)|(0));
   if ($364) { label = 108; break; } else { var $_1 = $213;label = 110; break; }
  case 108: 
   HEAP32[((((3272)|0))>>2)]=$213;
   label = 134; break;
  case 109: 
   var $367=$186 & -2;
   HEAP32[(($185)>>2)]=$367;
   var $368=$_0277 | 1;
   var $369=(($_0+4)|0);
   HEAP32[(($369)>>2)]=$368;
   var $370=$_0;
   var $371=(($370+$_0277)|0);
   var $372=$371;
   HEAP32[(($372)>>2)]=$_0277;
   var $_1 = $_0277;label = 110; break;
  case 110: 
   var $_1;
   var $374=$_1 >>> 3;
   var $375=(($_1)>>>(0)) < 256;
   if ($375) { label = 111; break; } else { label = 116; break; }
  case 111: 
   var $377=$374 << 1;
   var $378=((3304+($377<<2))|0);
   var $379=$378;
   var $380=HEAP32[((((3264)|0))>>2)];
   var $381=1 << $374;
   var $382=$380 & $381;
   var $383=(($382)|(0))==0;
   if ($383) { label = 112; break; } else { label = 113; break; }
  case 112: 
   var $385=$380 | $381;
   HEAP32[((((3264)|0))>>2)]=$385;
   var $_sum13_pre=((($377)+(2))|0);
   var $_pre=((3304+($_sum13_pre<<2))|0);
   var $F16_0 = $379;var $_pre_phi = $_pre;label = 115; break;
  case 113: 
   var $_sum14=((($377)+(2))|0);
   var $387=((3304+($_sum14<<2))|0);
   var $388=HEAP32[(($387)>>2)];
   var $389=$388;
   var $390=HEAP32[((((3280)|0))>>2)];
   var $391=(($389)>>>(0)) < (($390)>>>(0));
   if ($391) { label = 114; break; } else { var $F16_0 = $388;var $_pre_phi = $387;label = 115; break; }
  case 114: 
   _abort();
   throw "Reached an unreachable!";
  case 115: 
   var $_pre_phi;
   var $F16_0;
   HEAP32[(($_pre_phi)>>2)]=$_0;
   var $394=(($F16_0+12)|0);
   HEAP32[(($394)>>2)]=$_0;
   var $395=(($_0+8)|0);
   HEAP32[(($395)>>2)]=$F16_0;
   var $396=(($_0+12)|0);
   HEAP32[(($396)>>2)]=$379;
   label = 134; break;
  case 116: 
   var $398=$_0;
   var $399=$_1 >>> 8;
   var $400=(($399)|(0))==0;
   if ($400) { var $I19_0 = 0;label = 119; break; } else { label = 117; break; }
  case 117: 
   var $402=(($_1)>>>(0)) > 16777215;
   if ($402) { var $I19_0 = 31;label = 119; break; } else { label = 118; break; }
  case 118: 
   var $404=((($399)+(1048320))|0);
   var $405=$404 >>> 16;
   var $406=$405 & 8;
   var $407=$399 << $406;
   var $408=((($407)+(520192))|0);
   var $409=$408 >>> 16;
   var $410=$409 & 4;
   var $411=$410 | $406;
   var $412=$407 << $410;
   var $413=((($412)+(245760))|0);
   var $414=$413 >>> 16;
   var $415=$414 & 2;
   var $416=$411 | $415;
   var $417=(((14)-($416))|0);
   var $418=$412 << $415;
   var $419=$418 >>> 15;
   var $420=((($417)+($419))|0);
   var $421=$420 << 1;
   var $422=((($420)+(7))|0);
   var $423=$_1 >>> (($422)>>>(0));
   var $424=$423 & 1;
   var $425=$424 | $421;
   var $I19_0 = $425;label = 119; break;
  case 119: 
   var $I19_0;
   var $427=((3568+($I19_0<<2))|0);
   var $428=(($_0+28)|0);
   var $I19_0_c=$I19_0;
   HEAP32[(($428)>>2)]=$I19_0_c;
   var $429=(($_0+20)|0);
   HEAP32[(($429)>>2)]=0;
   var $430=(($_0+16)|0);
   HEAP32[(($430)>>2)]=0;
   var $431=HEAP32[((((3268)|0))>>2)];
   var $432=1 << $I19_0;
   var $433=$431 & $432;
   var $434=(($433)|(0))==0;
   if ($434) { label = 120; break; } else { label = 121; break; }
  case 120: 
   var $436=$431 | $432;
   HEAP32[((((3268)|0))>>2)]=$436;
   HEAP32[(($427)>>2)]=$398;
   var $437=(($_0+24)|0);
   var $_c=$427;
   HEAP32[(($437)>>2)]=$_c;
   var $438=(($_0+12)|0);
   HEAP32[(($438)>>2)]=$_0;
   var $439=(($_0+8)|0);
   HEAP32[(($439)>>2)]=$_0;
   label = 134; break;
  case 121: 
   var $441=HEAP32[(($427)>>2)];
   var $442=(($I19_0)|(0))==31;
   if ($442) { var $447 = 0;label = 123; break; } else { label = 122; break; }
  case 122: 
   var $444=$I19_0 >>> 1;
   var $445=(((25)-($444))|0);
   var $447 = $445;label = 123; break;
  case 123: 
   var $447;
   var $448=$_1 << $447;
   var $K20_0 = $448;var $T_0 = $441;label = 124; break;
  case 124: 
   var $T_0;
   var $K20_0;
   var $450=(($T_0+4)|0);
   var $451=HEAP32[(($450)>>2)];
   var $452=$451 & -8;
   var $453=(($452)|(0))==(($_1)|(0));
   if ($453) { label = 129; break; } else { label = 125; break; }
  case 125: 
   var $455=$K20_0 >>> 31;
   var $456=(($T_0+16+($455<<2))|0);
   var $457=HEAP32[(($456)>>2)];
   var $458=(($457)|(0))==0;
   var $459=$K20_0 << 1;
   if ($458) { label = 126; break; } else { var $K20_0 = $459;var $T_0 = $457;label = 124; break; }
  case 126: 
   var $461=$456;
   var $462=HEAP32[((((3280)|0))>>2)];
   var $463=(($461)>>>(0)) < (($462)>>>(0));
   if ($463) { label = 128; break; } else { label = 127; break; }
  case 127: 
   HEAP32[(($456)>>2)]=$398;
   var $465=(($_0+24)|0);
   var $T_0_c10=$T_0;
   HEAP32[(($465)>>2)]=$T_0_c10;
   var $466=(($_0+12)|0);
   HEAP32[(($466)>>2)]=$_0;
   var $467=(($_0+8)|0);
   HEAP32[(($467)>>2)]=$_0;
   label = 134; break;
  case 128: 
   _abort();
   throw "Reached an unreachable!";
  case 129: 
   var $470=(($T_0+8)|0);
   var $471=HEAP32[(($470)>>2)];
   var $472=$T_0;
   var $473=HEAP32[((((3280)|0))>>2)];
   var $474=(($472)>>>(0)) < (($473)>>>(0));
   if ($474) { label = 132; break; } else { label = 130; break; }
  case 130: 
   var $476=$471;
   var $477=(($476)>>>(0)) < (($473)>>>(0));
   if ($477) { label = 132; break; } else { label = 131; break; }
  case 131: 
   var $479=(($471+12)|0);
   HEAP32[(($479)>>2)]=$398;
   HEAP32[(($470)>>2)]=$398;
   var $480=(($_0+8)|0);
   var $_c9=$471;
   HEAP32[(($480)>>2)]=$_c9;
   var $481=(($_0+12)|0);
   var $T_0_c=$T_0;
   HEAP32[(($481)>>2)]=$T_0_c;
   var $482=(($_0+24)|0);
   HEAP32[(($482)>>2)]=0;
   label = 134; break;
  case 132: 
   _abort();
   throw "Reached an unreachable!";
  case 133: 
   _abort();
   throw "Reached an unreachable!";
  case 134: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
// EMSCRIPTEN_END_FUNCS
// EMSCRIPTEN_END_FUNCS
// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;
// === Auto-generated postamble setup entry stuff ===
function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;
var initialStackTop;
var preloadStartTime = null;
var calledMain = false;
Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');
  args = args || [];
  if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
    Module.printErr('preload time: ' + (Date.now() - preloadStartTime) + ' ms');
  }
  ensureInitRuntime();
  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);
  initialStackTop = STACKTOP;
  try {
    var ret = Module['_main'](argc, argv, 0);
    // if we're not running an evented main loop, it's time to exit
    if (!Module['noExitRuntime']) {
      exit(ret);
    }
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      throw e;
    }
  } finally {
    calledMain = true;
  }
}
function run(args) {
  args = args || Module['arguments'];
  if (preloadStartTime === null) preloadStartTime = Date.now();
  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }
  preRun();
  if (runDependencies > 0) {
    // a preRun added a dependency, run will be called later
    return;
  }
  function doRun() {
    ensureInitRuntime();
    preMain();
    calledRun = true;
    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }
    postRun();
  }
  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;
function exit(status) {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;
  // exit the runtime
  exitRuntime();
  // TODO We should handle this differently based on environment.
  // In the browser, the best we can do is throw an exception
  // to halt execution, but in node we could process.exit and
  // I'd imagine SM shell would have something equivalent.
  // This would let us set a proper exit status (which
  // would be great for checking test exit statuses).
  // https://github.com/kripken/emscripten/issues/1371
  // throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;
function abort(text) {
  if (text) {
    Module.print(text);
    Module.printErr(text);
  }
  ABORT = true;
  EXITSTATUS = 1;
  throw 'abort() at ' + (new Error().stack);
}
Module['abort'] = Module.abort = abort;
// {{PRE_RUN_ADDITIONS}}
if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}
// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}
run();
// {{POST_RUN_ADDITIONS}}
// {{MODULE_ADDITIONS}}
//@ sourceMappingURL=sundown.js.map