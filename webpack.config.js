const path = require('path');

module.exports = {
    mode: 'development',

    entry: {
        'astrochart': './src/js/astrochart.js',
    },

    output: {
        filename: 'astrochart.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'Astrochart',
        libraryTarget: 'umd',
    },

    devServer: {
        disableHostCheck: true,
        host: '0.0.0.0',
        port: 8080
    },

    module: {
        rules: [
            { test: /\.(svg)$/, use: "raw-loader" },
            {
               test: require.resolve('snapsvg'),
               use: 'imports-loader?this=>window,fix=>module.exports=0',
            },
        ]
    }
};
