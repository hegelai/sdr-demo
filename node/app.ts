import express from 'express';
import cors from 'cors';
import './logger';
import { getOpenAIClient, addFeedback } from 'hegeljs';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const model = "gpt-3.5-turbo";

const openai = getOpenAIClient();

app.post('/feedback', (req, res) => {
    const data = req.body;
    const logId = data.log_id;
    const userFeedback = data.feedback;

    if (!logId || !userFeedback) {
        return res.status(400).json({ error: 'Missing log ID or feedback' });
    }

    addFeedback(logId, 'user_feedback', userFeedback);
    return res.status(200).json({ message: 'Feedback received' });
});

app.post('/generate-email', async (req, res) => {
    const data = req.body;
    const prospectData = data.prospectData;
    const offerDescription = data.offerDescription;

    if (!prospectData || !offerDescription) {
        return res.status(400).json({ error: 'Missing prospect data or offer description' });
    }

    try {
        const { emailContent, logId } = await callOpenAIGPT4(prospectData, offerDescription);
        return res.json({ email: emailContent, log_id: logId });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

async function callOpenAIGPT4(prospectData: string, offerDescription: string) {
    const systemPrompt = "Generate a professional email for sales outreach.";
    const userPrompt = `Prospect Data: ${prospectData}. Offer Description: ${offerDescription}.`;

    const params: OpenAI.Chat.ChatCompletionCreateParams = {
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ],
        model: model,
        stream: false
      };

    const completion: any = await openai.chat.completions.create(params);
    return { emailContent: completion.choices[0].message.content, logId: completion.log_id };
}

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
