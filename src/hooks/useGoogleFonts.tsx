import { useQuery, useInfiniteQuery } from '@tanstack/react-query';

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

interface PaginatedFontsResponse {
  fonts: GoogleFont[];
  hasMore: boolean;
  totalFetched: number;
}

// Cache all fonts after first full fetch
let allFontsCache: GoogleFont[] | null = null;

const fetchAllGoogleFonts = async (): Promise<GoogleFont[]> => {
  if (allFontsCache) {
    console.log('Using cached fonts:', allFontsCache.length);
    return allFontsCache;
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_FONTS_API_KEY || process.env.GOOGLE_FONTS_API_KEY;
  
  console.log('API Key check:', apiKey ? 'API key found' : 'No API key');
  
  if (!apiKey) {
    throw new Error('Google Fonts API key is not configured');
  }

  const response = await fetch(
    `https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}&sort=popularity&capability=WOFF2`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch Google Fonts: ${response.statusText}`);
  }

  const data: GoogleFontsResponse = await response.json();
  allFontsCache = data.items;
  return allFontsCache;
};

const fetchPaginatedFonts = async ({ pageParam = 0 }): Promise<PaginatedFontsResponse> => {
  const pageSize = 15;
  const allFonts = await fetchAllGoogleFonts();
  
  const startIndex = pageParam * pageSize;
  const endIndex = startIndex + pageSize;
  const fonts = allFonts.slice(startIndex, endIndex);
  
  console.log('fetchPaginatedFonts debug:', {
    pageParam,
    pageSize,
    totalFonts: allFonts.length,
    startIndex,
    endIndex,
    fontsInThisPage: fonts.length,
    hasMore: endIndex < allFonts.length
  });
  
  return {
    fonts,
    hasMore: endIndex < allFonts.length,
    totalFetched: endIndex
  };
};

// Initial load with system fonts + first batch of Google fonts
const fetchInitialFonts = async (): Promise<GoogleFontsResponse> => {
  try {
    const systemFonts: GoogleFont[] = [
      {
        family: "Arial",
        variants: ["400", "700"],
        subsets: ["latin"],
        version: "v1",
        lastModified: "2023-01-01",
        files: {},
        category: "sans-serif",
        kind: "webfonts#webfont",
        menu: ""
      },
      {
        family: "Helvetica",
        variants: ["400", "700"],
        subsets: ["latin"],
        version: "v1",
        lastModified: "2023-01-01",
        files: {},
        category: "sans-serif",
        kind: "webfonts#webfont",
        menu: ""
      },
      {
        family: "Times New Roman",
        variants: ["400", "700"],
        subsets: ["latin"],
        version: "v1",
        lastModified: "2023-01-01",
        files: {},
        category: "serif",
        kind: "webfonts#webfont",
        menu: ""
      }
    ];

    // Fetch first batch of Google fonts
    const firstBatch = await fetchPaginatedFonts({ pageParam: 0 });
    
    return {
      kind: "webfonts#webfontList",
      items: [...systemFonts, ...firstBatch.fonts]
    };
  } catch (error) {
    // Fallback to system fonts only if API fails
    console.warn('Google Fonts API failed, using system fonts only:', error);
    return {
      kind: "webfonts#webfontList",
      items: [
        {
          family: "Arial",
          variants: ["400", "700"],
          subsets: ["latin"],
          version: "v1",
          lastModified: "2023-01-01",
          files: {},
          category: "sans-serif",
          kind: "webfonts#webfont",
          menu: ""
        },
        {
          family: "Helvetica",
          variants: ["400", "700"],
          subsets: ["latin"],
          version: "v1",
          lastModified: "2023-01-01",
          files: {},
          category: "sans-serif",
          kind: "webfonts#webfont",
          menu: ""
        },
        {
          family: "Times New Roman",
          variants: ["400", "700"],
          subsets: ["latin"],
          version: "v1",
          lastModified: "2023-01-01",
          files: {},
          category: "serif",
          kind: "webfonts#webfont",
          menu: ""
        }
      ]
    };
  }
};

export const useGoogleFonts = () => {
  return useQuery({
    queryKey: ['google-fonts-initial'],
    queryFn: fetchInitialFonts,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24 * 7,
  });
};

export const useInfiniteGoogleFonts = () => {
  return useInfiniteQuery({
    queryKey: ['google-fonts-infinite'],
    queryFn: fetchPaginatedFonts,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length : undefined;
    },
    initialPageParam: 1, // Start from page 1 since page 0 is already loaded in initial
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24 * 7,
  });
};