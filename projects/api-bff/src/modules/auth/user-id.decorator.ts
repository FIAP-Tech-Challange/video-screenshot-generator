import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface JwtPayload {
  sub: string;
  email: string;
}

interface RequestWithUser extends Request {
  user: JwtPayload;
}

export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user?.sub;
  },
);
