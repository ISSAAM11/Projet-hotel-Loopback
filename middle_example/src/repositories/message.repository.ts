import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbHotelDataSource} from '../datasources';
import {Message, MessageRelations} from '../models';

export class MessageRepository extends DefaultCrudRepository<
  Message,
  typeof Message.prototype.id,
  MessageRelations
> {
  constructor(
    @inject('datasources.hotel_database') dataSource: DbHotelDataSource,
  ) {
    super(Message, dataSource);
  }
}
