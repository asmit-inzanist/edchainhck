# Smartscript

## Prerequisites

- Python 3.x
- Set up a .env file with your Gemini API key.
- Install dependencies by running:
  bash
  pip install -r requirements.txt



## Description
"Smartscript" is a Streamlit web application for identifying images using the Google Generative AI API. It provides informative summary, formula, questionnaire for uploaded images/pdf on any topic .

## Features
- Upload images,pdf of any topic.
- Receive summary,questionnaire,formula, and an interactive chatspace as per your choice.
- Handwritten notes are also uploadable and you will get the same desired output.

## Usage
1. Visit the application [here](https://note-extractor-generator.streamlit.app/).
2. Upload an image/pdf on any topic.
3. You can click on "Explore","questionnaire","formula" buttons, and also interact in the chatspace with any quesions related to the uploaded file.
4. Wait for the AI to process the image and provide info.
5. Review the generated content and explore the insights.

## Dependencies
- google.generativeai: Wrapper for the Gemini Generative AI API.
- dotenv: For loading environment variables.
- streamlit: Framework for creating web applications.
- PIL: Python Imaging Library for image processing.
- pymupdf: Python Library for conveerting  PDFs into images.


## How to Run
python
streamlit run app.py
```

### Developed with ❤ by Asmit,Bineet,Urshashi.