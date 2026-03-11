import { FileSizePipe } from './file-size.pipe';

describe('FileSizePipe', () => {
  const pipe = new FileSizePipe();

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return "0 Bytes" for 0', () => {
    expect(pipe.transform(0)).toBe('0 Bytes');
  });

  it('should format bytes correctly', () => {
    expect(pipe.transform(500)).toBe('500 Bytes');
  });

  it('should format KB correctly', () => {
    expect(pipe.transform(1024)).toBe('1 KB');
    expect(pipe.transform(1536)).toBe('1.5 KB');
  });

  it('should format MB correctly', () => {
    expect(pipe.transform(1024 * 1024)).toBe('1 MB');
    expect(pipe.transform(2.5 * 1024 * 1024)).toBe('2.5 MB');
  });

  it('should format GB correctly', () => {
    expect(pipe.transform(1024 * 1024 * 1024)).toBe('1 GB');
  });

  it('should use custom decimals when provided', () => {
    expect(pipe.transform(1536, 0)).toBe('2 KB');
    expect(pipe.transform(1536, 3)).toBe('1.5 KB');
  });

  it('should default to 0 when decimals is negative', () => {
    expect(pipe.transform(1536, -1)).toBe('2 KB');
  });
});
