import { Injectable, NotFoundException } from '@nestjs/common';
import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVideoDto } from './dto/create-video.dto';

@Injectable()
export class VideoService {
  constructor(private prisma: PrismaService) {}

  // Lógica de Upload e Conversão
  async uploadAndConvert(file: Express.Multer.File, createVideoDto: CreateVideoDto) {
    const { title } = createVideoDto;
    const uploadDir = path.join(process.cwd(), 'uploads', 'movies');
    const safeTitle = title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const movieFolder = path.join(uploadDir, safeTitle);

    if (!fs.existsSync(movieFolder)) {
      fs.mkdirSync(movieFolder, { recursive: true });
    }

    const tempInputPath = path.join(movieFolder, file.originalname);
    fs.writeFileSync(tempInputPath, file.buffer);

    const outputHLS = path.join(movieFolder, 'index.m3u8');

    return new Promise((resolve, reject) => {
      ffmpeg(tempInputPath)
        .outputOptions(['-hls_time 10', '-hls_list_size 0', '-f hls'])
        .output(outputHLS)
        .on('end', async () => {
          fs.unlinkSync(tempInputPath); // Limpa o original
          
          const movie = await this.prisma.movie.create({
            data: {
              title: title,
              folderPath: `/uploads/movies/${safeTitle}`,
              hlsManifest: 'index.m3u8'
            }
          });
          resolve(movie);
        })
        .on('error', (err) => reject(err))
        .run();
    });
  }

  async findAll() {
    return this.prisma.movie.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const movie = await this.prisma.movie.findUnique({ where: { id } });
    if (!movie) throw new NotFoundException('Filme não encontrado');
    return movie;
  }

  async remove(id: string) {
    const movie = await this.findOne(id);
    await this.prisma.movie.delete({ where: { id } });

    const absolutePath = path.join(process.cwd(), movie.folderPath);
    if (fs.existsSync(absolutePath)) {
      fs.rmSync(absolutePath, { recursive: true, force: true });
    }
    return { message: 'Filme deletado com sucesso' };
  }
}