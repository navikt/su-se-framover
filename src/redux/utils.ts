import * as RemoteData from '@devexperts/remote-data-ts';
import {
    ActionReducerMapBuilder,
    AsyncThunk,
    CaseReducer,
    createAsyncThunk,
    Dispatch,
    PayloadAction,
} from '@reduxjs/toolkit';

import { ApiClientResult, ApiError } from '~src/api/apiClient';

// Kopiert fra createAsyncThunk.d.ts siden den ikke er eksportert enda.
declare type AsyncThunkConfig = {
    state?: unknown;
    dispatch?: Dispatch;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
};

export const handleAsyncThunk = <State, A, B, C extends AsyncThunkConfig>(
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

export function createApiCallAsyncThunk<TReturn, TArgs>(
    type: string,
    f: (args: TArgs) => Promise<ApiClientResult<TReturn>>
) {
    return createAsyncThunk<TReturn, TArgs, { rejectValue: ApiError }>(type, async (args, thunkApi) => {
        const res = await f(args);
        if (res.status === 'ok') {
            return res.data;
        }
        return thunkApi.rejectWithValue(res.error);
    });
}
