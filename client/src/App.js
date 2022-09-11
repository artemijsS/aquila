import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { BrowserRouter } from 'react-router-dom';
import { useRoutes } from "./routes";
import { getProfileFetch } from "./redux/actions/user";


function App() {
  const routes = useRoutes()
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getProfileFetch())
  }, [])

  return (
      <BrowserRouter>
        {routes}
      </BrowserRouter>
  );
}

export default App;
