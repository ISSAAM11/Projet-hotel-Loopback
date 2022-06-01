import {Entity, model, property} from '@loopback/repository';

@model()
export class Hotel extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'date',
  })
  date?: string;

  @property({
    type: 'string',
    required: true,
  })
  lock_supplier: string;

  @property({
    type: 'boolean',
    default: 0,
  })
  general_card?: boolean;

  @property({
    type: 'number',
    default: 0,
  })
  device_ammount?: number;

  @property({
    type: 'boolean',
    default: 0,
  })
  Wapp_Access?: boolean;

  @property({
    type: 'boolean',
    default: 0,
  })
  Check_In_Guest?: boolean;

  @property({
    type: 'boolean',
    default: 0,
  })
  Hotel_Management1?: boolean;

  @property({
    type: 'boolean',
    default: 0,
  })
  App_Access?: boolean;

  @property({
    type: 'boolean',
    default: 0,
  })
  Add_Device?: boolean;

  @property({
    type: 'boolean',
    default: 0,
  })
  Access?: boolean;

  @property({
    type: 'boolean',
    default: 0,
  })
  Configure_Device?: boolean;

  @property({
    type: 'boolean',
    default: 0,
  })
  Hotel_Management2?: boolean;

  @property({
    type: 'boolean',
    default: 0,
  })
  Delete_Device?: boolean;

  @property({
    type: 'boolean',
    default: 0,
  })
  Statistics?: boolean;

  @property({
    type: 'string',
  })
  adress?: string;

  @property({
    type: 'string',
  })
  admin_name?: string;

  @property({
    type: 'string',
    required: true,
  })
  account: string;

  @property({
    type: 'string',
  })
  Created_By?: string;

  @property({
    type: 'string',
    required: true,
  })
  Role: string;


  constructor(data?: Partial<Hotel>) {
    super(data);
  }
}

export interface HotelRelations {
  // describe navigational properties here
}

export type HotelWithRelations = Hotel & HotelRelations;
