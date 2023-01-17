import {Client} from '@loopback/testlab';
import {Middle} from '../..';
import {setupApplication} from './test-helper';

describe('HomePage', () => {
  let app: Middle;
  let client: Client;
/*
  before('setupApplication', async () => {
    ({app, client} = await setupApplication());
  });

  after(async () => {
    await app.stop();
  });

  it('exposes a default home page', async () => {
    await client
      .get('/')
      .expect(200)
      .expect('Content-Type', /text\/html/);
  });

  it('exposes self-hosted explorer', async () => {
    await client
      .get('/explorer/')
      .expect(200)
      .expect('Content-Type', /text\/html/)
      .expect(/<title>LoopBack API Explorer/);
  });
*/
/*
  describe('PingController() unit', () => {
    it('pings with no input', () => {
      const controller = new PingController();
      const result = controller.ping();
      expect(result).to.equal('You pinged with undefined');
    });

/*    it("pings with msg 'hello'", () => {
      const controller = new PingController();
      const result = controller.ping('hello');
      expect(result).to.equal('You pinged with hello');
    });*/
});
