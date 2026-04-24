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
        You are a professional SEO content writer. 
        Based on the following facts, write a completely original, SEO-optimized blog article.
        
        FACTS:
        {facts}
        
        KEYWORDS TO TARGET:
        {keywords}
        
        TONE:
        {tone}
        
        REQUIREMENTS:
        1. 0% plagiarism. Rewrite everything in your own words.
        2. Use H1, H2, and H3 tags.
        3. Maintain a natural keyword density.
        4. Return the result in the following JSON format:
        {{
          "seo_title": "String (max 60 chars)",
          "meta_description": "String (max 160 chars)",
          "slug": "kebab-case-string",
          "content_html": "Full HTML string with <h2>, <h3>, <p>, <ul>",
          "suggested_tags": ["tag1", "tag2"]
        }}
        """
