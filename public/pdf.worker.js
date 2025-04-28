// --- PDF Worker ---
// This worker is used to generate a PDF from an image.

// Load jspdf using importScripts
try {
  // Using a specific version from CDN
  importScripts('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
  console.log("Worker: jsPDF library loaded via importScripts."); // Added log
} catch (e) {
  console.error("Worker: Failed to load jsPDF library via importScripts:", e);
  self.postMessage({ success: false, error: "Failed to load required PDF library." });
  // Optionally close worker if library is essential
  // self.close();
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
  console.log("Worker: Message received", event.data); // Added log

  // Check if jsPDF loaded successfully before proceeding
  // Access jsPDF via self if it's attached globally by the UMD script
  if (typeof self.jspdf === 'undefined' || typeof self.jspdf.jsPDF === 'undefined') {
      console.error("Worker: jsPDF or jsPDF.jsPDF constructor is not defined. Library might have failed to load correctly or is not attached to self.", self.jspdf);
      self.postMessage({ success: false, error: "PDF library not available in worker." });
      return; // Stop execution if library isn't loaded
  }
  const { jsPDF } = self.jspdf; // Destructure the constructor

  const { imageUrl, filename, imgWidth, imgHeight } = event.data;

  // Validate received dimensions
  if (!imgWidth || !imgHeight) {
      console.error("Worker: Invalid dimensions received.", { imgWidth, imgHeight });
      self.postMessage({ success: false, error: "Worker did not receive valid image dimensions." });
      return;
  }

  try {
    // --- Fetching and Processing ---
    console.log("Worker: Fetching image", imageUrl); // Added log
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Worker: Failed to fetch image - ${response.status} ${response.statusText}`);
    }
    const blob = await response.blob();
    console.log("Worker: Image fetched successfully."); // Added log

    // Convert blob to Base64 Data URL using FileReaderSync
    const reader = new FileReaderSync();
    const base64data = reader.readAsDataURL(blob);
    console.log("Worker: Image converted to Base64."); // Added log

    // --- PDF Generation ---
    const orientation = imgWidth >= imgHeight ? 'l' : 'p'; // landscape or portrait
    const pdf = new jsPDF({ // Use the constructor obtained earlier
      orientation: orientation,
      unit: 'pt',
      format: [imgWidth, imgHeight],
    });
    console.log("Worker: jsPDF instance created."); // Added log

    pdf.addImage(base64data, 'JPEG', 0, 0, imgWidth, imgHeight, undefined, 'MEDIUM');
    console.log("Worker: Image added to PDF."); // Added log

    // --- Get PDF as Blob ---
    const pdfBlob = pdf.output('blob');
    console.log("Worker: PDF generated as Blob."); // Added log

    // --- Send Blob back to main thread ---
    console.log("Worker: Sending success message back to main thread."); // Added log
    self.postMessage({ success: true, pdfBlob: pdfBlob, filename: filename });

  } catch (error) {
    console.error("Worker: Error during processing:", error);
    self.postMessage({ success: false, error: error.message || "An unknown error occurred in the worker." });
  }
});

console.log("Worker: Script loaded and listener attached."); // Added log at the end 