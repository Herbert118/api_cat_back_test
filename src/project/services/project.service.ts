import { Injectable, UnauthorizedException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';

import { Action } from '../../shared/acl/action.constant';
import { Actor } from '../../shared/acl/actor.constant';
import { AppLogger } from '../../shared/logger/logger.service';
import { RequestContext } from '../../shared/request-context/request-context.dto';
import { User } from '../../user/entities/user.entity';
import { UserService } from '../../user/services/user.service';
import {
  CreateProjectInput,
  UpdateProjectInput,
} from '../dtos/project-input.dto';
import { ProjectOutput } from '../dtos/project-output.dto';
import { Project } from '../entities/project.entity';
import { ProjectRepository } from '../repositories/project.repository';
import { ProjectAclService } from './project-acl.service';

@Injectable()
export class ProjectService {
  constructor(
    private repository: ProjectRepository,
    private userService: UserService,
    private aclService: ProjectAclService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(ProjectService.name);
  }

  async createProject(
    ctx: RequestContext,
    input: CreateProjectInput,
  ): Promise<ProjectOutput> {
    this.logger.log(ctx, `${this.createProject.name} was called`);

    const project = plainToClass(Project, input);

    const actor: Actor = ctx.user;

    const user = await this.userService.getUserById(ctx, actor.id);

    const isAllowed = this.aclService
      .forActor(actor)
      .canDoAction(Action.Create, project);
    if (!isAllowed) {
      throw new UnauthorizedException();
    }

    project.owner = plainToClass(User, user);

    this.logger.log(ctx, `calling ${ProjectRepository.name}.save`);
    const savedProject = await this.repository.save(project);

    return plainToClass(ProjectOutput, savedProject, {
      excludeExtraneousValues: true,
    });
  }

  async getProjects(
    ctx: RequestContext,
    limit: number,
    offset: number,
  ): Promise<{ projects: ProjectOutput[]; count: number }> {
    this.logger.log(ctx, `${this.getProjects.name} was called`);

    const actor: Actor = ctx.user;

    const isAllowed = this.aclService.forActor(actor).canDoAction(Action.List);
    if (!isAllowed) {
      throw new UnauthorizedException();
    }

    this.logger.log(ctx, `calling ${ProjectRepository.name}.findAndCount`);
    const [projects, count] = await this.repository.findAndCount({
      where: {},
      take: limit,
      skip: offset,
    });

    const projectsOutput = plainToClass(ProjectOutput, projects, {
      excludeExtraneousValues: true,
    });

    return { projects: projectsOutput, count };
  }

  async getProjectById(
    ctx: RequestContext,
    id: number,
  ): Promise<ProjectOutput> {
    this.logger.log(ctx, `${this.getProjectById.name} was called`);

    const actor: Actor = ctx.user;

    this.logger.log(ctx, `calling ${ProjectRepository.name}.getById`);
    const project = await this.repository.getById(id);

    const isAllowed = this.aclService
      .forActor(actor)
      .canDoAction(Action.Read, project);
    if (!isAllowed) {
      throw new UnauthorizedException();
    }

    return plainToClass(ProjectOutput, project, {
      excludeExtraneousValues: true,
    });
  }

  async updateProject(
    ctx: RequestContext,
    projectId: number,
    input: UpdateProjectInput,
  ): Promise<ProjectOutput> {
    this.logger.log(ctx, `${this.updateProject.name} was called`);

    this.logger.log(ctx, `calling ${ProjectRepository.name}.getById`);
    const project = await this.repository.getById(projectId);

    const actor: Actor = ctx.user;

    const isAllowed = this.aclService
      .forActor(actor)
      .canDoAction(Action.Update, project);
    if (!isAllowed) {
      throw new UnauthorizedException();
    }

    const updatedProject: Project = {
      ...project,
      ...plainToClass(Project, input),
    };

    this.logger.log(ctx, `calling ${ProjectRepository.name}.save`);
    const savedProject = await this.repository.save(updatedProject);

    return plainToClass(ProjectOutput, savedProject, {
      excludeExtraneousValues: true,
    });
  }

  async deleteProject(ctx: RequestContext, id: number): Promise<void> {
    this.logger.log(ctx, `${this.deleteProject.name} was called`);

    this.logger.log(ctx, `calling ${ProjectRepository.name}.getById`);
    const project = await this.repository.getById(id);

    const actor: Actor = ctx.user;

    const isAllowed = this.aclService
      .forActor(actor)
      .canDoAction(Action.Delete, project);
    if (!isAllowed) {
      throw new UnauthorizedException();
    }

    this.logger.log(ctx, `calling ${ProjectRepository.name}.remove`);
    await this.repository.remove(project);
  }
}
