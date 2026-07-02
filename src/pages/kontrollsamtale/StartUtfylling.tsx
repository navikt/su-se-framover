import { Stepper } from '@navikt/ds-react';
import styles from 'src/pages/søknad/index.module.less';
import { useI18n } from '~src/lib/i18n.ts';
import { kontrollsamtaleUtfylling, useRouteParams } from '~src/lib/routes.ts';
import messages from '~src/pages/kontrollsamtale/nb.ts';
import Steg from '~src/pages/kontrollsamtale/steg/Steg.tsx';
import { KontrollsamtaleSteg } from '~src/pages/kontrollsamtale/types.ts';

const Startutfylling = () => {
    const { formatMessage } = useI18n({ messages });

    const { step, sakId } = useRouteParams<typeof kontrollsamtaleUtfylling>();

    const steg = [
        { step: KontrollsamtaleSteg.PersonligOppmøte },
        { step: KontrollsamtaleSteg.FullmaktOgLegeerklæring },
        { step: KontrollsamtaleSteg.OriginalPass },
        { step: KontrollsamtaleSteg.ReisetilUtlandet },
        { step: KontrollsamtaleSteg.ØkonomiskSituasjon },
        { step: KontrollsamtaleSteg.AndreForhold },
        { step: KontrollsamtaleSteg.SkatteOpplysninger },
        { step: KontrollsamtaleSteg.Oppsummering, hjelpetekst: formatMessage('steg.oppsummering.hjelpetekst') },
    ];
    const aktivtStegIndex = steg.findIndex((s) => s.step === step);
    const aktivtSteg = steg[aktivtStegIndex];

    return (
        <div className={styles.contentContainer}>
            <div className={styles.content}>
                <div className={styles.stepperContainer}>
                    <Stepper activeStep={aktivtStegIndex + 1} orientation="horizontal">
                        {steg.map((s) => (
                            <Stepper.Step key={s.step} as="button">
                                {' '}
                            </Stepper.Step>
                        ))}
                    </Stepper>
                </div>
                <Steg
                    step={step!}
                    sakId={sakId!}
                    title={formatMessage(aktivtSteg!.step)}
                    hjelpetekst={aktivtSteg?.hjelpetekst}
                />
            </div>
        </div>
    );
};
export default Startutfylling;
