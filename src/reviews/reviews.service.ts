import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createReviewDto: CreateReviewDto) {
    const { movieId, rating, comment } = createReviewDto;

    const movie = await this.prisma.movie.findUnique({ where: { id: movieId } });
    if (!movie) throw new NotFoundException('Filme não encontrado.');

    const existingReview = await this.prisma.review.findFirst({
      where: { userId, movieId }
    });

    if (existingReview) {
      throw new BadRequestException('Você já avaliou este filme.');
    }

    const review = await this.prisma.review.create({
      data: {
        rating,
        comment,
        userId,
        movieId
      }
    });

    await this.updateMovieRating(movieId);

    return review;
  }

  private async updateMovieRating(movieId: string) {
    const aggregations = await this.prisma.review.aggregate({
      _avg: { rating: true },
      where: { movieId }
    });

    const average = aggregations._avg.rating || 0;

    await this.prisma.movie.update({
      where: { id: movieId },
      data: { rating: average }
    });
  }

  async findAllByMovie(movieId: string) {
    return this.prisma.review.findMany({
      where: { movieId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async remove(id: string) {
    const review = await this.prisma.review.delete({ where: { id } });
    
    await this.updateMovieRating(review.movieId);
    
    return { message: 'Avaliação removida.' };
  }
}