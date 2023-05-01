import pickle

import pandas as pd
from flask import Flask, request, jsonify

from base64_to_features import base64_to_features

app = Flask(__name__)

# load model
model = pickle.load(open('model.pkl', 'rb'))

features = ['site_id',
            'laterality',
            'view',
            'age',
            'biopsy',
            'invasive',
            'BIRADS',
            'implant',
            'density',
            'machine_id',
            'difficult_negative_case',
            'color_intensity_r',
            'color_intensity_g',
            'color_intensity_b',
            'mean_pixel_value',
            'std_pixel_value',
            'variance',
            'skewness',
            'contrast',
            'dissimilarity',
            'homogeneity',
            'energy',
            'correlation',
            'compactness',
            'circularity',
            'mean_microcalcification_size',
            'mean_microcalcification_solidity',
            'microcalcification_clustering',
            'edge_count']

categorical_cols = ['laterality', 'view', 'density', 'difficult_negative_case']
numerical_cols = ['site_id', 'age', 'biopsy',
                  'invasive', 'BIRADS', 'implant', 'machine_id', 'color_intensity_r',
                  'color_intensity_g', 'color_intensity_b', 'mean_pixel_value',
                  'std_pixel_value', 'variance', 'skewness', 'contrast', 'dissimilarity',
                  'homogeneity', 'energy', 'correlation', 'compactness', 'circularity',
                  'mean_microcalcification_size', 'mean_microcalcification_solidity',
                  'microcalcification_clustering', 'edge_count']


@app.route("/classify", methods=['POST'])
def classify():
    # get the post request data
    data = request.get_json()
    print(data)
    site_id = data['site_id']
    laterality = data['laterality']
    view = data['view']
    age = data['age']
    biopsy = data['biopsy']
    invasive = data['invasive']
    BIRADS = data['BIRADS']
    implant = data['implant']
    density = data['density']
    machine_id = data['machine_id']
    difficult_negative_case = data['difficult_negative_case']
    remaining_features = base64_to_features(data['file'])[0]
    print("REMAINING ==>> ", len(remaining_features))
    x = [site_id, laterality, view, age, biopsy, invasive, BIRADS, implant, density, machine_id,
         difficult_negative_case] + remaining_features

    # create a data frame
    df = pd.DataFrame([x], columns=features)

    # read the encoder from the file and transform the categorical columns
    for col in categorical_cols:
        encoder = pickle.load(open('encoders/' + col + '_encoder.pkl', 'rb'))
        df[col] = encoder.transform(df[col])

    # read the scaler from the file and transform the numerical columns
    for col in df.columns:
        scaler = pickle.load(open('encoders/' + col + '_scaler.pkl', 'rb'))
        df[col] = scaler.transform(df[col].values.reshape(-1, 1))

    print(df)
    prediction = model.predict(df)
    print(prediction)
    result = ""
    if prediction[0] == 0:
        result = "Benign"
    else:
        result = "Malignant"
    return jsonify({'prediction': result})
