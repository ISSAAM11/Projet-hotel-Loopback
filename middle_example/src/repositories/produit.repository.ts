import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbHotelDataSource} from '../datasources';
import {Produit, ProduitRelations} from '../models';

export class ProduitRepository extends DefaultCrudRepository<
  Produit,
  typeof Produit.prototype.id,
  ProduitRelations
> {
  constructor(
    @inject('datasources.hotel_database') dataSource: DbHotelDataSource,
  ) {
    super(Produit, dataSource);
  }
}
