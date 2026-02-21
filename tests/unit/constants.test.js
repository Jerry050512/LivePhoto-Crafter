/**
 * 常量模块单元测试
 */

const {
    XMP_TEMPLATE,
    MICROVIDEO_TEMPLATE,
    VideoCodec,
    VideoCodecDescription,
    JpegMarkers,
    Mp4Boxes
} = require('../../src/core/constants');

describe('Constants', () => {
    describe('XMP_TEMPLATE', () => {
        it('should be a string', () => {
            expect(typeof XMP_TEMPLATE).toBe('string');
        });

        it('should contain required placeholders', () => {
            expect(XMP_TEMPLATE).toContain('{VIDEO_LENGTH}');
            expect(XMP_TEMPLATE).toContain('{TIMESTAMP_US}');
        });

        it('should contain required namespaces', () => {
            expect(XMP_TEMPLATE).toContain('xmlns:GCamera');
            expect(XMP_TEMPLATE).toContain('xmlns:Container');
            expect(XMP_TEMPLATE).toContain('xmlns:Item');
        });

        it('should contain MotionPhoto markers', () => {
            expect(XMP_TEMPLATE).toContain('GCamera:MotionPhoto="1"');
            expect(XMP_TEMPLATE).toContain('GCamera:MotionPhotoVersion="1"');
        });
    });

    describe('MICROVIDEO_TEMPLATE', () => {
        it('should be a string', () => {
            expect(typeof MICROVIDEO_TEMPLATE).toBe('string');
        });

        it('should contain offset placeholder', () => {
            expect(MICROVIDEO_TEMPLATE).toContain('{OFFSET}');
        });
    });

    describe('VideoCodec', () => {
        it('should have H264 codec', () => {
            expect(VideoCodec.H264).toBe('h264');
        });

        it('should have HEVC codec', () => {
            expect(VideoCodec.HEVC).toBe('hevc');
        });

        it('should have COPY codec', () => {
            expect(VideoCodec.COPY).toBe('copy');
        });
    });

    describe('VideoCodecDescription', () => {
        it('should have description for H264', () => {
            expect(VideoCodecDescription[VideoCodec.H264]).toBeDefined();
            expect(typeof VideoCodecDescription[VideoCodec.H264]).toBe('string');
        });

        it('should have description for HEVC', () => {
            expect(VideoCodecDescription[VideoCodec.HEVC]).toBeDefined();
            expect(typeof VideoCodecDescription[VideoCodec.HEVC]).toBe('string');
        });

        it('should have description for COPY', () => {
            expect(VideoCodecDescription[VideoCodec.COPY]).toBeDefined();
            expect(typeof VideoCodecDescription[VideoCodec.COPY]).toBe('string');
        });
    });

    describe('JpegMarkers', () => {
        it('should have SOI marker', () => {
            expect(JpegMarkers.SOI).toBe(0xD8);
        });

        it('should have EOI marker', () => {
            expect(JpegMarkers.EOI).toBe(0xD9);
        });

        it('should have APP1 marker', () => {
            expect(JpegMarkers.APP1).toBe(0xE1);
        });
    });

    describe('Mp4Boxes', () => {
        it('should have FTYP box', () => {
            expect(Mp4Boxes.FTYP).toBe('ftyp');
        });

        it('should have MOOV box', () => {
            expect(Mp4Boxes.MOOV).toBe('moov');
        });

        it('should have MDAT box', () => {
            expect(Mp4Boxes.MDAT).toBe('mdat');
        });
    });
});
