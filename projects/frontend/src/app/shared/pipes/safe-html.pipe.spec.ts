import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeHtmlPipe } from './safe-html.pipe';

describe('SafeHtmlPipe', () => {
  let pipe: SafeHtmlPipe;
  let sanitizerMock: { sanitize: jest.Mock };

  beforeEach(() => {
    sanitizerMock = { sanitize: jest.fn((_ctx: number, value: string) => value) };
    TestBed.configureTestingModule({
      providers: [{ provide: DomSanitizer, useValue: sanitizerMock }],
    });
    pipe = TestBed.runInInjectionContext(() => new SafeHtmlPipe());
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should call sanitizer with SecurityContext.HTML and value', () => {
    const html = '<b>Hello</b>';
    pipe.transform(html);
    expect(sanitizerMock.sanitize).toHaveBeenCalledWith(1, html);
  });

  it('should return sanitized value', () => {
    const html = '<p>Safe content</p>';
    sanitizerMock.sanitize.mockReturnValue(html);
    expect(pipe.transform(html)).toBe(html);
  });

  it('should return empty string when sanitizer returns null', () => {
    sanitizerMock.sanitize.mockReturnValue(null);
    expect(pipe.transform('<script>evil</script>')).toBe('');
  });
});
