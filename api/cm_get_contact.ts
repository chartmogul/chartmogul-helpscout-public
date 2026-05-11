import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-HelpScout-Signature');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const email = req.query.email as string | undefined;
  if (!email) {
    res.status(400).json({ error: "Missing 'email' query param" });
    return;
  }

  const token = process.env.CHARTMOGUL_TOKEN || '';
  const auth = { Authorization: 'Basic ' + Buffer.from(`${token}:`).toString('base64') };

  try {
    const url = `https://api.chartmogul.com/v1/contacts?email=${encodeURIComponent(email)}`;
    const response = await axios.get(url, { headers: auth });
    res.status(200).json(response.data);
  } catch (error: any) {
    console.error('Error searching contacts:', error.response?.data || error.message || error);
    res.status(500).json({ error: 'Failed to fetch ChartMogul contacts' });
  }
}