import { API_URL, authHeaders } from './shared';

export interface AboutValueItem {
  title: string;
  description: string;
}

export interface AboutProgramItem {
  title: string;
  description: string;
}

export interface CommunityHeadItem {
  name: string;
  role: string;
  phone: string;
}

export interface AboutContent {
  heroBadge: string;
  heroTitle: string;
  heroDescription: string;
  stats: { value: string; label: string }[];
  missionTitle: string;
  missionDescription: string;
  visionTitle: string;
  visionDescription: string;
  valuesTitle: string;
  valuesDescription: string;
  values: AboutValueItem[];
  programsTitle: string;
  programsDescription: string;
  programs: AboutProgramItem[];
  communityHeadsTitle: string;
  communityHeadsDescription: string;
  communityHeads: CommunityHeadItem[];
  ctaTitle: string;
  ctaDescription: string;
}

export const ABOUT_CONTENT_KEY = 'ad-diin-about-content';

export const defaultAboutContent: AboutContent = {
  heroBadge: 'Welcome to',
  heroTitle: 'Ad-Diin Mosque',
  heroDescription:
    'A spiritual home dedicated to worship, education, and community service. We strive to strengthen Islamic values and foster unity among Muslims in Dhaka.',
  stats: [
    { value: '5+', label: 'Daily Prayers' },
    { value: '500+', label: 'Community Members' },
    { value: '20+', label: 'Monthly Programs' },
    { value: '10+', label: 'Years Serving' },
  ],
  missionTitle: 'Our Mission',
  missionDescription:
    'To establish a vibrant Islamic center that serves as a beacon of faith, knowledge, and compassion. We aim to provide a welcoming space for worship, learning, and community engagement while supporting those in need.',
  visionTitle: 'Our Vision',
  visionDescription:
    'To be recognized as a leading Islamic institution that nurtures spiritual growth, promotes Islamic values, and creates positive change in our community through education, charity, and unity.',
  valuesTitle: 'Core Values',
  valuesDescription: 'The principles that guide everything we do at Ad-Diin Mosque',
  values: [
    { title: 'Knowledge', description: 'We promote Islamic education and understanding through Quran classes and lectures.' },
    { title: 'Community', description: 'Building a strong Muslim community through regular gatherings and support.' },
    { title: 'Compassion', description: 'Serving those in need through charity, donations, and welfare programs.' },
    { title: 'Faith', description: 'Encouraging spiritual growth and devotion through daily prayers and worship.' },
  ],
  programsTitle: 'Our Programs',
  programsDescription: '',
  programs: [
    {
      title: 'Daily Prayers & Jamaat',
      description:
        'Five daily prayers with congregation, Friday Jummah prayers, and special Taraweeh prayers during Ramadan.',
    },
    {
      title: 'Islamic Education',
      description:
        'Quran recitation classes, Hadith study circles, Arabic language courses, and youth Islamic education programs.',
    },
    {
      title: 'Community Events',
      description:
        'Eid celebrations, Milad-un-Nabi gatherings, Iftar programs during Ramadan, and regular community dinners.',
    },
    {
      title: 'Social Welfare',
      description:
        'Zakat distribution, food donations for the needy, support for orphans, and assistance for struggling families.',
    },
  ],
  communityHeadsTitle: 'Community Heads',
  communityHeadsDescription: 'Mojid community leadership members who guide and support the mosque community',
  communityHeads: [
    { name: 'Mojid Uddin', role: 'Community Head', phone: '+880 1000 000001' },
    { name: 'Abdul Karim', role: 'Assistant Head', phone: '+880 1000 000002' },
    { name: 'Nurul Islam', role: 'Coordinator', phone: '+880 1000 000003' },
  ],
  ctaTitle: 'Join Our Community',
  ctaDescription:
    "Whether you're new to the area or looking for a spiritual home, we welcome you with open arms.",
};

function normalizeAboutContent(data: Partial<AboutContent> | null | undefined): AboutContent {
  const parsed = data || {};

  return {
    ...defaultAboutContent,
    ...parsed,
    stats: Array.isArray(parsed.stats) && parsed.stats.length > 0 ? parsed.stats : defaultAboutContent.stats,
    values: Array.isArray(parsed.values) && parsed.values.length > 0 ? parsed.values : defaultAboutContent.values,
    programs:
      Array.isArray(parsed.programs) && parsed.programs.length > 0
        ? parsed.programs
        : defaultAboutContent.programs,
    communityHeads:
      Array.isArray(parsed.communityHeads) && parsed.communityHeads.length > 0
        ? parsed.communityHeads
        : defaultAboutContent.communityHeads,
  };
}

function cacheAboutContent(content: AboutContent) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(ABOUT_CONTENT_KEY, JSON.stringify(content));
}

export function loadAboutContent(): AboutContent {
  if (typeof window === 'undefined') {
    return defaultAboutContent;
  }

  try {
    const raw = window.localStorage.getItem(ABOUT_CONTENT_KEY);
    if (!raw) {
      return defaultAboutContent;
    }

    const parsed = JSON.parse(raw) as Partial<AboutContent>;
    return normalizeAboutContent(parsed);
  } catch {
    return defaultAboutContent;
  }
}

export async function fetchAboutContent(): Promise<AboutContent> {
  try {
    const response = await fetch(`${API_URL}/api/v1/about`);
    const data = await response.json();

    if (response.ok && data?.success) {
      const content = normalizeAboutContent(data.data);
      cacheAboutContent(content);
      return content;
    }
  } catch {
    // Fall back to cached local data below.
  }

  return loadAboutContent();
}

export async function saveAboutContent(content: AboutContent): Promise<AboutContent> {
  const attempts = [
    {
      url: `${API_URL}/api/v1/admin/about`,
      headers: authHeaders(),
    },
    {
      url: `${API_URL}/api/v1/about`,
      headers: { 'Content-Type': 'application/json' },
    },
  ];

  let lastError = 'Failed to save about content';

  for (const attempt of attempts) {
    try {
      const response = await fetch(attempt.url, {
        method: 'PUT',
        headers: attempt.headers,
        body: JSON.stringify(content),
      });

      const data = await response.json();
      if (response.ok && data?.success) {
        const savedContent = normalizeAboutContent(data.data || content);
        cacheAboutContent(savedContent);
        return savedContent;
      }

      lastError = data?.message || lastError;
    } catch (error: any) {
      lastError = error?.message || lastError;
    }
  }

  throw new Error(lastError);
}