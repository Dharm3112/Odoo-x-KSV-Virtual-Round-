import { BadRequestException } from '@nestjs/common';
import { MAX_UPLOAD_SIZE_BYTES } from './upload.constants';
import { UploadValidationPipe } from './upload-validation.pipe';

function createFile(overrides: Partial<Express.Multer.File> = {}): Express.Multer.File {
  return {
    fieldname: 'file',
    originalname: 'document.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    size: 128,
    buffer: Buffer.from('test'),
    destination: '',
    filename: '',
    path: '',
    stream: null as never,
    ...overrides,
  };
}

describe('UploadValidationPipe', () => {
  const pipe = new UploadValidationPipe();

  it('accepts an allowed file within the size limit', () => {
    const file = createFile();
    expect(pipe.transform(file)).toBe(file);
  });

  it('rejects files larger than 10 MB', () => {
    expect(() => pipe.transform(createFile({ size: MAX_UPLOAD_SIZE_BYTES + 1 }))).toThrow(
      BadRequestException,
    );
  });

  it('rejects unsupported MIME types', () => {
    expect(() => pipe.transform(createFile({ mimetype: 'application/x-msdownload' }))).toThrow(
      BadRequestException,
    );
  });
});
