import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';

import { User } from '../../user/entities/user.entity';
import { Project } from '../entities/project.entity';
import { ProjectRepository } from './project.repository';

describe('ProjectRepository', () => {
  let repository: ProjectRepository;

  let dataSource: {
    createEntityManager: jest.Mock;
  };

  beforeEach(async () => {
    dataSource = {
      createEntityManager: jest.fn(),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectRepository,
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    repository = moduleRef.get<ProjectRepository>(ProjectRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('Get project by id', () => {
    it('should call findOne with correct id', () => {
      const id = 1;

      jest.spyOn(repository, 'findOne').mockResolvedValue(new Project());
      repository.getById(id);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id } });
    });

    it('should return project if found', async () => {
      const expectedOutput: any = {
        id: 1,
        name: 'Default Project',
        desc: 'Hello, world!',
        author: new User(),
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(expectedOutput);

      expect(await repository.getById(1)).toEqual(expectedOutput);
    });

    it('should throw NotFoundError when project not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(undefined);
      try {
        await repository.getById(1);
      } catch (error) {
        expect(error.constructor).toBe(NotFoundException);
      }
    });
  });
});
