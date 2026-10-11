import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import type { Request } from "express";
import { settings } from "../config";
@Injectable()
export class OriginGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    if (!["GET", "HEAD", "OPTIONS"].includes(request.method) && request.headers.origin !== settings().webOrigin) {
      throw new ForbiddenException("Origem da solicitação inválida.");
    }
    return true;
  }
}
