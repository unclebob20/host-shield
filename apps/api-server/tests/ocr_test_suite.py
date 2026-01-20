import os
import json
from src.services.ocr_engine import extract_data # Assuming your logic is here

# 1. Define 'Ground Truth' for your test images
# These should be sample Slovak ID photos you use for testing
TEST_CASES = [
    {
        "image": "samples/sk_id_sample_1.jpg",
        "expected": {
            "first_name": "JÁN",
            "last_name": "NOVÁK",
            "dob": "01.01.1985",
            "doc_number": "EB123456",
            "nationality": "SVK"
        }
    },
    {
        "image": "samples/eu_passport_sample.jpg",
        "expected": {
            "first_name": "ANNA",
            "last_name": "SCHMIDT",
            "dob": "15.05.1990",
            "doc_number": "C7H89012",
            "nationality": "DEU"
        }
    }
]

def run_ocr_tests():
    print(f"--- Starting HostShield OCR Verification Suite ---")
    passed = 0
    total = len(TEST_CASES)

    for case in TEST_CASES:
        print(f"Testing: {case['image']}...")
        
        # Simulate the Vision AI extraction
        try:
            result = extract_data(case['image'])
            
            # Check each mandatory legal field
            is_valid = True
            for field, expected_value in case['expected'].items():
                if result.get(field) != expected_value:
                    print(f"  [FAILED] Field '{field}': Expected {expected_value}, got {result.get(field)}")
                    is_valid = False
            
            if is_valid:
                print(f"  [PASSED] Full extraction matches.")
                passed += 1
                
        except Exception as e:
            print(f"  [ERROR] System failure during OCR processing: {e}")

    print(f"\n--- Results: {passed}/{total} Passed ---")
    if passed == total:
        print("System ready for Slovak Foreign Police integration.")

if __name__ == "__main__":
    run_ocr_tests()