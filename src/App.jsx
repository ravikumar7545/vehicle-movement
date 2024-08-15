import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Map from './components/Map';
// import DemoMap from './components/DemoMap';

const App = () => {
  return (
    <div>
      <ToastContainer />
      <Map />
    </div>
  );
};

export default App;
