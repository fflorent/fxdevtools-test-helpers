// xxxFlorent: Is it OK on Windows machines?
var fs = require("fs");
var find = require("find");
var mkdirp = require("mkdirp");
var libPath = __dirname + "/../lib";
var libPathBak = __dirname + "/../lib.bak";
var pathToDevTools = process.argv[2];

function backupLib() {
  if (fs.existsSync(libPath)) {
    fs.renameSync(libPath, libPathBak);
  }
}

function mkdirLib() {
  fs.mkdirSync(libPath);
}

function copyAndModularize() { 
  var files = find.fileSync("head.js", pathToDevTools);
  var realPath = fs.realpathSync(pathToDevTools);
  files.forEach(function (file) {
    var data = fs.readFileSync(file, "utf-8");
    var regEx = /^function\*?\s+([$\w]+)\s*|let ([\w$]+)\s*=\s*(?:Task.async\()?\s*function/gm;
    var functionsName = [], res;
    do {
      res = regEx.exec(data);
      if (!res) {
        break;
      }
      functionsName.push(res[1] || res[2]);
    } while (res);
    data += "\n" + functionsName.map(function(name) { 
      return "exports." + name + " = " + name + ";";
    }).join("\n");
    var relDirPathInLib = file.substr(realPath.length).replace(/[^\/]*$/, "");
    var fullDirPathInLib = libPath + "/" + relDirPathInLib;
    mkdirp.sync(fullDirPathInLib);
    fs.writeFileSync(fullDirPathInLib + "/head.js", data);
  });
}

// TODO check existance of pathToDevTools

console.info("Backuping the lib directory (if any)");
backupLib();

console.info("mkdir the lib");
mkdirLib();

console.info("copy and modularize everything!");
copyAndModularize();
