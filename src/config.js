const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
function plugins(dest, opts) {
    return Object.keys(dest).reduce((acc, key) => {
        acc.push(new HtmlWebpackPlugin(
            Object.assign({
                filename: key,
                inject: !isProd,
                chunks: [dest[key]],
            }, opts)
        ));
        return acc;
    }, [new CleanWebpackPlugin()]);
}

const isProd = typeof process.env.NODE_ENV !== 'undefined';

function moduleRules() {
    return [
        {
            test: /\.md$/,
            loader: 'pandoc-loader',
        },
        {
            test: /\.css$/,
            exclude: /node_modules|\.min\.css/,
            use: ['style-loader', 'css-loader', 'postcss-loader'],
        },
        {
            test: /\.css$/,
            include: /node_modules|\.min\.css/,
            use: ['style-loader', 'css-loader'],
        },
        {
            test: /\.html$/,
            loader: 'html-loader',
        },
        {
            test: /\.(png|jpe?g|gif|svg|woff2?|ttf)$/i,
            loader: 'file-loader',
        },
    ];
}
function resolveLoader() {
    return {
        modules: [
            'node_modules',
            path.resolve(__dirname, './loaders'),
        ]
    };
}

function docEntries(entries, entryStyles=[]) {
    const isArray = Array.isArray(entries);
    return (isArray ? entries : Object.keys(entries))
          .reduce((acc, key) => {

              let dest;
              if (isArray) {
                  dest = path.basename(key);
              } else {
                  dest = key;
              }
              let ext = path.extname(dest);
              if (ext.length > 0) {
                  dest = dest.slice(0, -ext.length);
              }
              ext = '.html';

              let entry = 'render/' + dest;
              if (isArray) {
                  let mod = key;
                  if (!mod.startsWith('.')) { mod = './' + mod; }
                  acc.entry[entry] = ['render-loader!' + mod];
              } else {
                  acc.entry[entry] = [].concat(entries[key]);
              }
              acc.entry[entry] = entryStyles.concat(acc.entry[entry]);
              acc.dest[dest + ext] = entry;
              return acc;

          }, {entry: {}, dest: {}});
}

function config({
    mode, baseDir,
    entries, entryStyles = [], templateOpts = {},
    alias = true,
}) {
    baseDir = baseDir || process.cwd();
    mode = mode || (isProd ? 'production' : 'development');

    const distDir = path.join(baseDir, 'dist');

    const isArray = Array.isArray(entries);
    const {entry, dest} = docEntries(entries, entryStyles);

    const cfg = {
        mode,
        entry,
        context: baseDir,
        output: {
            filename: '[name].js',
            path: distDir,
        },
        stats: 'minimal',

        plugins: plugins(dest, templateOpts),
        module: { rules: moduleRules() },
        resolveLoader: resolveLoader(),
    };

    if (mode !== 'production') {
        Object.assign(cfg, {
            devtool: 'cheap-module-eval-source-map',
            devServer: {
                contentBase: distDir,
            },
        });
    }
    if (alias) {
        const res = cfg.resolve = cfg.resolve || {};
        const al = res.alias = res.alias || {};
        Object.assign(al, {thoughts: 'thoughts-pandoc/src/lib'});
    }
    return cfg;
};

module.exports = {plugins, config, moduleRules, resolveLoader};
