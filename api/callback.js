export default async function handler(req, res) {
  const { code } = req.query;
  
  try {
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

    // Als we geen token krijgen, stuur een foutmelding
    if (!data.access_token) {
      return res.status(400).send(`GitHub Auth Error: ${data.error_description || 'Geen token ontvangen'}`);
    }

    const content = `
      <!DOCTYPE html>
      <html>
      <body>
        <script>
          (function() {
            const token = "${data.access_token}";
            const provider = "github";
            
            // Probeer het token te sturen naar het venster dat deze popup opende
            if (window.opener) {
              window.opener.postMessage(
                "authorization:github:success:" + JSON.stringify({ token, provider }),
                "*"
              );
              // Wacht heel even en sluit dan de popup
              setTimeout(() => window.close(), 200);
            } else {
              document.body.innerHTML = "Login geslaagd! Je kunt dit venster sluiten en teruggaan naar het CMS.";
            }
          })();
        </script>
      </body>
      </html>`;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(content);
  } catch (error) {
    res.status(500).send("Server Error: " + error.message);
  }
}