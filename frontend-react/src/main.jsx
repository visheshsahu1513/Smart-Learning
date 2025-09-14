import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { Provider } from 'react-redux'; // Import Provider
import { store } from './redux/store'; // Import our store

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}> {/* Wrap App with the Provider */}
      <App />
    </Provider>
  </React.StrictMode>
);
