import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(() => {
    controller = new HealthController();
  });

  it('returns a healthy status message', () => {
    expect(controller.check()).toEqual({ message: 'App is up' });
  });
});
