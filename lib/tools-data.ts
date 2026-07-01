import {
  FileText, Image as ImageIcon, Combine, Scissors, RotateCw,
  Maximize, Minimize2, RefreshCw, Crop, ClipboardType
} from "lucide-react";

export type ToolId =
  | "pdf-to-jpg"
  | "jpg-to-pdf"
  | "merge-pdf"
  | "split-pdf"
  | "rotate-pdf"
  | "image-resizer"
  | "image-compressor"
  | "convert-to-jpg"
  | "convert-from-jpg"
  | "crop-image"
  | "rotate-image"
  | "word-counter";

export interface ToolSEOData {
  id: ToolId;
  name: string;
  desc: string;
  category: "PDF" | "Image" | "Text";
  icon: any;
  seoTitle: string;
  seoDesc: string;
  h1: string;
  instructions: string[];
  faqs: { q: string; a: string }[];
}

export const TOOLS_LIST: ToolSEOData[] = [
  {
    id: "pdf-to-jpg",
    name: "PDF to JPG",
    desc: "Convert your PDF document pages into high-quality JPG images directly in your browser. 100% client-side rendering ensures absolute privacy.",
    category: "PDF",
    icon: FileText,
    seoTitle: "Convert PDF to JPG Online - 100% Free & Secure | Textipe",
    seoDesc: "Convert PDF pages to JPG images in seconds directly in your browser. No files uploaded to servers - completely secure and free client-side converter.",
    h1: "Free PDF to JPG Converter",
    instructions: [
      "Click the drop zone to upload your PDF file, or drag and drop it directly.",
      "Wait for the PDF to load in-browser. All pages will be rendered as high-resolution images.",
      "Click 'Download JPG' on any individual page, or click 'Download All Pages as ZIP' to download them in bulk."
    ],
    faqs: [
      {
        q: "Are my PDF files uploaded to a server?",
        a: "No! All conversions are performed entirely in your browser using client-side JavaScript. Your files never leave your computer."
      },
      {
        q: "Is there a limit on file size or page count?",
        a: "No. Since it runs client-side on your local hardware, there are no file size or page limit restrictions imposed by Textipe."
      }
    ]
  },
  {
    id: "jpg-to-pdf",
    name: "JPG to PDF",
    desc: "Convert JPG and JPEG images to a single PDF document in seconds. 100% client-side with no file uploads to protect your security.",
    category: "PDF",
    icon: FileText,
    seoTitle: "Convert JPG to PDF Online - Free & Secure Image to PDF | Textipe",
    seoDesc: "Convert JPG and JPEG images to a single PDF document in seconds. 100% client-side with no file uploads to protect your security.",
    h1: "Free JPG to PDF Converter",
    instructions: [
      "Select or drag-and-drop one or multiple JPG/JPEG images.",
      "Rearrange the order of the images using list options.",
      "Click 'Convert to PDF' to compile the images into a single PDF document."
    ],
    faqs: [
      {
        q: "Can I convert multiple JPG images into one PDF?",
        a: "Yes, you can drag and drop multiple images at once. They will compile sequentially into a single multi-page PDF."
      },
      {
        q: "Do you support PNG or other formats in the JPG to PDF tool?",
        a: "This specific tool is optimized for JPG/JPEG. If you have PNG or WebP images, use our Convert to JPG tool first, then export to PDF."
      }
    ]
  },
  {
    id: "merge-pdf",
    name: "Merge PDF",
    desc: "Combine multiple PDF documents into a single PDF file directly in your browser. Fast, free, and secure client-side merge tool.",
    category: "PDF",
    icon: Combine,
    seoTitle: "Merge PDF Files Online - Combine PDFs Instantly | Textipe",
    seoDesc: "Combine multiple PDF documents into a single PDF file directly in your browser. Fast, free, and secure client-side merge tool.",
    h1: "Free PDF Merger Tool",
    instructions: [
      "Upload two or more PDF files by dragging them into the drop zone.",
      "Review the files in the list. You can remove any unwanted files.",
      "Click 'Merge PDFs' to combine them into a single file and download it."
    ],
    faqs: [
      {
        q: "Is there a limit to how many PDFs I can merge?",
        a: "No, you can combine as many PDF files as your browser memory permits."
      },
      {
        q: "Does merging PDFs compromise document security?",
        a: "Not at all. The merge process is 100% client-side inside your browser sandbox. No document content is transmitted over the internet."
      }
    ]
  },
  {
    id: "split-pdf",
    name: "Split PDF",
    desc: "Extract specific pages or split your PDF files into individual documents. Completely free, safe, and processed client-side.",
    category: "PDF",
    icon: Scissors,
    seoTitle: "Split PDF Online - Extract Pages from PDF | Textipe",
    seoDesc: "Extract specific pages or split your PDF files into individual documents. Completely free, safe, and processed client-side.",
    h1: "Free PDF Splitter Tool",
    instructions: [
      "Drag and drop your PDF file into the upload zone.",
      "Enter the target page numbers or page ranges you wish to extract (e.g., '1, 3, 5-7').",
      "Click 'Split PDF' to generate and download a new PDF containing only those selected pages."
    ],
    faqs: [
      {
        q: "How do I specify page ranges to split?",
        a: "Use commas to separate individual pages and hyphens for ranges. For example, '1, 2, 5-8' extracts page 1, page 2, and pages 5 through 8."
      },
      {
        q: "Can I split password-protected PDFs?",
        a: "No, password-protected or encrypted PDFs must be decrypted before processing."
      }
    ]
  },
  {
    id: "rotate-pdf",
    name: "Rotate PDF",
    desc: "Rotate individual pages or the entire PDF document. Save and download your rotated PDF instantly in your browser.",
    category: "PDF",
    icon: RotateCw,
    seoTitle: "Rotate PDF Online - Free PDF Page Rotator | Textipe",
    seoDesc: "Rotate individual pages or the entire PDF document. Save and download your rotated PDF instantly in your browser.",
    h1: "Free PDF Rotation Tool",
    instructions: [
      "Upload your PDF document.",
      "Select which pages you want to rotate (or apply to all pages).",
      "Choose the rotation angle (90, 180, or 270 degrees) and click 'Save Rotated PDF' to download."
    ],
    faqs: [
      {
        q: "Can I rotate only a single page in a PDF?",
        a: "Yes, our tool allows you to select specific pages to rotate, leaving other pages in their original orientation."
      },
      {
        q: "Will rotating a PDF affect its text quality?",
        a: "No. Rotation is applied as metadata to the PDF page layout, preserving original vector details and text quality perfectly."
      }
    ]
  },
  {
    id: "image-resizer",
    name: "Image Resizer",
    desc: "Resize dimensions (width and height) of your PNG, JPG, or WebP images. Custom dimensions with lock aspect ratio support.",
    category: "Image",
    icon: Maximize,
    seoTitle: "Free Image Resizer Online - Change Image Dimensions | Textipe",
    seoDesc: "Resize dimensions (width and height) of your PNG, JPG, or WebP images. Custom dimensions with lock aspect ratio support.",
    h1: "Free Image Resizer",
    instructions: [
      "Select an image to resize (PNG, JPG, WebP).",
      "Enter your desired Width or Height in pixels.",
      "Toggle 'Lock Aspect Ratio' to prevent distortion, then click 'Download Resized Image'."
    ],
    faqs: [
      {
        q: "Will resizing reduce my image quality?",
        a: "Resizing changes the pixel grid size. Upscaling a small image may cause pixelation, while downscaling maintains sharp details."
      },
      {
        q: "Does this resizer compress my image?",
        a: "It resizes width and height. To compress file size while keeping dimensions, use our Image Compressor tool."
      }
    ]
  },
  {
    id: "image-compressor",
    name: "Image Compressor",
    desc: "Reduce the file size of your JPG, PNG, and WebP images with custom quality slider controls. Fast and client-side.",
    category: "Image",
    icon: Minimize2,
    seoTitle: "Free Image Compressor - Compress Image File Size | Textipe",
    seoDesc: "Reduce the file size of your JPG, PNG, and WebP images with custom quality slider controls. Fast and client-side.",
    h1: "Free Image Compressor",
    instructions: [
      "Upload the image you wish to compress.",
      "Adjust the quality slider (between 10% and 100%). Lower values yield smaller file sizes.",
      "Observe the real-time calculated file size and click 'Save Image'."
    ],
    faqs: [
      {
        q: "Which image formats are supported for compression?",
        a: "We support PNG, JPEG/JPG, and WebP formats fully client-side."
      },
      {
        q: "Is there a loss of quality?",
        a: "We use smart lossy compression algorithms. Setting the quality slider to 70-80% reduces file sizes by up to 70% with virtually invisible quality loss."
      }
    ]
  },
  {
    id: "convert-to-jpg",
    name: "Convert to JPG",
    desc: "Convert PNG, WebP, GIF, SVG, and HEIC files to JPG format in bulk. 100% client-side conversion for ultimate privacy.",
    category: "Image",
    icon: RefreshCw,
    seoTitle: "Convert Images to JPG Online - PNG/HEIC/WEBP to JPG | Textipe",
    seoDesc: "Convert PNG, WebP, GIF, SVG, and HEIC files to JPG format in bulk. 100% client-side conversion for ultimate privacy.",
    h1: "Bulk Convert to JPG",
    instructions: [
      "Upload one or multiple images of varying formats (PNG, WebP, GIF, SVG, HEIC).",
      "Click 'Convert to JPG' to process them all simultaneously.",
      "Save images individually or click 'Download JPGs' to export all."
    ],
    faqs: [
      {
        q: "Does it support iPhone HEIC images?",
        a: "Yes, our tool includes native client-side HEIC rendering to convert iOS photos to widely-supported JPEGs."
      },
      {
        q: "Can I convert transparent PNGs?",
        a: "Yes. When converting a transparent PNG to JPG, transparent areas are automatically filled with a white background."
      }
    ]
  },
  {
    id: "convert-from-jpg",
    name: "Convert from JPG",
    desc: "Convert JPG images to PNG format or compile multiple JPG frames into an animated GIF. Adjust speed and dimensions instantly.",
    category: "Image",
    icon: ImageIcon,
    seoTitle: "Convert JPG to PNG & Make Animated GIFs Online | Textipe",
    seoDesc: "Convert JPG images to PNG format or compile multiple JPG frames into an animated GIF. Adjust speed and dimensions instantly.",
    h1: "Convert from JPG & GIF Maker",
    instructions: [
      "Upload one or more JPG images.",
      "To convert to PNG: Click 'Convert to PNG'. Each image downloads as a PNG.",
      "To create an animated GIF: Choose 'Create Animated GIF', adjust frame delay speed, set width/height, and click 'Compile GIF'."
    ],
    faqs: [
      {
        q: "How many images do I need to create a GIF?",
        a: "You need at least 2 JPG images to compile an animated GIF sequence."
      },
      {
        q: "Can I customize the animation speed?",
        a: "Yes, you can adjust the frame interval slider between 0.1 and 3.0 seconds per frame."
      }
    ]
  },
  {
    id: "crop-image",
    name: "Crop Image",
    desc: "Crop borders or select custom areas of your images using our interactive mouse selection tool. Processed fully in-browser.",
    category: "Image",
    icon: Crop,
    seoTitle: "Free Crop Image Online - Mouse Selection Image Cropper | Textipe",
    seoDesc: "Crop borders or select custom areas of your images using our interactive mouse selection tool. Processed fully in-browser.",
    h1: "Free Interactive Image Cropper",
    instructions: [
      "Select an image to crop.",
      "Use your mouse cursor to drag and define the cropping bounding box on the screen.",
      "Adjust crop bounds as needed and click 'Crop & Download'."
    ],
    faqs: [
      {
        q: "Does this cropper support touch gestures?",
        a: "Yes, it supports both mouse dragging on desktop and swipe/drag touch gestures on mobile devices."
      },
      {
        q: "What format does the cropped image download in?",
        a: "It retains the format of your original image (e.g. PNG crops download as PNG)."
      }
    ]
  },
  {
    id: "rotate-image",
    name: "Rotate Image",
    desc: "Rotate JPG, PNG, or WebP images by 90 or 180 degrees. Completely client-side canvas-based image rotation.",
    category: "Image",
    icon: RotateCw,
    seoTitle: "Rotate Image Online - Free Image Rotator Tool | Textipe",
    seoDesc: "Rotate JPG, PNG, or WebP images by 90 or 180 degrees. Completely client-side canvas-based image rotation.",
    h1: "Free Client-Side Image Rotator",
    instructions: [
      "Select your image file.",
      "Click 'Rotate Left' (-90°), 'Rotate Right' (+90°), or 'Flip 180°'.",
      "Click 'Save Image' to download the rotated file."
    ],
    faqs: [
      {
        q: "Does rotating an image compress it?",
        a: "No, the image is rendered onto a canvas at its native resolution, rotated, and downloaded losslessly."
      },
      {
        q: "What image extensions are supported?",
        a: "We support JPG, JPEG, PNG, and WebP image formats."
      }
    ]
  },
  {
    id: "word-counter",
    name: "Word Counter",
    desc: "Count words, characters, sentences, paragraphs, and estimate reading time of your text in real-time. 100% secure.",
    category: "Text",
    icon: ClipboardType,
    seoTitle: "Free Word Counter Online - Count Words & Characters | Textipe",
    seoDesc: "Count words, characters, sentences, paragraphs, and estimate reading time of your text in real-time. 100% secure.",
    h1: "Free Real-Time Word Counter",
    instructions: [
      "Paste your text or start typing directly in the text input box.",
      "Read real-time statistics of total characters, words, sentences, paragraphs, and estimated reading time.",
      "Click 'Copy Text' or 'Clear' to reset the statistics."
    ],
    faqs: [
      {
        q: "Is the text I type sent to any server?",
        a: "Absolutely not. Word counting is performed locally using JavaScript regex matches inside your browser."
      },
      {
        q: "How is reading time calculated?",
        a: "We use a standard reading speed index of 200 words per minute to calculate the reading time."
      }
    ]
  }
];
