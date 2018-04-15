'use strict';

var UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
	entry: './src/main.tsx',
	devtool: 'source-map',
	output: {
		filename: './dist/main.js'
	},
	resolve: {
        extensions: ['.ts', '.tsx', '.js']
	},
	module: {
		rules: [
			{ test: /\.ts$/, loader: 'ts-loader' },
			{ test: /\.tsx$/, loader: 'surplus-loader!ts-loader' }
		]
	},
	/* currently needed for workaround for uglify-es bug involving incorrect inlining */
	optimization: {
		minimizer: [
			new UglifyJsPlugin({
				sourceMap: true,
				uglifyOptions: {
					compress: {
						inline: 1, // default is 3, which causes errors
					},
				},
			}),
		],
	}
};