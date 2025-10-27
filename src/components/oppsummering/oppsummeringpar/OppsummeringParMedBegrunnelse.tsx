import { BodyShort, Label } from '@navikt/ds-react';
import classNames from 'classnames';

import styles from '~src/components/oppsummering/oppsummeringpar/oppsummeringPar.module.less';
import { useI18n } from '~src/lib/i18n';
import formkravMessages from '~src/pages/klage/vurderFormkrav/vurderFormkrav-nb';

interface Props {
    label: string;
    verdi: string | number | undefined | null;
    begrunnelse: string | number | undefined | null;
    retning?: 'horisontal' | 'vertikal';
    textSomSmall?: boolean;
    className?: string;
}

/**
 * default retning er horisontal
 */
export const OppsummeringParMedBegrunnelse = ({
    label,
    verdi,
    begrunnelse,
    className = '',
    textSomSmall,
    retning = 'horisontal',
}: Props) => {
    const { formatMessage } = useI18n({
        messages: { ...formkravMessages },
    });
    if (retning === 'vertikal') {
        return (
            <div className={classNames(styles.vertikalt, className)}>
                <Label size={textSomSmall ? 'small' : undefined}>{label}</Label>
                <BodyShort className={styles.verdi} size={textSomSmall ? 'small' : undefined}>
                    {verdi ?? ''}
                </BodyShort>
                <Label size={textSomSmall ? 'small' : undefined}>{formatMessage('begrunnelse.label')}</Label>
                <BodyShort className={styles.verdi} size={textSomSmall ? 'small' : undefined}>
                    {begrunnelse ?? ''}
                </BodyShort>
            </div>
        );
    }

    return (
        <div className={classNames(styles.oppsummeringspar, className)}>
            <BodyShort size={textSomSmall ? 'small' : undefined}>{label}</BodyShort>
            <Label className={styles.verdi} size={textSomSmall ? 'small' : undefined}>
                {verdi ?? ''}
            </Label>
            <BodyShort size={textSomSmall ? 'small' : undefined}>{formatMessage('begrunnelse.label')}</BodyShort>
            <Label className={styles.verdi} size={textSomSmall ? 'small' : undefined}>
                {begrunnelse ?? ''}
            </Label>
        </div>
    );
};
