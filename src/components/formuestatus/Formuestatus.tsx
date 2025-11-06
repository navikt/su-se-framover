import { BodyShort, Heading, Label } from '@navikt/ds-react';
import classNames from 'classnames';

import { VilkårvurderingStatusIcon } from '~src/components/VilkårvurderingStatusIcon';
import { useI18n } from '~src/lib/i18n';
import { VilkårVurderingStatus } from '~src/types/Vilkårsvurdering';
import styles from './formuestatus.module.less';
import messages from './formuestatus-nb';

const Formuestatus = (props: {
    bekreftetFormue: number;
    erVilkårOppfylt: boolean;
    skalVisesSomOppsummering?: boolean;
}) => {
    return (
        <div className={classNames({ [styles.statusContainer]: !props.skalVisesSomOppsummering })}>
            <TotalFormueUtregning
                bekreftetFormue={props.bekreftetFormue}
                skalVisesSomOppsummering={props.skalVisesSomOppsummering}
            />
            <StatusInformasjon
                erVilkårOppfylt={props.erVilkårOppfylt}
                skalVisesSomOppsummering={props.skalVisesSomOppsummering}
            />
        </div>
    );
};

const TotalFormueUtregning = ({
    bekreftetFormue,
    skalVisesSomOppsummering,
}: {
    bekreftetFormue: number;
    skalVisesSomOppsummering?: boolean;
}) => {
    const { formatMessage } = useI18n({ messages });

    if (skalVisesSomOppsummering) {
        return (
            <div className={styles.totalFormueContainer}>
                <BodyShort>{formatMessage('formueblokk.totalFormue')}</BodyShort>
                <Heading level="5" size="medium">
                    {bekreftetFormue} {formatMessage('panel.kroner')}
                </Heading>
            </div>
        );
    }

    return (
        <div>
            <BodyShort>{formatMessage('formueblokk.totalFormue')}</BodyShort>
            <Label>
                {bekreftetFormue} {formatMessage('panel.kroner')}
            </Label>
        </div>
    );
};

const StatusInformasjon = ({
    erVilkårOppfylt,
    skalVisesSomOppsummering,
}: {
    erVilkårOppfylt: boolean;
    skalVisesSomOppsummering?: boolean;
}) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div className={styles.status}>
            <VilkårvurderingStatusIcon
                status={erVilkårOppfylt ? VilkårVurderingStatus.Ok : VilkårVurderingStatus.IkkeOk}
            />
            <div className={classNames({ [styles.statusInformasjon]: skalVisesSomOppsummering })}>
                <BodyShort>
                    {erVilkårOppfylt
                        ? formatMessage('formueblokk.vilkårOppfylt')
                        : formatMessage('formueblokk.vilkårIkkeOppfylt')}
                </BodyShort>
                <BodyShort>
                    {erVilkårOppfylt
                        ? formatMessage('formueblokk.vilkårOppfyltGrunn')
                        : formatMessage('formueblokk.vilkårIkkeOppfyltGrunn')}
                </BodyShort>
            </div>
        </div>
    );
};

export default Formuestatus;
