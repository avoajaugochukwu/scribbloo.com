'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from 'react';
import { Download, LoaderCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DownloadIconProps {
  imageUrl: string | null;
  filename: string;
}

export default function DownloadIcon({ imageUrl, filename }: DownloadIconProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  const pdfFilename = filename.replace(/\.[^/.]+$/, "") + ".pdf";

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const handleDownload = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!imageUrl || isDownloading) return;

    setIsDownloading(true);

    try {
      const img = new window.Image();
      img.onload = () => {
        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;

        workerRef.current?.terminate();

        // workerRef.current = new Worker('/pdf.worker.js');
        workerRef.current = new window.Worker('/pdf.worker.js');

        workerRef.current.onmessage = (e) => {
          const { success, pdfBlob, filename: workerFilename, error } = e.data;

          if (success && pdfBlob) {
            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', workerFilename || pdfFilename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          } else {
            console.error("PDF Generation Error from Worker:", error);
            alert(`Sorry, the PDF could not be generated: ${error || 'Unknown worker error'}`);
          }

          setIsDownloading(false);
          workerRef.current?.terminate();
          workerRef.current = null;
        };

        workerRef.current.onerror = (e) => {
          console.error("Worker Error Event:", e);
          alert(`An error occurred initializing or running the PDF generation worker: ${e.message}. Check the console for details.`);
          setIsDownloading(false);
          workerRef.current?.terminate();
          workerRef.current = null;
        };

        workerRef.current.postMessage({
          imageUrl,
          filename: pdfFilename,
          imgWidth,
          imgHeight
        });
      };
      img.onerror = () => {
        alert("Failed to load image data to determine dimensions.");
        setIsDownloading(false);
      };
      img.src = imageUrl;

    } catch (error: any) {
      console.error("Download setup error:", error);
      alert(`Could not start the download process: ${error.message || 'Unknown error'}`);
      setIsDownloading(false);
    }
  };

  if (!imageUrl) {
    return null;
  }

  return (
    <div className="inline-flex items-center justify-center h-7 w-7">
      {isDownloading ? (
        <LoaderCircle className="h-5 w-5 animate-spin text-gray-500" />
      ) : (
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="p-1 rounded-full text-gray-500 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
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