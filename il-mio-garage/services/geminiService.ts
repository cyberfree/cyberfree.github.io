
import { GoogleGenAI } from "@google/genai";

export const analyzeCarDocument = async (base64Image: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  
  const prompt = `
    Analizza questa immagine di un documento o di un'auto. 
    Estrai, se presenti, le seguenti informazioni in formato JSON:
    - owner (Nome e Cognome)
    - plate (Targa)
    - chassis (Telaio)
    - registrationDate (Data immatricolazione YYYY-MM-DD)
    - taxExpiry (Scadenza bollo YYYY-MM-DD)
    - insuranceExpiry (Scadenza assicurazione YYYY-MM-DD)
    - revisionExpiry (Scadenza revisione YYYY-MM-DD)
    - serviceExpiry (Scadenza tagliando o prossima manutenzione YYYY-MM-DD)
    - tireSize (Dimensioni pneumatici, es. 175/65 R17)
    Se non riesci a trovare un dato, lascia la stringa vuota.
    Rispondi SOLO con il JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] || base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return null;
  }
};
