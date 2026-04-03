import { GoogleGenAI } from "@google/genai";

export interface OCRResult {
  extractedText: string;
  mode: string;
  timestamp: string;
}

// Initialize Gemini on the frontend
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const processImage = async (file: File, mode: string, targetLang?: string): Promise<OCRResult> => {
  // Convert file to base64
  const base64Data = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1];
      resolve(base64);
    };
    reader.readAsDataURL(file);
  });

  let prompt = "";
  switch (mode) {
    case "notes":
      prompt = "Extract all text from this image. Format it as clean notes with clear headings and bullet points where appropriate. Maintain the logical structure of the document.";
      break;
    case "translate":
      prompt = `Extract all text from this image and translate it accurately into ${targetLang}. Provide both the original text and the translation.`;
      break;
    case "ticket":
      prompt = "Extract structured information from this ticket/receipt. Include fields like: Date, Time, Location/Merchant, Items, Total Price, and any unique identifiers. Return it as a structured summary.";
      break;
    default:
      prompt = "Extract all text from this image exactly as it appears. Preserve the layout and formatting as much as possible. Handle both printed and handwritten text with high precision.";
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              data: base64Data,
              mimeType: file.type,
            },
          },
        ],
      },
    ],
  });

  return {
    extractedText: response.text || "No text extracted.",
    mode,
    timestamp: new Date().toISOString(),
  };
};
