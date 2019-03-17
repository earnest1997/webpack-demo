var webpack = require("webpack");
var path = require("path");
var HtmlWebpackPlugin = require("html-webpack-plugin");
var MiniCssExtractPlugin = require("mini-css-extract-plugin");
var happyPack = require("happypack");
var os = require("os");
var happyThreadPool = happyPack.ThreadPool({ size: os.cpus().length });
module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "happypack/loader?id=happyBabel"
        },
        exclude: /node_modules/ //正则表达式或者字符串
      },
      {
        test: /\.css$/, // 正则表达式或者字符串,
        use: [
          { loader: "style-loader" },
          {
            loader: "happypack/loader?id=happyCss"
          }
        ]
      },
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        test: "/.(png|gif|jpeg|jpg)$/",
        exclude: /node_modules/,
        // 将文件转换成base64编码的uri
        use: {
          loader: "happypack/loader?id=happyImg"
        }
      },
      {
        test: /\.json$/,
        use: ["file-loader"]
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: "url-loader",
        options: {
          limit: 10000,
          name: "font/[name].[hash:7].[ext]"
        }
      }
    ]
  },
  // DevServer会启动一个HTTP服务器用于服务网页请求，同时会帮助启动webpack，并接收webpack发出的文件变更信号，通过websocket协议自动刷新网页做到实时预览。
  devServer: {
    // contentbase指定当运行服务器的是会加载的页面，默认是根目录下的，这样才会加载dist目录下的index.html,它就以这个本地我写的为准了，而内存中的html的路径还是在根目录下
    contentBase: "./dist",
    //只有本地才能访问devserver的HTTP服务
    publicPath: "./dist",
    host: "localhost",
    //启用gzip压缩
    compress: true,
    // 模块热替换
    hot: true,
    // 自动打开浏览器
    open: true,
    port: 8189,
    // 用于如果找不到界面就返回默认首页，我一看这就是我要的东西，兴奋的设置上了。发现他不管用，原因是他默认的就是主目录的index.html，你自己设置的index没有用,解决办法是使用rewrite
    historyApiFallback: true
  },
  resolve: {
    // 省去引入组件的时候写后缀的麻烦
    extensions: [".js", ".jsx", ".ts", ".tsx", ".scss", ".json", ".css"],
    alias: {
      src: path.resolve(__dirname, "../src/components"),
      utils: path.resolve(__dirname, "../src/utils")
    }
  },
  devtool: "inline-source-map",
  // 根据不同的策略来分割打包出来的bundle。
  optimization: {
    splitChunks: {
      cacheGroups: {
        // 抽离自己写的第三方代码
        commons: {
          // 同时打包同步跟异步代码 比如import ('./a,js) import b.js
          chunks: "all",
          name: "common", //打包之后的文件名
          minChunks: 2, //最小引用两次 //比如a.js b.js都引入了c.js c.js就是需要抽出来的
          minSize: 30000 // 只要超过0字节就生成一个新包
        },
        vendor: {
          //抽离第三方插件
          test: /node_modules/, // 指的是node_module下的第三方包
          chunks: "initial",
          name: "vendor" //打包之后的文件名
        }
      }
    }
  },
  stats: { children: false },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    // 将 webpack中`entry`配置的相关入口chunk  和  `extract-text-webpack-plugin`抽取的css样式   插入到该插件提供的`template`或者`templateContent`配置项指定的内容基础上生成一个html文件，具体插入方式是将样式`link`插入到`head`元素中，`script`插入到`head`或者`body`中。
    new HtmlWebpackPlugin({
      // html文件的title
      title: "blog",
      template: "./index.html",
      // js文件注入到body的底部
      inject: true,
      // 是否将错误信息输出到html页面中
      showErrors: true
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css"
    }),
    new happyPack({
      id: "happyBabel",
      loaders: [
        {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
            plugins: ["@babel/plugin-transform-runtime"],
            cacheDirectory: true
          }
        }
      ],
      // 多个 HappyPack 实例都使用同一个共享进程池中的子进程去处理任务，以防止资源占用过多
      threadPool: happyThreadPool,
      //允许 HappyPack 输出日志
      verbose: true
    }),
    new happyPack({
      id: "happyCss",
      loaders: [
        {
          loader: "css-loader",
          options: {
            modules: true
          }
        }
      ],
      threadPool: happyThreadPool,
      verbose: true
    }),
    new happyPack({
      id: "happyImg",
      loaders: [
        {
          loader: "url-loader",
          options: {
            limit: 5000, //限制打包图片的大小：
            //如果大于或等于5000Byte，则按照相应的文件名和路径打包图片；如果小于5000Byte，则将图片转成base64格式的字符串。
            name: "img/[name]-[hash:8].[ext]"
          }
        }
      ],
      threadPool: happyThreadPool,
      verbose: true
    })
  ]
};
