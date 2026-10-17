# Localization agent instructions

Inherits [repository AGENTS.md](../AGENTS.md). Read [UI and localization](../docs/ui-and-localization.md).

- The enabled default localization is `lang/en-EN/game.xml`; all new UI text and action stories need corresponding English keys. Match the naming and XML nesting expected by `Localization.txt` / `_txt` and `getXMLName`.
- `lang/fr-FR/game.xml` exists, but French is not listed as enabled in `Localization.supportedLang`. Do not imply full French support or invent translations.
- Preserve XML well-formedness and CDATA where embedded HTML is intentional. Avoid edits that break existing save or action names.
- Validate with `python scripts/check-xml.py` and manually confirm new labels and stories in the browser.
