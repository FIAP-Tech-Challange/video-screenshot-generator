import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const mockUsersService = {
  getUserById: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  describe('getLoggedUser', () => {
    it('should return the user for the given userId', async () => {
      const user = { id: 'u-1', email: 'a@b.com', name: 'Alice' };
      mockUsersService.getUserById.mockResolvedValue(user);

      const result = await controller.getLoggedUser('u-1');

      expect(mockUsersService.getUserById).toHaveBeenCalledWith('u-1');
      expect(result).toEqual(user);
    });

    it('should propagate NotFoundException when user does not exist', async () => {
      mockUsersService.getUserById.mockRejectedValue(
        new NotFoundException('User with id "u-99" not found'),
      );

      await expect(controller.getLoggedUser('u-99')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
