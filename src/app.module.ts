import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VideoModule } from './video/video.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [VideoModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
