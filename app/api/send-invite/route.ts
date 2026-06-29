import { NextRequest, NextResponse } from 'next/server';

interface CandidateInvite {
  name: string;
  email: string;
  inviteUrl: string;
}

export async function POST(req: NextRequest) {
  try {
    const { candidates, jobTitle, interviewType } = await req.json();

    if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
      return NextResponse.json({ error: 'No candidates provided' }, { status: 400 });
    }

    if (!jobTitle) {
      return NextResponse.json({ error: 'Job title is required' }, { status: 400 });
    }

    if (!interviewType) {
      return NextResponse.json({ error: 'Interview type is required' }, { status: 400 });
    }

    const plunkKey = process.env.PLUNK_API_KEY;
    const isMockMode = !plunkKey || plunkKey === 'plunk_test_key';

    if (isMockMode) {
      console.log('----------------------------------------------------');
      console.log(`[MOCK EMAIL SERVICE] Sending invites for "${jobTitle}" (${interviewType}):`);
      candidates.forEach((c: CandidateInvite) => {
        console.log(`To: ${c.name} <${c.email}>`);
        console.log(`Link: ${c.inviteUrl}`);
      });
      console.log('----------------------------------------------------');

      // Return a successful mocked response
      return NextResponse.json({
        success: true,
        message: 'Mock invites logged to server console successfully',
        mocked: true,
        results: candidates.map(c => ({ email: c.email, status: 'mocked_sent', ok: true }))
      });
    }

    // Call Plunk API in parallel for each candidate
    const promises = candidates.map(async (candidate: CandidateInvite) => {
      const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Interview Invitation</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #09090b;
            color: #f4f4f5;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
          }
          .card {
            background-color: #18181b;
            border: 1px solid #27272a;
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          }
          .logo {
            color: #a855f7;
            font-size: 24px;
            font-weight: 800;
            margin-bottom: 24px;
            letter-spacing: -0.025em;
            text-align: center;
          }
          h1 {
            color: #ffffff;
            font-size: 22px;
            font-weight: 700;
            margin-top: 0;
            margin-bottom: 16px;
            text-align: center;
          }
          p {
            color: #a1a1aa;
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 24px;
          }
          .highlight {
            color: #e4e4e7;
            font-weight: 600;
          }
          .button-container {
            text-align: center;
            margin: 32px 0;
          }
          .button {
            background-color: #9333ea;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 32px;
            font-size: 14px;
            font-weight: 600;
            border-radius: 8px;
            display: inline-block;
            box-shadow: 0 4px 6px -1px rgba(147, 51, 234, 0.2);
          }
          .button:hover {
            background-color: #a855f7;
          }
          .footer {
            text-align: center;
            margin-top: 32px;
            color: #52525b;
            font-size: 11px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="logo">vocalHire AI</div>
            <h1>Interview Invitation</h1>
            <p>Hello <span class="highlight">${candidate.name}</span>,</p>
            <p>Congratulations! You have been shortlisted for the <span class="highlight">${jobTitle}</span> position at <span class="highlight">vocalHire Client</span>.</p>
            <p>You have been invited to complete a <span class="highlight">${interviewType}</span> using our automated AI Voice Recruiter portal. In this session, our AI agent will converse with you and evaluate your responses in real-time.</p>
            <div class="button-container">
              <a href="${candidate.inviteUrl}" class="button">Start AI Voice Interview</a>
            </div>
            <p>Please ensure you are in a quiet environment, have a working microphone and camera, and use a stable internet connection.</p>
            <p>Best regards,<br>The vocalHire Recruitment Team</p>
          </div>
          <div class="footer">
            Powered by vocalHire AI Recruiter. If you did not expect this email, you can safely ignore it.
          </div>
        </div>
      </body>
      </html>
      `;

      try {
        const plunkResponse = await fetch('https://api.useplunk.com/v1/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${plunkKey}`,
          },
          body: JSON.stringify({
            to: candidate.email,
            subject: `Interview Invitation: ${jobTitle} (${interviewType}) - vocalHire AI`,
            body: emailHtml,
          }),
        });

        if (!plunkResponse.ok) {
          const errMsg = await plunkResponse.text();
          return { email: candidate.email, ok: false, error: errMsg };
        }

        return { email: candidate.email, ok: true };
      } catch (err: any) {
        return { email: candidate.email, ok: false, error: err.message || err };
      }
    });

    const results = await Promise.all(promises);
    const successCount = results.filter(r => r.ok).length;

    return NextResponse.json({
      success: successCount > 0,
      invitedCount: successCount,
      results,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
