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
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

interface DownloadIconProps {
  imageUrl: string | null;
  filename: string;
  /** 'icon' (compact), 'button' (labeled, detail pages), 'mini' (labelled pill), 'overlay' (round icon on a card). */
  variant?: 'icon' | 'button' | 'mini' | 'overlay';
  /** draw an ink frame around the page in the generated PDF (user choice). */
  border?: boolean;
}

export default function DownloadIcon({ imageUrl, filename, variant = 'icon', border = false }: DownloadIconProps) {
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
            toast.error(`Sorry, the PDF could not be generated: ${error || 'Unknown worker error'}`);
          }

          setIsDownloading(false);
          workerRef.current?.terminate();
          workerRef.current = null;
        };

        workerRef.current.onerror = (e) => {
          console.error("Worker Error Event:", e);
          toast.error(`An error occurred initializing or running the PDF generation worker: ${e.message}. Check the console for details.`);
          setIsDownloading(false);
          workerRef.current?.terminate();
          workerRef.current = null;
        };

        workerRef.current.postMessage({
          imageUrl,
          filename: pdfFilename,
          imgWidth,
          imgHeight,
          border
        });
      };
      img.onerror = () => {
        toast.error("Failed to load image data to determine dimensions.");
        setIsDownloading(false);
      };
      img.src = imageUrl;

    } catch (error: any) {
      console.error("Download setup error:", error);
      toast.error(`Could not start the download process: ${error.message || 'Unknown error'}`);
      setIsDownloading(false);
    }
  };

  if (!imageUrl) {
    return null;
  }

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={handleDownload}
        disabled={isDownloading}
        className={cn(buttonVariants({ size: 'xl' }))}
        aria-label="Download image as PDF"
      >
        {isDownloading ? (
          <LoaderCircle className="animate-spin" />
        ) : (
          <Download strokeWidth={2} />
        )}
        {isDownloading ? 'Preparing…' : 'Download PDF'}
      </button>
    );
  }

  if (variant === 'mini') {
    return (
      <button
        type="button"
        onClick={handleDownload}
        disabled={isDownloading}
        className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-cream px-3 py-2 font-display text-[13.5px] font-semibold shadow-pop-sm transition-colors hover:bg-yellow disabled:opacity-50"
        aria-label="Download image as PDF"
      >
        {isDownloading ? (
          <LoaderCircle className="h-[15px] w-[15px] animate-spin" />
        ) : (
          <Download className="h-[15px] w-[15px]" strokeWidth={2.3} />
        )}
        Download
      </button>
    );
  }

  if (variant === 'overlay') {
    return (
      <button
        type="button"
        onClick={handleDownload}
        disabled={isDownloading}
        className="grid size-8 place-items-center rounded-full border-2 border-ink bg-cream text-ink shadow-pop-sm transition-colors hover:bg-yellow disabled:opacity-50"
        aria-label="Download image as PDF"
      >
        {isDownloading ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" strokeWidth={2.2} />
        )}
      </button>
    );
  }

  return (
    <div className="inline-flex items-center justify-center h-7 w-7">
      {isDownloading ? (
        <LoaderCircle className="h-5 w-5 animate-spin text-ink/50" />
      ) : (
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="p-1 rounded-full text-ink/60 hover:text-terracotta hover:bg-mustard/40 focus:outline-none focus:ring-2 focus:ring-ring transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Download image as PDF"
              >
                <Download className="h-6 w-6" strokeWidth={1.5} cursor="pointer" />
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