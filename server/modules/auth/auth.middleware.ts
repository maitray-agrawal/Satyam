import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../../types';
import { AuthService, AuthUser } from './auth.service';
import { createServiceLogger } from '../../observability/logger';

const log = createServiceLogger('AuthMiddleware');

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      requestId?: string;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const roleHeader = (req.headers['x-user-role'] as string) || (req.query.userRole as string);
  const userIdHeader = (req.headers['x-user-id'] as string) || (req.query.userId as string);

  req.user = AuthService.getCurrentUser(userIdHeader || roleHeader);
  req.requestId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  next();
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      log.warn(`Access Denied: User role ${userRole} attempted to access restricted endpoint ${req.path}`, {
        actorId: req.user?.id,
        actorRole: userRole,
      });

      res.status(403).json({
        success: false,
        error: 'ACCESS_DENIED_RBAC',
        message: `Current role [${userRole || 'ANONYMOUS'}] is unauthorized for this operation. Required roles: ${allowedRoles.join(', ')}`,
      });
      return;
    }
    next();
  };
}
