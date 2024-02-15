import React, { useState } from 'react';
import axios from 'axios';
import JSZip from 'jszip';

function App() {
  const [videoUrls, setVideoUrls] = useState('');
  const [apiResponses, setApiResponses] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true); // Set loading to true when the download button is pressed

      const urls = videoUrls.split(',').map(url => url.trim());

      const responses = await Promise.all(
        urls.map(async (url) => {
          return await axios.get('https://tiktok-downloader-download-tiktok-videos-without-watermark.p.rapidapi.com/vid/index', {
            params: { url },
            headers: {
              'X-RapidAPI-Key': 'cca330428dmsh4b459b029c77e3cp1a7504jsn8f61efbba564',
              'X-RapidAPI-Host': 'tiktok-downloader-download-tiktok-videos-without-watermark.p.rapidapi.com'
            }
          });
        })
      );

      console.log('API Responses:', responses.map((response) => response.data));

      setApiResponses(responses.map((response) => response.data));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false); // Set loading to false when the API requests are complete
    }
  };

  const handleDownloadAll = async () => {
    try {
      const zip = new JSZip();

      await Promise.all(
        apiResponses.map(async (apiResponse, index) => {
          if (apiResponse && apiResponse.video && apiResponse.video.length > 0) {
            // Use responseType 'arraybuffer' to get the raw video data
            const response = apiResponse.video[0];
            const videoData = await axios.get(response, { responseType: 'arraybuffer' });

            // Create a Blob from the video data
            const videoBlob = new Blob([videoData.data], { type: 'video/mp4' });

            // Add the Blob to the ZIP file
            zip.file(`video_${index + 1}.mp4`, videoBlob);
          }
        })
      );

      // Generate the ZIP file
      const content = await zip.generateAsync({ type: 'blob' });

      // Trigger the download
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = 'videos.zip';
      link.click();
    } catch (error) {
      console.error(error);
    }
  };

  const shouldShowDownloadAllButton = apiResponses.length > 1; // Show button if there's more than one URL

  return (
    <div className="App text-white h-screen overflow-auto">
      <nav className='flex px-2 w-screen py-2 whitespace-nowrap'>
        <p>TikTok Downloader</p>
        
        <ul className='flex gap-3 ml-[70%]'>
          <li>About</li>
          <li>Contact</li>
          <li>Privacy Policy</li>
        </ul>
        
      </nav>
      <div className='text-center'>
        <h1 className='text-3xl'>TikTok Video Downloader</h1>
        <div>
          <input
            className='w-[40%] rounded-lg py-2 px-2 mt-4 text-black'
            placeholder='Enter one or more URLs with separate commas'
            value={videoUrls}
            onChange={(e) => setVideoUrls(e.target.value)}
          />
        </div>
        <button onClick={handleDownload} className='bg-yellow-600 hover:bg-yellow-700 px-3 py-2 rounded-lg mt-5 text-xl font-semibold'>
          Download Videos
        </button>
      
        {/* Show loader when loading is true */}
        {loading && (
          <div className="loader-container">
            <div className="loader"></div>
          </div>
        )}
      </div>
      
      {apiResponses.length > 0 && (
        
        <div className='mt-5'>
            <hr className='mt-3 mb-5' />
          {apiResponses.map((apiResponse, index) => (
            <div key={index} className='h-[400px] overflow-auto'>
              {apiResponse && apiResponse.video && apiResponse.video.length > 0 ? (
                <div className='text-center'>
                  <video className='ml-[30%] rounded h-[400px]' controls width="400" height="200">
                    <source src={apiResponse.video[0]} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <br />
                  <a href={apiResponse.video[0]} download={`video_${index + 1}`}>
                    <button className='bg-yellow-600 hover:bg-yellow-700 px-2 py-2 text-xl font-semibold rounded'>Download Video {index + 1}</button>
                  </a>
                </div>
              ) : (
                <p>No video found in the response for Video {index + 1}.</p>
              )}
            </div>
          ))}
          <br />
          {shouldShowDownloadAllButton && (
            <button onClick={handleDownloadAll}>Download All Videos (ZIP)</button>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
