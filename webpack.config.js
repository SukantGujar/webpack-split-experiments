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
    var fileparts = _.split(config.output.filename, '.');
    fileparts = _.concat(_.initial(fileparts), "min", _.last(fileparts));
    config.output.filename = _.join(fileparts, '.');

    return config;
},
commonConfig = {
    entry: {
        index: './index.js',
    },
    output: {
        filename: '1.[name].js',
        path: path.resolve(__dirname, 'dist')
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
        filename: '2.multipleEntries.[name].js'
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
        filename: '3.cherryPick.[name].js'
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
        filename: '4.implicitCommonVendorChunk.[name].js'
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
config = [commonConfig, minified(commonConfig), multipleEntriesConfig, minified(multipleEntriesConfig), cherryPickConfig, minified(cherryPickConfig), implicitCommonVendorChunkConfig, minified(implicitCommonVendorChunkConfig)];

module.exports = config;