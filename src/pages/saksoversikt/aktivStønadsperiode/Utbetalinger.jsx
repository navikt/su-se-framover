import React, { useState } from 'react';
import { reverseDateString } from '../../../HelperFunctions';
import ModalWrapper from 'nav-frontend-modal';
import { Radio, RadioGruppe } from 'nav-frontend-skjema';
import { PencilIcon, BankNote } from '../../../assets/Icons';
import { updateUtbetalingAndLog } from '../../../redux/saksoversikt/saksoversiktActions';
import { useSelector, useDispatch } from 'react-redux';
import { BoldP, MarginRightBoldP, FlexDiv } from './StyledComponents';

const Utbetalinger = () => {
    const { saksoversiktReducer } = useSelector(state => state);
    const { saksoversikt } = saksoversiktReducer;

    const utbetalingerState = saksoversikt.aktivStønadsperiode.utbetalinger;

    function renderUtbetalinger() {
        return (
            <FlexDiv>
                {BankNote()}
                <div style={{ marginLeft: '1em' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', marginBottom: '1em' }}>
                        <MarginRightBoldP>Dato for Utbetaling</MarginRightBoldP>
                        <BoldP>Beløp</BoldP>
                        <BoldP>Status</BoldP>
                        <BoldP>Endre</BoldP>
                    </div>
                    {utbetalingerState.map((item, index) => (
                        <Utbetaling key={item.datoForUtbetaling} item={item} index={index} />
                    ))}
                </div>
            </FlexDiv>
        );
    }

    const Utbetaling = ({ item, index }) => {
        const [modalOpen, setModalOpen] = useState(false);
        const dispatch = useDispatch();

        const openModal = () => {
            setModalOpen(true);
        };
        const closeModal = () => {
            setModalOpen(false);
        };

        const options = [
            { label: 'Aktiv', value: 'aktiv' },
            { label: 'Stoppet', value: 'stoppet' }
        ];

        const handleActions = (e, index) => {
            dispatch(updateUtbetalingAndLog({ newStatus: e.target.value, index: index }));
        };

        return (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', marginBottom: '1em' }}>
                <p>{reverseDateString(item.datoForUtbetaling)}</p>
                <p>{item.beløp}</p>
                {item.status === 'stoppet' ? (
                    <p style={{ color: 'red', fontWeight: 'bold' }}>{item.status}</p>
                ) : item.status === 'Utbetalt' ? (
                    <p style={{ color: 'green', fontWeight: 'bold' }}>{item.status}</p>
                ) : (
                    <p>{item.status}</p>
                )}
                <p>
                    {/*TODO: Fix span allignment with Icon - span hack to limit onlick to icon only */}
                    <span onClick={() => openModal()}>{PencilIcon()}</span>
                </p>
                {modalOpen ? (
                    <ModalWrapper
                        isOpen={modalOpen}
                        onRequestClose={() => {
                            closeModal();
                        }}
                        contentLabel="kontrollModal"
                        ariaHideApp={false}
                    >
                        <div style={{ padding: '2rem 2.5rem' }}>
                            <p>Endre status for utbetaling</p>
                            <p>
                                {reverseDateString(item.datoForUtbetaling)} {item.beløp} {item.status}
                            </p>

                            <RadioGruppe legend={'Velg status for utbetaling'}>
                                {options.map(({ label, value }) => (
                                    <Radio
                                        key={label}
                                        disabled={item.status === 'Utbetalt'}
                                        name={'utbetalingStatus'}
                                        label={label}
                                        value={value}
                                        checked={item.status === value}
                                        onChange={e => {
                                            handleActions(e, index);
                                        }}
                                    />
                                ))}
                            </RadioGruppe>
                        </div>
                    </ModalWrapper>
                ) : (
                    ''
                )}
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ marginBottom: '1em', fontSize: '20px', fontWeight: 'bold' }}>Neste utbetalinger: </p>
            {renderUtbetalinger()}
        </div>
    );
};

export default Utbetalinger;
