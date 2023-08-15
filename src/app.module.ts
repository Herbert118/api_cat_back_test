import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArticleModule } from './article/article.module';
import { AuthModule } from './auth/auth.module';
import { ProjectModule } from './project/project.module';
import { SharedModule } from './shared/shared.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [SharedModule, UserModule, AuthModule, ProjectModule], //ArticleModule,
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
