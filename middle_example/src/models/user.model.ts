import {Entity, model, property} from '@loopback/repository';

const {v4: uuidv4} = require('uuid');

@model({settings: {hidden: ['password', 'tokenRefreshedAt']}})

export class User extends Entity {
  @property({
    type: 'string',
    id: true,
    default: () => uuidv4(),
  })
  id?: string;

  @property({
    type: 'string',
  })
  lockSupplier?: string;

  @property({
    type: 'string',
    required: true,
  })
  username?: string;

  @property({
    type: 'string',
  })
  password?: string;

  @property({
    type: 'string',
  })
  imageURL?: string;

  @property({
    type: 'string',
  })
  contact?: string;

  @property({
    type: 'string',
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
    default : 2
  })
  role?: number;

  @property({
    type: 'string',
    default : ""
  })
  telephone?: string;

  @property({
    type: 'string',
  })
  date?: string;

  @property({
    type: 'number',
    default: 0
  })
  hotelNumber?: number;

  @property({
    type: 'string',
  })
  subDistributor?: string;

  @property({
    type: 'boolean',
    default: true
  })
  enable?: boolean;

  @property({
    type: 'string',
    default: ""
  })
  idHotel?: string;

  @property({
    type: "string",
  })
  resetKey?: string

  @property({
    type: 'array',
    itemType: 'string',
    default: []
  })  
  myDistributorlist: string[];

  @property({
    type: 'array',
    itemType: 'string',
    default: []
  })  
  myHotelslist: string[];
  
  @property({
    type: 'array',
    itemType: 'string',
    default: []
  })  
  myProductlist: string[];
  
  @property({
    type: 'array',
    itemType: 'string',
    default: []
  })  
  myPurchaseOrderlist: string[];

  constructor(data?: Partial<User>) {
    super(data);
  }
  
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
