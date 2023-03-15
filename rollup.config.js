import babel from 'rollup-plugin-babel';
import minify from 'rollup-plugin-babel-minify';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';



/*
const output = [{
    dir: '../modules/gui',
    format: 'esm',
    sourcemap: true
  }]
const plugins =  [
    // babel({
    //   runtimeHelpers: true,
    //   exclude: 'node_modules/**'
    // }),
    // minify({
    //   comments: false,
    //   sourceMap: true
    // }),
    commonjs({
        // non-CommonJS modules will be ignored, but you can also
        // specifically include/exclude files
        include: [ "./index.js", "node_modules/**" ], // Default: undefined
  
        // if true then uses of `global` won't be dealt with by this plugin
        ignoreGlobal: false, // Default: false
  
        // if false then skip sourceMap generation for CommonJS modules
        sourceMap: false // Default: true
      }),
      resolve({
        mainFilds: ["module"],
        modulesOnly: true
      })
  ]


export default [
    {input: { 'hyperapp': 'hyperapp' }, output, plugins},
    {input: { 'hyperapp-v2': 'hyperapp-v2' }, output, plugins},
    {
  input: { 
    gui: './@osjs/gui/gui.js',
    //modules: './@osjs/gui/src/hyperapp.js' 
  },
  watch: {
     chokidar: false
  },
  output,
  external: (name) => name.indexOf('hyperapp') > -1,
  plugins, 
},
//await import('./@osjs/gui/rollup.config.mjs'),
];
*/