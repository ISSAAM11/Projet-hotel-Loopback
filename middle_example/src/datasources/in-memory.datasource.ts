import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'in_memory',
  connector: 'memory',
  localStorage: 'test',
  file: 'test'
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class InMemoryDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'in_memory';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.in_memory', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
