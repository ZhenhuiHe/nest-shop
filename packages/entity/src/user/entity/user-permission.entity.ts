import { BaseEntity, Timestamp } from '@adachi-sakura/nest-shop-common';
import { Field, ObjectType } from '@nestjs/graphql';
import { Permission } from '@/permission';
import { UserEntity } from '@/user/entity/user.entity';
import { Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';

@Entity('user_permission')
@ObjectType()
export default class UserPermission extends BaseEntity {
  @Field(() => [UserEntity])
  @ManyToOne(() => UserEntity, (user) => user.permissions)
  user: UserEntity;

  @Field(() => [Permission])
  @ManyToMany(() => Permission)
  @JoinTable({
    name: 'user_permission_permissions',
  })
  permissions: Permission[];

  @Field()
  @Timestamp({
    name: 'expires_at',
    comment: '过期时间',
    nullable: true,
  })
  expiresAt?: Date;
}
