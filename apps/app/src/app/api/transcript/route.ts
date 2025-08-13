import { NextRequest, NextResponse } from 'next/server';

// CORS headers helper
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// Define types for YouTube.js transcript structure
interface TranscriptSegment {
  snippet?: {
    text?: string;
  };
  start_time_text?: {
    text?: string;
  };
}

/**
 * Transforms YouTube.js transcript response into a clean format
 */
function transformTranscript(transcriptData: unknown): Array<{text: string, startTime: string}> {
  try {
    // Navigate through the nested structure to get segments
    const data = transcriptData as { transcript?: { content?: { body?: { initial_segments?: TranscriptSegment[] } } } };
    const segments = data?.transcript?.content?.body?.initial_segments || [];
    
    return segments.map((segment: TranscriptSegment) => ({
      text: segment.snippet?.text || '',
      startTime: segment.start_time_text?.text || '0:00'
    })).filter((item: {text: string, startTime: string}) => item.text.trim() !== '');
    
  } catch (error) {
    console.error('Error transforming transcript:', error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoId, url, language, format, includeTimestamps } = body;

    if (!videoId && !url) {
      return NextResponse.json(
        { error: 'Missing videoId or url in request body' },
        { 
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    console.log('🎬 Fetching transcript for:', videoId || url);
    console.log('📋 Options:', { language, format, includeTimestamps });
    
    const { Innertube } = await import('youtubei.js');
    
    // Create Innertube instance
    const innertube = await Innertube.create();
    
    // Extract video ID from URL if needed
    let finalVideoId = videoId;
    if (url && !videoId) {
      const urlMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
      finalVideoId = urlMatch ? urlMatch[1] : url;
    }
    
    console.log('📹 Using video ID:', finalVideoId);
    
    // Get video info and transcript
    const video = await innertube.getInfo(finalVideoId!);
    const transcript = await video.getTranscript();
    
    console.log('✅ Transcript fetched successfully');
    
    // Transform transcript to clean format
    const cleanTranscript = transformTranscript(transcript);
    
    // Return transcript with options info
    const responseData = {
      success: true,
      videoId: finalVideoId,
      transcript: cleanTranscript,
      options: {
        requestedLanguage: language,
        requestedFormat: format,
        includeTimestamps: includeTimestamps !== false
      }
    };
    
    return NextResponse.json(responseData, {
      headers: corsHeaders,
    });

  } catch (error) {
    console.error('Error fetching transcript:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transcript', details: error instanceof Error ? error.message : 'Unknown error' },
      { 
        status: 500,
        headers: corsHeaders,
      }
    );
  }
} 