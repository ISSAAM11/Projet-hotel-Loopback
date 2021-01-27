import {Entity, model, property} from '@loopback/repository';

@model({settings: {hidden: ['password', 'tokenRefreshedAt']}})
export class User extends Entity {
  @property({
    type: 'string',
    id: true,

    generated: true,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  username?: string;

  @property({
    type: 'string',
    required: true,
  })
  password?: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      format: 'email',
    },
    index: {
      unique: true,
    },
  })
  email?: string;
  @property({
    type: 'number',
  })
  tokenRefreshedAt: number;
  @property({
    type: 'number',
    required: true,
  })
  role?: number;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
