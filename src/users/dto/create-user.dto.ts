import { IsString, IsEmail, MinLength, Matches, ValidateNested, IsOptional, IsIn } from 'class-validator'; // <--- Adicione IsIn
import { Type } from 'class-transformer';

export class CreateAddressDto {
  @IsString()
  street: string;
  
  @IsString()
  number: string;
  
  @IsString()
  city: string;
  
  @IsString()
  state: string;
  
  @IsString()
  zipCode: string;
}

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail({}, { message: 'O email informado é inválido' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, { 
    message: 'A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um caractere especial' 
  })
  password: string;

  @IsOptional()
  @IsString()
  @IsIn(['USER', 'ADMIN'], { message: 'O papel deve ser USER ou ADMIN' })
  role?: string;
  
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address?: CreateAddressDto; 
}