import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ALLOWED_UPLOAD_MIME_TYPES, MAX_UPLOAD_SIZE_BYTES } from './upload.constants';

@Injectable()
export class UploadValidationPipe implements PipeTransform<Express.Multer.File> {
  transform(file: Express.Multer.File): Express.Multer.File {
    if (!file) {
      throw new BadRequestException('A file is required');
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      throw new BadRequestException('File size must not exceed 10 MB');
    }

    if (!ALLOWED_UPLOAD_MIME_TYPES.includes(file.mimetype as never)) {
      throw new BadRequestException(
        'Unsupported file type. Allowed types: PDF, JPG, PNG, DOCX, XLSX',
      );
    }

    return file;
  }
}
