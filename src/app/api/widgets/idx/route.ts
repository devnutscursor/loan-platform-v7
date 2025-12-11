import { NextResponse } from 'next/server';

export async function GET() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IDX Property Search Widget</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      width: 100%;
      height: 100%;
      overflow-x: hidden;
      background: transparent;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      padding: 2rem 1rem;
    }
    #idxwidget-122191 {
      width: 100% !important;
      min-height: 600px !important;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
    }
    #idxwidget-122191 iframe,
    #idxwidget-122191 > div {
      width: 100% !important;
      max-width: 100% !important;
    }
    /* Center the AI search bar */
    #idx-ai-smart-search-122191 {
      margin: 2rem auto !important;
      display: block !important;
      width: 100% !important;
      max-width: 800px !important;
    }
    /* Hide duplicate search bars that might appear at the bottom */
    body > #idx-ai-smart-search-122191:not(:first-of-type) {
      display: none !important;
    }
    @media (max-width: 768px) {
      #idxwidget-122191 {
        overflow-x: auto;
      }
      body {
        padding: 1rem 0.5rem;
      }
      #idx-ai-smart-search-122191 {
        max-width: 100% !important;
        margin: 1rem auto !important;
      }
    }
  </style>
</head>
<body>
  <script
    id="idxwidgetsrc-122191"
    charset="UTF-8"
    type="text/javascript"
    src="//syncly360.idxbroker.com/idx/widgets/122191"
    async
  ></script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}

