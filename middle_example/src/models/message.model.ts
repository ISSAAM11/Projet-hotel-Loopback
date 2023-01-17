import {Entity, model, property} from '@loopback/repository';
const {v4: uuidv4} = require('uuid');

@model()
export class Message extends Entity {

  @property({
    type: 'string',
    id: true,
    default: () => uuidv4(),

  })
  id?: string;

  @property({
    type: 'string',
  })
  source?: string;
  
  @property({
    type: 'string',
  })
  userEmail?: string;

  @property({
    type: 'string',
  })
  idSource?: string;

  @property({
    type: 'string',
  })
  date?: string;

  @property({
    type: 'string',
  })
  type?: string;

  @property({
    type: 'string',
  })
  title?: string

  @property({
    type: 'string',
  })
  content?: string;

  @property({
    type: 'boolean',
    default: false
  })
  etat?: boolean;

  @property({
    type: 'boolean',
    default: false
  })
  unreadbyuser?: boolean;
/*
  @property({
    type: 'string',
    default: "En attendant"
  })
  status?: string;
*/
  @property({
    type: 'array',
    itemType: 'string',
    default: []
  })  
  response?: string[];

  @property({
    type: 'array',
    itemType: 'string',
    default: []
  })  
  responseUser?: string[];

  @property({
    type: 'array',
    itemType: 'string',
    default: []
  })  
  responseDate?: string[];


  constructor(data?: Partial<Message>) {
    super(data);
  }
}

export interface MessageRelations {
  // describe navigational properties here
}

export type MessageWithRelations = Message & MessageRelations;
