import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './styles.css';
import { BrowserRouter as Router } from 'react-router-dom';
import {
  createMuiTheme,
  responsiveFontSizes,
  ThemeProvider,
} from '@material-ui/core';
import { teal } from '@material-ui/core/colors';

let theme = createMuiTheme({
  palette: {
    primary: teal,
  },
});
theme = responsiveFontSizes(theme);

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <Router>
        <App />
      </Router>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
