const path = require('path');

module.exports = {
    mode: 'development',

    entry: {
        'astrochart': './src/js/astrochart.js',
    },

    output: {
        filename: 'astrochart.js',
        path: path.resolve(__dirname, 'dist')
    },

    module: {
        rules: [
            { test: /\.(svg)$/, use: "file-loader" },
            {
               test: require.resolve('snapsvg'),
               use: 'imports-loader?this=>window,fix=>module.exports=0',
            },
        ]
    }
};
