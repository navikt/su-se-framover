import { Heading } from '@navikt/ds-react';

import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import { EksternGrunnlagSkatt } from '~src/types/EksterneGrunnlag';

import OppsummeringAvSkattegrunnlag from '../oppsummeringAvSkattegrunnlag/OppsummeringAvSkattegrunnlag';

import * as styles from './OppsummeringAvEksterneGrunnlagSkatt.module.less';
import messages from './OppsummeringAvEksternGrunnlagSkatt-nb';

const OppsummeringAvEksternGrunnlagSkatt = (props: {
    medTittel?: boolean;
    eksternGrunnlagSkatt: Nullable<EksternGrunnlagSkatt>;
}) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div>
            {props.medTittel && (
                <Heading level="2" size="medium">
                    {formatMessage('skattegrunnlag.tittel')}
                </Heading>
            )}
            <div className={styles.skattegrunnlagsInformasjonContainer}>
                {props.eksternGrunnlagSkatt?.søkers && (
                    <OppsummeringAvSkattegrunnlag skattegrunnlag={props.eksternGrunnlagSkatt.søkers} />
                )}
                {props.eksternGrunnlagSkatt?.eps && (
                    <OppsummeringAvSkattegrunnlag skattegrunnlag={props.eksternGrunnlagSkatt.eps} />
                )}
            </div>
        </div>
    );
};

export default OppsummeringAvEksternGrunnlagSkatt;
