var webpack = require('webpack');

module.exports = {
    entry: {
        background: { import: 'src/core/background.ts', runtime: false },
        inject: 'src/core/inject.ts',
        context: 'src/core/context.ts'
    },
    optimization: {
        minimize: false
    },
    node: {
        global: false
    },
    resolve: {
        extensions: ['.ts', '.js'],
        fallback: {
            stream: require.resolve('stream-browserify')
            // crypto: require.resolve('crypto-browserify'),
            // constants: require.resolve('constants-browserify'),
            // assert: require.resolve('assert'),
            // http: require.resolve('stream-http'),
            // https: require.resolve('https-browserify'),
            // url: require.resolve('url'),
            // os: require.resolve('os-browserify/browser'),
            // util: require.resolve('util'),
            // buffer: require.resolve('buffer')
        }
    },
    /*  plugins: [
        new webpack.ProvidePlugin({
            global: require.resolve('./global.js')
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser'
        }),
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer']
        })
    ], */
    optimization: {
        minimize: false
    }
};
