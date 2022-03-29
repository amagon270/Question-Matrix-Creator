import Cors from 'cors'
import { checkAuth } from '../../../lib/auth';
import runMiddleware from '../../../lib/runMiddleware'

export default async function handler(req, res) {
  await runMiddleware(req, res, Cors({methods: ['GET', 'HEAD']}));
  if (req.method === "GET") {
    try {
      await refresh();
    } catch(error) {
      console.log(error)
      res.status(500).json({ text: error })
    }
  }

  async function refresh() {
    const _user = await checkAuth(req, res);
    if (_user) {
      res.status(200).json({
        id: _user.id,
        username: _user.username,
        seenIntro: _user.seenIntro,
      });
      return;
    }
  };
}