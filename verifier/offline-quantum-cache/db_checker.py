from sqlalchemy import create_engine, inspect

# Use the same URL as in alembic.ini
DATABASE_URL = "sqlite:///E:/ieee/xplore-ieee/verifier/offline-quantum-cache/database.db"

engine = create_engine(DATABASE_URL)
inspector = inspect(engine)

tables = inspector.get_table_names()

if tables:
    print("Tables in the database:")
    for table in tables:
        print(f"- {table}")
else:
    print("No tables found in the database.")
