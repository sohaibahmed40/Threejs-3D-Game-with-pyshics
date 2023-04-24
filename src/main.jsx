import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { hydrate, render } from "react-dom";
 
const rootElement = document.getElementById("root");
if (rootElement.hasChildNodes()) {
  hydrate(<App />, rootElement);
} else {
  render(<App />, rootElement);
}
// ReactDOM.createRoot(document.getElementById('root')).render(
//     <App />,
// )
