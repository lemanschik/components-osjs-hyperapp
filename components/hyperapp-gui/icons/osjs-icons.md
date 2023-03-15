https://github.com/os-js/osjs-dev-meta/pull/27
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