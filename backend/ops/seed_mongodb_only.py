"""
Seed MongoDB with mock data without needing GraphDB.
This allows testing the full stack while GraphDB issues are being resolved.
"""

import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorClient

# MongoDB settings
MONGODB_URL = "mongodb://localhost:27017"
MONGODB_DB_NAME = "healthnav"

# Sample healthcare data
PROVIDERS = [
    {
        "id": "prov-001",
        "npi": "1234567890",
        "name": "Dr. Sarah Johnson",
        "firstName": "Sarah",
        "lastName": "Johnson",
        "specialties": ["Cardiology", "Internal Medicine"],
        "hospitalId": "hosp-001",
        "hospitalName": "Phoenix Medical Center",
        "hcahpsScore": 85,
        "lat": 33.4484,
        "lng": -112.0740,
        "distance": 2.5,
        "conditions": ["Heart Disease", "Hypertension", "Arrhythmia"],
        "symptoms": ["Chest pain", "Shortness of breath", "Irregular heartbeat"],
        "phone": "(602) 555-0101",
        "address": "123 Medical Plaza Dr"
    },
    {
        "id": "prov-002",
        "npi": "1234567891",
        "name": "Dr. Michael Chen",
        "firstName": "Michael",
        "lastName": "Chen",
        "specialties": ["Neurology"],
        "hospitalId": "hosp-001",
        "hospitalName": "Phoenix Medical Center",
        "hcahpsScore": 92,
        "lat": 33.4500,
        "lng": -112.0750,
        "distance": 3.2,
        "conditions": ["Migraine", "Epilepsy", "Stroke"],
        "symptoms": ["Headache", "Dizziness", "Seizures"],
        "phone": "(602) 555-0102",
        "address": "456 Health St"
    },
    {
        "id": "prov-003",
        "npi": "1234567892",
        "name": "Dr. Emily Rodriguez",
        "firstName": "Emily",
        "lastName": "Rodriguez",
        "specialties": ["Pediatrics", "Family Medicine"],
        "hospitalId": "hosp-002",
        "hospitalName": "Valley Children's Hospital",
        "hcahpsScore": 88,
        "lat": 33.4450,
        "lng": -112.0700,
        "distance": 1.8,
        "conditions": ["Common Cold", "Flu", "Asthma"],
        "symptoms": ["Fever", "Cough", "Sore throat"],
        "phone": "(602) 555-0103",
        "address": "789 Care Blvd"
    }
]

HOSPITALS = [
    {
        "id": "hosp-001",
        "cmsId": "CMS001",
        "name": "Phoenix Medical Center",
        "address": "123 Medical Plaza Dr",
        "city": "Phoenix",
        "state": "AZ",
        "zipCode": "85001",
        "hcahpsScore": 85,
        "lat": 33.4484,
        "lng": -112.0740,
        "phone": "(602) 555-1000",
        "about": "Leading medical center in Phoenix with state-of-the-art facilities.",
        "affiliatedProviders": 150,
        "bedCount": 350,
        "emergencyServices": True
    },
    {
        "id": "hosp-002",
        "cmsId": "CMS002",
        "name": "Valley Children's Hospital",
        "address": "789 Care Blvd",
        "city": "Phoenix",
        "state": "AZ",
        "zipCode": "85002",
        "hcahpsScore": 92,
        "lat": 33.4450,
        "lng": -112.0700,
        "phone": "(602) 555-2000",
        "about": "Specialized pediatric care facility.",
        "affiliatedProviders": 80,
        "bedCount": 200,
        "emergencyServices": True
    }
]

PHARMACIES = [
    {
        "id": "pharm-001",
        "name": "CVS Pharmacy",
        "chain": "CVS",
        "address": "100 Main St",
        "city": "Phoenix",
        "state": "AZ",
        "zipCode": "85001",
        "lat": 33.4480,
        "lng": -112.0730,
        "phone": "(602) 555-3000",
        "hours": "8 AM - 10 PM",
        "distance": 0.5,
        "is24Hour": False
    },
    {
        "id": "pharm-002",
        "name": "Walgreens",
        "chain": "Walgreens",
        "address": "200 Central Ave",
        "city": "Phoenix",
        "state": "AZ",
        "zipCode": "85001",
        "lat": 33.4490,
        "lng": -112.0745,
        "phone": "(602) 555-3001",
        "hours": "24 Hours",
        "distance": 1.2,
        "is24Hour": True
    }
]

SPECIALTIES = [
    "Cardiology",
    "Neurology",
    "Pediatrics",
    "Internal Medicine",
    "Family Medicine",
    "Orthopedics",
    "Dermatology",
    "Psychiatry"
]

async def seed_mongodb():
    """Seed MongoDB with healthcare data"""
    print("="*60)
    print("MongoDB Seeding - Healthcare Navigator")
    print("="*60)

    try:
        # Connect to MongoDB
        print("\n[1/5] Connecting to MongoDB...")
        client = AsyncIOMotorClient(MONGODB_URL)
        db = client[MONGODB_DB_NAME]

        # Test connection
        await client.admin.command('ping')
        print("✓ Connected to MongoDB")

        # Clear existing cache
        print("\n[2/5] Clearing existing cache...")
        await db.providers_cache.delete_many({})
        await db.hospitals_cache.delete_many({})
        await db.pharmacies_cache.delete_many({})
        await db.specialties_cache.delete_many({})
        print("✓ Cache cleared")

        # Insert providers
        print("\n[3/5] Seeding providers...")
        await db.providers_cache.insert_many(PROVIDERS)
        print(f"✓ Inserted {len(PROVIDERS)} providers")

        # Insert hospitals
        print("\n[4/5] Seeding hospitals...")
        await db.hospitals_cache.insert_many(HOSPITALS)
        print(f"✓ Inserted {len(HOSPITALS)} hospitals")

        # Insert pharmacies
        print("\n[5/5] Seeding pharmacies...")
        await db.pharmacies_cache.insert_many(PHARMACIES)
        print(f"✓ Inserted {len(PHARMACIES)} pharmacies")

        # Insert specialties
        specialty_docs = [{"name": s} for s in SPECIALTIES]
        await db.specialties_cache.insert_many(specialty_docs)
        print(f"✓ Inserted {len(SPECIALTIES)} specialties")

        print("\n" + "="*60)
        print("✓ MongoDB seeded successfully!")
        print("="*60)

        print("\nVerifying data:")
        provider_count = await db.providers_cache.count_documents({})
        hospital_count = await db.hospitals_cache.count_documents({})
        pharmacy_count = await db.pharmacies_cache.count_documents({})

        print(f"  - Providers: {provider_count}")
        print(f"  - Hospitals: {hospital_count}")
        print(f"  - Pharmacies: {pharmacy_count}")

        client.close()

    except Exception as e:
        print(f"\n✗ Error seeding MongoDB: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(seed_mongodb())
