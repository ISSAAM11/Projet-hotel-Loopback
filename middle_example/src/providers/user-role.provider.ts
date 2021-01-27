import {Provider} from '@loopback/context';
import { Role } from '../authorization/role';
import { RequiredRole, UserRoleFn } from '../authorization/types';


export class UserRoleProvider implements Provider<UserRoleFn> {
  constructor() {}

  value(): UserRoleFn {
    return (userRole, requiredRole) => this.action(userRole, requiredRole);
  }

  action(userRole: Role, requiredRole: RequiredRole): boolean {
    /*
      Roles are ordered hierarchically,
      0 has all the permissions (Admin)
      1 has a subset of 0 (chef)
      2 has a subset of 1 (client)
      Required Role represents the maximum level allowed
    */
    return userRole <= requiredRole.required;
  }
}
