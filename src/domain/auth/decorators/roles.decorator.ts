import { SetMetadata } from "@nestjs/common";
import { UserRoles } from "@modules/types";

export const RoleAllowed = (...role: UserRoles[]) => SetMetadata("roles", role);

