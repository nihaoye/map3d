const path = require('path');
module.exports = {
    entry:'./src/index.js',
    output:{
        path:path.resolve(__dirname,'dist'),
        filename:'fc3dmap.js'
    },
    module: {
        rules: [ // 用于规定在不同模块被创建时如何处理模块的规则数组
            {
                test: /\.js$/,
                use: {
                    loader: "babel-loader",

                },
                exclude: path.resolve(__dirname, 'node_modules'),
                include: path.resolve(__dirname, 'src'),
            }
        ]
    }
};