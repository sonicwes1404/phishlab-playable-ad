const fs = require('fs');
const PNG = require('pngjs').PNG;

fs.createReadStream('assets/spritesheet.png')
    .pipe(new PNG())
    .on('parsed', function() {
        console.log(`Slicing spritesheet: ${this.width}x${this.height}`);
        
        const cellW = this.width / 5; // 204.8
        const cellH = this.height / 4; // 143.75
        
        // Let's inspect cell (0,0) (Connected Youth, Idle)
        // We will output a small ASCII art or description of where the pixels are in cell (0,0)
        // Let's find the vertical bounds of non-transparent pixels in cell (0,0)
        const x_min = 0;
        const x_max = Math.floor(cellW) - 1;
        const y_min = 0;
        const y_max = Math.floor(cellH) - 1;
        
        let firstActiveRow = -1;
        let lastActiveRow = -1;
        
        for (let y = y_min; y <= y_max; y++) {
            let hasPixels = false;
            for (let x = x_min; x <= x_max; x++) {
                const idx = (this.width * y + x) << 2;
                const a = this.data[idx + 3];
                if (a > 10) {
                    hasPixels = true;
                    break;
                }
            }
            if (hasPixels) {
                if (firstActiveRow === -1) firstActiveRow = y;
                lastActiveRow = y;
            }
        }
        
        console.log(`Cell (0,0): y_min = ${y_min}, y_max = ${y_max}`);
        console.log(`Active pixel rows in cell (0,0): from y = ${firstActiveRow} to y = ${lastActiveRow}`);
    });
