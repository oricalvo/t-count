import { AngularProfilerPage } from './app.po';

describe('angular-profiler App', () => {
  let page: AngularProfilerPage;

  beforeEach(() => {
    page = new AngularProfilerPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
