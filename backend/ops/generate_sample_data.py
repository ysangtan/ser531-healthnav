"""
Generate sample data for Healthcare Navigator.
This script creates mock data based on the OWL ontology structure.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import random
from typing import List, Dict, Any


# Sample data
SPECIALTIES = [
    "Allergy & Immunology",
    "Cardiology",
    "Critical Care",
    "Dermatology",
    "Electrophysiology",
    "Endocrinology",
    "Gastroenterology",
    "Hematology",
    "Infectious Disease",
    "Internal Medicine",
    "Nephrology",
    "Neurology",
    "Oncology",
    "Ophthalmology",
    "Orthopedics",
    "Psychiatry",
    "Pulmonology",
    "Rheumatology",
    "Sports Medicine",
    "Urology",
    "Vascular Surgery",
]

CONDITIONS = [
    {"name": "Coronary artery disease", "symptoms": ["Chest pain", "Shortness of breath"], "specialty": "Cardiology"},
    {"name": "Diabetes", "symptoms": ["Fatigue", "Excessive thirst", "Frequent urination"], "specialty": "Endocrinology"},
    {"name": "Hypertension", "symptoms": ["Headache", "Dizziness"], "specialty": "Cardiology"},
    {"name": "Asthma", "symptoms": ["Wheezing", "Shortness of breath", "Coughing"], "specialty": "Pulmonology"},
    {"name": "COPD", "symptoms": ["Chronic cough", "Shortness of breath"], "specialty": "Pulmonology"},
    {"name": "Arthritis", "symptoms": ["Joint pain", "Stiffness", "Swelling"], "specialty": "Rheumatology"},
    {"name": "Migraine", "symptoms": ["Severe headache", "Nausea", "Light sensitivity"], "specialty": "Neurology"},
    {"name": "Depression", "symptoms": ["Persistent sadness", "Loss of interest", "Fatigue"], "specialty": "Psychiatry"},
    {"name": "Anxiety", "symptoms": ["Excessive worry", "Restlessness", "Difficulty concentrating"], "specialty": "Psychiatry"},
    {"name": "GERD", "symptoms": ["Heartburn", "Acid reflux", "Chest discomfort"], "specialty": "Gastroenterology"},
]

FIRST_NAMES = [
    "Sarah", "Michael", "Emily", "James", "Lisa", "Robert", "Amanda", "David",
    "Jennifer", "Christopher", "Maria", "William", "Patricia", "Thomas", "Nancy"
]

LAST_NAMES = [
    "Chen", "Rodriguez", "Watson", "Park", "Thompson", "Kim", "Foster", "Martinez",
    "Lee", "Brown", "Gonzalez", "Taylor", "Anderson", "White", "Davis"
]

# Phoenix area coordinates (around ASU)
PHOENIX_HOSPITALS = [
    {
        "name": "Banner – University Medical Center Phoenix",
        "lat": 33.4665,
        "lng": -112.0553,
        "address": "1111 E McDowell Rd",
        "city": "Phoenix",
        "state": "AZ",
        "zipCode": "85006"
    },
    {
        "name": "Mayo Clinic Hospital",
        "lat": 33.4484,
        "lng": -111.9843,
        "address": "5777 E Mayo Blvd",
        "city": "Phoenix",
        "state": "AZ",
        "zipCode": "85054"
    },
    {
        "name": "HonorHealth Scottsdale Osborn Medical Center",
        "lat": 33.4942,
        "lng": -111.9261,
        "address": "7400 E Osborn Rd",
        "city": "Scottsdale",
        "state": "AZ",
        "zipCode": "85251"
    },
    {
        "name": "Phoenix Children's Hospital",
        "lat": 33.4890,
        "lng": -112.0748,
        "address": "1919 E Thomas Rd",
        "city": "Phoenix",
        "state": "AZ",
        "zipCode": "85016"
    },
    {
        "name": "St. Joseph's Hospital and Medical Center",
        "lat": 33.4942,
        "lng": -112.0748,
        "address": "350 W Thomas Rd",
        "city": "Phoenix",
        "state": "AZ",
        "zipCode": "85013"
    }
]


def generate_hospitals(count: int = 8) -> List[Dict[str, Any]]:
    """Generate sample hospital data."""
    hospitals = []

    for i, hosp_data in enumerate(PHOENIX_HOSPITALS):
        hospital = {
            "id": f"hosp-{str(i+1).zfill(3)}",
            "cmsId": f"03{str(1000 + i)}",
            "name": hosp_data["name"],
            "address": hosp_data["address"],
            "city": hosp_data["city"],
            "state": hosp_data["state"],
            "zipCode": hosp_data["zipCode"],
            "hcahpsScore": round(random.uniform(70, 95), 1),
            "lat": hosp_data["lat"],
            "lng": hosp_data["lng"],
            "phone": f"(602) {random.randint(100, 999)}-{random.randint(1000, 9999)}",
            "about": f"{hosp_data['name']} is a leading healthcare institution providing comprehensive medical services to the Phoenix metropolitan area.",
            "affiliatedProviders": random.randint(20, 80),
            "bedCount": random.randint(200, 700),
            "emergencyServices": True
        }
        hospitals.append(hospital)

    return hospitals


def generate_providers(hospitals: List[Dict[str, Any]], count: int = 50) -> List[Dict[str, Any]]:
    """Generate sample provider data."""
    providers = []

    for i in range(count):
        first_name = random.choice(FIRST_NAMES)
        last_name = random.choice(LAST_NAMES)
        hospital = random.choice(hospitals)

        # Choose 1-2 specialties
        num_specialties = random.randint(1, 2)
        specialties = random.sample(SPECIALTIES, num_specialties)

        # Choose 1-3 conditions based on specialty
        relevant_conditions = [
            c for c in CONDITIONS
            if c["specialty"] in specialties
        ]
        if not relevant_conditions:
            relevant_conditions = random.sample(CONDITIONS, min(3, len(CONDITIONS)))

        conditions_list = random.sample(
            relevant_conditions,
            min(random.randint(1, 3), len(relevant_conditions))
        )

        # Collect symptoms from conditions
        symptoms = list(set(
            symptom
            for cond in conditions_list
            for symptom in cond["symptoms"]
        ))

        provider = {
            "id": f"prov-{str(i+1).zfill(3)}",
            "npi": f"{random.randint(1000000000, 9999999999)}",
            "name": f"Dr. {first_name} {last_name}",
            "firstName": first_name,
            "lastName": last_name,
            "specialties": specialties,
            "hospitalId": hospital["id"],
            "hospitalName": hospital["name"],
            "hcahpsScore": hospital["hcahpsScore"],
            "lat": hospital["lat"] + random.uniform(-0.02, 0.02),
            "lng": hospital["lng"] + random.uniform(-0.02, 0.02),
            "distance": None,
            "conditions": [c["name"] for c in conditions_list],
            "symptoms": symptoms,
            "phone": f"(602) {random.randint(100, 999)}-{random.randint(1000, 9999)}",
            "address": f"{random.randint(100, 9999)} {random.choice(['Medical Plaza', 'Health Center', 'Medical Building'])}, Suite {random.randint(100, 900)}"
        }
        providers.append(provider)

    return providers


def generate_pharmacies(count: int = 20) -> List[Dict[str, Any]]:
    """Generate sample pharmacy data."""
    pharmacies = []
    chains = ["CVS", "Walgreens", "Rite Aid"]

    # Phoenix area
    base_lat = 33.4484
    base_lng = -112.0740

    for i in range(count):
        chain = random.choice(chains)
        is_24hr = random.choice([True, False])

        pharmacy = {
            "id": f"pharm-{str(i+1).zfill(3)}",
            "name": f"{chain} Pharmacy - Location {i+1}",
            "chain": chain,
            "address": f"{random.randint(100, 9999)} {random.choice(['Main St', 'Central Ave', 'McDowell Rd', 'Thomas Rd', 'Indian School Rd'])}",
            "city": random.choice(["Phoenix", "Scottsdale", "Tempe", "Mesa"]),
            "state": "AZ",
            "zipCode": f"85{random.randint(1, 99):03d}",
            "lat": base_lat + random.uniform(-0.1, 0.1),
            "lng": base_lng + random.uniform(-0.1, 0.1),
            "phone": f"(602) {random.randint(100, 999)}-{random.randint(1000, 9999)}",
            "hours": "24 Hours" if is_24hr else f"{random.choice([7, 8])}:00 AM - {random.choice([9, 10, 11])}:00 PM",
            "distance": None,
            "is24Hour": is_24hr
        }
        pharmacies.append(pharmacy)

    return pharmacies


def main():
    """Generate all sample data."""
    print("Generating sample data...")

    hospitals = generate_hospitals(8)
    providers = generate_providers(hospitals, 50)
    pharmacies = generate_pharmacies(20)

    print(f"Generated {len(hospitals)} hospitals")
    print(f"Generated {len(providers)} providers")
    print(f"Generated {len(pharmacies)} pharmacies")

    return {
        "hospitals": hospitals,
        "providers": providers,
        "pharmacies": pharmacies,
        "specialties": SPECIALTIES
    }


if __name__ == "__main__":
    import json
    data = main()

    # Save to file
    output_dir = os.path.join(os.path.dirname(__file__), "sample_data")
    os.makedirs(output_dir, exist_ok=True)

    with open(os.path.join(output_dir, "sample_data.json"), "w") as f:
        json.dump(data, f, indent=2)

    print(f"\nSample data saved to {output_dir}/sample_data.json")
