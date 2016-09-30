/**
 * @flow
 */

type Uid = string;

export type Metrics = {
  x: number,
  y: number,
  width: number,
  height: number,
};

export type TransitionProps = {
  progress: any,
  fromMetrics: ?Metrics,
  toMetrics: ?Metrics,
};

type State = {
  elementGroups: Object,
  transitioningElementGroupFromUid: ?Uid,
  transitioningElementGroupToUid: ?Uid,
  progress: ?mixed,
};

type ActionType =
  'REGISTER_GROUP' |
  'UNREGISTER_GROUP' |
  'UPDATE_METRICS_FOR_ELEMENT' |
  'START_TRANSITION_FOR_ELEMENT_GROUPS' |
  'END_TRANSITION_FOR_ELEMENT_GROUPS' |
  'SET_OVERLAY_HANDLE';

type Action = {
  type: ActionType,
};

const INITIAL_STATE: State = {
  elementGroups: {},
  transitioningElementGroupFromUid: null,
  transitioningElementGroupToUid: null,
  progress: null,
};

class SharedElementReducer {
  static reduce(state: State = INITIAL_STATE, action: Action): State {
    const reducer: { [key: string]: (state: State, action: Action) => State } = SharedElementReducer;
    if (!reducer[action.type]) {
      return state;
    }
    const newState = reducer[action.type](state, action);
    return newState;
  }

  static REGISTER_GROUP(state, { uid, ...config }) {
    return {
      ...state,
      elementGroups: {
        ...state.elementGroups,
        [uid]: {
          ...(state.elementGroups[uid] || {}),
          uid,
          ...config,
        },
      },
    };
  }

  static UNREGISTER_GROUP(state, { uid }) {
    const newState = { ...state };
    delete newState.elementGroups[uid];
    return newState;
  }

  static UPDATE_METRICS_FOR_ELEMENT(state, { groupUid, id, metrics }) {
    return {
      ...state,
      elementGroups: {
        ...state.elementGroups,
        [groupUid]: {
          ...state.elementGroups[groupUid],
          elementMetrics: {
            ...((state.elementGroups[groupUid] || {}).elementMetrics),
            [id]: metrics,
          },
        },
      },
    };
  }

  static START_TRANSITION_FOR_ELEMENT_GROUPS(state, { fromUid, toUid, progress }) {
    return {
      ...state,
      transitioningElementGroupFromUid: fromUid,
      transitioningElementGroupToUid: toUid,
      progress,
    };
  }

  static END_TRANSITION_FOR_ELEMENT_GROUPS(state) {
    return {
      ...state,
      transitioningElementGroupFromUid: null,
      transitioningElementGroupToUid: null,
      progress: null,
    };
  }

  static SET_OVERLAY_HANDLE(state, { handle }) {
    return {
      ...state,
      overlayHandle: handle,
    };
  }
}

export default SharedElementReducer.reduce;
