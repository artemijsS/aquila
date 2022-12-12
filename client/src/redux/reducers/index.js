import { combineReducers } from "redux";
import user from "./user"
import loading from "./loading"
import updates from "./updates"
import signals from "./signals"

const rootReducer = combineReducers({
    user,
    loading,
    updates,
    signals
});

export default rootReducer;
