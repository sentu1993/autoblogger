import re
from typing import Dict, List, Any
from bs4 import BeautifulSoup

class SEOValidator:
    """
    Validates generated content against SEO best practices.
    """
    @staticmethod
    def validate(content_html: str, seo_title: str, meta_description: str, keywords: str) -> Dict[str, Any]:
        soup = BeautifulSoup(content_html, 'html.parser')
        report = {
            "score": 0,
            "issues": [],
            "metrics": {}
        }
        
        primary_keywords = [k.strip().lower() for k in keywords.split(',')]
        primary_keyword = primary_keywords[0] if primary_keywords else ""
        
        # 1. Check Title Length
        title_len = len(seo_title)
        report["metrics"]["title_length"] = title_len
        if 50 <= title_len <= 60:
            report["score"] += 20
        else:
            report["issues"].append(f"Title length is {title_len}, recommended 50-60 characters.")
            
        # 2. Check Meta Description Length
        meta_len = len(meta_description)
        report["metrics"]["meta_length"] = meta_len
        if 120 <= meta_len <= 160:
            report["score"] += 20
        else:
            report["issues"].append(f"Meta description length is {meta_len}, recommended 120-160 characters.")
            
        # 3. Check H1 for Primary Keyword
        h1 = soup.find('h1')
        if h1 and primary_keyword in h1.get_text().lower():
            report["score"] += 20
        else:
            report["issues"].append(f"H1 tag missing or doesn't contain the primary keyword '{primary_keyword}'.")
            
        # 4. Check Keyword Density
        text_content = soup.get_text().lower()
        word_count = len(text_content.split())
        report["metrics"]["word_count"] = word_count
        
        if word_count > 0:
            kw_count = text_content.count(primary_keyword)
            density = (kw_count / word_count) * 100
            report["metrics"]["keyword_density"] = round(density, 2)
            
            if 0.5 <= density <= 3.0:
                report["score"] += 20
            else:
                report["issues"].append(f"Keyword density is {round(density, 2)}%, recommended 0.5-3.0%.")
        
        # 5. Check Alt Text for Images
        images = soup.find_all('img')
        missing_alt = [img for img in images if not img.get('alt')]
        if images and not missing_alt:
            report["score"] += 20
        elif images:
            report["issues"].append(f"Found {len(missing_alt)} images missing alt text.")
        else:
            # No images, maybe not a penalty but a warning
            report["score"] += 10
            report["issues"].append("No images found in content.")

        # Ensure score doesn't exceed 100
        report["score"] = min(report["score"], 100)
        
        return report
