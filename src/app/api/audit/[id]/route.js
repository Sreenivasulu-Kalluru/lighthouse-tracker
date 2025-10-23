export const maxDuration = 300; // 5 minutes timeout

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabaseServerClient';
// NO 'import lighthouse...' at the top

// Import puppeteer versions
import puppeteer from 'puppeteer';
import puppeteerCore from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export async function POST(request, { params }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const resolvedParams = await params;
  const { id: projectId } = resolvedParams;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  // ... (user/project checks remain the same) ...

  const urlToAudit = project.url;
  let browser;
  let launchOptions;

  // --- THIS IS THE FIX for ERR_REQUIRE_ESM ---
  // Use the direct dynamic import inside the function
  const lighthouse = (await import('lighthouse')).default;
  // -------------------------------------------

  try {
    // ... (rest of your try block remains the same, launching puppeteer/chromium) ...

    const port = new URL(browser.wsEndpoint()).port;
    const options = { logLevel: 'info', output: 'json', port: port };

    // This line uses the dynamically imported lighthouse
    const runnerResult = await lighthouse(urlToAudit, options);
    const report = runnerResult.lhr;

    // ... (rest of your code to process scores and save to DB remains the same) ...

    return NextResponse.json({ message: 'Audit successful', scores });
  } catch (error) {
    // ... (error handling remains the same) ...
    return NextResponse.json(
      { error: `Audit failed: ${error.message}` },
      { status: 500 }
    );
  }
}
