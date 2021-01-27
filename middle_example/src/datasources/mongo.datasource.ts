import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';
require('dotenv').config();

/*const config = {
  name: 'mongo',
  connector: 'mongodb',
  url: '',
  host: 'middle_mongo',
  port: 27017,
  user: 'middle_mongo_test_user',
  password: 'mongotest',
  database: 'test_db',
};*/
const config = {
  name: 'mongo',
  connector: 'mongodb',
  url: `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@127.0.0.1:27017/test_db`,
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
/*const config = {
  name: 'mongo',
  connector: 'memory',
  localStorage: '',
  file: ''
};*/

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class MongoDataSource
  extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'mongo';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.mongo', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
