import FetchMock from 'yet-another-fetch-mock';

import { setupWsControlAndMock } from './modia-context-mock';

const mock = FetchMock.configure();

setupWsControlAndMock(mock);
