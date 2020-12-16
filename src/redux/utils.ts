import * as RemoteData from '@devexperts/remote-data-ts';
import { ActionReducerMapBuilder, AsyncThunk, CaseReducer, PayloadAction } from '@reduxjs/toolkit';

import { ApiError } from '~api/apiClient';

export const handleAsyncThunk = <State, A, B, C>(
    builder: ActionReducerMapBuilder<State>,
    t: AsyncThunk<A, B, C>,
    x: {
        pending: CaseReducer<State, ReturnType<typeof t.pending>>;
        rejected: CaseReducer<State, ReturnType<typeof t.rejected>>;
        fulfilled: CaseReducer<State, ReturnType<typeof t.fulfilled>>;
    }
) => {
    builder.addCase(t.pending, x.pending).addCase(t.rejected, x.rejected).addCase(t.fulfilled, x.fulfilled);
};

export const simpleRejectedActionToRemoteData = <ActionType extends string, M, E>(
    action: PayloadAction<ApiError | undefined, ActionType, M, E>
): RemoteData.RemoteData<ApiError, never> =>
    RemoteData.failure(
        action.payload ?? {
            body: null,
            correlationId: '',
            statusCode: -1,
        }
    );
