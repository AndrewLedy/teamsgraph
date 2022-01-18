import { TeamsgraphPage } from './app.po';

describe('teamsgraph App', function() {
  let page: TeamsgraphPage;

  beforeEach(() => {
    page = new TeamsgraphPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
