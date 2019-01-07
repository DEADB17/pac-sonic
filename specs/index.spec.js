const expect = require('unexpected');

import value from './sample.js';

describe('A canary test', function () {
  it('always passes', function () {
    expect(value, 'to be', value);
  });
});
