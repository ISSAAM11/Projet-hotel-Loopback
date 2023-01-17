import {Entity, model, property} from '@loopback/repository';
import {Produit} from './produit.model'
import {Hotel} from './Hotel.model'
const {v4: uuidv4} = require('uuid');

@model()
export class PurchaseOrder extends Entity {
  [x: string]: any;
  @property({
    type: 'string',
    id: true,
    default: () => uuidv4(),
  })
  id: string;

  @property({
    type: 'string',
  })
 date?: string;
  
  @property({
    type: 'any',
  })
  hotel?: Hotel; 

  @property({
    type: 'array',
    itemType: 'object',
    default: []
  })  
  ProductList: Produit[];
  

  @property({
    type: 'number',
    default : 0
  })
  totalHT: number;
  @property({
    type: 'number',
    default : 0
  })
  totalTVA: number;
  @property({
    type: 'number',
    default : 0
  })
  totalTTC: number;
  
  /////// pour affecter une seul fois
  @property({
    type: 'boolean',
    default: false
  })
 affected?: boolean;

  constructor(data?: Partial<PurchaseOrder>) {
    super(data);
  }
}

export interface PurchaseOrderRelations {
  // describe navigational properties here
}

export type PurchaseOrderWithRelations = PurchaseOrder & PurchaseOrderRelations;
