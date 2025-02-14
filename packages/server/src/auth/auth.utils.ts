import { AuthGuard } from '@/auth/guard/auth.guard';
import { PermissionGuard } from '@/auth/guard/permission.guard';
import { CommonException } from '@adachi-sakura/nest-shop-common';
import {
  Permission as PermissionEntity,
  UserEntity,
} from '@adachi-sakura/nest-shop-entity';
import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Field, GqlExecutionContext, InterfaceType } from '@nestjs/graphql';
import { ApiBearerAuth, ApiOperation, ApiProperty } from '@nestjs/swagger';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { Request } from 'express';

export function encryptPassword(password: string) {
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  return argon2.hash(
    hash.substring(0, hash.length / 2) +
      password +
      hash.substring(hash.length / 2, hash.length),
  );
}

export function verifyPassword(hashPwd: string, password: string) {
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  return argon2.verify(
    hashPwd,
    hash.substring(0, hash.length / 2) +
      password +
      hash.substring(hash.length / 2, hash.length),
  );
}

@InterfaceType()
export class UserTempPermission implements Pick<PermissionEntity, 'resource'> {
  @Field()
  @ApiProperty({
    description: '权限标识',
    readOnly: true,
  })
  resource: string;
  @Field()
  @ApiProperty({
    description: '过期时间',
    readOnly: true,
    type: 'integer',
    maximum: 9999999999999,
    example: Date.now(),
  })
  expiresAt?: Date;
}

export const getPermissions = (
  user: Pick<UserEntity, 'permissions' | 'roles'>,
): UserTempPermission[] => {
  const permissions: UserTempPermission[] = [];
  user.permissions?.forEach((userPerm) => {
    const { expiresAt } = userPerm;
    userPerm.permissions.forEach((resource) =>
      permissions.push({ resource, expiresAt }),
    );
  });
  user.roles?.forEach((role) => {
    const { expiresAt } = role;
    role.role.permissions.forEach((resource) =>
      permissions.push({ resource, expiresAt }),
    );
  });
  return permissions;
};

export const Auth = (resource?: string, name?: string) => {
  if (resource) {
    return applyDecorators(
      ApiBearerAuth(),
      ApiOperation({ summary: name, operationId: resource }),
      UseGuards(AuthGuard, PermissionGuard),
      Permission(resource, name),
    );
  } else return applyDecorators(ApiBearerAuth(), UseGuards(AuthGuard));
};

export const GqlAuth = (resource?: string, name?: string) => {
  if (resource) {
    return applyDecorators(
      UseGuards(AuthGuard, PermissionGuard),
      Permission('gql.' + resource, name, 'GraphQL'),
    );
  } else return applyDecorators(UseGuards(AuthGuard));
};

export const permissions: {
  name: string;
  resource: string;
  type: 'HTTP' | 'GraphQL';
  target: object;
  descriptor: TypedPropertyDescriptor<any>;
}[] = [];

export const Permission = (
  resource: string,
  name?: string,
  type: 'HTTP' | 'GraphQL' = 'HTTP',
) => {
  return applyDecorators(
    SetMetadata('resource', resource),
    (target, propertyKey, descriptor) => {
      permissions.push({ resource, name, type, target, descriptor });
    },
  );
};

export const GetPermission = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    return Reflect.getMetadata('resource', ctx.getHandler());
  },
);

export { GetPermission as Perm };

export const User = () =>
  createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  })();

export const Token = () =>
  createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request: Request = (() => {
      const gqlContext = GqlExecutionContext.create(ctx);
      if (gqlContext.getType() === 'graphql') {
        return gqlContext.getContext().req;
      }
      return ctx.switchToHttp().getRequest();
    })();
    return request.header('authorization')?.replace(/^Bearer\s+/i, '');
  })();
