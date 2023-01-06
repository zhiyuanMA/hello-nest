import { Role } from '@prisma/client/index';
import { SetMetadata } from '@nestjs/common';

export const HasRoles = (...roles: Role[]) => SetMetadata('roles', roles);
