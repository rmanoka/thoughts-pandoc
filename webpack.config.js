const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const distDir = path.resolve(__dirname, 'dist');

module.exports = {
    entry: {
        'render/index': [
            'render-loader!./src/gcp-placement/index.md',
            './src/styles/main.css',
        ],
    },
    output: {
        filename: '[name].js',
        path: distDir,
    },
    stats: 'minimal',

    mode: 'development',
    devtool: 'cheap-module-eval-source-map',
    devServer: {
        contentBase: distDir,
    },

    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './src/index.html'
        }),
    ],
    module: {
        rules: [
            {
                test: /\.md$/,
                loader: 'pandoc-loader',
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader', 'postcss-loader'],
            },
            {
                test: /\.html$/,
                loader: 'html-loader',
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/i,
                loader: 'file-loader',
            },
        ]
    },
    resolveLoader: {
        modules: [
            'node_modules',
            './src/loaders'
        ]
    }
};
