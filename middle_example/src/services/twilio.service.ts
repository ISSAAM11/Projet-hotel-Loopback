import {GenericService, getService} from '@loopback/service-proxy';
import {inject, Provider} from '@loopback/core';
import {TwilioDataSource} from '../datasources';
import {TwilioMessage} from '../models';

export interface Twilio extends GenericService {
  send(data: TwilioMessage): Promise<unknown>;
}

export class TwilioProvider implements Provider<Twilio> {
  constructor(
    @inject('datasources.twilio')
    protected dataSource: TwilioDataSource = new TwilioDataSource(),
  ) {}

  value(): Promise<Twilio> {
    return getService(this.dataSource);
  }
}
