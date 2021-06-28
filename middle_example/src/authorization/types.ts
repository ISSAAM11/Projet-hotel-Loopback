import {Role} from './role';
import {UserProfile} from '@loopback/security';

export interface UserRoleFn {
  (userRole: Role, requiredRole: RequiredRole): boolean;
}

export interface RequiredRole {
  required: Role;
}

export interface MyUserProfile extends UserProfile {
  id: string;
  role: Role;
}

export const UserProfileSchema = {
  type: 'object',
  required: ['email', 'password', 'name', 'role'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    password: {
      type: 'string',
      minLength: 8,
    },
    name: {type: 'string'},
    role: {type: 'string'},
  },
};

// export const UserRequestBody = {
//   description: 'The input of create user function',
//   required: true,
//   content: {
//     'application/json': {schema: UserProfileSchema},
//   },
// };

export interface Credential {
  email: string;
  password: string;
  refreshToken: boolean;
}

export const CredentialsSchema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    password: {
      type: 'string',
      minLength: 8,
    },
  },
};

export const CredentialsRequestBody = {
  description: 'The input of login function',
  required: true,
  content: {
    'application/json': {schema: CredentialsSchema},
  },
};

export interface NewCredential {
  email: string;
  password: string;
  newPassword: string;
  refreshToken: boolean;
}

export const NewCredentialsSchema = {
  type: 'object',
  required: ['email', 'password', 'newPassword'],

  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    password: {
      type: 'string',
      minLength: 8,
    },
    newPassword: {
      type: 'string',
      minLength: 8,
    },
  },
};

export const NewCredentialsRequestBody = {
  description: 'The input of login function',
  required: true,
  content: {
    'application/json': {schema: NewCredentialsSchema},
  },
};
