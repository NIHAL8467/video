
import { GoogleGenAI, GenerateVideosOperation } from "@google/genai";
import { AspectRatio } from '../types';
import { VEO_MODEL_NAME } from '../constants';

const POLLING_INTERVAL_MS = 10000;

export const generateVideo = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API key not found. Please select an API key.");
  }

  // Create a new instance right before the call to use the latest key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  console.log(`Starting video generation with prompt: "${prompt}" and aspect ratio: ${aspectRatio}`);

  let operation: GenerateVideosOperation = await ai.models.generateVideos({
    model: VEO_MODEL_NAME,
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio,
    }
  });

  console.log("Operation started:", operation.name);

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));
    try {
        operation = await ai.operations.getVideosOperation({ operation: operation });
        console.log("Polling... operation status:", operation.done);
    } catch (error) {
        console.error("Error during polling:", error);
        throw new Error("Failed to poll for video generation status.");
    }
  }

  if (!operation.response?.generatedVideos?.[0]?.video?.uri) {
    console.error("Video generation finished but no URI found in response:", operation.response);
    throw new Error("Video generation failed to produce a valid output.");
  }
  
  const downloadLink = operation.response.generatedVideos[0].video.uri;
  console.log("Video generated successfully. Download link:", downloadLink);

  const videoUrlWithKey = `${downloadLink}&key=${process.env.API_KEY}`;
  
  try {
    const response = await fetch(videoUrlWithKey);
    if (!response.ok) {
        throw new Error(`Failed to fetch video. Status: ${response.status}`);
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Failed to download or create blob URL for the video:", error);
    throw new Error("Could not retrieve the generated video.");
  }
};
