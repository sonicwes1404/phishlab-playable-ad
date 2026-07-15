const fs = require('fs');
const PNG = require('pngjs').PNG;

fs.createReadStream('assets/spritesheet.png')
    .pipe(new PNG())
    .on('parsed', function() {
        const cellW = this.width / 5; // 204.8
        const cellH = this.height / 4; // 143.75
        
        console.log(`Image: ${this.width}x${this.height}`);
        console.log(`Cell size: ${cellW} x ${cellH}`);
        
        for (let r = 0; r < 4; r++) {
            const y_start = Math.floor(r * cellH);
            const y_end = Math.floor((r + 1) * cellH) - 1;
            
            let firstActiveY = -1;
            let lastActiveY = -1;
            
            for (let y = y_start; y <= y_end; y++) {
                let hasPixels = false;
                // Check all columns for this row
                for (let x = 0; x < this.width; x++) {
                    const idx = (this.width * y + x) << 2;
                    const a = this.data[idx + 3];
                    if (a > 10) {
                        hasPixels = true;
                        break;
                    }
                }
                if (hasPixels) {
                    if (firstActiveY === -1) firstActiveY = y;
                    lastActiveY = y;
                }
            }
            console.log(`Row ${r} (y = ${y_start} to ${y_end}): active pixels from y = ${firstActiveY} to y = ${lastActiveY}`);
        }
    });
