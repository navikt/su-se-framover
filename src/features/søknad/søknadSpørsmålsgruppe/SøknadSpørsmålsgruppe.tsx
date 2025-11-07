import { Heading } from '@navikt/ds-react';
import classNames from 'classnames';
import { FC, ReactNode } from 'react';

import styles from './søknadSpørsmålsgruppe.module.less';

type SøknadSpørsmålsgruppeProps = {
    className?: string;
    children: ReactNode;
} & (
    | {
          legend: string;
          withoutLegend?: boolean;
      }
    | { withoutLegend: true }
);

const SøknadSpørsmålsgruppe: FC<SøknadSpørsmålsgruppeProps> = (props) => (
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
