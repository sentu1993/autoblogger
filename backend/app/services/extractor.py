from newspaper import Article
from typing import Dict

def extract_content(url: str) -> Dict:
    article = Article(url)
    article.download()
    article.parse()
    
    return {
        "title": article.title,
        "text": article.text,
        "summary": article.summary,
        "top_image": article.top_image,
        "authors": article.authors,
        "publish_date": article.publish_date
    }
