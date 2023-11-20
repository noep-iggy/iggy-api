import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Media } from './media.entity';
import { In, Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { FileUploadService } from '../file-upload/file-upload.service';
import * as fs from 'fs';
import { errorMessage } from '@/errors';
import { MediaDto, MediaType } from '@/types';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
    @Inject(FileUploadService)
    private fileUploadService: FileUploadService,
  ) {}

  formatMedia(media?: Media): MediaDto {
    if (!media) return;
    return {
      id: media.id,
      url: media.url,
      filename: media.filename,
      type: media.type,
      size: media.size,
      createdAt: media.createdAt,
      updatedAt: media.updatedAt,
    };
  }

  getLocalFilePathFromUrl(url: string): string {
    return `${process.env.FILES_PATH}/${url.split('/').pop()}`;
  }

  getFileExtension(filename: string): string {
    return filename.split('.').pop();
  }

  getUrlDomain(url: string): string {
    return url.split('/')[2];
  }

  async getMedias(): Promise<MediaDto[]> {
    try {
      const medias = await this.mediaRepository.find();
      return medias.map((media) => this.formatMedia(media));
    } catch (e) {
      throw new BadRequestException(errorMessage.api('media').NOT_FOUND);
    }
  }

  async getMediaById(_id: string): Promise<Media> {
    try {
      const media = await this.mediaRepository.findOneBy({
        id: _id,
      });
      return media;
    } catch (e) {
      throw new BadRequestException(errorMessage.api('media').NOT_FOUND, _id);
    }
  }

  async getManyMediasByIds(ids: string[]): Promise<MediaDto[]> {
    try {
      const medias = await this.mediaRepository.findBy({
        id: In(ids),
      });
      return medias.map((media) => this.formatMedia(media));
    } catch (e) {
      throw new BadRequestException(
        errorMessage.api('media').NOT_FOUND,
        ids.join(', '),
      );
    }
  }

  async getOneByIdOrReturnEmptyObject(
    _id: string,
  ): Promise<MediaDto | Record<string, never>> {
    try {
      const media = await this.mediaRepository.findOneBy({
        id: _id,
      });
      return this.formatMedia(media);
    } catch (e) {
      return {};
    }
  }

  async createMedia(file: Express.Multer.File, user: User): Promise<MediaDto> {
    try {
      if (!file)
        throw new BadRequestException(errorMessage.api('file').UNDEFINED);
      if (!user)
        throw new BadRequestException(errorMessage.api('user').UNDEFINED);
      const fileName = file.filename;
      const type = this.fileUploadService.detectFileType(file.filename);
      const media = await this.mediaRepository.save({
        url: `${process.env.API_URL}/files/${fileName}`,
        localPath: `${process.env.FILES_PATH}/${fileName}`,
        filename: file.originalname,
        type: type,
        size: file.size,
      });
      return this.formatMedia(media);
    } catch (e) {
      throw new BadRequestException(errorMessage.api('media').NOT_CREATED);
    }
  }

  async populateMedias(): Promise<MediaDto> {
    try {
      const media = {
        url: `${process.env.API_URL}/files/1.jpg`,
        localPath: `${process.env.FILES_PATH}/1.jpg`,
        filename: '1.jpg',
        type: MediaType.IMAGE,
        size: 0,
      };
      return await this.mediaRepository.save(media);
    } catch (e) {
      throw new BadRequestException(errorMessage.api('media').NOT_FOUND);
    }
  }

  async deleteMedia(_id: string): Promise<void> {
    try {
      const media = await this.mediaRepository.findOneBy({
        id: _id,
      });
      await this.mediaRepository.remove(media);
      fs.unlinkSync(this.getLocalFilePathFromUrl(media.url));
    } catch (e) {
      console.log(e);
      throw new BadRequestException(errorMessage.api('media').NOT_DELETED);
    }
  }
}
