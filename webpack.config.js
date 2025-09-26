const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
    mode: 'development',
    entry: './src/index.ts',
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        // No need to write a index.html
        new HtmlWebpackPlugin({
            template: "./src/index.html"
        }),
        // Copy assets to serve them
        new CopyPlugin({patterns: [{ from: 'public', to: 'public',  noErrorOnMissing: true}]}),
    ],
    devServer: {
        static: {
          directory: path.join(__dirname, 'dist'),
        },
        port: 9000,
      },
}