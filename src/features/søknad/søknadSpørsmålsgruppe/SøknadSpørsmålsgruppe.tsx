import { Heading } from '@navikt/ds-react';
import classNames from 'classnames';
import * as React from 'react';

import styles from './søknadSpørsmålsgruppe.module.less';

type SøknadSpørsmålsgruppeProps = {
    className?: string;
} & (
    | {
          legend: string;
          withoutLegend?: boolean;
      }
    | { withoutLegend: true }
);

const SøknadSpørsmålsgruppe: React.FC<SøknadSpørsmålsgruppeProps> = (props) => (
    <div className={classNames(styles.container, props.className)}>
        {!props.withoutLegend && (
            <Heading level="2" size="medium" spacing>
                {props.legend}
            </Heading>
        )}
        <div className={styles.content}>{props.children}</div>
    </div>
);

export default SøknadSpørsmålsgruppe;
