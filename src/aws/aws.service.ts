import { Injectable } from '@nestjs/common';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AwsService {
  private snsClient: SNSClient;
  private sesClient: SESClient;
  private s3Client: S3Client;

  constructor(private configService: ConfigService) {
    const region = this.configService.get('AWS_REGION');
    const credentials = {
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
    };

    this.snsClient = new SNSClient({ region, credentials });
    this.sesClient = new SESClient({ region, credentials });
    this.s3Client = new S3Client({ region, credentials });
  }

  // SNS: Send SMS
  async sendSms(phoneNumber: string, message: string): Promise<any> {
    const params = {
      Message: message,
      PhoneNumber: phoneNumber,
    };
    const command = new PublishCommand(params);
    return this.snsClient.send(command);
  }

  // SES: Send Email
  async sendEmail(to: string, subject: string, body: string): Promise<any> {
    const params = {
      Source: this.configService.get('AWS_SES_FROM_EMAIL'),
      Destination: { ToAddresses: [to] },
      Message: {
        Body: { Html: { Charset: 'UTF-8', Data: body } },
        Subject: { Charset: 'UTF-8', Data: subject },
      },
    };
    const command = new SendEmailCommand(params);
    return this.sesClient.send(command);
  }

  // S3: Upload File
  async uploadToS3(bucket: string, key: string, body: Buffer): Promise<any> {
    const params = {
      Bucket: bucket,
      Key: key,
      Body: body,
      ACL: 'public-read',
    };
    const command = new PutObjectCommand(params as PutObjectCommandInput);
    return this.s3Client.send(command);
  }
}
