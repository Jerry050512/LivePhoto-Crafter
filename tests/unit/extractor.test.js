/**
 * 提取模块单元测试
 */

const {
    detectVideoInfo,
    findJpegEnd,
    findMp4Start
} = require('../../src/core/extractor');

describe('Extractor Module', () => {
    describe('detectVideoInfo', () => {
        it('should detect Google Motion Photo V2 format', () => {
            const xmpData = 'Item:Length="1000"';
            const buffer = Buffer.from(`header ${xmpData} footer`);
            const result = detectVideoInfo(buffer, 2000);
            
            expect(result.videoLength).toBe(1000);
            expect(result.videoStart).toBe(1000);
            expect(result.format).toBe('google-v2');
        });

        it('should detect old Google format', () => {
            // 测试旧版 Google 格式：GContainer:Mime 和 GContainer:Length 在同一元素中
            const xmpData = '<rdf:li GContainer:Mime="video/mp4" GContainer:Length="500"/>';
            const buffer = Buffer.from(xmpData);
            const result = detectVideoInfo(buffer, 1500);
            
            expect(result.videoLength).toBe(500);
            expect(result.videoStart).toBe(1000);
            expect(result.format).toBe('google-old');
        });

        it('should detect MicroVideo format', () => {
            const jsonData = '{"offset":100}';
            const buffer = Buffer.from(jsonData);
            const result = detectVideoInfo(buffer, 500);
            
            expect(result.videoStart).toBe(100);
            expect(result.videoLength).toBe(400);
            expect(result.format).toBe('microvideo');
        });

        it('should detect MicroVideoOffset format', () => {
            const xmpData = 'MicroVideoOffset="300"';
            const buffer = Buffer.from(xmpData);
            const result = detectVideoInfo(buffer, 800);
            
            expect(result.videoLength).toBe(300);
            expect(result.videoStart).toBe(500);
            expect(result.format).toBe('microvideo');
        });

        it('should detect MP4 by header', () => {
            // Create buffer with MP4 ftyp header
            const buffer = Buffer.alloc(100);
            buffer.writeUInt32BE(20, 0); // Box size
            buffer.write('ftyp', 4); // ftyp
            
            const result = detectVideoInfo(buffer, 100);
            
            expect(result.videoStart).toBe(0);
            expect(result.videoLength).toBe(100);
            expect(result.format).toBe('unknown');
        });

        it('should return null for invalid data', () => {
            const buffer = Buffer.from('no valid data');
            const result = detectVideoInfo(buffer, 100);
            
            expect(result.videoLength).toBeNull();
            expect(result.videoStart).toBe(-1);
            expect(result.format).toBeNull();
        });
    });

    describe('findJpegEnd', () => {
        it('should find EOI marker', () => {
            const buffer = Buffer.from([
                0x00, 0x00,
                0xFF, 0xD9, // EOI
                0x00, 0x00
            ]);
            const pos = findJpegEnd(buffer, 10);
            expect(pos).toBe(4);
        });

        it('should return maxPos if EOI not found', () => {
            const buffer = Buffer.from([0x00, 0x00, 0x00, 0x00]);
            const pos = findJpegEnd(buffer, 5);
            expect(pos).toBe(5);
        });

        it('should return maxPos if EOI is beyond maxPos', () => {
            const buffer = Buffer.from([
                0x00, 0x00, 0x00, 0x00,
                0xFF, 0xD9 // EOI at position 4
            ]);
            const pos = findJpegEnd(buffer, 2);
            expect(pos).toBe(2);
        });
    });

    describe('findMp4Start', () => {
        it('should find ftyp header', () => {
            const buffer = Buffer.alloc(50);
            buffer.writeUInt32BE(20, 0);
            buffer.write('ftyp', 4);
            
            const pos = findMp4Start(buffer);
            expect(pos).toBe(0);
        });

        it('should find ftyp at offset', () => {
            const buffer = Buffer.alloc(100);
            buffer.writeUInt32BE(20, 10);
            buffer.write('ftyp', 14);
            
            const pos = findMp4Start(buffer);
            expect(pos).toBe(10);
        });

        it('should return -1 if ftyp not found', () => {
            const buffer = Buffer.from('no mp4 header here');
            const pos = findMp4Start(buffer);
            expect(pos).toBe(-1);
        });

        it('should return -1 for empty buffer', () => {
            const pos = findMp4Start(Buffer.alloc(0));
            expect(pos).toBe(-1);
        });
    });
});
