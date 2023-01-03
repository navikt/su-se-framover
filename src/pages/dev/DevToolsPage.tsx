import * as RemoteData from '@devexperts/remote-data-ts';
import { BodyShort, Button, Heading, Modal, Radio, RadioGroup, TextField } from '@navikt/ds-react';
import * as DateFns from 'date-fns';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { PeriodeForm } from '~src/components/formElements/FormElements';
import * as DeveloperActions from '~src/features/DeveloperActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import * as Routes from '~src/lib/routes';
import { Nullable } from '~src/lib/types';

import styles from './DevTools.module.less';

const DevToolsPage = () => {
    const [nySøknadModalÅpen, setNySøknadModalÅpen] = useState<boolean>(false);
    const [nyIverksattSøknadsbehandlingModalÅpen, setNyIverksattSøknadsbehandlingModalÅpen] = useState<boolean>(false);

    return (
        <div className={styles.pageContainer}>
            <Heading size="medium">Velg en handling</Heading>

            <div className={styles.handlingsContainer}>
                <Button variant="secondary" type="button" onClick={() => setNySøknadModalÅpen(true)}>
                    Ny søknad
                </Button>
                <Button
                    variant="secondary"
                    type="button"
                    onClick={() => setNyIverksattSøknadsbehandlingModalÅpen(true)}
                >
                    Ny iverksatt søknadsbehandling
                </Button>
            </div>

            {nySøknadModalÅpen && (
                <NySøknadModal åpen={nySøknadModalÅpen} onClose={() => setNySøknadModalÅpen(false)} />
            )}
            {nyIverksattSøknadsbehandlingModalÅpen && (
                <NyIverksattSøknadsbehandlingModal
                    åpen={nyIverksattSøknadsbehandlingModalÅpen}
                    onClose={() => setNyIverksattSøknadsbehandlingModalÅpen(false)}
                />
            )}
        </div>
    );
};

const NySøknadModal = (props: { åpen: boolean; onClose: () => void }) => {
    const navigate = useNavigate();
    const [nySøknadStatus, lagNySøknad] = useAsyncActionCreator(DeveloperActions.sendUføresøknad);
    const [fnr, setFnr] = useState<Nullable<string>>(null);

    return (
        <Modal open={props.åpen} onClose={props.onClose}>
            <Modal.Content>
                <Heading size="medium" spacing>
                    Ny uføre søknad
                </Heading>
                <form className={styles.nySøknadForm}>
                    <TextField
                        label={'Skriv inn fødselsnummer'}
                        onChange={(e) => setFnr(e.target.value)}
                        description={
                            <div>
                                <BodyShort>Lager ny sak dersom det ikke eksisterer en fra før</BodyShort>
                                <BodyShort>
                                    Ved lokal utvikling blir det satt et tilfeldig (mest sannsynlig ugyldig fnr) dersom
                                    det ikke blir sendt med fnr
                                </BodyShort>
                            </div>
                        }
                    />

                    <Button
                        type="button"
                        loading={RemoteData.isPending(nySøknadStatus)}
                        onClick={() =>
                            lagNySøknad({ fnr: fnr }, (res) => {
                                navigate(Routes.saksoversiktValgtSak.createURL({ sakId: res.søknad.sakId }));
                            })
                        }
                    >
                        Send inn
                    </Button>
                </form>
                {RemoteData.isFailure(nySøknadStatus) && <ApiErrorAlert error={nySøknadStatus.error} />}
            </Modal.Content>
        </Modal>
    );
};

const NyIverksattSøknadsbehandlingModal = (props: { åpen: boolean; onClose: () => void }) => {
    const [lagNyIverksattSøknadsbehandlingStatus, lagNyIverksattSøknadsbehandling] = useAsyncActionCreator(
        DeveloperActions.sendIverksattSøknadsbehandling
    );
    const navigate = useNavigate();
    const [fnr, setFnr] = useState<Nullable<string>>(null);
    const [stønadsperiode, setStønadsperiode] = useState<{ fraOgMed: Nullable<Date>; tilOgMed: Nullable<Date> }>({
        fraOgMed: new Date('01-01-2021'),
        tilOgMed: new Date('12-31-2021'),
    });
    const [typeSøknadsbehandling, setTypeSøknadsbehandling] = useState<'avslag' | 'innvilget'>('innvilget');

    return (
        <Modal open={props.åpen} onClose={props.onClose}>
            <Modal.Content>
                <Heading size="medium" spacing>
                    Ny iverksatt søknadsbehandling
                </Heading>

                <form className={styles.nySøknadForm}>
                    <RadioGroup
                        legend={'Velg type søknadsbehandling'}
                        onChange={(e) => setTypeSøknadsbehandling(e)}
                        value={typeSøknadsbehandling}
                    >
                        <Radio value={'avslag'}>Avslag</Radio>
                        <Radio value={'innvilget'}>Innvilget</Radio>
                    </RadioGroup>

                    <PeriodeForm
                        value={stønadsperiode}
                        name={'stønadsperiode'}
                        onChange={setStønadsperiode}
                        minDate={{
                            fraOgMed: new Date('01-01-2021'),
                            tilOgMed: undefined,
                        }}
                        maxDate={{
                            fraOgMed: undefined,
                            tilOgMed: undefined,
                        }}
                    />

                    <TextField
                        label={'Skriv inn fødselsnummer'}
                        onChange={(e) => setFnr(e.target.value)}
                        description={
                            <div>
                                <BodyShort>Lager ny sak dersom det ikke eksisterer en fra før</BodyShort>
                                <BodyShort>
                                    Ved lokal utvikling blir det satt et tilfeldig (mest sannsynlig ugyldig fnr) dersom
                                    det ikke blir sendt med fnr
                                </BodyShort>
                            </div>
                        }
                    />

                    <Button
                        type="button"
                        loading={RemoteData.isPending(lagNyIverksattSøknadsbehandlingStatus)}
                        onClick={() => {
                            return lagNyIverksattSøknadsbehandling(
                                {
                                    fnr: fnr,
                                    resultat: typeSøknadsbehandling,
                                    stønadsperiode: {
                                        fraOgMed: DateFns.formatISO(stønadsperiode.fraOgMed!, {
                                            representation: 'date',
                                        }),
                                        tilOgMed: DateFns.formatISO(DateFns.endOfMonth(stønadsperiode.tilOgMed!), {
                                            representation: 'date',
                                        }),
                                    },
                                },
                                (res) => {
                                    navigate(Routes.saksoversiktValgtSak.createURL({ sakId: res.søknad.sakId }));
                                }
                            );
                        }}
                    >
                        Send inn
                    </Button>
                </form>
                {RemoteData.isFailure(lagNyIverksattSøknadsbehandlingStatus) && (
                    <ApiErrorAlert error={lagNyIverksattSøknadsbehandlingStatus.error} />
                )}
            </Modal.Content>
        </Modal>
    );
};

export default DevToolsPage;
