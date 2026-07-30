from database import Session
from database_models import Product, InventoryHistory, InventoryPrediction

db = Session()
# Delete related records first (due to foreign keys)
db.query(InventoryHistory).delete()
db.query(InventoryPrediction).delete()
db.commit()

# Then delete all products
db.query(Product).delete()
db.commit()
db.close()

print("✓ All products and related records deleted from database")
