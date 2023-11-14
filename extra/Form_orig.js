import React, {useEffect, useRef, useState} from 'react';
import axios from 'axios';
import Dropzone from 'react-dropzone';
import {
    TextField,
    Button,
    Container,
    Paper,
    Typography,
    CssBaseline, IconButton, Tooltip, Divider,
} from '@mui/material';
import {makeStyles} from '@mui/styles';
import clsx from "clsx";
import CancelIcon from '@mui/icons-material/Cancel';


const useStyles = makeStyles((theme) => ({
    formContainer: {
        marginTop: theme.spacing(2),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '700px', // Adjust the maxWidth according to your needs
        margin: 'auto', // Center the container horizontally
        padding: '10px'
    },
    form: {
        width: '100%',
        // marginTop: theme.spacing(0),
    },
    submit: {
        margin: theme.spacing(2, 0, 2),
    },
    chatContainer: {
        // display: 'flex',
        // flexDirection: 'column',
        // alignItems: 'flex-start',
        padding: '10px',
        width: '100%', // Set the width to 100% or a specific value
        // maxWidth: '1000px', // Set a maximum width if needed
        height: 'auto',
        maxHeight: '50vh', // Adjust the maxHeight according to your needs
        overflowY: 'auto', // Add a vertical scrollbar when content exceeds maxHeight,
        border: '2px solid #cccccc',
    },
    userMessage: {
        alignSelf: 'flex-start',
        background: '#eee',
        padding: '10px',
        borderRadius: '10px',
        marginBottom: '10px',
    },
    apiMessage: {
        alignSelf: 'flex-end',
        background: '#4CAF50',
        color: 'white',
        padding: '10px',
        borderRadius: '10px',
        marginBottom: '20px',
    },
    messageLabel: {
        marginBottom: '10px',
    },
    dropzone: {
        display: 'flex', // Use flexbox
        alignItems: 'center', // Align items vertically
        justifyContent: 'center', // Center content horizontally
        height: '60px',
        border: '2px dashed #cccccc',
        borderRadius: '4px',
        padding: '5px',
        textAlign: 'center',
        marginTop: '10px',
        cursor: 'pointer',
        transition: 'border 0.3s ease', // Add transition for smoother effect
    },
    dropzoneHovered: {
        borderColor: 'blue', // Change border color when hovered
        boxShadow: '0 0 10px rgba(0, 255, 100, 0.5)', // Add box shadow when hovered
    },
    dropzoneSelected: {
        borderColor: 'green', // Change border color when a file is selected
        backgroundColor: 'rgba(0, 255, 100, 0.4)', // Add background color when selected
        boxShadow: '0 0 1px rgba(0, 255, 0, 0.8)', // Add stronger box shadow when selected
    },
}));

const Form = () => {
    const classes = useStyles();
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);
    const [dropzoneText, setDropzoneText] = useState('Drag \'n\' drop a CSV file here, or click to select one');
    const [fileSelected, setFileSelected] = useState(false); // New state to track file selection
    const [dropzoneHovered, setDropzoneHovered] = useState(false); // New state to track hover state
    const [chatHistory, setChatHistory] = useState([]);
    const chatContainerRef = useRef(null);

    const handleDrop = (acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            const selectedFile = acceptedFiles[0];
            setFile(selectedFile);
            setDropzoneText(`Selected File: ${selectedFile.name}`);
            setFileSelected(true); // Set the fileSelected state to true when a file is selected
        }
    };

    const addUserMessage = () => {
        setChatHistory(prevChatHistory => [
            ...prevChatHistory,
            {type: 'user', message: text}
        ]);
    };

    const addApiMessage = (message) => {
        setChatHistory(prevChatHistory => [
            ...prevChatHistory,
            {type: 'api', message: message.replace("Error:", "")}
        ]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        addUserMessage();

        const formData = new FormData();
        formData.append('text', text);
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:5000/process_chat/', formData, {
                headers: {'Content-Type': 'multipart/form-data'},
            });

            addApiMessage(response.data.message);
        } catch (error) {
            console.error(error);
            addApiMessage(`Error: ${error.response.data.message}`);
        }
    };

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory]);

    return (
        <Container component="main" maxWidth="lg">
            <CssBaseline/>
            <Paper elevation={3} className={classes.formContainer}>
                <Typography component="h1" variant="h5">
                    ChatDPTs
                </Typography>
                <div className={classes.chatContainer} ref={chatContainerRef}>
                    {chatHistory.map((chat, index) => (
                        <div>
                            <Typography variant="subtitle2" className={classes.messageLabel}>
                                {chat.type === 'user' ? 'User:' : 'Response:'}
                            </Typography>
                            <div key={index}
                                 className={chat.type === 'user' ? classes.userMessage : classes.apiMessage}>
                                {chat.message}
                            </div>
                            {chat.type === 'api' &&
                                <Divider variant="fullWidth" style={{ margin: '10px 0', borderTop: '2px solid #ccc' }} />
                            }
                        </div>
                    ))}
                </div>
                <form className={classes.form} onSubmit={handleSubmit}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="text"
                        label="Text"
                        name="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                    <Dropzone onDrop={handleDrop} accept=".csv" multiple={false}>
                        {({getRootProps, getInputProps}) => (
                            <div
                                {...getRootProps()}
                                className={clsx(
                                    classes.dropzone,
                                    dropzoneHovered && classes.dropzoneHovered,
                                    fileSelected && classes.dropzoneSelected,
                                )}
                                onMouseOver={() => setDropzoneHovered(true)}
                                onMouseOut={() => setDropzoneHovered(false)}
                            >
                                <input {...getInputProps()} />
                                <Typography>{dropzoneText}</Typography>
                                {fileSelected && (
                                    <Tooltip title="Remove file" placement="top">
                                        <IconButton
                                            onClick={(e) => {
                                                e.stopPropagation(); // Stop the click event from propagating to the parent dropzone
                                                setFile(null);
                                                setFileSelected(false);
                                                setDropzoneText('Drag \'n\' drop a CSV file here, or click to select one');
                                            }}
                                            style={{
                                                position: 'relative'
                                            }}
                                        >
                                            <CancelIcon/>
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </div>
                        )}
                    </Dropzone>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                    >
                        Submit
                    </Button>
                </form>
            </Paper>
        </Container>
    );
};

export default Form;
