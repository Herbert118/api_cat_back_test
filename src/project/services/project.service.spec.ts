import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ROLE } from '../../auth/constants/role.constant';
import { AppLogger } from '../../shared/logger/logger.service';
import { RequestContext } from '../../shared/request-context/request-context.dto';
import { UserOutput } from '../../user/dtos/user-output.dto';
import { User } from '../../user/entities/user.entity';
import { UserService } from '../../user/services/user.service';
import {
  CreateProjectInput,
  UpdateProjectInput,
} from '../dtos/project-input.dto';
import { ProjectOutput } from '../dtos/project-output.dto';
import { Project } from '../entities/project.entity';
import { ProjectRepository } from '../repositories/project.repository';
import { ProjectService } from './project.service';
import { ProjectAclService } from './project-acl.service';

describe('ProjectService', () => {
  let service: ProjectService;
  let mockedRepository: any;
  let mockedUserService: any;
  const mockedLogger = { setContext: jest.fn(), log: jest.fn() };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        {
          provide: ProjectRepository,
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            getById: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            getUserById: jest.fn(),
          },
        },
        { provide: ProjectAclService, useValue: new ProjectAclService() },
        { provide: AppLogger, useValue: mockedLogger },
      ],
    }).compile();

    service = moduleRef.get<ProjectService>(ProjectService);
    mockedRepository = moduleRef.get(ProjectRepository);
    mockedUserService = moduleRef.get(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const ctx = new RequestContext();

  describe('Create Project', () => {
    it('should get user from user claims user id', () => {
      ctx.user = {
        id: 1,
        roles: [ROLE.USER],
        username: 'testuser',
      };

      service.createProject(ctx, new CreateProjectInput());
      expect(mockedUserService.getUserById).toHaveBeenCalledWith(ctx, 1);
    });

    it('should call repository save with proper project input and return proper output', async () => {
      ctx.user = {
        id: 1,
        roles: [ROLE.USER],
        username: 'testuser',
      };

      const projectInput: CreateProjectInput = {
        name: 'Test',
        desc: 'Hello, world!',
      };

      const owner = new UserOutput();
      mockedUserService.getUserById.mockResolvedValue(owner);
      const expected = {
        name: 'Test',
        desc: 'Hello, world!',
        owner,
      };

      const expectedOutput = {
        id: 1,
        name: 'Test',
        desc: 'Hello, world!',
        owner: new User(),
      };
      mockedRepository.save.mockResolvedValue(expectedOutput);

      const output = await service.createProject(ctx, projectInput);
      expect(mockedRepository.save).toHaveBeenCalledWith(expected);
      expect(output).toEqual(expectedOutput);
    });
  });

  describe('getProjects', () => {
    const limit = 10;
    const offset = 0;
    const currentDate = new Date();

    it('should return projects when found', async () => {
      const expectedOutput: ProjectOutput[] = [
        {
          id: 1,
          name: 'Test',
          desc: 'Hello, world!',
          owner: new User(),
          createdAt: currentDate,
          updatedAt: currentDate,
        },
      ];

      mockedRepository.findAndCount.mockResolvedValue([
        expectedOutput,
        expectedOutput.length,
      ]);

      expect(await service.getProjects(ctx, limit, offset)).toEqual({
        projects: expectedOutput,
        count: expectedOutput.length,
      });
    });

    it('should return empty array when projects are not found', async () => {
      const expectedOutput: ProjectOutput[] = [];

      mockedRepository.findAndCount.mockResolvedValue([
        expectedOutput,
        expectedOutput.length,
      ]);

      expect(await service.getProjects(ctx, limit, offset)).toEqual({
        projects: expectedOutput,
        count: expectedOutput.length,
      });
    });
  });

  describe('getProject', () => {
    it('should return project by id when project is found', async () => {
      const id = 1;
      const currentDate = new Date();

      const expectedOutput: ProjectOutput = {
        id: 1,
        name: 'Test',
        desc: 'Hello, world!',
        owner: new User(),
        createdAt: currentDate,
        updatedAt: currentDate,
      };

      mockedRepository.getById.mockResolvedValue(expectedOutput);

      expect(await service.getProjectById(ctx, id)).toEqual(expectedOutput);
    });

    it('should fail when project is not found and return the repository error', async () => {
      const id = 1;

      mockedRepository.getById.mockRejectedValue({
        message: 'error',
      });

      try {
        await service.getProjectById(ctx, id);
      } catch (error) {
        expect(error.message).toEqual('error');
      }
    });
  });

  describe('Update Project', () => {
    it('should get project by id', () => {
      ctx.user = {
        id: 1,
        roles: [ROLE.USER],
        username: 'testuser',
      };
      const projectId = 1;
      const input: UpdateProjectInput = {
        name: 'New Title',
        desc: 'New Post',
      };

      const owner = new User();
      owner.id = 1;
      mockedRepository.getById.mockResolvedValue({
        id: 1,
        name: 'Old name',
        desc: 'Old desc',
        owner,
      });

      service.updateProject(ctx, projectId, input);
      expect(mockedRepository.getById).toHaveBeenCalledWith(projectId);
    });

    it('should save project with updated name and desc', async () => {
      ctx.user = {
        id: 1,
        roles: [ROLE.USER],
        username: 'testuser',
      };
      const projectId = 1;
      const input: UpdateProjectInput = {
        name: 'New Title',
        desc: 'New Post',
      };
      const owner = new User();
      owner.id = 1;

      mockedRepository.getById.mockResolvedValue({
        id: 1,
        name: 'Old name',
        desc: 'Old desc',
        owner,
      });

      const expected = {
        id: 1,
        name: 'New Title',
        desc: 'New Post',
        owner,
      };
      await service.updateProject(ctx, projectId, input);
      expect(mockedRepository.save).toHaveBeenCalledWith(expected);
    });

    it('should throw unownerized exception when someone other than resource owner tries to update project', async () => {
      ctx.user = {
        id: 2,
        roles: [ROLE.USER],
        username: 'testuser',
      };
      const projectId = 1;
      const input: UpdateProjectInput = {
        name: 'New Title',
        desc: 'New Post',
      };
      const owner = new User();
      owner.id = 1;

      mockedRepository.getById.mockResolvedValue({
        id: 1,
        name: 'Old name',
        desc: 'Old desc',
        owner,
      });

      try {
        await service.updateProject(ctx, projectId, input);
      } catch (error) {
        expect(error.constructor).toEqual(UnauthorizedException);
        expect(mockedRepository.save).not.toHaveBeenCalled();
      }
    });
  });

  describe('deleteProject', () => {
    const projectId = 1;

    it('should call repository.remove with correct parameter', async () => {
      ctx.user = {
        id: 1,
        roles: [ROLE.USER],
        username: 'testuser',
      };

      const owner = new User();
      owner.id = 1;
      const foundProject = new Project();
      foundProject.id = projectId;
      foundProject.owner = owner;

      mockedRepository.getById.mockResolvedValue(foundProject);

      await service.deleteProject(ctx, projectId);
      expect(mockedRepository.remove).toHaveBeenCalledWith(foundProject);
    });

    it('should throw not found exception if project not found', async () => {
      mockedRepository.getById.mockRejectedValue(new NotFoundException());
      try {
        await service.deleteProject(ctx, projectId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('should throw unownerized exception when someone other than resource owner tries to delete project', async () => {
      ctx.user = {
        id: 2,
        roles: [ROLE.USER],
        username: 'testuser',
      };
      const projectId = 1;

      const owner = new User();
      owner.id = 1;

      mockedRepository.getById.mockResolvedValue({
        id: 1,
        name: 'Old name',
        desc: 'Old desc',
        owner,
      });

      try {
        await service.deleteProject(ctx, projectId);
      } catch (error) {
        expect(error.constructor).toEqual(UnauthorizedException);
        expect(mockedRepository.save).not.toHaveBeenCalled();
      }
    });
  });
});
