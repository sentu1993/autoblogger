from bs4 import BeautifulSoup
import json
from typing import Dict, Any

class ContentFormatter:
    """
    Polishes raw HTML with inline CSS, Table of Contents, and Schema injection.
    """
    @staticmethod
    def format(html_content: str, schema_json: str = None, cta_template: str = None) -> str:
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # 1. Apply Inline Styling for spacing and readability
        # These styles ensure the blog looks premium regardless of the host CMS defaults
        for p in soup.find_all('p'):
            p['style'] = "margin-bottom: 1.5rem; line-height: 1.8; color: #374151;"
            
        for h2 in soup.find_all('h2'):
            h2['style'] = "margin-top: 2.5rem; margin-bottom: 1rem; font-weight: 800; font-size: 1.875rem; color: #111827;"
            
        for h3 in soup.find_all('h3'):
            h3['style'] = "margin-top: 2rem; margin-bottom: 0.75rem; font-weight: 700; font-size: 1.5rem; color: #1f2937;"
            
        for ul in soup.find_all('ul'):
            ul['style'] = "margin-bottom: 1.5rem; padding-left: 1.5rem; list-style-type: disc;"
            
        for li in soup.find_all('li'):
            li['style'] = "margin-bottom: 0.5rem;"
            
        for bq in soup.find_all('blockquote'):
            bq['style'] = "border-left: 4px solid #4f46e5; padding-left: 1.5rem; font-style: italic; color: #4b5563; margin: 2rem 0;"

        # 2. Inject Table of Contents
        headings = soup.find_all(['h2', 'h3'])
        if len(headings) > 3:
            toc_html = '<div style="background: #f9fafb; padding: 1.5rem; border-radius: 1rem; margin-bottom: 2.5rem; border: 1px solid #e5e7eb;">'
            toc_html += '<h4 style="margin: 0 0 1rem 0; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.875rem; color: #6b7280;">Table of Contents</h4>'
            toc_html += '<ul style="margin: 0; padding: 0; list-style: none;">'
            
            for i, h in enumerate(headings):
                anchor_id = f"section-{i}"
                h['id'] = anchor_id
                indent = "1rem" if h.name == 'h3' else "0"
                toc_html += f'<li style="margin-bottom: 0.5rem; padding-left: {indent};"><a href="#{anchor_id}" style="color: #4f46e5; text-decoration: none; font-weight: 600;">{h.get_text()}</a></li>'
            
            toc_html += '</ul></div>'
            
            # Insert TOC after H1 or first paragraph
            h1 = soup.find('h1')
            if h1:
                h1.insert_after(BeautifulSoup(toc_html, 'html.parser'))
            else:
                soup.insert(0, BeautifulSoup(toc_html, 'html.parser'))

        # 3. Append CTA Template
        if cta_template:
            soup.append(BeautifulSoup(f'<div style="margin-top: 4rem; padding: 2rem; background: #eff6ff; border-radius: 1rem; border: 1px solid #bfdbfe;">{cta_template}</div>', 'html.parser'))

        # 4. Inject Schema JSON-LD
        if schema_json:
            schema_script = soup.new_tag("script", type="application/ld+json")
            schema_script.string = schema_json
            soup.append(schema_script)

        return str(soup)
