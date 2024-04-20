import { useCookies } from 'react-cookie';
import React, { useState, useEffect } from 'react';
import { Form, Button, ProgressBar } from 'react-bootstrap';

const API_GET_ID = "/v1/id";
const API_GET_STATUS = "/v1/status?id="
const API_POST_VIDEO = "/v1/video/";
const API_GET_VIDEO = "/v1/video?id=";
const API_DEL_VIDEO = "/v1/video/";
const supportFormats = ['.avi', '.mp4', '.mov'];
const maxFileSize = 500*1024*1024;

export default function MainPage() {

    let sessionStatus = "new";
    const [cookies, setCookie, removeCookie] = useCookies(['sessionId']);
    const [uploadFile, setUploadFile] = useState({});
    const [fileValid, setFileValid] = useState(false);
    const [fileError, setFileError] = useState("");
    const [jobProgress, setJobProgress] = useState(0);
    const [inProgress, setInProgress] = useState(false);

    const getSessionId = async () => {
        try {
            const res = await fetch(API_GET_ID);
            if (!res.ok) {
                throw new Error('Getting new id failed');
            }
            const resBody = await res.json();
            setCookie('sessionId', resBody.id, {maxAge: 3600});
        }
        catch (err) {
            console.error(err);
        }
    }

    const getSessionStatus = async () => {
        try {
            const res = await fetch(API_GET_STATUS + cookies.sessionId);
            if (!res.ok) {
                throw new Error('Getting status failed');
            }
            const resBody = await res.json();
            sessionStatus = resBody.status;
            console.log(sessionStatus);
        }
        catch (err) {
            console.error(err);
        }
    }

    const updateFile = (e) => {
        setUploadFile({});
        setFileValid(false);
        if (e.target.files.length === 0) {
            setFileError("");
        } else if (e.target.files[0].size > maxFileSize) {
            setFileError("Please choose a file with smaller size");
        } else if (!supportFormats.includes(e.target.files[0].type.replace("video/","."))) {
            setFileError("Please choose a file with supported format")
        } else {
            setUploadFile(e.target.files[0]);
            setFileValid(true);
        }
    };

    const handleUpload = async () => {
        if (!fileValid) {
            return;
        }
        setInProgress(true);

        const formData = new FormData();
        formData.append(cookies.sessionId, uploadFile);

        let xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", ({loaded, total}) => {
            const progress = Math.floor(loaded / total * 100);
            setJobProgress(progress);
        });
        xhr.addEventListener("load", () => {
            setInProgress(false);

        });
        xhr.addEventListener("error", () => {
            throw new Error("upload failed");
        });
        xhr.open("POST", API_POST_VIDEO + cookies.sessionId); 
        xhr.send(formData);
    }

    const handleDelete = async () => {
        try {
            const res = await fetch(API_DEL_VIDEO + cookies.sessionId, { method: 'DELETE' });
            if (!res.ok) {
                throw new Error('Video deletion failed');
            }
            removeCookie('sessionId', { path: '/' });
        }
        catch (err) {
            console.error(err);
        }
    }

    if (cookies.sessionId) {
        getSessionStatus();
    } else {
        getSessionId();
    }

    return (
        <section className="main-sec">
            <div className='top-bar'>LOGO</div>
            <div className="container">
                <h1 className="heading">Spatial Tool</h1>
                <p className="description">Convert Side-By-Side 3D video to Spatial video</p>
                <div className='anime-zone'>
                    <Form.Group className={ !inProgress? 'dropbox':'hide' }>
                        <Form.Label>
                            Maximum size: 500 MB<br/>
                            {"Support formats: " + supportFormats.join(',')}
                        </Form.Label>
                        <Form.Control type="file" onChange={updateFile}  isInvalid={!fileValid}/>
                        <Form.Control.Feedback type="invalid"> {fileError} </Form.Control.Feedback>
                    </Form.Group>
                    <div className={ inProgress? 'job-status':'hide' }>
                        {sessionStatus}
                        <ProgressBar animated now={jobProgress} />
                    </div>
                </div>
                <Button className="button" variant="primary" onClick={handleUpload} disabled={!fileValid}>
                    Upload
                </Button>
                <Button href={API_GET_VIDEO + cookies.sessionId} className="button" variant="success" disabled={!fileValid}>
                    Download
                </Button>
                <Button className="button" variant="danger" onClick={handleDelete} disabled={!fileValid}>
                    Delete
                </Button>
                <div className="note">
                    <p id="line">How to use this tool:</p>
                    <p id="line">1. Choose the type of source video.</p>
                    <p id="line">2. Upload the video file.</p>
                    <p id="line">3. Download the converted video.</p>
                    <p id="line">4. Delete the converted video.</p>
                    <p id="line">5. Let's convert another one!</p>
                </div>
            </div>
        </section>
    )
}
