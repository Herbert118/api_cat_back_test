import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { Project } from '../entities/project.entity';

@Injectable()
export class ProjectRepository extends Repository<Project> {
  constructor(private dataSource: DataSource) {
    super(Project, dataSource.createEntityManager());
  }

  async getById(id: number): Promise<Project> {
    const project = await this.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException();
    }

    return project;
  }
}
