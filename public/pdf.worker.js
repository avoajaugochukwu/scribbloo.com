// --- PDF Worker ---
// This worker is used to generate a PDF from an image.
importScripts('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
// Important: Make sure the jsPDF version matches what you might use elsewhere or is compatible.
// You could also potentially bundle jsPDF with the worker using advanced build tools.

const { jsPDF } = jspdf; // Access jsPDF from the global scope after importScripts

self.onmessage = async (event) => {
    const { imageUrl, filename } = event.data;
    const pdfFilename = filename.replace(/\.[^/.]+$/, "") + ".pdf";

    try {
        // --- Fetching and Processing ---
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Worker: Failed to fetch image - ${response.statusText}`);
        }
        const blob = await response.blob();

        // Convert blob to Base64 Data URL (needed for jsPDF and Image object)
        const reader = new FileReaderSync(); // Use FileReaderSync in workers
        const base64data = reader.readAsDataURL(blob);

        // Load image data into an Image object to get dimensions
        // Workers don't have direct access to DOM 'Image', need OffscreenCanvas or fetch dimensions differently if possible
        // Workaround: We might need to pass dimensions or use a library that doesn't rely on DOM Image
        // Let's try fetching dimensions via a different method if possible, or assume a default/pass them

        // --- Simplified approach assuming we can get dimensions ---
        // THIS PART IS TRICKY IN A WORKER without DOM access.
        // A common workaround is to load the image on the main thread first, get dimensions,
        // and pass dimensions *along with* the URL to the worker.
        // Let's proceed *assuming* we somehow got imgWidth/imgHeight (see main thread modification below)

        // --- Placeholder for getting dimensions (MUST BE ADDRESSED) ---
        // For now, let's pretend we received them in event.data
        const { imgWidth, imgHeight } = event.data;
        if (!imgWidth || !imgHeight) {
             throw new Error("Worker: Image dimensions not provided.");
        }
        // --- End Placeholder ---


        // --- PDF Generation ---
        const orientation = imgWidth >= imgHeight ? 'l' : 'p';
        const pdf = new jsPDF({
            orientation: orientation,
            unit: 'pt',
            format: [imgWidth, imgHeight]
        });

        pdf.addImage(base64data, 'JPEG', 0, 0, imgWidth, imgHeight, undefined, 'MEDIUM');

        // --- Get PDF as Blob ---
        const pdfBlob = pdf.output('blob');

        // --- Send Blob back to main thread ---
        self.postMessage({ success: true, pdfBlob: pdfBlob, filename: pdfFilename });

    } catch (error) {
        console.error("Worker Error:", error);
        self.postMessage({ success: false, error: error.message || "An unknown error occurred in the worker." });
    }
}; 