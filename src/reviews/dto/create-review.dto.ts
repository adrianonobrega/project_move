import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsInt({ message: 'A nota deve ser um número inteiro.' })
  @Min(1, { message: 'A nota mínima é 1.' })
  @Max(5, { message: 'A nota máxima é 5.' })
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsNotEmpty({ message: 'O ID do filme é obrigatório.' })
  @IsString()
  movieId: string;
}