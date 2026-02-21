/**
 * 参数解析模块单元测试
 */

const { parseArgs } = require('../../src/cli/parser');

describe('Parser Module', () => {
    describe('parseArgs', () => {
        it('should parse command', () => {
            const result = parseArgs(['extract', 'input.jpg']);
            expect(result.command).toBe('extract');
            expect(result.positional).toEqual(['input.jpg']);
        });

        it('should parse multiple positional arguments', () => {
            const result = parseArgs(['create', 'video.mp4', 'output.jpg']);
            expect(result.command).toBe('create');
            expect(result.positional).toEqual(['video.mp4', 'output.jpg']);
        });

        it('should parse options with values', () => {
            const result = parseArgs(['create', 'video.mp4', '--codec', 'h264', '--cover', 'cover.jpg']);
            expect(result.options.codec).toBe('h264');
            expect(result.options.cover).toBe('cover.jpg');
        });

        it('should parse options without values as boolean', () => {
            const result = parseArgs(['create', 'video.mp4', '--help']);
            expect(result.options.help).toBe(true);
        });

        it('should parse mixed arguments', () => {
            const result = parseArgs([
                'create',
                'video.mp4',
                '--codec', 'hevc',
                '--timestamp', '00:00:01.500',
                'output.jpg'
            ]);
            expect(result.command).toBe('create');
            expect(result.positional).toEqual(['video.mp4', 'output.jpg']);
            expect(result.options.codec).toBe('hevc');
            expect(result.options.timestamp).toBe('00:00:01.500');
        });

        it('should handle empty args', () => {
            const result = parseArgs([]);
            expect(result.command).toBeNull();
            expect(result.positional).toEqual([]);
            expect(result.options).toEqual({});
        });

        it('should handle only options', () => {
            const result = parseArgs(['--help', '--verbose']);
            expect(result.command).toBeNull();
            expect(result.options.help).toBe(true);
            expect(result.options.verbose).toBe(true);
        });

        it('should handle option at end', () => {
            const result = parseArgs(['extract', 'input.jpg', '--verbose']);
            expect(result.command).toBe('extract');
            expect(result.positional).toEqual(['input.jpg']);
            expect(result.options.verbose).toBe(true);
        });

        it('should handle multiple options between positional args', () => {
            const result = parseArgs([
                'create',
                '--codec', 'h264',
                'video.mp4',
                '--cover', 'cover.jpg',
                'output.jpg'
            ]);
            expect(result.command).toBe('create');
            expect(result.positional).toEqual(['video.mp4', 'output.jpg']);
            expect(result.options.codec).toBe('h264');
            expect(result.options.cover).toBe('cover.jpg');
        });
    });
});
