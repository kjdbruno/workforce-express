const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: './server.js', // adjust if your main file is not index.js
    target: 'node', // tells Webpack to compile for Node.js
    externals: [nodeExternals()], // don't bundle node_modules
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'app.js',
    },
    module: {
        rules: [
        {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
            loader: 'babel-loader', // optional if you're using modern JS
            options: {
                presets: ['@babel/preset-env'],
            },
            },
        },
        ],
    },
    mode: 'production',
};
