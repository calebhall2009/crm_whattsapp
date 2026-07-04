import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable, tap } from "rxjs";
import { AuditService } from "./audit.service";

/**
 * Automatically logs mutating actions (POST, PUT, PATCH, DELETE)
 * to the audit_log table. Non-mutating GET requests are skipped.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    // Only audit mutating operations
    if (method === "GET" || method === "OPTIONS" || method === "HEAD") {
      return next.handle();
    }

    const auth = request.auth;
    if (!auth) return next.handle();

    const startTime = Date.now();

    return next.handle().pipe(
      tap(async (responseBody) => {
        try {
          const handler = context.getHandler().name;
          const controller = context.getClass().name;
          const entityId =
            responseBody?.data?.id ||
            request.params?.id ||
            "unknown";

          await this.auditService.log({
            companyId: auth.companyId,
            userId: auth.userId,
            action: `${controller}.${handler}`,
            entityType: controller.replace("Controller", "").toLowerCase(),
            entityId: String(entityId),
            details: {
              method,
              path: request.url,
              durationMs: Date.now() - startTime,
            },
            ipAddress:
              request.headers["x-forwarded-for"] ||
              request.connection?.remoteAddress,
          });
        } catch {
          // Never let audit logging failure break the actual request
        }
      })
    );
  }
}
