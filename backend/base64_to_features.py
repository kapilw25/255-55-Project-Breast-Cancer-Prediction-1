import base64
import io

import cv2
import numpy as np
from PIL import Image
from scipy.stats import skew
from skimage.feature import canny, graycomatrix, graycoprops
from skimage.filters import threshold_otsu
from skimage.measure import regionprops, label
from skimage.morphology import closing, square, remove_small_objects


def glcm_features(gray_image):
    glcm = graycomatrix(gray_image, [1], [0], symmetric=True, normed=True)
    contrast = graycoprops(glcm, 'contrast')[0, 0]
    dissimilarity = graycoprops(glcm, 'dissimilarity')[0, 0]
    homogeneity = graycoprops(glcm, 'homogeneity')[0, 0]
    energy = graycoprops(glcm, 'energy')[0, 0]
    correlation = graycoprops(glcm, 'correlation')[0, 0]
    return [contrast, dissimilarity, homogeneity, energy, correlation]


def shape_features(img):
    # Apply binary threshold
    thresh = threshold_otsu(img)
    binary_img = img > thresh

    # Label the binary image
    labeled_img = label(binary_img)
    properties = regionprops(labeled_img)

    if not properties:
        return [None, None]

    area = properties[0].area
    perimeter = properties[0].perimeter
    compactness = (perimeter ** 2) / (4 * np.pi * area) if area > 0 and perimeter > 0 else None
    circularity = 4 * np.pi * area / (perimeter ** 2) if area > 0 and perimeter > 0 else None

    return [compactness, circularity]


# Function to extract microcalcification features (size, shape, and clustering)
def microcalcification_features(img):
    binary_img = closing(img > np.mean(img), square(3))
    labeled_img = label(binary_img)
    remove_small_objects(labeled_img, 10, in_place=True)

    properties = regionprops(labeled_img)
    areas = [prop.area for prop in properties]
    solidity = [prop.solidity for prop in properties]

    if not areas:
        return [None, None, None]

    mean_size = np.mean(areas)
    mean_solidity = np.mean(solidity)
    clustering = len(areas) / np.sum(areas)

    return [mean_size, mean_solidity, clustering]


def base64_to_features(base64_str):
    img_bytes = base64.b64decode(base64_str.split(',')[1])
    img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
    img.save("temp", 'png')

    img = cv2.imread("temp")
    gray_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    color_intensity = np.mean(img, axis=(0, 1))

    # Calculate variance
    variance = np.var(gray_img)

    # Calculate skewness
    skewness = skew(gray_img.flatten())

    # Calculate edges
    edges = canny(gray_img)

    # Extract features
    mean_pixel_value = np.mean(gray_img)
    std_pixel_value = np.std(gray_img)
    # histogram = cv2.calcHist([gray_img], [0], None, [256], [0, 256]).flatten()
    glcm = glcm_features(gray_img)
    # vgg16_features = extract_vgg16_features(vgg16_model, img)
    shape = shape_features(gray_img)
    microcalcifications = microcalcification_features(gray_img)

    return [list(color_intensity)
            + [mean_pixel_value, std_pixel_value, variance, skewness]
            + glcm
            + shape + microcalcifications + [np.sum(edges)]]
