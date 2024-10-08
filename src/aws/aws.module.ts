import { Global, Module } from '@nestjs/common';
import { AwsService } from './aws.service';

@Global() // This makes the module global
@Module({
  providers: [AwsService],
  exports: [AwsService], // Export the service so it can be used in other modules
})
export class AwsModule {}
