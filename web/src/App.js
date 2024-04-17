import { Dropzone, FileMosaic } from "@files-ui/react";
import * as React from "react";
import './style.css';

const BASE_URL = "https://www.myserver.com";

function FileDropzone() {
    const [extFiles, setextFiles] = React.useState([]);

    const updateFile = (files) => {
        setextFiles(files);
    };
    const handleStart = (filesToUpload) => {
        console.log("advanced demo start upload", filesToUpload);
    };
    const handleFinish = (uploadedFiles) => {
        console.log("advanced demo finish upload", uploadedFiles);
    };
    return (
        <div className="dropbox">
            <Dropzone
                onChange={updateFile}
                minHeight="210px"
                value={extFiles}
                maxFiles={1}
                maxFileSize={500 * 1024 * 1024}
                label="Drop file here or click to browse"
                accept=".avi,.mp4,.mov"
                uploadConfig={{
                    // autoUpload: true
                    url: BASE_URL + "/file",
                    cleanOnUpload: true,
                    uploadingMessage: "uploading test"
                }}
                onUploadStart={handleStart}
                onUploadFinish={handleFinish}
                fakeUpload
                actionButtons={{
                    position: "after",
                    uploadButton: { resetStyles: true, className: "upload-button" }
                }}
                behaviour="replace"
            >
                {extFiles.map((file) => (
                    <FileMosaic {...file} />
                ))}
            </Dropzone>
        </div>
    );
}

function handleDownload() { }
function handleDelete() { }

export default function main() {
    return (
        <section className="main-sec">
            <div className="container">
                <h1 className="heading">Spatial Tool</h1>
                <p className="description">Convert Side-By-Side 3D video to Spatial video</p>
                <FileDropzone />
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
