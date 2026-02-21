/**
 * XMP 模块单元测试
 */

const {
    generateXmp,
    injectXmpToJpeg,
    isValidJpeg,
    findXmpInsertPosition,
    createXmpSegment,
    extractXmpFromBuffer
} = require('../../src/core/xmp');

describe('XMP Module', () => {
    describe('generateXmp', () => {
        it('should generate XMP with video length', () => {
            const xmp = generateXmp(1000, 0);
            expect(xmp).toContain('Item:Length="1000"');
        });

        it('should generate XMP with timestamp', () => {
            const xmp = generateXmp(1000, 500000);
            expect(xmp).toContain('GCamera:MotionPhotoPresentationTimestampUs="500000"');
        });

        it('should throw error for invalid video length', () => {
            expect(() => generateXmp(0, 0)).toThrow('视频长度必须是正数');
            expect(() => generateXmp(-1, 0)).toThrow('视频长度必须是正数');
        });

        it('should default timestamp to 0', () => {
            const xmp = generateXmp(1000);
            expect(xmp).toContain('GCamera:MotionPhotoPresentationTimestampUs="0"');
        });
    });

    describe('isValidJpeg', () => {
        it('should return true for valid JPEG', () => {
            const buffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
            expect(isValidJpeg(buffer)).toBe(true);
        });

        it('should return false for invalid JPEG', () => {
            const buffer = Buffer.from([0x00, 0x00, 0x00, 0x00]);
            expect(isValidJpeg(buffer)).toBe(false);
        });

        it('should return false for empty buffer', () => {
            expect(isValidJpeg(Buffer.alloc(0))).toBe(false);
        });

        it('should return false for buffer with only one byte', () => {
            expect(isValidJpeg(Buffer.from([0xFF]))).toBe(false);
        });
    });

    describe('findXmpInsertPosition', () => {
        it('should find position after SOI', () => {
            // SOI + APP0 (16 bytes length includes the length field itself)
            const buffer = Buffer.from([
                0xFF, 0xD8, // SOI (2 bytes)
                0xFF, 0xE0, // APP0 marker (2 bytes)
                0x00, 0x10, // Length = 16 (includes these 2 bytes + 14 data bytes)
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // 14 bytes padding to match length
                0xFF, 0xC0  // SOF0
            ]);
            const pos = findXmpInsertPosition(buffer);
            expect(pos).toBe(20); // After SOI (2) + APP0 (2 + 16 = 18) = 20
        });

        it('should return 2 for minimal JPEG', () => {
            const buffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xC0]);
            const pos = findXmpInsertPosition(buffer);
            expect(pos).toBe(2);
        });
    });

    describe('createXmpSegment', () => {
        it('should create valid XMP segment', () => {
            const xmpData = '<?xml version="1.0"?><xmp></xmp>';
            const segment = createXmpSegment(xmpData);
            
            expect(segment[0]).toBe(0xFF);
            expect(segment[1]).toBe(0xE1); // APP1
            expect(segment.length).toBeGreaterThan(4);
        });

        it('should include XMP namespace', () => {
            const xmpData = '<xmp></xmp>';
            const segment = createXmpSegment(xmpData);
            const segmentStr = segment.toString('utf-8');
            expect(segmentStr).toContain('http://ns.adobe.com/xap/1.0/');
        });
    });

    describe('injectXmpToJpeg', () => {
        it('should throw error for invalid JPEG', () => {
            const invalidJpeg = Buffer.from([0x00, 0x00, 0x00, 0x00]);
            expect(() => injectXmpToJpeg(invalidJpeg, '<xmp></xmp>')).toThrow('无效的 JPEG 文件');
        });

        it('should inject XMP into valid JPEG', () => {
            const jpeg = Buffer.from([
                0xFF, 0xD8, // SOI
                0xFF, 0xC0  // SOF0
            ]);
            const xmpData = '<?xml version="1.0"?><xmp></xmp>';
            const result = injectXmpToJpeg(jpeg, xmpData);
            
            expect(result.length).toBeGreaterThan(jpeg.length);
            expect(result[0]).toBe(0xFF);
            expect(result[1]).toBe(0xD8);
        });
    });

    describe('extractXmpFromBuffer', () => {
        it('should extract XMP from buffer', () => {
            const xmpContent = '<?xpacket begin="" ?><xmp></xmp><?xpacket end="w"?>';
            const buffer = Buffer.from(`some data ${xmpContent} more data`);
            const extracted = extractXmpFromBuffer(buffer);
            expect(extracted).toBe(xmpContent);
        });

        it('should return null if no XMP found', () => {
            const buffer = Buffer.from('no xmp here');
            const extracted = extractXmpFromBuffer(buffer);
            expect(extracted).toBeNull();
        });

        it('should return null for incomplete XMP', () => {
            const buffer = Buffer.from('<?xpacket begin="" ?><xmp></xmp>');
            const extracted = extractXmpFromBuffer(buffer);
            expect(extracted).toBeNull();
        });
    });
});
