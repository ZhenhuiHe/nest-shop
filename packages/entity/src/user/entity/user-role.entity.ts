import { BaseEntity, Timestamp } from '@adachi-sakura/nest-shop-common';
import { Field, ObjectType } from '@nestjs/graphql';
import { Role } from '@/role';
import { UserEntity } from '@/user/entity/user.entity';
import { Entity, ManyToOne } from 'typeorm';

@Entity('user_role')
@ObjectType()
export default class UserRole extends BaseEntity {
  @Field(() => [UserEntity])
  @ManyToOne(() => UserEntity, (user) => user.roles)
  user: UserEntity;

  @Field(() => [Role])
  @ManyToOne(() => Role)
  role: Role;

  @Field()
  @Timestamp({
    name: 'expires_at',
    comment: '过期时间',
    nullable: true,
  })
  expiresAt?: Date;
}
