import { Stepper } from '@navikt/ds-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from 'src/pages/søknad/index.module.less';
import { useI18n } from '~src/lib/i18n.ts';
import { kontrollsamtaleUtfylling, useRouteParams } from '~src/lib/routes.ts';
import messages from '~src/pages/kontrollsamtale/nb.ts';
import Steg from '~src/pages/kontrollsamtale/steg/Steg.tsx';
import { KontrollsamtaleSteg } from '~src/pages/kontrollsamtale/types.ts';
import { useAppSelector } from '~src/redux/Store.ts';

const Startutfylling = () => {
    const { formatMessage } = useI18n({ messages });
    const navigate = useNavigate();

    const { step, sakId } = useRouteParams<typeof kontrollsamtaleUtfylling>();
    const personligOppmøte = useAppSelector((state) => state.kontrollsamtale.personligOppmøte);

    if (!sakId) {
        throw new Error('Mangler sakId');
    }

    const steg = [
        { step: KontrollsamtaleSteg.PersonligOppmøte },
        ...(personligOppmøte === false ? [{ step: KontrollsamtaleSteg.FullmaktOgLegeerklæring }] : []),

        { step: KontrollsamtaleSteg.OriginalPass },
        { step: KontrollsamtaleSteg.ReisetilUtlandet },
        { step: KontrollsamtaleSteg.ØkonomiskSituasjon },
        { step: KontrollsamtaleSteg.AndreForhold },
        { step: KontrollsamtaleSteg.SkatteOpplysninger },
        { step: KontrollsamtaleSteg.Oppsummering, hjelpetekst: formatMessage('steg.oppsummering.hjelpetekst') },
    ];
    const aktivtStegIndex = steg.findIndex((s) => s.step === step);
    useEffect(() => {
        if (aktivtStegIndex === -1) {
            navigate(
                kontrollsamtaleUtfylling.createURL({
                    sakId,
                    step: KontrollsamtaleSteg.PersonligOppmøte,
                }),
                { replace: true },
            );
        }
    }, [aktivtStegIndex, navigate, sakId]);

    if (aktivtStegIndex === -1) {
        return null;
    }
    const aktivtSteg = steg[aktivtStegIndex];

    return (
        <div className={styles.contentContainer}>
            <div className={styles.content}>
                <div className={styles.stepperContainer}>
                    <Stepper
                        activeStep={aktivtStegIndex + 1}
                        orientation="horizontal"
                        onStepChange={(index) => {
                            navigate(
                                kontrollsamtaleUtfylling.createURL({
                                    sakId,
                                    step: steg[index - 1].step,
                                }),
                            );
                        }}
                    >
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
