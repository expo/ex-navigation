/**
 * @flow
 */

type State = {
  elementGroups: Object,
  transitioningElementGroupFromUid: ?string,
  transitioningElementGroupToUid: ?string,
  progress: ?mixed,
}

type Action = {
  type: string,
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
            ...((state.elementGroups[groupUid] || {}).elementMetrics || {}),
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
