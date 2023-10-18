import requests
from urllib.parse import urljoin

API_BASE_URL="http://localhost:3333"

def main():
    session = requests.Session()

    # Fetch all parts 
    r = session.get(urljoin(API_BASE_URL, "/parts"))
    all_parts_obj = r.json()

    for part_obj in all_parts_obj:
        part = part_obj.get("part")
        # copy part._link into part._link2, but only if part._link2 is empty
        if part.get("_link") and part.get("_link2") is None:
            r = session.put(urljoin(API_BASE_URL, "/parts/%s" % part.get("id")), json={
                "part": {
                    "_link2": {
                        "url": part.get("_link"),
                        "name": "Link"
                    }
                }    
            })
            if r.status_code != 200:
                print("error", r.json())
                exit(1)
            else:
                print("%s" % (part.get("mpn")))
        
    print("Done")

main()
