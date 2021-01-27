import {BindingKey} from '@loopback/context';
import {UserRoleFn} from './types';
import {TokenService} from '@loopback/authentication';
import {PasswordHasher} from './services/hash.password.bcryptjs';

/**
 * Binding keys used by this component.
 */
export namespace MyAuthBindings {
  export const USER_ROLE = BindingKey.create<UserRoleFn>(
    'userAuthorization.actions.userRole',
  );

  export const TOKEN_SERVICE = BindingKey.create<TokenService>(
    'services.authentication.jwt.tokenservice',
  );
}

export namespace TokenServiceConstants {
  export const TOKEN_SECRET_VALUE = process.env.JWT_SECRET || 'myjwts3cr3t';
  export const TOKEN_EXPIRES_IN_VALUE =
    process.env.TOKEN_EXPIRES_IN_VALUE || '2628000000';
}

export namespace PasswordHasherBindings {
  export const PASSWORD_HASHER = BindingKey.create<PasswordHasher>(
    'services.hasher',
  );
  export const ROUNDS = BindingKey.create<number>('services.hasher.round');
}
