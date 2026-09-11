export function renderLandingPage(serviceName: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pizza App | ${serviceName} Service</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="shortcut icon" href="https://img.icons8.com/ios/50/api-settings.png" type="image/x-icon">
</head>
<body>
  <section class="container-fluid text-center d-flex flex-column justify-content-center align-items-center gap-4" style="height: 100vh;">
    <h1 class="font-monospace fs-4">${serviceName} Service</h1>
    <div class="d-flex justify-content-center align-items-center gap-3">
      <img width="100" height="100" src="https://hono.dev/images/logo.svg" alt="hono">
      <span class="font-monospace fs-3">Hono</span>
    </div>
    <span class="poppins-light font-monospace">REST API Server</span>
    <span class="poppins-light font-monospace">&copy; 2026 All Rights Reserved</span>
  </section>
</body>
</html>`;
}