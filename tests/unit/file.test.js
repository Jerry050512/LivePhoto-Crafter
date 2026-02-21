/**
 * 文件工具模块单元测试
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const {
    ensureDir,
    cleanupTempFiles,
    getExtension,
    fileExists,
    getFileSize,
    formatFileSize,
    generateTempPath
} = require('../../src/utils/file');

describe('File Utils', () => {
    let tempDir;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'livephoto-test-'));
    });

    afterEach(() => {
        // Clean up temp directory
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });

    describe('ensureDir', () => {
        it('should create directory if not exists', () => {
            const newDir = path.join(tempDir, 'new-directory');
            expect(fs.existsSync(newDir)).toBe(false);
            
            ensureDir(newDir);
            
            expect(fs.existsSync(newDir)).toBe(true);
        });

        it('should not throw if directory already exists', () => {
            ensureDir(tempDir);
            expect(() => ensureDir(tempDir)).not.toThrow();
        });

        it('should create nested directories', () => {
            const nestedDir = path.join(tempDir, 'a', 'b', 'c');
            ensureDir(nestedDir);
            expect(fs.existsSync(nestedDir)).toBe(true);
        });
    });

    describe('cleanupTempFiles', () => {
        it('should delete existing files', () => {
            const file1 = path.join(tempDir, 'file1.txt');
            const file2 = path.join(tempDir, 'file2.txt');
            fs.writeFileSync(file1, 'content1');
            fs.writeFileSync(file2, 'content2');
            
            cleanupTempFiles([file1, file2]);
            
            expect(fs.existsSync(file1)).toBe(false);
            expect(fs.existsSync(file2)).toBe(false);
        });

        it('should not throw for non-existent files', () => {
            const nonExistent = path.join(tempDir, 'non-existent.txt');
            expect(() => cleanupTempFiles([nonExistent])).not.toThrow();
        });

        it('should handle empty array', () => {
            expect(() => cleanupTempFiles([])).not.toThrow();
        });
    });

    describe('getExtension', () => {
        it('should return lowercase extension', () => {
            expect(getExtension('file.JPG')).toBe('.jpg');
            expect(getExtension('file.MP4')).toBe('.mp4');
        });

        it('should return empty string for no extension', () => {
            expect(getExtension('file')).toBe('');
        });

        it('should handle paths with directories', () => {
            expect(getExtension('/path/to/file.JPG')).toBe('.jpg');
            expect(getExtension('C:\\path\\to\\file.MP4')).toBe('.mp4');
        });
    });

    describe('fileExists', () => {
        it('should return true for existing file', () => {
            const file = path.join(tempDir, 'exists.txt');
            fs.writeFileSync(file, 'content');
            expect(fileExists(file)).toBe(true);
        });

        it('should return false for non-existent file', () => {
            expect(fileExists('/non/existent/file.txt')).toBe(false);
        });

        it('should return true for existing directory', () => {
            expect(fileExists(tempDir)).toBe(true);
        });
    });

    describe('getFileSize', () => {
        it('should return correct file size', () => {
            const file = path.join(tempDir, 'size-test.txt');
            const content = 'Hello, World!';
            fs.writeFileSync(file, content);
            
            expect(getFileSize(file)).toBe(content.length);
        });

        it('should throw for non-existent file', () => {
            expect(() => getFileSize('/non/existent/file.txt')).toThrow();
        });
    });

    describe('formatFileSize', () => {
        it('should format bytes', () => {
            expect(formatFileSize(500)).toBe('500.00 B');
        });

        it('should format kilobytes', () => {
            expect(formatFileSize(1024)).toBe('1.00 KB');
            expect(formatFileSize(1536)).toBe('1.50 KB');
        });

        it('should format megabytes', () => {
            expect(formatFileSize(1024 * 1024)).toBe('1.00 MB');
            expect(formatFileSize(2.5 * 1024 * 1024)).toBe('2.50 MB');
        });

        it('should format gigabytes', () => {
            expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.00 GB');
        });
    });

    describe('generateTempPath', () => {
        it('should generate unique paths', () => {
            const path1 = generateTempPath(tempDir, 'test', '.txt');
            const path2 = generateTempPath(tempDir, 'test', '.txt');
            expect(path1).not.toBe(path2);
        });

        it('should include directory', () => {
            const tempPath = generateTempPath(tempDir, 'prefix', '.ext');
            expect(tempPath.startsWith(tempDir)).toBe(true);
        });

        it('should include prefix', () => {
            const tempPath = generateTempPath(tempDir, 'myprefix', '.ext');
            expect(tempPath).toContain('myprefix');
        });

        it('should include extension', () => {
            const tempPath = generateTempPath(tempDir, 'test', '.jpg');
            expect(tempPath.endsWith('.jpg')).toBe(true);
        });
    });
});
