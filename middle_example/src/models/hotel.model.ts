import {Entity, model, property} from '@loopback/repository';
const {v4: uuidv4} = require('uuid');

@model()
export class Hotel extends Entity {
  @property({
    type: 'string',
    id: true,
    default: () => uuidv4(),
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'number',
  })
  contact?: string;

  @property({
    type: 'string',
  })
  date?: string;

  @property({
    type: 'any',
    required: true,
  })
  lockSupplier: any;

  @property({
    type: 'boolean',
    default: 0,
  })
  general_card?: boolean;

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
  admin_name?: string;

  @property({
    type: 'string',
    jsonSchema: {
      format: 'email',
    },
  })
  account: string;

  @property({
    type: 'string',
  })
  Created_By?: string;

  @property({
    type: 'string',
  })
  country?: string;

  @property({
    type: 'string',
  })
  Region?: string;

  @property({
    type: 'string',
  })
  adress?: string;

  @property({
    type: 'string',
  })
  Role: string;

  @property({
    type: 'string',
    
  })
  phone: string;

  @property({
    type: 'boolean',
  })
  enable: boolean;

  @property({
    type: 'boolean',
    default:0
  })
  history: boolean;
  
  @property({
    type: 'number',
    default: 0,
  })
  lockAmmount?: number;

  @property({
    type: 'number',
    default: 0,
  })
  gatewayAmmount?: number;

  @property({
    type: 'number',
    default: 0,
  })
  liftAmmount?: number;

  @property({
    type: 'number',
    default: 0,
  })
  energyAmmount?: number;

  @property({
    type: 'string',
    default: 0,
  })
  reason?: string;   
  
  @property({
    type: 'string',
    default: 0,
  })
  deleteDate?: string; 

  @property({
    type: 'string',
    default: 0,
  })
  idCreateur?: string; 
  
  @property({
    type: 'array',
    itemType: 'string',
    default: []
  })  
  purchaseOrder: string[];
  

  
  constructor(data?: Partial<Hotel>) {
    super(data);
  }
}

export interface HotelRelations {
  // describe navigational properties here
}

export type HotelWithRelations = Hotel & HotelRelations;
