/**
 * https://github.com/os-js/osjs-dev-meta/pull/27
https://github.com/os-js/osjs-dev-meta/pull/30
https://github.com/os-js/osjs-dev-meta/pull/31

This issue was created because there needs to be some kind of integration checks for themes after the introduction of os-js/osjs-dev-meta#27.

The dev-meta repository now has actions so it's possible to automate this.

Tasks:

NB: This doesn't have to work as a theme someone would actually install (as providing all icons would make no sense... unless it's symlinked or something). It's just to provide examples and testing. Point towards an actual theme in the documentation.

 Provide a basic template just like the example application (readme, license, webpack, etc.)
 Just a couple of variants of icons to demonstrate the new SVG abilities etc
 PR dev-meta to check this repository and do some basic tests towards the metadata
 Pr manual with link updates in resource article
 */
const path = require('path');

class IconThemePlugin {
  constructor(options = {}) {
    this.metadataPath = options.metadataPath;
  }

  apply(compiler) {
    const pluginName = IconThemePlugin.name;
    const {webpack: {source: {RawSource}}} = compiler;

    compiler.hooks.emit.tap(pluginName, (compilation) => {
      const icons = compilation.getAssets().map(
        (asset) => asset.name.split('/').pop()
      );

      const metadataFile = `${this.metadataPath || compiler.context}/metadata.json`;
      const metadata = require(metadataFile);

      const iconEntries = icons.map((file) => [
        file.substr(0, file.lastIndexOf('.')),
        file.substr(file.lastIndexOf('.') + 1, file.length)
      ]);
      iconEntries.sort(([a], [b]) => a.localeCompare(b));

      const imageTypes = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'];
      metadata.icons = Object.fromEntries(
        iconEntries.filter(
          ([name, ext]) => imageTypes.includes(ext)
        )
      );

      const json = JSON.stringify(metadata, null, 2);
      const relativePath = path.relative(compiler.outputPath, metadataFile);
      compilation.emitAsset(relativePath, new RawSource(json));
    });
  }
}

module.exports = IconThemePlugin;
