import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const test = await prisma.test.findUnique({
        where: { id: Number(id) },
        include: {
          sections: {
            include: {
              questions: {
                include: { answers: true }
              }
            }
          }
        }
      });

      if (!test) {
        return res.status(404).json({ error: 'Test not found' });
      }

      return res.status(200).json(test);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
