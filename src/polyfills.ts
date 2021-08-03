import { shouldPolyfill as shouldPolyfillDateTime } from '@formatjs/intl-datetimeformat/should-polyfill';
import { shouldPolyfill as shouldPolyfillNumber } from '@formatjs/intl-numberformat/should-polyfill';

import { Languages } from '~components/TextProvider';

export default async function polyfill() {
    /*
      En bug i Chrome gjør at norsk locale ikke blir lastet inn riktig.
      Se
      - https://github.com/formatjs/formatjs/issues/3066
      - https://bugs.chromium.org/p/chromium/issues/detail?id=1215606&q=norwegian&can=2

      Disse sjekkene skal uansett være trygge å la ligge igjen etter at bugen har blitt fikset.
    */
    if (shouldPolyfillDateTime(Languages.nb)) {
        await import('@formatjs/intl-datetimeformat/polyfill-force');
        await import('@formatjs/intl-datetimeformat/locale-data/nb');
    }

    if (shouldPolyfillNumber(Languages.nb)) {
        await import('@formatjs/intl-numberformat/polyfill-force');
        await import('@formatjs/intl-numberformat/locale-data/nb');
    }
}
