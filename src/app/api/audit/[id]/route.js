export const maxDuration = 300; // 5 minutes timeout

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabaseServerClient';

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

  // --- REFINED PROJECT FETCHING & ERROR HANDLING ---
  let project; // Define project variable outside the try block if needed, though scoped fetching is better
  let projectError;

  try {
    const { data, error } = await supabase
      .from('Project')
      .select('url')
      .eq('id', projectId)
      .maybeSingle(); // Use maybeSingle() to handle null without erroring

    project = data; // Assign data to project
    projectError = error; // Assign error

    // Explicitly check for Supabase errors first
    if (projectError) {
      console.error('Supabase query error:', projectError.message);
      return NextResponse.json(
        { error: `Database query failed: ${projectError.message}` },
        { status: 500 }
      );
    }

    // Check if project data is null or undefined AFTER checking for errors
    if (!project) {
      console.log(`Project not found for ID: ${projectId}`);
      return NextResponse.json(
        { error: 'Project not found or user lacks permission' },
        { status: 404 }
      );
    }
  } catch (err) {
    // Catch any unexpected errors during fetch
    console.error('Unexpected error fetching project:', err);
    return NextResponse.json(
      { error: 'Failed to fetch project data' },
      { status: 500 }
    );
  }

  // If we reach here, 'project' is guaranteed to be defined and have a 'url'
  const urlToAudit = project.url;
  // ----------------------------------------------------

  let browser;
  let launchOptions;

  // Use dynamic import for lighthouse
  const lighthouse = (await import('lighthouse')).default;

  try {
    // ... (rest of your try block remains the same, launching puppeteer/chromium) ...
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

    const runnerResult = await lighthouse(urlToAudit, options);
    const report = runnerResult.lhr;

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
      // Check for RLS violation specifically
      if (insertError.code === '42501') {
        // PostgreSQL code for insufficient privilege
        console.error(
          'RLS policy violation trying to insert audit:',
          insertError.message
        );
        throw new Error(
          'Database security policy prevented saving the audit. Check RLS policies for Audit table inserts.'
        );
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
    // Provide a more specific error message if possible
    return NextResponse.json(
      { error: `Audit failed: ${error.message}` },
      { status: 500 }
    );
  }
}
