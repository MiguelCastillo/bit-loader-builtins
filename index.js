var browserBuiltins = require("browser-builtins");
var path = require("path");


var dependencyInjectionMap = {
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
    .reduce(function(container, builtIn) {
      container.params.push(builtIn);
      container.deps.push(dependencyInjectionMap[builtIn].injectDependency(meta));

      return container;
    }, {params: [], deps: []});

  if (builtInResult.params.length) {
    wrapped = "(function(" + builtInResult.params.join(",") + ") {\n";
    wrapped += meta.source;
    wrapped += "\n})(" + builtInResult.deps.join(",") + ")";
  }

  if (wrapped) {
    return {
      source: wrapped
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
