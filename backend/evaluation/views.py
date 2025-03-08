from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status
from getUserData.JWT import CustomJWTAuthentication
from rest_framework.permissions import IsAuthenticated
import logging
from langchain.prompts import PromptTemplate
from langchain_groq import ChatGroq
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field
import time

# Configure logging
logger = logging.getLogger(__name__)

# API keys for ChatGroq
API_KEYS = [
    "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",
    "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"
]

# Initialize ChatGroq instances
llm_instances = [ChatGroq(model="llama-3.3-70b-specdec", api_key=key) for key in API_KEYS]

# Define expected JSON response format
class AnswerEvaluation(BaseModel):
    result: str = Field(description="yes if answer is at least 70% correct, otherwise no")

prompt_template = PromptTemplate(
    input_variables=["question", "answer"],
    template=(
        "Evaluate the correctness of the following answer based on the given question. Consider factors like accuracy, relevance, "
        "clarity, and completeness. If the answer demonstrates a clear understanding of key concepts despite minor grammatical errors "
        "or typos, it should still be considered correct. Focus on the core aspects of the answer and whether they address the question's "
        "main points. If the answer is at least 70% correct, return 'yes', otherwise return 'no'. Return only a JSON object with the key 'result'.\n"
        "Question: {question}\n"
        "Answer: {answer}"
    )
)

# JSON parser
parser = JsonOutputParser(pydantic_object=AnswerEvaluation)

def invoke_with_fallback(prompt):
    """Try invoking ChatGroq with each API key until one succeeds."""
    for llm in llm_instances:
        try:
            response = llm.invoke(prompt)
            return response.content.strip()
        except Exception as e:
            logger.error(f"ChatGroq request failed: {str(e)}")
            time.sleep(60)  # Wait to avoid exceeding rate limit
    raise Exception("All ChatGroq API instances failed due to rate limiting or other errors.")

@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def check_answer(request):
    """
    API endpoint to check if an answer is at least 70% correct according to the question's context.
    
    Request Body:
    - question: The interview question.
    - answer: The candidate's answer (transcript from speech-to-text).
    
    Response:
    - { "result": "yes" } if the answer is at least 70% correct.
    - { "result": "no" } otherwise.
    """
    try:
        # Extract question and answer from request
        data = request.data
        question = data.get("question", "").strip()
        answer = data.get("answer", "").strip()
        
        if not question or not answer:
            return Response({'error': 'Both question and answer are required'}, status=status.HTTP_400_BAD_REQUEST)

        # Format prompt
        prompt = prompt_template.format(question=question, answer=answer)
        
        # Invoke model to get evaluation
        response = invoke_with_fallback(prompt)
        
        # Log the response
        logger.debug(f"Model Response: {response}")
        
        # Parse response into structured JSON
        result = parser.parse(response)
        
        logger.debug(f"Parsed Result: {result}")
        
        return Response(result, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Error occurred: {str(e)}", exc_info=True)
        return Response(
            {'error': 'An unexpected error occurred', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )