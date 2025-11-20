import { 
  Controller, 
  Post, 
  Get, 
  Delete, 
  Param, 
  UploadedFiles, 
  UseInterceptors, 
  Body, 
  BadRequestException 
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { VideoService } from './video.service';
import { CreateVideoDto } from './dto/create-video.dto';

@Controller('videos')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post('upload')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'file', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
  ]))
  upload(
    @UploadedFiles() files: { file?: Express.Multer.File[], cover?: Express.Multer.File[] },
    @Body() createVideoDto: CreateVideoDto
  ) {
    const videoFile = files.file ? files.file[0] : null;
    const coverFile = files.cover ? files.cover[0] : null;

    if (!videoFile) {
      throw new BadRequestException('O arquivo de vídeo é obrigatório.');
    }

    return this.videoService.uploadAndConvert(videoFile, coverFile, createVideoDto);
  }

  @Get()
  findAll() {
    return this.videoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.videoService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.videoService.remove(id);
  }
}