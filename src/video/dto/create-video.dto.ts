import { IsString, IsOptional } from 'class-validator';

export class CreateVideoDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
}