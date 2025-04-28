'use client';

import { useState, useRef, useEffect } from 'react'; // Import useRef, useEffect
import { Download, LoaderCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // Adjust path if needed

interface DownloadIconProps { // Rename interface (optional but good practice)
  imageUrl: string | null;
  filename: string;
}

// Rename the function export
export default function DownloadIcon({ imageUrl, filename }: DownloadIconProps) { // Renamed here
  const [isDownloading, setIsDownloading] = useState(false);
  const workerRef = useRef<Worker | null>(null); // Ref to hold the worker instance

  // Adjust filename for PDF extension (remove original .png if present)
  const pdfFilename = filename.replace(/\.[^/.]+$/, "") + ".pdf";

  // Cleanup worker on component unmount
  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const handleDownload = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!imageUrl || isDownloading) return;

    setIsDownloading(true); // Show spinner

    try {
      // --- Preload image on main thread to get dimensions ---
      const img = new window.Image();
      img.src = imageUrl;
      img.onload = () => {
        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;

        // --- Initialize and communicate with Worker ---
        // Ensure worker path is correct relative to the public folder
        workerRef.current = new Worker('/pdf.worker.js');

        workerRef.current.onmessage = (e) => {
          const { success, pdfBlob, filename: workerFilename, error } = e.data;

          if (success && pdfBlob) {
            // Create link and trigger download
            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', workerFilename || pdfFilename); // Use filename from worker or fallback
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          } else {
            console.error("PDF Generation Error:", error);
            alert(`Sorry, the PDF could not be generated: ${error || 'Unknown worker error'}`);
          }

          setIsDownloading(false); // Hide spinner
          workerRef.current?.terminate(); // Clean up worker
          workerRef.current = null;
        };

        workerRef.current.onerror = (e) => {
          console.error("Worker Error:", e);
          alert("An error occurred with the PDF generation worker.");
          setIsDownloading(false);
          workerRef.current?.terminate();
          workerRef.current = null;
        };

        // Send data (including dimensions) to worker
        workerRef.current.postMessage({
          imageUrl,
          filename: pdfFilename, // Send original base filename
          imgWidth,
          imgHeight
        });
      };
      img.onerror = () => {
        alert("Failed to load image data to determine dimensions.");
        setIsDownloading(false);
      };
    } catch (error) {
      console.error("Download setup error:", error);
      alert("Could not start the download process.");
      setIsDownloading(false);
    }
  };

  if (!imageUrl) {
    return null;
  }

  // ... JSX remains the same ...
  return (
    <div className="inline-flex items-center justify-center h-7 w-7"> {/* Adjust size as needed */}
      {isDownloading ? (
        <LoaderCircle className="h-5 w-5 animate-spin text-gray-500" /> // Spinner shown directly
      ) : (
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleDownload}
                // No need for disabled prop here as the button is replaced
                className="p-1 rounded-full text-gray-500 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors duration-150"
                aria-label="Download image as PDF"
              >
                <Download className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Download PDF</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
} 