export default function handler(req, res) {
  const url = `https://github.com/login/oauth/authorize?client_id=${process.env.OAUTH_CLIENT_ID}&scope=repo,user&redirect_uri=${encodeURIComponent(req.headers.origin + '/api/callback')}`;
  
  // Belangrijk voor CORS: we sturen een 302 redirect, geen fetch response
  res.writeHead(302, { Location: url });
  res.end();
}