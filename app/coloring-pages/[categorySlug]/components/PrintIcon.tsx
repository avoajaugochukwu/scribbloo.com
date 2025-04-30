'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from 'react';
import { Printer, LoaderCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from 'sonner';

interface PrintIconProps {
  imageUrl: string | null;
  filename: string; // Keep filename for consistency
}

export default function PrintIcon({ imageUrl, filename }: PrintIconProps) {
  const [isPreparingPrint, setIsPreparingPrint] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  const pdfFilename = filename.replace(/\.[^/.]+$/, "") + ".pdf";

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const handlePrint = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!imageUrl || isPreparingPrint) return;

    setIsPreparingPrint(true);

    try {
      const img = new window.Image();
      img.onload = () => {
        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;

        workerRef.current?.terminate();

        // workerRef.current = new Worker('/pdf.worker.js');
        workerRef.current = new window.Worker('/pdf.worker.js');

        workerRef.current.onmessage = (e) => {
          const { success, pdfBlob, error } = e.data;

          if (success && pdfBlob) {
            try {
              const url = URL.createObjectURL(pdfBlob);

              const pdfWindow = window.open(url, '_blank');

              if (pdfWindow) {
                pdfWindow.focus();
                setTimeout(() => {
                  try {
                    pdfWindow.print();
                  } catch (printError) {
                    console.warn("Auto-print trigger failed (likely browser security restriction):", printError);
                    toast.error("Opened PDF in a new tab. Please use the browser's print command (Ctrl+P or Cmd+P) if the print dialog didn't appear automatically.");
                  }
                  URL.revokeObjectURL(url);
                }, 1500);
              } else {
                toast.error("Could not open PDF for printing. Please check your popup blocker settings.");
                URL.revokeObjectURL(url);
              }
            } catch (blobError) {
              console.error("Error handling PDF blob for printing:", blobError);
              toast.error("Could not process the generated PDF for printing.");
            }
          } else {
            console.error("PDF Generation Error from Worker (Print):", error);
            toast.error(`Sorry, the PDF for printing could not be generated: ${error || 'Unknown worker error'}`);
          }

          setIsPreparingPrint(false);
          workerRef.current?.terminate();
          workerRef.current = null;
        };

        workerRef.current.onerror = (e) => {
          console.error("Print Worker Error Event:", e);
          toast.error(`An error occurred with the PDF generation worker for printing: ${e.message}. Check console.`);
          setIsPreparingPrint(false);
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
        toast.error("Failed to load image data to determine dimensions for printing.");
        setIsPreparingPrint(false);
      };
      img.src = imageUrl;
    } catch (error: any) {
      console.error("Print setup error:", error);
      toast.error(`Could not start the print process: ${error.message || 'Unknown error'}`);
      setIsPreparingPrint(false);
    }
  };

  if (!imageUrl) {
    return null;
  }

  return (
    <div className="inline-flex items-center justify-center h-7 w-7">
      {isPreparingPrint ? (
        <LoaderCircle className="h-5 w-5 animate-spin text-gray-500" />
      ) : (
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handlePrint}
                disabled={isPreparingPrint}
                className="p-1 rounded-full text-gray-500 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Print image"
              >
                <Printer className="h-6 w-6" strokeWidth={1.5} cursor="pointer" />
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