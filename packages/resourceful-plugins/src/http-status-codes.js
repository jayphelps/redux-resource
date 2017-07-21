import {actionTypes, setResourceMeta} from 'resourceful-redux';

// End actions can be failed, succeeded, or null. Null should be dispatched
// when the request is aborted (with a status code of 0).
const endActions = [
  actionTypes.CREATE_RESOURCES_FAILED,
  actionTypes.READ_RESOURCES_FAILED,
  actionTypes.UPDATE_RESOURCES_FAILED,
  actionTypes.DELETE_RESOURCES_FAILED,
  actionTypes.CREATE_RESOURCES_SUCCEEDED,
  actionTypes.READ_RESOURCES_SUCCEEDED,
  actionTypes.UPDATE_RESOURCES_SUCCEEDED,
  actionTypes.DELETE_RESOURCES_SUCCEEDED,
  actionTypes.CREATE_RESOURCES_NULL,
  actionTypes.READ_RESOURCES_NULL,
  actionTypes.UPDATE_RESOURCES_NULL,
  actionTypes.DELETE_RESOURCES_NULL
];

// This sets a new meta property on resource and label metadata: `statusCode`.
// This will be equal to the last status code for a request
export default function httpStatusCodes(resourceName) {
  return function(state, action) {
    if (action.resourceName !== resourceName) {
      return state;
    }

    if (endActions.indexOf(action.type) === -1) {
      return state;
    }

    // If we have no statusCode, we still want to set the value to 0. Browsers
    // tend to use 0 as a "null" state (i.e.; that is the status of a request
    // that has not yet completed).
    const statusCode = action.statusCode || 0;
    const resources = action.resources;

    let label;
    if (action.label && typeof action.label === 'string') {
      label = action.label;
    }

    let newLabels, newMeta, idList;
    if (resources) {
      idList = resources.map(r => {
        if (typeof r === 'object') {
          return r.id;
        } else {
          return r;
        }
      });
    } else {
      idList = [];
    }

    if (label) {
      const existingLabel = state.labels[label] || {};

      newLabels = {
        ...state.labels,
        [label]: {
          ...existingLabel,
          statusCode
        }
      };
    } else {
      newLabels = {...state.labels};
    }

    if (idList.length) {
      newMeta = setResourceMeta({
        meta: state.meta,
        newMeta: {statusCode},
        resources: idList,
        mergeMeta: true
      });
    } else {
      newMeta = state.meta;
    }

    return {
      ...state,
      labels: newLabels,
      meta: newMeta
    };
  };
}