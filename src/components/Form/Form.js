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

const drawerWidth = 200;

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
    const [activeChat, setActiveChat] = useState("");
    const [chatList, setChatList] = useState([]);
    const chatContainerRef = useRef(null);
    const [chatSeqNbr, setChatSeqNbr] = useState(0);
    // const [selectedChat, setSelectedChat] = useState(null);
    const [chatState, setChatState] = useState({"step": 0, "completed": false, "data": {}});


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

    const handleChatState = async (newState) => {
        console.log(`before ${chatState.step} ;  ${chatState.completed} ; ${chatState.data}`);
        if (newState.completed) {
            chatState.completed = true;
            // Update the chat state with new data
            setChatState(newState);
        }

        console.log(`After ${chatState.step} ;  ${chatState.completed} ; ${chatState.data}`);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!fileSelected) {
            // Display an alert if a file is required but not selected
            window.alert("Please select a file.");
            return;
        }

        addUserMessage(text);

        const formData = new FormData();
        formData.append('input', text);
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:5000/process_chat/', formData, {
                headers: {'Content-Type': 'multipart/form-data'},
            });

            addApiMessage(response.data.message);
            await handleChatState(response.data.state);


        } catch (error) {
            console.error(error);
            addApiMessage(`Error: ${error.response.data.message}`);
        }

        saveChatHistoryToLocalStorage();
        await setText('');

    };

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    const saveChatSeqNbrToLocalStorage = () => {
        localStorage.setItem("ChatSeqNbr", JSON.stringify(chatSeqNbr));
    };

    const loadChatSeqNbrFromLocalStorage = async () => {
        const temp = JSON.parse(localStorage.getItem("ChatSeqNbr")) || 5;
        await setChatSeqNbr(temp);
    };


    const saveChatHistoryToLocalStorage = () => {
        localStorage.setItem(activeChat, JSON.stringify(chatHistory));
    };

    const loadChatHistoryFromLocalStorage = async (chatName) => {
        const savedChatHistory = JSON.parse(localStorage.getItem(chatName)) || [];
        await setChatHistory(savedChatHistory);
        return savedChatHistory;
    };

    const saveChatListToLocalStorage = async () => {
        await localStorage.setItem("ChatList", JSON.stringify(chatList));
    };

    const loadChatListFromLocalStorage = async () => {
        const savedChatList = JSON.parse(localStorage.getItem("ChatList"));
        await setChatList(savedChatList);
    };


    const createNewChat = async () => {
        await loadChatSeqNbrFromLocalStorage();
        await loadChatListFromLocalStorage();
        console.log(`Chat List: ${chatList}, Active Chat ${activeChat}, chatSeqNbr ${chatSeqNbr}`);
        const newChatName = `Chat ${chatSeqNbr + 1}`;
        await setChatSeqNbr(((prevChatSeqNbr) => prevChatSeqNbr + 1));
        console.log(`Chat Seq Nbr: ${chatSeqNbr}`);
        saveChatSeqNbrToLocalStorage();
        await setChatList((prevChatList) => [...prevChatList, newChatName]);
        await setActiveChat(newChatName);
        await setChatHistory([]);
        await setText('');
        await setFile(null);
        await setFileSelected(false);
        await setDropzoneText('Drag \'n\' drop a CSV file here, or click to select one');
        console.log(`After Create New - Chat List: ${chatList}, Active Chat ${activeChat}, chatSeqNbr ${chatSeqNbr}`);

    };

    const switchChat = async (chatName) => {
        console.log(`Chat Identifier: ${chatName}`);
        await setActiveChat(chatName);
        const savedChatHistory = loadChatHistoryFromLocalStorage(chatName);
        console.log(`savedChatHistory ${savedChatHistory}`);
    };

    useEffect(async () => {
        // Load chatList from local storage on app load
        await loadChatListFromLocalStorage();
        await loadChatSeqNbrFromLocalStorage();
        await setActiveChat("Chat 1");

    }, []); // Empty dependency array ensures this effect runs only once on mount


    useEffect(() => {
        loadChatHistoryFromLocalStorage(activeChat);
        scrollToBottom();
    }, [activeChat]);

    useEffect(() => {
        saveChatHistoryToLocalStorage()
        scrollToBottom();
    }, [chatHistory]);

    useEffect(() => {
        saveChatListToLocalStorage();
        scrollToBottom();
    }, [chatList]);


    useEffect(() => {
        scrollToBottom();
    }, [chatSeqNbr, chatState]);

    return (
        <div className={classes.root}>

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

            {chatList.length > 0 && (
                <Container component="main" maxWidth="lg">
                    <CssBaseline/>
                    <h2 align="center">ChatDPT - A Data Population Tool</h2>
                    <Paper className={classes.formContainer} elevation={3}>
                        <Typography component="h1" variant="h5">
                            {activeChat}
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
                                fullWidth
                                id="text"
                                label="Text"
                                name="text"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                required
                            />
                            <Dropzone
                                onDrop={handleDrop}
                                accept=".csv"
                                multiple={false}
                                required
                            >
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
            )}
        </div>
    );
};

export default Form;
