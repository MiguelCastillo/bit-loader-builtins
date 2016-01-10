var resolver = require("bit-bundler-utils/resolvePath").configure({baseUrl: __filename});
var path = require("path");


var builtInMap = {
  buffer: {
    name: "buffer",
    target: "buffer",
    injectDependency: function() {
      return false;
    }
  },
  events: {
    name: "events",
    target: "events",
    injectDependency: function() {
      return false;
    }
  },
  path: {
    name: "path",
    target: "path",
    injectDependency: function() {
      return false;
    }
  },
  process: {
    name: "process",
    target: "process/browser",
    injectDependency: function(meta) {
      return /process.(cwd|nextTick|platform)/.test(meta.source) && meta.name !== builtInMap.process.name;
    },
    value: function() {
      return "require('process')";
    }
  },
  __dirname: {
    name: "__dirname",
    injectDependency: function(meta) {
      return /\b__dirname\b/.test(meta.source);
    },
    value: function(meta) {
      return "'/" + path.relative(".", meta.directory) + "'";
    }
  },
  __filename: {
    name: "__filename",
    injectDependency: function(meta) {
      return /\b__filename\b/.test(meta.source);
    },
    value: function(meta) {
      return "'/" + path.relative(".", meta.path) + "'";
    }
  }
};


function resolveBuiltin(meta) {
  if (builtInMap.hasOwnProperty(meta.name)) {
    return resolver({
      name: builtInMap[meta.name].target
    });
  }
}


function dependencyBuiltin(meta) {
  var wrapped;

  var builtInResult = Object.keys(builtInMap).reduce(function(container, builtIn) {
    if (builtInMap[builtIn].injectDependency(meta)) {
      container.params.push(builtIn);
      container.deps.push(builtInMap[builtIn].value(meta));
    }

    return container;
  }, {params: [], deps: []});

  if (builtInResult.params.length) {
    wrapped = "(function(" + builtInResult.params.join(",") + ") {\n";
    wrapped += meta.source;
    wrapped += "\n})(" + builtInResult.deps.join(",") + ")";
  }

  return {
    source: wrapped || meta.source
  };
}


module.exports = function() {
  return {
    resolve: resolveBuiltin,
    dependency: dependencyBuiltin
  };
};
