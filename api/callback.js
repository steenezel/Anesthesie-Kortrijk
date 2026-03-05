export default async function handler(req, res) {
  const { code } = req.query;
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.OAUTH_CLIENT_ID,
      client_secret: process.env.OAUTH_CLIENT_SECRET,
      code,
    }),
  });

  const data = await response.json();

  const content = `
    <script>
      const receiveMessage = (result) => {
        window.opener.postMessage(
          'authorization:github:success:' + JSON.stringify(result),
          window.location.origin
        );
        window.removeEventListener("message", receiveMessage, false);
      }
      receiveMessage(${JSON.stringify({ token: data.access_token, provider: 'github' })});
    </script>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(content);
}