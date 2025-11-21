import { 
  Controller, Post, Get, Patch, Delete, Param, Query, Body, 
  UploadedFiles, UseInterceptors, BadRequestException, UseGuards, 
  DefaultValuePipe, ParseIntPipe 
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { VideoService } from './video.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Videos') 
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt')) 
@Controller('videos')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
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
  findAll(
    @Query('search') search?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    return this.videoService.findAll(search, page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.videoService.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'cover', maxCount: 1 },
  ]))
  update(
    @Param('id') id: string, 
    @Body() updateVideoDto: UpdateVideoDto,
    @UploadedFiles() files: { cover?: Express.Multer.File[] }
  ) {
    const coverFile = files && files.cover ? files.cover[0] : undefined;
    return this.videoService.update(id, updateVideoDto, coverFile);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.videoService.remove(id);
  }
}