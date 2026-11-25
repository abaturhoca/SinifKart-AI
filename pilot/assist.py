"""Optional local Ollama question drafts. Only curriculum information enters the prompt."""
import json
from urllib.request import Request, urlopen
from urllib.error import URLError
import os


def draft(topic):
    prompt = ("Bir Türkçe fen bilimleri öğretmenine yardımcı ol. Aşağıdaki kazanım için "
              "bir özgün dört seçenekli soru yaz. Yalnız JSON ver. Alanlar: title (soru), "
              "opts (dört metin), correct (A/B/C/D). Kazanım: " + topic)
    body = {"model": os.environ.get("SINIFKART_MODEL", "gemma3:4b"),
            "stream": False, "format": "json", "prompt": prompt}
    req = Request("http://127.0.0.1:11434/api/generate",json.dumps(body).encode(),
                  headers={"Content-Type":"application/json"})
    try:
        with urlopen(req,timeout=90) as response:
            result=json.loads(json.load(response)["response"])
        if not isinstance(result,dict) or not isinstance(result.get("title"),str) or not 0<len(result["title"].strip())<=600:
            raise ValueError()
        opts=result.get("opts")
        if not isinstance(opts,list) or len(opts)!=4 or any(not isinstance(x,str) or not 0<len(x.strip())<=250 for x in opts) or result.get("correct") not in list("ABCD"):
            raise ValueError()
        return {k:result[k] for k in ("title","opts","correct")}
    except (URLError,TimeoutError,OSError) as exc:
        raise ValueError("Yerel Ollama modeline ulaşılamadı. Model adını ve hizmeti kontrol edin.") from exc
    except (ValueError,KeyError,TypeError) as exc:
        raise ValueError("Model geçerli bir soru taslağı üretmedi.") from exc
