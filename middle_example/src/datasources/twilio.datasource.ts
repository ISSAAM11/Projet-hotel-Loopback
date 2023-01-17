import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

// import the TwilioConnector class/object and use it as the connector in the config
import { TwilioConnector } from 'loopback-connector-twilio-ts';

const config = {
  name: 'twilio',
  connector: TwilioConnector, // class goes here
  accountSid: process.env.TWILIO_SID ?? '',
  authToken: process.env.TWILIO_AUTH_TOKEN ?? '',
};

@lifeCycleObserver('datasource')
export class TwilioDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'twilio';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.twilio', {optional: true})
    dsConfig: object = config,
  ) {
    super('twilio', dsConfig);
  }
}