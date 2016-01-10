var resolver = require("bit-bundler-utils/resolvePath").configure({baseUrl: __filename});
var path = require("path");


var builtInMap = {
  buffer: {
    name: "buffer",
    target: "buffer",
    test: function() {
      return false;
    }
  },
  events: {
    name: "events",
    target: "events",
    test: function() {
      return false;
    }
  },
  path: {
    name: "path",
    target: "path",
    test: function() {
      return false;
    }
  },
  process: {
    name: "process",
    target: "process/browser",
    test: function(meta) {
      return /process.(cwd|nextTick|platform)/.test(meta.source) && meta.name !== builtInMap.process.name;
    },
    value: function() {
      return "require('process')";
    }
  },
  __dirname: {
    name: "__dirname",
    test: function(meta) {
      return /\b__dirname\b/.test(meta.source);
    },
    value: function(meta) {
      return "'/" + path.relative(".", meta.directory) + "'";
    }
  },
  __filename: {
    name: "__filename",
    test: function(meta) {
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
    if (builtInMap[builtIn].test(meta)) {
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
