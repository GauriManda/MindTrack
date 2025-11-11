from flask import Flask, render_template, request, jsonify, session, redirect, url_for, send_from_directory
import numpy as np
import cv2
import tensorflow as tf
import os
from flask_cors import CORS
import traceback
from werkzeug.utils import secure_filename
from scipy import stats
from datetime import datetime
import hashlib
import json

app = Flask(__name__, static_folder="frontend/dist", static_url_path="/")

# Enable CORS (for local + production)
CORS(app, resources={r"/*": {"origins": "*"}})

app.secret_key = 'your-secret-key-here'


UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# Create necessary directories if they don't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs('static/css', exist_ok=True)
os.makedirs('data', exist_ok=True)


@app.route('/')
def serve():
    """Serve React build index.html"""
    return send_from_directory(app.static_folder, 'index.html')

@app.errorhandler(404)
def not_found(e):
    """Redirect unknown routes to React app"""
    return send_from_directory(app.static_folder, 'index.html')

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def hash_password(password):
    """Simple password hashing using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password, hashed):
    """Verify password against hash"""
    return hash_password(password) == hashed

def load_parents_data():
    """Load parents data from JSON file"""
    try:
        with open('data/parents.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

def save_parents_data(data):
    """Save parents data to JSON file"""
    with open('data/parents.json', 'w') as f:
        json.dump(data, f, indent=2)

def load_teachers_data():
    """Load teachers data from JSON file"""
    try:
        with open('data/teachers.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

def save_teachers_data(data):
    """Save teachers data to JSON file"""
    with open('data/teachers.json', 'w') as f:
        json.dump(data, f, indent=2)

def load_children_data():
    """Load children data from JSON file"""
    try:
        with open('data/children.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def save_children_data(data):
    """Save children data to JSON file"""
    with open('data/children.json', 'w') as f:
        json.dump(data, f, indent=2)

def load_teacher_reports_data():
    """Load teacher reports from JSON file"""
    try:
        with open('data/teacher_reports.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def save_teacher_reports_data(data):
    """Save teacher reports to JSON file"""
    with open('data/teacher_reports.json', 'w') as f:
        json.dump(data, f, indent=2)

# Load all data at startup - THIS WAS MISSING!
parents = load_parents_data()
teachers = load_teachers_data()
children_db = load_children_data()
teacher_reports = load_teacher_reports_data()

# Initialize with some sample children data if empty
if not children_db:
    sample_children = [
        {"childId": "C001", "childName": "Alice Johnson", "age": "8", "grade": "3rd"},
        {"childId": "C002", "childName": "Bob Smith", "age": "9", "grade": "4th"},
        {"childId": "C003", "childName": "Charlie Brown", "age": "7", "grade": "2nd"},
        {"childId": "C004", "childName": "Diana Prince", "age": "10", "grade": "5th"},
        {"childId": "C005", "childName": "Ethan Hunt", "age": "8", "grade": "3rd"}
    ]
    children_db = sample_children
    save_children_data(children_db)

# Copy feature extraction functions locally to avoid circular import
def extract_stroke_consistency(img):
    """Measure stroke consistency based on intensity variations"""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) > 2 else img
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blurred, 50, 150)
    if np.sum(edges) > 0:
        return np.std(edges[edges > 0]) / 255.0
    return 0.0

def extract_letter_spacing(img):
    """Measure letter spacing using horizontal projection"""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) > 2 else img
    _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    h_proj = np.sum(binary, axis=0) / 255.0
    
    peaks = []
    for i in range(1, len(h_proj) - 1):
        if h_proj[i] > h_proj[i-1] and h_proj[i] > h_proj[i+1] and h_proj[i] > 5:
            peaks.append(i)

    if len(peaks) > 1:
        distances = [peaks[i+1] - peaks[i] for i in range(len(peaks) - 1)]
        return np.std(distances) / img.shape[1]
    return 0.0

def extract_alignment(img):
    """Measure alignment of text lines"""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) > 2 else img
    _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    v_proj = np.sum(binary, axis=1) / 255.0
    
    text_rows = [i for i, val in enumerate(v_proj) if val > binary.shape[1] * 0.1]

    if text_rows:
        lines = []
        current_line = [text_rows[0]]

        for i in range(1, len(text_rows)):
            if text_rows[i] - text_rows[i-1] <= 2:
                current_line.append(text_rows[i])
            else:
                if len(current_line) > 5:
                    lines.append(current_line)
                current_line = [text_rows[i]]

        if len(current_line) > 5:
            lines.append(current_line)

        margins = []
        for line in lines:
            line_img = binary[min(line):max(line), :]
            for col in range(line_img.shape[1]):
                if np.sum(line_img[:, col]) > 0:
                    margins.append(col)
                    break

        if len(margins) > 1:
            return np.std(margins) / img.shape[1]

    return 0.0

def extract_features(image):
    """Extract multiple handwriting features from an image"""
    features = {
        'stroke_consistency': extract_stroke_consistency(image),
        'letter_spacing': extract_letter_spacing(image),
        'alignment': extract_alignment(image)
    }
    
    feature_vector = [
        features['stroke_consistency'],
        features['letter_spacing'],
        features['alignment'],
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
    ]

    return feature_vector[:15]

def normalize_features(features):
    """Normalize features using z-score normalization"""
    try:
        features_array = np.array(features)
        if features_array.ndim == 1:
            features_array = features_array.reshape(1, -1)
        normalized = stats.zscore(features_array, axis=0, nan_policy='omit')
        normalized = np.nan_to_num(normalized, nan=0.0, posinf=0.0, neginf=0.0)
        return normalized
    except Exception as e:
        print(f"Error normalizing features: {e}")
        return np.array(features).reshape(1, -1) if np.array(features).ndim == 1 else np.array(features)

# Load the trained model
model = None
feature_scaler = None

try:
    possible_paths = [
    "dysgraphia_model.keras",
    "./dysgraphia_model.keras",
    "/opt/render/project/src/dysgraphia_model.keras",
    "/opt/render/project/src/dysgraphia_model.h5"
]

    model_loaded = False
    for model_path in possible_paths:
        if os.path.exists(model_path):
            print(f"Found model at: {model_path}")
            try:
                model = tf.keras.models.load_model(model_path)
                print(f"Model loaded successfully from {model_path}")
                
                # Load feature scaler if available
                import pickle
                scaler_path = model_path.replace('.keras', '_scaler.pkl').replace('.h5', '_scaler.pkl')
                if os.path.exists(scaler_path):
                    with open(scaler_path, 'rb') as f:
                        feature_scaler = pickle.load(f)
                    print("Feature scaler loaded successfully")
                
                # Test model
                dummy_image = np.random.random((1, 224, 224, 3))
                dummy_features = np.zeros((1, 15))
                test_pred = model.predict({"image_input": dummy_image, "feature_input": dummy_features})
                print(f"Model test successful. Output shape: {test_pred.shape}")
                model_loaded = True
                break
            except Exception as e:
                print(f"Error loading model from {model_path}: {e}")
                continue
    
    if not model_loaded:
        print("Warning: No dysgraphia model found.")
        print("Please train the model first.")
        
except Exception as e:
    print(f"Error during model loading: {e}")
    model = None

def preprocess_image(image_path):
    """Preprocess image for CNN input"""
    try:
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Could not read image from {image_path}")
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img = cv2.resize(img, (224, 224))
        img = img.astype(np.float32) / 255.0
        img = np.expand_dims(img, axis=0)
        return img
    except Exception as e:
        print(f"Error preprocessing image: {e}")
        raise

def predict_dysgraphia(image_path):
    """Prediction function"""
    try:
        if model is None:
            print("Model not available, returning dummy prediction")
            return "Non-dysgraphic", 0.75

        # Preprocess image for CNN input
        processed_image = preprocess_image(image_path)

        # Load original image for feature extraction
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError("Could not load image for feature extraction")
        
        # Extract handwriting features
        features = extract_features(img)
        print(f"Extracted features: {features}")
        
        # Normalize features
        if feature_scaler is not None:
            features_array = np.array(features).reshape(1, -1)
            features_normalized = feature_scaler.transform(features_array)
        else:
            features_normalized = normalize_features(np.array(features).reshape(1, -1))
        
        print(f"Normalized features shape: {features_normalized.shape}")

        # Make prediction
        prediction = model.predict({
            "image_input": processed_image,
            "feature_input": features_normalized
        }, verbose=0)

        raw_value = float(prediction[0][0])
        print(f"Raw prediction value: {raw_value}")

        # Interpret results
        if raw_value > 0.5:
            label = "Non-dysgraphic"
            confidence = raw_value
        else:
            label = "Dysgraphic" 
            confidence = 1.0 - raw_value

        print(f"Final prediction: {label} with confidence: {confidence}")
        return label, confidence

    except Exception as e:
        print(f"Error in predict_dysgraphia: {e}")
        traceback.print_exc()
        return "Error in prediction", 0.0

def get_interpretation(label, confidence):
    """Provide interpretation of the prediction"""
    if label == "Dysgraphic":
        if confidence > 0.8:
            return "Strong indication of dysgraphia. Consider professional assessment."
        elif confidence > 0.6:
            return "Moderate indication of dysgraphia. Monitoring recommended."
        else:
            return "Mild indication of dysgraphia. Further evaluation may be helpful."
    else:
        if confidence > 0.8:
            return "Writing appears typical for age group."
        elif confidence > 0.6:
            return "Generally typical writing with minor concerns."
        else:
            return "Writing shows some areas for improvement but appears within normal range."

# Create basic CSS
css_content = """
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f5f5f5;
}
.container {
    max-width: 1200px;
    margin: 0 auto;
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
}
button:hover { background-color: #0056b3; }
.error { color: red; margin: 10px 0; }
.success { color: green; margin: 10px 0; }
.prediction-result {
    margin-top: 15px;
    padding: 10px;
    border-radius: 5px;
    font-weight: bold;
}
.dysgraphic {
    background-color: #ffebee;
    color: #c62828;
    border-left: 4px solid #c62828;
}
.non-dysgraphic {
    background-color: #e8f5e8;
    color: #2e7d32;
    border-left: 4px solid #2e7d32;
}
"""

try:
    with open('static/css/styles.css', 'w') as f:
        f.write(css_content)
except:
    pass

# API Routes
@app.route('/api/predict', methods=['POST'])
def api_predict():
    """Main API endpoint for React frontend"""
    try:
        print("=== API Prediction Request Started ===")
        
        if 'image' not in request.files:
            print("No file in request")
            return jsonify({"error": "No file uploaded"}), 400

        image_file = request.files['image']
        if image_file.filename == '':
            print("Empty filename")
            return jsonify({"error": "No selected file"}), 400

        if not allowed_file(image_file.filename):
            return jsonify({"error": "Invalid file type. Please upload an image."}), 400

        # Save the uploaded file
        filename = secure_filename(image_file.filename)
        image_path = os.path.join(UPLOAD_FOLDER, filename)
        image_file.save(image_path)
        print(f"Image saved to {image_path}")
        
        # Make prediction
        label, confidence = predict_dysgraphia(image_path)
        
        # Clean up uploaded file
        try:
            os.remove(image_path)
        except:
            pass
        
        # Return result
        result = {
            "prediction": label,
            "confidence": round(float(confidence), 4),
            "interpretation": get_interpretation(label, confidence)
        }
        
        print(f"=== Final Result: {result} ===")
        return jsonify(result)
    
    except Exception as e:
        error_msg = f"Error in prediction: {str(e)}"
        print(error_msg)
        traceback.print_exc()
        return jsonify({"error": error_msg}), 500

# Legacy endpoint
@app.route('/predict', methods=['POST'])
def predict():
    """Legacy prediction endpoint"""
    return api_predict()

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def api_health_check():
    """API health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "message": "MindTrack API is running"
    })

# Parent Authentication Routes
@app.route('/api/parent-register', methods=['POST'])
def parent_register():
    """Register a new parent with password authentication"""
    try:
        data = request.get_json()
        print(f"Registration request: {data}")
        
        # Get all the data from frontend
        parentId = data.get('parentId')
        parentName = data.get('parentName')
        childId = data.get('childId')
        childName = data.get('childName')
        email = data.get('email', '')
        phone = data.get('phone', '')
        childAge = data.get('childAge', '')
        childGrade = data.get('childGrade', '')
        password = data.get('password')
        
        # Basic validation
        if not parentId or not parentName or not childId or not childName:
            return jsonify({"success": False, "message": "Parent name and child name are required"}), 400

        if not password:
            return jsonify({"success": False, "message": "Password is required"}), 400

        if len(password) < 6:
            return jsonify({"success": False, "message": "Password must be at least 6 characters long"}), 400

        if parentId in parents:
            return jsonify({"success": False, "message": "Parent ID already exists"}), 400

        # Hash the password
        hashed_password = hash_password(password)

        # Store comprehensive parent data
        parents[parentId] = {
            "name": parentName,
            "email": email,
            "phone": phone,
            "password": hashed_password,  # Store hashed password
            "child": {
                "id": childId, 
                "name": childName,
                "age": childAge,
                "grade": childGrade
            },
            "dysgraphiaResult": None,
            "registrationDate": datetime.now().isoformat(),
            "lastActivity": datetime.now().isoformat()
        }
        
        # Save to file
        save_parents_data(parents)
        
        print(f"Parent {parentId} registered successfully")
        return jsonify({
            "success": True, 
            "message": "Parent registered successfully",
            "parentId": parentId
        }), 200
        
    except Exception as e:
        print(f"Registration error: {e}")
        return jsonify({"success": False, "message": f"Registration error: {str(e)}"}), 500

@app.route('/api/parent-login', methods=['POST'])
def parent_login():
    """Authenticate parent login with password"""
    try:
        data = request.get_json()
        parentId = data.get('parentId')
        password = data.get('password')
        
        print(f"Login attempt for parentId: {parentId}")
        
        # Validation
        if not parentId or not password:
            return jsonify({"success": False, "message": "Parent ID and password are required"}), 400
        
        if parentId not in parents:
            return jsonify({"success": False, "message": "Parent ID not found"}), 404
        
        parent = parents[parentId]
        
        # Verify password
        stored_password = parent.get('password')
        if not stored_password or not verify_password(password, stored_password):
            return jsonify({"success": False, "message": "Invalid password"}), 401
        
        # Update last activity
        parents[parentId]['lastActivity'] = datetime.now().isoformat()
        save_parents_data(parents)
        
        child = parent['child']
        
        print(f"Login successful for parentId: {parentId}")
        return jsonify({
            "success": True,
            "childId": child['id'],
            "childName": child['name'],
            "age": child.get('age'),
            "grade": child.get('grade'),
            "parentName": parent['name'],
            "email": parent.get('email'),
            "phone": parent.get('phone'),
            "dysgraphiaResult": parent.get('dysgraphiaResult'),
            "lastActivity": parent.get('lastActivity'),
            "registrationDate": parent.get('registrationDate')
        }), 200
        
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({"success": False, "message": f"Login error: {str(e)}"}), 500

@app.route('/api/parent-update-assessment', methods=['POST'])
def update_assessment():
    """Update assessment results for a child"""
    try:
        data = request.get_json()
        parentId = data.get('parentId')
        assessment_result = data.get('assessmentResult')
        
        if not parentId or parentId not in parents:
            return jsonify({"success": False, "message": "Parent ID not found"}), 404
        
        parents[parentId]['dysgraphiaResult'] = assessment_result
        parents[parentId]['lastActivity'] = datetime.now().isoformat()
        save_parents_data(parents)
        
        return jsonify({"success": True, "message": "Assessment updated successfully"}), 200
        
    except Exception as e:
        return jsonify({"success": False, "message": f"Update error: {str(e)}"}), 500

# Teacher Routes
@app.route('/api/teacher-register', methods=['POST'])
def teacher_register():
    """Register a new teacher"""
    try:
        data = request.get_json()
        print(f"Teacher registration request: {data}")
        
        teacherId = data.get('teacherId')
        teacherName = data.get('teacherName')
        email = data.get('email', '')
        school = data.get('school')
        password = data.get('password')
        
        if not teacherId or not teacherName or not school or not password:
            return jsonify({"success": False, "message": "All required fields must be filled"}), 400

        if len(password) < 6:
            return jsonify({"success": False, "message": "Password must be at least 6 characters long"}), 400

        if teacherId in teachers:
            return jsonify({"success": False, "message": "Teacher ID already exists"}), 400

        # Hash the password
        hashed_password = hash_password(password)

        # Store teacher data
        teachers[teacherId] = {
            "teacherId": teacherId,
            "teacherName": teacherName,
            "email": email,
            "school": school,
            "password": hashed_password,
            "registrationDate": datetime.now().isoformat(),
            "lastActivity": datetime.now().isoformat()
        }
        
        save_teachers_data(teachers)
        
        print(f"Teacher {teacherId} registered successfully")
        return jsonify({
            "success": True, 
            "message": "Teacher registered successfully",
            "teacherId": teacherId
        }), 200
        
    except Exception as e:
        print(f"Teacher registration error: {e}")
        return jsonify({"success": False, "message": f"Registration error: {str(e)}"}), 500

@app.route('/api/teacher-login', methods=['POST'])
def teacher_login():
    """Authenticate teacher login"""
    try:
        data = request.get_json()
        teacherId = data.get('teacherId')
        password = data.get('password')
        
        print(f"Teacher login attempt for: {teacherId}")
        
        if not teacherId or not password:
            return jsonify({"success": False, "message": "Teacher ID and password are required"}), 400
        
        if teacherId not in teachers:
            return jsonify({"success": False, "message": "Teacher ID not found"}), 404
        
        teacher = teachers[teacherId]
        
        # Verify password
        stored_password = teacher.get('password')
        if not stored_password or not verify_password(password, stored_password):
            return jsonify({"success": False, "message": "Invalid password"}), 401
        
        # Update last activity
        teachers[teacherId]['lastActivity'] = datetime.now().isoformat()
        save_teachers_data(teachers)
        
        print(f"Teacher login successful for: {teacherId}")
        return jsonify({
            "success": True,
            "teacherId": teacher['teacherId'],
            "teacherName": teacher['teacherName'],
            "email": teacher.get('email'),
            "school": teacher['school'],
            "lastActivity": teacher.get('lastActivity'),
            "registrationDate": teacher.get('registrationDate')
        }), 200
        
    except Exception as e:
        print(f"Teacher login error: {e}")
        return jsonify({"success": False, "message": f"Login error: {str(e)}"}), 500

@app.route('/api/children', methods=['GET'])
def get_children():
    """Get list of all children"""
    try:
        return jsonify({
            "success": True,
            "children": children_db
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Error fetching children: {str(e)}"}), 500

@app.route('/api/report-problem', methods=['POST'])
def report_problem():
    """Submit a problem report for a student"""
    try:
        data = request.get_json()
        print(f"Problem report submission: {data}")
        
        # Create report entry
        report = {
            "reportId": f"RPT{int(datetime.now().timestamp())}",
            "teacherId": data.get('teacherId'),
            "teacherName": data.get('teacherName'),
            "childId": data.get('childId'),
            "childName": data.get('childName'),
            "problemType": data.get('problemType'),
            "severity": data.get('severity', ''),
            "description": data.get('description'),
            "reportDate": data.get('reportDate', datetime.now().isoformat()),
            "status": data.get('status', 'New')
        }
        
        teacher_reports.append(report)
        save_teacher_reports_data(teacher_reports)
        
        print(f"Problem report submitted successfully: {report['reportId']}")
        return jsonify({
            "success": True,
            "message": "Problem report submitted successfully",
            "reportId": report['reportId']
        }), 200
        
    except Exception as e:
        print(f"Problem report error: {e}")
        return jsonify({"success": False, "message": f"Error submitting report: {str(e)}"}), 500

@app.route('/api/teacher-reports/<teacherId>', methods=['GET'])
def get_teacher_reports(teacherId):
    """Get all reports submitted by a specific teacher"""
    try:
        teacher_specific_reports = [
            report for report in teacher_reports 
            if report.get('teacherId') == teacherId
        ]
        
        return jsonify({
            "success": True,
            "reports": teacher_specific_reports
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "message": f"Error fetching reports: {str(e)}"}), 500

# Default route
@app.route('/')
def index():
    """Default route"""
    return jsonify({
        "message": "MindTrack API is running",
        "endpoints": {
            "prediction": "/api/predict (POST)",
            "health": "/api/health (GET)",
            "parent_register": "/api/parent-register (POST)",
            "parent_login": "/api/parent-login (POST)",
            "update_assessment": "/api/parent-update-assessment (POST)",
            "teacher_register": "/api/teacher-register (POST)",
            "teacher_login": "/api/teacher-login (POST)",
            "get_children": "/api/children (GET)",
            "report_problem": "/api/report-problem (POST)",
            "get_teacher_reports": "/api/teacher-reports/<teacherId> (GET)",
            "legacy_prediction": "/predict (POST)"
        },
        "model_status": "loaded" if model else "not_loaded",
        "registered_parents": len(parents),
        "registered_teachers": len(teachers),
        "total_children": len(children_db),
        "total_reports": len(teacher_reports)
    })

# Add these endpoints to your existing Flask app

@app.route('/api/register-child', methods=['POST'])
def register_child():
    """Register a new child dynamically from teacher interface"""
    try:
        data = request.get_json()
        print(f"Child registration request: {data}")
        
        # Extract child data
        childId = data.get('childId')
        childName = data.get('childName')
        age = data.get('age')
        grade = data.get('grade', '')
        school = data.get('school', '')
        teacherId = data.get('teacherId')
        teacherName = data.get('teacherName')
        parentName = data.get('parentName', '')
        parentEmail = data.get('parentEmail', '')
        parentPhone = data.get('parentPhone', '')
        registrationDate = data.get('registrationDate', datetime.now().isoformat())
        
        # Basic validation
        if not childId or not childName or not age:
            return jsonify({"success": False, "message": "Child ID, name, and age are required"}), 400

        if not teacherId:
            return jsonify({"success": False, "message": "Teacher ID is required"}), 400

        # Check if child ID already exists
        existing_child = next((child for child in children_db if child['childId'] == childId), None)
        if existing_child:
            return jsonify({"success": False, "message": "Child ID already exists"}), 400

        # Create new child record
        new_child = {
            "childId": childId,
            "childName": childName,
            "age": age,
            "grade": grade,
            "school": school,
            "teacherId": teacherId,
            "teacherName": teacherName,
            "parentName": parentName,
            "parentEmail": parentEmail,
            "parentPhone": parentPhone,
            "registrationDate": registrationDate,
            "testResults": [],  # Store multiple test results
            "status": "Active"
        }
        
        # Add to children database
        children_db.append(new_child)
        save_children_data(children_db)
        
        print(f"Child {childId} registered successfully by teacher {teacherId}")
        return jsonify({
            "success": True,
            "message": "Child registered successfully",
            "child": new_child
        }), 200
        
    except Exception as e:
        print(f"Child registration error: {e}")
        return jsonify({"success": False, "message": f"Registration error: {str(e)}"}), 500

@app.route('/api/save-test-result', methods=['POST'])
def save_test_result():
    """Save test result for a specific child"""
    try:
        data = request.get_json()
        print(f"Saving test result: {data}")
        
        childId = data.get('childId')
        prediction = data.get('prediction')
        confidence = data.get('confidence')
        teacherId = data.get('teacherId')
        testDate = data.get('testDate', datetime.now().isoformat())
        
        if not childId or not prediction:
            return jsonify({"success": False, "message": "Child ID and prediction are required"}), 400

        # Find the child in the database
        child_index = next((i for i, child in enumerate(children_db) if child['childId'] == childId), None)
        
        if child_index is None:
            return jsonify({"success": False, "message": "Child not found"}), 404

        # Create test result record
        test_result = {
            "testId": f"TEST{int(datetime.now().timestamp())}",
            "prediction": prediction,
            "confidence": confidence,
            "interpretation": data.get('interpretation', ''),
            "teacherId": teacherId,
            "teacherName": data.get('teacherName', ''),
            "testDate": testDate,
            "status": "Completed"
        }
        
        # Add test result to child's record
        if 'testResults' not in children_db[child_index]:
            children_db[child_index]['testResults'] = []
        
        children_db[child_index]['testResults'].append(test_result)
        children_db[child_index]['lastTestDate'] = testDate
        children_db[child_index]['lastTestResult'] = prediction
        
        # Save updated children data
        save_children_data(children_db)
        
        print(f"Test result saved for child {childId}")
        return jsonify({
            "success": True,
            "message": "Test result saved successfully",
            "testResult": test_result
        }), 200
        
    except Exception as e:
        print(f"Save test result error: {e}")
        return jsonify({"success": False, "message": f"Error saving test result: {str(e)}"}), 500

@app.route('/api/children-by-teacher/<teacherId>', methods=['GET'])
def get_children_by_teacher(teacherId):
    """Get all children registered by a specific teacher"""
    try:
        teacher_children = [
            child for child in children_db 
            if child.get('teacherId') == teacherId
        ]
        
        return jsonify({
            "success": True,
            "children": teacher_children,
            "count": len(teacher_children)
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "message": f"Error fetching children: {str(e)}"}), 500

@app.route('/api/child-details/<childId>', methods=['GET'])
def get_child_details(childId):
    """Get detailed information about a specific child including test history"""
    try:
        child = next((child for child in children_db if child['childId'] == childId), None)
        
        if not child:
            return jsonify({"success": False, "message": "Child not found"}), 404
        
        return jsonify({
            "success": True,
            "child": child
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "message": f"Error fetching child details: {str(e)}"}), 500

@app.route('/api/update-child/<childId>', methods=['PUT'])
def update_child(childId):
    """Update child information"""
    try:
        data = request.get_json()
        
        child_index = next((i for i, child in enumerate(children_db) if child['childId'] == childId), None)
        
        if child_index is None:
            return jsonify({"success": False, "message": "Child not found"}), 404
        
        # Update allowed fields
        updatable_fields = ['childName', 'age', 'grade', 'school', 'parentName', 'parentEmail', 'parentPhone']
        
        for field in updatable_fields:
            if field in data:
                children_db[child_index][field] = data[field]
        
        children_db[child_index]['lastUpdated'] = datetime.now().isoformat()
        
        # Save updated data
        save_children_data(children_db)
        
        return jsonify({
            "success": True,
            "message": "Child information updated successfully",
            "child": children_db[child_index]
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "message": f"Error updating child: {str(e)}"}), 500

@app.route('/api/delete-child/<childId>', methods=['DELETE'])
def delete_child(childId):
    """Delete a child record (soft delete - mark as inactive)"""
    try:
        child_index = next((i for i, child in enumerate(children_db) if child['childId'] == childId), None)
        
        if child_index is None:
            return jsonify({"success": False, "message": "Child not found"}), 404
        
        # Soft delete - mark as inactive instead of removing
        children_db[child_index]['status'] = 'Inactive'
        children_db[child_index]['deletedDate'] = datetime.now().isoformat()
        
        save_children_data(children_db)
        
        return jsonify({
            "success": True,
            "message": "Child record deactivated successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "message": f"Error deleting child: {str(e)}"}), 500

@app.route('/api/child-test-history/<childId>', methods=['GET'])
def get_child_test_history(childId):
    """Get test history for a specific child"""
    try:
        child = next((child for child in children_db if child['childId'] == childId), None)
        
        if not child:
            return jsonify({"success": False, "message": "Child not found"}), 404
        
        test_results = child.get('testResults', [])
        
        return jsonify({
            "success": True,
            "childId": childId,
            "childName": child['childName'],
            "testResults": test_results,
            "totalTests": len(test_results)
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "message": f"Error fetching test history: {str(e)}"}), 500

@app.route('/api/search-children', methods=['GET'])
def search_children():
    """Search children by name, ID, or other criteria"""
    try:
        query = request.args.get('q', '').lower()
        teacher_id = request.args.get('teacherId', '')
        
        if not query:
            return jsonify({"success": False, "message": "Search query is required"}), 400
        
        # Filter children based on search criteria
        filtered_children = []
        
        for child in children_db:
            if child.get('status', 'Active') == 'Inactive':
                continue
                
            # If teacher_id is provided, only search within that teacher's children
            if teacher_id and child.get('teacherId') != teacher_id:
                continue
            
            # Search in multiple fields
            searchable_text = f"{child.get('childName', '').lower()} {child.get('childId', '').lower()} {child.get('school', '').lower()}"
            
            if query in searchable_text:
                filtered_children.append(child)
        
        return jsonify({
            "success": True,
            "children": filtered_children,
            "count": len(filtered_children),
            "query": query
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "message": f"Error searching children: {str(e)}"}), 500

@app.route('/api/dashboard-stats/<teacherId>', methods=['GET'])
def get_dashboard_stats(teacherId):
    """Get dashboard statistics for a specific teacher"""
    try:
        teacher_children = [
            child for child in children_db 
            if child.get('teacherId') == teacherId and child.get('status', 'Active') == 'Active'
        ]
        
        # Calculate statistics
        total_children = len(teacher_children)
        children_with_tests = len([child for child in teacher_children if child.get('testResults')])
        
        # Count test results by prediction
        dysgraphic_count = 0
        non_dysgraphic_count = 0
        
        for child in teacher_children:
            if child.get('lastTestResult'):
                if child['lastTestResult'] == 'Dysgraphic':
                    dysgraphic_count += 1
                else:
                    non_dysgraphic_count += 1
        
        # Recent activity (children registered in last 7 days)
        recent_registrations = 0
        current_time = datetime.now()
        
        for child in teacher_children:
            if child.get('registrationDate'):
                try:
                    reg_date = datetime.fromisoformat(child['registrationDate'].replace('Z', '+00:00'))
                    days_diff = (current_time - reg_date).days
                    if days_diff <= 7:
                        recent_registrations += 1
                except:
                    pass
        
        return jsonify({
            "success": True,
            "stats": {
                "totalChildren": total_children,
                "childrenWithTests": children_with_tests,
                "childrenWithoutTests": total_children - children_with_tests,
                "dysgraphicResults": dysgraphic_count,
                "nonDysgraphicResults": non_dysgraphic_count,
                "recentRegistrations": recent_registrations
            }
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "message": f"Error fetching dashboard stats: {str(e)}"}), 500
@app.route('/api/child-test-reports/<teacherId>', methods=['GET'])
def get_child_test_reports(teacherId):
    """Get test reports for all children associated with a specific teacher"""
    try:
        # Get all children for this teacher
        teacher_children = [
            child for child in children_db 
            if child.get('teacherId') == teacherId and child.get('status', 'Active') == 'Active'
        ]
        
        # Extract all test results from all children
        reports = []
        
        for child in teacher_children:
            test_results = child.get('testResults', [])
            
            for test in test_results:
                report = {
                    "childId": child['childId'],
                    "childName": child['childName'],
                    "testDate": test.get('testDate'),
                    "result": test.get('prediction'),  # 'Dysgraphic' or 'Non-dysgraphic'
                    "confidence": test.get('confidence'),
                    "interpretation": test.get('interpretation'),
                    "testId": test.get('testId'),
                    "teacherId": teacherId,
                    "teacherName": test.get('teacherName'),
                    "status": test.get('status', 'Completed'),
                    "score": round(test.get('confidence', 0) * 100, 1) if test.get('confidence') else None
                }
                reports.append(report)
        
        # Sort by test date (most recent first)
        reports.sort(key=lambda x: x.get('testDate', ''), reverse=True)
        
        return jsonify({
            "success": True,
            "reports": reports,
            "totalReports": len(reports),
            "teacherId": teacherId
        }), 200
        
    except Exception as e:
        print(f"Error fetching child test reports: {e}")
        return jsonify({
            "success": False, 
            "message": f"Error fetching test reports: {str(e)}"
        }), 500

@app.route('/dysgraphia-test')
def dysgraphia_test():
    return jsonify({"message": "Dysgraphia test page - React frontend needed"})

@app.route('/memorygame')
def memory_game():
    return jsonify({"message": "Memory game page - React frontend needed"})

@app.route('/attentiongame')
def attention_game():
    return jsonify({"message": "Attention game page - React frontend needed"})

@app.route('/languagegame')
def language_game():
    return jsonify({"message": "Language game page - React frontend needed"})

@app.route('/processinggame')
def processing_game():
    return jsonify({"message": "Processing game page - React frontend needed"})

@app.route('/memorymaze')
def memory_maze():
    return jsonify({"message": "Memory maze page - React frontend needed"})

# Error handlers
@app.errorhandler(404)
def not_found_error(error):
    return jsonify({"error": "Resource not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    print("Starting MindTrack Flask API...")
    print(f"Model status: {'Loaded' if model else 'Not loaded'}")
    print(f"Registered parents: {len(parents)}")
    print(f"Registered teachers: {len(teachers)}")
    print(f"Total children: {len(children_db)}")
    print(f"Total reports: {len(teacher_reports)}")
    print("Available endpoints:")
    print("  POST /api/predict - Main prediction endpoint")
    print("  POST /api/parent-register - Parent registration")
    print("  POST /api/parent-login - Parent login")
    print("  POST /api/parent-update-assessment - Update assessment results")
    print("  POST /api/teacher-register - Teacher registration")
    print("  POST /api/teacher-login - Teacher login")
    print("  GET /api/children - Get children list")
    print("  POST /api/report-problem - Submit problem reports")
    print("  GET /api/teacher-reports/<teacherId> - Get teacher reports")
    print("  GET /api/health - Health check")
    print("\nData storage:")
    print("  Parents: data/parents.json")
    print("  Teachers: data/teachers.json") 
    print("  Children: data/children.json")
    print("  Reports: data/teacher_reports.json")
    app.run(debug=True, host='0.0.0.0', port=5000)
