import os
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout, Input

def create_cnn_model(num_classes=10): # Example default classes
    """
    Creates the CNN architecture for Crop Disease Detection as specified:
    - Input: 224x224x3
    - 4 Conv Blocks (32, 64, 128, 256 filters)
    - Flatten
    - Dense (512, 256) + Dropout
    - Softmax Output
    """
    model = Sequential([
        Input(shape=(224, 224, 3)),
        
        # Conv Block 1
        Conv2D(32, (3, 3), activation='relu', padding='same'),
        MaxPooling2D(pool_size=(2, 2)),
        
        # Conv Block 2
        Conv2D(64, (3, 3), activation='relu', padding='same'),
        MaxPooling2D(pool_size=(2, 2)),
        
        # Conv Block 3
        Conv2D(128, (3, 3), activation='relu', padding='same'),
        MaxPooling2D(pool_size=(2, 2)),
        
        # Conv Block 4
        Conv2D(256, (3, 3), activation='relu', padding='same'),
        MaxPooling2D(pool_size=(2, 2)),
        
        # Flatten
        Flatten(),
        
        # Dense Layers
        Dense(512, activation='relu'),
        Dropout(0.5),
        Dense(256, activation='relu'),
        Dropout(0.5),
        
        # Output Layer
        Dense(num_classes, activation='softmax')
    ])
    
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    return model

if __name__ == "__main__":
    print("Initializing Crop Disease Detection CNN Architecture...")
    model = create_cnn_model(num_classes=15)
    model.summary()
    
    # Save untrained model architecture (placeholder)
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    model_dir = os.path.join(base_dir, "ml_core", "models")
    if not os.path.exists(model_dir):
        os.makedirs(model_dir)
        
    model_path = os.path.join(model_dir, "disease_cnn_untrained.h5")
    model.save(model_path)
    print(f"Untrained CNN model architecture saved to {model_path}")
    print("Note: Provide a real leaf image dataset to train this model using an ImageDataGenerator.")
