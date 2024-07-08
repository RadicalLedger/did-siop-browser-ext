var webpack = require('webpack');

module.exports = {
    entry: {
        background: { import: 'src/core/background.ts', runtime: false },
        inject: 'src/core/inject.ts',
        context: 'src/core/context.ts'
    },
    node: {
        global: false
    },
    resolve: {
        extensions: ['.ts', '.js'],
        fallback: {
            stream: require.resolve('stream-browserify'),
            crypto: require.resolve('crypto-browserify'),
            buffer: require.resolve('buffer'),
            // constants: require.resolve('constants-browserify'),
            // assert: require.resolve('assert'),
            // http: require.resolve('stream-http'),
            // https: require.resolve('https-browserify'),
            // url: require.resolve('url'),
            // os: require.resolve('os-browserify/browser'),
            util: require.resolve('util')
        }
    },
    plugins: [
        new webpack.ProvidePlugin({
            global: require.resolve('./global.js'),
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer']
        })
    ],
    optimization: {
        minimize: false
    }
};
