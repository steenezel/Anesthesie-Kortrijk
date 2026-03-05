export default function handler(req, res) {
  const url = `https://github.com/login/oauth/authorize?client_id=${process.env.OAUTH_CLIENT_ID}&scope=repo,user`;
  res.redirect(url);
}