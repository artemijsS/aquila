import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { BrowserRouter } from 'react-router-dom';
import { useRoutes } from "./routes";
import { getProfileFetch } from "./redux/actions/user";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';


function App({ urlPath }) {
  const routes = useRoutes(urlPath)
  const dispatch = useDispatch()

  useEffect(() => {
      dispatch(getProfileFetch())
  }, [])

  return (
      <BrowserRouter>
        <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
        />
        {routes}
      </BrowserRouter>
  );
}

export default App;
