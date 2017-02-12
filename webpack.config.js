var webpack = require('webpack'),
_ = require('lodash'),
path = require('path'),
LodashModuleReplacementPlugin = require('lodash-webpack-plugin'),
minified = function(config){
    var config = _.cloneDeep(config);
    config.plugins = config.plugins || [];
    config.plugins.push(
        new webpack.optimize.UglifyJsPlugin()
    );

    config.output.filename = "min." + config.output.filename;

    return config;
},
commonConfig = {
    entry: {
        index: './index.js',
    },
    context: path.resolve(__dirname, "src"),
    module: {
        rules: [
            {
                test : /\.js$/,
                loader : 'babel-loader',
                exclude: /(node_modules|bower_components)/,
                options: {
                    presets: [
                        ["es2015", { "modules": false }]
                    ]
                }
            }
        ]
    }
},
multipleEntriesConfig = _.merge({}, commonConfig, {
    entry: {
        vendor: 'lodash'
    },
    output: {
        filename: 'multipleEntries.[name].js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor'
        })
    ]
}),
cherryPickConfig = _.merge({}, commonConfig, {
    entry: {
        vendor: 'lodash/range'
    },
    output: {
        filename: 'cherryPick.[name].js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                options: {
                    plugins: ["lodash"]
                }
            }
        ]
    },
    plugins: [
        new LodashModuleReplacementPlugin(),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor'
        })
    ]
}),
implicitCommonVendorChunkConfig = _.merge({}, commonConfig, {
    output: {
        filename: 'implicitCommonVendorChunk.[name].js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                options: {
                    plugins: ["lodash"]
                }
            }
        ]
    },
    plugins: [
        new LodashModuleReplacementPlugin(),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: function (module) {
                return module.context && module.context.indexOf('node_modules') !== -1;
            }
        })
    ]
}),
config = [multipleEntriesConfig, minified(multipleEntriesConfig), cherryPickConfig, minified(cherryPickConfig), implicitCommonVendorChunkConfig, minified(implicitCommonVendorChunkConfig)];

module.exports = config;