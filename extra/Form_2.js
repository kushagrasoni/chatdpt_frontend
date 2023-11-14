import React, {useEffect, useRef, useState} from 'react';
import axios from 'axios';
import Dropzone from 'react-dropzone';
import {
    TextField,
    Button,
    Container,
    Paper,
    Typography,
    CssBaseline,
    IconButton,
    Tooltip,
    Divider,
    Drawer,
    List,
    ListItemText, ListItemButton,
} from '@mui/material';
import {makeStyles} from '@mui/styles';
import CancelIcon from '@mui/icons-material/Cancel';
import clsx from 'clsx';

const drawerWidth = 300;

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
        overflowY: 'auto',
        height: '100vh',
    },
    drawerPaper: {
        width: drawerWidth,
        padding: theme.spacing(2),
        display: 'flex',
        flexDirection: 'column',
    },
    formContainer: {
        marginTop: theme.spacing(2),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '700px',
        margin: 'auto',
        padding: '10px',
    },
    form: {
        width: '100%',
    },
    submit: {
        margin: theme.spacing(2, 0, 2),
    },
    chatContainer: {
        padding: '10px',
        width: '100%',
        height: 'auto',
        maxHeight: '50vh',
        overflowY: 'auto',
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '60px',
        border: '2px dashed #cccccc',
        borderRadius: '4px',
        padding: '5px',
        textAlign: 'center',
        marginTop: '10px',
        cursor: 'pointer',
        transition: 'border 0.3s ease',
    },
    dropzoneHovered: {
        borderColor: 'blue',
        boxShadow: '0 0 10px rgba(0, 255, 100, 0.5)',
    },
    dropzoneSelected: {
        borderColor: 'green',
        backgroundColor: 'rgba(0, 255, 100, 0.4)',
        boxShadow: '0 0 1px rgba(0, 255, 0, 0.8)',
    },
    list: {
        marginTop: theme.spacing(2),
    },
}));

const Form = () => {
    const classes = useStyles();
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);
    const [dropzoneText, setDropzoneText] = useState('Drag \'n\' drop a CSV file here, or click to select one');
    const [fileSelected, setFileSelected] = useState(false);
    const [dropzoneHovered, setDropzoneHovered] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const [activeChat, setActiveChat] = useState('');
    const [chatList, setChatList] = useState(["Chat 1"]);
    const chatContainerRef = useRef(null);
    const [chatSeqNbr, setChatSeqNbr] = useState(1);

    const handleDrop = (acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            const selectedFile = acceptedFiles[0];
            setFile(selectedFile);
            setDropzoneText(`Selected File: ${selectedFile.name}`);
            setFileSelected(true);
        }
    };

    const addUserMessage = (message) => {
        setChatHistory((prevChatHistory) => [
            ...prevChatHistory,
            {type: 'user', message},
        ]);
    };

    const addApiMessage = (message) => {
        setChatHistory((prevChatHistory) => [
            ...prevChatHistory,
            {type: 'api', message},
        ]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        addUserMessage(text);

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

        // setText('');
        // setFile(null);
        // setFileSelected(false);
        // setDropzoneText('Drag \'n\' drop a CSV file here, or click to select one');

        saveChatHistoryToLocalStorage();
    };

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    const saveChatSeqNbrToLocalStorage = () => {
        localStorage.setItem("ChatSeqNbr", JSON.stringify(chatSeqNbr));
    };

    const loadChatSeqNbrFromLocalStorage = () => {
        const temp = JSON.parse(localStorage.getItem("ChatSeqNbr")) || 1;
        setChatSeqNbr(temp);
    };


    const saveChatHistoryToLocalStorage = () => {
        localStorage.setItem(activeChat, JSON.stringify(chatHistory));
    };

    const loadChatHistoryFromLocalStorage = (chatName) => {
        const savedChatHistory = JSON.parse(localStorage.getItem(chatName)) || [];
        setChatHistory(savedChatHistory);
    };

    const saveChatListToLocalStorage = () => {
        localStorage.setItem("ChatList", JSON.stringify(chatList));
    };

    const loadChatListFromLocalStorage = (chatName) => {
        const savedChatList = JSON.parse(localStorage.getItem("ChatList")) || ["Chat 1"];
        setChatList(savedChatList);
    };

    const createNewChat = () => {
        loadChatSeqNbrFromLocalStorage();
        loadChatListFromLocalStorage();
        console.log(`Chat List: ${chatList}, Active Chat ${activeChat}, chatSeqNbr ${chatSeqNbr}`);
        const newChatName = `Chat ${chatSeqNbr + 1}`;
        setChatSeqNbr(((prevChatSeqNbr) => prevChatSeqNbr + 1) );
        setChatList((prevChatList) => [...prevChatList, newChatName]);
        setActiveChat(newChatName);
        setChatHistory([]);
        setText('');
        setFile(null);
        setFileSelected(false);
        setDropzoneText('Drag \'n\' drop a CSV file here, or click to select one');

    };

    const switchChat = (chatName) => {
        console.log(`Chat Identifier: ${chatName}`);
        setActiveChat(chatName);
        const savedChatHistory = JSON.parse(localStorage.getItem(chatName)) || [];
        setChatHistory(savedChatHistory);
    };

    useEffect(() => {
        loadChatHistoryFromLocalStorage();
        scrollToBottom();
    }, [activeChat]);

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory]);

    useEffect(() => {
        saveChatListToLocalStorage();
        scrollToBottom();
    }, [chatList]);


    useEffect(() => {
        saveChatSeqNbrToLocalStorage();
        scrollToBottom();
    }, [chatSeqNbr]);

    return (
        <div className={classes.root}>
            <Container component="main" maxWidth="lg">
                <CssBaseline/>
                <Drawer
                    className={classes.drawer}
                    variant="permanent"
                    classes={{
                        paper: classes.drawerPaper,
                    }}
                >
                    <Button onClick={createNewChat}>
                        New Chat
                    </Button>
                    <List>
                        {chatList.map((chatIdentifier) => (
                            <ListItemButton key={chatIdentifier} onClick={() => switchChat(chatIdentifier)}>
                                <ListItemText primary={chatIdentifier}/>
                            </ListItemButton>
                        ))}
                    </List>
                </Drawer>
            </Container>
            <Container component="main" maxWidth="lg">
                <CssBaseline/>
                <Paper className={classes.formContainer} elevation={3}>
                    <Typography component="h1" variant="h5">
                        ChatDPTs
                    </Typography>
                    <div className={classes.chatContainer} ref={chatContainerRef}>
                        {chatHistory.map((chat, index) => (
                            <div key={index}>
                                <Typography variant="subtitle2" className={classes.messageLabel}>
                                    {chat.type === 'user' ? 'User:' : 'Response:'}
                                </Typography>
                                <div
                                    className={clsx(
                                        chat.type === 'user' ? classes.userMessage : classes.apiMessage,
                                    )}
                                >
                                    {chat.message}
                                </div>
                                {chat.type === 'api' &&
                                    <Divider variant="fullWidth"
                                             style={{margin: '10px 0', borderTop: '2px solid #ccc'}}/>
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
                                                    e.stopPropagation();
                                                    setFile(null);
                                                    setFileSelected(false);
                                                    setDropzoneText('Drag \'n\' drop a CSV file here, or click to select one');
                                                }}
                                                style={{
                                                    position: 'relative',
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
        </div>
    );
};

export default Form;
