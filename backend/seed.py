from database import SessionLocal, engine, Base
import models

def seed_db():
    db = SessionLocal()
    
    # Check if we already have doctors
    if db.query(models.Doctor).first():
        print("Database already seeded with doctors.")
        db.close()
        return

    doctors = [
        models.Doctor(
            name="Dr. Sarah Jenkins",
            specialty="Cardiologist",
            hospital="City Heart Institute",
            rating=4.9,
            reviews=128,
            distance="2.4 km",
            image="https://ui-avatars.com/api/?name=Sarah+Jenkins&background=random",
            experience_years=15,
            availability="Available Today"
        ),
        models.Doctor(
            name="Dr. Michael Chen",
            specialty="Cardiothoracic Surgeon",
            hospital="Metro General",
            rating=4.8,
            reviews=94,
            distance="3.1 km",
            image="https://ui-avatars.com/api/?name=Michael+Chen&background=random",
            experience_years=22,
            availability="Next Week"
        ),
        models.Doctor(
            name="Dr. Emily Roberts",
            specialty="Interventional Cardiologist",
            hospital="Westside Medical Center",
            rating=4.7,
            reviews=86,
            distance="4.5 km",
            image="https://ui-avatars.com/api/?name=Emily+Roberts&background=random",
            experience_years=8,
            availability="Available Tomorrow"
        )
    ]
    
    hospitals = [
        models.Hospital(
            name="City Heart Institute",
            type="Specialized Cardiac Center",
            distance="2.4 km",
            time="12 min",
            lat=40.7128,
            lng=-74.0060
        ),
        models.Hospital(
            name="Metro General Hospital",
            type="General Hospital with Cardiac Wing",
            distance="3.1 km",
            time="15 min",
            lat=40.7200,
            lng=-74.0100
        ),
        models.Hospital(
            name="Westside Medical Center",
            type="Private Hospital",
            distance="4.5 km",
            time="20 min",
            lat=40.7300,
            lng=-74.0200
        )
    ]

    db.add_all(doctors)
    db.add_all(hospitals)
    db.commit()
    print("Successfully seeded doctors and hospitals!")
    db.close()

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    seed_db()
