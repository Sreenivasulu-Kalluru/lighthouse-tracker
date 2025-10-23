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
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // --- Refined Project Fetching ---
  let project;
  let projectError;
  try {
    const { data, error } = await supabase
      .from('Project')
      .select('url')
      .eq('id', projectId)
      .maybeSingle();
    project = data;
    projectError = error;
    if (projectError) throw projectError; // Throw if there's a DB error
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or permission denied' },
        { status: 404 }
      );
    }
  } catch (err) {
    console.error('Error fetching project:', err);
    return NextResponse.json(
      { error: 'Failed to fetch project data' },
      { status: 500 }
    );
  }
  const urlToAudit = project.url;
  // ---------------------------------

  let browser;
  let launchOptions;

  // --- THIS IS THE FIX for ERR_REQUIRE_ESM ---
  // Use the direct dynamic import inside the function
  const lighthouse = (await import('lighthouse')).default;
  // -------------------------------------------

  try {
    // ... (rest of your try block remains the same, launching puppeteer/chromium) ...
    if (process.env.NODE_ENV === 'production') {
      // ... Vercel launch options ...
      browser = await puppeteerCore.launch(launchOptions);
    } else {
      // ... Local launch options ...
      browser = await puppeteer.launch(launchOptions);
    }

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
