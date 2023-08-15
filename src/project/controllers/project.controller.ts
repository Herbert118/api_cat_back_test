import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import {
  BaseApiErrorResponse,
  BaseApiResponse,
  SwaggerBaseApiResponse,
} from '../../shared/dtos/base-api-response.dto';
import { PaginationParamsDto } from '../../shared/dtos/pagination-params.dto';
import { AppLogger } from '../../shared/logger/logger.service';
import { ReqContext } from '../../shared/request-context/req-context.decorator';
import { RequestContext } from '../../shared/request-context/request-context.dto';
import {
  CreateProjectInput,
  UpdateProjectInput,
} from '../dtos/project-input.dto';
import { ProjectOutput } from '../dtos/project-output.dto';
import { ProjectService } from '../services/project.service';

@ApiTags('project')
@Controller('project')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(ProjectController.name);
  }

  @Post()
  @ApiOperation({
    summary: 'Create project API',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SwaggerBaseApiResponse(ProjectOutput),
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async createProject(
    @ReqContext() ctx: RequestContext,
    @Body() input: CreateProjectInput,
  ): Promise<BaseApiResponse<ProjectOutput>> {
    const project = await this.projectService.createProject(ctx, input);
    return { data: project, meta: {} };
  }

  @Get()
  @ApiOperation({
    summary: 'Get projects as a list API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([ProjectOutput]),
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getProjects(
    @ReqContext() ctx: RequestContext,
    @Query() query: PaginationParamsDto,
  ): Promise<BaseApiResponse<ProjectOutput[]>> {
    this.logger.log(ctx, `${this.getProjects.name} was called`);

    const { projects, count } = await this.projectService.getProjects(
      ctx,
      query.limit,
      query.offset,
    );

    return { data: projects, meta: { count } };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get project by id API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(ProjectOutput),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(JwtAuthGuard)
  async getProject(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: number,
  ): Promise<BaseApiResponse<ProjectOutput>> {
    this.logger.log(ctx, `${this.getProject.name} was called`);

    const project = await this.projectService.getProjectById(ctx, id);
    return { data: project, meta: {} };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update project API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(ProjectOutput),
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async updateProject(
    @ReqContext() ctx: RequestContext,
    @Param('id') projectId: number,
    @Body() input: UpdateProjectInput,
  ): Promise<BaseApiResponse<ProjectOutput>> {
    const project = await this.projectService.updateProject(
      ctx,
      projectId,
      input,
    );
    return { data: project, meta: {} };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete project by id API',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(JwtAuthGuard)
  async deleteProject(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: number,
  ): Promise<void> {
    this.logger.log(ctx, `${this.deleteProject.name} was called`);

    return this.projectService.deleteProject(ctx, id);
  }
}
