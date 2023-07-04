import argparse
import requests
from utils.csv import import_csv

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", help="path to the csv file to import", required=True)
    args = parser.parse_args()

    print("CSV", args.csv)
    # import_csv(args.csv)
    r = requests.get("http://localhost:3333")
    print("PING?", r.text)

main()
