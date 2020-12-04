export default {
    context: 'window',
    output: {
        format: 'umd',
        name: 'ng2-select2',
        globals: {
            '@angular/core': 'ng.core',
        }
    },
    external: [
        '@angular/core',
        '@angular/common'
    ],
};