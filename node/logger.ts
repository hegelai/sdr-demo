import OpenAI from 'openai';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { APIPromise } from 'openai/core';

class Logger {
  
  private backendUrl: string;
  private dataQueue: any[] = [];
  private feedbackQueue: any[] = [];

  constructor() {
    this.backendUrl = `http://127.0.0.1:5000/sdk/logger`;
    this.startWorker();
  }

  async addFeedback(logId: string, metricName: string, value: any) {
    this.feedbackQueue.push({ log_id: logId, key: metricName, value });
  }

  async executeAndLog(method: any, params: any): Promise<any> {
    // Check if hegel_model is actually a part of the method arguments
    var hegel_model = 'N/A'
    if ("hegel_model" in params) {
      hegel_model = params.hegel_model;
      delete params.hegel_model;
    }
  
    const start = Date.now();
    const result = await method(params)
    const latency = Date.now() - start;
    const logId = uuidv4();
  
    this.dataQueue.push({
      hegel_model: hegel_model,
      result: JSON.stringify(result),
      input_parameters: JSON.stringify(params),
      latency: latency,
      log_id: logId,
    });
  
    return { ...result, log_id: logId };
  }
  
  async startWorker() {
    setInterval(() => {
      if (this.dataQueue.length > 0) {
        const data = this.dataQueue.shift();
        this.logDataToRemote(data);
      }

      if (this.feedbackQueue.length > 0) {
        const feedbackData = this.feedbackQueue.shift();
        this.sendFeedbackToRemote(feedbackData);
      }
    }, 1000);
  }

  async logDataToRemote(data: any) {
    try {
      await axios.post(this.backendUrl, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': process.env.HEGELAI_API_KEY || '',
        },
      });
    } catch (error) {
      console.error('Error sending data to remote:', error);
    }
  }

  async sendFeedbackToRemote(feedbackData: any) {
    const feedbackUrl = `http://127.0.0.1:5000/sdk/add_feedback/`;
    try {
      await axios.post(feedbackUrl, feedbackData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': process.env.HEGELAI_API_KEY || '',
        },
      });
    } catch (error) {
      console.error('Error sending feedback to remote:', error);
    }
  }
}

const logger = new Logger();

export function addFeedback(logId: string, metricName: string, value: any) {
    logger.addFeedback(logId, metricName, value)
}

export function getOpenAIClient(...args: any) {
  let openai = new OpenAI(...args);
  let originalCreate = openai.chat.completions.create
  openai.chat.completions.create = function(params: any) {
    return logger.executeAndLog(originalCreate.bind(this), params) as APIPromise<any>;
  };
  return openai
}
