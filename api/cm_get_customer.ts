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

  const external_id = req.query.external_id as string | undefined;
  const uuid = req.query.uuid as string | undefined;
  if (!external_id && !uuid) {
    res.status(400).json({ error: "Missing 'external_id' or 'uuid' query param" });
    return;
  }

  const token = process.env.CHARTMOGUL_TOKEN || '';
  const auth = { Authorization: 'Basic ' + Buffer.from(`${token}:`).toString('base64') };

  try {
    const url = uuid
      ? `https://api.chartmogul.com/v1/customers/${uuid}`
      : `https://api.chartmogul.com/v1/customers?external_id=${external_id}`;
    const response = await axios.get(url, { headers: auth });
    res.status(200).json(response.data);
  } catch (error: any) {
    console.error('Error fetching customer:', error.response?.data || error.message || error);
    res.status(500).json({ error: 'Failed to fetch ChartMogul customer' });
  }
}