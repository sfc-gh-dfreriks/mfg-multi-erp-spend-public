# Multi-ERP Spend & Supplier Risk — public demo

A static, no-login build of the **Multi-ERP Spend & Supplier Risk** app (manufacturing use case 01 in
[`mfg-use-cases`](https://github.com/sfc-gh-dfreriks/mfg-use-cases)), deployed to GitHub Pages:

**https://sfc-gh-dfreriks.github.io/mfg-multi-erp-spend-public/**

The app unifies spend from two SAP instances, each readable as SAP ECC, S/4HANA, BW or BDC, with acquired Oracle EBS,
Dynamics 365 and NetSuite companies and Coupa indirect spend. The data flows through dbt staging adapters, a canonical
silver layer and gold marts on Snowflake, then on to a semantic view, a Cortex Agent and this React app. All data is synthetic.

## How the public build works

- **Snapshot:** built with `VITE_STATIC=1`, the client reads pre-baked JSON in `public/data/` instead of a live `/api`.
  There is no Snowflake connection and there are no credentials in the browser. Source selection in the snapshot: SAP A = ECC,
  SAP B = S/4HANA, all non-SAP sources on.
- **Filters:**
  - Every company subset with all categories is baked, and so are all companies or one company with each single category.
  - Other combinations fall back to the nearest baked view, company selection first. See `loadKeyed()` in `src/lib/api.ts`.
- **Supplier Optimization:** the scenario model runs in the browser (`src/lib/scenario.ts`, the same logic as the server). Saved
  scenarios go to the browser's localStorage. One Cortex recommendation (default levers) and a Cortex remedy plan for every
  issue are pre-generated.
- **Ask Cortex:** answers are pre-generated for each page's default analysis and every suggested question. Free-text questions
  need the full deployment.
- **Pipeline in 3D:** three interactive three.js views of the pipeline: a Data Factory, a 3D Sankey and the dbt lineage as a 3D constellation. They are built from the same snapshots.
- **Data Sources:** browse each source type and preview its native tables. Apply (which runs dbt in Snowflake) is disabled.

## Refresh

This repo is a copy of `use_cases/01_multi_erp_spend/app/client` from `mfg-use-cases`. With the local app server running:

```bash
cd mfg-use-cases/use_cases/01_multi_erp_spend/app
node scripts/export-static.mjs                      # bakes client/public/data (about 20 minutes, includes Cortex calls)
rsync -a --delete --exclude node_modules --exclude dist client/ ../../../../mfg-multi-erp-spend-public/ --exclude .github --exclude README.md --exclude .gitignore
```

Commit and push. GitHub Actions builds with `VITE_STATIC=1 BASE_PATH=/mfg-multi-erp-spend-public/` and deploys.
