import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import classNames from 'classnames';
import * as DateFns from 'date-fns';
import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import { EkspanderbartpanelBase } from 'nav-frontend-ekspanderbartpanel';
import { Knapp } from 'nav-frontend-knapper';
import { Input, Textarea } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Element, Ingress, Normaltekst, Undertittel } from 'nav-frontend-typografi';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Control,
    Controller,
    FieldArrayWithId,
    useFieldArray,
    useForm,
    useFormState,
    UseFormTrigger,
    useWatch,
} from 'react-hook-form';

import * as personApi from '~api/personApi';
import { TrashBin } from '~assets/Icons';
import DatePicker from '~components/datePicker/DatePicker';
import { Personkort } from '~components/Personkort';
import ToKolonner from '~components/toKolonner/ToKolonner';
import VilkårvurderingStatusIcon from '~components/VilkårvurderingStatusIcon';
import { pipe } from '~lib/fp';
import { useApiCall, useI18n } from '~lib/hooks';
import { Nullable } from '~lib/types';
import yup, { validateStringAsNonNegativeNumber } from '~lib/validering';
import { Periode } from '~types/Periode';
import { RevurderingProps } from '~types/Revurdering';
import { VilkårVurderingStatus } from '~types/Vilkårsvurdering';

import { RevurderingBunnknapper } from '../bunnknapper/RevurderingBunnknapper';
import RevurderingskallFeilet from '../revurderingskallFeilet/RevurderingskallFeilet';
import RevurderingsperiodeHeader from '../revurderingsperiodeheader/RevurderingsperiodeHeader';
import { hentBosituasjongrunnlag } from '../revurderingUtils';

import messages from './formue-nb';
import styles from './formue.module.less';

interface Verdier {
    verdiPåBolig: string;
    verdiPåEiendom: string;
    verdiPåKjøretøy: string;
    innskuddsbeløp: string;
    verdipapir: string;
    kontanterOver1000: string;
    depositumskonto: string;
}

interface FormueData {
    epsFnr: Nullable<string>;
    periode: { fraOgMed: Nullable<Date>; tilOgMed: Nullable<Date> };
    søkersFormue: Verdier;
    epsFormue: Nullable<Verdier>;
    begrunnelse: Nullable<string>;
}

interface FormueFormData {
    formue: FormueData[];
}

const regnUtFormue = (verdier: Nullable<Verdier>) => {
    if (!verdier) {
        return 0;
    }

    //https://trello.com/c/cKPqPVXP/513-saksbehandling-formue-depositumskonto-trekkes-ikke-ifra-innskudd-p%C3%A5-konto
    //"depositum trekkes fra innskudd på konto(men det kan ikke bli minusbeløp), så summeres innskudd på konto med resten."
    const innskudd = Math.max(
        (verdier.innskuddsbeløp ? Number(verdier.innskuddsbeløp) : 0) -
            (verdier.depositumskonto ? Number(verdier.depositumskonto) : 0),
        0
    );

    const skalAdderes = [
        verdier.verdiPåBolig,
        verdier.verdiPåEiendom,
        verdier.verdiPåKjøretøy,
        verdier.verdipapir,
        verdier.kontanterOver1000,
    ];

    const skalAdderesParsed = skalAdderes.map((verdi) => Number(verdi));

    const formue = [...skalAdderesParsed, innskudd];

    return formue.reduce((prev, current) => {
        if (isNaN(current)) {
            return prev + 0;
        }
        return prev + current;
    }, 0);
};

const schema = yup.object<FormueFormData>({
    formue: yup
        .array<FormueData>(
            yup
                .object({
                    epsFnr: yup.string().nullable().defined(),
                    periode: yup
                        .object<{ fraOgMed: Nullable<Date>; tilOgMed: Nullable<Date> }>({
                            fraOgMed: yup.date().required().typeError('Feltet må fylles ut'),
                            tilOgMed: yup
                                .date()
                                .required()
                                .typeError('Feltet må fylles ut')
                                .test('etterFom', 'Til-og-med kan ikke være før fra-og-med', function (value) {
                                    const fom = this.parent.fraOgMed as Nullable<Date>;
                                    if (value && fom) {
                                        return !DateFns.isBefore(value, fom);
                                    }
                                    return true;
                                }),
                        })
                        .required(),
                    søkersFormue: yup
                        .object<Verdier>({
                            verdiPåBolig: validateStringAsNonNegativeNumber,
                            verdiPåEiendom: validateStringAsNonNegativeNumber,
                            verdiPåKjøretøy: validateStringAsNonNegativeNumber,
                            innskuddsbeløp: validateStringAsNonNegativeNumber,
                            verdipapir: validateStringAsNonNegativeNumber,
                            kontanterOver1000: validateStringAsNonNegativeNumber,
                            depositumskonto: validateStringAsNonNegativeNumber,
                        })
                        .required(),
                    epsFormue: yup
                        .object<Verdier>()
                        .defined()
                        .when('epsFnr', {
                            is: (val) => val !== null,
                            then: yup
                                .object<Verdier>({
                                    verdiPåBolig: validateStringAsNonNegativeNumber,
                                    verdiPåEiendom: validateStringAsNonNegativeNumber,
                                    verdiPåKjøretøy: validateStringAsNonNegativeNumber,
                                    innskuddsbeløp: validateStringAsNonNegativeNumber,
                                    verdipapir: validateStringAsNonNegativeNumber,
                                    kontanterOver1000: validateStringAsNonNegativeNumber,
                                    depositumskonto: validateStringAsNonNegativeNumber,
                                })
                                .required(),
                            otherwise: yup.object().notRequired(),
                        }),
                    begrunnelse: yup.string().nullable().defined(),
                })
                .required()
        )
        .required(),
});

const getDefaultValues = (epsFnr: Nullable<string>) => {
    return {
        formue: [
            {
                epsFnr: epsFnr,
                periode: { fraOgMed: null, tilOgMed: null },
                søkersFormue: {
                    verdiPåBolig: '0',
                    verdiPåEiendom: '0',
                    verdiPåKjøretøy: '0',
                    innskuddsbeløp: '0',
                    verdipapir: '0',
                    kontanterOver1000: '0',
                    depositumskonto: '0',
                },
                epsFormue: epsFnr
                    ? {
                          verdiPåBolig: '0',
                          verdiPåEiendom: '0',
                          verdiPåKjøretøy: '0',
                          innskuddsbeløp: '0',
                          verdipapir: '0',
                          kontanterOver1000: '0',
                          depositumskonto: '0',
                      }
                    : null,
                begrunnelse: null,
            },
        ],
    };
};

const leggTilNyPeriode = (epsFnr: Nullable<string>) => {
    return {
        epsFnr: epsFnr,
        periode: { fraOgMed: null, tilOgMed: null },
        søkersFormue: {
            verdiPåBolig: '0',
            verdiPåEiendom: '0',
            verdiPåKjøretøy: '0',
            innskuddsbeløp: '0',
            verdipapir: '0',
            kontanterOver1000: '0',
            depositumskonto: '0',
        },
        epsFormue: epsFnr
            ? {
                  verdiPåBolig: '0',
                  verdiPåEiendom: '0',
                  verdiPåKjøretøy: '0',
                  innskuddsbeløp: '0',
                  verdipapir: '0',
                  kontanterOver1000: '0',
                  depositumskonto: '0',
              }
            : null,
        begrunnelse: null,
    };
};

const Formue = (props: RevurderingProps) => {
    const epsFnr = hentBosituasjongrunnlag(props.gjeldendeGrunnlagsdataOgVilkårsvurderinger).fnr;
    const intl = useI18n({ messages });
    const [epsStatus, hentEPS] = useApiCall(personApi.fetchPerson);

    const { control, trigger, handleSubmit } = useForm<FormueFormData>({
        defaultValues: getDefaultValues(epsFnr),
        resolver: yupResolver(schema),
    });

    const handleSubmitLOL = (data: FormueFormData) => {
        console.log(data);
    };

    const formueArray = useFieldArray({
        name: 'formue',
        control: control,
    });

    useEffect(() => {
        if (epsFnr) {
            hentEPS(epsFnr);
        }
    }, [epsFnr]);

    const EPSPersonkort = pipe(
        epsStatus,
        RemoteData.fold(
            () => null,
            () => <NavFrontendSpinner />,
            (err) => (
                <AlertStripeFeil>
                    <RevurderingskallFeilet error={err} />
                </AlertStripeFeil>
            ),
            (eps) => (
                <div className={styles.personkortContainer}>
                    <Element>{intl.formatMessage({ id: 'personkort.eps' })}</Element>
                    <Personkort person={eps} />
                </div>
            )
        )
    );

    return (
        <ToKolonner tittel={<RevurderingsperiodeHeader periode={props.revurdering.periode} />}>
            {{
                left: (
                    <form onSubmit={handleSubmit(handleSubmitLOL)}>
                        {formueArray.fields.map((field, index) => (
                            <FormueBlokk
                                key={field.id}
                                revurderingsperiode={props.revurdering.periode}
                                blokkIndex={index}
                                blokkField={field}
                                EPSPersonkort={EPSPersonkort}
                                formController={control}
                                triggerValidation={trigger}
                                onSlettClick={() => formueArray.remove(index)}
                            />
                        ))}
                        <div className={styles.nyPeriodeKnappContainer}>
                            <Knapp
                                htmlType="button"
                                onClick={() => {
                                    formueArray.append(leggTilNyPeriode(epsFnr));
                                }}
                            >
                                {intl.formatMessage({ id: 'knapp.nyPeriode' })}
                            </Knapp>
                        </div>
                        <RevurderingBunnknapper onNesteClick="submit" tilbakeUrl={props.forrigeUrl} />
                    </form>
                ),
                right: <GjeldendeFormue />,
            }}
        </ToKolonner>
    );
};

const FormueBlokk = (props: {
    revurderingsperiode: Periode<string>;
    blokkIndex: number;
    blokkField: FieldArrayWithId<FormueFormData>;
    EPSPersonkort: Nullable<JSX.Element>;
    formController: Control<FormueFormData>;
    triggerValidation: UseFormTrigger<FormueFormData>;
    onSlettClick: (index: number) => void;
}) => {
    const intl = useI18n({ messages });
    const [søkersBekreftetFormue, setSøkersBekreftetFormue] = useState<number>(0);
    const [epsBekreftetFormue, setEPSBekreftetFormue] = useState<number>(0);
    const blokkName = `formue.${props.blokkIndex}` as const;
    const periode = {
        fraOgMed: new Date(props.revurderingsperiode.fraOgMed),
        tilOgMed: new Date(props.revurderingsperiode.tilOgMed),
    };

    const watch = useWatch({
        name: blokkName,
        control: props.formController,
    });

    const erVilkårOppfylt = true;

    return (
        <div className={styles.formueBlokk}>
            <div className={styles.periodeOgSøppelbøtteContainer}>
                <div className={styles.periodeContainer}>
                    <Controller
                        control={props.formController}
                        name={`${blokkName}.periode.fraOgMed`}
                        defaultValue={props.blokkField.periode.fraOgMed}
                        render={({ field, fieldState }) => (
                            <DatePicker
                                label={intl.formatMessage({ id: 'periode.fraOgMed' })}
                                dateFormat="MM/yyyy"
                                showMonthYearPicker
                                isClearable
                                autoComplete="off"
                                {...field}
                                feil={fieldState.error?.message}
                                minDate={periode.fraOgMed}
                                maxDate={periode.tilOgMed}
                                startDate={field.value}
                                endDate={watch.periode.tilOgMed}
                            />
                        )}
                    />
                    <Controller
                        control={props.formController}
                        name={`${blokkName}.periode.tilOgMed`}
                        defaultValue={props.blokkField.periode.tilOgMed}
                        render={({ field, fieldState }) => (
                            <DatePicker
                                label={intl.formatMessage({ id: 'periode.tilOgMed' })}
                                dateFormat="MM/yyyy"
                                showMonthYearPicker
                                isClearable
                                autoComplete="off"
                                {...field}
                                feil={fieldState.error?.message}
                                minDate={watch.periode.fraOgMed}
                                maxDate={periode.tilOgMed}
                                startDate={watch.periode.fraOgMed}
                                endDate={field.value}
                            />
                        )}
                    />
                </div>
                {props.blokkIndex > 0 && (
                    <Knapp
                        className={styles.søppelbøtte}
                        htmlType="button"
                        onClick={() => {
                            props.onSlettClick(props.blokkIndex);
                        }}
                        kompakt
                        aria-label={intl.formatMessage({ id: 'knapp.fjernPeriode' })}
                    >
                        <TrashBin width="24px" height="24px" />
                    </Knapp>
                )}
            </div>

            {props.EPSPersonkort}

            <div className={styles.formuePanelerContainer}>
                <FormuePanel
                    tilhører={'Søkers'}
                    blokkIndex={props.blokkIndex}
                    sumFormue={søkersBekreftetFormue}
                    setBekreftetFormue={setSøkersBekreftetFormue}
                    formController={props.formController}
                    triggerValidation={props.triggerValidation}
                />
                {watch.epsFnr && (
                    <FormuePanel
                        tilhører={'Ektefelle/Samboers'}
                        blokkIndex={props.blokkIndex}
                        sumFormue={epsBekreftetFormue}
                        setBekreftetFormue={setEPSBekreftetFormue}
                        formController={props.formController}
                        triggerValidation={props.triggerValidation}
                    />
                )}
            </div>

            <div className={styles.statusContainer}>
                <div>
                    <Normaltekst>{intl.formatMessage({ id: 'formueblokk.totalFormue' })}</Normaltekst>
                    <Undertittel>
                        {søkersBekreftetFormue + epsBekreftetFormue} {intl.formatMessage({ id: 'panel.kroner' })}
                    </Undertittel>
                </div>

                <div className={styles.status}>
                    <VilkårvurderingStatusIcon
                        status={erVilkårOppfylt ? VilkårVurderingStatus.Ok : VilkårVurderingStatus.IkkeOk}
                    />
                    <div className={styles.statusInformasjon}>
                        <p>
                            {erVilkårOppfylt
                                ? intl.formatMessage({ id: 'formueblokk.vilkårOppfylt' })
                                : intl.formatMessage({ id: 'formueblokk.vilkårIkkeOppfylt' })}
                        </p>
                        <p>
                            {erVilkårOppfylt
                                ? intl.formatMessage({ id: 'formueblokk.vilkårOppfyltGrunn' })
                                : intl.formatMessage({ id: 'formueblokk.vilkårIkkeOppfyltGrunn' })}
                        </p>
                    </div>
                </div>
            </div>

            <div className={styles.begrunnelseContainer}>
                <Controller
                    control={props.formController}
                    name={`${blokkName}.begrunnelse`}
                    defaultValue={props.blokkField.begrunnelse}
                    render={({ field, fieldState }) => (
                        <Textarea
                            label={intl.formatMessage({ id: 'formueblokk.begrunnelse' })}
                            value={field.value ?? ''}
                            onChange={field.onChange}
                            feil={fieldState.error?.message}
                        />
                    )}
                />
            </div>
        </div>
    );
};

const FormuePanel = (props: {
    tilhører: 'Søkers' | 'Ektefelle/Samboers';
    blokkIndex: number;
    sumFormue: number;
    setBekreftetFormue: (formue: number) => void;
    formController: Control<FormueFormData>;
    triggerValidation: UseFormTrigger<FormueFormData>;
}) => {
    const intl = useI18n({ messages });
    const [åpen, setÅpen] = useState<boolean>(false);
    const formueTilhører = props.tilhører === 'Søkers' ? 'søkersFormue' : 'epsFormue';
    const panelName = `formue.${props.blokkIndex}.${formueTilhører}` as const;

    const formueVerdier = useWatch({
        name: panelName,
        control: props.formController,
    });

    const { errors } = useFormState<FormueFormData>({
        name: panelName,
        control: props.formController,
    });

    const utregnetFormue = useMemo(() => {
        return regnUtFormue(formueVerdier);
    }, [{ ...formueVerdier }]);

    const handlePanelKlikk = () => {
        if (åpen) {
            validerInputs();
        } else {
            setÅpen(true);
        }
    };

    function objectValues(obj?: Record<string, unknown>) {
        if (!obj) {
            return [];
        }
        return Object.values(obj);
    }

    const validerInputs = () => {
        props.triggerValidation(panelName).then(() => {
            const triggeredErrors = errors?.formue?.[props.blokkIndex]?.[formueTilhører];

            if (objectValues(triggeredErrors).length <= 0) {
                setÅpen(false);
                props.setBekreftetFormue(utregnetFormue);
            }
        });
    };

    const verdierId: Array<keyof Verdier> = [
        'verdiPåBolig',
        'verdiPåEiendom',
        'verdiPåKjøretøy',
        'innskuddsbeløp',
        'verdipapir',
        'kontanterOver1000',
        'depositumskonto',
    ];

    return (
        <EkspanderbartpanelBase
            className={åpen ? styles.formuePanel : undefined}
            tittel={
                <div>
                    <Normaltekst>
                        {props.tilhører} {intl.formatMessage({ id: 'panel.formue' })}
                    </Normaltekst>
                    <p>
                        {props.sumFormue} {intl.formatMessage({ id: 'panel.kroner' })}
                    </p>
                </div>
            }
            apen={åpen}
            onClick={() => handlePanelKlikk()}
        >
            <ul className={styles.formueInputs}>
                {verdierId.map((id) => {
                    return (
                        <Controller
                            key={id}
                            name={`${panelName}.${id}`}
                            control={props.formController}
                            defaultValue={formueVerdier?.[id] ?? '0'}
                            render={({ field, fieldState }) => (
                                <Input
                                    id={field.name}
                                    label={intl.formatMessage({ id: `formuepanel.${id}` })}
                                    {...field}
                                    feil={fieldState.error?.message}
                                    bredde="M"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                />
                            )}
                        />
                    );
                })}
            </ul>

            <div className={styles.nyBeregningContainer}>
                <Normaltekst>{intl.formatMessage({ id: 'formuepanel.nyBeregning' })}</Normaltekst>
                <Undertittel>
                    {utregnetFormue} {intl.formatMessage({ id: 'panel.kroner' })}
                </Undertittel>
            </div>

            <Knapp htmlType="button" onClick={() => validerInputs()}>
                {intl.formatMessage({ id: 'knapp.bekreft' })}
            </Knapp>
        </EkspanderbartpanelBase>
    );
};

const GjeldendeFormue = () => {
    const intl = useI18n({ messages });
    const harEPS = true;

    return (
        <div>
            <div className={styles.eksisterendeVedtakTittelContainer}>
                <Ingress>{intl.formatMessage({ id: 'eksisterende.vedtakinfo.tittel' })}</Ingress>
                <Element>02.2021 - 06.2021</Element>
            </div>
            <ul>
                {/*props.formue.map((item, index) => (
                    <li key={index}>
                        <p>{item}</p>
                    </li>
                ))*/}
            </ul>

            <div className={styles.oppsummeringsContainer}>
                <div className={styles.formueInfo}>
                    {/*Finnes en bedre måte? Denne er for å få teksten alignet med verdiene */}
                    <Normaltekst>&nbsp;</Normaltekst>
                    <Normaltekst>{intl.formatMessage({ id: 'gjeldendeformue.verdiBolig' })}</Normaltekst>
                    <Normaltekst>{intl.formatMessage({ id: 'gjeldendeformue.verdiEiendom' })}</Normaltekst>
                    <Normaltekst>{intl.formatMessage({ id: 'gjeldendeformue.verdiKjøretøy' })}</Normaltekst>
                    <Normaltekst>{intl.formatMessage({ id: 'gjeldendeformue.innskuddsbeløp' })}</Normaltekst>
                    <Normaltekst>{intl.formatMessage({ id: 'gjeldendeformue.verdiPapir' })}</Normaltekst>
                    <Normaltekst>{intl.formatMessage({ id: 'gjeldendeformue.kontanterOver1000' })}</Normaltekst>
                    <Normaltekst>{intl.formatMessage({ id: 'gjeldendeformue.depositumskonto' })}</Normaltekst>
                </div>
                <div className={styles.søkerOgEPSContainer}>
                    <div>
                        <Normaltekst className={styles.formueVerdiTittel}>
                            {intl.formatMessage({ id: 'gjeldendeformue.søker' })}
                        </Normaltekst>
                        <div className={classNames(styles.formueVerdier, styles.formueInfo)}>
                            <Element>0</Element>
                            <Element>0</Element>
                            <Element>0</Element>
                            <Element>0</Element>
                            <Element>0</Element>
                            <Element>0</Element>
                            <Element>0</Element>
                        </div>
                    </div>
                    {harEPS && (
                        <div>
                            <Normaltekst className={styles.formueVerdiTittel}>
                                {intl.formatMessage({ id: 'gjeldendeformue.eps' })}
                            </Normaltekst>
                            <div className={classNames(styles.formueVerdier, styles.formueInfo)}>
                                <Element>0</Element>
                                <Element>0</Element>
                                <Element>0</Element>
                                <Element>0</Element>
                                <Element>0</Element>
                                <Element>0</Element>
                                <Element>0</Element>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Formue;
