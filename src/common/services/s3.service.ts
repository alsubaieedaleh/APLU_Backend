import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private s3: S3;

  constructor(private configService: ConfigService) {
    this.s3 = new S3({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get('AWS_REGION'),
    });
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    const params = {
      Bucket: this.configService.get('AWS_S3_BUCKET'),
      Key: `${folder}/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ACL: 'private',
      ContentType: file.mimetype,
    };

    const result = await this.s3.upload(params).promise();
    return result.Location;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const key = this.getKeyFromUrl(fileUrl);
    await this.s3.deleteObject({
      Bucket: this.configService.get('AWS_S3_BUCKET'),
      Key: key,
    }).promise();
  }

  async createBackup(files: any[]): Promise<string> {
    const backupData = JSON.stringify(files);
    const params = {
      Bucket: this.configService.get('AWS_S3_BUCKET'),
      Key: `backups/${Date.now()}-backup.json`,
      Body: backupData,
      ACL: 'private',
    };

    const result = await this.s3.upload(params).promise();
    return result.Location;
  }

  private getKeyFromUrl(fileUrl: string): string {
    const url = new URL(fileUrl);
    return url.pathname.substring(1);
  }
} 