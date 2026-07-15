const fs = require('fs');
const PNG = require('pngjs').PNG;

fs.createReadStream('assets/spritesheet.png')
    .pipe(new PNG())
    .on('parsed', function() {
        // Let's check a column of pixels in Cell (1,0)
        // x is from 0 to 204.
        // Let's print the colors of pixels in a vertical line at x = 100, for y = 140 to 150
        console.log("Colors at x = 100, y = 140 to 155:");
        for (let y = 140; y <= 155; y++) {
            const idx = (this.width * y + 100) << 2;
            const r = this.data[idx];
            const g = this.data[idx + 1];
            const b = this.data[idx + 2];
            const a = this.data[idx + 3];
            console.log(`y = ${y}: R=${r}, G=${g}, B=${b}, A=${a}`);
        }
    });
