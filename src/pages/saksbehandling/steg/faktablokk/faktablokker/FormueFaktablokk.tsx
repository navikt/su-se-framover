import React, { useMemo } from 'react';

import { useI18n } from '~lib/hooks';
import { SøknadInnhold } from '~types/Søknad';

import { kalkulerFormueFraSøknad } from '../../formue/utils';
import { delerBoligMedFormatted } from '../../sharedUtils';
import Faktablokk from '../Faktablokk';

import messages from './faktablokker-nb';
import styles from './faktablokker.module.less';

const FormueFaktablokk = (props: { søknadInnhold: SøknadInnhold }) => {
    const intl = useI18n({ messages });

    const totalFormueFraSøknad = useMemo(() => {
        const søkersFormueFraSøknad = kalkulerFormueFraSøknad(props.søknadInnhold.formue);

        if (props.søknadInnhold.ektefelle) {
            return søkersFormueFraSøknad + kalkulerFormueFraSøknad(props.søknadInnhold.ektefelle.formue);
        }

        return søkersFormueFraSøknad;
    }, [props.søknadInnhold.formue]);

    return (
        <div>
            <Faktablokk
                tittel={intl.formatMessage({ id: 'display.fraSøknad' })}
                faktaBlokkerClassName={styles.formueFaktaBlokk}
                fakta={[
                    {
                        tittel: intl.formatMessage({ id: 'formue.delerBoligMed' }),
                        verdi: delerBoligMedFormatted(props.søknadInnhold.boforhold.delerBoligMed),
                    },
                    {
                        tittel: intl.formatMessage({ id: 'formue.ektefelleTitle' }),
                        verdi: props.søknadInnhold.ektefelle ? (
                            <>
                                <p>
                                    {`${intl.formatMessage({ id: 'formue.epsFnr' })}: ${
                                        props.søknadInnhold.boforhold.ektefellePartnerSamboer?.fnr
                                    }`}
                                </p>
                                {
                                    // TODO ai: very very temporary solution for showing formue for ektefelle
                                    [
                                        ['verdiPåBolig', props.søknadInnhold.ektefelle.formue.verdiPåBolig],
                                        ['verdiPåEiendom', props.søknadInnhold.ektefelle.formue.verdiPåEiendom],
                                        [
                                            'verdiPåKjøretøy',
                                            props.søknadInnhold.ektefelle.formue.kjøretøy?.reduce(
                                                (acc, kjøretøy) => acc + kjøretøy.verdiPåKjøretøy,
                                                0
                                            ),
                                        ],
                                        ['innskuddsbeløp', props.søknadInnhold.ektefelle.formue.innskuddsBeløp],
                                        ['verdipapirbeløp', props.søknadInnhold.ektefelle.formue.verdipapirBeløp],
                                        [
                                            'skylderNoenEktefellePengerBeløp',
                                            props.søknadInnhold.ektefelle.formue.verdiPåBolig,
                                        ],
                                        ['depositumsBeløp', props.søknadInnhold.ektefelle.formue.verdiPåBolig],
                                    ].map(([translationKey, verdi]) => (
                                        <p key={translationKey}>
                                            {intl.formatMessage({
                                                id: `formue.ektefelle.${translationKey}`,
                                            })}
                                            : {verdi}
                                        </p>
                                    ))
                                }
                                <p>
                                    {`${intl.formatMessage({
                                        id: 'formue.ektefellesFormue',
                                    })}: ${kalkulerFormueFraSøknad(props.søknadInnhold.ektefelle.formue).toString()}`}
                                </p>
                            </>
                        ) : (
                            'Ingen ektefelle'
                        ),
                    },
                    {
                        tittel: intl.formatMessage({ id: 'formue.verdiPåBolig' }),
                        verdi: props.søknadInnhold.formue.verdiPåBolig?.toString() ?? '0',
                    },
                    {
                        tittel: intl.formatMessage({ id: 'formue.verdiPåEiendom' }),
                        verdi: props.søknadInnhold.formue.verdiPåEiendom?.toString() ?? '0',
                    },
                    {
                        tittel: intl.formatMessage({ id: 'formue.verdiPåKjøretøy' }),
                        verdi:
                            props.søknadInnhold.formue.kjøretøy
                                ?.reduce((acc, kjøretøy) => acc + kjøretøy.verdiPåKjøretøy, 0)
                                .toString() ?? '0',
                    },
                    {
                        tittel: intl.formatMessage({ id: 'formue.innskuddsbeløp' }),
                        verdi: props.søknadInnhold.formue.innskuddsBeløp?.toString() ?? '0',
                    },
                    {
                        tittel: intl.formatMessage({ id: 'formue.verdipapirbeløp' }),
                        verdi: props.søknadInnhold.formue.verdipapirBeløp?.toString() ?? '0',
                    },
                    {
                        tittel: intl.formatMessage({ id: 'formue.kontanter' }),
                        verdi: props.søknadInnhold.formue.kontanterBeløp?.toString() ?? '0',
                    },
                    {
                        tittel: intl.formatMessage({ id: 'formue.skylderNoenSøkerPengerBeløp' }),
                        verdi: props.søknadInnhold.formue.skylderNoenMegPengerBeløp?.toString() ?? '0',
                    },
                    {
                        tittel: intl.formatMessage({ id: 'formue.depositumsBeløp' }),
                        verdi: props.søknadInnhold.formue.depositumsBeløp?.toString() ?? '0',
                    },
                ]}
            />
            <p className={styles.formueFraSøknad}>
                {intl.formatMessage({ id: 'formue.totalt' })}: {totalFormueFraSøknad}
            </p>
        </div>
    );
};

export default FormueFaktablokk;
