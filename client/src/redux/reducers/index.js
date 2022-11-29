import { combineReducers } from "redux";
import user from "./user"
import loading from "./loading"
import updates from "./updates"

const rootReducer = combineReducers({
    user,
    loading,
    updates
});

export default rootReducer;
