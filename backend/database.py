import os
from mongita import MongitaClientDisk

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.mongita')

def get_db_connection():
    # MongitaClientDisk stores documents in the specified directory
    client = MongitaClientDisk(host=DB_PATH)
    db = client.agrismart
    return db

def init_db():
    db = get_db_connection()

    # In Mongita/MongoDB, collections are created implicitly upon first insertion.
    # However, we can still seed data if collections are empty.
    
    alerts_col = db.alerts
    if alerts_col.count_documents({}) == 0:
        alerts_data = [
            {
                "type": "critical",
                "title": "Critical Irrigation Failure",
                "message": "Main pump in Sector B (Corn Field) has stopped responding. Immediate manual inspection required to prevent crop dehydration.",
                "icon": "warning",
                "category": "Irrigation",
                "time_ago": "2 mins ago",
                "dismissed": 0
            },
            {
                "type": "warning",
                "title": "Pest Risk Detected",
                "message": "AI vision analysis of drone imagery indicates a 78% probability of Aphid infestation in the northern tomato patches.",
                "icon": "pest_control",
                "category": "Pest/Disease",
                "time_ago": "45 mins ago",
                "dismissed": 0
            },
            {
                "type": "weather",
                "title": "Weather Alert: Severe Rain",
                "message": "Heavy rainfall expected within the next 4 hours. Automated irrigation schedules for all zones have been suspended.",
                "icon": "thunderstorm",
                "category": "Weather",
                "time_ago": "2 hours ago",
                "dismissed": 0
            },
            {
                "type": "advisory",
                "title": "Soil Nutrient Advisory",
                "message": "Nitrogen levels in Zone 4 are optimal. Recommended to delay scheduled fertilizing by 3 days to maximize uptake.",
                "icon": "psychology",
                "category": "Irrigation",
                "time_ago": "5 hours ago",
                "dismissed": 0
            }
        ]
        alerts_col.insert_many(alerts_data)

    reports_col = db.yield_reports
    if reports_col.count_documents({}) == 0:
        yield_data = [
            {"month": "Jan", "height": "40%", "value": "240t", "highlight": 0},
            {"month": "Feb", "height": "45%", "value": "260t", "highlight": 0},
            {"month": "Mar", "height": "60%", "value": "310t", "highlight": 0},
            {"month": "Apr", "height": "55%", "value": "290t", "highlight": 0},
            {"month": "May", "height": "85%", "value": "450t", "highlight": 0},
            {"month": "Jun", "height": "95%", "value": "500t", "highlight": 0},
            {"month": "Jul", "height": "100%", "value": "520t", "highlight": 1},
            {"month": "Aug", "height": "75%", "value": "410t", "highlight": 0},
            {"month": "Sep", "height": "65%", "value": "360t", "highlight": 0},
            {"month": "Oct", "height": "50%", "value": "280t", "highlight": 0},
            {"month": "Nov", "height": "40%", "value": "240t", "highlight": 0},
            {"month": "Dec", "height": "35%", "value": "210t", "highlight": 0}
        ]
        reports_col.insert_many(yield_data)

if __name__ == '__main__':
    print("Initializing Database...")
    init_db()
    print("Database Initialized successfully.")
