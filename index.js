var browserBuiltins = require("browser-builtins");
var path = require("path");


var dependencyInjectionMap = {
  process: {
    injectDependency: function(meta) {
      return /process.(cwd|chdir|nextTick|platform|env|title|browser|argv|binding)/.test(meta.source) && meta.name !== "process";
    },
    depedencyValue: function() {
      return "require('process')";
    }
  },
  __dirname: {
    injectDependency: function(meta) {
      return /\b__dirname\b/.test(meta.source);
    },
    depedencyValue: function(meta) {
      return "'/" + path.relative(".", meta.directory) + "'";
    }
  },
  __filename: {
    injectDependency: function(meta) {
      return /\b__filename\b/.test(meta.source);
    },
    depedencyValue: function(meta) {
      return "'/" + path.relative(".", meta.path) + "'";
    }
  },
  global: {
    injectDependency: function(meta) {
      return /\bglobal\b/.test(meta.source);
    },
    depedencyValue: function() {
      return "typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : {}";
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
      return dependencyInjectionMap[builtIn].injectDependency(meta);
    })
    .reduce(function(container, builtIn) {
      container.params.push(builtIn);
      container.deps.push(dependencyInjectionMap[builtIn].depedencyValue(meta));

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


module.exports = function() {
  return {
    resolve: resolveBuiltin,
    transform: injectBuiltinDependency
  };
};
