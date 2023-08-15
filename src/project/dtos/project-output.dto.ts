import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

import { OwnerOutput } from './owner-output.dto';

export class ProjectOutput {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  desc: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;

  @Expose()
  @Type(() => OwnerOutput)
  @ApiProperty()
  owner: OwnerOutput;
}
