import {Model, model, property} from '@loopback/repository';

@model()
export class KeyAndPassword extends Model {
  @property({
    type: 'string',
  })
  resetKey: string;

  @property({
    type: 'string',
  })
  password: string;

  @property({
    type: 'string',
  })
  confirmPassword: string;

  @property({
    type: 'string',
  })
  oldPassword: string;

  constructor(data?: Partial<KeyAndPassword>) {
    super(data);
  }
}

export interface KeyAndPasswordRelations {
  // describe navigational properties here
}

export type KeyAndPasswordWithRelations = KeyAndPassword & KeyAndPasswordRelations;
