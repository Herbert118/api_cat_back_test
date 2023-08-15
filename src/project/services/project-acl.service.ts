import { Injectable } from '@nestjs/common';

import { ROLE } from '../../auth/constants/role.constant';
import { BaseAclService } from '../../shared/acl/acl.service';
import { Action } from '../../shared/acl/action.constant';
import { Actor } from '../../shared/acl/actor.constant';
import { Project } from '../entities/project.entity';

@Injectable()
export class ProjectAclService extends BaseAclService<Project> {
  constructor() {
    super();
    this.canDo(ROLE.ADMIN, [Action.Manage]);
    this.canDo(ROLE.USER, [Action.Create, Action.List, Action.Read]);
    this.canDo(ROLE.USER, [Action.Update, Action.Delete], this.isArticleAuthor);
  }

  isArticleAuthor(project: Project, user: Actor): boolean {
    return project.owner.id === user.id;
  }
}
