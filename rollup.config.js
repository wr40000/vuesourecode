import babel from 'rollup-plugin-babel'

export default {
    input: './src/index.js',
    output: {
        file: './dist/vue.js',
        name: 'Vue',
        format: 'umd',
        sourcemap: true
    },
    plugins: [
        babel({
            exclude: 'node_modules/**'  //排除node_modules下的全部模块           
        })
    ]
}