import re
from typing import Any


def normalize_text(value: Any) -> str:
    """Normalize text for fields where small formatting differences are acceptable."""
    if value is None:
        return ""

    value = str(value).lower().strip()
    value = re.sub(r"[^\w\s]", "", value)
    value = re.sub(r"\s+", " ", value)

    return value


def compare_field(expected, actual):
    """
    Compare normal application fields.
    Case, punctuation, and extra whitespace are ignored.
    """
    if not actual:
        return {
            "status": "REVIEW",
            "expected": expected,
            "actual": actual,
            "reason": "Field could not be identified on the label."
        }

    if normalize_text(expected) == normalize_text(actual):
        return {
            "status": "PASS",
            "expected": expected,
            "actual": actual,
            "reason": "Label matches application data."
        }

    return {
        "status": "FAIL",
        "expected": expected,
        "actual": actual,
        "reason": "Label does not match application data."
    }


def compare_government_warning(expected, actual):
    """
    Government warning requires exact wording.
    """
    if not actual:
        return {
            "status": "REVIEW",
            "expected": expected,
            "actual": actual,
            "reason": "Government warning could not be identified."
        }

    if expected.strip() == actual.strip():
        return {
            "status": "PASS",
            "expected": expected,
            "actual": actual,
            "reason": "Government warning matches exactly."
        }

    return {
        "status": "FAIL",
        "expected": expected,
        "actual": actual,
        "reason": "Government warning does not match required wording exactly."
    }


def verify_label(application_data: dict, extracted_fields: dict) -> dict:
    results = {}

    standard_fields = [
        "brand_name",
        "class_type",
        "alcohol_content",
        "net_contents",
        "producer_name_address",
        "country_of_origin",
    ]

    for field in standard_fields:
        results[field] = compare_field(
            application_data.get(field),
            extracted_fields.get(field)
        )

    results["government_warning"] = compare_government_warning(
        application_data.get("government_warning"),
        extracted_fields.get("government_warning")
    )

    statuses = [result["status"] for result in results.values()]

    if "FAIL" in statuses:
        overall_status = "FAIL"
    elif "REVIEW" in statuses:
        overall_status = "REVIEW"
    else:
        overall_status = "PASS"

    return {
        "overall_status": overall_status,
        "results": results
    }