'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/voice-controlled-navigation.ts';
import '@/ai/flows/generate-medication-reminder-flow.ts';
import '@/ai/flows/benevolent-chat-flow.ts';
import '@/ai/flows/generate-wellness-tip-flow.ts';
import '@/ai/flows/send-reminders-flow.ts';
