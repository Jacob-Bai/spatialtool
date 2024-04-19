import { Dropzone, FileMosaic } from "@files-ui/react";
import { useCookies } from 'react-cookie';
import React, { useState, useEffect } from "react";


const API_URL = "/v1";

function handleDownload() { }
function handleDelete() { }

export default function MainPage() {

    let sessionStatus = "empty";
    const [cookies, setCookie] = useCookies(['sessionId']);
    const [extFiles, setExtFiles] = useState([]);

    const getSessionId = async () => {
        try {
            const res = await fetch(API_URL + '/id');
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
            const res = await fetch(API_URL + '/status?id=' + cookies.sessionId);
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
    const updateFile = (files) => {
        setExtFiles(files);
    };
    const handleStart = async (filesToUpload) => {
        console.log("advanced demo start upload id:", cookies.sessionId);
    };
    const handleFinish = (uploadedFiles) => {
        console.log("advanced demo finish upload", uploadedFiles);
    };

    if (cookies.sessionId) {
        getSessionStatus();
    } else {
        getSessionId();
    }

    return (
        <section className="main-sec">
            <div className="container">
                <h1 className="heading">Spatial Tool</h1>
                <p className="description">Convert Side-By-Side 3D video to Spatial video</p>
                <div className="dropbox">
                    <Dropzone minHeight="210px" maxFiles={1} maxFileSize={500 * 1024 * 1024}
                        onChange={updateFile} value={extFiles} accept=".avi,.mp4,.mov"
                        label="Drop file here or click to browse"
                        uploadConfig={{
                            url: API_URL + "/video/" + cookies.sessionId,
                            uploadLabel: cookies.sessionId,
                            cleanOnUpload: true,
                            uploadingMessage: "uploading test"
                        }}
                        footerConfig={{uploadProgressMessage: false}}
                        onUploadStart={handleStart}
                        onUploadFinish={handleFinish}
                        actionButtons={{
                            position: "after",
                            uploadButton: { resetStyles: true, className: "upload-button" }
                        }}
                        behaviour="replace" >
                        {extFiles.map((file) => (
                            <FileMosaic {...file} />
                        ))}
                    </Dropzone>
                </div>
                <button className="button" onClick={handleDownload}>Download</button>
                <button className="button" onClick={handleDelete}>Delete</button>
                <div className="note">
                    <p id="line">How to use this tool:</p>
                    <p id="line">1. Choose the type of source video.</p>
                    <p id="line">2. Upload the video file.</p>
                    <p id="line">3. Download or delete the converted video.</p>
                    <p id="line">4. Let's convert another one!</p>
                </div>
            </div>
        </section>
    )
}
