import {Model, model, property} from '@loopback/repository';

@model()
export class TwilioMessage extends Model {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  type: string;

  @property({
    type: 'string',
    required: true,
  })
  to: string;

  @property({
    type: 'string',
    required: true,
  })
  from: string;

  @property({
    type: 'string',
    required: true,
  })
  body: string;

  @property({
    type: 'string',
    required: true,
  })
  url: string;

  @property({
    type: 'string',
  })
  subject?: string;

  @property({
    type: 'string',
  })
  text?: string;

  @property({
    type: 'string',
  })
  html?: string;

  constructor(data?: Partial<TwilioMessage>) {
    super(data);
  }
}

export interface TwilioMessageRelations {
  // describe navigational properties here
}

export type TwilioMessageWithRelations = TwilioMessage & TwilioMessageRelations;
