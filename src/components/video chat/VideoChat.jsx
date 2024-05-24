import React, { useEffect, useRef, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Peer from "simple-peer";
import io from "socket.io-client";
import { IconButton, TextField, Button } from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { PhoneIcon } from "@heroicons/react/24/outline";
import "../../App.css";

const socket = io.connect('http://localhost:5000');

function Hero() {
    const [me, setMe] = useState("");
    const [stream, setStream] = useState(null);
    const [receivingCall, setReceivingCall] = useState(false);
    const [caller, setCaller] = useState("");
    const [callerSignal, setCallerSignal] = useState(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [idToCall, setIdToCall] = useState("");
    const [callEnded, setCallEnded] = useState(false);
    const [name, setName] = useState("");
    const myVideo = useRef(null);  // Updated ref initialization
    const userVideo = useRef(null);  // Updated ref initialization
    const connectionRef = useRef(null);

    useEffect(() => {
        const getMediaStream = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                console.log('Stream obtained:', stream);
                setStream(stream);
                if (myVideo.current) {
                    myVideo.current.srcObject = stream;
                }
            } catch (error) {
                console.error('Error accessing media devices.', error);
            }
        };

        getMediaStream();

        socket.on("me", (id) => {
            setMe(id);
            console.log('My socket ID:', id);
        });

        socket.on("callUser", (data) => {
            setReceivingCall(true);
            setCaller(data.from);
            setName(data.name);
            setCallerSignal(data.signal);
            console.log('Incoming call from:', data.from);
        });

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            socket.off("me");
            socket.off("callUser");
        };
    }, []);

    const callUser = (id) => {
        console.log('Calling user:', id);
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: stream
        });

        peer.on("signal", (data) => {
            socket.emit("callUser", {
                userToCall: id,
                signalData: data,
                from: me,
                name: name
            });
            console.log('Signal sent:', data);
        });

        peer.on("stream", (stream) => {
            console.log('Receiving stream:', stream);
            if (userVideo.current) {
                userVideo.current.srcObject = stream;
            }
        });

        peer.on("error", (err) => console.error('Peer error:', err));

        socket.on("callAccepted", (signal) => {
            setCallAccepted(true);
            console.log('Call accepted');
            peer.signal(signal);
        });

        connectionRef.current = peer;
    };

    const answerCall = () => {
        setCallAccepted(true);
        console.log('Answering call from:', caller);
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: stream
        });

        peer.on("signal", (data) => {
            socket.emit("answerCall", { signal: data, to: caller });
            console.log('Answer signal sent:', data);
        });

        peer.on("stream", (stream) => {
            console.log('Receiving stream:', stream);
            if (userVideo.current) {
                userVideo.current.srcObject = stream;
            }
        });

        peer.on("error", (err) => console.error('Peer error:', err));

        peer.signal(callerSignal);
        connectionRef.current = peer;
    };

    const leaveCall = () => {
        setCallEnded(true);
        console.log('Call ended');
        if (connectionRef.current) {
            connectionRef.current.destroy();
        }
        setCallAccepted(false);
        setReceivingCall(false);
        setCaller("");
        setCallerSignal(null);
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        setStream(null);
        setMe("");
    };

    return (
        <>
            <h1 style={{ textAlign: "center", color: '#fff' }}>Zoomish</h1>
            <div className="container">
                <div className="video-container">
                    <div className="video">
                        {stream && <video playsInline muted ref={myVideo} autoPlay style={{ width: "300px" }} />}
                    </div>
                    <div className="video">
                        {callAccepted && !callEnded && (
                            <video playsInline ref={userVideo} autoPlay style={{ width: "300px" }} />
                        )}
                    </div>
                </div>
                <div className="myId">
                    <TextField
                        id="filled-basic"
                        label="Name"
                        variant="filled"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{ marginBottom: "20px" }}
                    />
                    <CopyToClipboard text={me} style={{ marginBottom: "2rem" }}>
                        <Button variant="contained" color="primary" startIcon={<AssignmentIcon fontSize="large" />}>
                            Copy ID
                        </Button>
                    </CopyToClipboard>

                    <TextField
                        id="filled-basic"
                        label="ID to call"
                        variant="filled"
                        value={idToCall}
                        onChange={(e) => setIdToCall(e.target.value)}
                    />
                    <div className="call-button">
                        {callAccepted && !callEnded ? (
                            <Button variant="contained" color="secondary" onClick={leaveCall}>
                                End Call
                            </Button>
                        ) : (
                            <IconButton color="primary" aria-label="call" onClick={() => callUser(idToCall)}>
                                <PhoneIcon fontSize="large" />
                            </IconButton>
                        )}
                        {idToCall}
                    </div>
                </div>
                <div>
                    {receivingCall && !callAccepted ? (
                        <div className="caller">
                            <h1>{name} is calling...</h1>
                            <Button variant="contained" color="primary" onClick={answerCall}>
                                Answer
                            </Button>
                        </div>
                    ) : null}
                </div>
            </div>
        </>
    );
}

export default Hero;
