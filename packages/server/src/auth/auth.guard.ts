import { InjectRedis } from '@adachi-sakura/nestjs-redis';
import { AuthGuard as NestAuthGuard } from '@nestjs/passport';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class AuthGuard extends NestAuthGuard('jwt') implements CanActivate {
  @InjectRedis()
  private readonly redisService: Redis;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const token = context
      .switchToHttp()
      .getRequest()
      .headers?.authorization?.match(/^Bearer\s([\w.]+)/)[1];
    if (await this.redisService.zscore('expired-token', token))
      throw new UnauthorizedException('token has expired');
    return super.canActivate(context) as boolean;
  }
}
