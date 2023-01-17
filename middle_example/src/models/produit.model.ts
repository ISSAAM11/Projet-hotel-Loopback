import {Entity, model, property} from '@loopback/repository';
const {v4: uuidv4} = require('uuid');

@model()
export class Produit extends Entity {
  @property({
    type: 'string',
    id: true,
    default: () => uuidv4(),
  })
  id?: string;

  @property({
    type: 'string',
  })
  category?: string;

  @property({
    type: 'string',
  })
  name?: string;

  @property({
    type: 'string',
  })
  type?: string;

  @property({
    type: 'boolean',
    default: false
  })
  etat?: boolean;

  @property({
    type: 'number',
    default: 0
  })
  prix?: number;

  @property({
    type: 'number',
    default: 0,
  })
  amount?: number;


  constructor(data?: Partial<Produit>) {
    super(data);
  }
}

export interface ProduitRelations {
  // describe navigational properties here
}

export type ProduitWithRelations = Produit & ProduitRelations;
