from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import pandas as pd
import logging
import numpy as np

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Enhanced CORS origins - including Lovable preview URL and allowing all for testing
origins = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://*.lovable.app",  # Lovable preview URLs
    "*"  # Allow all origins for testing - remove in production
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load saved ML components (make sure these PKL files are in the same folder)
try:
    import os
    MODEL_PATH = os.path.join(os.path.dirname(__file__), "refined_model.pkl")
    model = joblib.load(MODEL_PATH)
    
    SCALER_PATH = os.path.join(os.path.dirname(__file__), "refined_scaler.pkl")
    scaler = joblib.load(SCALER_PATH)
    
    FEATURES_PATH = os.path.join(os.path.dirname(__file__), "refined_features.pkl")
    features = joblib.load(FEATURES_PATH)
    logger.info("Successfully loaded ML components")
    logger.info(f"Features loaded: {features}")
    logger.info(f"Features type: {type(features)}")
except Exception as e:
    logger.error(f"Error loading ML components: {e}")
    raise

# Pydantic input model with alias mapping for special feature names - Updated for Pydantic v2
class StrokeInput(BaseModel):
    age: float
    hypertension: int
    heart_disease: int
    avg_glucose_level: float
    bmi: float
    has_medical_risk: int
    gender_Male: int
    gender_Female: int
    ever_married_Yes: int
    ever_married_No: int
    work_type_Self_employed: int = Field(..., alias="work_type_Self-employed")
    work_type_Private: int
    work_type_Govt_job: int
    work_type_children: int
    Residence_type_Urban: int
    Residence_type_Rural: int
    smoking_status_formerly_smoked: int = Field(..., alias="smoking_status_formerly smoked")
    smoking_status_smokes: int
    smoking_status_never_smoked: int = Field(..., alias="smoking_status_never smoked")
    smoking_status_Unknown: int

    model_config = {"populate_by_name": True}  # Updated for Pydantic v2

@app.post("/predict")
def predict_stroke(input_data: StrokeInput):
    try:
        logger.info("Received prediction request")
        logger.info(f"Input data: {input_data}")
        
        # Convert input data to dict with alias keys matching feature names
        input_dict = input_data.model_dump(by_alias=True)  # Updated for Pydantic v2
        logger.info(f"Input dict with aliases: {input_dict}")

        # Create DataFrame with correct column order
        # Handle both list and numpy array types for features
        if isinstance(features, np.ndarray):
            feature_list = features.tolist()
        else:
            feature_list = list(features)
            
        input_df = pd.DataFrame([input_dict], columns=feature_list)
        logger.info(f"Created DataFrame with shape: {input_df.shape}")
        logger.info(f"DataFrame columns: {input_df.columns.tolist()}")
        logger.info(f"DataFrame values: {input_df.iloc[0].to_dict()}")

        # Scale numeric columns
        numeric_cols = ['age', 'avg_glucose_level', 'bmi']
        logger.info(f"Scaling numeric columns: {numeric_cols}")
        input_df[numeric_cols] = scaler.transform(input_df[numeric_cols])
        logger.info(f"Scaled DataFrame: {input_df.iloc[0].to_dict()}")

        # Predict stroke probability
        prob = model.predict_proba(input_df)[0][1]
        logger.info(f"Predicted probability: {prob}")

        # Threshold 0.3 for classification
        prediction = 1 if prob >= 0.3 else 0
        logger.info(f"Final prediction: {prediction}")

        result = {
            "stroke_prediction": prediction,
            "stroke_risk_score": round(prob, 4)
        }
        logger.info(f"Returning result: {result}")
        
        return result

    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        logger.error(f"Error type: {type(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=400, detail=f"Prediction failed: {str(e)}")

# Updated test metrics with roc_auc included
test_metrics = {
    "accuracy": 0.739,
    "precision": 0.710,
    "recall": 0.990,
    "f1_score": 0.827,
    "roc_auc": 0.850
}

@app.get("/metrics")
def get_metrics():
    logger.info("Metrics endpoint called")
    return test_metrics

# Features endpoint returns array directly for frontend - Fixed the .tolist() error
@app.get("/features")
def get_features():
    logger.info("Features endpoint called")
    try:
        if isinstance(features, np.ndarray):
            feature_list = features.tolist()
        else:
            feature_list = list(features)
        logger.info(f"Returning features: {feature_list}")
        return feature_list
    except Exception as e:
        logger.error(f"Error getting features: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting features: {str(e)}")

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "Backend is running"}

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Stroke Prediction API", "status": "running"}

import uvicorn

if __name__ == "__main__":
    logger.info("Starting FastAPI server...")
    uvicorn.run("backend_app:app", host="127.0.0.1", port=8000, reload=True)
