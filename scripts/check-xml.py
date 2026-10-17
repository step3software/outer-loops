#!/usr/bin/env python3
"""Dependency-free XML well-formedness check; not Relax NG semantic validation."""
from pathlib import Path
import sys
import xml.etree.ElementTree as ET

root = Path(__file__).resolve().parents[1]
paths = sorted([*root.joinpath("lang").rglob("*.xml"),
                *root.joinpath("data").rglob("*.xml"),
                *root.joinpath("data").rglob("*.rng")])
if not paths:
    print("FAIL No XML/schema files found", file=sys.stderr)
    sys.exit(1)

errors = []
for path in paths:
    try:
        ET.parse(path)
    except ET.ParseError as error:
        errors.append(f"{path.relative_to(root)}: {error}")

if errors:
    for error in errors:
        print(f"FAIL {error}", file=sys.stderr)
    sys.exit(1)
print(f"PASS {len(paths)} XML/Relax NG files are well-formed.")
