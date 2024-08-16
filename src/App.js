import React, { useState, useEffect } from "react";
import "./App.css";
import Replicate from "replicate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleDown,
  faTrashCan,
  faCog,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";

function App() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedImages, setSavedImages] = useState([]);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState(process.env.REACT_APP_REPLICATE_API_KEY);
  const [showFullPrompt, setShowFullPrompt] = useState({});
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [currentImageUrl, setCurrentImageUrl] = useState("");

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("response")) || [];
    setSavedImages(saved);
  }, []);

  const replicate = new Replicate({
    auth: apiKey,
  });

  const generateImage = async () => {

    if (!apiKey) {
      alert("Please enter a valid API key!");
      return;
    }

    const input = {
      prompt: prompt,
      go_fast: true,
      num_outputs: 1,
      aspect_ratio: "1:1",
      output_format: "webp",
      output_quality: 80,
    };

    setLoading(true);

    try {
      const output = await replicate.run("black-forest-labs/flux-schnell", {
        input,
      });

      console.log(output);

      const saved = JSON.parse(localStorage.getItem("response")) || [];
      const newEntry = { prompt: prompt, url: output[0] };
      saved.push(newEntry);
      localStorage.setItem("response", JSON.stringify(saved));

      setImageUrl(output[0]);
      setSavedImages(saved);
    } catch (error) {
      console.error("Error generating image:", error);
      alert(
        "Failed to generate image. Please check the console for more details."
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = (url) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = "generated_image.webp";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteImage = (index) => {
    const updatedImages = savedImages.filter((_, i) => i !== index);
    setSavedImages(updatedImages);
    localStorage.setItem("response", JSON.stringify(updatedImages));
  };

  const toggleSettingsModal = () => {
    setIsSettingsModalOpen(!isSettingsModalOpen);
  };

  const handleModalClick = (e) => {
    if (e.target === e.currentTarget) {
      toggleSettingsModal();
    }
  };

  const handleApiKeyChange = (e) => {
    setApiKey(e.target.value);
    localStorage.setItem("replicateApiKey", e.target.value);
  };

  const toggleShowFullPrompt = (index) => {
    setCurrentPrompt(savedImages[index].prompt);
    setCurrentImageUrl(savedImages[index].url);
    setIsPromptModalOpen(true);
  };

  const closePromptModal = () => {
    setIsPromptModalOpen(false);
  };

  return (
    <div className="App flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-gray-500 via-gray-600 to-gray-700 py-20">
      <nav className="w-full bg-gray-800 shadow-md py-4 fixed top-0 z-10">
        <div className="mx-auto flex justify-around items-center px-4">
          <h1 className="text-2xl font-bold text-white">AI Image Generator</h1>
          <div className="flex items-center">
            <FontAwesomeIcon
              onClick={toggleSettingsModal}
              icon={faCog}
              className="settings-icon cursor-pointer text-xl ml-4 text-white"
            />
          </div>
        </div>
      </nav>
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mt-32">
        <textarea
          type="text"
          placeholder="Enter a prompt"
          className="mb-4 p-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={prompt}
          style={{ height: "auto", minHeight: "5rem" }}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button
          onClick={generateImage}
          className={`mb-4 p-2 w-full text-white rounded transition duration-300 ${
            loading || !(prompt?.trim()) ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-700"
          }`}
          disabled={loading || !(prompt?.trim())}
        >
          {loading ? "Generating..." : "Generate Image"}
        </button>
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Generated"
            className="max-w-full h-auto border border-gray-300 rounded mt-4"
          />
        )}
      </div>
      {savedImages.length > 0 && (
        <div className="saved-images mt-8 w-full max-w-4xl">
          <h2 className="text-2xl font-bold mb-4 text-white">Generated Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedImages
              .map((entry, index) => (
                <div
                  key={index}
                  className="saved-image-entry relative p-4 bg-white rounded-lg shadow-lg group"
                >
                  <img
                    src={entry.url}
                    alt={`Saved ${index}`}
                    className="max-w-full h-auto border border-gray-300 rounded shadow-lg"
                  />
                  <p className="prompt-text mt-2 text-center text-lg font-semibold text-gray-700">
                    {showFullPrompt[index]
                      ? entry.prompt
                      : `${entry.prompt.substring(0, 50)}...`}
                  </p>
                  <button
                    onClick={() => toggleShowFullPrompt(index)}
                    className="text-blue-500 underline text-sm"
                  >
                    Show More
                  </button>
                  <div className="icon-container absolute top-2 right-2 flex space-x-4 bg-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <FontAwesomeIcon
                      onClick={() => downloadImage(entry.url)}
                      icon={faCircleDown}
                      className="download-icon cursor-pointer text-xl"
                    />
                    <FontAwesomeIcon
                      onClick={() => deleteImage(index)}
                      icon={faTrashCan}
                      className="delete-icon cursor-pointer text-xl"
                    />
                  </div>
                </div>
              ))
              .reverse()}
          </div>
        </div>
      )}
      {isSettingsModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={handleModalClick}
        >
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
            <FontAwesomeIcon
              onClick={toggleSettingsModal}
              icon={faCircleXmark}
              className="absolute top-2 right-2 cursor-pointer text-xl"
            />
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2 text-left">
                API Key
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={handleApiKeyChange}
                className="p-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-2">
                You can get your API key from{" "}
                <a
                  href="https://replicate.com/account/api-tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  Replicate Account
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      )}
      {isPromptModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={closePromptModal}
        >
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
            <FontAwesomeIcon
              onClick={closePromptModal}
              icon={faCircleXmark}
              className="absolute top-2 right-2 cursor-pointer text-xl"
            />
            <h2 className="text-2xl font-bold mb-4">Full Prompt</h2>
            <p className="text-gray-700">{currentPrompt}</p>
            <img
              src={currentImageUrl}
              alt="Full Prompt"
              className="max-w-full h-auto border border-gray-300 rounded mt-4"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
