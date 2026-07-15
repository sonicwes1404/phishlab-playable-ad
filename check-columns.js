const fs = require('fs');
const PNG = require('pngjs').PNG;

fs.createReadStream('assets/spritesheet.png')
    .pipe(new PNG())
    .on('parsed', function() {
        const cellW = this.width / 5; // 204.8
        const cellH = this.height / 4; // 143.75
        
        console.log(`Image: ${this.width}x${this.height}`);
        
        for (let r = 0; r < 4; r++) {
            const y_start = Math.floor(r * cellH);
            const y_end = Math.floor((r + 1) * cellH) - 1;
            
            for (let c = 0; c < 5; c++) {
                const x_start = Math.floor(c * cellW);
                const x_end = Math.floor((c + 1) * cellW) - 1;
                
                let firstActiveY = -1;
                let lastActiveY = -1;
                
                for (let y = y_start; y <= y_end; y++) {
                    let hasPixels = false;
                    for (let x = x_start; x <= x_end; x++) {
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
                console.log(`Cell (${r},${c}): active Y = ${firstActiveY} to ${lastActiveY} (bounds: ${y_start} to ${y_end})`);
            }
        }
    });
