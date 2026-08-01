from transformers import pipeline
print('Downloading and loading GenAI model...')
genai_pipeline = pipeline('text2text-generation', model='google/flan-t5-base', device=-1)
print('Model loaded!')
result = genai_pipeline('A farmer has Apple Cedar Rust. What should they do?', max_length=50)
print(result)
