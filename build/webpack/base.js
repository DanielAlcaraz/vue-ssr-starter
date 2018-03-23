const path = require('path'),
	qs = require('qs');

// allows options to represent both object and query string
class Options {
	constructor(options) {
		for (let k of Object.keys(options)) this[k] = options[k];
	}
	toString() {
		return qs.stringify(this, { encode: false, arrayFormat: 'brackets' }).replace(/=true/g, '');
	}
}

// shared options to use in multiple loaders (vue-loader and others in general)
const options = {
	buble: new Options({
		objectAssign: 'Object.assign',
		transforms: {
			dangerousForOf: true,
			modules: false
		}
	}),
	pug: new Options({
		doctype: 'html',
		basedir: process.cwd()
	}),
	cssAfterPreprocessor: new Options({
		minimize: true,
		import: false
	}),
	css: new Options({
		minimize: true
	}),
	stylus: new Options({
		import: [
			path.resolve(process.cwd(), 'node_modules/kouto-swiss/index.styl'),
			path.resolve(process.cwd(), 'src/shared.styl')
		]
	})
};

exports.options = options;

exports.createConfig = () => ({
	devtool: false,
	mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
	output: {
		path: path.resolve(process.cwd(), 'dist'),
		publicPath: '/dist/',
		filename: '[name].js?[chunkhash:6]',
		chunkFilename: '[name].js?[chunkhash:6]'
	},
	module: {
		rules: [

			// source files
			// styles loading is different for server and client so let them define the loaders

			{
				test: /\.vue$/,
				loader: 'vue-loader',
				options: {
					template: options.pug,
					loaders: {
						stylus: `css-loader?${options.css}!stylus-loader?${options.stylus}`,
						js: [
							{
								loader: 'buble-loader',
								options: options.buble
							}
						]
					}
				}
			},
			{
				test: /\.js$/,
				loader: 'buble-loader',
				exclude: /node_modules/,
				options: options.buble
			},
			{
				test: /\.pug$/,
				loader: 'pug-loader',
				options: options.pug
			},

			// assets

			{
				test: /\.(woff|woff2|eot|otf|ttf)$/,
				loader: 'file-loader',
				options: {
					name: 'fonts/[name].[ext]?[hash:6]'
				}
			},
			{
				test: /sprite\.svg$/,
				loader: 'raw-loader'
			},
			{
				test: /\.(png|jpe?g|gif|svg)$/,
				exclude: /sprite\.svg$/,
				loaders: [
					{
						loader: 'url-loader',
						options: {
							limit: 256,
							name: 'i/[name].[ext]?[hash:6]'
						}
					},
					{
						loader: 'image-webpack-loader',
						options: {
							optipng: {
								optimizationLevel: 7
							},
							gifsicle: {
								interlaced: false
							},
							mozjpeg: {
								quality: 85,
								progressive: true
							}
						}
					}
				]
			},
			{
				test: /\.(pdf|docx?|pptx?|rtf|txt)$/,
				loader: 'file-loader',
				options: {
					name: 'docs/[name].[ext]?[hash:6]'
				}
			}
		]
	},
	resolve: {
		modules: [
			'node_modules',
			process.cwd()
		]
	},
	performance: {
		hints: process.env.NODE_ENV === 'production' ? 'warning' : false
	}
});