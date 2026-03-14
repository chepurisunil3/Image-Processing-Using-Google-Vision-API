import { useEffect, useRef, useState } from "react";
import {
  API_BASE_URL,
  getPreviousData,
  getTextFromImage,
} from "../api/apicalls";
import "./Main.css";

function Main({ userData }) {
  const [fileName, setFileName] = useState("");
  const [isTextProcessed, setIsTextProcessed] = useState(false);
  const [processedText, setProcessedText] = useState("");
  const [previousData, setPreviousData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(null);
  const fileInputRef = useRef(null);

  const loadHistory = async () => {
    const data = await getPreviousData(userData.email);
    if (data.success) {
      setPreviousData(Array.isArray(data.data) ? data.data : []);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [userData.email]);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const fileChanged = async (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    setFileName(selectedFile.name);
    setIsTextProcessed(false);
    setSelectedHistoryIndex(null);
    setPreviewImage(URL.createObjectURL(selectedFile));
    setIsProcessing(true);

    try {
      const response = await getTextFromImage(userData.email, selectedFile);
      if (response.success) {
        setIsTextProcessed(true);
        setProcessedText(response.text || "");
        await loadHistory();
      }
    } finally {
      setIsProcessing(false);
      event.target.value = "";
    }
  };

  const selectHistory = (index) => {
    setSelectedHistoryIndex(index);
    setIsTextProcessed(true);
    setProcessedText(previousData[index]?.text || "");
  };

  const selectedHistory =
    selectedHistoryIndex !== null ? previousData[selectedHistoryIndex] : null;
  const uploadedImageSrc = selectedHistory
    ? `${API_BASE_URL}/${selectedHistory.file}`
    : previewImage;

  return (
    <>
      <div className="main-content">
        <aside className="left-content">
          <div className="section-head">
            <h4>Previous Extractions</h4>
            <span>{previousData.length} items</span>
          </div>
          <div className="history-data">
            {previousData.length === 0 ? (
              <p className="empty-history">
                Your processed results will appear here after uploading an
                image.
              </p>
            ) : (
              previousData.map((oneData, index) => (
                <button
                  type="button"
                  className={`history-item ${
                    selectedHistoryIndex === index ? "active" : ""
                  }`}
                  key={`${oneData.imageId}-${index}`}
                  onClick={() => selectHistory(index)}
                >
                  <span className="history-title">
                    {(oneData.text || "").substring(0, 60) || "No text found"}
                  </span>
                  <span className="history-meta">ID #{oneData.imageId}</span>
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="right-content">
          <div className="upload-card">
            <h3>Upload an Image</h3>
            <p>
              Supported formats include common image files. Once uploaded, text
              extraction starts automatically.
            </p>
          </div>

          <div className="image-file">
            <input
              type="text"
              name="filename"
              value={fileName}
              placeholder="No file selected"
              readOnly
            />
            <button type="button" onClick={openFilePicker}>
              Choose a File
            </button>
            <input
              ref={fileInputRef}
              onChange={fileChanged}
              id="imageFile"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
            />
          </div>

          <div className="processed-text">
            <div className="processed-headings">
              <h4>Uploaded Image</h4>
              <h4>Processed Text</h4>
            </div>

            <div className="processed-body">
              <div className="image-panel">
                {uploadedImageSrc ? (
                  <img
                    id="uploadedImage"
                    src={uploadedImageSrc}
                    alt="uploaded"
                  />
                ) : (
                  <p className="image-placeholder">
                    Select a file to preview your uploaded image.
                  </p>
                )}
              </div>

              <div className="text-panel">
                {isTextProcessed ? (
                  <p>{processedText}</p>
                ) : (
                  <p className="text-placeholder">
                    Processed text will appear here after extraction.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
      <div
        className="popup"
        style={{ display: isProcessing ? "flex" : "none" }}
      >
        <div className="popup-card">
          <h4>Processing Image...</h4>
          <p>Please wait while we extract text from your upload.</p>
        </div>
      </div>
    </>
  );
}

export default Main;
