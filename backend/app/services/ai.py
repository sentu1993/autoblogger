import openai
import google.generativeai as genai
from app.core.config import settings
from typing import Optional, Dict

class AIService:
    def __init__(self, provider: str = "openai", api_key: Optional[str] = None):
        self.provider = provider
        self.api_key = api_key or (settings.OPENAI_API_KEY if provider == "openai" else settings.GEMINI_API_KEY)
        
        if provider == "openai":
            openai.api_key = self.api_key
        elif provider == "gemini":
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-pro')

    async def generate_content(self, prompt: str) -> str:
        if self.provider == "openai":
            response = await openai.ChatCompletion.acreate(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}]
            )
            return response.choices[0].message.content
        elif self.provider == "gemini":
            response = await self.model.generate_content_async(prompt)
            return response.text
        return ""

    def get_seo_prompt(self, facts: str, keywords: str, tone: str) -> str:
        return f"""
        You are a world-class SEO content architect and Google Search Authority expert.
        Based on the following facts, build an elite, high-formatting blog article designed for instant indexing and authority.
        
        FACTS TO SYNTHESIZE:
        {facts}
        
        KEYWORDS TO DOMINATE (Primary keyword is the first one):
        {keywords}
        
        TONE PROTOCOL:
        {tone}
        
        ELITE FORMATTING REQUIREMENTS:
        1. SEMANTIC STRUCTURE: Use HTML5 tags. Start with a powerful <h1> title. Use at least 4 <h2> subheadings and 3 <h3> sub-subheadings for deep hierarchy.
        2. SPACING & READABILITY: Paragraphs must not exceed 3 sentences. Use <strong> for emphasis.
        3. RICH ELEMENTS: Include at least one <ul> bulleted list and one <ol> numbered list. Use <blockquote> for a expert quote/insight.
        4. IMAGE STRATEGY: Suggest 2 placeholders for images with <img> tags including descriptive 'alt' text.
        5. PLAGIARISM: 0% plagiarism. Rewrite everything from the facts in your own expert voice.
        6. SCHEMA: Generate a valid JSON-LD script for an Article and an FAQPage based on the content.
        
        RETURN FORMAT (JSON ONLY - No markdown blocks):
        {{
          "seo_title": "Optimized for clicks (max 60 chars)",
          "meta_description": "High-intent summary (max 160 chars)",
          "slug": "url-friendly-kebab-case-slug",
          "content_html": "Professional HTML with <h1>, <h2>, <h3>, <p>, <blockquote>, <ul>, <ol>, <strong>, <img> tags",
          "schema_json": "A valid JSON-LD object (as a string or object)",
          "suggested_tags": ["tag1", "tag2", "tag3"],
          "seo_score_target": 100
        }}
        """
