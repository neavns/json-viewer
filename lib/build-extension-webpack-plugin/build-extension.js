var fs = require('fs-extra');
var path = require('path');
var BuildPaths = require('../build-paths');

function copyTheme(darkness, list) {
  var paths = [];
  list.forEach(function(theme) {
    var themeCSSPath = 'themes/' + darkness + '/' + theme + '.css';
    var themePath = path.join(BuildPaths.EXTENSION, 'assets/' + theme);

    if (fs.existsSync(themePath + '.js') && fs.existsSync(themePath + '.css')) {
      fs.removeSync(themePath + '.js');
      fs.copySync(themePath + '.css', path.join(BuildPaths.EXTENSION, themeCSSPath));
      console.log('  copied: ' + themeCSSPath);
      paths.push(themeCSSPath);

    } else {
      console.error('  fail to copy: ' + (themePath + '.css'));
    }
  });

  return paths;
}

function BuildExtension(themes) {
  this.themes = themes;
}

BuildExtension.prototype.apply = function(compiler) {
  var themes = this.themes;
  
  compiler.hooks.done.tap('BuildExtension', function() {
    console.log('\n');
    console.log('-> copying files');
    fs.copySync(path.join(BuildPaths.SRC_ROOT, 'icons'), path.join(BuildPaths.EXTENSION, 'icons'));
    fs.copySync(path.join(BuildPaths.SRC_ROOT, 'pages'), path.join(BuildPaths.EXTENSION, 'pages'));

    console.log('-> copying themes');

    var themesCSSPaths = copyTheme('light', themes.light)
                         .concat(copyTheme('dark', themes.dark));

    var manifest = fs.readJSONSync(path.join(BuildPaths.SRC_ROOT, 'manifest.json'));
    // Update web_accessible_resources for Manifest V3 format
    manifest.web_accessible_resources[0].resources = manifest.web_accessible_resources[0].resources.concat(themesCSSPaths);

    if (process.env.NODE_ENV !== 'production') {
      console.log('-> dev version');
      manifest.name += ' - dev';
    }

    console.log('-> copying manifest.json');
    fs.outputJSONSync(path.join(BuildPaths.EXTENSION, 'manifest.json'), manifest);
  });
}

module.exports = BuildExtension;
