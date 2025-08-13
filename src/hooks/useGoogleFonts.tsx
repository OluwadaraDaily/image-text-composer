import { useQuery } from '@tanstack/react-query';

interface GoogleFont {
  family: string;
  variants: string[];
  subsets: string[];
  version: string;
  lastModified: string;
  files: Record<string, string>;
  category: string;
  kind: string;
  menu: string;
}

interface GoogleFontsResponse {
  kind: string;
  items: GoogleFont[];
}

const fetchGoogleFonts = async (): Promise<GoogleFontsResponse> => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_FONTS_API_KEY || process.env.GOOGLE_FONTS_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google Fonts API key is not configured');
  }

  const response = await fetch(
    `https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch Google Fonts: ${response.statusText}`);
  }

  return response.json();
};

export const useGoogleFonts = () => {
  return useQuery({
    queryKey: ['google-fonts'],
    queryFn: fetchGoogleFonts,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24 * 7,
  });
};