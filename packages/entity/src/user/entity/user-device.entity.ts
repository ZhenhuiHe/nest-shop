import { BaseEntity, Timestamp } from '@adachi-sakura/nest-shop-common';
import { Field, ObjectType } from '@nestjs/graphql';
import { UserEntity } from '@/user';
import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

export enum DeviceType {}

@Entity('user_device')
@ObjectType('UserDevice')
export default class UserDeviceEntity extends BaseEntity {
  @ApiProperty()
  @Field({
    description: '设备名称',
  })
  @Column({
    comment: '设备名称',
  })
  name: string;

  @ApiProperty()
  @Field({
    description: '设备类型',
  })
  @Column({
    comment: '设备类型',
  })
  type: string;

  @ApiProperty()
  @Field({
    description: '设备UA',
  })
  @Column({
    name: 'user_agent',
    comment: '设备UA',
  })
  userAgent: string;

  @ApiProperty()
  @Field({
    description: '上次登陆时间',
  })
  @Timestamp({
    name: 'last_login_at',
    comment: '上次登陆时间',
  })
  lastLoginAt: Date;

  @ApiProperty()
  @Field({
    description: '上次登陆IP',
  })
  @Timestamp({
    name: 'last_login_ip',
    comment: '上次登陆IP',
  })
  lastLoginIp: string;

  @ApiProperty({ type: () => UserEntity })
  @Field(() => UserEntity, {
    description: '所属用户',
  })
  @ManyToOne(() => UserEntity, (user) => user.devices)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
