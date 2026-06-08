'use client';

import { useState } from 'react';
import DownloadIcon from './DownloadIcon';
import PrintIcon from './PrintIcon';

interface DownloadActionsProps {
  imageUrl: string | null;
  filename: string;
}

/**
 * Detail-page download/print controls with a shared "Add border" toggle.
 *
 * No border is baked into the page art (see scripts/lib/frameA4.ts) — adding a
 * frame is a user choice made at download time. The toggle (default OFF) is read
 * by both DownloadIcon and PrintIcon and passed through to pdf.worker.js.
 */
export default function DownloadActions({ imageUrl, filename }: DownloadActionsProps) {
  const [border, setBorder] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3 [&>*]:flex-1">
        <DownloadIcon imageUrl={imageUrl} filename={filename} variant="button" border={border} />
        <PrintIcon imageUrl={imageUrl} filename={filename} variant="button" border={border} />
      </div>

      <label className="inline-flex w-fit cursor-pointer select-none items-center gap-2.5 font-sans text-[14px] font-semibold text-ink-soft">
        <input
          type="checkbox"
          checked={border}
          onChange={(e) => setBorder(e.target.checked)}
          className="h-[18px] w-[18px] cursor-pointer rounded-[5px] border-[2.5px] border-ink accent-ink"
        />
        Add a border around the page
      </label>
    </div>
  );
}
