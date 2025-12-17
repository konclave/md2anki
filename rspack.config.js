const path = require('path');
const rspack = require('@rspack/core');

module.exports = {
    entry: './src/app.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    resolve: {
        extensions: ['.js'],
        alias: {
            // Alias for sql.js if needed, though usually it works fine.
            // We might need to handle the wasm file copying.
        },
        fallback: {
            "fs": false,
            "path": false,
            "crypto": false
        }
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    rspack.CssExtractRspackPlugin.loader,
                    'css-loader'
                ],
                type: 'javascript/auto',
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.wasm$/,
                type: "asset/resource",
            }
        ],
    },
    plugins: [
        new rspack.HtmlRspackPlugin({
            template: './public/index.html',
        }),
        new rspack.CssExtractRspackPlugin({}),
        new rspack.CopyRspackPlugin({
            patterns: [
                { from: "public/card-template", to: "card-template" }
            ]
        })
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'),
        },
        compress: true,
        port: 9000,
        hot: true
    },
};
