import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

export interface UserMetaData {
  userId: string;
  email: string;
  permissions: string;
}

export const User = createParamDecorator((_data: any, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest<Request>();
  // if route is protected, there is a user set in auth.middleware
  if (req.user) {
    return req.user;
  }
  return null;
});


