import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('@nestjs/jwt', () => ({
  JwtService: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: { findByEmail: jest.Mock; create: jest.Mock };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };
    jwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });
    it('should register a new user successfully', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    usersService.create.mockResolvedValue({
      id: 'user-uuid-123',
      username: 'johndoe',
      email: 'johndoe@example.com',
      password_hash: 'some-hashed-value',
    });

    const result = await authService.register({
      username: 'johndoe',
      email: 'johndoe@example.com',
      password: 'password123',
    });

    expect(result).toEqual({
      id: 'user-uuid-123',
      username: 'johndoe',
      email: 'johndoe@example.com',
    });
    expect(usersService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        username: 'johndoe',
        email: 'johndoe@example.com',
        password_hash: expect.any(String),
      }),
    );
  });
    it('should throw BadRequestException if email already registered', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'existing-user-id',
      username: 'johndoe',
      email: 'johndoe@example.com',
      password_hash: 'already-hashed',
    });

    await expect(
      authService.register({
        username: 'johndoe',
        email: 'johndoe@example.com',
        password: 'password123',
      }),
    ).rejects.toThrow(BadRequestException);

    expect(usersService.create).not.toHaveBeenCalled();
  });
    it('should login successfully and return an access_token', async () => {
    const plainPassword = 'password123';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    usersService.findByEmail.mockResolvedValue({
      id: 'user-uuid-123',
      username: 'johndoe',
      email: 'johndoe@example.com',
      password_hash: hashedPassword,
    });
    jwtService.sign.mockReturnValue('mocked-jwt-token');

    const result = await authService.login({
      email: 'johndoe@example.com',
      password: plainPassword,
    });

    expect(result).toEqual({ access_token: 'mocked-jwt-token' });
    expect(jwtService.sign).toHaveBeenCalledWith({ userId: 'user-uuid-123' });
  });
    it('should throw UnauthorizedException if user is not found', async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(
      authService.login({
        email: 'notregistered@example.com',
        password: 'password123',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if password is wrong', async () => {
    const hashedPassword = await bcrypt.hash('correct-password', 10);
    usersService.findByEmail.mockResolvedValue({
      id: 'user-uuid-123',
      username: 'johndoe',
      email: 'johndoe@example.com',
      password_hash: hashedPassword,
    });

    await expect(
      authService.login({
        email: 'johndoe@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toThrow(UnauthorizedException);

    expect(jwtService.sign).not.toHaveBeenCalled();
  });
});