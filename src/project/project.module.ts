import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtAuthStrategy } from '../auth/strategies/jwt-auth.strategy';
import { SharedModule } from '../shared/shared.module';
import { UserModule } from '../user/user.module';
import { ProjectController } from './controllers/project.controller';
import { Project } from './entities/project.entity';
import { ProjectRepository } from './repositories/project.repository';
import { ProjectService } from './services/project.service';
import { ProjectAclService } from './services/project-acl.service';

@Module({
  imports: [SharedModule, TypeOrmModule.forFeature([Project]), UserModule],
  providers: [
    ProjectService,
    JwtAuthStrategy,
    ProjectAclService,
    ProjectRepository,
  ],
  controllers: [ProjectController],
  exports: [ProjectService],
})
export class ProjectModule {}
