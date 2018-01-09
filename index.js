const path = require("path");
const combineSourceMap = require("combine-source-map");
const browserBuiltins = require("./builtins/builtins");

const dependencyInjectionMap = {
  __dirname: {
    canInject: function(meta) {
      return /\b__dirname\b/.test(meta.source);
    },
    injectDependency: function(meta) {
      return "'/" + path.relative(".", meta.directory) + "'";
    }
  },
  __filename: {
    canInject: function(meta) {
      return /\b__filename\b/.test(meta.source);
    },
    injectDependency: function(meta) {
      return "'/" + path.relative(".", meta.path) + "'";
    }
  },
  process: {
    canInject: function(meta) {
      return /process.(cwd|chdir|nextTick|platform|env|title|browser|argv|binding)/.test(meta.source) && meta.name !== "process";
    },
    injectDependency: function() {
      return "require('process')";
    }
  },
  global: {
    canInject: function(meta) {
      return /\bglobal\b/.test(meta.source);
    },
    injectDependency: function() {
      return "typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : {}";
    }
  },
  Buffer: {
    canInject: function(meta) {
      return /\bBuffer\b/.test(meta.source) && meta.name !== "buffer";
    },
    injectDependency: function() {
      return "require('buffer').Buffer";
    }
  }
};


function resolveBuiltin(meta) {
  if (browserBuiltins.hasOwnProperty(meta.name)) {
    return {
      path: browserBuiltins[meta.name]
    };
  }
}


function injectBuiltinDependency(meta) {
  var wrapped;

  var builtInResult = Object
    .keys(dependencyInjectionMap)
    .filter(function(builtIn) {
      return dependencyInjectionMap[builtIn].canInject(meta);
    })
    .reduce(function(accumulator, builtIn) {
      accumulator.params.push(builtIn);
      accumulator.deps.push(dependencyInjectionMap[builtIn].injectDependency(meta));
      return accumulator;
    }, {params: [], deps: []});

  if (builtInResult.params.length) {
    wrapped = "(function(" + builtInResult.params.join(",") + ") {\n";
    wrapped += meta.source;
    wrapped += "\n})(" + builtInResult.deps.join(",") + ")";
  }

  if (wrapped) {
    var sourceMap = combineSourceMap.create().addFile({
      source: wrapped,
      sourceFile: meta.filename || "_empty.js"
    }, {
      line: 1
    });

    return {
      source: combineSourceMap.removeComments(wrapped) + "\n" + sourceMap.comment()
    };
  }
}


module.exports = function(options) {
  return function(builder) {
    return builder
      .configure(options)
      .configure({
        resolve: resolveBuiltin,
        transform: injectBuiltinDependency
      });
  };
};

module.exports.create = function() {
  return {
    resolve: resolveBuiltin,
    transform: injectBuiltinDependency
  };
};
