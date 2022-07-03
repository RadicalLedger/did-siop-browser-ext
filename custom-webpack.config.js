var webpack = require('webpack');

// webpack 5 https://gist.github.com/ef4/d2cf5672a93cf241fd47c020b9b3066a

module.exports = {
    entry: { 
        background: 'src/core/background.ts',
        inject: 'src/core/inject.ts'
    },
    node: {
        global: false
    },
    resolve: {
        fallback: {
            stream: require.resolve('stream-browserify'),
            crypto: require.resolve('crypto-browserify'),
            assert: require.resolve('assert'),
            http: require.resolve('stream-http'),
            https: require.resolve('https-browserify'),
            url: require.resolve('url'),
            os: require.resolve('os-browserify/browser'),
            util: require.resolve('util')
        }
    },
    plugins: [
        new webpack.ProvidePlugin({
          global: require.resolve('./global.js')
        })
    ],
}