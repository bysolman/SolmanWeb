import { useEffect } from 'react';

interface SeoProps {
  title?: string;
  description?: string;
  keywords?: string[];
}

export function useDynamicSEO({ title, description, keywords = [] }: SeoProps) {
  useEffect(() => {
    const defaultTitle = "Solman Hussain Choudhury | Portfolio & CMS";
    const defaultDesc = "Official portfolio of Solman Hussain Choudhury — Managing Partner at Chaikosh Agrielectro Industries, Tax & Business Consultant, Certified Insurance Agent, and Digital Strategist based in Badarpur, Assam.";
    const defaultKeywords = ["Assam Consultant", "Export Trading", "Tax Consultancy", "GST Filing", "Global Export", "Chaikosh Agrielectro", "Badarpur Assam", "Solman Hussain Choudhury"];

    // Update Title
    if (title) {
      document.title = `${title} | Solman Hussain Choudhury - Assam Consultant & Export Trading`;
    } else {
      document.title = defaultTitle;
    }

    // Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description || defaultDesc);

    // Update Meta Keywords (incorporating 'Assam Consultant' and 'Export Trading')
    const combinedKeywords = Array.from(new Set(["Assam Consultant", "Export Trading", ...keywords, ...defaultKeywords])).join(', ');
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', combinedKeywords);

    // Open Graph Tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', title ? `${title} | Assam Consultant & Export Trading` : defaultTitle);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute('content', description || defaultDesc);

    return () => {
      // Cleanup / Reset to default on unmount
      document.title = defaultTitle;
      if (metaDesc) metaDesc.setAttribute('content', defaultDesc);
      if (metaKeywords) metaKeywords.setAttribute('content', defaultKeywords.join(', '));
    };
  }, [title, description, keywords]);
}
