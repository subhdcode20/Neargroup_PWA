
/*var CompressionPlugin = require('compression-webpack-plugin');

new CompressionPlugin({
          asset: "[path].gz[query]",
          algorithm: "gzip",
          test: /\.js$|\.css$|\.html$/,
          threshold: 10240,
          minRatio: 0.8
        })

        */

const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    entry: './src/index.js',  //'./src/permissionIndex.js',
    output: {
        path: __dirname,
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: [/node_modules/],
                use: [
                    {
                        loader: 'babel-loader',
                        options: { presets: ['es2015', 'react'] }
                    }
                ]
            },
            {
                test: /(\.scss|\.css)$/,
                use: [
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                            localIdentName: '[name]_[local]_[hash:base64:5]'
                        }
                    },
                    {
                        loader: 'sass-loader',
                    }
                ]
            }
        ]
    },
    plugins: [
        new UglifyJsPlugin({
          uglifyOptions: {
            compress : {
              dead_code: true,
              drop_console: true,
              unused: true
            }
          }
        }),
        new webpack.DefinePlugin({
          FIREBASE_APIKEY : JSON.stringify('AIzaSyDpUZwIU_xX0igWcFGWwxh6ioGzuu635-c'),
          FIREBASE_AUTHDOMAIN : JSON.stringify('neargroup-lite.firebaseapp.com'),
          FIREBASE_DATABASE_URL : JSON.stringify('https://neargroup-lite.firebaseio.com'),
          FIREBASE_PROJECT_ID : JSON.stringify('neargroup-lite'),
          FIREBASE_MESSAGING_ID : JSON.stringify('485643019459'),
          FIREBASE_STORAGE_BUCKET : JSON.stringify('neargroup-lite.appspot.com'),
          API: JSON.stringify('https://myfriends.neargroup.me/ng/'),  //JSON.stringify('https://web.neargroup.me/ng/'),
          AVTAR: JSON.stringify('avtar.svg'),
          'process.env': {
              NODE_ENV: JSON.stringify('production')
          },
          LS_APP_PWA_NOTIFICATION: JSON.stringify('NG_APP_SD_NOTIFICATION'),
          LS_APP_PWA_LASTMSG: JSON.stringify('NG_PWA_LAST_MSG'),

        })
      ]
};
