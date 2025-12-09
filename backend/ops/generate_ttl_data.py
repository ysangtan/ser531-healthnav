"""
Generate RDF/Turtle (.ttl) data files for Healthcare Navigator.
Creates proper RDF triples matching the healthnav.owl ontology.
"""

import sys
import os
import random
from typing import List, Dict
from pathlib import Path

# Prefixes
PREFIXES = """@prefix : <http://example.org/healthnav#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix schema: <http://schema.org/> .

"""

# Sample data (same as before)
SPECIALTIES = [
    "Allergy & Immunology", "Cardiology", "Critical Care", "Dermatology",
    "Electrophysiology", "Endocrinology", "Gastroenterology", "Hematology",
    "Infectious Disease", "Internal Medicine", "Nephrology", "Neurology",
    "Oncology", "Ophthalmology", "Orthopedics", "Psychiatry",
    "Pulmonology", "Rheumatology", "Sports Medicine", "Urology",
    "Vascular Surgery",
]

CONDITIONS_SYMPTOMS = [
    {
        "id": "CAD",
        "name": "Coronary artery disease",
        "symptoms": ["ChestPain", "ShortnessOfBreath"],
        "specialty": "Cardiology"
    },
    {
        "id": "Diabetes",
        "name": "Diabetes Mellitus Type 2",
        "symptoms": ["Fatigue", "ExcessiveThirst", "FrequentUrination"],
        "specialty": "Endocrinology"
    },
    {
        "id": "Hypertension",
        "name": "Hypertension",
        "symptoms": ["Headache", "Dizziness"],
        "specialty": "Cardiology"
    },
    {
        "id": "Asthma",
        "name": "Asthma",
        "symptoms": ["Wheezing", "ShortnessOfBreath", "Coughing"],
        "specialty": "Pulmonology"
    },
    {
        "id": "Migraine",
        "name": "Migraine",
        "symptoms": ["SevereHeadache", "Nausea", "LightSensitivity"],
        "specialty": "Neurology"
    },
]

SYMPTOM_PRECAUTIONS = {
    "ChestPain": "If chest pain is severe or accompanied by shortness of breath, call emergency services immediately.",
    "ShortnessOfBreath": "Seek immediate medical attention if experiencing sudden or severe shortness of breath.",
    "SevereHeadache": "If headache is sudden and severe, especially with fever or stiff neck, seek emergency care.",
    "Fatigue": "Persistent fatigue may indicate underlying conditions. Consult a healthcare provider if it lasts more than 2 weeks.",
}

PHOENIX_HOSPITALS = [
    {
        "id": "BannerUMCPhoenix",
        "name": "Banner – University Medical Center Phoenix",
        "cmsId": "030101",
        "lat": 33.4665,
        "lng": -112.0553,
        "address": "1111 E McDowell Rd",
        "city": "Phoenix",
        "state": "AZ",
        "zipCode": "85006",
        "phone": "(602) 839-2000"
    },
    {
        "id": "MayoClinicPhoenix",
        "name": "Mayo Clinic Hospital Phoenix",
        "cmsId": "030102",
        "lat": 33.4484,
        "lng": -111.9843,
        "address": "5777 E Mayo Blvd",
        "city": "Phoenix",
        "state": "AZ",
        "zipCode": "85054",
        "phone": "(480) 515-6296"
    },
    {
        "id": "HonorHealthScottsdale",
        "name": "HonorHealth Scottsdale Osborn Medical Center",
        "cmsId": "030103",
        "lat": 33.4942,
        "lng": -111.9261,
        "address": "7400 E Osborn Rd",
        "city": "Scottsdale",
        "state": "AZ",
        "zipCode": "85251",
        "phone": "(480) 882-4000"
    },
]

FIRST_NAMES = ["Sarah", "Michael", "Emily", "James", "Lisa", "Robert", "Amanda", "David"]
LAST_NAMES = ["Chen", "Rodriguez", "Watson", "Park", "Thompson", "Kim", "Foster", "Martinez"]


def sanitize_id(text: str) -> str:
    """Create a valid RDF ID from text."""
    return text.replace(" ", "").replace("-", "").replace("&", "And").replace("'", "")


def generate_specialties_ttl() -> str:
    """Generate specialties.ttl file."""
    content = PREFIXES
    content += "# Specialties\n\n"

    for specialty in SPECIALTIES:
        spec_id = sanitize_id(specialty)
        content += f":{spec_id} a :Specialty ;\n"
        content += f'    :name "{specialty}" .\n\n'

    return content


def generate_conditions_symptoms_ttl() -> str:
    """Generate conditions and symptoms with relationships."""
    content = PREFIXES
    content += "# Symptoms\n\n"

    # First, define all unique symptoms
    all_symptoms = set()
    for cond in CONDITIONS_SYMPTOMS:
        all_symptoms.update(cond["symptoms"])

    for symptom in sorted(all_symptoms):
        content += f":{symptom} a :Symptom ;\n"
        symptom_name = ' '.join([c for c in symptom if c.isupper() or c.islower()])
        # Add spaces before capitals
        symptom_name = ''.join([' ' + c if c.isupper() else c for c in symptom]).strip()
        content += f'    :name "{symptom_name}" .\n\n'

    content += "# Medical Conditions\n\n"

    # Define conditions with symptom relationships
    for cond in CONDITIONS_SYMPTOMS:
        content += f":{cond['id']} a :MedicalCondition ;\n"
        content += f'    :name "{cond["name"]}" ;\n'

        # Link to symptoms
        for i, symptom in enumerate(cond["symptoms"]):
            if i < len(cond["symptoms"]) - 1:
                content += f"    :hasSymptom :{symptom} ;\n"
            else:
                content += f"    :hasSymptom :{symptom} .\n"

        content += "\n"

    return content


def generate_symptoms_precautions_ttl() -> str:
    """Generate symptom precautions."""
    content = PREFIXES
    content += "# Precautions\n\n"

    for symptom, precaution in SYMPTOM_PRECAUTIONS.items():
        precaution_id = f"{symptom}Precaution"
        content += f":{precaution_id} a :Precaution ;\n"
        content += f'    :name "{precaution}" .\n\n'

        content += f":{symptom} :recommendedPrecaution :{precaution_id} .\n\n"

    return content


def generate_hospitals_ttl() -> str:
    """Generate hospitals.ttl file."""
    content = PREFIXES
    content += "# Hospitals\n\n"

    for hosp in PHOENIX_HOSPITALS:
        content += f":{hosp['id']} a :Hospital ;\n"
        content += f'    :name "{hosp["name"]}" ;\n'
        content += f'    :cmsOrgId "{hosp["cmsId"]}" ;\n'
        content += f'    :phone "{hosp["phone"]}" ;\n'
        content += f"    :locatedAt :{hosp['id']}_Address .\n\n"

        # Address
        content += f":{hosp['id']}_Address a :Address ;\n"
        content += f'    :addressLine "{hosp["address"]}" ;\n'
        content += f'    :city "{hosp["city"]}" ;\n'
        content += f'    :state "{hosp["state"]}" ;\n'
        content += f'    :postalCode "{hosp["zipCode"]}" ;\n'
        content += f"    :hasGeo :{hosp['id']}_Geo .\n\n"

        # GeoLocation
        content += f":{hosp['id']}_Geo a :GeoLocation ;\n"
        content += f'    :latitude "{hosp["lat"]}"^^xsd:decimal ;\n'
        content += f'    :longitude "{hosp["lng"]}"^^xsd:decimal .\n\n'

    return content


def generate_hospitals_hcahps_ttl() -> str:
    """Generate hospital HCAHPS scores."""
    content = PREFIXES
    content += "# Hospital HCAHPS Scores\n\n"

    for hosp in PHOENIX_HOSPITALS:
        score = round(random.uniform(70, 95), 1)
        content += f":{hosp['id']} :hcahpsOverallScore \"{score}\"^^xsd:decimal .\n"

    content += "\n"
    return content


def generate_physicians_ttl() -> str:
    """Generate physicians with affiliations."""
    content = PREFIXES
    content += "# Physicians\n\n"

    physician_count = 30

    for i in range(physician_count):
        first_name = random.choice(FIRST_NAMES)
        last_name = random.choice(LAST_NAMES)
        physician_id = f"Dr{first_name}{last_name}{i}"

        npi = f"{random.randint(1000000000, 9999999999)}"

        # Choose 1-2 specialties
        num_specialties = random.randint(1, 2)
        specialties = random.sample(SPECIALTIES, num_specialties)

        # Choose hospital
        hospital = random.choice(PHOENIX_HOSPITALS)

        # Find conditions matching specialty
        conditions = [
            c for c in CONDITIONS_SYMPTOMS
            if c["specialty"] in specialties
        ]
        if not conditions:
            conditions = random.sample(CONDITIONS_SYMPTOMS, min(2, len(CONDITIONS_SYMPTOMS)))

        content += f":{physician_id} a :Physician ;\n"
        content += f'    :name "Dr. {first_name} {last_name}" ;\n'
        content += f'    :npi "{npi}" ;\n'

        # Add specialties
        for spec in specialties:
            spec_id = sanitize_id(spec)
            content += f"    :hasSpecialty :{spec_id} ;\n"

        # Add conditions
        for cond in conditions:
            content += f"    :treatsCondition :{cond['id']} ;\n"

        # Add hospital affiliation
        content += f"    :affiliatedWith :{hospital['id']} .\n\n"

    return content


def generate_pharmacies_ttl() -> str:
    """Generate pharmacies in Phoenix area."""
    content = PREFIXES
    content += "# Pharmacies\n\n"

    chains = ["CVS", "Walgreens", "RiteAid"]
    pharmacy_count = 15

    base_lat = 33.4484
    base_lng = -112.0740

    for i in range(pharmacy_count):
        chain = random.choice(chains)
        pharmacy_id = f"{chain}Pharmacy{i}"

        lat = base_lat + random.uniform(-0.05, 0.05)
        lng = base_lng + random.uniform(-0.05, 0.05)

        address = f"{random.randint(100, 9999)} {random.choice(['Main St', 'Central Ave', 'McDowell Rd'])}"
        city = random.choice(["Phoenix", "Scottsdale", "Tempe"])
        zip_code = f"85{random.randint(1, 99):03d}"

        content += f":{pharmacy_id} a :Pharmacy ;\n"
        content += f'    :name "{chain} Pharmacy #{i+1}" ;\n'
        content += f"    :locatedAt :{pharmacy_id}_Address .\n\n"

        # Address
        content += f":{pharmacy_id}_Address a :Address ;\n"
        content += f'    :addressLine "{address}" ;\n'
        content += f'    :city "{city}" ;\n'
        content += f'    :state "AZ" ;\n'
        content += f'    :postalCode "{zip_code}" ;\n'
        content += f"    :hasGeo :{pharmacy_id}_Geo .\n\n"

        # GeoLocation
        content += f":{pharmacy_id}_Geo a :GeoLocation ;\n"
        content += f'    :latitude "{lat:.6f}"^^xsd:decimal ;\n'
        content += f'    :longitude "{lng:.6f}"^^xsd:decimal .\n\n'

    return content


def main():
    """Generate all TTL files."""
    print("=" * 60)
    print("Healthcare Navigator - TTL Data Generation")
    print("=" * 60)

    # Create output directory
    output_dir = Path(__file__).parent / "ttl_data"
    output_dir.mkdir(exist_ok=True)

    files_to_generate = [
        ("specialties.ttl", generate_specialties_ttl),
        ("conditions_symptoms.ttl", generate_conditions_symptoms_ttl),
        ("symptoms_precautions.ttl", generate_symptoms_precautions_ttl),
        ("hospitals.ttl", generate_hospitals_ttl),
        ("hospitals_hcahps.ttl", generate_hospitals_hcahps_ttl),
        ("physicians.ttl", generate_physicians_ttl),
        ("pharmacies.ttl", generate_pharmacies_ttl),
    ]

    print(f"\nGenerating TTL files in: {output_dir}\n")

    for filename, generator_func in files_to_generate:
        content = generator_func()
        filepath = output_dir / filename

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"✓ Generated: {filename}")

    print("\n" + "=" * 60)
    print("✓ All TTL files generated successfully!")
    print("=" * 60)
    print(f"\nFiles location: {output_dir}")
    print("\nNext steps:")
    print("  1. Review generated .ttl files")
    print("  2. Load into GraphDB using ops/seed_graphdb.py")
    print("=" * 60)


if __name__ == "__main__":
    main()
