import React from 'react';
import Form from './components/Form/Form';
import { ThemeProvider } from '@mui/material/styles';
import theme from './styles/theme';

function App() {
    return (
        <ThemeProvider theme={theme}>
            <div className="App">
                <Form />
            </div>
        </ThemeProvider>
    );
}

export default App;
