'use client';

import { useState, useRef, useEffect } from 'react';
import { Printer, LoaderCircle } from 'lucide-react'; // Use LoaderCircle for consistency
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PrintIconProps {
  imageUrl: string | null;
  imageTitle?: string; // Keep for potential future use, though less relevant now
  filename: string; // Need filename base for worker consistency
}

export default function PrintIcon({ imageUrl, imageTitle = "Coloring Page", filename }: PrintIconProps) {
  const [isPreparingPrint, setIsPreparingPrint] = useState(false);
  const workerRef = useRef<Worker | null>(null); // Ref for the worker

  // Adjust filename for PDF extension (worker expects this format)
  const pdfFilename = filename.replace(/\.[^/.]+$/, "") + ".pdf";

  // Cleanup worker on component unmount
  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const handlePrint = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!imageUrl || isPreparingPrint) return;

    setIsPreparingPrint(true); // Show spinner

    try {
      // --- Preload image on main thread to get dimensions ---
      const img = new window.Image();
      img.src = imageUrl;
      img.onload = () => {
        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;

        // --- Initialize and communicate with Worker ---
        workerRef.current = new Worker('/pdf.worker.js'); // Path to your worker

        workerRef.current.onmessage = (e) => {
          const { success, pdfBlob, error } = e.data;

          if (success && pdfBlob) {
            try {
              // Create an Object URL for the PDF Blob
              const url = URL.createObjectURL(pdfBlob);

              // Open the PDF in a new tab
              const pdfWindow = window.open(url, '_blank');

              if (pdfWindow) {
                 // Focus the new window (optional)
                 pdfWindow.focus();
                 // Attempt to trigger print dialog after a short delay
                 // NOTE: This is often blocked by browsers! User might need to print manually.
                 setTimeout(() => {
                    try {
                        pdfWindow.print();
                    } catch (printError) {
                        console.warn("Auto-print trigger failed (likely browser security restriction):", printError);
                    }
                    // Revoke URL after print attempt / delay
                    URL.revokeObjectURL(url);
                 }, 1000); // Delay to allow PDF viewer to load

              } else {
                 // Fallback if window opening failed (e.g., popup blocker)
                 alert("Could not open PDF. Please check your popup blocker settings.");
                 URL.revokeObjectURL(url); // Clean up URL
              }

            } catch(blobError) {
                console.error("Error handling PDF blob:", blobError);
                alert("Could not process the generated PDF.");
            }

          } else {
            console.error("PDF Generation Error:", error);
            alert(`Sorry, the PDF for printing could not be generated: ${error || 'Unknown worker error'}`);
          }

          setIsPreparingPrint(false); // Hide spinner
          workerRef.current?.terminate(); // Clean up worker
          workerRef.current = null;
        };

        workerRef.current.onerror = (e) => {
          console.error("Worker Error:", e);
          alert("An error occurred with the PDF generation worker.");
          setIsPreparingPrint(false);
          workerRef.current?.terminate();
          workerRef.current = null;
        };

        // Send data (including dimensions) to worker
        // Worker needs 'filename' even if we don't use it directly here
        workerRef.current.postMessage({
          imageUrl,
          filename: pdfFilename,
          imgWidth,
          imgHeight
        });
      };
      img.onerror = () => {
        alert("Failed to load image data to determine dimensions for printing.");
        setIsPreparingPrint(false);
      };
    } catch (error) {
      console.error("Print setup error:", error);
      alert("Could not start the print process.");
      setIsPreparingPrint(false);
    }
  };

  if (!imageUrl) {
    return null;
  }

  // --- JSX ---
  return (
    <div className="inline-flex items-center justify-center h-7 w-7"> {/* Container */}
      {isPreparingPrint ? (
        <LoaderCircle className="h-5 w-5 animate-spin text-gray-500" /> // Spinner
      ) : (
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handlePrint}
                className="p-1 rounded-full text-gray-500 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors duration-150"
                aria-label="Print image"
              >
                <Printer className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Print</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
} 