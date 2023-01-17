import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbHotelDataSource} from '../datasources';
import {PurchaseOrder, PurchaseOrderRelations} from '../models';

export class PurchaseOrderRepository extends DefaultCrudRepository<
  PurchaseOrder,
  typeof PurchaseOrder.prototype.id,
  PurchaseOrderRelations
> {
  constructor(
    @inject('datasources.hotel_database') dataSource: DbHotelDataSource,
  ) {
    super(PurchaseOrder, dataSource);
  }
}
