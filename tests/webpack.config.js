const {config} = require("../src/config.js");

const cfg = config({
    baseDir: __dirname,
    entries: [
        'index.md', 'lists.md', 'markup.md',
        'simple.md', 'div.md', 'include.md', 'yaml.md',
        'block_quote.md', 'line_block.md', 'raw_block.md',
    ],
});
module.exports = cfg;
// const path = require('path');
// const HtmlWebpackPlugin = require('html-webpack-plugin');
// const { CleanWebpackPlugin } = require('clean-webpack-plugin');

// const distDir = path.resolve(__dirname, 'dist');

// const isProd = typeof process.env.NODE_ENV !== 'undefined';

// const baseConfig = {
//     entry: {
//         'render/index': [
//             'render-loader!./src/gcp-placement/index.md',
//             './src/styles/main.css',
//         ],
//     },
//     output: {
//         filename: '[name].js',
//         path: distDir,
//     },
//     stats: 'minimal',
//     mode: isProd ? 'production' : 'development',

//     plugins: [
//         new CleanWebpackPlugin(),
//         new HtmlWebpackPlugin({
//             template: './src/index.html',
//             inject: !isProd,
//         }),
//     ],
//     module: {
//         rules: [
//             {
//                 test: /\.md$/,
//                 loader: 'pandoc-loader',
//             },
//             {
//                 test: /\.css$/,
//                 exclude: /node_modules/,
//                 use: ['style-loader', 'css-loader', 'postcss-loader'],
//             },
//             {
//                 test: /\.css$/,
//                 include: /node_modules/,
//                 use: ['style-loader', 'css-loader'],
//             },
//             {
//                 test: /\.html$/,
//                 loader: 'html-loader',
//             },
//             {
//                 test: /\.(png|jpe?g|gif|svg|woff2?|ttf)$/i,
//                 loader: 'file-loader',
//             },
//         ]
//     },
//     resolveLoader: {
//         modules: [
//             'node_modules',
//             './src/loaders'
//         ]
//     }
// };

// if (!isProd) {
//     Object.assign(baseConfig, {
//         devtool: 'cheap-module-eval-source-map',
//         devServer: {
//             contentBase: distDir,
//         },
//     });
// }
