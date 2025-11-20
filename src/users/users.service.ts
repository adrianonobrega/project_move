import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { email, password, address, ...userData } = createUserDto;

    const userExists = await this.prisma.user.findUnique({ where: { email } });
    if (userExists) {
      throw new ConflictException('Email já cadastrado');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await this.prisma.user.create({
      data: {
        ...userData,
        email,
        password: hashedPassword,
        address: address ? {
          create: {
            ...address
          }
        } : undefined,
      },
      include: {
        address: true
      }
    });
    const { password: _, ...result } = user;
    return result;
  }
  async findByEmailForAuth(email: string) {
      return this.prisma.user.findUnique({
        where: { email }
      });
    }
  
  async findAll() {
    const users = await this.prisma.user.findMany({
      include: { address: true }
    });
    
    return users.map(user => {
      const { password, ...result } = user;
      return result;
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { address: true }
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');

    const { password, ...result } = user;
    return result;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}