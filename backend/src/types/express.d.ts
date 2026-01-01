import { User, Role } from '@prisma/client';

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                id: string;
                role: string;
                permissions: string[];
                teamId?: string;
            };
        }
    }
}

export { };
