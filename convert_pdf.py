import os
import re
import markdown
from xhtml2pdf import pisa

def convert():
    md_path = "CLIENT_EXPLANATION_IMPOSSIBLE_FEATURES.md"
    pdf_path = "Client_Explanation_Impossible_Features.pdf"
    
    if not os.path.exists(md_path):
        print(f"Error: {md_path} not found.")
        return

    with open(md_path, "r", encoding="utf-8") as f:
        text = f.read()

    # Clean up accidental leading **# or trailing **
    text = re.sub(r'^\*\*\#', '#', text)
    text = re.sub(r'\*\*\s*$', '', text)
    
    # Replace LaTeX math formatting like $R\text{-}R$ or $1000\text{ Hz}$ for clean HTML rendering
    text = text.replace('$R\\text{-}R$', 'R-R')
    text = text.replace('$1000\\text{ Hz}$', '1000 Hz')
    
    html_body = markdown.markdown(text, extensions=['tables'])

    full_html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page {{
    size: A4;
    margin: 2cm;
  }}
  body {{
    font-family: Helvetica, Arial, sans-serif;
    color: #334155;
    line-height: 1.6;
    font-size: 10.5pt;
  }}
  h1 {{
    color: #0f172a;
    font-size: 18pt;
    border-bottom: 2px solid #0284c7;
    padding-bottom: 6px;
    margin-top: 0;
    margin-bottom: 14px;
  }}
  h2 {{
    color: #0284c7;
    font-size: 13.5pt;
    margin-top: 22px;
    margin-bottom: 10px;
    border-bottom: 1px solid #cbd5e1;
    padding-bottom: 4px;
  }}
  h3 {{
    color: #1e293b;
    font-size: 11pt;
    margin-top: 14px;
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }}
  p {{
    margin-bottom: 10px;
    text-align: left;
  }}
  ul {{
    margin-top: 4px;
    margin-bottom: 12px;
    padding-left: 20px;
  }}
  li {{
    margin-bottom: 6px;
  }}
  strong {{
    color: #0f172a;
    font-weight: bold;
  }}
  hr {{
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 18px 0;
  }}
</style>
</head>
<body>
{html_body}
</body>
</html>"""

    with open(pdf_path, "wb") as pdf_file:
        pisa_status = pisa.CreatePDF(full_html, dest=pdf_file)

    if pisa_status.err:
        print(f"Error converting PDF: {pisa_status.err}")
    else:
        print(f"SUCCESS: Generated {pdf_path} with clean alignment!")

if __name__ == "__main__":
    convert()
