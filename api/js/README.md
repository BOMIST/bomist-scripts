## BOMIST Scripts - API (Node.js)

- Requires [Node.js](https://nodejs.org/en/download/) >=14
- `yarn` is recommended

To install `yarn`:

```
npm install --global yarn
```

Then:

```
yarn install
yarn ts src/owned_inventory.ts
```

Examples:

```
$ yarn ts src/owned_inventory.ts --ownerName "Customer Name"
┌─────────┬─────────────────────────────────┬─────┬─────────────────┬──────────────┐
│ (index) │              Part               │ Qty │      Owner      │   Storage    │
├─────────┼─────────────────────────────────┼─────┼─────────────────┼──────────────┤
│    0    │       '22-23-2071 Molex'        │ 100 │ 'Customer Name' │ 'Shelf-A-A2' │
│    1    │    '24AA01T-I/OT Microchip'     │ 30  │ 'Customer Name' │ 'Shelf-A-A3' │
│    2    │ '46333C Murata Power Solutions' │ 101 │ 'Customer Name' │ 'Shelf-A-A2' │
│    3    │ '46333C Murata Power Solutions' │ 100 │ 'Customer Name' │ 'Shelf-A-A3' │
│    4    │ '74405024047 Würth Elektronik'  │ 100 │ 'Customer Name' │ 'Shelf-A-A3' │
│    5    │   'GRM188R60J475KE19D Murata'   │ 15  │ 'Customer Name' │ 'Shelf-A-A2' │
│    6    │   'GRM188R61E105KA12D Murata'   │ 50  │ 'Customer Name' │ 'Shelf-A-A2' │
│    7    │   'GRM188R61H474KA12D Murata'   │ 15  │ 'Customer Name' │ 'Shelf-B-B2' │
│    8    │   'GRM21BR61A106KE19L Murata'   │ 78  │ 'Customer Name' │ 'Shelf-A-A2' │
│    9    │          'MYOWNPART '           │ 10  │ 'Customer Name' │ 'Shelf-B-B2' │
└─────────┴─────────────────────────────────┴─────┴─────────────────┴──────────────┘
Total Qty: 599
```
