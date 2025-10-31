import { GoogleGenAI, Type } from "@google/genai";
import { WasteCategory } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const validCategories = Object.values(WasteCategory);

export async function classifyWaste(base64ImageData: string, mimeType: string): Promise<string> {
  const prompt = `Analyze the image. First, determine if the image is animated (e.g., a GIF). Second, classify the waste in the image into one of the following categories: ${validCategories.join(', ')}. Provide your answer in a JSON format. The JSON object must contain four keys: "isAnimated" (a boolean), "animationExplanation" (a string explaining why it is or isn't animated; this can be a simple statement if not animated), "category" (the waste category), and "reasoning" (a brief explanation for the classification). If the waste type is not clear, classify it as "GENERAL".`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { text: prompt },
        {
          inlineData: {
            mimeType: mimeType,
            data: base64ImageData,
          },
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isAnimated: {
            type: Type.BOOLEAN,
            description: "Whether the image is animated."
          },
          animationExplanation: {
            type: Type.STRING,
            description: "An explanation regarding the image's animation status."
          },
          category: {
            type: Type.STRING,
            enum: validCategories,
            description: "The category of the waste."
          },
          reasoning: {
            type: Type.STRING,
            description: "A brief explanation for the classification."
          }
        },
        required: ["isAnimated", "animationExplanation", "category", "reasoning"]
      }
    }
  });

  const text = response.text.trim();
  if (!text) {
    throw new Error("Received an empty response from the AI model.");
  }
  
  return text;
}


export async function getCityFromCoordinates(latitude: number, longitude: number): Promise<string> {
  const prompt = `Based on the latitude ${latitude} and longitude ${longitude}, identify the city and a general neighborhood or well-known area. Provide your answer in a JSON format with two keys: "city" and "place".`;
  
  const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] },
      config: {
          responseMimeType: "application/json",
          responseSchema: {
              type: Type.OBJECT,
              properties: {
                  city: { type: Type.STRING, description: "The identified city." },
                  place: { type: Type.STRING, description: "The identified neighborhood or area." }
              },
              required: ["city", "place"]
          }
      }
  });

  const text = response.text.trim();
  if (!text) {
      throw new Error("Received an empty response from the AI model for reverse geocoding.");
  }

  return text;
}