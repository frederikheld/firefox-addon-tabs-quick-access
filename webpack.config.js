// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path')
// const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyPlugin = require('copy-webpack-plugin')

const isProduction = process.env.NODE_ENV == 'production'

const stylesHandler = isProduction
  ? MiniCssExtractPlugin.loader
  : 'style-loader'

const configGlobal = {
  entry: {
    background_scripts: [
      './src/functions/quick-access-store.js',
      './src/context-menu/context-menu.js'
    ]
  },
  output: {
    path: path.resolve(__dirname, 'dist/'),
    filename: '[name].bundle.js',
    clean: true
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: './src/manifest.json', to: 'manifest.json' },
        { from: './src/_locales', to: '_locales' }
      ]
    })
  ]
}

const configIcons = {
  entry: {
    icons: [
      './src/icons/index.js'
    ]
  },
  output: {
    path: path.resolve(__dirname, 'dist/icons/')
  },
  module: {
    rules: [
      {
        test: /\.svg$/i,
        use: [
          {
            loader: path.resolve('node_modules/svg-to-png-loader/lib/index.js'),
            options: {
              sizes: ['48', '96'],
              name: '[name]-[width].png'
            }
          }
        ]
      }
    ]
  }
}

const configPopup = {
  entry: {
    popup: [
      './src/functions/quick-access-store.js',
      './src/functions/tab-utils.js',
      './src/popup/popup.js',
      './src/popup/popup.scss',
      './src/popup/popup.css'
    ]
  },
  output: {
    path: path.resolve(__dirname, 'dist/popup'),
    filename: '[name].bundle.js',
    clean: true
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: './src/popup/popup.html', to: 'popup.html' },
        { from: './src/popup/popup.css', to: 'popup.css' }
      ]
    })
  ],
  module: {
    rules: [
      // {
      //   test: /\.(js|jsx)$/i,
      //   loader: 'babel-loader',
      // },
      {
        test: /\.css$/i,
        use: [stylesHandler, 'css-loader'],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [stylesHandler, 'css-loader', 'sass-loader'],
      }

  //     // Add your rules for custom modules here
  //     // Learn more about loaders from https://webpack.js.org/loaders/
    ],
  }
}

module.exports = () => {

  const configs = [configGlobal, configPopup]

  if (isProduction) {
    // Do not generate icons in dev mode to save time.
    // Firefox won't reload them without re-installing the addon anyway!
    configs.push(configIcons)

    configs.map((config) => {

      config.mode = 'production'
      config.plugins?.push(new MiniCssExtractPlugin())
      config.target = 'web'
      config.devtool = 'source-map'
    })
  } else {
    configs.map((config) => {
      config.mode = 'development'
      config.target = 'web'
      config.devtool = 'source-map'
    })
  }
  return configs
}
