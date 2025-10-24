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
    if (projectError) throw projectError;
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
    // ... (rest of your try block launching puppeteer/chromium) ...
    if (process.env.NODE_ENV === 'production') {
      console.log('Using serverless-friendly Chromium...');
      launchOptions = {
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
      };
      browser = await puppeteerCore.launch(launchOptions);
    } else {
      console.log('Using local Puppeteer...');
      launchOptions = {
        headless: true,
        args: ['--no-sandbox'],
      };
      browser = await puppeteer.launch(launchOptions);
    }

    const port = new URL(browser.wsEndpoint()).port;
    const options = { logLevel: 'info', output: 'json', port: port };

    // This line uses the dynamically imported lighthouse
    const runnerResult = await lighthouse(urlToAudit, options);
    const report = runnerResult.lhr;

    // ... (rest of your code to process scores and save to DB) ...
    const scores = {
      performance: Math.round(report.categories.performance.score * 100),
      accessibility: Math.round(report.categories.accessibility.score * 100),
      best_practices_score: Math.round(
        report.categories['best-practices'].score * 100
      ),
      seo: Math.round(report.categories.seo.score * 100),
    };

    const { error: insertError } = await supabase.from('Audit').insert({
      project_id: projectId,
      performance_score: scores.performance,
      accessibility_score: scores.accessibility,
      best_practices_score: scores.best_practices_score,
      seo_score: scores.seo,
    });

    if (insertError) {
      if (insertError.code === '42501') {
        console.error(
          'RLS policy violation trying to insert audit:',
          insertError.message
        );
        throw new Error('Database security policy prevented saving the audit.');
      }
      throw new Error(`Database error saving audit: ${insertError.message}`);
    }

    await browser.close();
    console.log('Audit complete, browser closed.');

    return NextResponse.json({ message: 'Audit successful', scores });
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    console.error('Audit execution or save failed:', error.message);
    return NextResponse.json(
      { error: `Audit failed: ${error.message}` },
      { status: 500 }
    );
  }
}
