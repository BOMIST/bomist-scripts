import csv

def import_csv(filename, delimiter="\t", encoding="utf-8"):
    headers = []
    data = []
    with open(filename, "r", encoding=encoding) as csvfile:
        csvreader = csv.reader(csvfile, delimiter=delimiter)
        headers  = next(csvreader)
        for row in csvreader:
            obj = {}
            for i, header in enumerate(headers):
                obj[header] = row[i]
            data.append(obj)
            
    return (headers, data)
